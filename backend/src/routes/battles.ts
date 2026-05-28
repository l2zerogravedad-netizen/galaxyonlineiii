import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { asyncHandler } from '@/utils/asyncHandler';
import { logger } from '@/utils/logger';
import {
  COMMANDERS,
  SHIP_DESIGNS,
} from '@/routes/reference';

// ============================================================
// TYPES & INTERFACES
// ============================================================

/** Input fleet configuration for battle initiation */
export interface FleetInput {
  userId: string;
  formation: string;
  slots: FleetSlot[];
}

/** Individual slot in a fleet (position 1-9) */
export interface FleetSlot {
  position: number;       // 1-9 grid position
  commanderId: string;    // Commander identifier
  shipDesignId: string;   // Ship design/template ID
  shipCount: number;      // Number of ships in stack
  weapons: string[];      // Equipped weapon IDs
  modules: string[];      // Equipped module IDs
}

/** Stack info returned on battle initiation */
export interface StackInfo {
  id: string;
  userId: string;
  position: number;
  commanderName: string;
  shipType: string;
  shipCount: number;
  speed: number;
  maxHull: number;
  maxShield: number;
  he3: number;
}

/** Mutable stack state during/after battle */
export interface StackState {
  id: string;
  userId: string;
  position: number;
  commanderName: string;
  shipType: string;
  shipCount: number;
  maxHull: number;
  currentHull: number;
  maxShield: number;
  currentShield: number;
  speed: number;
  he3: number;
  status: 'alive' | 'destroyed' | 'he3_depleted';
}

/** Single battle event (attack, shield_regen, etc.) */
export interface BattleEvent {
  round: number;
  turn: number;
  type: string;
  attackerId?: string;
  targetId?: string;
  damage?: number;
  shieldDamage?: number;
  hullDamage?: number;
  shipsLost?: number;
  isCritical?: boolean;
  message: string;
}

/** Permanent fleet loss (PvP only) */
export interface FleetLoss {
  userId: string;
  shipType: string;
  shipsLost: number;
}

/** Player info embedded in battle state */
export interface PlayerBattleInfo {
  userId: string;
  username: string;
  fleetPower: number;
  totalShips: number;
  shipsDestroyed: number;
}

/** Full battle state snapshot */
export interface BattleState {
  battleId: string;
  rngSeed: number;
  currentRound: number;
  maxRounds: number;
  attacker: PlayerBattleInfo;
  defender: PlayerBattleInfo;
  attackerStacks: StackState[];
  defenderStacks: StackState[];
  events: BattleEvent[][];
}

/** Final battle result */
export interface BattleResult {
  winner: 'attacker' | 'defender' | 'timeout' | null;
  totalRounds: number;
  endedAt: string;
  attackerLosses: FleetLoss[];
  defenderLosses: FleetLoss[];
}



