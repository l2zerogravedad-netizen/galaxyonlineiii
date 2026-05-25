/**
 * DATOS COMPLETOS DE DEFENSAS PLANETARIAS - GALAXY ONLINE II
 * Space Station, torretas, escudos y sistemas de defensa
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

export interface DefenseLevel {
  level: number;
  cost: Record<ResourceKey, number>;
  stats: {
    attack: number;
    defense: number;
    range: number;
    shield?: number;
  };
  buildTimeMinutes: number;
  health: number;
}

export interface DefenseStructure {
  id: string;
  name: string;
  description: string;
  type: 'orbital' | 'planetary' | 'station';
  maxLevel: number;
  levels: DefenseLevel[];
  glow: 'cyan' | 'purple' | 'gold' | 'red' | 'green';
  unlockRequirement?: {
    buildingId?: string;
    researchId?: string;
    level?: number;
  };
}

// ============================================
// 1. SPACE STATION
// ============================================
export const spaceStation: DefenseStructure = {
  id: 'space_station',
  name: 'Estación Espacial',
  description: 'Plataforma orbital masiva que coordina defensas y alberga flotas defensivas.',
  type: 'station',
  maxLevel: 10,
  glow: 'cyan',
  unlockRequirement: { buildingId: 'shipyard', level: 5 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(2, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(10000 * multiplier),
        plasma: Math.floor(5000 * multiplier),
        credits: Math.floor(8000 * multiplier),
        energy: 0
      },
      stats: {
        attack: 100 * level,
        defense: 200 * level,
        range: 10 + (2 * level),
        shield: 500 * level
      },
      buildTimeMinutes: level * 60,
      health: 5000 + (2000 * (level - 1))
    };
  })
};

// ============================================
// 2. METEOR STAR (Cañón de Meteoritos)
// ============================================
export const meteorStar: DefenseStructure = {
  id: 'meteor_star',
  name: 'Meteor Star',
  description: 'Sistema de cañones automáticos de alto calibre que dispara ráfagas de proyectiles metálicos.',
  type: 'orbital',
  maxLevel: 10,
  glow: 'red',
  unlockRequirement: { researchId: 'planetary_defense', level: 5 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.8, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(3000 * multiplier),
        plasma: Math.floor(1000 * multiplier),
        credits: Math.floor(2000 * multiplier),
        energy: 0
      },
      stats: {
        attack: 150 * level,
        defense: 50 * level,
        range: 8 + level
      },
      buildTimeMinutes: level * 30,
      health: 2000 + (400 * (level - 1))
    };
  })
};

// ============================================
// 3. PARTICLE CANNON
// ============================================
export const particleCannon: DefenseStructure = {
  id: 'particle_cannon',
  name: 'Cañón de Partículas',
  description: 'Arma de energía masiva que dispara haces de partículas aceleradas. Alto daño, recarga lenta.',
  type: 'orbital',
  maxLevel: 10,
  glow: 'purple',
  unlockRequirement: { researchId: 'planetary_defense', level: 8 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.9, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(4000 * multiplier),
        plasma: Math.floor(2000 * multiplier),
        credits: Math.floor(3000 * multiplier),
        energy: 0
      },
      stats: {
        attack: 300 * level,
        defense: 30 * level,
        range: 12 + (2 * level)
      },
      buildTimeMinutes: level * 45,
      health: 1500 + (300 * (level - 1))
    };
  })
};

// ============================================
// 4. ANTI-AIRCRAFT GUN
// ============================================
export const antiAirGun: DefenseStructure = {
  id: 'anti_air_gun',
  name: 'Cañón Anti-Aéreo',
  description: 'Sistema de defensa especializado contra naves pequeñas y frigatas. Cadencia de fuego extremadamente alta.',
  type: 'planetary',
  maxLevel: 10,
  glow: 'green',
  unlockRequirement: { researchId: 'planetary_defense', level: 3 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(1.6, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(2000 * multiplier),
        plasma: Math.floor(500 * multiplier),
        credits: Math.floor(1000 * multiplier),
        energy: 0
      },
      stats: {
        attack: 80 * level,
        defense: 100 * level,
        range: 6 + level
      },
      buildTimeMinutes: level * 20,
      health: 1200 + (240 * (level - 1))
    };
  })
};

// ============================================
// 5. THOR'S CANNON
// ============================================
export const thorsCannon: DefenseStructure = {
  id: 'thors_cannon',
  name: "Thor's Cannon",
  description: 'El cañón orbital más poderoso. Dispara proyectiles de plasma contenido capaces de destruir acorazados.',
  type: 'orbital',
  maxLevel: 5,
  glow: 'gold',
  unlockRequirement: { researchId: 'planetary_defense', level: 15 },
  levels: Array.from({ length: 5 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(3, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(20000 * multiplier),
        plasma: Math.floor(15000 * multiplier),
        credits: Math.floor(25000 * multiplier),
        energy: 0
      },
      stats: {
        attack: 1000 * level,
        defense: 100 * level,
        range: 20 + (5 * level)
      },
      buildTimeMinutes: level * 120,
      health: 8000 + (4000 * (level - 1))
    };
  })
};

// ============================================
// 6. ESCUDO PLANETARIO
// ============================================
export const planetaryShield: DefenseStructure = {
  id: 'planetary_shield',
  name: 'Escudo Planetario',
  description: 'Campo de energía masivo que protege toda la superficie del planeta de ataques orbitales.',
  type: 'planetary',
  maxLevel: 10,
  glow: 'cyan',
  unlockRequirement: { researchId: 'ship_defense', level: 10 },
  levels: Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(2, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(8000 * multiplier),
        plasma: Math.floor(10000 * multiplier),
        credits: Math.floor(12000 * multiplier),
        energy: 0
      },
      stats: {
        attack: 0,
        defense: 500 * level,
        range: 0,
        shield: 10000 * level
      },
      buildTimeMinutes: level * 90,
      health: 3000 + (600 * (level - 1))
    };
  })
};

// ============================================
// 7. RED DE DEFENSA ORBITAL
// ============================================
export const orbitalDefenseGrid: DefenseStructure = {
  id: 'orbital_defense_grid',
  name: 'Red de Defensa Orbital',
  description: 'Red de satélites defensivos interconectados que proporcionan cobertura global.',
  type: 'orbital',
  maxLevel: 5,
  glow: 'purple',
  unlockRequirement: { researchId: 'planetary_defense', level: 12 },
  levels: Array.from({ length: 5 }, (_, i) => {
    const level = i + 1;
    const multiplier = Math.pow(2.5, level - 1);
    return {
      level,
      cost: {
        metal: Math.floor(15000 * multiplier),
        plasma: Math.floor(8000 * multiplier),
        credits: Math.floor(15000 * multiplier),
        energy: 0
      },
      stats: {
        attack: 200 * level,
        defense: 300 * level,
        range: 15 + (3 * level)
      },
      buildTimeMinutes: level * 100,
      health: 5000 + (1000 * (level - 1))
    };
  })
};

// ============================================
// TODAS LAS DEFENSAS
// ============================================
export const ALL_DEFENSES: DefenseStructure[] = [
  spaceStation,
  meteorStar,
  particleCannon,
  antiAirGun,
  thorsCannon,
  planetaryShield,
  orbitalDefenseGrid
];

// ============================================
// CÁLCULOS DE DEFENSA TOTAL
// ============================================
export interface DefenseStats {
  totalAttack: number;
  totalDefense: number;
  totalShield: number;
  totalHealth: number;
  coverage: number; // Porcentaje de cobertura planetaria
}

export function calculateTotalDefense(defenses: { id: string; level: number }[]): DefenseStats {
  const stats: DefenseStats = {
    totalAttack: 0,
    totalDefense: 0,
    totalShield: 0,
    totalHealth: 0,
    coverage: 0
  };

  for (const defense of defenses) {
    const structure = ALL_DEFENSES.find(d => d.id === defense.id);
    if (structure) {
      const levelData = structure.levels[defense.level - 1];
      if (levelData) {
        stats.totalAttack += levelData.stats.attack;
        stats.totalDefense += levelData.stats.defense;
        stats.totalShield += levelData.stats.shield || 0;
        stats.totalHealth += levelData.health;
        stats.coverage += levelData.stats.range * 2; // Simplificación
      }
    }
  }

  // Normalizar cobertura a porcentaje (máximo teórico ~1000)
  stats.coverage = Math.min(100, Math.floor(stats.coverage / 10));

  return stats;
}

// ============================================
// DAÑO CALCULADO
// ============================================
export function calculateDefenseDamage(
  defenseStats: DefenseStats,
  attackerStats: { attack: number; shieldPenetration?: number }
): { damageDealt: number; damageReceived: number; shieldAbsorbed: number } {
  // Daño que la defensa inflige
  const damageDealt = defenseStats.totalAttack * (0.8 + Math.random() * 0.4); // ±20% variación

  // Daño que la defensa recibe
  const shieldPenetration = attackerStats.shieldPenetration || 0;
  const effectiveShield = defenseStats.totalShield * (1 - shieldPenetration);
  
  let remainingDamage = attackerStats.attack;
  let shieldAbsorbed = 0;

  if (effectiveShield > 0) {
    shieldAbsorbed = Math.min(effectiveShield, remainingDamage);
    remainingDamage -= shieldAbsorbed;
  }

  // Reducir por defensa
  const damageReduction = defenseStats.totalDefense / (defenseStats.totalDefense + 100);
  const damageReceived = remainingDamage * (1 - damageReduction);

  return {
    damageDealt: Math.floor(damageDealt),
    damageReceived: Math.floor(damageReceived),
    shieldAbsorbed: Math.floor(shieldAbsorbed)
  };
}

// ============================================
// COSTO TOTAL DE DEFENSA
// ============================================
export function calculateDefenseCost(defenses: { id: string; level: number }[]): Record<ResourceKey, number> {
  const total = { metal: 0, plasma: 0, credits: 0, energy: 0 };

  for (const defense of defenses) {
    const structure = ALL_DEFENSES.find(d => d.id === defense.id);
    if (structure) {
      const levelData = structure.levels[defense.level - 1];
      if (levelData) {
        total.metal += levelData.cost.metal;
        total.plasma += levelData.cost.plasma;
        total.credits += levelData.cost.credits;
        total.energy += levelData.cost.energy;
      }
    }
  }

  return total;
}

// Helper
export function getDefenseById(id: string): DefenseStructure | undefined {
  return ALL_DEFENSES.find(d => d.id === id);
}
