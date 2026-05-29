import { NextResponse } from 'next/server';
import { handleApiError, ApiError } from '@/lib/api-auth';

// ─────────────────────────────────────────────
// Tipos para el simulador dev
// ─────────────────────────────────────────────

interface ShipStackInput {
  id: string;
  blueprintId: string;
  shipName: string;
  shipCount: number;
  maxHull: number;
  currentHull: number;
  maxShield: number;
  currentShield: number;
  attack: number;
  defense: number;
  speed: number;
  initiative: number;
}

interface BattleEvent {
  type:
    | 'round_start'
    | 'turn_start'
    | 'attack'
    | 'hit'
    | 'shield_absorb'
    | 'hull_damage'
    | 'stack_destroyed'
    | 'turn_end'
    | 'round_end'
    | 'battle_end';
  round: number;
  turn?: number;
  attackerId?: string;
  attackerName?: string;
  targetId?: string;
  targetName?: string;
  damage?: number;
  isCritical?: boolean;
  shieldDamage?: number;
  hullDamage?: number;
  remainingShield?: number;
  remainingHull?: number;
  shipsDestroyed?: number;
  remainingShips?: number;
  winner?: 'attacker' | 'defender' | null;
}

interface DevSimulateBody {
  attackerStacks: ShipStackInput[];
  defenderStacks: ShipStackInput[];
  maxRounds?: number;
  seed?: number;
}

// ─────────────────────────────────────────────
// RNG determinista con seed (LCG)
// ─────────────────────────────────────────────

class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  chance(p: number): boolean {
    return this.next() < p;
  }
}

// ─────────────────────────────────────────────
// Helper: clonar stacks para no mutar los originales
// ─────────────────────────────────────────────

function cloneStacks(stacks: ShipStackInput[]): ShipStackInput[] {
  return stacks.map((s) => ({ ...s }));
}

// ─────────────────────────────────────────────
// Helper: calcular daño
// ─────────────────────────────────────────────

function calculateDamage(
  attacker: ShipStackInput,
  defender: ShipStackInput,
  rng: SeededRNG
): {
  damage: number;
  isCritical: boolean;
  shieldDamage: number;
  hullDamage: number;
  shipsDestroyed: number;
} {
  // Daño base = ataque * factor de cantidad
  const countFactor = 1 + (attacker.shipCount - 1) * 0.1; // 10% por nave adicional
  const variation = rng.nextInt(-15, 16); // +/- 15 variacion
  let damage = Math.floor(attacker.attack * countFactor) + variation;
  damage = Math.max(5, damage); // Minimo 5 de daño

  // Aplicar defensa del objetivo (reduccion de daño)
  const defenseReduction = defender.defense * 0.5;
  damage = Math.max(1, Math.floor(damage - defenseReduction));

  // Critico basado en velocidad
  const critChance = Math.min(0.3, 0.05 + attacker.speed / 200);
  const isCritical = rng.chance(critChance);
  if (isCritical) {
    damage = Math.floor(damage * 1.75);
  }

  // Distribuir daño entre escudo y casco
  let shieldDamage = 0;
  let hullDamage = 0;

  if (defender.currentShield > 0) {
    // El escudo absorbe hasta su capacidad
    shieldDamage = Math.min(defender.currentShield, Math.floor(damage * 0.7));
    hullDamage = damage - shieldDamage;
  } else {
    hullDamage = damage;
  }

  // Calcular naves destruidas
  const hullPerShip = defender.maxHull;
  const totalHullLost = hullDamage * attacker.shipCount;
  const shipsDestroyed = Math.min(
    defender.shipCount,
    Math.floor(totalHullLost / hullPerShip)
  );

  return {
    damage,
    isCritical,
    shieldDamage,
    hullDamage,
    shipsDestroyed,
  };
}

// ─────────────────────────────────────────────
// Helper: simular una ronda completa
// ─────────────────────────────────────────────

