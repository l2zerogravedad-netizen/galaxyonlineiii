/**
 * ========================================================================
 * Galaxy Online 3 — Commander System
 * ========================================================================
 * Gestiona las estadísticas, effective stack bonus, y habilidades
 * especiales de los comandantes.
 *
 * @module battle/engine/CommanderSystem
 * ========================================================================
 */

import type {
  Commander,
  ShipStack,
  ShipType,
  BASE_EFFECTIVE_STACK,
} from './types';

// ============================================================================
// EFFECTIVE STACK
// ============================================================================

/** Effective stack base por tipo de nave */
const EFFECTIVE_STACK_BASE: Record<ShipType, number> = {
  frigate: 1100,
  cruiser: 1000,
  battleship: 900,
};

/**
 * Calcula el effective stack de un ShipStack.
 * El effective stack limita cuántas naves pueden participar en
 * cada ronda de ataque, incentivando tener comandantes fuertes.
 *
 * Fórmula: min(currentShips, base[shipType] + commanderBonus)
 *
 * @param stack - Stack de naves
 * @returns Número de naves efectivas para ataque
 */
export function getEffectiveStack(stack: ShipStack): number {
  const base = EFFECTIVE_STACK_BASE[stack.shipType];
  const commanderBonus = stack.commander?.effectiveStackBonus ?? 0;
  return Math.min(stack.currentShips, base + commanderBonus);
}

/**
 * Calcula el bonus al effective stack por estrellas del comandante.
 *
 * @param stars - Número de estrellas (1-5)
 * @returns Bonus adicional al effective stack
 */
export function getStackBonusByStars(stars: number): number {
  // Cada estrella otorga un bonus creciente
  const bonusTable: Record<number, number> = {
    1: 100,
    2: 250,
    3: 450,
    4: 700,
    5: 1000,
  };
  return bonusTable[Math.min(5, Math.max(1, stars))] ?? 0;
}

/**
 * Crea un comandante con valores calculados.
 */
export function createCommander(partial: {
  id: string;
  name: string;
  level?: number;
  stars: number;
  accuracy: number;
  speed: number;
  dodge: number;
  electron: number;
  hasEOS?: boolean;
  eosMultiplier?: number;
  specialAbility?: Commander['specialAbility'];
}): Commander {
  const stars = Math.min(5, Math.max(1, partial.stars));
  return {
    ...partial,
    level: partial.level ?? 1,
    stars,
    effectiveStackBonus: getStackBonusByStars(stars),
    hasEOS: partial.hasEOS ?? false,
    eosMultiplier: partial.eosMultiplier ?? 2.0,
  };
}

// ============================================================================
// INITIATIVE ORDER
// ============================================================================

/**
 * Ordena stacks por velocidad de comandante para determinar
 * el orden de ataque en la fase de iniciativa.
 * Mayor velocidad ataca primero. En empate, atacante gana.
 *
 * @param stacks - Todos los stacks participantes
 * @returns Array ordenado por velocidad descendente
 */
export function calculateInitiativeOrder(
  stacks: ShipStack[]
): Array<{ stackId: string; speed: number; faction: 'attacker' | 'defender'; commanderName: string }> {
  return stacks
    .filter((s) => s.currentShips > 0)
    .map((s) => ({
      stackId: s.id,
      speed: s.commander?.speed ?? 0,
      faction: s.faction,
      commanderName: s.commander?.name ?? 'Sin comandante',
    }))
    .sort((a, b) => {
      // Mayor velocidad primero
      if (b.speed !== a.speed) return b.speed - a.speed;
      // En empate, atacante tiene prioridad
      if (a.faction !== b.faction) {
        return a.faction === 'attacker' ? -1 : 1;
      }
      return 0;
    });
}

// ============================================================================
// STAT CALCULATIONS
// ============================================================================

/**
 * Calcula la precisión efectiva de un atacante contra un defensor.
 *
 * @param attacker - Comandante atacante
 * @param defender - Comandante defensor
 * @returns Precisión base ajustada
 */
export function calculateEffectiveAccuracy(
  attacker: Commander,
  defender: Commander
): number {
  return attacker.accuracy - defender.dodge * 0.5;
}

/**
 * Calcula la probabilidad de golpe crítico.
 *
 * @param commander - Comandante atacante
 * @returns Probabilidad [0, 1]
 */
export function calculateCritChance(commander: Commander): number {
  return Math.min(0.50, commander.electron / 200);
}

/**
 * Calcula el multiplicador de daño crítico.
 *
 * @param commander - Comandante atacante
 * @returns Multiplicador (ej: 1.5, 2.0)
 */
export function calculateCritMultiplier(commander: Commander): number {
  return 1.5 + commander.electron / 100;
}

/**
 * Calcula la evasión efectiva.
 *
 * @param commander - Comandante defensor
 * @returns Valor de dodge efectivo
 */
export function calculateEffectiveDodge(commander: Commander): number {
  return commander.dodge;
}

// ============================================================================
// ABILITY CHECKS
// ============================================================================

/**
 * Verifica si la habilidad especial del comandante se activa.
 *
 * @param commander - Comandante a verificar
 * @param triggerType - Tipo de evento que activa la habilidad
 * @returns true si la habilidad se activa
 */
export function checkAbilityTrigger(
  commander: Commander | undefined,
  triggerType: Commander['specialAbility'] extends { trigger: infer T } ? T : never
): boolean {
  if (!commander?.specialAbility) return false;
  if (commander.specialAbility.trigger !== triggerType) return false;
  const chance = commander.specialAbility.effect.procChance ?? 0.20;
  return Math.random() < chance;
}

// ============================================================================
// COMMANDER PRESETS
// ============================================================================

/** Preset: Comandante de ataque (alta precisión y electrón) */
export function createAttackCommander(
  name: string,
  stars: number = 3
): Commander {
  return createCommander({
    id: `cmd_atk_${name.toLowerCase().replace(/\s/g, '_')}`,
    name,
    stars,
    accuracy: 60 + stars * 8,
    speed: 40 + stars * 5,
    dodge: 30 + stars * 3,
    electron: 70 + stars * 6,
  });
}

/** Preset: Comandante defensivo (alta evasión y velocidad) */
export function createDefenseCommander(
  name: string,
  stars: number = 3
): Commander {
  return createCommander({
    id: `cmd_def_${name.toLowerCase().replace(/\s/g, '_')}`,
    name,
    stars,
    accuracy: 40 + stars * 5,
    speed: 60 + stars * 6,
    dodge: 70 + stars * 6,
    electron: 30 + stars * 3,
  });
}

/** Preset: Comandante equilibrado */
export function createBalancedCommander(
  name: string,
  stars: number = 3
): Commander {
  return createCommander({
    id: `cmd_bal_${name.toLowerCase().replace(/\s/g, '_')}`,
    name,
    stars,
    accuracy: 50 + stars * 5,
    speed: 50 + stars * 5,
    dodge: 50 + stars * 5,
    electron: 50 + stars * 5,
  });
}