/** In-memory battle storage (replace with Redis/DB in production) */
interface StoredBattle {
  battleId: string;
  status: 'active' | 'completed';
  rngSeed: number;
  maxRounds: number;
  currentRound: number;
  battleType: 'pvp' | 'pve';
  attackerId: string;
  defenderId: string;
  attackerStacks: StackState[];
  defenderStacks: StackState[];
  events: BattleEvent[][];
  winner: 'attacker' | 'defender' | 'timeout' | null;
  losses: FleetLoss[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// IN-MEMORY BATTLE STORE (Replace with Redis/DB in production)
// ============================================================

const battleStore = new Map<string, StoredBattle>();

// ============================================================
// DETERMINISTIC RNG
// ============================================================

/**
 * Seeded random number generator for deterministic battles.
 * Same seed + same sequence of calls = same results (enables replays).
 */
function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Reference data imported from @/routes/reference
// COMMANDERS, SHIP_DESIGNS, FORMATIONS

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate a deterministic RNG seed from two player IDs.
 * Ensures same seed for both players in a given matchup.
 */
function generateRngSeed(a: string, b: string): number {
  const combined = [a, b].sort().join('|');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 2147483646 + 1;
}

/**
 * Convert FleetInput into initial StackState array.
 * Uses reference data to populate hull, shield, speed stats.
 */
function fleetToStacks(fleet: FleetInput, isAttacker: boolean): StackState[] {
  return fleet.slots.map((slot): StackState => {
    const design = SHIP_DESIGNS.find(d => d.id === slot.shipDesignId);
    const commander = COMMANDERS.find(c => c.id === slot.commanderId);

    const baseHull = design?.baseStats.hull ?? 1000;
    const baseShield = design?.baseStats.shield ?? 500;
    const baseSpeed = design?.baseStats.speed ?? 60;
    const he3Cap = design?.baseStats.he3Capacity ?? 100;

    // Apply commander stat modifiers
    const commanderSpeedBonus = commander ? (commander.baseStats.speed - 50) * 0.5 : 0;
    const finalSpeed = Math.max(10, Math.round(baseSpeed + commanderSpeedBonus));

    return {
      id: `${isAttacker ? 'att' : 'def'}_slot_${slot.position}`,
      userId: fleet.userId,
      position: slot.position,
      commanderName: commander?.name ?? 'Unknown',
      shipType: design?.name ?? slot.shipDesignId,
      shipCount: slot.shipCount,
      maxHull: baseHull * slot.shipCount,
      currentHull: baseHull * slot.shipCount,
      maxShield: baseShield * slot.shipCount,
      currentShield: baseShield * slot.shipCount,
      speed: finalSpeed,
      he3: he3Cap * slot.shipCount,
      status: 'alive' as const,
    };
  });
}

/**
 * Validate that a fleet input has proper structure.
 */
function validateFleetInput(fleet: FleetInput, side: 'attacker' | 'defender'): string | null {
  if (!fleet || typeof fleet !== 'object') return `${side}: Invalid fleet data`;
  if (!fleet.userId) return `${side}: Missing userId`;
  if (!fleet.formation) return `${side}: Missing formation`;
  if (!Array.isArray(fleet.slots) || fleet.slots.length === 0 || fleet.slots.length > 9) {
    return `${side}: Must have 1-9 slots`;
  }

  const positions = new Set<number>();
  for (const slot of fleet.slots) {
    if (slot.position < 1 || slot.position > 9) return `${side}: Position must be 1-9`;
    if (positions.has(slot.position)) return `${side}: Duplicate position ${slot.position}`;
    positions.add(slot.position);
    if (!slot.commanderId) return `${side}: Missing commanderId at position ${slot.position}`;
    if (!slot.shipDesignId) return `${side}: Missing shipDesignId at position ${slot.position}`;
    if (!slot.shipCount || slot.shipCount < 1) return `${side}: Invalid shipCount at position ${slot.position}`;
    if (!Array.isArray(slot.weapons)) return `${side}: Weapons must be array at position ${slot.position}`;
    if (!Array.isArray(slot.modules)) return `${side}: Modules must be array at position ${slot.position}`;
  }
  return null;
}

/**
 * Determine turn order for a round based on individual stack speed.
 * Faster stacks act first. Dead/depleted stacks are excluded.
 */
function getTurnOrder(
  attackerStacks: StackState[],
  defenderStacks: StackState[],
  rng: () => number
): Array<{ id: string; side: 'attacker' | 'defender'; speed: number }> {
  const all = [
    ...attackerStacks.filter(s => s.status === 'alive' && s.he3 > 0).map(s => ({ id: s.id, side: 'attacker' as const, speed: s.speed })),
    ...defenderStacks.filter(s => s.status === 'alive' && s.he3 > 0).map(s => ({ id: s.id, side: 'defender' as const, speed: s.speed })),
  ];

  // Sort by speed descending, tie-break with RNG
  all.sort((a, b) => {
    if (b.speed !== a.speed) return b.speed - a.speed;
    return rng() - 0.5;
  });

  return all;
}

/**
 * Regenerate shields to 100% for all alive stacks between rounds.
 */
function regenerateShields(stacks: StackState[]): void {
  for (const stack of stacks) {
    if (stack.status === 'alive') {
      stack.currentShield = stack.maxShield;
    }
  }
}

/**
 * Pick a random alive target from the opposing side.
 */
function pickTarget(
  stacks: StackState[],
  rng: () => number
): StackState | null {
  const alive = stacks.filter(s => s.status === 'alive');
  if (alive.length === 0) return null;
  return alive[Math.floor(rng() * alive.length)];
}

/**
 * Execute a single attack action.
 */
function executeAttack(
  attacker: StackState,
  defender: StackState,
  round: number,
  turn: number,
  rng: () => number
): { events: BattleEvent[]; targetDestroyed: boolean } {
  const events: BattleEvent[] = [];

  // Check He3 - no He3 means cannot attack
  if (attacker.he3 <= 0) {
    attacker.status = 'he3_depleted';
    events.push({
      round,
      turn,
      type: 'he3_depleted',
      attackerId: attacker.id,
      message: `${attacker.commanderName}'s ${attacker.shipType} has no He3 and cannot attack!`,
    });
    return { events, targetDestroyed: false };
  }

  // Consume He3 (simplified: 10 He3 per attack per ship)
  const he3Cost = Math.min(attacker.he3, 10 * attacker.shipCount);
  attacker.he3 -= he3Cost;

  // Calculate damage (simplified formula)
  const baseDamage = Math.floor(50 * attacker.shipCount * (1 + attacker.speed / 200));
  const variance = 0.8 + rng() * 0.4; // 0.8x to 1.2x
  const isCritical = rng() < 0.15; // 15% crit chance
  const critMultiplier = isCritical ? 2.0 : 1.0;
  const totalDamage = Math.floor(baseDamage * variance * critMultiplier);

  // Apply damage: shields first, then hull
  let shieldDamage = 0;
  let hullDamage = 0;

  if (defender.currentShield > 0) {
    shieldDamage = Math.min(defender.currentShield, totalDamage);
    defender.currentShield -= shieldDamage;
    hullDamage = totalDamage - shieldDamage;
  } else {
    hullDamage = totalDamage;
  }

  defender.currentHull = Math.max(0, defender.currentHull - hullDamage);

  // Calculate ships lost
  const hullPerShip = defender.maxHull / defender.shipCount;
  const shipsAlive = Math.max(0, Math.ceil(defender.currentHull / hullPerShip));
  const shipsLost = defender.shipCount - shipsAlive;

  if (shipsLost > 0) {
    defender.shipCount = shipsAlive;
    defender.maxHull = hullPerShip * shipsAlive;
    defender.maxShield = (defender.maxShield / (defender.shipCount + shipsLost)) * shipsAlive;
    defender.currentHull = Math.min(defender.currentHull, defender.maxHull);
    defender.currentShield = Math.min(defender.currentShield, defender.maxShield);
  }

  // Check if target destroyed
  const targetDestroyed = defender.currentHull <= 0;
  if (targetDestroyed) {
    defender.status = 'destroyed';
    defender.currentHull = 0;
    defender.currentShield = 0;
    defender.shipCount = 0;
  }

  events.push({
    round,
    turn,
    type: 'attack',
    attackerId: attacker.id,
    targetId: defender.id,
    damage: totalDamage,
    shieldDamage,
    hullDamage,
    shipsLost: shipsLost > 0 ? shipsLost : undefined,
    isCritical: isCritical || undefined,
    message: `${attacker.commanderName}'s ${attacker.shipType} attacks ` +
      `${defender.commanderName}'s ${defender.shipType} for ${totalDamage} damage` +
      (isCritical ? ' (CRITICAL!)' : '') +
      (shieldDamage > 0 ? ` [Shield: -${shieldDamage}]` : '') +
      (hullDamage > 0 ? ` [Hull: -${hullDamage}]` : '') +
      (targetDestroyed ? ` -> DESTROYED!` : shipsLost > 0 ? ` -> ${shipsLost} ships lost` : ''),
  });

  return { events, targetDestroyed };
}

/**
 * Simulate a single round of combat.
 */
function simulateRound(
  battle: StoredBattle,
  rng: () => number
): {
  events: BattleEvent[];
  attackerStacks: StackState[];
  defenderStacks: StackState[];
  roundEnded: boolean;
  winner: 'attacker' | 'defender' | null;
} {
  const events: BattleEvent[] = [];
  const round = battle.currentRound + 1;

  // Regenerate shields at start of each new round (except round 1)
  if (round > 1) {
    regenerateShields(battle.attackerStacks);
    regenerateShields(battle.defenderStacks);
    events.push({
      round,
      turn: 0,
      type: 'shield_regen',
      message: `Round ${round} - All shields regenerated to 100%`,
    });
  }

  // Get turn order by speed
  const turnOrder = getTurnOrder(battle.attackerStacks, battle.defenderStacks, rng);

  let turn = 0;
  for (const turnEntry of turnOrder) {
    turn++;

    const attackerStacks = turnEntry.side === 'attacker' ? battle.attackerStacks : battle.defenderStacks;
    const targetStacks = turnEntry.side === 'attacker' ? battle.defenderStacks : battle.attackerStacks;

    const attacker = attackerStacks.find(s => s.id === turnEntry.id);
    if (!attacker || attacker.status !== 'alive' || attacker.he3 <= 0) continue;

    const target = pickTarget(targetStacks, rng);
    if (!target) break;

    const result = executeAttack(attacker, target, round, turn, rng);
    events.push(...result.events);

    // Check if all defenders destroyed
    const allDefendersDead = battle.defenderStacks.every(s => s.status !== 'alive');
    const allAttackersDead = battle.attackerStacks.every(s => s.status !== 'alive');

    if (allDefendersDead || allAttackersDead) {
      if (allDefendersDead) {
        events.push({
          round,
          turn: turn + 1,
          type: 'battle_end',
          message: 'All defender stacks destroyed! Attacker wins!',
        });
        return {
          events,
          attackerStacks: battle.attackerStacks,
          defenderStacks: battle.defenderStacks,
          roundEnded: true,
          winner: 'attacker',
        };
      }
      if (allAttackersDead) {
        events.push({
          round,
          turn: turn + 1,
          type: 'battle_end',
          message: 'All attacker stacks destroyed! Defender wins!',
        });
        return {
          events,
          attackerStacks: battle.attackerStacks,
          defenderStacks: battle.defenderStacks,
          roundEnded: true,
          winner: 'defender',
        };
      }
    }
  }

  // Check if all remaining stacks are He3 depleted
  const attackerAlive = battle.attackerStacks.filter(s => s.status === 'alive');
  const defenderAlive = battle.defenderStacks.filter(s => s.status === 'alive');
  const allAttackerNoHe3 = attackerAlive.length > 0 && attackerAlive.every(s => s.he3 <= 0);
  const allDefenderNoHe3 = defenderAlive.length > 0 && defenderAlive.every(s => s.he3 <= 0);

  if (allAttackerNoHe3 && allDefenderNoHe3) {
    events.push({
      round,
      turn: turn + 1,
      type: 'he3_exhausted',
      message: 'All stacks depleted of He3. Battle ends in stalemate!',
    });
    return {
      events,
      attackerStacks: battle.attackerStacks,
      defenderStacks: battle.defenderStacks,
      roundEnded: true,
      winner: null,
    };
  }

  return {
    events,
    attackerStacks: battle.attackerStacks,
    defenderStacks: battle.defenderStacks,
    roundEnded: round >= battle.maxRounds,
    winner: null,
  };
}

/**
 * Calculate permanent losses by comparing initial vs final stack states.
 */
function calculateLosses(
  initialAttacker: StackState[],
  initialDefender: StackState[],
  finalAttacker: StackState[],
  finalDefender: StackState[]
): FleetLoss[] {
  const losses: FleetLoss[] = [];

  for (let i = 0; i < initialAttacker.length; i++) {
    const lost = initialAttacker[i].shipCount - finalAttacker[i].shipCount;
    if (lost > 0) {
      losses.push({
        userId: initialAttacker[i].userId,
        shipType: initialAttacker[i].shipType,
        shipsLost: lost,
      });
    }
  }

  for (let i = 0; i < initialDefender.length; i++) {
    const lost = initialDefender[i].shipCount - finalDefender[i].shipCount;
    if (lost > 0) {
      losses.push({
        userId: initialDefender[i].userId,
        shipType: initialDefender[i].shipType,
        shipsLost: lost,
      });
    }
  }

  return losses;
}

/**
 * Serialize stacks for API response (deep copy to avoid mutation).
 */
function cloneStacks(stacks: StackState[]): StackState[] {
  return JSON.parse(JSON.stringify(stacks));
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array(),
      },
    });
    return;
  }
  next();
};

