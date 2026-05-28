/**
 * ========================================================================
 * Galaxy Online 3 — Shield & Hull System
 * ========================================================================
 * Gestiona escudos (regeneran entre rondas) y casco (daño permanente).
 * Incluye regeneración de escudos, cálculo de supervivencia, y
 * destrucción de naves.
 *
 * Reglas GO2:
 *   - Escudos regeneran 100% al inicio de cada ronda
 *   - Casco NO regenera — daño permanente
 *   - La destrucción se calcula: floor(hullDamage / (hullPoints * stability))
 *
 * @module battle/engine/ShieldSystem
 * ========================================================================
 */

import type { ShipStack, ShipType, BattleEvent } from './types';

// ============================================================================
// SHIELD REGENERATION
// ============================================================================

/**
 * Regenera los escudos de un stack al 100%.
 * Se llama en la fase ROUND_START de cada ronda.
 *
 * @param stack - Stack de naves
 * @returns Stack con escudos regenerados
 */
export function regenerateShields(stack: ShipStack): ShipStack {
  const totalShield = stack.shieldPoints * stack.currentShips;
  return {
    ...stack,
    totalShield,
  };
}

/**
 * Regenera escudos de todos los stacks vivos.
 */
export function regenerateAllShields(stacks: ShipStack[]): ShipStack[] {
  return stacks.map((s) => (s.currentShips > 0 ? regenerateShields(s) : s));
}

// ============================================================================
// HULL DAMAGE APPLICATION
// ============================================================================

/**
 * Aplica daño al casco de un stack y calcula naves destruidas.
 *
 * Fórmula de destrucción:
 *   shipsDestroyed = floor(hullDamage / (hullPoints * stability))
 *
 * @param stack - Stack de naves a dañar
 * @param hullDamage - Daño total al casco
 * @returns Stack actualizado y número de naves destruidas
 */
export function applyHullDamage(
  stack: ShipStack,
  hullDamage: number
): { stack: ShipStack; shipsDestroyed: number; events: BattleEvent[] } {
  const events: BattleEvent[] = [];

  if (hullDamage <= 0 || stack.currentShips <= 0) {
    return { stack, shipsDestroyed: 0, events };
  }

  // Calcular cuántas naves se destruyen
  const damagePerShip = stack.hullPoints * stack.stability;
  const shipsDestroyed = Math.min(
    stack.currentShips,
    Math.floor(hullDamage / damagePerShip)
  );

  // HP total restante
  const totalHullBefore = stack.currentHull * stack.currentShips;
  const totalHullAfter = Math.max(0, totalHullBefore - hullDamage);
  const remainingShips = stack.currentShips - shipsDestroyed;

  let currentHull = remainingShips > 0 ? totalHullAfter / remainingShips : 0;
  currentHull = Math.min(stack.hullPoints, Math.max(0, currentHull));

  const newStack: ShipStack = {
    ...stack,
    currentShips: remainingShips,
    currentHull,
    totalHull: currentHull * remainingShips,
    // Recalcular shield total
    totalShield: stack.shieldPoints * remainingShips,
  };

  if (hullDamage > 0) {
    events.push({
      type: 'HULL_DAMAGE',
      targetId: stack.id,
      damage: hullDamage,
      shipsLost: shipsDestroyed,
    });
  }

  if (shipsDestroyed > 0) {
    events.push({
      type: 'SHIPS_DESTROYED',
      stackId: stack.id,
      count: shipsDestroyed,
    });
  }

  if (remainingShips <= 0) {
    events.push({
      type: 'STACK_DESTROYED',
      stackId: stack.id,
    });
  }

  return { stack: newStack, shipsDestroyed, events };
}

// ============================================================================
// SHIELD DAMAGE APPLICATION
// ============================================================================

/**
 * Aplica daño a los escudos de un stack.
 * Si los escudos llegan a 0, el excedente pasa al casco.
 *
 * @param stack - Stack de naves
 * @param damage - Daño a aplicar
 * @returns Stack actualizado, daño absorbido por escudo, y overflow al casco
 */
export function applyShieldDamage(
  stack: ShipStack,
  damage: number
): {
  stack: ShipStack;
  absorbed: number;
  overflow: number;
  depleted: boolean;
  events: BattleEvent[];
} {
  const events: BattleEvent[] = [];

  if (damage <= 0 || stack.currentShips <= 0) {
    return { stack, absorbed: 0, overflow: 0, depleted: false, events };
  }

  const currentShield = stack.totalShield;
  const absorbed = Math.min(currentShield, damage);
  const overflow = damage - absorbed;
  const remainingShield = currentShield - absorbed;
  const depleted = remainingShield <= 0;

  events.push({
    type: 'SHIELD_HIT',
    targetId: stack.id,
    absorbed,
    remaining: remainingShield,
  });

  if (depleted && currentShield > 0) {
    events.push({
      type: 'SHIELD_DEPLETED',
      targetId: stack.id,
    });
  }

  const newStack: ShipStack = {
    ...stack,
    totalShield: remainingShield,
  };

  return { stack: newStack, absorbed, overflow, depleted, events };
}

