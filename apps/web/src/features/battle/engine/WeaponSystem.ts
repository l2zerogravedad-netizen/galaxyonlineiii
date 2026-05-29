/**
 * ========================================================================
 * Galaxy Online 3 — Weapon System
 * ========================================================================
 * Gestiona los 4 tipos de armas, sus estadísticas, cooldowns,
 * y la matriz de daño (armor type vs damage type).
 *
 * Armas GO2:
 *   - Ballistic:    Corto alcance, CD 0, scatter, bajo He3
 *   - Directional:  Medio alcance, CD 1, buena penetración
 *   - Missile:      Largo alcance, CD 2, interceptable
 *   - ShipBased:    Muy largo alcance, CD 4, alto He3, máximo daño
 *
 * @module battle/engine/WeaponSystem
 * ========================================================================
 */

import type {
  Weapon,
  WeaponType,
  DamageType,
  ArmorType,
  ShipStack,
} from './types';

// ============================================================================
// WEAPON TEMPLATES
// ============================================================================

/**
 * Crea una instancia de arma ballistic.
 * Rango corto [1,2], sin cooldown, scatter y baja penetración.
 */
export function createBallisticWeapon(
  minDamage: number = 50,
  maxDamage: number = 100
): Weapon {
  return {
    type: 'ballistic',
    damageType: 'kinetic',
    minDamage,
    maxDamage,
    range: [1, 2],
    cooldown: 0,
    he3Consumption: 5,
    scatterRange: 1,
    pierceChance: 0.10,
    interceptable: false,
  };
}

/**
 * Crea una instancia de arma directional (láser).
 * Rango medio [1,5], CD 1, buena penetración de escudo.
 */
export function createDirectionalWeapon(
  minDamage: number = 80,
  maxDamage: number = 150
): Weapon {
  return {
    type: 'directional',
    damageType: 'heat',
    minDamage,
    maxDamage,
    range: [1, 5],
    cooldown: 1,
    he3Consumption: 15,
    pierceChance: 0.20,
    interceptable: false,
  };
}

/**
 * Crea una instancia de arma missile.
 * Rango largo [4,8], CD 2, puede ser interceptado.
 */
export function createMissileWeapon(
  minDamage: number = 120,
  maxDamage: number = 200
): Weapon {
  return {
    type: 'missile',
    damageType: 'explosive',
    minDamage,
    maxDamage,
    range: [4, 8],
    cooldown: 2,
    he3Consumption: 20,
    pierceChance: 0.05,
    interceptable: true,
  };
}

/**
 * Crea una instancia de arma ship-based (cazas/bombarderos).
 * Rango muy largo [6,10], CD 4, alto He3, máximo daño.
 * NOTA: Cooldown cambiado de 3 a 4 (D04) para balance GO2.
 */
export function createShipBasedWeapon(
  minDamage: number = 200,
  maxDamage: number = 350
): Weapon {
  return {
    type: 'ship_based',
    damageType: 'magnetic',
    minDamage,
    maxDamage,
    range: [6, 10],
    cooldown: 4,  // D04: Corregido de 3 a 4 para balance GO2
    he3Consumption: 50,
    pierceChance: 0.15,
    interceptable: false,
  };
}

// ============================================================================
// ARMOR-DAMAGE MATRIX
// ============================================================================

/**
 * Matriz de multiplicadores de daño:
 * ArmorType (fila) vs DamageType (columna)
 *
 * Reglas GO2:
 *   - Regen:        Kinetic ×0.5, Heat ×2.0, resto ×1.0
 *   - Neutralizing: Heat ×0.5, Kinetic ×2.0, resto ×1.0
 *   - Nano:         Explosive ×0.5, Magnetic ×2.0, resto ×1.0
 *   - Chrome:       Magnetic ×0.5, Explosive ×2.0, resto ×1.0
 */
const DAMAGE_MATRIX: Record<ArmorType, Record<DamageType, number>> = {
  regen: {
    kinetic: 0.5,
    heat: 2.0,
    explosive: 1.0,
    magnetic: 1.0,
  },
  neutralizing: {
    heat: 0.5,
    kinetic: 2.0,
    explosive: 1.0,
    magnetic: 1.0,
  },
  nano: {
    explosive: 0.5,
    magnetic: 2.0,
    heat: 1.0,
    kinetic: 1.0,
  },
  chrome: {
    magnetic: 0.5,
    explosive: 2.0,
    heat: 1.0,
    kinetic: 1.0,
  },
};

