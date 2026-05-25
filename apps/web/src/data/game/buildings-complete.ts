/**
 * DATOS COMPLETOS DE EDIFICIOS - GALAXY ONLINE II
 * Niveles 1-20 con costos, producción, tiempos y capacidades
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { BuildingType, ResourceKey } from '@/components/game/game-data';

export interface BuildingLevel {
  level: number;
  cost: Record<ResourceKey, number>;
  productionPerHour?: {
    metal?: number;
    plasma?: number;
    energy?: number;
    credits?: number;
  };
  consumptionPerHour?: {
    energy?: number;
  };
  capacityBonus?: {
    metal?: number;
    plasma?: number;
  };
  buildTimeMinutes: number;
  health: number;
}

export interface BuildingComplete {
  id: string;
  type: BuildingType;
  name: string;
  description: string;
  category: 'production' | 'storage' | 'infrastructure' | 'military' | 'research' | 'defense';
  maxLevel: number;
  levels: BuildingLevel[];
  unlockRequirement?: {
    buildingId?: string;
    level?: number;
  };
  glow: 'cyan' | 'purple' | 'gold' | 'green' | 'orange' | 'red';
}

// ============================================
// 1. EXTRACTOR DE METAL (Metal Collector)
// ============================================
export const metalExtractor: BuildingComplete = {
  id: 'metal_extractor',
  type: 'metal_extractor',
  name: 'Extractor de Metal',
  description: 'Extrae minerales metálicos desde la corteza del planeta. Producción base: 20 metal/hora por nivel.',
  category: 'production',
  maxLevel: 20,
  glow: 'cyan',
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(60 * multiplier),
        plasma: Math.floor(10 * multiplier),
        credits: Math.floor(50 * multiplier),
        energy: 0
      },
      productionPerHour: { metal: 20 * level },
      consumptionPerHour: { energy: 2 * level },
      buildTimeMinutes: level <= 5 ? level : Math.floor(level * 1.5),
      health: 200 + (40 * (level - 1))
    };
  })
};

// ============================================
// 2. REFINERÍA DE PLASMA (HE3 Extractor)
// ============================================
export const plasmaRefinery: BuildingComplete = {
  id: 'plasma_refinery',
  type: 'plasma_refinery',
  name: 'Refinería de Plasma',
  description: 'Procesa plasma bruto extraído del subsuelo para tecnologías avanzadas. Producción: 10 plasma/hora por nivel.',
  category: 'production',
  maxLevel: 20,
  glow: 'purple',
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.6, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(100 * multiplier),
        plasma: Math.floor(50 * multiplier),
        credits: Math.floor(80 * multiplier),
        energy: 0
      },
      productionPerHour: { plasma: 10 * level },
      consumptionPerHour: { energy: 3 * level },
      buildTimeMinutes: level <= 5 ? level + 1 : Math.floor(level * 2),
      health: 180 + (36 * (level - 1))
    };
  })
};

// ============================================
// 3. ALMACÉN (Resource Warehouse)
// ============================================
export const warehouse: BuildingComplete = {
  id: 'warehouse',
  type: 'warehouse',
  name: 'Almacén',
  description: 'Aumenta la capacidad máxima de almacenamiento de recursos. +500 metal y +300 plasma por nivel.',
  category: 'storage',
  maxLevel: 15,
  glow: 'gold',
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.4, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(200 * multiplier),
        plasma: Math.floor(150 * multiplier),
        credits: Math.floor(250 * multiplier),
        energy: 0
      },
      capacityBonus: {
        metal: 500 * level,
        plasma: 300 * level
      },
      buildTimeMinutes: level <= 3 ? level : Math.floor(level * 1.2),
      health: 250 + (25 * (level - 1))
    };
  })
};

// ============================================
// 4. GENERADOR DE ENERGÍA
// ============================================
export const energyGenerator: BuildingComplete = {
  id: 'energy_generator',
  type: 'energy_generator',
  name: 'Generador de Energía',
  description: 'Genera energía eléctrica para mantener operativos los edificios. Producción: 50 energía/hora por nivel.',
  category: 'infrastructure',
  maxLevel: 20,
  glow: 'green',
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.45, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(150 * multiplier),
        plasma: Math.floor(80 * multiplier),
        credits: Math.floor(120 * multiplier),
        energy: 0
      },
      productionPerHour: { energy: 50 * level },
      buildTimeMinutes: level <= 5 ? level : Math.floor(level * 1.3),
      health: 150 + (30 * (level - 1))
    };
  })
};

// ============================================
// 5. CENTRO DE CONTROL (Civic/Command Center)
// ============================================
export const controlCenter: BuildingComplete = {
  id: 'control_center',
  type: 'control_center',
  name: 'Centro de Control',
  description: 'Coordina la defensa, construcción e investigación. Desbloquea edificios avanzados.',
  category: 'infrastructure',
  maxLevel: 10,
  glow: 'cyan',
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(2, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(500 * multiplier),
        plasma: Math.floor(300 * multiplier),
        credits: Math.floor(400 * multiplier),
        energy: 0
      },
      productionPerHour: { credits: 5 * level },
      consumptionPerHour: { energy: 10 * level },
      buildTimeMinutes: level * 5,
      health: 500 + (100 * (level - 1))
    };
  }),
  unlockRequirement: { buildingId: 'energy_generator', level: 2 }
};

// ============================================
// 6. ASTILLERO (Shipyard)
// ============================================
export const shipyard: BuildingComplete = {
  id: 'shipyard',
  type: 'shipyard',
  name: 'Astillero',
  description: 'Permite construir y reparar naves espaciales. Necesario para flotas militares.',
  category: 'military',
  maxLevel: 15,
  glow: 'orange',
  unlockRequirement: { buildingId: 'control_center', level: 3 },
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.8, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(1000 * multiplier),
        plasma: Math.floor(600 * multiplier),
        credits: Math.floor(800 * multiplier),
        energy: 0
      },
      consumptionPerHour: { energy: 20 * level },
      buildTimeMinutes: level * 10,
      health: 800 + (80 * (level - 1))
    };
  })
};

// ============================================
// 7. LABORATORIO (Research Lab)
// ============================================
export const researchLab: BuildingComplete = {
  id: 'research_lab',
  type: 'research_lab',
  name: 'Laboratorio de Investigación',
  description: 'Desarrolla nuevas tecnologías y mejoras para edificios y naves.',
  category: 'research',
  maxLevel: 20,
  glow: 'purple',
  unlockRequirement: { buildingId: 'control_center', level: 2 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.6, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(800 * multiplier),
        plasma: Math.floor(500 * multiplier),
        credits: Math.floor(700 * multiplier),
        energy: 0
      },
      consumptionPerHour: { energy: 15 * level },
      buildTimeMinutes: level * 8,
      health: 400 + (40 * (level - 1))
    };
  })
};

// ============================================
// 8. HANGAR
// ============================================
export const hangar: BuildingComplete = {
  id: 'hangar',
  type: 'hangar',
  name: 'Hangar',
  description: 'Almacena y despliega flotas de combate. Cada nivel aumenta capacidad de naves.',
  category: 'military',
  maxLevel: 15,
  glow: 'cyan',
  unlockRequirement: { buildingId: 'shipyard', level: 1 },
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(600 * multiplier),
        plasma: Math.floor(400 * multiplier),
        credits: Math.floor(500 * multiplier),
        energy: 0
      },
      consumptionPerHour: { energy: 10 * level },
      buildTimeMinutes: level * 6,
      health: 600 + (60 * (level - 1))
    };
  })
};

// ============================================
// 9. TORRETA DE DEFENSA
// ============================================
export const defenseTurret: BuildingComplete = {
  id: 'defense_turret',
  type: 'defense_turret',
  name: 'Torreta de Defensa',
  description: 'Sistema de defensa orbital que protege la base de ataques enemigos.',
  category: 'defense',
  maxLevel: 10,
  glow: 'red',
  unlockRequirement: { buildingId: 'research_lab', level: 3 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.7, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(900 * multiplier),
        plasma: Math.floor(300 * multiplier),
        credits: Math.floor(400 * multiplier),
        energy: 0
      },
      consumptionPerHour: { energy: 8 * level },
      buildTimeMinutes: level * 12,
      health: 1000 + (100 * (level - 1))
    };
  })
};

// ============================================
// 10. CENTRO DE COMERCIO
// ============================================
export const tradingCenter: BuildingComplete = {
  id: 'trading_center',
  type: 'control_center', // Using existing type as placeholder
  name: 'Centro de Comercio',
  description: 'Permite intercambiar recursos con otros jugadores y acceder al mercado galáctico.',
  category: 'infrastructure',
  maxLevel: 10,
  glow: 'gold',
  unlockRequirement: { buildingId: 'control_center', level: 2 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(400 * multiplier),
        plasma: Math.floor(200 * multiplier),
        credits: Math.floor(600 * multiplier),
        energy: 0
      },
      productionPerHour: { credits: 10 * level },
      consumptionPerHour: { energy: 5 * level },
      buildTimeMinutes: level * 7,
      health: 350 + (35 * (level - 1))
    };
  })
};

// ============================================
// 11. RADAR
// ============================================
export const radar: BuildingComplete = {
  id: 'radar',
  type: 'control_center', // Using existing type
  name: 'Radar',
  description: 'Detecta flotas enemigas aproximándose. Mayor nivel = mayor alcance de detección.',
  category: 'defense',
  maxLevel: 10,
  glow: 'cyan',
  unlockRequirement: { buildingId: 'control_center', level: 1 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.4, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(300 * multiplier),
        plasma: Math.floor(100 * multiplier),
        credits: Math.floor(200 * multiplier),
        energy: 0
      },
      consumptionPerHour: { energy: 3 * level },
      buildTimeMinutes: level * 4,
      health: 200 + (20 * (level - 1))
    };
  })
};

// ============================================
// 12. ÁREA RESIDENCIAL
// ============================================
export const residentialArea: BuildingComplete = {
  id: 'residential_area',
  type: 'control_center',
  name: 'Área Residencial',
  description: 'Aumenta la población máxima del planeta. Población necesaria para edificios avanzados.',
  category: 'infrastructure',
  maxLevel: 20,
  glow: 'green',
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.3, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(150 * multiplier),
        plasma: Math.floor(50 * multiplier),
        credits: Math.floor(100 * multiplier),
        energy: 0
      },
      buildTimeMinutes: level,
      health: 150 + (15 * (level - 1))
    };
  })
};

// ============================================
// TODOS LOS EDIFICIOS
// ============================================
export const ALL_BUILDINGS_COMPLETE: BuildingComplete[] = [
  metalExtractor,
  plasmaRefinery,
  warehouse,
  energyGenerator,
  controlCenter,
  shipyard,
  researchLab,
  hangar,
  defenseTurret,
  tradingCenter,
  radar,
  residentialArea
];

// Helper para obtener edificio por ID
export function getBuildingById(id: string): BuildingComplete | undefined {
  return ALL_BUILDINGS_COMPLETE.find(b => b.id === id);
}

// Helper para calcular costo total de upgrade
export function calculateUpgradeCost(buildingId: string, fromLevel: number, toLevel: number): Record<ResourceKey, number> {
  const building = getBuildingById(buildingId);
  if (!building) return { metal: 0, plasma: 0, credits: 0, energy: 0 };
  
  const total = { metal: 0, plasma: 0, credits: 0, energy: 0 };
  
  for (let i = fromLevel; i < toLevel; i++) {
    const levelData = building.levels[i];
    if (levelData) {
      total.metal += levelData.cost.metal;
      total.plasma += levelData.cost.plasma;
      total.credits += levelData.cost.credits;
      total.energy += levelData.cost.energy;
    }
  }
  
  return total;
}

// Helper para calcular producción total
export function calculateTotalProduction(buildingId: string, level: number): { metal?: number; plasma?: number; energy?: number; credits?: number } {
  const building = getBuildingById(buildingId);
  if (!building) return {};
  
  const levelData = building.levels[level - 1];
  if (!levelData || !levelData.productionPerHour) return {};
  
  return levelData.productionPerHour;
}
