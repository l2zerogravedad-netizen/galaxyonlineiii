import { NextResponse } from 'next/server';

/**
 * POST /api/combat/simulate — deterministic GO2 combat resolver.
 *
 * SELF-CONTAINED: the simulator is inlined here (this deployed worktree's @galaxy/shared
 * does not ship the go2/combatSim module), so the route never depends on a shared rebuild.
 * Same ruleset as the client/Fastify simulator: seeded LCG RNG, shield-then-hull damage,
 * 12% crit, deterministic for a given seed + unit list.
 */

interface CombatUnitInput {
  id: string;
  side: 'player' | 'enemy';
  attack: number;
  defense: number;
  hp: number;
  shield: number;
}

interface SimBody {
  player: CombatUnitInput[];
  enemy: CombatUnitInput[];
  maxRounds: number;
  seed?: number;
}

function createSeededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    // LCG (Numerical Recipes constants)
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface SimUnit {
  id: string;
  side: 'player' | 'enemy';
  attack: number;
  defense: number;
  hp: number;
  shield: number;
}

function simulateCombat(
  playerIn: CombatUnitInput[],
  enemyIn: CombatUnitInput[],
  maxRounds: number,
  seed: number
) {
  const rng = createSeededRng(seed);
  const mk = (u: CombatUnitInput): SimUnit => ({
    id: u.id,
    side: u.side,
    attack: u.attack,
    defense: u.defense,
    hp: u.hp,
    shield: u.shield,
  });
  const players = playerIn.map(mk);
  const enemies = enemyIn.map(mk);
  const log: string[] = [];

  const alive = (arr: SimUnit[]) => arr.filter((u) => u.hp > 0);

  function strike(attacker: SimUnit, defender: SimUnit, round: number) {
    const crit = rng() < 0.12;
    const critMult = crit ? 1.6 : 1;
    const dmg = Math.max(4, Math.round(attacker.attack * critMult - defender.defense * 0.35));
    let remaining = dmg;
    if (defender.shield > 0) {
      const absorbed = Math.min(defender.shield, remaining);
      defender.shield -= absorbed;
      remaining -= absorbed;
    }
    if (remaining > 0) defender.hp -= remaining;
    if (crit) log.push(`R${round}: ${attacker.id} CRIT → ${defender.id}`);
  }

  let round = 0;
  for (; round < maxRounds; round++) {
    if (alive(players).length === 0 || alive(enemies).length === 0) break;

    // Players attack random alive enemies
    for (const p of alive(players)) {
      const targets = alive(enemies);
      if (!targets.length) break;
      const t = targets[Math.floor(rng() * targets.length)];
      strike(p, t, round + 1);
    }
    // Enemies attack the highest-attack alive player
    for (const e of alive(enemies)) {
      const targets = alive(players);
      if (!targets.length) break;
      const t = targets.reduce((a, b) => (b.attack > a.attack ? b : a), targets[0]);
      strike(e, t, round + 1);
    }
  }

  const pAlive = alive(players).length;
  const eAlive = alive(enemies).length;
  let winner: 'player' | 'enemy' | 'timeout';
  if (eAlive === 0 && pAlive > 0) winner = 'player';
  else if (pAlive === 0 && eAlive > 0) winner = 'enemy';
  else if (pAlive === 0 && eAlive === 0) winner = 'enemy';
  else winner = 'timeout';

  return {
    winner,
    rounds: round,
    playerSurvivors: pAlive,
    enemySurvivors: eAlive,
    log,
  };
}

function isUnit(u: unknown): u is CombatUnitInput {
  if (typeof u !== 'object' || u === null) return false;
  const o = u as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    (o.side === 'player' || o.side === 'enemy') &&
    typeof o.attack === 'number' &&
    typeof o.defense === 'number' &&
    typeof o.hp === 'number' &&
    typeof o.shield === 'number'
  );
}

function validate(body: unknown): SimBody | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  const player = b.player;
  const enemy = b.enemy;
  if (!Array.isArray(player) || player.length < 1 || !player.every(isUnit)) return null;
  if (!Array.isArray(enemy) || enemy.length < 1 || !enemy.every(isUnit)) return null;
  let maxRounds = Number(b.maxRounds);
  if (!Number.isInteger(maxRounds) || maxRounds < 1) maxRounds = 40;
  if (maxRounds > 200) maxRounds = 200;
  const seed = b.seed === undefined ? undefined : Number(b.seed);
  return {
    player: player as CombatUnitInput[],
    enemy: enemy as CombatUnitInput[],
    maxRounds,
    seed: Number.isFinite(seed as number) ? (seed as number) : undefined,
  };
}

export async function POST(request: Request) {
  let parsed: SimBody | null;
  try {
    parsed = validate(await request.json());
  } catch {
    parsed = null;
  }
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const seed = parsed.seed ?? 1;
  const result = simulateCombat(parsed.player, parsed.enemy, parsed.maxRounds, seed);

  return NextResponse.json({
    rulesetVersion: 'go2-combat-v1',
    seed,
    winner: result.winner,
    rounds: result.rounds,
    playerSurvivors: result.playerSurvivors,
    enemySurvivors: result.enemySurvivors,
    log: result.log,
  });
}