// ============================================================
// ROUTER
// ============================================================

const router = Router();

/**
 * POST /api/v1/battles/initiate
 * Iniciar una batalla PvP real. Requiere autenticacion.
 *
 * Request:  { attackerId, defenderId, attackerFleet, defenderFleet, battleType }
 * Response: { battleId, status, rngSeed, maxRounds, attackerStacks, defenderStacks }
 */
router.post(
  '/initiate',
  authMiddleware,
  rateLimitMiddleware.general,
  [
    body('attackerId').isString().notEmpty().withMessage('attackerId is required'),
    body('defenderId').isString().notEmpty().withMessage('defenderId is required'),
    body('attackerFleet').isObject().withMessage('attackerFleet must be an object'),
    body('defenderFleet').isObject().withMessage('defenderFleet must be an object'),
    body('battleType').isIn(['pvp', 'pve']).withMessage('battleType must be pvp or pve'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: Response) => {
    const { attackerId, defenderId, attackerFleet, defenderFleet, battleType } = req.body;
    const requestingUserId = req.user?.userId;

    // Verify attacker is the requesting user
    if (requestingUserId !== attackerId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only initiate battles as attacker' },
      });
      return;
    }

    // Validate fleets
    const attackerValidation = validateFleetInput(attackerFleet, 'attacker');
    if (attackerValidation) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FLEET', message: attackerValidation },
      });
      return;
    }

    const defenderValidation = validateFleetInput(defenderFleet, 'defender');
    if (defenderValidation) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FLEET', message: defenderValidation },
      });
      return;
    }

    const battleId = uuidv4();
    const rngSeed = generateRngSeed(attackerId, defenderId);

    const attackerStacks = fleetToStacks(attackerFleet, true);
    const defenderStacks = fleetToStacks(defenderFleet, false);

    const stackInfoFromState = (s: StackState): StackInfo => ({
      id: s.id,
      userId: s.userId,
      position: s.position,
      commanderName: s.commanderName,
      shipType: s.shipType,
      shipCount: s.shipCount,
      speed: s.speed,
      maxHull: s.maxHull,
      maxShield: s.maxShield,
      he3: s.he3,
    });

    const battle: StoredBattle = {
      battleId,
      status: 'active',
      rngSeed,
      maxRounds: 20,
      currentRound: 0,
      battleType,
      attackerId,
      defenderId,
      attackerStacks: cloneStacks(attackerStacks),
      defenderStacks: cloneStacks(defenderStacks),
      events: [],
      winner: null,
      losses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    battleStore.set(battleId, battle);

    logger.info('Battle initiated', {
      battleId,
      attackerId,
      defenderId,
      battleType,
      rngSeed,
      attackerSlots: attackerStacks.length,
      defenderSlots: defenderStacks.length,
    });

    res.status(201).json({
      success: true,
      data: {
        battleId,
        status: 'initiated' as const,
        rngSeed,
        maxRounds: 20,
        attackerStacks: attackerStacks.map(stackInfoFromState),
        defenderStacks: defenderStacks.map(stackInfoFromState),
      },
    });
  })
);

