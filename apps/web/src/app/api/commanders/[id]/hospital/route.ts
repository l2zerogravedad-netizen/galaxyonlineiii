import { NextResponse } from 'next/server';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import {
  getHospital,
  setHospital,
  type HospitalPayload,
} from '../../_lib/commander-state';

// ============================================================
// GET /api/commanders/[id]/hospital — Estado hospitalario
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;

    const hospital = await getHospital(user.empireId, commanderId);

    // Calcular tiempo restante en segundos (para el frontend timer)
    let remainingSeconds = 0;
    if (hospital.recoveryEndsAt) {
      const end = new Date(hospital.recoveryEndsAt).getTime();
      const now = Date.now();
      remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
    }

    // Si ya terminó la recuperación pero sigue como RECOVERING, auto-curar
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
        },
      });
    }

    // Costo de curación instantánea: 1 premium por minuto restante
    const healCost = Math.max(1, Math.ceil(remainingSeconds / 60));

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        hospital,
        remainingSeconds,
        healCost: hospital.status === 'RECOVERING' ? healCost : 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// POST /api/commanders/[id]/hospital — Acciones hospitalarias
// Body: { action: 'admit', totalHealingTime: 300 }
//       { action: 'heal' }  — curar instantáneamente (speed-up)
//       { action: 'discharge' } — dar de alta manual
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;
    const body = (await request.json()) as {
      action: 'admit' | 'heal' | 'discharge';
      totalHealingTime?: number;
    };

    const current = await getHospital(user.empireId, commanderId);

    switch (body.action) {
      case 'admit': {
        if (current.status === 'RECOVERING') {
          return NextResponse.json(
            { success: false, error: 'El comandante ya está en recuperación' },
            { status: 409 }
          );
        }
        const healingTime = body.totalHealingTime ?? 300; // default 5 min
        const recoveryEndsAt = new Date(
          Date.now() + healingTime * 1000
        ).toISOString();
        const admitted: HospitalPayload = {
          status: 'RECOVERING',
          recoveryEndsAt,
          totalHealingTime: healingTime,
          bedIndex: null,
        };
        await setHospital(user.empireId, commanderId, admitted);
        return NextResponse.json({
          success: true,
          data: {
            commanderId,
            hospital: admitted,
            message: 'Comandante ingresado al hospital',
          },
        });
      }

      case 'heal': {
        if (current.status !== 'RECOVERING') {
          return NextResponse.json(
            { success: false, error: 'El comandante no está en recuperación' },
            { status: 409 }
          );
        }
        // Curar instantáneamente
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
            message: 'Comandante curado instantáneamente',
          },
        });
      }

      case 'discharge': {
        const discharged: HospitalPayload = {
          status: 'HEALTHY',
          recoveryEndsAt: null,
          totalHealingTime: 0,
          bedIndex: null,
        };
        await setHospital(user.empireId, commanderId, discharged);
        return NextResponse.json({
          success: true,
          data: {
            commanderId,
            hospital: discharged,
            message: 'Comandante dado de alta',
          },
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Acción inválida. Usa: admit, heal, discharge',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
