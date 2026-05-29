import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';
import {
  getHospital,
  setHospital,
  type HospitalPayload,
} from '../../_lib/commander-state';

const HEAL_TIME_MINUTES_PER_LEVEL = 60; // 60 minutos por nivel
const HEAL_CREDITS_COST_PER_LEVEL = 100; // 100 créditos por nivel
const SECONDS_PER_MINUTE = 60;

// ============================================================
// GET /api/commanders/[id]/heal — Ver estado de herida y costo de cura
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;

    const hospital = await getHospital(user.empireId, commanderId);

    // Calcular tiempo restante
    let remainingSeconds = 0;
    if (hospital.recoveryEndsAt) {
      const end = new Date(hospital.recoveryEndsAt).getTime();
      const now = Date.now();
      remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
    }

    // Auto-curar si ya pasó el tiempo
    if (hospital.status === 'RECOVERING' && remainingSeconds === 0) {
      const healed: HospitalPayload = {
        status: 'HEALTHY',
        recoveryEndsAt: null,
        totalHealingTime: 0,
        bedIndex: null,
      };
      await setHospital(user.empireId, commanderId, healed);
      return NextResponse.json({
        success: true,
        data: {
          commanderId,
          hospital: healed,
          remainingSeconds: 0,
          healCost: 0,
          canHeal: false,
          message: 'Comandante completamente curado',
        },
      });
    }

    // Calcular costo de cura instantánea (créditos por nivel)
    // Usamos el nivel almacenado en gems->level o default 1
    const levelRow = await prisma.$queryRaw<
      Array<{ level: number }>
    >`
      SELECT COALESCE((gems->>'level')::int, 1) as level
      FROM commander_states
      WHERE empire_id = ${user.empireId} AND commander_id = ${commanderId}
    `;
    const commanderLevel = Number(levelRow[0]?.level ?? 1);

    const healCost = commanderLevel * HEAL_CREDITS_COST_PER_LEVEL;
    const healTimeSeconds = commanderLevel * HEAL_TIME_MINUTES_PER_LEVEL * SECONDS_PER_MINUTE;

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        hospital,
        remainingSeconds,
        commanderLevel,
        healCost,
        healTimeSeconds,
        healTimeMinutes: commanderLevel * HEAL_TIME_MINUTES_PER_LEVEL,
        canHeal: hospital.status === 'INJURED' || hospital.status === 'RECOVERING',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// POST /api/commanders/[id]/heal — Curar comandante herido
// Body: { instant?: boolean } — si true, cura instantáneo pagando créditos
//                              si false (default), inicia recuperación con timer
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;
    const body = (await request.json()) as {
      instant?: boolean;
    };

    const hospital = await getHospital(user.empireId, commanderId);

    // Verificar que esté herido
    if (hospital.status === 'HEALTHY') {
      return NextResponse.json(
        { success: false, error: 'El comandante no está herido' },
        { status: 409 }
      );
    }

    // Obtener nivel del comandante
    const levelRow = await prisma.$queryRaw<
      Array<{ level: number }>
    >`
      SELECT COALESCE((gems->>'level')::int, 1) as level
      FROM commander_states
      WHERE empire_id = ${user.empireId} AND commander_id = ${commanderId}
    `;
    const commanderLevel = Number(levelRow[0]?.level ?? 1);
    const healCost = commanderLevel * HEAL_CREDITS_COST_PER_LEVEL;
    const healTimeSeconds = commanderLevel * HEAL_TIME_MINUTES_PER_LEVEL * SECONDS_PER_MINUTE;

    if (body.instant) {
      // ── CURA INSTANTÁNEA: pagar créditos ──
      const creditResource = await prisma.resource.findFirst({
        where: { empireId: user.empireId, type: 'CREDITS' },
      });

      if (!creditResource || creditResource.amount < healCost) {
        throw new ApiError(
          400,
          `Créditos insuficientes. Necesitas ${healCost} créditos para curar a un comandante nivel ${commanderLevel}`
        );
      }

      // Descontar créditos y curar
      await prisma.$transaction(async (tx) => {
        await tx.resource.update({
          where: { id: creditResource.id },
          data: { amount: { decrement: healCost } },
        });

        const healed: HospitalPayload = {
          status: 'HEALTHY',
          recoveryEndsAt: null,
          totalHealingTime: 0,
          bedIndex: null,
        };
        await setHospital(user.empireId, commanderId, healed);
      });

      return NextResponse.json({
        success: true,
        data: {
          commanderId,
          hospital: {
            status: 'HEALTHY',
            recoveryEndsAt: null,
            totalHealingTime: 0,
            bedIndex: null,
          },
          cost: healCost,
          message: `Comandante curado instantáneamente por ${healCost} créditos`,
        },
      });
    } else {
      // ── CURA CON TIMER: iniciar recuperación ──
      if (hospital.status === 'RECOVERING') {
        return NextResponse.json(
          { success: false, error: 'El comandante ya está en recuperación' },
          { status: 409 }
        );
      }

      const recoveryEndsAt = new Date(
        Date.now() + healTimeSeconds * 1000
      ).toISOString();

      const recovering: HospitalPayload = {
        status: 'RECOVERING',
        recoveryEndsAt,
        totalHealingTime: healTimeSeconds,
        bedIndex: null,
      };
      await setHospital(user.empireId, commanderId, recovering);

      return NextResponse.json({
        success: true,
        data: {
          commanderId,
          hospital: recovering,
          healTimeSeconds,
          healTimeMinutes: commanderLevel * HEAL_TIME_MINUTES_PER_LEVEL,
          recoveryEndsAt,
          message: `Recuperación iniciada. El comandante estará listo en ${commanderLevel * HEAL_TIME_MINUTES_PER_LEVEL} minutos`,
        },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