/**
 * POST /api/v1/battles/:battleId/simulate-round
 * Simular UNA ronda. El frontend llama esto 20 veces.
 * Requiere autenticacion para battles reales.
 */
router.post(
  '/:battleId/simulate-round',
  authMiddleware,
  rateLimitMiddleware.general,
  [
    param('battleId').isUUID().withMessage('Invalid battleId format'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: Response) => {
    const { battleId } = req.params;
    const battle = battleStore.get(battleId);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: { code: 'BATTLE_NOT_FOUND', message: 'Battle not found' },
      });
      return;
    }

    if (battle.status === 'completed') {
      res.status(409).json({
        success: false,
        error: { code: 'BATTLE_COMPLETED', message: 'Battle is already completed' },
      });
      return;
    }

    // Verify requesting user is a participant
    const requestingUserId = req.user?.userId;
    if (requestingUserId !== battle.attackerId && requestingUserId !== battle.defenderId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a participant in this battle' },
      });
      return;
    }

    // Create RNG from seed + current round offset for determinism
    const rng = createRng(battle.rngSeed + battle.currentRound);

    const result = simulateRound(battle, rng);
    battle.currentRound++;
    battle.events.push(result.events);

    // Build combined stack states
    const stackStates: StackState[] = [
      ...cloneStacks(result.attackerStacks),
      ...cloneStacks(result.defenderStacks),
    ];

    let battleEnded = false;
    let winner: 'attacker' | 'defender' | null = null;

    if (result.winner) {
      battle.status = 'completed';
      battle.winner = result.winner;
      battleEnded = true;
      winner = result.winner;

      // Calculate losses for PvP
      if (battle.battleType === 'pvp') {
        // We need initial stacks to calculate losses - clone current as proxy
        // In production, fetch initial state from DB
        battle.losses = []; // Calculated on final endpoint
      }

      logger.info('Battle ended', { battleId, winner, totalRounds: battle.currentRound });
    } else if (battle.currentRound >= battle.maxRounds) {
      battle.status = 'completed';
      battle.winner = 'timeout';
      battleEnded = true;
      winner = null;

      logger.info('Battle timed out', { battleId, totalRounds: battle.currentRound });
    }

    battle.updatedAt = new Date();
    battleStore.set(battleId, battle);

    res.json({
      success: true,
      data: {
        round: battle.currentRound,
        events: result.events,
        stackStates,
        roundEnded: result.roundEnded || battleEnded,
        battleEnded,
        winner,
      },
    });
  })
);

