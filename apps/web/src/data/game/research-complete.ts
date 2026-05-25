/**
 * DATOS COMPLETOS DE INVESTIGACIONES/CIENCIAS - GALAXY ONLINE II
 * Árbol de tecnología con niveles 1-20
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

export interface ResearchLevel {
  level: number;
  cost: Record<ResourceKey, number>;
  researchTimeMinutes: number;
  effects: string[];
  bonusPercent: number;
}

export interface ResearchComplete {
  id: string;
  name: string;
  description: string;
  category: 'logistics' | 'defense' | 'weapon' | 'ship' | 'production';
  maxLevel: number;
  levels: ResearchLevel[];
  unlockRequirement?: {
    researchId?: string;
    level?: number;
    buildingId?: string;
  };
  icon: string;
}

// ============================================
// 1. LOGISTICS CONSTRUCTION SCIENCE
// ============================================
export const logisticsScience: ResearchComplete = {
  id: 'logistics_construction',
  name: 'Ciencia de Construcción Logística',
  description: 'Reduce tiempo de construcción de edificios y mejora eficiencia de transporte.',
  category: 'logistics',
  maxLevel: 20,
  icon: '🏗️',
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.6, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(500 * multiplier),
        plasma: Math.floor(300 * multiplier),
        credits: Math.floor(400 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 30,
      effects: [`Reduce tiempo de construcción ${level * 2}%`],
      bonusPercent: level * 2
    };
  })
};

// ============================================
// 2. PLANETARY DEFENSE SCIENCE
// ============================================
export const defenseScience: ResearchComplete = {
  id: 'planetary_defense',
  name: 'Ciencia de Defensa Planetaria',
  description: 'Mejora defensas planetarias, radar y escudos orbitales.',
  category: 'defense',
  maxLevel: 20,
  icon: '🛡️',
  unlockRequirement: { researchId: 'logistics_construction', level: 5 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.7, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(600 * multiplier),
        plasma: Math.floor(400 * multiplier),
        credits: Math.floor(500 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 35,
      effects: [`+${level * 3}% defensa de estructuras`, `+${level * 2}% alcance de radar`],
      bonusPercent: level * 3
    };
  })
};

// ============================================
// 3. BALLISTICS SCIENCE (Armas Balísticas)
// ============================================
export const ballisticsScience: ResearchComplete = {
  id: 'ballistics',
  name: 'Ciencia Balística',
  description: 'Mejora daño, precisión y eficiencia de armas balísticas y de cañones.',
  category: 'weapon',
  maxLevel: 20,
  icon: '🔫',
  unlockRequirement: { researchId: 'planetary_defense', level: 5 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.8, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(800 * multiplier),
        plasma: Math.floor(600 * multiplier),
        credits: Math.floor(700 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 40,
      effects: [`+${level * 2.5}% daño balístico`, `+${level}% precisión`],
      bonusPercent: level * 2.5
    };
  })
};

// ============================================
// 4. DIRECTIONAL SCIENCE (Armas Direccionales)
// ============================================
export const directionalScience: ResearchComplete = {
  id: 'directional',
  name: 'Ciencia de Armas Direccionales',
  description: 'Mejora daño, alcance y penetración de láseres y cañones de energía.',
  category: 'weapon',
  maxLevel: 20,
  icon: '⚡',
  unlockRequirement: { researchId: 'planetary_defense', level: 5 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.8, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(800 * multiplier),
        plasma: Math.floor(600 * multiplier),
        credits: Math.floor(700 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 40,
      effects: [`+${level * 2.5}% daño direccional`, `+${level}% alcance`],
      bonusPercent: level * 2.5
    };
  })
};

// ============================================
// 5. MISSILE SCIENCE
// ============================================
export const missileScience: ResearchComplete = {
  id: 'missile',
  name: 'Ciencia de Misiles',
  description: 'Mejora daño, recarga y guía de sistemas de misiles.',
  category: 'weapon',
  maxLevel: 20,
  icon: '🚀',
  unlockRequirement: { researchId: 'ballistics', level: 10, buildingId: 'research_lab' },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.9, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(1000 * multiplier),
        plasma: Math.floor(800 * multiplier),
        credits: Math.floor(900 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 45,
      effects: [`+${level * 3}% daño de misiles`, `-${Math.min(level, 20)}% tiempo de recarga`],
      bonusPercent: level * 3
    };
  })
};

// ============================================
// 6. SHIP-BASED SCIENCE
// ============================================
export const shipBasedScience: ResearchComplete = {
  id: 'ship_based',
  name: 'Ciencia Ship-Based',
  description: 'Mejora sistemas pesados, torpedos y armas planetarias.',
  category: 'weapon',
  maxLevel: 20,
  icon: '🛸',
  unlockRequirement: { researchId: 'missile', level: 10 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(2, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(1200 * multiplier),
        plasma: Math.floor(900 * multiplier),
        credits: Math.floor(1000 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 50,
      effects: [`+${level * 2}% daño ship-based`, `+${level}% estabilidad de armas`],
      bonusPercent: level * 2
    };
  })
};

// ============================================
// 7. SHIP DEFENSE SCIENCE
// ============================================
export const shipDefenseScience: ResearchComplete = {
  id: 'ship_defense',
  name: 'Ciencia de Defensa de Naves',
  description: 'Mejora estructura, escudos y estabilidad de naves.',
  category: 'ship',
  maxLevel: 20,
  icon: '🔧',
  unlockRequirement: { researchId: 'ship_based', level: 5 },
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.75, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(900 * multiplier),
        plasma: Math.floor(700 * multiplier),
        credits: Math.floor(800 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 42,
      effects: [`+${level * 2.5}% estructura de naves`, `+${level * 2}% regeneración de escudos`],
      bonusPercent: level * 2.5
    };
  })
};

// ============================================
// 8. ENERGY EFFICIENCY
// ============================================
export const energyEfficiency: ResearchComplete = {
  id: 'energy_efficiency',
  name: 'Eficiencia Energética',
  description: 'Reduce consumo de energía de todos los edificios.',
  category: 'production',
  maxLevel: 15,
  icon: '🔋',
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(400 * multiplier),
        plasma: Math.floor(600 * multiplier),
        credits: Math.floor(500 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 25,
      effects: [`-${level * 2}% consumo de energía`],
      bonusPercent: -(level * 2)
    };
  })
};

// ============================================
// 9. RESOURCE PRODUCTION
// ============================================
export const resourceProduction: ResearchComplete = {
  id: 'resource_production',
  name: 'Producción de Recursos',
  description: 'Aumenta producción de extractores de metal y refinerías de plasma.',
  category: 'production',
  maxLevel: 20,
  icon: '⚙️',
  levels: Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.65, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(700 * multiplier),
        plasma: Math.floor(400 * multiplier),
        credits: Math.floor(600 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 35,
      effects: [`+${level * 3}% producción de recursos`],
      bonusPercent: level * 3
    };
  })
};

// ============================================
// 10. FLEET COMMAND
// ============================================
export const fleetCommand: ResearchComplete = {
  id: 'fleet_command',
  name: 'Comando de Flotas',
  description: 'Aumenta capacidad de comandamiento y efectividad de flotas.',
  category: 'ship',
  maxLevel: 15,
  icon: '📡',
  unlockRequirement: { researchId: 'ship_defense', level: 10 },
  levels: Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.8, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(1500 * multiplier),
        plasma: Math.floor(1000 * multiplier),
        credits: Math.floor(1200 * multiplier),
        energy: 0
      },
      researchTimeMinutes: level * 60,
      effects: [`+${level * 2}% capacidad de flota`, `+${level}% velocidad de navegación`],
      bonusPercent: level * 2
    };
  })
};

// ============================================
// TODAS LAS INVESTIGACIONES
// ============================================
export const ALL_RESEARCH_COMPLETE: ResearchComplete[] = [
  logisticsScience,
  defenseScience,
  ballisticsScience,
  directionalScience,
  missileScience,
  shipBasedScience,
  shipDefenseScience,
  energyEfficiency,
  resourceProduction,
  fleetCommand
];

// Árbol de dependencias
export const RESEARCH_TREE = {
  logistics_construction: { requires: null },
  planetary_defense: { requires: { id: 'logistics_construction', level: 5 } },
  ballistics: { requires: { id: 'planetary_defense', level: 5 } },
  directional: { requires: { id: 'planetary_defense', level: 5 } },
  missile: { requires: { id: 'ballistics', level: 10 } },
  ship_based: { requires: { id: 'missile', level: 10 } },
  ship_defense: { requires: { id: 'ship_based', level: 5 } },
  energy_efficiency: { requires: null },
  resource_production: { requires: null },
  fleet_command: { requires: { id: 'ship_defense', level: 10 } }
};

// Helpers
export function getResearchById(id: string): ResearchComplete | undefined {
  return ALL_RESEARCH_COMPLETE.find(r => r.id === id);
}

export function canResearch(id: string, completedResearch: Map<string, number>): boolean {
  const research = getResearchById(id);
  if (!research) return false;
  
  if (!research.unlockRequirement) return true;
  
  const { researchId, level } = research.unlockRequirement;
  if (!researchId || !level) return true;
  
  const completedLevel = completedResearch.get(researchId) || 0;
  return completedLevel >= level;
}

export function getResearchPath(id: string): string[] {
  const path: string[] = [];
  let currentId: string | null = id;
  
  while (currentId) {
    path.unshift(currentId);
    const node = RESEARCH_TREE[currentId as keyof typeof RESEARCH_TREE] as { requires?: { id?: string } } | undefined;
    currentId = node?.requires?.id ?? null;
  }
  
  return path;
}