function simulateDevRound(
  attackerStacks: ShipStackInput[],
  defenderStacks: ShipStackInput[],
  round: number,
  rng: SeededRNG
): BattleEvent[] {
  const events: BattleEvent[] = [];

  events.push({ type: 'round_start', round });

  // Ordenar por iniciativa (mayor primero)
  const allStacks = [
    ...attackerStacks.map((s) => ({ ...s, side: 'attacker' as const })),
    ...defenderStacks.map((s) => ({ ...s, side: 'defender' as const })),
  ]
    .filter((s) => s.shipCount > 0 && s.currentHull > 0)
    .sort((a, b) => {
      const initDiff = b.initiative - a.initiative;
      if (initDiff !== 0) return initDiff;
      return rng.next() < 0.5 ? -1 : 1;
    });

  for (let turnIdx = 0; turnIdx < allStacks.length; turnIdx++) {
    const attacker = allStacks[turnIdx];
    if (attacker.shipCount <= 0 || attacker.currentHull <= 0) continue;

    // Elegir objetivo del bando opuesto
    const enemyStacks =
      attacker.side === 'attacker' ? defenderStacks : attackerStacks;
    const aliveTargets = enemyStacks.filter(
      (s) => s.shipCount > 0 && s.currentHull > 0
    );
    if (aliveTargets.length === 0) break;

    // Targeting: elegir el stack con mas naves
    const target = aliveTargets.reduce((prev, curr) =>
      curr.shipCount > prev.shipCount ? curr : prev
    );

    events.push({
      type: 'turn_start',
      round,
      turn: turnIdx + 1,
      attackerId: attacker.id,
      attackerName: attacker.shipName,
      targetId: target.id,
      targetName: target.shipName,
    });

    // Calcular y aplicar daño
    const result = calculateDamage(attacker, target, rng);

    // Evento: ataque
    events.push({
      type: 'attack',
      round,
      turn: turnIdx + 1,
      attackerId: attacker.id,
      attackerName: attacker.shipName,
      targetId: target.id,
      targetName: target.shipName,
      damage: result.damage,
      isCritical: result.isCritical,
    });

    // Aplicar daño al target
    target.currentShield = Math.max(0, target.currentShield - result.shieldDamage);
    target.currentHull = Math.max(0, target.currentHull - result.hullDamage);

    // Reducir conteo de naves si el hull baja del 50%
    const hullPercent = target.currentHull / target.maxHull;
    const newShipCount = Math.max(1, Math.floor(target.shipCount * hullPercent));
    const shipsLost = target.shipCount - newShipCount;
    target.shipCount = newShipCount;

    // Evento: impacto
    events.push({
      type: 'hit',
      round,
      turn: turnIdx + 1,
      targetId: target.id,
      targetName: target.shipName,
      damage: result.damage,
      shieldDamage: result.shieldDamage,
      hullDamage: result.hullDamage,
      remainingShield: target.currentShield,
      remainingHull: target.currentHull,
    });

    // Si se destruyeron naves
    if (shipsLost > 0) {
      events.push({
        type: 'hull_damage',
        round,
        turn: turnIdx + 1,
        targetId: target.id,
        targetName: target.shipName,
        shipsDestroyed: shipsLost,
        remainingShips: target.shipCount,
      });
    }

    // Si el stack queda destruido
    if (target.currentHull <= 0 || target.shipCount <= 0) {
      target.shipCount = 0;
      target.currentHull = 0;
      events.push({
        type: 'stack_destroyed',
        round,
        turn: turnIdx + 1,
        targetId: target.id,
        targetName: target.shipName,
      });
    }

    events.push({
      type: 'turn_end',
      round,
      turn: turnIdx + 1,
      attackerId: attacker.id,
      attackerName: attacker.shipName,
    });
  }

  events.push({ type: 'round_end', round });

  return events;
}