/**
 * POST /api/v1/battles/:battleId/simulate-full
 * Simular batalla COMPLETA de una vez (para replay rapido).
 * Requiere autenticacion para battles reales.
 */
router.post(
  '/:battleId/simulate-full',
  authMiddleware,
  rateLimitMiddleware.general,
  [
    param('battleId').isUUID().withMessage('Invalid battleId format'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: Response) => {
    const { battleId } = req.params;
    const battle = battleStore.get(battleId);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: { code: 'BATTLE_NOT_FOUND', message: 'Battle not found' },
      });
      return;
    }

    // Verify requesting user is a participant
    const requestingUserId = req.user?.userId;
    if (requestingUserId !== battle.attackerId && requestingUserId !== battle.defenderId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a participant in this battle' },
      });
      return;
    }

    // Save initial state for loss calculation
    const initialAttacker = cloneStacks(battle.attackerStacks);
    const initialDefender = cloneStacks(battle.defenderStacks);

    const allEvents: BattleEvent[][] = [...battle.events];

    // Simulate remaining rounds
    while (battle.status === 'active' && battle.currentRound < battle.maxRounds) {
      const rng = createRng(battle.rngSeed + battle.currentRound);
      const roundResult = simulateRound(battle, rng);

      battle.currentRound++;
      allEvents.push(roundResult.events);

      if (roundResult.winner) {
        battle.status = 'completed';
        battle.winner = roundResult.winner;
        break;
      }

      if (battle.currentRound >= battle.maxRounds) {
        battle.status = 'completed';
        battle.winner = 'timeout';
        break;
      }
    }

    battle.events = allEvents;

    // Calculate permanent losses for PvP
    let losses: FleetLoss[] = [];
    if (battle.battleType === 'pvp') {
      losses = calculateLosses(initialAttacker, initialDefender, battle.attackerStacks, battle.defenderStacks);
      battle.losses = losses;
    }

    const finalStackStates = [
      ...cloneStacks(battle.attackerStacks),
      ...cloneStacks(battle.defenderStacks),
    ];

    battle.updatedAt = new Date();
    battleStore.set(battleId, battle);

    logger.info('Battle fully simulated', {
      battleId,
      totalRounds: battle.currentRound,
      winner: battle.winner,
    });

    res.json({
      success: true,
      data: {
        battleId,
        totalRounds: battle.currentRound,
        winner: battle.winner,
        allEvents,
        finalStackStates,
        losses,
      },
    });
  })
);