/**
 * Obtiene el multiplicador de daño según el tipo de armadura y tipo de daño.
 *
 * @param armorType - Tipo de armadura del defensor
 * @param damageType - Tipo de daño del arma
 * @returns Multiplicador de daño (ej: 0.5, 1.0, 2.0)
 */
export function getArmorMultiplier(
  armorType: ArmorType,
  damageType: DamageType
): number {
  return DAMAGE_MATRIX[armorType]?.[damageType] ?? 1.0;
}

// ============================================================================
// WEAPON COOLDOWN MANAGEMENT
// ============================================================================

/**
 * Verifica si un arma está lista para disparar (cooldown == 0).
 */
export function isWeaponReady(stack: ShipStack, weapon: Weapon): boolean {
  const cd = stack.weaponCooldowns.get(weapon.type) ?? 0;
  return cd <= 0;
}

/**
 * Aplica cooldown a un arma después de disparar.
 */
export function applyWeaponCooldown(
  stack: ShipStack,
  weapon: Weapon
): ShipStack {
  const newCooldowns = new Map(stack.weaponCooldowns);
  newCooldowns.set(weapon.type, weapon.cooldown);
  return { ...stack, weaponCooldowns: newCooldowns };
}

/**
 * Reduce todos los cooldowns en 1 (llamar al final de cada ronda).
 */
export function decrementCooldowns(stack: ShipStack): ShipStack {
  const newCooldowns = new Map<WeaponType, number>();
  for (const [type, cd] of stack.weaponCooldowns.entries()) {
    const newCd = Math.max(0, cd - 1);
    if (newCd > 0) {
      newCooldowns.set(type, newCd);
    }
  }
  return { ...stack, weaponCooldowns: newCooldowns };
}

// ============================================================================
// WEAPON AVAILABILITY
// ============================================================================

/**
 * Obtiene todas las armas listas para disparar de un stack.
 * Filtra por cooldown == 0 y suficiente He3.
 */
export function getAvailableWeapons(stack: ShipStack): Weapon[] {
  return stack.weapons.filter((w) => {
    const cd = stack.weaponCooldowns.get(w.type) ?? 0;
    return cd <= 0 && stack.he3 >= w.he3Consumption;
  });
}

/**
 * Verifica si el stack tiene algún arma disponible para disparar.
 */
export function hasWeaponsReady(stack: ShipStack): boolean {
  return getAvailableWeapons(stack).length > 0;
}

/**
 * Verifica si el stack tiene He3 suficiente para al menos un arma.
 */
export function hasHe3ForWeapons(stack: ShipStack): boolean {
  return stack.weapons.some((w) => stack.he3 >= w.he3Consumption);
}

// ============================================================================
// RANGE & TARGETING
// ============================================================================

/**
 * Calcula la distancia entre dos posiciones en el grid.
 */
export function calculateDistance(posA: number, posB: number): number {
  return Math.abs(posA - posB);
}

/**
 * Verifica si un objetivo está dentro del rango de movement del atacante.
 * D05: Naves con menos movement no pueden alcanzar objetivos lejanos.
 */
export function isInMovementRange(
  attacker: ShipStack,
  target: ShipStack
): boolean {
  const distance = calculateDistance(attacker.position, target.position);
  return distance <= attacker.movement;
}

/**
 * Verifica si un objetivo está dentro del rango de un arma.
 *
 * @param attackerPos - Posición del atacante (1-24)
 * @param defenderPos - Posición del defensor (1-24)
 * @param weaponRange - Rango [min, max] del arma
 */
export function isInRange(
  attackerPos: number,
  defenderPos: number,
  weaponRange: [number, number]
): boolean {
  const distance = Math.abs(attackerPos - defenderPos);
  const [minRange, maxRange] = weaponRange;
  return distance >= minRange && distance <= maxRange;
}

/**
 * Encuentra objetivos válidos para un arma dentro del rango.
 * D05: Ahora también verifica que el objetivo está en rango de movement.
 */