// ─────────────────────────────────────────────
// POST /api/battles/dev-simulate — Simulador dev (sin auth, sin persistencia)
// Body: {
//   attackerStacks: ShipStackInput[],
//   defenderStacks: ShipStackInput[],
//   maxRounds?: number,
//   seed?: number
// }
// ─────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: DevSimulateBody = await request.json();

    // ── Validaciones ──
    if (!body.attackerStacks || !Array.isArray(body.attackerStacks)) {
      throw new ApiError(400, 'attackerStacks es requerido y debe ser un array');
    }
    if (!body.defenderStacks || !Array.isArray(body.defenderStacks)) {
      throw new ApiError(400, 'defenderStacks es requerido y debe ser un array');
    }
    if (body.attackerStacks.length === 0 || body.defenderStacks.length === 0) {
      throw new ApiError(400, 'Ambos bandos deben tener al menos un stack');
    }

    const maxRounds = Math.min(
      body.maxRounds ?? 20,
      100 // hard cap de seguridad
    );

    // Seed opcional para reproducibilidad
    const seed = body.seed ?? Math.floor(Math.random() * 4294967296);
    const rng = new SeededRNG(seed);

    // ── Clonar stacks para no mutar los inputs ──
    const attackerStacks = cloneStacks(body.attackerStacks);
    const defenderStacks = cloneStacks(body.defenderStacks);

    // ── Simular rondas ──
    const allRounds: Array<{
      round: number;
      events: BattleEvent[];
      attackerState: ShipStackInput[];
      defenderState: ShipStackInput[];
    }> = [];

    let winner: 'attacker' | 'defender' | null = null;

    for (let round = 1; round <= maxRounds; round++) {
      const events = simulateDevRound(
        attackerStacks,
        defenderStacks,
        round,
        rng
      );

      allRounds.push({
        round,
        events,
        attackerState: cloneStacks(attackerStacks),
        defenderState: cloneStacks(defenderStacks),
      });

      // Verificar si alguien gano
      const attackerAlive = attackerStacks.some(
        (s) => s.shipCount > 0 && s.currentHull > 0
      );
      const defenderAlive = defenderStacks.some(
        (s) => s.shipCount > 0 && s.currentHull > 0
      );

      if (!attackerAlive || !defenderAlive) {
        winner = attackerAlive ? 'attacker' : 'defender';
        // Agregar evento de fin de batalla en la ultima ronda
        const lastRound = allRounds[allRounds.length - 1];
        lastRound.events.push({
          type: 'battle_end',
          round,
          winner,
        });
        break;
      }

      // Si llegamos al maximo de rondas, gana el defensor por default
      if (round === maxRounds) {
        winner = 'defender';
        const lastRound = allRounds[allRounds.length - 1];
        lastRound.events.push({
          type: 'battle_end',
          round,
          winner,
        });
      }
    }

    // ── Calcular estadisticas finales ──
    const totalAttackerShipsLost = body.attackerStacks.reduce(
      (sum, original, i) =>
        sum +
        Math.max(0, original.shipCount - (attackerStacks[i]?.shipCount ?? 0)),
      0
    );
    const totalDefenderShipsLost = body.defenderStacks.reduce(
      (sum, original, i) =>
        sum +
        Math.max(0, original.shipCount - (defenderStacks[i]?.shipCount ?? 0)),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        seed,
        totalRounds: allRounds.length,
        winner,
        summary: {
          attackerShipsLost: totalAttackerShipsLost,
          defenderShipsLost: totalDefenderShipsLost,
          finalAttackerStacks: attackerStacks.map((s) => ({
            id: s.id,
            shipName: s.shipName,
            remainingShips: s.shipCount,
            remainingHull: s.currentHull,
            remainingShield: s.currentShield,
          })),
          finalDefenderStacks: defenderStacks.map((s) => ({
            id: s.id,
            shipName: s.shipName,
            remainingShips: s.shipCount,
            remainingHull: s.currentHull,
            remainingShield: s.currentShield,
          })),
        },
        allRounds: allRounds.map((r) => ({
          round: r.round,
          events: r.events,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