/**
 * GET /api/v1/battles/:battleId
 * Obtener estado actual de batalla.
 * Requiere autenticacion.
 */
router.get(
  '/:battleId',
  authMiddleware,
  rateLimitMiddleware.general,
  [
    param('battleId').isUUID().withMessage('Invalid battleId format'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: Response) => {
    const { battleId } = req.params;
    const battle = battleStore.get(battleId);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: { code: 'BATTLE_NOT_FOUND', message: 'Battle not found' },
      });
      return;
    }

    // Verify requesting user is a participant
    const requestingUserId = req.user?.userId;
    if (requestingUserId !== battle.attackerId && requestingUserId !== battle.defenderId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a participant in this battle' },
      });
      return;
    }

    const stacks = [
      ...cloneStacks(battle.attackerStacks),
      ...cloneStacks(battle.defenderStacks),
    ];

    res.json({
      success: true,
      data: {
        battleId: battle.battleId,
        status: battle.status,
        currentRound: battle.currentRound,
        maxRounds: battle.maxRounds,
        battleType: battle.battleType,
        attacker: {
          userId: battle.attackerId,
          username: 'Attacker', // In production: fetch from DB
          fleetPower: battle.attackerStacks.reduce((s, st) => s + st.maxHull + st.maxShield, 0),
          totalShips: battle.attackerStacks.reduce((s, st) => s + st.shipCount, 0),
          shipsDestroyed: battle.attackerStacks.filter(s => s.status === 'destroyed').length,
        },
        defender: {
          userId: battle.defenderId,
          username: 'Defender', // In production: fetch from DB
          fleetPower: battle.defenderStacks.reduce((s, st) => s + st.maxHull + st.maxShield, 0),
          totalShips: battle.defenderStacks.reduce((s, st) => s + st.shipCount, 0),
          shipsDestroyed: battle.defenderStacks.filter(s => s.status === 'destroyed').length,
        },
        stacks,
        winner: battle.winner,
      },
    });
  })
);

