import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

// ─────────────────────────────────────────────
// Tipos para la simulacion de ronda
// ─────────────────────────────────────────────

interface BattleEvent {
  type: 'turn_start' | 'attack' | 'hit' | 'destroyed' | 'turn_end' | 'round_end' | 'battle_end';
  round: number;
  turn?: number;
  stackId?: string;
  commanderName?: string;
  attackerId?: string;
  targetId?: string;
  damage?: number;
  isCritical?: boolean;
  shieldDamage?: number;
  hullDamage?: number;
  remainingHull?: number;
  remainingShield?: number;
  destroyed?: boolean;
  winner?: 'attacker' | 'defender' | null;
}

interface FormationWithShip {
  id: string;
  shipCount: number;
  position: number | null;
  ship: {
    id: string;
    blueprintId: string;
    blueprint: {
      id: string;
      name: string;
      hull: number | null;
      shield: number | null;
      attack: number | null;
      defense: number | null;
      speed: number | null;
      initiative: number | null;
    };
  };
}

interface BattleWithFleet {
  id: string;
  empireId: string;
  fleetId: string;
  seed: string;
  result: string;
  rounds: string | null;
  xpGained: number;
  creditsGained: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// RNG determinista con seed (LCG)
// ─────────────────────────────────────────────

class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0; // uint32
  }

  // Linear Congruential Generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  // Entero en rango [min, max)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Boolean con probabilidad p
  chance(p: number): boolean {
    return this.next() < p;
  }
}

// ─────────────────────────────────────────────
// Helper: simular una ronda de batalla
// ─────────────────────────────────────────────

