/**
 * DATOS COMPLETOS DE NAVES Y MÓDULOS - GALAXY ONLINE II
 * Hulls, armas, defensas y sistemas auxiliares
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS DE HULLS
// ============================================
export type HullType = 'frigate' | 'cruiser' | 'battleship' | 'special' | 'flagship';
export type ModuleType = 'weapon_ballistic' | 'weapon_directional' | 'weapon_missile' | 'weapon_ship_based' | 'defense_structure' | 'defense_shield' | 'defense_air' | 'auxiliary_electronic' | 'auxiliary_storage' | 'auxiliary_transmission';

export interface HullStats {
  structure: number;
  stability: number;
  speed: number;
  moduleSlots: Record<ModuleType, number>;
}

export interface ShipHull {
  id: string;
  name: string;
  type: HullType;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  stats: HullStats;
  buildCost: Record<ResourceKey, number>;
  buildTimeMinutes: number;
  unlockRequirement?: {
    researchId?: string;
    level?: number;
  };
  icon: string;
}

// ============================================
// TIPOS DE MÓDULOS
// ============================================
export interface ShipModule {
  id: string;
  name: string;
  type: ModuleType;
  tier: 1 | 2 | 3 | 4 | 5;
  description: string;
  stats: {
    attack?: number;
    defense?: number;
    structure?: number;
    shield?: number;
    range?: number;
    accuracy?: number;
    evasion?: number;
  };
  buildCost: Record<ResourceKey, number>;
  researchRequired?: {
    researchId: string;
    level: number;
  };
}

// ============================================
// HULLS - FRIGATAS
// ============================================
export const frigates: ShipHull[] = [
  {
    id: 'frigate_t1',
    name: 'Fragata Ligera',
    type: 'frigate',
    description: 'Nave rápida y económica. Ideal para exploración y escaramuzas.',
    tier: 1,
    stats: {
      structure: 200,
      stability: 50,
      speed: 120,
      moduleSlots: {
        weapon_ballistic: 2,
        weapon_directional: 1,
        weapon_missile: 0,
        weapon_ship_based: 0,
        defense_structure: 1,
        defense_shield: 1,
        defense_air: 1,
        auxiliary_electronic: 1,
        auxiliary_storage: 0,
        auxiliary_transmission: 1
      }
    },
    buildCost: { metal: 500, plasma: 100, credits: 200, energy: 0 },
    buildTimeMinutes: 5,
    icon: '🚀'
  },
  {
    id: 'frigate_t2',
    name: 'Fragata de Intercepción',
    type: 'frigate',
    description: 'Fragata mejorada con más armamento y escudos.',
    tier: 2,
    stats: {
      structure: 350,
      stability: 80,
      speed: 130,
      moduleSlots: {
        weapon_ballistic: 3,
        weapon_directional: 2,
        weapon_missile: 1,
        weapon_ship_based: 0,
        defense_structure: 2,
        defense_shield: 2,
        defense_air: 1,
        auxiliary_electronic: 1,
        auxiliary_storage: 1,
        auxiliary_transmission: 1
      }
    },
    buildCost: { metal: 1200, plasma: 400, credits: 600, energy: 0 },
    buildTimeMinutes: 12,
    unlockRequirement: { researchId: 'ship_defense', level: 3 },
    icon: '🚀'
  },
  {
    id: 'frigate_t3',
    name: 'Fragata de Asalto',
    type: 'frigate',
    description: 'Fragata pesada diseñada para ataques rápidos y letales.',
    tier: 3,
    stats: {
      structure: 500,
      stability: 120,
      speed: 140,
      moduleSlots: {
        weapon_ballistic: 3,
        weapon_directional: 3,
        weapon_missile: 2,
        weapon_ship_based: 0,
        defense_structure: 2,
        defense_shield: 2,
        defense_air: 2,
        auxiliary_electronic: 2,
        auxiliary_storage: 1,
        auxiliary_transmission: 1
      }
    },
    buildCost: { metal: 2500, plasma: 1000, credits: 1500, energy: 0 },
    buildTimeMinutes: 20,
    unlockRequirement: { researchId: 'ship_defense', level: 8 },
    icon: '🚀'
  }
];

// ============================================
// HULLS - CRUCEROS
// ============================================
export const cruisers: ShipHull[] = [
  {
    id: 'cruiser_t1',
    name: 'Crucero Ligero',
    type: 'cruiser',
    description: 'Nave equilibrada, backbone de cualquier flota.',
    tier: 1,
    stats: {
      structure: 500,
      stability: 100,
      speed: 90,
      moduleSlots: {
        weapon_ballistic: 4,
        weapon_directional: 3,
        weapon_missile: 2,
        weapon_ship_based: 1,
        defense_structure: 3,
        defense_shield: 3,
        defense_air: 2,
        auxiliary_electronic: 2,
        auxiliary_storage: 2,
        auxiliary_transmission: 1
      }
    },
    buildCost: { metal: 1500, plasma: 600, credits: 1000, energy: 0 },
    buildTimeMinutes: 15,
    icon: '🛸'
  },
  {
    id: 'cruiser_t2',
    name: 'Crucero Pesado',
    type: 'cruiser',
    description: 'Crucero mejorado con más armamento y defensas.',
    tier: 2,
    stats: {
      structure: 900,
      stability: 180,
      speed: 85,
      moduleSlots: {
        weapon_ballistic: 5,
        weapon_directional: 4,
        weapon_missile: 3,
        weapon_ship_based: 2,
        defense_structure: 4,
        defense_shield: 4,
        defense_air: 3,
        auxiliary_electronic: 3,
        auxiliary_storage: 3,
        auxiliary_transmission: 2
      }
    },
    buildCost: { metal: 3500, plasma: 1500, credits: 2500, energy: 0 },
    buildTimeMinutes: 30,
    unlockRequirement: { researchId: 'ship_defense', level: 5 },
    icon: '🛸'
  },
  {
    id: 'cruiser_t3',
    name: 'Crucero de Batalla',
    type: 'cruiser',
    description: 'Crucero de élite con capacidades ofensivas superiores.',
    tier: 3,
    stats: {
      structure: 1500,
      stability: 300,
      speed: 80,
      moduleSlots: {
        weapon_ballistic: 6,
        weapon_directional: 5,
        weapon_missile: 4,
        weapon_ship_based: 3,
        defense_structure: 5,
        defense_shield: 5,
        defense_air: 4,
        auxiliary_electronic: 4,
        auxiliary_storage: 4,
        auxiliary_transmission: 2
      }
    },
    buildCost: { metal: 8000, plasma: 4000, credits: 6000, energy: 0 },
    buildTimeMinutes: 60,
    unlockRequirement: { researchId: 'ship_defense', level: 12 },
    icon: '🛸'
  }
];

// ============================================
// HULLS - ACORAZADOS
// ============================================
export const battleships: ShipHull[] = [
  {
    id: 'battleship_t1',
    name: 'Acorazado',
    type: 'battleship',
    description: 'Nave capital con armamento devastador y blindaje pesado.',
    tier: 1,
    stats: {
      structure: 1500,
      stability: 200,
      speed: 50,
      moduleSlots: {
        weapon_ballistic: 6,
        weapon_directional: 5,
        weapon_missile: 5,
        weapon_ship_based: 4,
        defense_structure: 6,
        defense_shield: 6,
        defense_air: 4,
        auxiliary_electronic: 4,
        auxiliary_storage: 5,
        auxiliary_transmission: 3
      }
    },
    buildCost: { metal: 5000, plasma: 2500, credits: 4000, energy: 0 },
    buildTimeMinutes: 45,
    unlockRequirement: { researchId: 'ship_defense', level: 8 },
    icon: '🛰️'
  },
  {
    id: 'battleship_t2',
    name: 'Acorazado de Asalto',
    type: 'battleship',
    description: 'Versión mejorada del acorazado con sistemas de combate avanzados.',
    tier: 2,
    stats: {
      structure: 2500,
      stability: 350,
      speed: 45,
      moduleSlots: {
        weapon_ballistic: 8,
        weapon_directional: 7,
        weapon_missile: 6,
        weapon_ship_based: 5,
        defense_structure: 8,
        defense_shield: 8,
        defense_air: 5,
        auxiliary_electronic: 5,
        auxiliary_storage: 6,
        auxiliary_transmission: 3
      }
    },
    buildCost: { metal: 12000, plasma: 6000, credits: 10000, energy: 0 },
    buildTimeMinutes: 90,
    unlockRequirement: { researchId: 'ship_defense', level: 15 },
    icon: '🛰️'
  },
  {
    id: 'battleship_t3',
    name: 'Mega Acorazado',
    type: 'battleship',
    description: 'La nave más poderosa del campo de batalla. Capaz de destruir flotas enteras.',
    tier: 3,
    stats: {
      structure: 5000,
      stability: 600,
      speed: 40,
      moduleSlots: {
        weapon_ballistic: 10,
        weapon_directional: 9,
        weapon_missile: 8,
        weapon_ship_based: 7,
        defense_structure: 10,
        defense_shield: 10,
        defense_air: 6,
        auxiliary_electronic: 6,
        auxiliary_storage: 8,
        auxiliary_transmission: 4
      }
    },
    buildCost: { metal: 30000, plasma: 15000, credits: 25000, energy: 0 },
    buildTimeMinutes: 180,
    unlockRequirement: { researchId: 'fleet_command', level: 10 },
    icon: '🛰️'
  }
];

// ============================================
// HULLS ESPECIALES Y FLAGSHIPS
// ============================================
export const specialHulls: ShipHull[] = [
  {
    id: 'flagship_command',
    name: 'Nave Capital de Comando',
    type: 'flagship',
    description: 'Nave insignia que proporciona bonuses a toda la flota.',
    tier: 5,
    stats: {
      structure: 8000,
      stability: 800,
      speed: 35,
      moduleSlots: {
        weapon_ballistic: 12,
        weapon_directional: 10,
        weapon_missile: 10,
        weapon_ship_based: 8,
        defense_structure: 12,
        defense_shield: 12,
        defense_air: 8,
        auxiliary_electronic: 8,
        auxiliary_storage: 10,
        auxiliary_transmission: 6
      }
    },
    buildCost: { metal: 100000, plasma: 50000, credits: 80000, energy: 0 },
    buildTimeMinutes: 360,
    unlockRequirement: { researchId: 'fleet_command', level: 15 },
    icon: '👑'
  }
];

// ============================================
// TODOS LOS HULLS
// ============================================
export const ALL_HULLS: ShipHull[] = [
  ...frigates,
  ...cruisers,
  ...battleships,
  ...specialHulls
];

// ============================================
// MÓDULOS DE ARMAS
// ============================================
export interface ShipModule {
  id: string;
  name: string;
  type: ModuleType;
  tier: 1 | 2 | 3 | 4 | 5;
  description: string;
  stats: {
    attack?: number;
    defense?: number;
    structure?: number;
    shield?: number;
    range?: number;
    accuracy?: number;
    evasion?: number;
  };
  buildCost: Record<ResourceKey, number>;
  researchRequired?: {
    researchId: string;
    level: number;
  };
}

// Armas Balísticas
export const ballisticWeapons: ShipModule[] = [
  { id: 'cannon_t1', name: 'Cañón de Cerrojo', type: 'weapon_ballistic', tier: 1, description: 'Arma balística básica.', stats: { attack: 20, range: 3, accuracy: 70 }, buildCost: { metal: 50, plasma: 10, credits: 30, energy: 0 } },
  { id: 'cannon_t2', name: 'Cañón de Plasma', type: 'weapon_ballistic', tier: 2, description: 'Cañón mejorado con plasma.', stats: { attack: 45, range: 3, accuracy: 75 }, buildCost: { metal: 150, plasma: 50, credits: 100, energy: 0 }, researchRequired: { researchId: 'ballistics', level: 3 } },
  { id: 'cannon_t3', name: 'Cañón de Neutrones', type: 'weapon_ballistic', tier: 3, description: 'Cañón de alta energía.', stats: { attack: 90, range: 4, accuracy: 80 }, buildCost: { metal: 400, plasma: 200, credits: 300, energy: 0 }, researchRequired: { researchId: 'ballistics', level: 8 } },
  { id: 'cannon_t4', name: 'Cañón de Iones', type: 'weapon_ballistic', tier: 4, description: 'Cañón de destrucción masiva.', stats: { attack: 180, range: 4, accuracy: 85 }, buildCost: { metal: 1200, plasma: 800, credits: 1000, energy: 0 }, researchRequired: { researchId: 'ballistics', level: 15 } },
  { id: 'cannon_t5', name: 'Cañón de Antimateria', type: 'weapon_ballistic', tier: 5, description: 'El arma balística definitiva.', stats: { attack: 400, range: 5, accuracy: 90 }, buildCost: { metal: 5000, plasma: 4000, credits: 5000, energy: 0 }, researchRequired: { researchId: 'ballistics', level: 20 } }
];

// Armas Direccionales (Lasers)
export const directionalWeapons: ShipModule[] = [
  { id: 'laser_t1', name: 'Láser de Pulso', type: 'weapon_directional', tier: 1, description: 'Láser básico.', stats: { attack: 25, range: 4, accuracy: 85 }, buildCost: { metal: 60, plasma: 20, credits: 40, energy: 0 } },
  { id: 'laser_t2', name: 'Láser de Haz Continuo', type: 'weapon_directional', tier: 2, description: 'Láser mejorado.', stats: { attack: 55, range: 4, accuracy: 88 }, buildCost: { metal: 180, plasma: 80, credits: 120, energy: 0 }, researchRequired: { researchId: 'directional', level: 3 } },
  { id: 'laser_t3', name: 'Cañón de Partículas', type: 'weapon_directional', tier: 3, description: 'Arma de partículas cargadas.', stats: { attack: 110, range: 5, accuracy: 90 }, buildCost: { metal: 500, plasma: 300, credits: 400, energy: 0 }, researchRequired: { researchId: 'directional', level: 8 } },
  { id: 'laser_t4', name: 'Destructor de Fase', type: 'weapon_directional', tier: 4, description: 'Arma de fase avanzada.', stats: { attack: 220, range: 5, accuracy: 92 }, buildCost: { metal: 1500, plasma: 1000, credits: 1500, energy: 0 }, researchRequired: { researchId: 'directional', level: 15 } },
  { id: 'laser_t5', name: 'Cañón Quasar', type: 'weapon_directional', tier: 5, description: 'Láser de energía estelar.', stats: { attack: 500, range: 6, accuracy: 95 }, buildCost: { metal: 6000, plasma: 5000, credits: 6000, energy: 0 }, researchRequired: { researchId: 'directional', level: 20 } }
];

// Misiles
export const missileWeapons: ShipModule[] = [
  { id: 'missile_t1', name: 'Misiles Básicos', type: 'weapon_missile', tier: 1, description: 'Misiles de corto alcance.', stats: { attack: 30, range: 5, accuracy: 65 }, buildCost: { metal: 40, plasma: 30, credits: 50, energy: 0 } },
  { id: 'missile_t2', name: 'Misiles Guiados', type: 'weapon_missile', tier: 2, description: 'Misiles con guía inteligente.', stats: { attack: 70, range: 6, accuracy: 75 }, buildCost: { metal: 120, plasma: 100, credits: 150, energy: 0 }, researchRequired: { researchId: 'missile', level: 3 } },
  { id: 'missile_t3', name: 'Misiles de Plasma', type: 'weapon_missile', tier: 3, description: 'Misiles con ojiva de plasma.', stats: { attack: 150, range: 7, accuracy: 80 }, buildCost: { metal: 350, plasma: 350, credits: 500, energy: 0 }, researchRequired: { researchId: 'missile', level: 8 } },
  { id: 'missile_t4', name: 'Misiles Cuánticos', type: 'weapon_missile', tier: 4, description: 'Misiles con teleportación.', stats: { attack: 300, range: 8, accuracy: 88 }, buildCost: { metal: 1000, plasma: 1200, credits: 2000, energy: 0 }, researchRequired: { researchId: 'missile', level: 15 } },
  { id: 'missile_t5', name: 'Misiles Singularidad', type: 'weapon_missile', tier: 5, description: 'Misiles de agujero negro.', stats: { attack: 700, range: 10, accuracy: 90 }, buildCost: { metal: 4000, plasma: 6000, credits: 8000, energy: 0 }, researchRequired: { researchId: 'missile', level: 20 } }
];

// Defensas - Estructura
export const structureModules: ShipModule[] = [
  { id: 'armor_t1', name: 'Blindaje de Acero', type: 'defense_structure', tier: 1, description: 'Blindaje básico.', stats: { structure: 50, defense: 10 }, buildCost: { metal: 30, plasma: 0, credits: 20, energy: 0 } },
  { id: 'armor_t2', name: 'Blindaje de Titanio', type: 'defense_structure', tier: 2, description: 'Blindaje reforzado.', stats: { structure: 120, defense: 25 }, buildCost: { metal: 100, plasma: 20, credits: 80, energy: 0 }, researchRequired: { researchId: 'ship_defense', level: 3 } },
  { id: 'armor_t3', name: 'Blindaje de Nanofibras', type: 'defense_structure', tier: 3, description: 'Blindaje autorreparable.', stats: { structure: 300, defense: 60 }, buildCost: { metal: 300, plasma: 150, credits: 250, energy: 0 }, researchRequired: { researchId: 'ship_defense', level: 8 } },
  { id: 'armor_t4', name: 'Blindaje de Neutrones', type: 'defense_structure', tier: 4, description: 'Blindaje de densidad extrema.', stats: { structure: 750, defense: 150 }, buildCost: { metal: 900, plasma: 600, credits: 800, energy: 0 }, researchRequired: { researchId: 'ship_defense', level: 15 } }
];

// Defensas - Escudos
export const shieldModules: ShipModule[] = [
  { id: 'shield_t1', name: 'Escudo de Deflectores', type: 'defense_shield', tier: 1, description: 'Escudo básico.', stats: { shield: 40, defense: 5 }, buildCost: { metal: 20, plasma: 40, credits: 30, energy: 0 } },
  { id: 'shield_t2', name: 'Escudo de Plasma', type: 'defense_shield', tier: 2, description: 'Escudo de plasma caliente.', stats: { shield: 100, defense: 15 }, buildCost: { metal: 80, plasma: 150, credits: 100, energy: 0 }, researchRequired: { researchId: 'ship_defense', level: 5 } },
  { id: 'shield_t3', name: 'Escudo de Fase', type: 'defense_shield', tier: 3, description: 'Escudo de desplazamiento de fase.', stats: { shield: 250, defense: 40 }, buildCost: { metal: 250, plasma: 500, credits: 350, energy: 0 }, researchRequired: { researchId: 'ship_defense', level: 10 } },
  { id: 'shield_t4', name: 'Escudo Cuántico', type: 'defense_shield', tier: 4, description: 'Escudo de probabilidad cuántica.', stats: { shield: 600, defense: 100 }, buildCost: { metal: 800, plasma: 1800, credits: 1200, energy: 0 }, researchRequired: { researchId: 'ship_defense', level: 18 } }
];

// Módulos Auxiliares
export const auxiliaryModules: ShipModule[] = [
  { id: 'engine_t1', name: 'Motor Iónico', type: 'auxiliary_transmission', tier: 1, description: 'Propulsión básica.', stats: { evasion: 5 }, buildCost: { metal: 50, plasma: 30, credits: 40, energy: 0 } },
  { id: 'engine_t2', name: 'Motor de Plasma', type: 'auxiliary_transmission', tier: 2, description: 'Propulsión mejorada.', stats: { evasion: 12 }, buildCost: { metal: 150, plasma: 100, credits: 120, energy: 0 } },
  { id: 'radar_t1', name: 'Sistema de Rastreo', type: 'auxiliary_electronic', tier: 1, description: 'Mejora precisión.', stats: { accuracy: 10 }, buildCost: { metal: 40, plasma: 50, credits: 60, energy: 0 } },
  { id: 'cargo_t1', name: 'Bodega de Carga', type: 'auxiliary_storage', tier: 1, description: 'Aumenta capacidad.', stats: {}, buildCost: { metal: 30, plasma: 10, credits: 20, energy: 0 } }
];

// TODOS LOS MÓDULOS
export const ALL_MODULES: ShipModule[] = [
  ...ballisticWeapons,
  ...directionalWeapons,
  ...missileWeapons,
  ...structureModules,
  ...shieldModules,
  ...auxiliaryModules
];

// Helpers
export function getHullById(id: string): ShipHull | undefined {
  return ALL_HULLS.find(h => h.id === id);
}

export function getModuleById(id: string): ShipModule | undefined {
  return ALL_MODULES.find(m => m.id === id);
}

export function getHullsByType(type: HullType): ShipHull[] {
  return ALL_HULLS.filter(h => h.type === type);
}

export function getModulesByType(type: ModuleType): ShipModule[] {
  return ALL_MODULES.filter(m => m.type === type);
}

// Calcular stats totales de una nave
export function calculateShipStats(hullId: string, moduleIds: string[]): { attack: number; defense: number; structure: number; shield: number } {
  const hull = getHullById(hullId);
  if (!hull) return { attack: 0, defense: 0, structure: 0, shield: 0 };
  
  let attack = 0;
  let defense = 0;
  let structure = hull.stats.structure;
  let shield = 0;
  
  for (const moduleId of moduleIds) {
    const module = getModuleById(moduleId);
    if (module) {
      attack += module.stats.attack || 0;
      defense += module.stats.defense || 0;
      structure += module.stats.structure || 0;
      shield += module.stats.shield || 0;
    }
  }
  
  return { attack, defense, structure, shield };
}