/**
 * GET /api/v1/battles/:battleId/events
 * Obtener todos los eventos de la batalla. Filtro opcional por ronda (?round=3).
 * Requiere autenticacion.
 */
router.get(
  '/:battleId/events',
  authMiddleware,
  rateLimitMiddleware.general,
  [
    param('battleId').isUUID().withMessage('Invalid battleId format'),
    query('round').optional().isInt({ min: 1, max: 20 }).withMessage('Round must be 1-20'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: Response) => {
    const { battleId } = req.params;
    const roundFilter = req.query.round ? parseInt(req.query.round as string, 10) : undefined;
    const battle = battleStore.get(battleId);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: { code: 'BATTLE_NOT_FOUND', message: 'Battle not found' },
      });
      return;
    }

    const requestingUserId = req.user?.userId;
    if (requestingUserId !== battle.attackerId && requestingUserId !== battle.defenderId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a participant in this battle' },
      });
      return;
    }

    let events: BattleEvent[];
    if (roundFilter !== undefined) {
      events = battle.events[roundFilter - 1] ?? [];
    } else {
      events = battle.events.flat();
    }

    res.json({
      success: true,
      data: {
        battleId: battle.battleId,
        events,
        totalEvents: events.length,
        ...(roundFilter !== undefined && { filteredRound: roundFilter }),
      },
    });
  })
);

/**
 * GET /api/v1/battles/:battleId/replay
 * Obtener datos para reproducir la batalla.
 * Requiere autenticacion.
 */
router.get(
  '/:battleId/replay',
  authMiddleware,
  rateLimitMiddleware.general,
  [
    param('battleId').isUUID().withMessage('Invalid battleId format'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: any, res: Response) => {
    const { battleId } = req.params;
    const battle = battleStore.get(battleId);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: { code: 'BATTLE_NOT_FOUND', message: 'Battle not found' },
      });
      return;
    }

    const requestingUserId = req.user?.userId;
    if (requestingUserId !== battle.attackerId && requestingUserId !== battle.defenderId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a participant in this battle' },
      });
      return;
    }

    const initialState: BattleState = {
      battleId: battle.battleId,
      rngSeed: battle.rngSeed,
      currentRound: 0,
      maxRounds: battle.maxRounds,
      attacker: {
        userId: battle.attackerId,
        username: 'Attacker',
        fleetPower: battle.attackerStacks.reduce((s, st) => s + st.maxHull + st.maxShield, 0),
        totalShips: battle.attackerStacks.reduce((s, st) => s + st.shipCount, 0),
        shipsDestroyed: 0,
      },
      defender: {
        userId: battle.defenderId,
        username: 'Defender',
        fleetPower: battle.defenderStacks.reduce((s, st) => s + st.maxHull + st.maxShield, 0),
        totalShips: battle.defenderStacks.reduce((s, st) => s + st.shipCount, 0),
        shipsDestroyed: 0,
      },
      attackerStacks: cloneStacks(battle.attackerStacks),
      defenderStacks: cloneStacks(battle.defenderStacks),
      events: [],
    };

    const finalResult: BattleResult = {
      winner: battle.winner,
      totalRounds: battle.currentRound,
      endedAt: battle.updatedAt.toISOString(),
      attackerLosses: battle.losses.filter(l => l.userId === battle.attackerId),
      defenderLosses: battle.losses.filter(l => l.userId === battle.defenderId),
    };

    res.json({
      success: true,
      data: {
        battleId: battle.battleId,
        rngSeed: battle.rngSeed,
        initialState,
        events: battle.events,
        finalResult,
      },
    });
  })
);

