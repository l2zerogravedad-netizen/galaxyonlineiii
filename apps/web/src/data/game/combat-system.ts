/**
 * SISTEMA DE COMBATE COMPLETO - GALAXY ONLINE II
 * Daño de naves según comandantes, estrellas, habilidades y sinergias
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { CommanderStats, CommanderAbility, CommanderRarity } from './commanders-complete';
import type { ShipHull, ShipModule } from './ships-complete';

// ============================================
// TIPOS DE COMBATE
// ============================================
export type CombatType = 'pvp' | 'pve' | 'constellation' | 'corp_war' | 'raid';
export type DamageType = 'ballistic' | 'directional' | 'missile' | 'ship_based' | 'structure';
export type RangeType = 'short' | 'medium' | 'long' | 'extreme';

// ============================================
// ESTADÍSTICAS DE COMBATE DE NAVES
// ============================================
export interface ShipCombatStats {
  // Stats base
  attack: number;
  defense: number;
  structure: number;
  shield: number;
  speed: number;
  stability: number;
  
  // Stats de combate calculadas
  minAttack: number;
  maxAttack: number;
  attackRate: number; // Disparos por segundo
  accuracy: number; // 0-100%
  evasion: number; // 0-100%
  criticalChance: number; // 0-100%
  criticalDamage: number; // Multiplier (ej: 1.5 = 150%)
  shieldPenetration: number; // 0-100%
  damageReduction: number; // 0-100%
  
  // Rangos
  optimalRange: RangeType;
  rangeModifier: Record<RangeType, number>; // 0-1
  
  // Resistencias
  resistances: Record<DamageType, number>; // 0-100%
}

// ============================================
// BONIFICACIONES DE COMANDANTE EN COMBATE
// ============================================
export interface CommanderCombatBonus {
  // Stats base
  attackPercent: number;
  defensePercent: number;
  structurePercent: number;
  shieldPercent: number;
  speedPercent: number;
  stabilityPercent: number;
  
  // Stats de combate
  accuracyBonus: number;
  evasionBonus: number;
  criticalChanceBonus: number;
  criticalDamageBonus: number;
  attackRateBonus: number;
  
  // Daño específico
  ballisticDamageBonus: number;
  directionalDamageBonus: number;
  missileDamageBonus: number;
  shipBasedDamageBonus: number;
  
  // Defensa
  shieldRegenBonus: number; // Por segundo
  damageReductionBonus: number;
  
  // Habilidades activas
  activeAbilities: CommanderAbility[];
}

// ============================================
// CALCULAR BONOS DE COMANDANTE
// ============================================
export function calculateCommanderCombatBonus(
  commanderStats: CommanderStats,
  commanderAbilities: CommanderAbility[],
  shipType: 'frigate' | 'cruiser' | 'battleship' | 'flagship',
  commanderLevel: number
): CommanderCombatBonus {
  const bonus: CommanderCombatBonus = {
    attackPercent: 0,
    defensePercent: 0,
    structurePercent: 0,
    shieldPercent: 0,
    speedPercent: 0,
    stabilityPercent: 0,
    accuracyBonus: 0,
    evasionBonus: 0,
    criticalChanceBonus: 0,
    criticalDamageBonus: 0,
    attackRateBonus: 0,
    ballisticDamageBonus: 0,
    directionalDamageBonus: 0,
    missileDamageBonus: 0,
    shipBasedDamageBonus: 0,
    shieldRegenBonus: 0,
    damageReductionBonus: 0,
    activeAbilities: []
  };
  
  // Bonos base por stats del comandante (escalado por nivel)
  const levelMultiplier = 1 + (commanderLevel - 1) * 0.02;
  
  bonus.attackPercent = (commanderStats.attack / 10) * levelMultiplier;
  bonus.defensePercent = (commanderStats.defense / 10) * levelMultiplier;
  bonus.structurePercent = (commanderStats.structure / 50) * levelMultiplier;
  bonus.shieldPercent = (commanderStats.shield / 25) * levelMultiplier;
  bonus.speedPercent = (commanderStats.speed / 10) * levelMultiplier;
  bonus.stabilityPercent = (commanderStats.stability / 5) * levelMultiplier;
  
  // Bonus por habilidades
  for (const ability of commanderAbilities) {
    switch (ability.effect.type) {
      case 'damage_boost':
        bonus.attackPercent += ability.effect.value;
        break;
      case 'defense_boost':
        bonus.defensePercent += ability.effect.value;
        bonus.damageReductionBonus += ability.effect.value * 0.5;
        break;
      case 'speed_boost':
        bonus.speedPercent += ability.effect.value;
        bonus.evasionBonus += ability.effect.value * 0.3;
        break;
      case 'critical_chance':
        bonus.criticalChanceBonus += ability.effect.value;
        break;
      case 'shield_regen':
        bonus.shieldRegenBonus += ability.effect.value;
        break;
      case 'structure_regen':
        // Esto se maneja en el cálculo de supervivencia, no en stats base
        break;
      case 'accuracy':
        bonus.accuracyBonus += ability.effect.value;
        break;
      case 'evasion':
        bonus.evasionBonus += ability.effect.value;
        break;
    }
    
    if (ability.trigger === 'active' || ability.trigger === 'passive') {
      bonus.activeAbilities.push(ability);
    }
  }
  
  // Bonus específicos por tipo de nave (sinergia)
  const shipSynergy = calculateShipSynergy(shipType, commanderStats);
  bonus.ballisticDamageBonus += shipSynergy.ballisticBonus;
  bonus.directionalDamageBonus += shipSynergy.directionalBonus;
  bonus.missileDamageBonus += shipSynergy.missileBonus;
  
  return bonus;
}

// ============================================
// SINERGIA COMANDANTE-NAVE
// ============================================
interface ShipSynergy {
  ballisticBonus: number;
  directionalBonus: number;
  missileBonus: number;
  shipBasedBonus: number;
}

function calculateShipSynergy(
  shipType: 'frigate' | 'cruiser' | 'battleship' | 'flagship',
  commanderStats: CommanderStats
): ShipSynergy {
  const synergy: ShipSynergy = {
    ballisticBonus: 0,
    directionalBonus: 0,
    missileBonus: 0,
    shipBasedBonus: 0
  };
  
  // Frigatas: Bonus a velocidad y misiles
  if (shipType === 'frigate') {
    synergy.missileBonus = (commanderStats.speed / 100) * 5;
    synergy.directionalBonus = (commanderStats.attack / 100) * 3;
  }
  
  // Cruceros: Bonus balanceado a todas las armas
  if (shipType === 'cruiser') {
    synergy.ballisticBonus = (commanderStats.attack / 100) * 3;
    synergy.directionalBonus = (commanderStats.attack / 100) * 3;
    synergy.missileBonus = (commanderStats.attack / 100) * 3;
  }
  
  // Acorazados: Bonus a balísticos y daño de nave
  if (shipType === 'battleship') {
    synergy.ballisticBonus = (commanderStats.attack / 100) * 8;
    synergy.shipBasedBonus = (commanderStats.attack / 100) * 5;
  }
  
  // Flagships: Bonus masivo a todas las armas
  if (shipType === 'flagship') {
    synergy.ballisticBonus = (commanderStats.attack / 100) * 10;
    synergy.directionalBonus = (commanderStats.attack / 100) * 10;
    synergy.missileBonus = (commanderStats.attack / 100) * 10;
    synergy.shipBasedBonus = (commanderStats.attack / 100) * 10;
  }
  
  return synergy;
}

// ============================================
// SISTEMA DE ESTRELLAS (STARS)
// ============================================
export interface StarBonus {
  id: string;
  name: string;
  constellation: string;
  bonusType: 'attack' | 'defense' | 'speed' | 'critical' | 'shield' | 'structure';
  bonusValue: number;
  requiredCommanderLevel: number;
  starLevel: 1 | 2 | 3 | 4 | 5; // Estrellas de 1 a 5
}

export const CONSTELLATION_STARS: StarBonus[] = [
  // Constelación del Guerrero
  {
    id: 'star_warrior_01',
    name: 'Estrella del Guerrero',
    constellation: 'warrior',
    bonusType: 'attack',
    bonusValue: 5,
    requiredCommanderLevel: 10,
    starLevel: 1
  },
  {
    id: 'star_warrior_02',
    name: 'Estrella Brillante del Guerrero',
    constellation: 'warrior',
    bonusType: 'attack',
    bonusValue: 10,
    requiredCommanderLevel: 20,
    starLevel: 2
  },
  {
    id: 'star_warrior_03',
    name: 'Estrella del Campeón',
    constellation: 'warrior',
    bonusType: 'attack',
    bonusValue: 15,
    requiredCommanderLevel: 30,
    starLevel: 3
  },
  {
    id: 'star_warrior_04',
    name: 'Estrella del Héroe',
    constellation: 'warrior',
    bonusType: 'attack',
    bonusValue: 25,
    requiredCommanderLevel: 40,
    starLevel: 4
  },
  {
    id: 'star_warrior_05',
    name: 'Estrella Legendaria del Guerrero',
    constellation: 'warrior',
    bonusType: 'attack',
    bonusValue: 40,
    requiredCommanderLevel: 50,
    starLevel: 5
  },
  
  // Constelación del Guardián
  {
    id: 'star_guardian_01',
    name: 'Estrella del Guardián',
    constellation: 'guardian',
    bonusType: 'defense',
    bonusValue: 5,
    requiredCommanderLevel: 10,
    starLevel: 1
  },
  {
    id: 'star_guardian_02',
    name: 'Estrella Brillante del Guardián',
    constellation: 'guardian',
    bonusType: 'defense',
    bonusValue: 10,
    requiredCommanderLevel: 20,
    starLevel: 2
  },
  {
    id: 'star_guardian_03',
    name: 'Estrella del Protector',
    constellation: 'guardian',
    bonusType: 'defense',
    bonusValue: 20,
    requiredCommanderLevel: 30,
    starLevel: 3
  },
  {
    id: 'star_guardian_04',
    name: 'Estrella del Bastión',
    constellation: 'guardian',
    bonusType: 'structure',
    bonusValue: 30,
    requiredCommanderLevel: 40,
    starLevel: 4
  },
  {
    id: 'star_guardian_05',
    name: 'Estrella Legendaria del Guardián',
    constellation: 'guardian',
    bonusType: 'shield',
    bonusValue: 50,
    requiredCommanderLevel: 50,
    starLevel: 5
  },
  
  // Constelación del Viento
  {
    id: 'star_wind_01',
    name: 'Estrella del Viento',
    constellation: 'wind',
    bonusType: 'speed',
    bonusValue: 5,
    requiredCommanderLevel: 10,
    starLevel: 1
  },
  {
    id: 'star_wind_02',
    name: 'Estrella Brillante del Viento',
    constellation: 'wind',
    bonusType: 'speed',
    bonusValue: 10,
    requiredCommanderLevel: 20,
    starLevel: 2
  },
  {
    id: 'star_wind_03',
    name: 'Estrella del Corredor',
    constellation: 'wind',
    bonusType: 'speed',
    bonusValue: 20,
    requiredCommanderLevel: 30,
    starLevel: 3
  },
  {
    id: 'star_wind_04',
    name: 'Estrella del Relámpago',
    constellation: 'wind',
    bonusType: 'critical',
    bonusValue: 15,
    requiredCommanderLevel: 40,
    starLevel: 4
  },
  {
    id: 'star_wind_05',
    name: 'Estrella Legendaria del Viento',
    constellation: 'wind',
    bonusType: 'speed',
    bonusValue: 35,
    requiredCommanderLevel: 50,
    starLevel: 5
  },
  
  // Constelación del Destino
  {
    id: 'star_fate_01',
    name: 'Estrella del Destino',
    constellation: 'fate',
    bonusType: 'critical',
    bonusValue: 3,
    requiredCommanderLevel: 10,
    starLevel: 1
  },
  {
    id: 'star_fate_02',
    name: 'Estrella Brillante del Destino',
    constellation: 'fate',
    bonusType: 'critical',
    bonusValue: 8,
    requiredCommanderLevel: 20,
    starLevel: 2
  },
  {
    id: 'star_fate_03',
    name: 'Estrella de la Fortuna',
    constellation: 'fate',
    bonusType: 'attack',
    bonusValue: 15,
    requiredCommanderLevel: 30,
    starLevel: 3
  },
  {
    id: 'star_fate_04',
    name: 'Estrella de la Suerte',
    constellation: 'fate',
    bonusType: 'critical',
    bonusValue: 20,
    requiredCommanderLevel: 40,
    starLevel: 4
  },
  {
    id: 'star_fate_05',
    name: 'Estrella Divina del Destino',
    constellation: 'fate',
    bonusType: 'critical',
    bonusValue: 30,
    requiredCommanderLevel: 50,
    starLevel: 5
  }
];

// ============================================
// APLICAR BONOS DE ESTRELLAS
// ============================================
export function applyStarBonuses(
  baseBonus: CommanderCombatBonus,
  unlockedStars: StarBonus[]
): CommanderCombatBonus {
  const enhancedBonus = { ...baseBonus };
  
  for (const star of unlockedStars) {
    switch (star.bonusType) {
      case 'attack':
        enhancedBonus.attackPercent += star.bonusValue;
        break;
      case 'defense':
        enhancedBonus.defensePercent += star.bonusValue;
        enhancedBonus.damageReductionBonus += star.bonusValue * 0.3;
        break;
      case 'speed':
        enhancedBonus.speedPercent += star.bonusValue;
        enhancedBonus.evasionBonus += star.bonusValue * 0.2;
        break;
      case 'critical':
        enhancedBonus.criticalChanceBonus += star.bonusValue;
        enhancedBonus.criticalDamageBonus += star.bonusValue * 0.1;
        break;
      case 'shield':
        enhancedBonus.shieldPercent += star.bonusValue;
        enhancedBonus.shieldRegenBonus += star.bonusValue * 0.2;
        break;
      case 'structure':
        enhancedBonus.structurePercent += star.bonusValue;
        break;
    }
  }
  
  return enhancedBonus;
}

// ============================================
// CÁLCULO COMPLETO DE STATS DE COMBATE
// ============================================
export interface CompleteShipStats {
  baseStats: ShipCombatStats;
  withCommander: ShipCombatStats;
  withStars: ShipCombatStats;
  withModules: ShipCombatStats;
  finalStats: ShipCombatStats;
}

export function calculateCompleteShipStats(
  shipHull: ShipHull,
  equippedModules: ShipModule[],
  commanderStats?: CommanderStats,
  commanderAbilities?: CommanderAbility[],
  commanderLevel?: number,
  unlockedStars?: StarBonus[]
): CompleteShipStats {
  // 1. Stats base de la nave
  const baseStats = calculateBaseShipStats(shipHull, equippedModules);
  
  // 2. Stats con comandante
  let withCommander = { ...baseStats };
  if (commanderStats && commanderAbilities && commanderLevel) {
    const shipType = getShipTypeFromHull(shipHull.id);
    const commanderBonus = calculateCommanderCombatBonus(
      commanderStats,
      commanderAbilities,
      shipType,
      commanderLevel
    );
    withCommander = applyCommanderBonus(baseStats, commanderBonus);
  }
  
  // 3. Stats con estrellas
  let withStars = { ...withCommander };
  if (unlockedStars && commanderStats && commanderAbilities && commanderLevel) {
    const shipType = getShipTypeFromHull(shipHull.id);
    const baseBonus = calculateCommanderCombatBonus(
      commanderStats,
      commanderAbilities,
      shipType,
      commanderLevel
    );
    const enhancedBonus = applyStarBonuses(baseBonus, unlockedStars);
    withStars = applyCommanderBonus(baseStats, enhancedBonus);
  }
  
  // 4. Stats con módulos (ya aplicados en base)
  const withModules = { ...withStars };
  
  return {
    baseStats,
    withCommander,
    withStars,
    withModules,
    finalStats: withStars
  };
}

// ============================================
// CÁLCULO DE DAÑO REAL
// ============================================
export interface DamageResult {
  rawDamage: number;
  isCritical: boolean;
  afterDefense: number;
  afterShield: number;
  finalDamage: number;
  shieldDamage: number;
  structureDamage: number;
}

export function calculateDamage(
  attackerStats: ShipCombatStats,
  defenderStats: ShipCombatStats,
  damageType: DamageType,
  range: RangeType,
  hitChance: number = 0.95 // Base 95% de acertar
): DamageResult {
  // 1. Verificar si acierta
  const hitRoll = Math.random();
  const actualHitChance = hitChance * (attackerStats.accuracy / 100) * (1 - defenderStats.evasion / 100);
  
  if (hitRoll > actualHitChance) {
    return {
      rawDamage: 0,
      isCritical: false,
      afterDefense: 0,
      afterShield: 0,
      finalDamage: 0,
      shieldDamage: 0,
      structureDamage: 0
    };
  }
  
  // 2. Calcular daño base
  let rawDamage = attackerStats.minAttack + Math.random() * (attackerStats.maxAttack - attackerStats.minAttack);
  
  // 3. Aplicar modificador de rango
  rawDamage *= attackerStats.rangeModifier[range] || 1;
  
  // 4. Verificar crítico
  const critRoll = Math.random() * 100;
  const isCritical = critRoll <= attackerStats.criticalChance;
  if (isCritical) {
    rawDamage *= attackerStats.criticalDamage;
  }
  
  // 5. Aplicar resistencias del defensor
  const resistance = defenderStats.resistances[damageType] || 0;
  let afterDefense = rawDamage * (1 - resistance / 100);
  
  // 6. Aplicar reducción de daño
  afterDefense *= (1 - defenderStats.damageReduction / 100);
  
  // 7. Calcular daño a escudos y estructura
  const shieldAbsorbed = Math.min(defenderStats.shield, afterDefense * (1 - attackerStats.shieldPenetration / 100));
  const afterShield = afterDefense - shieldAbsorbed;
  
  // 8. Daño final
  const finalDamage = afterShield;
  const structureDamage = Math.min(defenderStats.structure, finalDamage);
  
  return {
    rawDamage: Math.floor(rawDamage),
    isCritical,
    afterDefense: Math.floor(afterDefense),
    afterShield: Math.floor(afterShield),
    finalDamage: Math.floor(finalDamage),
    shieldDamage: Math.floor(shieldAbsorbed),
    structureDamage: Math.floor(structureDamage)
  };
}

// ============================================
// CÁLCULO DE DAÑO DE FLOTA COMPLETA
// ============================================
export interface FleetDamageResult {
  totalDamage: number;
  criticalHits: number;
  hitsLanded: number;
  totalShots: number;
  averageDamage: number;
  shipsLost: number;
}

export function calculateFleetDamage(
  attackerFleet: { shipStats: ShipCombatStats; count: number }[],
  defenderFleet: { shipStats: ShipCombatStats; count: number }[],
  combatType: CombatType,
  rounds: number = 1
): { attackerResult: FleetDamageResult; defenderResult: FleetDamageResult } {
  let attackerTotalDamage = 0;
  let attackerCriticalHits = 0;
  let attackerHits = 0;
  let attackerShots = 0;
  
  let defenderTotalDamage = 0;
  let defenderCriticalHits = 0;
  let defenderHits = 0;
  let defenderShots = 0;
  
  // Simular rounds de combate
  for (let round = 0; round < rounds; round++) {
    // Atacantes disparan
    for (const ship of attackerFleet) {
      const shots = ship.count * ship.shipStats.attackRate;
      attackerShots += shots;
      
      for (let i = 0; i < shots; i++) {
        // Seleccionar objetivo aleatorio del defensor
        const targetShip = defenderFleet[Math.floor(Math.random() * defenderFleet.length)];
        if (!targetShip || targetShip.count <= 0) continue;
        
        const range: RangeType = determineCombatRange(ship.shipStats.speed, targetShip.shipStats.speed);
        const damage = calculateDamage(
          ship.shipStats,
          targetShip.shipStats,
          'ballistic', // Simplificado, en realidad depende de los módulos
          range
        );
        
        if (damage.finalDamage > 0) {
          attackerHits++;
          attackerTotalDamage += damage.finalDamage;
          if (damage.isCritical) attackerCriticalHits++;
        }
      }
    }
    
    // Defensores disparan
    for (const ship of defenderFleet) {
      const shots = ship.count * ship.shipStats.attackRate;
      defenderShots += shots;
      
      for (let i = 0; i < shots; i++) {
        const targetShip = attackerFleet[Math.floor(Math.random() * attackerFleet.length)];
        if (!targetShip || targetShip.count <= 0) continue;
        
        const range: RangeType = determineCombatRange(ship.shipStats.speed, targetShip.shipStats.speed);
        const damage = calculateDamage(
          ship.shipStats,
          targetShip.shipStats,
          'ballistic',
          range
        );
        
        if (damage.finalDamage > 0) {
          defenderHits++;
          defenderTotalDamage += damage.finalDamage;
          if (damage.isCritical) defenderCriticalHits++;
        }
      }
    }
  }
  
  return {
    attackerResult: {
      totalDamage: attackerTotalDamage,
      criticalHits: attackerCriticalHits,
      hitsLanded: attackerHits,
      totalShots: attackerShots,
      averageDamage: attackerHits > 0 ? attackerTotalDamage / attackerHits : 0,
      shipsLost: 0 // Calcular basado en daño recibido
    },
    defenderResult: {
      totalDamage: defenderTotalDamage,
      criticalHits: defenderCriticalHits,
      hitsLanded: defenderHits,
      totalShots: defenderShots,
      averageDamage: defenderHits > 0 ? defenderTotalDamage / defenderHits : 0,
      shipsLost: 0
    }
  };
}

// ============================================
// HELPERS INTERNOS
// ============================================
function calculateBaseShipStats(shipHull: ShipHull, modules: ShipModule[]): ShipCombatStats {
  let attack = 0;
  let defense = 0;
  let structure = shipHull.stats.structure;
  let shield = 0;
  let speed = shipHull.stats.speed;
  let stability = shipHull.stats.stability;
  
  // Aplicar stats de módulos
  for (const mod of modules) {
    attack += mod.stats.attack || 0;
    defense += mod.stats.defense || 0;
    shield += mod.stats.shield || 0;
    structure += mod.stats.structure || 0;
  }
  
  return {
    attack,
    defense,
    structure,
    shield,
    speed,
    stability,
    minAttack: attack * 0.9,
    maxAttack: attack * 1.1,
    attackRate: 1,
    accuracy: 95,
    evasion: Math.min(50, speed / 5),
    criticalChance: 5,
    criticalDamage: 1.5,
    shieldPenetration: 0,
    damageReduction: 0,
    optimalRange: 'medium',
    rangeModifier: {
      short: 1.2,
      medium: 1,
      long: 0.8,
      extreme: 0.5
    },
    resistances: {
      ballistic: 0,
      directional: 0,
      missile: 0,
      ship_based: 0,
      structure: 0
    }
  };
}

function applyCommanderBonus(stats: ShipCombatStats, bonus: CommanderCombatBonus): ShipCombatStats {
  return {
    ...stats,
    attack: stats.attack * (1 + bonus.attackPercent / 100),
    defense: stats.defense * (1 + bonus.defensePercent / 100),
    structure: stats.structure * (1 + bonus.structurePercent / 100),
    shield: stats.shield * (1 + bonus.shieldPercent / 100),
    speed: stats.speed * (1 + bonus.speedPercent / 100),
    stability: stats.stability * (1 + bonus.stabilityPercent / 100),
    minAttack: stats.minAttack * (1 + bonus.attackPercent / 100) * (1 + (bonus.ballisticDamageBonus + bonus.directionalDamageBonus + bonus.missileDamageBonus) / 300),
    maxAttack: stats.maxAttack * (1 + bonus.attackPercent / 100) * (1 + (bonus.ballisticDamageBonus + bonus.directionalDamageBonus + bonus.missileDamageBonus) / 300),
    accuracy: stats.accuracy + bonus.accuracyBonus,
    evasion: stats.evasion + bonus.evasionBonus,
    criticalChance: stats.criticalChance + bonus.criticalChanceBonus,
    criticalDamage: stats.criticalDamage + bonus.criticalDamageBonus / 100,
    damageReduction: stats.damageReduction + bonus.damageReductionBonus
  };
}

function getShipTypeFromHull(hullId: string): 'frigate' | 'cruiser' | 'battleship' | 'flagship' {
  if (hullId.includes('frigate')) return 'frigate';
  if (hullId.includes('cruiser')) return 'cruiser';
  if (hullId.includes('battleship')) return 'battleship';
  if (hullId.includes('flagship')) return 'flagship';
  return 'cruiser'; // Default
}

function determineCombatRange(speed1: number, speed2: number): RangeType {
  const avgSpeed = (speed1 + speed2) / 2;
  if (avgSpeed < 50) return 'short';
  if (avgSpeed < 100) return 'medium';
  if (avgSpeed < 150) return 'long';
  return 'extreme';
}

// ============================================
// SISTEMA DE BONOS POR TIPO DE COMBATE
// ============================================
export const COMBAT_TYPE_MODIFIERS: Record<CombatType, { attack: number; defense: number; honor: number }> = {
  pvp: { attack: 1, defense: 1, honor: 1 },
  pve: { attack: 1.1, defense: 1, honor: 0.5 },
  constellation: { attack: 1, defense: 1.2, honor: 1.5 },
  corp_war: { attack: 1.05, defense: 1.05, honor: 1.2 },
  raid: { attack: 1.15, defense: 0.9, honor: 1.3 }
};

export function applyCombatTypeModifiers(
  stats: ShipCombatStats,
  combatType: CombatType
): ShipCombatStats {
  const modifiers = COMBAT_TYPE_MODIFIERS[combatType];
  
  return {
    ...stats,
    attack: stats.attack * modifiers.attack,
    defense: stats.defense * modifiers.defense
  };
}

// ============================================
// EXPORTACIONES
// ============================================
export const CombatSystem = {
  CONSTELLATION_STARS,
  COMBAT_TYPE_MODIFIERS,
  calculateCommanderCombatBonus,
  calculateShipSynergy,
  applyStarBonuses,
  calculateCompleteShipStats,
  calculateDamage,
  calculateFleetDamage,
  applyCombatTypeModifiers,
  getShipTypeFromHull,
  determineCombatRange
};
