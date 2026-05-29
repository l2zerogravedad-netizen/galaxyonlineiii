/**
 * =======================================================================
 * Galaxy Online 3 -- Shield System
 * =======================================================================
 * Gestiona escudos, casco, regeneracion, y destruccion de naves.
 *
 * Formulas:
 *   - Shield absorbs damage 1:1 (hasta depletion)
 *   - Hull damage cuando shield = 0
 *   - Naves destruidas: damage / (hullPoints * stability)
 *   - Shield regeneration: 3-5% por ronda (configurable)
 *   - EOS: 30% chance de absorber x2 (Extra Overloading Shield)
 *   - PPC: Particle Protection Cannon intercepta misiles
 *
 * @module battle/engine/ShieldSystem
 * =======================================================================
 */

import type {
  ShipStack,
  ShipType,
  ArmorType,
  BattleEvent,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/** HP base por tipo de nave */
const BASE_HULL: Record<ShipType, number> = {
  frigate: 180,
  cruiser: 600,
  battleship: 800,
};

/** Shield base por tipo de nave */
const BASE_SHIELD: Record<ShipType, number> = {
  frigate: 60,
  cruiser: 200,
  battleship: 270,
};

/** Estabilidad base por tipo de nave (factor de supervivencia) */
const BASE_STABILITY: Record<ShipType, number> = {
  frigate: 0.5,
  cruiser: 1.0,
  battleship: 1.5,
};

/** He3 base por tipo de nave */
const BASE_HE3: Record<ShipType, number> = {
  frigate: 20,
  cruiser: 40,
  battleship: 60,
};

/** Porcentaje de regeneracion de escudo por ronda (3-5%) */
const SHIELD_REGEN_PERCENT = 0.04; // 4% base

// ============================================================================
// SHIELD REGENERATION
// ============================================================================

/**
 * Regenera el escudo de un stack al inicio de cada ronda.
 * El escudo regenera un porcentaje del maximo por ronda.
 *
 * @param stack - Stack a regenerar
 * @returns Stack con escudo regenerado
 */
export function regenerateShield(stack: ShipStack): ShipStack {
  const maxShield = stack.shieldPoints * stack.currentShips;
  if (maxShield <= 0) return stack;

  const regenAmount = Math.floor(maxShield * SHIELD_REGEN_PERCENT);
  const newShield = Math.min(maxShield, stack.totalShield + regenAmount);

  return {
    ...stack,
    totalShield: newShield,
  };
}

/**
 * Regenera escudos de todos los stacks vivos.
 */
export function regenerateAllShields(stacks: ShipStack[]): ShipStack[] {
  return stacks.map((s) => {
    if (s.currentShips <= 0) return s;
    return regenerateShield(s);
  });
}

// ============================================================================
// SHIELD DAMAGE
// ============================================================================

/**
 * Aplica daño a los escudos de un stack.
 * Los escudos absorben daño 1:1 hasta agotarse.
 *
 * @param stack - Stack objetivo
 * @param damage - Daño a aplicar
 * @returns Stack actualizado y overflow de daño al casco
 */
export function applyShieldDamage(
  stack: ShipStack,
  damage: number
): { stack: ShipStack; overflow: number; events: BattleEvent[] } {
  const events: BattleEvent[] = [];

  if (damage <= 0 || stack.currentShips <= 0) {
    return { stack, overflow: 0, events };
  }

  const currentShield = stack.totalShield;

  if (currentShield <= 0) {
    // Sin escudo, todo va al casco
    return { stack, overflow: damage, events };
  }

  const absorbed = Math.min(currentShield, damage);
  const newShield = currentShield - absorbed;
  const overflow = damage - absorbed;

  events.push({
    type: 'SHIELD_HIT',
    targetId: stack.id,
    absorbed,
    remaining: newShield,
  });

  if (newShield <= 0) {
    events.push({
      type: 'SHIELD_DEPLETED',
      targetId: stack.id,
    });
  }

  return {
    stack: {
      ...stack,
      totalShield: newShield,
    },
    overflow,
    events,
  };
}

// ============================================================================
// HULL DAMAGE
// ============================================================================

/**
 * Aplica daño al casco de un stack, destruyendo naves según corresponda.
 *
 * Formula:
 *   damagePerShip = hullPoints * stability
 *   shipsLost = floor(damage / damagePerShip)
 *   remainingDamage = damage % damagePerShip
 *
 * @param stack - Stack objetivo
 * @param damage - Daño al casco (después de escudos)
 * @returns Stack actualizado con naves destruidas
 */
export function applyHullDamage(
  stack: ShipStack,
  damage: number
): { stack: ShipStack; events: BattleEvent[] } {
  const events: BattleEvent[] = [];

  if (damage <= 0 || stack.currentShips <= 0) {
    return { stack, events };
  }

  const damagePerShip = stack.hullPoints * stack.stability;
  const shipsLost =
    damagePerShip > 0 ? Math.floor(damage / damagePerShip) : 0;

  const newShips = Math.max(0, stack.currentShips - shipsLost);
  const remainingDamage = damage % damagePerShip;

  // Ajustar totalShield proporcionalmente a las naves perdidas
  const shieldPerShip = stack.shieldPoints;
  const newTotalShield = Math.min(
    newShips * shieldPerShip,
    stack.totalShield
  );

  if (shipsLost > 0) {
    events.push({
      type: 'SHIPS_DESTROYED',
      stackId: stack.id,
      count: shipsLost,
    });
  }

  events.push({
    type: 'HULL_DAMAGE',
    targetId: stack.id,
    damage,
    shipsLost,
  });

  if (newShips <= 0) {
    events.push({
      type: 'STACK_DESTROYED',
      stackId: stack.id,
    });
  }

  return {
    stack: {
      ...stack,
      currentShips: newShips,
      currentHull:
        newShips > 0
          ? stack.hullPoints - remainingDamage / newShips
          : 0,
      totalShield: newTotalShield,
    },
    events,
  };
}

// ============================================================================
// EOS (Extra Overloading Shield)
// ============================================================================

/**
 * Procesa el EOS (Extra Overloading Shield) de un stack.
 * 30% chance de absorber el doble de daño (shield absorbe 2:1).
 *
 * @param stack - Stack defensor
 * @param incomingDamage - Daño al casco entrante
 * @returns Daño ajustado y si EOS se activó
 */
export function processEOS(
  stack: ShipStack,
  incomingDamage: number
): { adjustedDamage: number; triggered: boolean; absorbedExtra: number } {
  if (!stack.commander?.hasEOS || incomingDamage <= 0) {
    return {
      adjustedDamage: incomingDamage,
      triggered: false,
      absorbedExtra: 0,
    };
  }

  const chance = 0.30; // 30% base
  if (Math.random() < chance) {
    const multiplier = stack.commander.eosMultiplier ?? 2.0;
    // El shield absorbe mas, reduciendo el hull damage
    const absorbedExtra = Math.floor(incomingDamage * (multiplier - 1));
    const adjustedDamage = Math.max(0, incomingDamage - absorbedExtra);

    return {
      adjustedDamage,
      triggered: true,
      absorbedExtra,
    };
  }

  return {
    adjustedDamage: incomingDamage,
    triggered: false,
    absorbedExtra: 0,
  };
}

// ============================================================================
// PPC INTERCEPT (Particle Protection Cannon)
// ============================================================================

// NOTE: attemptPPCIntercept lives in WeaponSystem.ts (canonical GO2 implementation).
// The duplicate that used to be here was removed to avoid an export-name collision
// via the barrel (index.ts re-exports both modules).

// ============================================================================
// STACK UTILITIES
// ============================================================================

/**
 * Verifica si un stack sigue vivo (tiene naves).
 */
export function isStackAlive(stack: ShipStack): boolean {
  return stack.currentShips > 0;
}

/**
 * Cuenta stacks vivos en un array.
 */
export function countAliveStacks(stacks: ShipStack[]): number {
  return stacks.filter(isStackAlive).length;
}

/**
 * Verifica condicion de derrota (0 stacks vivos).
 */
export function checkDefeat(stacks: ShipStack[]): boolean {
  return countAliveStacks(stacks) === 0;
}

/**
 * Crea un ShipStack con valores por defecto segun el tipo.
 */
export function createShipStack(partial: {
  id: string;
  shipType: ShipType;
  totalShips: number;
  position: number;
  faction: 'attacker' | 'defender';
  hullPoints?: number;
  shieldPoints?: number;
  stability?: number;
  weapons?: ShipStack['weapons'];
  commander?: ShipStack['commander'];
  he3?: number;
  movement?: number;
  damageNegation?: number;
  hullNegation?: number;
  ppcCount?: number;
  armorType?: ArmorType;
}): ShipStack {
  const shipType = partial.shipType;
  const totalShips = partial.totalShips;
  const hullPoints = partial.hullPoints ?? BASE_HULL[shipType];
  const shieldPoints = partial.shieldPoints ?? BASE_SHIELD[shipType];
  const stability = partial.stability ?? BASE_STABILITY[shipType];
  const he3 = partial.he3 ?? BASE_HE3[shipType];
  const damageNegation = partial.damageNegation ?? 0;
  const hullNegation = partial.hullNegation ?? 0;

  return {
    ...partial,
    hullPoints,
    shieldPoints,
    stability,
    he3,
    damageNegation,
    hullNegation,
    currentShips: totalShips,
    currentHull: hullPoints,
    totalShield: shieldPoints * totalShips,
    totalHull: hullPoints * totalShips,
    movement: partial.movement ?? (shipType === 'frigate' ? 2 : 1),
    weapons: partial.weapons ?? [],
    weaponCooldowns: new Map(),
    ppcCount: partial.ppcCount ?? 0,
    armorType: partial.armorType ?? 'regen',
    // --- Skills activas: inicializar vacio ---
    activeSkillStates: [],
  };
}