// ============================================================================
// COMBINED DAMAGE APPLICATION
// ============================================================================

/**
 * Aplica daño completo (escudo + casco) a un stack.
 * Primero consume escudos, luego lo sobrante va al casco.
 *
 * @param stack - Stack objetivo
 * @param totalDamage - Daño total a aplicar
 * @returns Stack actualizado y eventos generados
 */
export function applyDamage(
  stack: ShipStack,
  totalDamage: number
): { stack: ShipStack; events: BattleEvent[] } {
  const events: BattleEvent[] = [];

  if (totalDamage <= 0 || stack.currentShips <= 0) {
    return { stack, events };
  }

  // 1. Aplicar a escudos
  const shieldResult = applyShieldDamage(stack, totalDamage);
  events.push(...shieldResult.events);
  let currentStack = shieldResult.stack;

  // 2. Overflow al casco
  if (shieldResult.overflow > 0) {
    const hullResult = applyHullDamage(currentStack, shieldResult.overflow);
    events.push(...hullResult.events);
    currentStack = hullResult.stack;
  }

  return { stack: currentStack, events };
}

// ============================================================================
// STACK HELPERS
// ============================================================================

/**
 * Verifica si un stack sigue vivo.
 */
export function isStackAlive(stack: ShipStack): boolean {
  return stack.currentShips > 0;
}

/**
 * Cuenta stacks vivos de una facción.
 */
export function countAliveStacks(stacks: ShipStack[]): number {
  return stacks.filter(isStackAlive).length;
}

/**
 * Cuenta naves totales vivas de una facción.
 */
export function countTotalShips(stacks: ShipStack[]): number {
  return stacks.reduce((sum, s) => sum + s.currentShips, 0);
}

/**
 * Verifica si todos los stacks están destruidos.
 */
export function isFleetDestroyed(stacks: ShipStack[]): boolean {
  return countAliveStacks(stacks) === 0;
}

/**
 * Verifica si una facción ha perdido (todos sus stacks destruidos).
 */
export function checkDefeat(stacks: ShipStack[]): boolean {
  return isFleetDestroyed(stacks);
}

// ============================================================================
// EOS (EXTRA OVERLOADING SHIELD)
// ============================================================================

/**
 * Procesa el efecto EOS en un stack defensor.
 * 30% de probabilidad de que el escudo absorba el doble de daño.
 *
 * @param stack - Stack con EOS
 * @param incomingDamage - Daño entrante
 * @returns Daño ajustado y si se activó EOS
 */
export function processEOS(
  stack: ShipStack,
  incomingDamage: number
): { adjustedDamage: number; triggered: boolean; absorbedExtra: number } {
  const commander = stack.commander;
  if (!commander?.hasEOS || incomingDamage <= 0) {
    return { adjustedDamage: incomingDamage, triggered: false, absorbedExtra: 0 };
  }

  const triggerChance = 0.30;
  if (Math.random() >= triggerChance) {
    return { adjustedDamage: incomingDamage, triggered: false, absorbedExtra: 0 };
  }

  const multiplier = commander.eosMultiplier ?? 2.0;
  // El escudo absorbe "multiplier" veces más: el daño efectivo se reduce
  // porque el escudo tiene más capacidad efectiva
  const absorbedExtra = incomingDamage * (multiplier - 1);
  const adjustedDamage = Math.max(0, incomingDamage - absorbedExtra);

  return { adjustedDamage, triggered: true, absorbedExtra };
}

// ============================================================================
// SHIP CREATION HELPERS
// ============================================================================

/** HP base por tipo de nave */
const BASE_HULL: Record<ShipType, number> = {
  frigate: 400,
  cruiser: 800,
  battleship: 1500,
};

/** Shield base por tipo de nave */
const BASE_SHIELD: Record<ShipType, number> = {
  frigate: 200,
  cruiser: 500,
  battleship: 1000,
};

/** Estabilidad base por tipo de nave */
const BASE_STABILITY: Record<ShipType, number> = {
  frigate: 0.8,
  cruiser: 1.0,
  battleship: 1.5,
};

/** He3 base por tipo de nave */
const BASE_HE3: Record<ShipType, number> = {
  frigate: 200,
  cruiser: 400,
  battleship: 800,
};

/**
 * Crea un ShipStack con valores por defecto según el tipo.
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
}): ShipStack {
  const shipType = partial.shipType;
  const totalShips = partial.totalShips;
  const hullPoints = partial.hullPoints ?? BASE_HULL[shipType];
  const shieldPoints = partial.shieldPoints ?? BASE_SHIELD[shipType];
  const stability = partial.stability ?? BASE_STABILITY[shipType];
  const he3 = partial.he3 ?? BASE_HE3[shipType];

  return {
    ...partial,
    hullPoints,
    shieldPoints,
    stability,
    he3,
    currentShips: totalShips,
    currentHull: hullPoints,
    totalShield: shieldPoints * totalShips,
    totalHull: hullPoints * totalShips,
    movement: partial.movement ?? (shipType === 'frigate' ? 2 : 1),
    weapons: partial.weapons ?? [],
    weaponCooldowns: new Map(),
  };
}
