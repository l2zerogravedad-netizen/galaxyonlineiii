/**
 * SPACE STATION COMPLETO - GALAXY ONLINE II
 * Sistema de módulos, flotas defensivas, plataformas de armas
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS Y ENUMERACIONES
// ============================================
export type StationModuleType = 
  | 'core'           // Núcleo de la estación
  | 'hangar'         // Hangar para flotas
  | 'weapon_platform' // Plataforma de armas
  | 'shield_generator' // Generador de escudos
  | 'radar'          // Sistema de detección
  | 'repair_bay'     // Bahía de reparación
  | 'trading_post'   // Centro de comercio
  | 'research_lab'    // Laboratorio de investigación
  | 'resource_silo'   // Silo de recursos
  | 'defense_turret'; // Torreta defensiva

export interface StationModuleLevel {
  level: number;
  cost: Record<ResourceKey, number>;
  buildTimeHours: number;
  effects: {
    fleetCapacity?: number;       // Capacidad de flota adicional
    weaponSlots?: number;         // Slots de armas
    shieldStrength?: number;      // Fuerza del escudo
    radarRange?: number;          // Alcance del radar
    repairSpeed?: number;         // Velocidad de reparación (%)
    tradeBonus?: number;          // Bonus de comercio (%)
    researchSpeed?: number;       // Velocidad de investigación (%)
    storageCapacity?: number;     // Capacidad de almacenamiento
    defenseAttack?: number;       // Ataque defensivo
  };
  health: number;
}

export interface StationModule {
  id: string;
  name: string;
  type: StationModuleType;
  description: string;
  maxLevel: number;
  slotSize: 1 | 2 | 4;           // Tamaño en slots de la estación
  levels: StationModuleLevel[];
  requirements?: {
    stationLevel?: number;
    researchId?: string;
    researchLevel?: number;
  };
  icon: string;
}

// ============================================
// MÓDULOS DE SPACE STATION
// ============================================

// 1. NÚCLEO DE LA ESTACIÓN
export const stationCore: StationModule = {
  id: 'station_core',
  name: 'Núcleo de Estación',
  type: 'core',
  description: 'El corazón de la estación espacial. Proporciona energía y soporte vital básico.',
  maxLevel: 10,
  slotSize: 4,
  icon: '🔴',
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(2, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(50000 * multiplier),
        plasma: Math.floor(25000 * multiplier),
        credits: Math.floor(40000 * multiplier),
        energy: 0
      },
      buildTimeHours: level * 4,
      effects: {
        shieldStrength: 5000 * level,
        health: 10000 * level
      },
      health: 10000 * level
    };
  })
};

// 2. HANGAR MODULE
export const hangarModule: StationModule = {
  id: 'hangar_module',
  name: 'Módulo Hangar',
  type: 'hangar',
  description: 'Almacena y mantiene flotas defensivas. Aumenta la capacidad de naves estacionadas.',
  maxLevel: 20,
  slotSize: 2,
  icon: '🚀',
  requirements: { stationLevel: 2 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(10000 * multiplier),
        plasma: Math.floor(5000 * multiplier),
        credits: Math.floor(8000 * multiplier),
        energy: 0
      },
      buildTimeHours: level * 2,
      effects: {
        fleetCapacity: 10 * level  // 10 naves por nivel
      },
      health: 5000 + (1000 * level)
    };
  })
};

// 3. WEAPON PLATFORM
export const weaponPlatform: StationModule = {
  id: 'weapon_platform',
  name: 'Plataforma de Armas',
  type: 'weapon_platform',
  description: 'Plataforma armada con cañones pesados para defensa estacionaria.',
  maxLevel: 15,
  slotSize: 2,
  icon: '⚔️',
  requirements: { stationLevel: 3, researchId: 'planetary_defense', researchLevel: 5 },
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.6, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(15000 * multiplier),
        plasma: Math.floor(8000 * multiplier),
        credits: Math.floor(12000 * multiplier),
        energy: 0
      },
      buildTimeHours: level * 3,
      effects: {
        weaponSlots: Math.min(level, 5), // Máximo 5 slots de armas
        defenseAttack: 200 * level
      },
      health: 8000 + (1500 * level)
    };
  })
};

// 4. SHIELD GENERATOR
export const shieldGenerator: StationModule = {
  id: 'shield_generator',
  name: 'Generador de Escudos',
  type: 'shield_generator',
  description: 'Genera un campo de energía masivo que protege toda la estación.',
  maxLevel: 15,
  slotSize: 2,
  icon: '🛡️',
  requirements: { stationLevel: 4, researchId: 'ship_defense', researchLevel: 8 },
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.7, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(20000 * multiplier),
        plasma: Math.floor(15000 * multiplier),
        credits: Math.floor(25000 * multiplier),
        energy: 0
      },
      buildTimeHours: level * 4,
      effects: {
        shieldStrength: 10000 * level,
        shieldRegen: 100 * level  // Regeneración por segundo
      },
      health: 3000 + (500 * level)
    };
  })
};

// 5. RADAR ARRAY
export const radarArray: StationModule = {
  id: 'radar_array',
  name: 'Array de Radar',
  type: 'radar',
  description: 'Sistema de detección avanzado que alerta de flotas enemigas cercanas.',
  maxLevel: 10,
  slotSize: 1,
  icon: '📡',
  requirements: { stationLevel: 2 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.4, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(5000 * multiplier),
        plasma: Math.floor(3000 * multiplier),
        credits: Math.floor(6000 * multiplier),
        energy: 0
      },
      buildTimeHours: level,
      effects: {
        radarRange: 20 + (10 * level)  // Sistemas estelares
      },
      health: 2000 + (300 * level)
    };
  })
};

// 6. REPAIR BAY
export const repairBay: StationModule = {
  id: 'repair_bay',
  name: 'Bahía de Reparación',
  type: 'repair_bay',
  description: 'Repara automáticamente naves dañadas de la flota defensiva.',
  maxLevel: 15,
  slotSize: 2,
  icon: '🔧',
  requirements: { stationLevel: 3 },
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(8000 * multiplier),
        plasma: Math.floor(6000 * multiplier),
        credits: Math.floor(10000 * multiplier),
        energy: 0
      },
      buildTimeHours: level * 2,
      effects: {
        repairSpeed: 5 * level  // % de HP recuperado por minuto
      },
      health: 4000 + (600 * level)
    };
  })
};

// 7. TRADING POST
export const tradingPost: StationModule = {
  id: 'trading_post',
  name: 'Puesto de Comercio',
  type: 'trading_post',
  description: 'Permite comerciar recursos con otros jugadores con bonus de eficiencia.',
  maxLevel: 10,
  slotSize: 1,
  icon: '💰',
  requirements: { stationLevel: 4 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.6, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(12000 * multiplier),
        plasma: Math.floor(5000 * multiplier),
        credits: Math.floor(15000 * multiplier),
        energy: 0
      },
      buildTimeHours: level * 2,
      effects: {
        tradeBonus: 2 * level  // -2% fee por nivel
      },
      health: 3000 + (400 * level)
    };
  })
};

// 8. RESEARCH LAB (Estación)
export const stationResearchLab: StationModule = {
  id: 'station_research_lab',
  name: 'Laboratorio de Investigación',
  type: 'research_lab',
  description: 'Laboratorio avanzado que acelera las investigaciones planetarias.',
  maxLevel: 10,
  slotSize: 2,
  icon: '🔬',
  requirements: { stationLevel: 5, researchId: 'ship_defense', researchLevel: 10 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.8, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(25000 * multiplier),
        plasma: Math.floor(20000 * multiplier),
        credits: Math.floor(30000 * multiplier),
        energy: 0
      },
      buildTimeHours: level * 4,
      effects: {
        researchSpeed: 3 * level  // -3% tiempo de investigación
      },
      health: 5000 + (800 * level)
    };
  })
};

// 9. RESOURCE SILO
export const resourceSilo: StationModule = {
  id: 'resource_silo',
  name: 'Silo de Recursos',
  type: 'resource_silo',
  description: 'Almacenamiento masivo de recursos protegido por la estación.',
  maxLevel: 15,
  slotSize: 1,
  icon: '📦',
  requirements: { stationLevel: 3 },
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(6000 * multiplier),
        plasma: Math.floor(4000 * multiplier),
        credits: Math.floor(5000 * multiplier),
        energy: 0
      },
      buildTimeHours: level,
      effects: {
        storageCapacity: 50000 * level  // 50k por nivel
      },
      health: 3000 + (400 * level)
    };
  })
};

// 10. DEFENSE TURRET
export const defenseTurret: StationModule = {
  id: 'defense_turret',
  name: 'Torreta Defensiva',
  type: 'defense_turret',
  description: 'Torreta automática de defensa punto contra naves pequeñas.',
  maxLevel: 20,
  slotSize: 1,
  icon: '🎯',
  requirements: { stationLevel: 2 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.4, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(3000 * multiplier),
        plasma: Math.floor(2000 * multiplier),
        credits: Math.floor(2500 * multiplier),
        energy: 0
      },
      buildTimeHours: level,
      effects: {
        defenseAttack: 50 * level,
        weaponSlots: Math.min(Math.floor(level / 4), 3)
      },
      health: 1500 + (200 * level)
    };
  })
};

// ============================================
// TODOS LOS MÓDULOS
// ============================================
export const ALL_STATION_MODULES: StationModule[] = [
  stationCore,
  hangarModule,
  weaponPlatform,
  shieldGenerator,
  radarArray,
  repairBay,
  tradingPost,
  stationResearchLab,
  resourceSilo,
  defenseTurret
];

// ============================================
// CONFIGURACIÓN DE SPACE STATION
// ============================================
export const SPACE_STATION_CONFIG = {
  // Slots disponibles por nivel de estación
  SLOTS_PER_LEVEL: [
    { level: 1, slots: 4 },    // Solo núcleo
    { level: 2, slots: 8 },    // +4 slots
    { level: 3, slots: 12 },
    { level: 4, slots: 16 },
    { level: 5, slots: 20 },
    { level: 6, slots: 24 },
    { level: 7, slots: 28 },
    { level: 8, slots: 32 },
    { level: 9, slots: 36 },
    { level: 10, slots: 40 }   // Máximo
  ],
  
  // Capacidad base de flota defensiva
  BASE_DEFENSIVE_FLEET_CAPACITY: 50,
  
  // Rango de detección base
  BASE_RADAR_RANGE: 10,
  
  // Costo de construcción inicial
  INITIAL_COST: {
    metal: 100000,
    plasma: 50000,
    credits: 80000,
    energy: 0
  },
  
  // Tiempo de construcción inicial (horas)
  INITIAL_BUILD_TIME_HOURS: 24,
  
  // Bonus máximos
  MAX_TRADE_BONUS: 20,      // -20% fee
  MAX_RESEARCH_SPEED: 30,   // -30% tiempo
  MAX_REPAIR_SPEED: 75      // +75% velocidad
};

// ============================================
// FLOTAS DEFENSIVAS DE LA ESTACIÓN
// ============================================
export interface DefensiveFleet {
  id: string;
  name: string;
  ships: {
    hullId: string;
    count: number;
    commanderId?: string;
  }[];
  formation: 'defensive' | 'balanced' | 'aggressive';
  priority: 'attack' | 'defend' | 'patrol';
}

export const DEFAULT_DEFENSIVE_FLEETS: DefensiveFleet[] = [
  {
    id: 'defense_alpha',
    name: 'Flota Alpha',
    ships: [
      { hullId: 'frigate_t3', count: 20 },
      { hullId: 'cruiser_t2', count: 10 }
    ],
    formation: 'defensive',
    priority: 'defend'
  },
  {
    id: 'defense_beta',
    name: 'Flota Beta',
    ships: [
      { hullId: 'frigate_t2', count: 30 },
      { hullId: 'cruiser_t1', count: 15 },
      { hullId: 'battleship_t1', count: 5 }
    ],
    formation: 'balanced',
    priority: 'patrol'
  }
];

// ============================================
// ESTADÍSTICAS DE LA ESTACIÓN
// ============================================
export interface StationStats {
  totalSlots: number;
  usedSlots: number;
  availableSlots: number;
  fleetCapacity: number;
  shieldStrength: number;
  totalAttack: number;
  radarRange: number;
  repairSpeed: number;
  tradeBonus: number;
  researchSpeed: number;
  storageCapacity: number;
  totalHealth: number;
}

export function calculateStationStats(
  stationLevel: number,
  installedModules: { moduleId: string; level: number }[]
): StationStats {
  // Calcular slots totales
  const slotsConfig = SPACE_STATION_CONFIG.SLOTS_PER_LEVEL.find(s => s.level === stationLevel);
  const totalSlots = slotsConfig?.slots || 4;
  
  // Calcular slots usados
  let usedSlots = 0;
  for (const mod of installedModules) {
    const moduleData = ALL_STATION_MODULES.find(m => m.id === mod.moduleId);
    if (moduleData) {
      usedSlots += moduleData.slotSize;
    }
  }
  
  // Acumular efectos de todos los módulos
  const stats: StationStats = {
    totalSlots,
    usedSlots,
    availableSlots: totalSlots - usedSlots,
    fleetCapacity: SPACE_STATION_CONFIG.BASE_DEFENSIVE_FLEET_CAPACITY,
    shieldStrength: 0,
    totalAttack: 0,
    radarRange: SPACE_STATION_CONFIG.BASE_RADAR_RANGE,
    repairSpeed: 0,
    tradeBonus: 0,
    researchSpeed: 0,
    storageCapacity: 0,
    totalHealth: 0
  };
  
  for (const mod of installedModules) {
    const moduleData = ALL_STATION_MODULES.find(m => m.id === mod.moduleId);
    if (!moduleData) continue;
    
    const levelData = moduleData.levels[mod.level - 1];
    if (!levelData) continue;
    
    // Sumar efectos
    if (levelData.effects.fleetCapacity) stats.fleetCapacity += levelData.effects.fleetCapacity;
    if (levelData.effects.shieldStrength) stats.shieldStrength += levelData.effects.shieldStrength;
    if (levelData.effects.defenseAttack) stats.totalAttack += levelData.effects.defenseAttack;
    if (levelData.effects.radarRange) stats.radarRange += levelData.effects.radarRange;
    if (levelData.effects.repairSpeed) stats.repairSpeed += levelData.effects.repairSpeed;
    if (levelData.effects.tradeBonus) stats.tradeBonus += levelData.effects.tradeBonus;
    if (levelData.effects.researchSpeed) stats.researchSpeed += levelData.effects.researchSpeed;
    if (levelData.effects.storageCapacity) stats.storageCapacity += levelData.effects.storageCapacity;
    
    stats.totalHealth += levelData.health;
  }
  
  return stats;
}

// ============================================
// COSTO TOTAL DE LA ESTACIÓN
// ============================================
export function calculateStationTotalCost(
  stationLevel: number,
  installedModules: { moduleId: string; level: number }[]
): Record<ResourceKey, number> {
  const total: Record<ResourceKey, number> = { metal: 0, plasma: 0, credits: 0, energy: 0 };
  
  // Costo base de la estación
  const baseMultiplier = Math.pow(1.5, stationLevel - 1);
  total.metal += SPACE_STATION_CONFIG.INITIAL_COST.metal * baseMultiplier;
  total.plasma += SPACE_STATION_CONFIG.INITIAL_COST.plasma * baseMultiplier;
  total.credits += SPACE_STATION_CONFIG.INITIAL_COST.credits * baseMultiplier;
  
  // Costo de módulos
  for (const mod of installedModules) {
    const moduleData = ALL_STATION_MODULES.find(m => m.id === mod.moduleId);
    if (!moduleData) continue;
    
    const levelData = moduleData.levels[mod.level - 1];
    if (!levelData) continue;
    
    total.metal += levelData.cost.metal;
    total.plasma += levelData.cost.plasma;
    total.credits += levelData.cost.credits;
    total.energy += levelData.cost.energy;
  }
  
  return total;
}

// ============================================
// SISTEMA DE ATAQUE/DEFENSA DE LA ESTACIÓN
// ============================================
export interface StationCombatStats {
  totalAttack: number;
  totalDefense: number;
  shieldAbsorption: number;
  weaponRange: number;
  fleetSupport: number;
}

export function calculateStationCombatStats(
  stationLevel: number,
  installedModules: { moduleId: string; level: number }[],
  defensiveFleets: DefensiveFleet[]
): StationCombatStats {
  let totalAttack = 0;
  let totalDefense = 0;
  let shieldAbsorption = 0;
  let fleetSupport = 0;
  
  // Stats de módulos
  for (const mod of installedModules) {
    const moduleData = ALL_STATION_MODULES.find(m => m.id === mod.moduleId);
    if (!moduleData) continue;
    
    const levelData = moduleData.levels[mod.level - 1];
    if (!levelData) continue;
    
    if (levelData.effects.defenseAttack) totalAttack += levelData.effects.defenseAttack;
    if (levelData.effects.shieldStrength) shieldAbsorption += levelData.effects.shieldStrength;
  }
  
  // Stats de flotas defensivas
  for (const fleet of defensiveFleets) {
    for (const ship of fleet.ships) {
      fleetSupport += ship.count * 10; // Aproximación simplificada
    }
  }
  
  totalDefense = shieldAbsorption * 0.5; // Los escudos absorben 50% del daño
  
  return {
    totalAttack,
    totalDefense,
    shieldAbsorption,
    weaponRange: 50 + (stationLevel * 10),
    fleetSupport
  };
}

// ============================================
// HELPERS
// ============================================
export function getModuleById(id: string): StationModule | undefined {
  return ALL_STATION_MODULES.find(m => m.id === id);
}

export function getModulesByType(type: StationModuleType): StationModule[] {
  return ALL_STATION_MODULES.filter(m => m.type === type);
}

export function canInstallModule(
  moduleId: string,
  stationLevel: number,
  currentModules: { moduleId: string; level: number }[]
): { canInstall: boolean; reason?: string } {
  const module = getModuleById(moduleId);
  if (!module) return { canInstall: false, reason: 'Módulo no existe' };
  
  // Verificar requisitos
  if (module.requirements?.stationLevel && stationLevel < module.requirements.stationLevel) {
    return { canInstall: false, reason: `Requiere estación nivel ${module.requirements.stationLevel}` };
  }
  
  // Verificar slots disponibles
  const stats = calculateStationStats(stationLevel, currentModules);
  if (stats.availableSlots < module.slotSize) {
    return { canInstall: false, reason: 'Slots insuficientes' };
  }
  
  return { canInstall: true };
}

export function getUpgradeCostForModule(
  moduleId: string,
  currentLevel: number
): Record<ResourceKey, number> | null {
  const module = getModuleById(moduleId);
  if (!module) return null;
  
  const nextLevel = module.levels[currentLevel];
  if (!nextLevel) return null; // Ya está en nivel máximo
  
  return nextLevel.cost;
}

export const SpaceStationSystem = {
  ALL_STATION_MODULES,
  SPACE_STATION_CONFIG,
  DEFAULT_DEFENSIVE_FLEETS,
  calculateStationStats,
  calculateStationTotalCost,
  calculateStationCombatStats,
  getModuleById,
  getModulesByType,
  canInstallModule,
  getUpgradeCostForModule
};
