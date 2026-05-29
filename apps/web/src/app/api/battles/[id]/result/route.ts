import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface ShipLoss {
  blueprintId: string;
  quantity: number;
}

interface BattleResultBody {
  result: 'WIN' | 'LOSS';
  roundsPlayed: number;
  losses?: ShipLoss[];
  xpGained?: number;
  creditsGained?: number;
}

// ─────────────────────────────────────────────
// POST /api/battles/[id]/result — Guardar resultado final
// Body: {
//   result: 'WIN' | 'LOSS',
//   roundsPlayed: number,
//   losses?: Array<{ blueprintId: string, quantity: number }>
// }
// ─────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const battleId = params.id;
    const body: BattleResultBody = await request.json();

    // ── Validaciones ──
    if (!battleId) {
      throw new ApiError(400, 'ID de batalla requerido');
    }

    if (!body.result || (body.result !== 'WIN' && body.result !== 'LOSS')) {
      throw new ApiError(400, "result debe ser 'WIN' o 'LOSS'");
    }

    if (typeof body.roundsPlayed !== 'number' || body.roundsPlayed < 1 || body.roundsPlayed > 20) {
      throw new ApiError(400, 'roundsPlayed debe ser un numero entre 1 y 20');
    }

    // ── Verificar que la batalla existe y pertenece al usuario ──
    const existingBattle = await prisma.battle.findFirst({
      where: {
        id: battleId,
        empireId: user.empireId,
      },
      include: {
        fleet: {
          include: {
            formations: true,
          },
        },
        losses: true,
      },
    });

    if (!existingBattle) {
      throw new ApiError(404, 'Batalla no encontrada');
    }

    // No permitir modificar batallas ya finalizadas
    if (existingBattle.result !== 'IN_PROGRESS') {
      throw new ApiError(409, `La batalla ya ha sido finalizada con resultado: ${existingBattle.result}`);
    }

    // ── Calcular recompensas ──
    const baseXp = body.result === 'WIN' ? 100 : 10;
    const baseCredits = body.result === 'WIN' ? 500 : 0;
    const xpGained = body.xpGained ?? baseXp;
    const creditsGained = body.creditsGained ?? baseCredits;

    // ── Ejecutar todo en una transaccion ──
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar batalla con resultado
      const updatedBattle = await tx.battle.update({
        where: { id: battleId },
        data: {
          result: body.result,
          rounds: body.roundsPlayed.toString(),
          xpGained,
          creditsGained,
          updatedAt: new Date(),
        },
      });

      // 2. Guardar perdidas de naves
      const losses: ShipLoss[] = body.losses ?? [];
      if (losses.length > 0) {
        // Crear registros de perdidas
        await tx.battleLoss.createMany({
          data: losses.map((loss) => ({
            battleId,
            blueprintId: loss.blueprintId,
            quantity: loss.quantity,
          })),
        });

        // 3. Descontar naves destruidas de las formaciones de la flota (perdida permanente PvP)
        for (const loss of losses) {
          const formation = existingBattle.fleet.formations.find(
            (f) => f.shipId === loss.blueprintId || f.id === loss.blueprintId
          );

          if (formation) {
            const newCount = Math.max(0, formation.shipCount - loss.quantity);
            await tx.formation.update({
              where: { id: formation.id },
              data: { shipCount: newCount },
            });

            // Si la formacion queda sin naves, eliminarla
            if (newCount === 0) {
              await tx.formation.delete({
                where: { id: formation.id },
              });
            }
          }
        }
      }

      // 4. Otorgar recompensas si gano
      if (body.result === 'WIN') {
        // Creditos
        const creditResource = await tx.resource.findFirst({
          where: {
            empireId: user.empireId,
            type: 'CREDITS',
          },
        });

        if (creditResource) {
          await tx.resource.update({
            where: { id: creditResource.id },
            data: {
              amount: { increment: creditsGained },
            },
          });
        } else {
          await tx.resource.create({
            data: {
              empireId: user.empireId,
              type: 'CREDITS',
              amount: creditsGained,
            },
          });
        }

        // XP al imperio (si aplica)
        await tx.empire.update({
          where: { id: user.empireId },
          data: {
            experience: { increment: xpGained },
          },
        });
      }

      return { updatedBattle, lossesRecorded: losses.length };
    });

    return NextResponse.json({
      success: true,
      data: {
        battleId: result.updatedBattle.id,
        result: result.updatedBattle.result,
        roundsPlayed: result.updatedBattle.rounds,
        xpGained: result.updatedBattle.xpGained,
        creditsGained: result.updatedBattle.creditsGained,
        lossesRecorded: result.lossesRecorded,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/battles/[id]/result — Obtener resultado guardado
// ─────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const battleId = params.id;

    if (!battleId) {
      throw new ApiError(400, 'ID de batalla requerido');
    }

    const battle = await prisma.battle.findFirst({
      where: {
        id: battleId,
        empireId: user.empireId,
      },
      include: {
        losses: {
          select: {
            blueprintId: true,
            quantity: true,
          },
        },
      },
    });

    if (!battle) {
      throw new ApiError(404, 'Batalla no encontrada');
    }

    if (battle.result === 'IN_PROGRESS') {
      throw new ApiError(409, 'La batalla aun esta en progreso');
    }

    return NextResponse.json({
      success: true,
      data: {
        battleId: battle.id,
        result: battle.result,
        roundsPlayed: battle.rounds,
        xpGained: battle.xpGained,
        creditsGained: battle.creditsGained,
        losses: battle.losses,
        createdAt: battle.createdAt,
        updatedAt: battle.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