// ============================================================
// DEV SIMULATOR (No auth required)
// ============================================================

/**
 * POST /api/v1/battles/dev-simulate
 * Simulador interno/dev. NO afecta flotas reales. NO requiere autenticacion.
 *
 * Request: { attackerFleet, defenderFleet, rounds? }
 * Response: same format as simulate-full
 */
router.post(
  '/dev-simulate',
  rateLimitMiddleware.general,
  [
    body('attackerFleet').isObject().withMessage('attackerFleet is required'),
    body('defenderFleet').isObject().withMessage('defenderFleet is required'),
    body('rounds').optional().isInt({ min: 1, max: 100 }).withMessage('rounds must be 1-100'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { attackerFleet, defenderFleet, rounds = 20 } = req.body;

    // Validate fleets
    const attackerValidation = validateFleetInput(attackerFleet, 'attacker');
    if (attackerValidation) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FLEET', message: attackerValidation },
      });
      return;
    }

    const defenderValidation = validateFleetInput(defenderFleet, 'defender');
    if (defenderValidation) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FLEET', message: defenderValidation },
      });
      return;
    }

    const battleId = `dev_${uuidv4()}`;
    const rngSeed = Math.floor(Math.random() * 2147483646) + 1;

    const attackerStacks = fleetToStacks(attackerFleet, true);
    const defenderStacks = fleetToStacks(defenderFleet, false);

    const initialAttacker = cloneStacks(attackerStacks);
    const initialDefender = cloneStacks(defenderStacks);

    // Create temporary battle object
    const battle: StoredBattle = {
      battleId,
      status: 'active',
      rngSeed,
      maxRounds: rounds,
      currentRound: 0,
      battleType: 'pve', // Dev sim doesn't cause real losses
      attackerId: attackerFleet.userId,
      defenderId: defenderFleet.userId,
      attackerStacks: cloneStacks(attackerStacks),
      defenderStacks: cloneStacks(defenderStacks),
      events: [],
      winner: null,
      losses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const allEvents: BattleEvent[][] = [];

    // Simulate all rounds
    while (battle.currentRound < battle.maxRounds) {
      const rng = createRng(battle.rngSeed + battle.currentRound);
      const roundResult = simulateRound(battle, rng);

      battle.currentRound++;
      allEvents.push(roundResult.events);

      if (roundResult.winner) {
        battle.winner = roundResult.winner;
        break;
      }

      if (battle.currentRound >= battle.maxRounds) {
        battle.winner = 'timeout';
        break;
      }
    }

    battle.status = 'completed';

    // Calculate losses (for display only, not applied)
    const losses = calculateLosses(initialAttacker, initialDefender, battle.attackerStacks, battle.defenderStacks);

    const finalStackStates = [
      ...cloneStacks(battle.attackerStacks),
      ...cloneStacks(battle.defenderStacks),
    ];

    logger.info('Dev battle simulated', {
      battleId,
      totalRounds: battle.currentRound,
      winner: battle.winner,
      maxRounds: rounds,
    });

    res.json({
      success: true,
      data: {
        battleId,
        totalRounds: battle.currentRound,
        winner: battle.winner,
        allEvents,
        finalStackStates,
        losses,
      },
    });
  })
);

export default router;