async function simulateBattleRound(
  battle: BattleWithFleet,
  round: number
): Promise<{
  events: BattleEvent[];
  battleEnded: boolean;
  winner: 'attacker' | 'defender' | null;
}> {
  const events: BattleEvent[] = [];

  // Obtener flota del atacante con formaciones
  const fleet = await prisma.fleet.findUnique({
    where: { id: battle.fleetId },
    include: {
      formations: {
        include: {
          ship: {
            include: {
              blueprint: true,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!fleet || fleet.formations.length === 0) {
    events.push({
      type: 'battle_end',
      round,
      winner: 'defender',
    });
    return { events, battleEnded: true, winner: 'defender' };
  }

  // Inicializar RNG con seed de la batalla + ronda
  const seedNum = parseInt(battle.seed, 10) || 0;
  const rng = new SeededRNG(seedNum + round * 7919);

  const formations = fleet.formations as unknown as FormationWithShip[];

  // Calcular orden de turno por iniciativa
  const turnOrder = [...formations]
    .filter((f) => f.shipCount > 0)
    .sort((a, b) => {
      const initA = a.ship.blueprint.initiative ?? 10;
      const initB = b.ship.blueprint.initiative ?? 10;
      if (initB !== initA) return initB - initA;
      return rng.next() < 0.5 ? -1 : 1; // Desempate aleatorio
    });

  if (turnOrder.length === 0) {
    events.push({
      type: 'battle_end',
      round,
      winner: 'defender',
    });
    return { events, battleEnded: true, winner: 'defender' };
  }

  // Simular cada turno
  for (let turnIdx = 0; turnIdx < turnOrder.length; turnIdx++) {
    const formation = turnOrder[turnIdx];
    const blueprint = formation.ship.blueprint;

    // Evento: inicio de turno
    events.push({
      type: 'turn_start',
      round,
      turn: turnIdx + 1,
      stackId: formation.id,
      commanderName: blueprint.name,
    });

    // Calcular daño base
    const baseAttack = blueprint.attack ?? 10;
    const speedFactor = (blueprint.speed ?? 10) / 10;
    const variation = rng.nextInt(-10, 11); // +/- 10 variacion
    let damage = Math.floor(baseAttack * speedFactor * (formation.shipCount / 10 + 0.5)) + variation;
    damage = Math.max(1, damage); // Minimo 1 de daño

    // Chance de critico (10% base, escalado por ataque)
    const critChance = Math.min(0.25, 0.1 + (baseAttack / 200));
    const isCritical = rng.chance(critChance);
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    // Target: enemigo (simplificado - en produccion seria seleccion inteligente)
    const targetId = `enemy_${turnIdx + 1}`;

    // Evento: ataque
    events.push({
      type: 'attack',
      round,
      turn: turnIdx + 1,
      attackerId: formation.id,
      targetId,
      damage,
      isCritical,
    });

    // Evento: impacto
    const shieldDamage = Math.floor(damage * 0.6);
    const hullDamage = Math.floor(damage * 0.4);

    events.push({
      type: 'hit',
      round,
      turn: turnIdx + 1,
      targetId,
      damage,
      shieldDamage,
      hullDamage,
      remainingHull: Math.max(0, (blueprint.hull ?? 100) - hullDamage),
      remainingShield: Math.max(0, (blueprint.shield ?? 0) - shieldDamage),
    });

    // Evento: fin de turno
    events.push({
      type: 'turn_end',
      round,
      turn: turnIdx + 1,
      stackId: formation.id,
    });
  }

  // Evento: fin de ronda
  events.push({ type: 'round_end', round });

  // Verificar si la batalla termina (max 20 rondas)
  const battleEnded = round >= 20;
  const winner: 'attacker' | 'defender' | null = battleEnded
    ? (rng.chance(0.5) ? 'attacker' : 'defender') // En produccion: verificar stacks vivos
    : null;

  if (battleEnded) {
    events.push({
      type: 'battle_end',
      round,
      winner,
    });
  }

  return { events, battleEnded, winner };
}

// ─────────────────────────────────────────────
// GET /api/battles/[id] — Obtener estado de una batalla
// ─────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const { id: battleId } = await params;

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
        fleet: {
          select: {
            id: true,
            name: true,
            formations: {
              include: {
                ship: {
                  select: {
                    blueprintId: true,
                    blueprint: {
                      select: {
                        name: true,
                        hull: true,
                        shield: true,
                        attack: true,
                        defense: true,
                        speed: true,
                        initiative: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!battle) {
      throw new ApiError(404, 'Batalla no encontrada');
    }

    return NextResponse.json({
      success: true,
      data: battle,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/battles/[id] — Simular una ronda
// Body: { round: number }
// ─────────────────────────────────────────────

interface RoundRequestBody {
  round?: number;
  defenderStacks?: Array<{
    stackId: string;
    shipCount: number;
    currentHull: number;
    currentShield: number;
  }>;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const { id: battleId } = await params;
    const body: RoundRequestBody = await request.json();

    if (!battleId) {
      throw new ApiError(400, 'ID de batalla requerido');
    }

    // ── Validar ronda ──
    const round = body.round ?? 1;
    if (typeof round !== 'number' || round < 1 || round > 20) {
      throw new ApiError(400, 'round debe ser un numero entre 1 y 20');
    }

    // ── Obtener batalla ──
    const battle = await prisma.battle.findFirst({
      where: {
        id: battleId,
        empireId: user.empireId,
      },
    });

    if (!battle) {
      throw new ApiError(404, 'Batalla no encontrada');
    }

    if (battle.result !== 'IN_PROGRESS') {
      throw new ApiError(409, `La batalla ya ha finalizado con resultado: ${battle.result}`);
    }

    // ── Simular la ronda ──
    const { events, battleEnded, winner } = await simulateBattleRound(battle, round);

    // ── Persistir estado actualizado ──
    if (battleEnded && winner) {
      const xpGained = winner === 'attacker' ? 100 : 10;
      const creditsGained = winner === 'attacker' ? 500 : 0;

      await prisma.battle.update({
        where: { id: battleId },
        data: {
          result: winner === 'attacker' ? 'WIN' : 'LOSS',
          rounds: round.toString(),
          xpGained,
          creditsGained,
          updatedAt: new Date(),
        },
      });
    } else {
      // Actualizar solo rondas jugadas
      await prisma.battle.update({
        where: { id: battleId },
        data: {
          rounds: round.toString(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        round,
        events,
        battleEnded,
        winner,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
