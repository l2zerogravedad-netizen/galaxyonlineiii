/**
 * ========================================================================
 * Galaxy Online 3 — Damage System
 * ========================================================================
 * Sistema de cálculo de daño con todas las fórmulas de GO2:
 *   - Hit chance (binomial)
 *   - Críticos (electron-based)
 *   - Matriz Armor vs Damage Type
 *   - Shield negation / penetration
 *   - EOS (Extra Overloading Shield)
 *   - Scatter damage (ballistic)
 *   - Destrucción de naves
 *
 * @module battle/engine/DamageSystem
 * ========================================================================
 */

import type {
  ShipStack,
  Weapon,
  WeaponType,
  Commander,
  DamageResult,
  AttackResult,
  ScatterResult,
  BattleEvent,
} from './types';
import { getArmorMultiplier } from './WeaponSystem';
import {
  getEffectiveStack,
  calculateCritChance,
  calculateCritMultiplier,
  getCriticalBonusFromSkills,
  getWeaponDamageBonus,
  getShipDamageBonus,
  getShipDefenseBonus,
} from './CommanderSystem';
import { processEOS } from './ShieldSystem';

// ============================================================================
// RNG (seeded optional)
// ============================================================================

/** Generador de números pseudoaleatorios con semilla opcional */
export class SeededRNG {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Math.floor(Math.random() * 2147483647);
  }

  /** Retorna número entre 0 y 1 */
  next(): number {
    // LCG simple
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /** Número entero entre min y max (inclusive) */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Booleano con probabilidad dada */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

/** Instancia global de RNG (sin semilla) */
let globalRNG = new SeededRNG();

/** Reemplaza el RNG global */
export function setGlobalRNG(rng: SeededRNG): void {
  globalRNG = rng;
}

/** Obtiene el RNG global */
export function getGlobalRNG(): SeededRNG {
  return globalRNG;
}

// ============================================================================
// HIT CALCULATION (Binomial)
// ============================================================================

/**
 * Calcula la probabilidad base de acierto.
 *
 * hitChance = baseAccuracy + (attacker.accuracy - defender.dodge) * 0.01
 *
 * @param attacker - Comandante atacante
 * @param defender - Comandante defensor
 * @param baseAccuracy - Precisión base (default 0.70 = 70%)
 * @returns Probabilidad de hit [0, 1]
 */
export function calculateHitChance(
  attacker: Commander | undefined,
  defender: Commander | undefined,
  baseAccuracy: number = 0.70
): number {
  const acc = attacker?.accuracy ?? 0;
  const dodge = defender?.dodge ?? 0;
  let hitChance = baseAccuracy + (acc - dodge) * 0.01;
  // Clamp entre 5% y 95%
  return Math.max(0.05, Math.min(0.95, hitChance));
}

/**
 * Simula lanzamientos binomiales: cuántos hits de N intentos.
 * Cada nave del effective stack es un "intento" independiente.
 *
 * @param effectiveStack - Número de naves efectivas
 * @param hitChance - Probabilidad de hit por nave [0,1]
 * @returns Número de hits
 */
export function binomialHits(
  effectiveStack: number,
  hitChance: number,
  rng: SeededRNG = globalRNG
): number {
  const n = Math.max(0, Math.floor(effectiveStack));
  if (n === 0 || hitChance <= 0) return 0;
  if (hitChance >= 1) return n;

  let hits = 0;
  for (let i = 0; i < n; i++) {
    if (rng.chance(hitChance)) hits++;
  }
  return hits;
}

// ============================================================================
// DAMAGE ROLL
// ============================================================================

/**
 * Tira el daño de un arma: valor aleatorio entre min y max.
 */
export function rollDamage(
  weapon: Weapon,
  rng: SeededRNG = globalRNG
): number {
  return rng.nextInt(weapon.minDamage, weapon.maxDamage);
}

/**
 * Calcula si un golpe es crítico y aplica multiplicador.
 *
 * criticalRoll < attacker.electron / 200
 * damage *= 1.5 + attacker.electron / 100
 *
 * @param baseDamage - Daño base
 * @param attacker - Comandante atacante
 * @param rng - Generador RNG
 * @returns Daño final y si fue crítico
 */
export function applyCritical(
  baseDamage: number,
  attacker: Commander | undefined,
  rng: SeededRNG = globalRNG
): { damage: number; isCritical: boolean; multiplier: number } {
  if (!attacker) {
    return { damage: baseDamage, isCritical: false, multiplier: 1.0 };
  }

  const critChance = calculateCritChance(attacker);
  const critRoll = rng.next();

  if (critRoll < critChance) {
    const multiplier = calculateCritMultiplier(attacker);
    return {
      damage: Math.floor(baseDamage * multiplier),
      isCritical: true,
      multiplier,
    };
  }

  return { damage: baseDamage, isCritical: false, multiplier: 1.0 };
}

/**
 * Versión de applyCritical con bonus adicional de skills (Lucky Strike, etc).
 * El extraCritMultiplier se suma al multiplicador base del comandante.
 *
 * @param baseDamage - Daño base
 * @param attacker - Comandante atacante
 * @param rng - Generador RNG
 * @param extraCritMultiplier - Bonus adicional (ej: 1.0 = +100%)
 * @returns Daño final y si fue crítico
 */
export function applyCriticalWithSkillBonus(
  baseDamage: number,
  attacker: Commander | undefined,
  rng: SeededRNG = globalRNG,
  extraCritMultiplier: number = 0
): { damage: number; isCritical: boolean; multiplier: number } {
  if (!attacker) {
    return { damage: baseDamage, isCritical: false, multiplier: 1.0 };
  }

  const critChance = calculateCritChance(attacker);
  const critRoll = rng.next();

  if (critRoll < critChance) {
    const baseMultiplier = calculateCritMultiplier(attacker);
    const multiplier = baseMultiplier + extraCritMultiplier;
    return {
      damage: Math.floor(baseDamage * multiplier),
      isCritical: true,
      multiplier,
    };
  }

  return { damage: baseDamage, isCritical: false, multiplier: 1.0 };
}

// ============================================================================
// SHIELD PENETRATION
// ============================================================================

/**
 * Calcula el daño después de aplicar penetración de escudo.
 *
 * Si el arma tiene pierceChance, parte del daño ignora el escudo:
 *   pierceDamage = damage * pierceChance
 *   shieldDamage = (damage - pierceDamage) - defender.shield
 *   hullDamage = pierceDamage + max(0, shieldDamage)
 *
 * Sin penetración:
 *   shieldDamage = damage - defender.shield
 *   hullDamage = max(0, shieldDamage)
 *
 * @param damage - Daño después de armadura
 * @param weapon - Arma usada
 * @param defenderShield - Shield actual del defensor
 * @param rng - RNG
 * @returns Daño al casco, daño al escudo, y si penetró
 */
export function applyShieldPenetration(
  damage: number,
  weapon: Weapon,
  defenderShield: number,
  rng: SeededRNG = globalRNG
): {
  hullDamage: number;
  shieldDamage: number;
  pierceDamage: number;
  isPierce: boolean;
} {
  const pierceRoll = rng.next();
  const isPierce = pierceRoll < weapon.pierceChance;

  if (isPierce) {
    // Parte del daño ignora el escudo
    const pierceDamage = Math.floor(damage * weapon.pierceChance);
    const remainingForShield = damage - pierceDamage;
    const shieldOverflow = Math.max(0, remainingForShield - defenderShield);
    const shieldAbsorbed = Math.min(remainingForShield, defenderShield);

    return {
      hullDamage: pierceDamage + shieldOverflow,
      shieldDamage: shieldAbsorbed,
      pierceDamage,
      isPierce: true,
    };
  } else {
    // Todo el daño va contra el escudo
    const shieldOverflow = Math.max(0, damage - defenderShield);
    const shieldAbsorbed = Math.min(damage, defenderShield);

    return {
      hullDamage: shieldOverflow,
      shieldDamage: shieldAbsorbed,
      pierceDamage: 0,
      isPierce: false,
    };
  }
}

// ============================================================================
// SCATTER DAMAGE (Ballistic only)
// ============================================================================

/**
 * Calcula daño scatter a stacks adyacentes al objetivo.
 * Solo aplica para armas ballistic.
 *
 * @param sourceDamage - Daño base del ataque
 * @param attacker - Stack atacante
 * @param primaryTarget - Stack objetivo principal
 * @param allEnemies - Todos los enemigos en campo
 * @returns Lista de resultados scatter
 */
export function calculateScatterDamage(
  sourceDamage: number,
  _attacker: ShipStack,
  primaryTarget: ShipStack,
  allEnemies: ShipStack[]
): ScatterResult[] {
  const results: ScatterResult[] = [];

  // Encontrar stacks adyacentes (posición ± 1)
  const adjacentPositions = [primaryTarget.position - 1, primaryTarget.position + 1];

  for (const adjPos of adjacentPositions) {
    const adjacentStack = allEnemies.find(
      (e) => e.position === adjPos && e.currentShips > 0 && e.id !== primaryTarget.id
    );
    if (adjacentStack) {
      // 15% del daño original por cada casilla adyacente
      const scatterDamage = Math.floor(sourceDamage * 0.15);
      if (scatterDamage > 0) {
        results.push({
          targetId: adjacentStack.id,
          damage: scatterDamage,
        });
      }
    }
  }

  return results;
}

// ============================================================================
// MAIN DAMAGE CALCULATION
// ============================================================================

/**
 * Calcula el resultado completo de un ataque de un stack a otro.
 * Implementa todas las fórmulas de GO2.
 *
 * Flujo:
 * 1. Calcular effective stack del atacante
 * 2. Calcular hit chance
 * 3. Tirada binomial de hits
 * 4. Por cada hit: roll damage → crítico → armor multiplier → shield penetration
 * 5. Aplicar EOS si el defensor lo tiene
 * 6. Calcular scatter si ballistic
 *
 * @param attacker - Stack atacante
 * @param defender - Stack defensor
 * @param weapon - Arma usada
 * @param baseAccuracy - Precisión base
 * @param armorType - Tipo de armadura del defensor
 * @param rng - Generador RNG (opcional)
 * @returns Resultado completo del ataque
 */
/**
 * Extrae el número de hits binomiales para uso externo (ej: PPC intercept).
 */
export function computeBinomialHits(
  attacker: ShipStack,
  defender: ShipStack,
  baseAccuracy: number = 0.70,
  rng: SeededRNG = globalRNG
): { hits: number; misses: number; effectiveStack: number; hitChance: number } {
  const effectiveStack = getEffectiveStack(attacker);
  if (effectiveStack <= 0) {
    return { hits: 0, misses: 0, effectiveStack: 0, hitChance: 0 };
  }

  const hitChance = calculateHitChance(
    attacker.commander,
    defender.commander,
    baseAccuracy
  );

  const hits = binomialHits(effectiveStack, hitChance, rng);
  const misses = effectiveStack - hits;

  return { hits, misses, effectiveStack, hitChance };
}

export function calculateAttack(
  attacker: ShipStack,
  defender: ShipStack,
  weapon: Weapon,
  baseAccuracy: number = 0.70,
  armorType: string = 'regen',
  rng: SeededRNG = globalRNG,
  /** Hits precomputados (ej: después de PPC intercept). Si se pasa, se salta el binomial. */
  forcedHits?: number,
  /** Bonus de daño de skills pasivas (ej: +0.25 = +25%) */
  skillDamageBonus: number = 0,
  /** Bonus de multiplicador crítico de skills (ej: +1.0 = +100%) */
  extraCritMultiplier: number = 0
): AttackResult {
  const events: BattleEvent[] = [];

  // 1. Effective stack
  const effectiveStack = getEffectiveStack(attacker);
  if (effectiveStack <= 0) {
    return { hits: 0, misses: 0, damageResults: [], events, he3Consumed: 0 };
  }

  // 2. Hit chance
  const hitChance = calculateHitChance(
    attacker.commander,
    defender.commander,
    baseAccuracy
  );

  // 3. Binomial hits (o usar hits forzados si vienen de PPC intercept)
  let hits: number;
  let misses: number;

  if (forcedHits !== undefined) {
    hits = Math.max(0, Math.min(forcedHits, effectiveStack));
    misses = effectiveStack - hits;
  } else {
    hits = binomialHits(effectiveStack, hitChance, rng);
    misses = effectiveStack - hits;
  }

  if (hits === 0) {
    // Todos fallaron
    if (misses > 0 && defender.commander) {
      events.push({
        type: 'DODGE',
        stackId: defender.id,
        attackerId: attacker.id,
      });
    }
    return { hits: 0, misses, damageResults: [], events, he3Consumed: weapon.he3Consumption };
  }

  // 4. Por cada hit, calcular daño
  const damageResults: DamageResult[] = [];
  let totalHullDamage = 0;

  for (let i = 0; i < hits; i++) {
    // 4a. Roll damage
    let damageRoll = rollDamage(weapon, rng);

    // 4a1. Aplicar bonus de daño de skills pasivas (ej: Ballistic Master +25%)
    if (skillDamageBonus > 0) {
      damageRoll = Math.floor(damageRoll * (1 + skillDamageBonus));
    }

    // 4a2. D02 — Aplicar Weapon Expertise del atacante (+30%/-30% según grado S/A/B/C/D)
    const weaponBonus = getWeaponDamageBonus(attacker.commander, weapon.type);
    damageRoll = Math.floor(damageRoll * (1 + weaponBonus));

    // 4a3. D03 — Aplicar Ship Expertise de daño del atacante (+10%/-10% según grado)
    const shipAttackBonus = getShipDamageBonus(attacker.commander, attacker.shipType);
    damageRoll = Math.floor(damageRoll * (1 + shipAttackBonus));

    // 4a4. D03 — Aplicar Ship Expertise de defensa del defensor (-10%/+10% daño recibido)
    const shipDefenseBonus = getShipDefenseBonus(defender.commander, defender.shipType);
    damageRoll = Math.floor(damageRoll * (1 - shipDefenseBonus));

    // 4b. Crítico
    const critResult = applyCriticalWithSkillBonus(
      damageRoll,
      attacker.commander,
      rng,
      extraCritMultiplier
    );
    damageRoll = critResult.damage;

    if (critResult.isCritical) {
      events.push({
        type: 'CRITICAL_HIT',
        stackId: defender.id,
        damage: critResult.damage,
        multiplier: critResult.multiplier,
      });
      // Emitir evento de Lucky Strike si el bonus vino de skills
      if (extraCritMultiplier > 0) {
        events.push({
          type: 'LUCKY_STRIKE',
          stackId: attacker.id,
          damage: critResult.damage,
          multiplier: critResult.multiplier,
        });
      }
    }

    // 4c. Armor multiplier
    const armorMult = getArmorMultiplier(
      armorType as 'regen' | 'neutralizing' | 'nano' | 'chrome',
      weapon.damageType
    );
    const damageAfterArmor = Math.floor(damageRoll * armorMult);

    // 4d. Shield Negation (antes de escudos): Heat Diffusion Shield, etc.
    // Estas defensas reducen el daño entrante ANTES de que toque los escudos.
    const damageAfterNegation = Math.max(0, damageAfterArmor - defender.damageNegation);

    if (damageAfterNegation <= 0) {
      damageResults.push({
        hullDamage: 0,
        shieldDamage: 0,
        pierceDamage: 0,
        isCritical: critResult.isCritical,
        criticalMultiplier: critResult.multiplier,
        isPierce: false,
        shipsDestroyed: 0,
        scatterResults: [],
      });
      continue;
    }

    // 4e. Shield penetration
    const defenderShield = defender.totalShield;
    const penResult = applyShieldPenetration(
      damageAfterNegation,
      weapon,
      defenderShield,
      rng
    );

    // 4f. EOS check (deterministic RNG for reproducibility)
    const eosResult = processEOS(defender, penResult.hullDamage, rng);

    // 4g. Hull Negation (DESPUÉS de escudos): Energy Armor, Daedalus
    // Solo afectan el daño que llega al casco, NO al escudo.
    const hullDamageAfterNegation = Math.max(0, eosResult.adjustedDamage - defender.hullNegation);
    const finalHullDamage = hullDamageAfterNegation;

    if (eosResult.triggered) {
      events.push({
        type: 'EOS_TRIGGER',
        stackId: defender.id,
        absorbed: eosResult.absorbedExtra,
      });
    }

    // 4h. Calcular naves destruidas
    const damagePerShip = defender.hullPoints * defender.stability;
    const shipsDestroyed =
      damagePerShip > 0 ? Math.floor(finalHullDamage / damagePerShip) : 0;

    totalHullDamage += finalHullDamage;

    events.push({
      type: 'PROJECTILE_HIT',
      targetId: defender.id,
      damage: finalHullDamage,
      isCritical: critResult.isCritical,
      isPierce: penResult.isPierce,
    });

    // 4i. Scatter (solo ballistic)
    let scatterResults: ScatterResult[] = [];
    if (weapon.type === 'ballistic' && weapon.scatterRange && weapon.scatterRange > 0) {
      // Scatter se calcula contra todos los enemigos (placeholder, se resuelve en BattleEngine)
      scatterResults = []; // Se resuelve externamente
    }

    damageResults.push({
      hullDamage: finalHullDamage,
      shieldDamage: penResult.shieldDamage,
      pierceDamage: penResult.pierceDamage,
      isCritical: critResult.isCritical,
      criticalMultiplier: critResult.multiplier,
      isPierce: penResult.isPierce,
      shipsDestroyed,
      scatterResults,
    });
  }

  // Evento de ataque
  if (hits > 0) {
    events.push({
      type: 'WEAPON_FIRE',
      stackId: attacker.id,
      weaponType: weapon.type,
      targetId: defender.id,
      hits,
    });
  }

  return {
    hits,
    misses,
    damageResults,
    events,
    he3Consumed: weapon.he3Consumption,
  };
}

// ============================================================================
// DAMAGE SUMMARY
// ============================================================================

/**
 * Agrega resultados de daño de múltiples hits en totales.
 */
export function aggregateDamage(
  results: DamageResult[]
): {
  totalHullDamage: number;
  totalShieldDamage: number;
  totalPierceDamage: number;
  totalShipsDestroyed: number;
  criticalCount: number;
  pierceCount: number;
} {
  return results.reduce(
    (acc, r) => ({
      totalHullDamage: acc.totalHullDamage + r.hullDamage,
      totalShieldDamage: acc.totalShieldDamage + r.shieldDamage,
      totalPierceDamage: acc.totalPierceDamage + r.pierceDamage,
      totalShipsDestroyed: acc.totalShipsDestroyed + r.shipsDestroyed,
      criticalCount: acc.criticalCount + (r.isCritical ? 1 : 0),
      pierceCount: acc.pierceCount + (r.isPierce ? 1 : 0),
    }),
    {
      totalHullDamage: 0,
      totalShieldDamage: 0,
      totalPierceDamage: 0,
      totalShipsDest