export function findValidTargets(
  attacker: ShipStack,
  enemies: ShipStack[],
  weapon: Weapon
): ShipStack[] {
  return enemies.filter(
    (target) =>
      target.currentShips > 0 &&
      isInRange(attacker.position, target.position, weapon.range) &&
      isInMovementRange(attacker, target)
  );
}

/**
 * Selecciona el objetivo con menor vida total (estrategia por defecto).
 */
export function selectWeakestTarget(targets: ShipStack[]): ShipStack | null {
  if (targets.length === 0) return null;
  return targets.reduce((weakest, t) =>
    t.totalHull < weakest.totalHull ? t : weakest
  );
}

// ============================================================================
// HE3 MANAGEMENT
// ============================================================================

/**
 * Consume He3 del stack. Retorna el stack actualizado y la cantidad consumida.
 */
export function consumeHe3(
  stack: ShipStack,
  amount: number
): { stack: ShipStack; consumed: number; depleted: boolean } {
  const available = stack.he3;
  const consumed = Math.min(available, amount);
  const remaining = available - consumed;
  const depleted = remaining <= 0;
  return {
    stack: { ...stack, he3: Math.max(0, remaining) },
    consumed,
    depleted,
  };
}

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Crea un set de armas estándar según el tipo de nave.
 */
export function getDefaultWeaponsForShipType(shipType: ShipType): Weapon[] {
  switch (shipType) {
    case 'frigate':
      return [createBallisticWeapon(40, 80), createBallisticWeapon(40, 80)];
    case 'cruiser':
      return [
        createDirectionalWeapon(70, 130),
        createDirectionalWeapon(70, 130),
      ];
    case 'battleship':
      return [
        createMissileWeapon(100, 180),
        createShipBasedWeapon(180, 320),
      ];
    default:
      return [createBallisticWeapon()];
  }
}

/**
 * Factory: crea un Weapon por tipo.
 */
export function createWeapon(
  type: WeaponType,
  minDamage?: number,
  maxDamage?: number
): Weapon {
  switch (type) {
    case 'ballistic':
      return createBallisticWeapon(minDamage, maxDamage);
    case 'directional':
      return createDirectionalWeapon(minDamage, maxDamage);
    case 'missile':
      return createMissileWeapon(minDamage, maxDamage);
    case 'ship_based':
      return createShipBasedWeapon(minDamage, maxDamage);
    default:
      // Exhaustive check
      const _exhaustive: never = type;
      throw new Error(`Unknown weapon type: ${_exhaustive}`);
  }
}

// ============================================================================
// INTERCEPT
// ============================================================================

/**
 * Verifica si un arma puede ser interceptada.
 */
export function isInterceptable(weapon: Weapon): boolean {
  return weapon.interceptable;
}

/** Chance base de intercept por cada módulo PPC en GO2: 55% */
const PPC_INTERCEPT_CHANCE = 0.55;

/**
 * Calcula la probabilidad de interceptar UN misil con UN módulo PPC.
 * En GO2, cada PPC tiene 55% independiente de destruir UN misil entrante.
 * No depende de Speed.
 */
export function calculateInterceptChance(): number {
  return PPC_INTERCEPT_CHANCE;
}

/**
 * Intenta interceptar un misil entrante usando todos los PPC disponibles.
 * Por cada PPC: 55% chance de destruir 1 misil. Cada intento es independiente.
 *
 * @param ppcCount - Número de módulos PPC en el stack defensor
 * @param incomingMissiles - Número de misiles entrantes (hits del atacante)
 * @param rng - Generador de números aleatorios con semilla
 * @returns Número de misiles interceptados (destruidos)
 */
export function attemptPPCIntercept(
  ppcCount: number,
  incomingMissiles: number,
  rng: { chance: (p: number) => boolean }
): number {
  if (ppcCount <= 0 || incomingMissiles <= 0) return 0;

  let missilesDestroyed = 0;
  const chance = calculateInterceptChance();

  // Por cada misil entrante, intentar intercept con cada PPC disponible
  // En GO2: cada PPC puede destruir 1 misil con 55% de probabilidad
  for (let m = 0; m < incomingMissiles; m++) {
    for (let p = 0; p < ppcCount; p++) {
      if (rng.chance(chance)) {
        missilesDestroyed++;
        break; // Este PPC destruyó el misil, pasar al siguiente misil
      }
    }
  }

  return Math.min(missilesDestroyed, incomingMissiles);
}
