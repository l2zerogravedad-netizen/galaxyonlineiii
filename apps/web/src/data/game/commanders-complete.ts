/**
 * SISTEMA COMPLETO DE COMANDANTES - GALAXY ONLINE II
 * Héroes con habilidades, stats, gems y bionic chips
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS Y ENUMERACIONES
// ============================================
export type CommanderRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'divine' | 'super';
export type CommanderRole = 'attack' | 'defense' | 'speed' | 'support' | 'balanced';
export type StatType = 'attack' | 'defense' | 'speed' | 'structure' | 'shield' | 'stability';

export interface CommanderStats {
  attack: number;
  defense: number;
  speed: number;
  structure: number;
  shield: number;
  stability: number;
}

export interface CommanderAbility {
  id: string;
  name: string;
  description: string;
  effect: {
    type: 'damage_boost' | 'defense_boost' | 'speed_boost' | 'critical_chance' | 'shield_regen' | 'structure_regen' | 'accuracy' | 'evasion';
    target: 'self' | 'fleet' | 'enemy';
    value: number; // Porcentaje o valor fijo
    duration?: number; // En segundos, undefined = permanente
  };
  cooldown?: number; // Segundos
  trigger?: 'passive' | 'active' | 'on_hit' | 'on_damage';
}

export interface CommanderGem {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  statBonus: Partial<CommanderStats>;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface BionicChip {
  id: string;
  name: string;
  rarity: CommanderRarity;
  abilityBonus: {
    abilityId: string;
    bonusPercent: number;
  };
}

// ============================================
// SISTEMA DE NIVELES (1-50)
// ============================================
export interface CommanderLevel {
  level: number;
  expRequired: number;
  statMultiplier: number;
  abilityUnlock?: string; // ID de habilidad desbloqueada
}

export const COMMANDER_LEVELS: CommanderLevel[] = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  return {
    level,
    expRequired: Math.floor(100 * Math.pow(1.15, level - 1)),
    statMultiplier: 1 + (level - 1) * 0.02, // +2% por nivel
    abilityUnlock: level === 10 || level === 20 || level === 30 || level === 40 ? `ability_slot_${level / 10}` : undefined
  };
});

// ============================================
// COMANDANTES - COMUNES (Common)
// ============================================
export const commonCommanders = [
  {
    id: 'cmd_basic_01',
    name: 'Cadete Estelar',
    rarity: 'common' as const,
    role: 'balanced' as const,
    baseStats: { attack: 20, defense: 20, speed: 20, structure: 100, shield: 50, stability: 10 },
    maxStats: { attack: 60, defense: 60, speed: 60, structure: 300, shield: 150, stability: 30 },
    abilities: [
      {
        id: 'basic_attack',
        name: 'Ataque Básico',
        description: '+5% daño en combate',
        effect: { type: 'damage_boost', target: 'fleet', value: 5 },
        trigger: 'passive'
      }
    ],
    maxGems: 2,
    maxChips: 1,
    description: 'Un comandante novato con potencial básico.',
    icon: '👤'
  },
  {
    id: 'cmd_defense_01',
    name: 'Oficial de Defensa',
    rarity: 'common' as const,
    role: 'defense' as const,
    baseStats: { attack: 15, defense: 30, speed: 15, structure: 150, shield: 80, stability: 15 },
    maxStats: { attack: 45, defense: 90, speed: 45, structure: 450, shield: 240, stability: 45 },
    abilities: [
      {
        id: 'defense_stance',
        name: 'Postura Defensiva',
        description: '+8% defensa de la flota',
        effect: { type: 'defense_boost', target: 'fleet', value: 8 },
        trigger: 'passive'
      }
    ],
    maxGems: 2,
    maxChips: 1,
    description: 'Especializado en proteger la flota.',
    icon: '🛡️'
  },
  {
    id: 'cmd_speed_01',
    name: 'Piloto de Intercepción',
    rarity: 'common' as const,
    role: 'speed' as const,
    baseStats: { attack: 25, defense: 10, speed: 35, structure: 80, shield: 40, stability: 8 },
    maxStats: { attack: 75, defense: 30, speed: 105, structure: 240, shield: 120, stability: 24 },
    abilities: [
      {
        id: 'speed_boost',
        name: 'Impulso de Velocidad',
        description: '+10% velocidad de la flota',
        effect: { type: 'speed_boost', target: 'fleet', value: 10 },
        trigger: 'passive'
      }
    ],
    maxGems: 2,
    maxChips: 1,
    description: 'Especializado en maniobras rápidas.',
    icon: '⚡'
  },
  {
    id: 'cmd_basic_02',
    name: 'Piloto Cadete',
    rarity: 'common' as const,
    role: 'balanced' as const,
    baseStats: { attack: 22, defense: 18, speed: 28, structure: 90, shield: 45, stability: 9 },
    maxStats: { attack: 66, defense: 54, speed: 84, structure: 270, shield: 135, stability: 27 },
    abilities: [
      {
        id: 'basic_training',
        name: 'Entrenamiento Básico',
        description: '+3% todos los stats',
        effect: { type: 'damage_boost', target: 'fleet', value: 3 },
        trigger: 'passive'
      }
    ],
    maxGems: 2,
    maxChips: 1,
    description: 'Piloto en entrenamiento con potencial básico.',
    icon: '🎓'
  },
  {
    id: 'cmd_sniper_01',
    name: 'Francotirador Cósmico',
    rarity: 'common' as const,
    role: 'attack' as const,
    baseStats: { attack: 30, defense: 12, speed: 22, structure: 70, shield: 35, stability: 7 },
    maxStats: { attack: 90, defense: 36, speed: 66, structure: 210, shield: 105, stability: 21 },
    abilities: [
      {
        id: 'precision_shot',
        name: 'Disparo de Precisión',
        description: '+8% precisión',
        effect: { type: 'accuracy', target: 'fleet', value: 8 },
        trigger: 'passive'
      }
    ],
    maxGems: 2,
    maxChips: 1,
    description: 'Especialista en ataques de largo alcance.',
    icon: '🎯'
  },
  {
    id: 'cmd_tank_01',
    name: 'Piloto de Blindaje',
    rarity: 'common' as const,
    role: 'defense' as const,
    baseStats: { attack: 12, defense: 35, speed: 12, structure: 180, shield: 90, stability: 12 },
    maxStats: { attack: 36, defense: 105, speed: 36, structure: 540, shield: 270, stability: 36 },
    abilities: [
      {
        id: 'heavy_armor',
        name: 'Armadura Pesada',
        description: '+10% estructura',
        effect: { type: 'structure_regen', target: 'fleet', value: 10 },
        trigger: 'passive'
      }
    ],
    maxGems: 2,
    maxChips: 1,
    description: 'Especialista en naves con máximo blindaje.',
    icon: '🛡️'
  }
];

// ============================================
// COMANDANTES - RAROS (Rare)
// ============================================
export const rareCommanders = [
  {
    id: 'cmd_balanced_01',
    name: 'Capitán Galáctico',
    rarity: 'rare' as const,
    role: 'balanced' as const,
    baseStats: { attack: 40, defense: 40, speed: 40, structure: 200, shield: 100, stability: 20 },
    maxStats: { attack: 120, defense: 120, speed: 120, structure: 600, shield: 300, stability: 60 },
    abilities: [
      {
        id: 'tactical_mind',
        name: 'Mente Táctica',
        description: '+8% ataque y defensa',
        effect: { type: 'damage_boost', target: 'fleet', value: 8 },
        trigger: 'passive'
      },
      {
        id: 'fleet_coordination',
        name: 'Coordinación de Flota',
        description: '+5% velocidad adicional',
        effect: { type: 'speed_boost', target: 'fleet', value: 5 },
        trigger: 'passive'
      }
    ],
    maxGems: 3,
    maxChips: 2,
    description: 'Un capitán experimentado con habilidades equilibradas.',
    icon: '👨‍✈️'
  },
  {
    id: 'cmd_attack_01',
    name: 'Asesino Espacial',
    rarity: 'rare' as const,
    role: 'attack' as const,
    baseStats: { attack: 70, defense: 20, speed: 50, structure: 120, shield: 60, stability: 12 },
    maxStats: { attack: 210, defense: 60, speed: 150, structure: 360, shield: 180, stability: 36 },
    abilities: [
      {
        id: 'critical_strike',
        name: 'Golpe Crítico',
        description: '+12% chance de crítico',
        effect: { type: 'critical_chance', target: 'fleet', value: 12 },
        trigger: 'passive'
      },
      {
        id: 'assault_mode',
        name: 'Modo Asalto',
        description: '+15% daño por 30 segundos (cooldown: 120s)',
        effect: { type: 'damage_boost', target: 'fleet', value: 15, duration: 30 },
        cooldown: 120,
        trigger: 'active'
      }
    ],
    maxGems: 3,
    maxChips: 2,
    description: 'Especialista en ataques sorpresa y daño masivo.',
    icon: '⚔️'
  },
  {
    id: 'cmd_support_01',
    name: 'Ingeniero de Flota',
    rarity: 'rare' as const,
    role: 'support' as const,
    baseStats: { attack: 25, defense: 50, speed: 25, structure: 250, shield: 150, stability: 25 },
    maxStats: { attack: 75, defense: 150, speed: 75, structure: 750, shield: 450, stability: 75 },
    abilities: [
      {
        id: 'shield_regen',
        name: 'Regeneración de Escudos',
        description: '+5% regeneración de escudos por minuto',
        effect: { type: 'shield_regen', target: 'fleet', value: 5 },
        trigger: 'passive'
      },
      {
        id: 'emergency_repair',
        name: 'Reparación de Emergencia',
        description: 'Restaura 10% estructura instantáneamente (cooldown: 180s)',
        effect: { type: 'structure_regen', target: 'fleet', value: 10 },
        cooldown: 180,
        trigger: 'active'
      }
    ],
    maxGems: 3,
    maxChips: 2,
    description: 'Mantiene la flota operativa con reparaciones y escudos.',
    icon: '🔧'
  }
];

// ============================================
// COMANDANTES - ÉPICOS (Epic)
// ============================================
export const epicCommanders = [
  {
    id: 'cmd_epic_01',
    name: 'Almirante del Sector',
    rarity: 'epic' as const,
    role: 'balanced' as const,
    baseStats: { attack: 70, defense: 70, speed: 70, structure: 350, shield: 200, stability: 35 },
    maxStats: { attack: 210, defense: 210, speed: 210, structure: 1050, shield: 600, stability: 105 },
    abilities: [
      {
        id: 'admiral_presence',
        name: 'Presencia del Almirante',
        description: '+12% todos los stats de la flota',
        effect: { type: 'damage_boost', target: 'fleet', value: 12 },
        trigger: 'passive'
      },
      {
        id: 'strategic_command',
        name: 'Comando Estratégico',
        description: '+10% precisión y +10% evasión',
        effect: { type: 'accuracy', target: 'fleet', value: 10 },
        trigger: 'passive'
      },
      {
        id: 'fleet_morale',
        name: 'Moral de Flota',
        description: '+15% daño cuando HP > 50%',
        effect: { type: 'damage_boost', target: 'fleet', value: 15 },
        trigger: 'on_hit'
      }
    ],
    maxGems: 4,
    maxChips: 3,
    description: 'Un almirante respetado que inspira a toda la flota.',
    icon: '🎖️'
  },
  {
    id: 'cmd_warlord',
    name: 'Señor de la Guerra',
    rarity: 'epic' as const,
    role: 'attack' as const,
    baseStats: { attack: 120, defense: 50, speed: 80, structure: 200, shield: 100, stability: 20 },
    maxStats: { attack: 360, defense: 150, speed: 240, structure: 600, shield: 300, stability: 60 },
    abilities: [
      {
        id: 'war_cry',
        name: 'Grito de Guerra',
        description: '+20% daño de la flota',
        effect: { type: 'damage_boost', target: 'fleet', value: 20 },
        trigger: 'passive'
      },
      {
        id: 'berserker_rage',
        name: 'Furia Berserker',
        description: '+30% daño pero -15% defensa cuando HP < 30%',
        effect: { type: 'damage_boost', target: 'self', value: 30 },
        trigger: 'on_damage'
      },
      {
        id: 'devastating_strike',
        name: 'Golpe Devastador',
        description: '25% chance de daño doble en críticos',
        effect: { type: 'critical_chance', target: 'fleet', value: 25 },
        trigger: 'passive'
      }
    ],
    maxGems: 4,
    maxChips: 3,
    description: 'Un guerrero temido en toda la galaxia.',
    icon: '⚔️'
  },
  {
    id: 'cmd_void_walker',
    name: 'Caminante del Vacío',
    rarity: 'epic' as const,
    role: 'speed' as const,
    baseStats: { attack: 60, defense: 40, speed: 150, structure: 150, shield: 80, stability: 15 },
    maxStats: { attack: 180, defense: 120, speed: 450, structure: 450, shield: 240, stability: 45 },
    abilities: [
      {
        id: 'void_speed',
        name: 'Velocidad del Vacío',
        description: '+25% velocidad de la flota',
        effect: { type: 'speed_boost', target: 'fleet', value: 25 },
        trigger: 'passive'
      },
      {
        id: 'phantom_strike',
        name: 'Golpe Fantasma',
        description: '+15% evasión y +10% precisión',
        effect: { type: 'evasion', target: 'fleet', value: 15 },
        trigger: 'passive'
      },
      {
        id: 'hit_and_run',
        name: 'Golpe y Huida',
        description: '+20% daño en primer ataque de cada combate',
        effect: { type: 'damage_boost', target: 'fleet', value: 20 },
        trigger: 'on_hit'
      }
    ],
    maxGems: 4,
    maxChips: 3,
    description: 'Se mueve tan rápido que parece teleportarse.',
    icon: '👻'
  },
  {
    id: 'cmd_healer',
    name: 'Médico de Combate',
    rarity: 'epic' as const,
    role: 'support' as const,
    baseStats: { attack: 40, defense: 60, speed: 50, structure: 300, shield: 250, stability: 30 },
    maxStats: { attack: 120, defense: 180, speed: 150, structure: 900, shield: 750, stability: 90 },
    abilities: [
      {
        id: 'combat_medic',
        name: 'Médico de Campaña',
        description: '+20% regeneración de estructura',
        effect: { type: 'structure_regen', target: 'fleet', value: 20 },
        trigger: 'passive'
      },
      {
        id: 'emergency_heal',
        name: 'Sanación de Emergencia',
        description: 'Recupera 25% estructura instantáneamente (cooldown: 120s)',
        effect: { type: 'structure_regen', target: 'fleet', value: 25 },
        cooldown: 120,
        trigger: 'active'
      },
      {
        id: 'shield_medic',
        name: 'Escudo Médico',
        description: '+15% regeneración de escudos',
        effect: { type: 'shield_regen', target: 'fleet', value: 15 },
        trigger: 'passive'
      }
    ],
    maxGems: 4,
    maxChips: 3,
    description: 'Especialista en mantener la flota viva bajo fuego enemigo.',
    icon: '⚕️'
  },
  {
    id: 'cmd_saboteur',
    name: 'Saboteador',
    rarity: 'epic' as const,
    role: 'attack' as const,
    baseStats: { attack: 90, defense: 40, speed: 100, structure: 200, shield: 120, stability: 20 },
    maxStats: { attack: 270, defense: 120, speed: 300, structure: 600, shield: 360, stability: 60 },
    abilities: [
      {
        id: 'sabotage',
        name: 'Sabotaje',
        description: '+15% penetración de escudos',
        effect: { type: 'shield_regen', target: 'enemy', value: -15 },
        trigger: 'passive'
      },
      {
        id: 'critical_sabotage',
        name: 'Sabotaje Crítico',
        description: '+20% daño crítico',
        effect: { type: 'critical_chance', target: 'fleet', value: 20 },
        trigger: 'passive'
      },
      {
        id: 'stealth_attack',
        name: 'Ataque Sigiloso',
        description: '+25% daño en primer ataque',
        effect: { type: 'damage_boost', target: 'fleet', value: 25 },
        trigger: 'on_hit'
      }
    ],
    maxGems: 4,
    maxChips: 3,
    description: 'Especialista en ataques sorpresa y sabotaje de sistemas enemigos.',
    icon: '🗡️'
  }
];

// ============================================
// COMANDANTES - LEGENDARIOS (Legendary)
// ============================================
export const legendaryCommanders = [
  {
    id: 'cmd_legend_01',
    name: 'Comandante Supremo',
    rarity: 'legendary' as const,
    role: 'balanced' as const,
    baseStats: { attack: 150, defense: 150, speed: 150, structure: 800, shield: 500, stability: 80 },
    maxStats: { attack: 450, defense: 450, speed: 450, structure: 2400, shield: 1500, stability: 240 },
    abilities: [
      {
        id: 'supreme_command',
        name: 'Comando Supremo',
        description: '+20% todos los stats de la flota',
        effect: { type: 'damage_boost', target: 'fleet', value: 20 },
        trigger: 'passive'
      },
      {
        id: 'master_tactician',
        name: 'Maestro Táctico',
        description: '+25% precisión y +20% velocidad',
        effect: { type: 'accuracy', target: 'fleet', value: 25 },
        trigger: 'passive'
      },
      {
        id: 'legendary_presence',
        name: 'Presencia Legendaria',
        description: '+30% moral de combate (daño y defensa)',
        effect: { type: 'damage_boost', target: 'fleet', value: 30 },
        trigger: 'passive'
      },
      {
        id: 'ultimate_strategy',
        name: 'Estrategia Definitiva',
        description: '+35% daño cuando la flota tiene ventaja numérica',
        effect: { type: 'damage_boost', target: 'fleet', value: 35 },
        trigger: 'on_hit'
      }
    ],
    maxGems: 5,
    maxChips: 4,
    description: 'Una leyenda viviente cuyo nombre infunde terror y respeto.',
    icon: '👑'
  },
  {
    id: 'cmd_titan',
    name: 'Titán Indestructible',
    rarity: 'legendary' as const,
    role: 'defense' as const,
    baseStats: { attack: 80, defense: 250, speed: 60, structure: 2000, shield: 1200, stability: 150 },
    maxStats: { attack: 240, defense: 750, speed: 180, structure: 6000, shield: 3600, stability: 450 },
    abilities: [
      {
        id: 'titan_armor',
        name: 'Armadura de Titán',
        description: '+40% defensa y estructura de la flota',
        effect: { type: 'defense_boost', target: 'fleet', value: 40 },
        trigger: 'passive'
      },
      {
        id: 'fortress_mode',
        name: 'Modo Fortaleza',
        description: '+50% defensa por 45 segundos (cooldown: 150s)',
        effect: { type: 'defense_boost', target: 'fleet', value: 50, duration: 45 },
        cooldown: 150,
        trigger: 'active'
      },
      {
        id: 'unyielding_will',
        name: 'Voluntad Inquebrantable',
        description: '+25% estructura regenerada al recibir daño crítico',
        effect: { type: 'structure_regen', target: 'fleet', value: 25 },
        trigger: 'on_damage'
      },
      {
        id: 'shield_wall',
        name: 'Muro de Escudos',
        description: '+35% escudos y +15% regeneración',
        effect: { type: 'shield_regen', target: 'fleet', value: 15 },
        trigger: 'passive'
      }
    ],
    maxGems: 5,
    maxChips: 4,
    description: 'Inquebrantable como las montañas de su mundo natal.',
    icon: '🏔️'
  },
  {
    id: 'cmd_phoenix',
    name: 'Almirante Fénix',
    rarity: 'legendary' as const,
    role: 'attack' as const,
    baseStats: { attack: 200, defense: 100, speed: 120, structure: 600, shield: 400, stability: 60 },
    maxStats: { attack: 600, defense: 300, speed: 360, structure: 1800, shield: 1200, stability: 180 },
    abilities: [
      {
        id: 'phoenix_wrath',
        name: 'Ira del Fénix',
        description: '+30% daño, +20% cuando HP < 30%',
        effect: { type: 'damage_boost', target: 'fleet', value: 30 },
        trigger: 'passive'
      },
      {
        id: 'rebirth',
        name: 'Renacimiento',
        description: 'Revive 15% de naves destruidas una vez por combate',
        effect: { type: 'structure_regen', target: 'fleet', value: 15 },
        trigger: 'on_damage'
      },
      {
        id: 'eternal_flame',
        name: 'Llama Eterna',
        description: '+25% daño de armas de energía',
        effect: { type: 'damage_boost', target: 'fleet', value: 25 },
        trigger: 'passive'
      },
      {
        id: 'phoenix_dive',
        name: 'Picado del Fénix',
        description: '+40% daño contra naves con escudos rotos',
        effect: { type: 'damage_boost', target: 'fleet', value: 40 },
        trigger: 'on_hit'
      }
    ],
    maxGems: 5,
    maxChips: 4,
    description: 'Comandante legendario que renace de sus derrotas más fuerte que antes.',
    icon: '🔥'
  },
  {
    id: 'cmd_nightmare',
    name: 'Pesadilla Espacial',
    rarity: 'legendary' as const,
    role: 'attack' as const,
    baseStats: { attack: 220, defense: 80, speed: 140, structure: 500, shield: 300, stability: 50 },
    maxStats: { attack: 660, defense: 240, speed: 420, structure: 1500, shield: 900, stability: 150 },
    abilities: [
      {
        id: 'nightmare_fuel',
        name: 'Combustible de Pesadilla',
        description: '+35% daño de misiles',
        effect: { type: 'damage_boost', target: 'fleet', value: 35 },
        trigger: 'passive'
      },
      {
        id: 'terror_strike',
        name: 'Golpe del Terror',
        description: '+30% chance de crítico contra enemigos dañados',
        effect: { type: 'critical_chance', target: 'fleet', value: 30 },
        trigger: 'on_hit'
      },
      {
        id: 'fear_aura',
        name: 'Aura de Miedo',
        description: '-15% defensa enemiga',
        effect: { type: 'defense_boost', target: 'enemy', value: -15 },
        trigger: 'passive'
      },
      {
        id: 'nightmare_mode',
        name: 'Modo Pesadilla',
        description: '+50% daño por 20 segundos (cooldown: 180s)',
        effect: { type: 'damage_boost', target: 'fleet', value: 50, duration: 20 },
        cooldown: 180,
        trigger: 'active'
      }
    ],
    maxGems: 5,
    maxChips: 4,
    description: 'Un comandante temido cuya presencia aterroriza a las flotas enemigas.',
    icon: '👻'
  },
  {
    id: 'cmd_emperor',
    name: 'Emperador Galáctico',
    rarity: 'legendary' as const,
    role: 'balanced' as const,
    baseStats: { attack: 180, defense: 180, speed: 100, structure: 1000, shield: 700, stability: 100 },
    maxStats: { attack: 540, defense: 540, speed: 300, structure: 3000, shield: 2100, stability: 300 },
    abilities: [
      {
        id: 'imperial_command',
        name: 'Comando Imperial',
        description: '+25% todos los stats de la flota',
        effect: { type: 'damage_boost', target: 'fleet', value: 25 },
        trigger: 'passive'
      },
      {
        id: 'emperor_presence',
        name: 'Presencia Imperial',
        description: '+20% defensa y estructura',
        effect: { type: 'defense_boost', target: 'fleet', value: 20 },
        trigger: 'passive'
      },
      {
        id: 'galactic_law',
        name: 'Ley Galáctica',
        description: '+30% precisión, enemigos -10% evasión',
        effect: { type: 'accuracy', target: 'fleet', value: 30 },
        trigger: 'passive'
      },
      {
        id: 'imperial_wrath',
        name: 'Ira Imperial',
        description: '+40% daño contra flotas más grandes',
        effect: { type: 'damage_boost', target: 'fleet', value: 40 },
        trigger: 'on_hit'
      }
    ],
    maxGems: 5,
    maxChips: 4,
    description: 'El emperador reinante de la galaxia, comandante de comandantes.',
    icon: '👑'
  }
];

// ============================================
// COMANDANTES - DIVINOS/SUPER (Divine/Super)
// ============================================
export const divineCommanders = [
  {
    id: 'cmd_divine_01',
    name: 'Avatar de la Galaxia',
    rarity: 'divine' as const,
    role: 'balanced' as const,
    baseStats: { attack: 300, defense: 300, speed: 300, structure: 2000, shield: 1500, stability: 200 },
    maxStats: { attack: 900, defense: 900, speed: 900, structure: 6000, shield: 4500, stability: 600 },
    abilities: [
      {
        id: 'divine_wrath',
        name: 'Ira Divina',
        description: '+50% daño de toda la flota',
        effect: { type: 'damage_boost', target: 'fleet', value: 50 },
        trigger: 'passive'
      },
      {
        id: 'cosmic_shield',
        name: 'Escudo Cósmico',
        description: '+40% escudos y regeneración instantánea',
        effect: { type: 'shield_regen', target: 'fleet', value: 40 },
        trigger: 'passive'
      },
      {
        id: 'time_warp',
        name: 'Distorsión Temporal',
        description: '+40% velocidad y +30% evasión',
        effect: { type: 'speed_boost', target: 'fleet', value: 40 },
        trigger: 'passive'
      },
      {
        id: 'omniscience',
        name: 'Omnisciencia',
        description: '+50% precisión, no puede fallar ataques',
        effect: { type: 'accuracy', target: 'fleet', value: 50 },
        trigger: 'passive'
      },
      {
        id: 'divine_intervention',
        name: 'Intervención Divina',
        description: 'Revive 30% de naves destruidas una vez por combate',
        effect: { type: 'structure_regen', target: 'fleet', value: 30 },
        trigger: 'on_damage'
      }
    ],
    maxGems: 6,
    maxChips: 5,
    description: 'Un ser de poder cósmico, encarnación de la galaxia misma.',
    icon: '🌌'
  },
  {
    id: 'cmd_cosmos',
    name: 'Señor del Cosmos',
    rarity: 'divine' as const,
    role: 'attack' as const,
    baseStats: { attack: 400, defense: 250, speed: 250, structure: 2500, shield: 1800, stability: 250 },
    maxStats: { attack: 1200, defense: 750, speed: 750, structure: 7500, shield: 5400, stability: 750 },
    abilities: [
      {
        id: 'cosmic_power',
        name: 'Poder Cósmico',
        description: '+60% daño de todas las armas',
        effect: { type: 'damage_boost', target: 'fleet', value: 60 },
        trigger: 'passive'
      },
      {
        id: 'gravity_control',
        name: 'Control de Gravedad',
        description: '+40% precisión, enemigos -20% evasión',
        effect: { type: 'accuracy', target: 'fleet', value: 40 },
        trigger: 'passive'
      },
      {
        id: 'stellar_wrath',
        name: 'Ira Estelar',
        description: '+80% daño por 15 segundos (cooldown: 120s)',
        effect: { type: 'damage_boost', target: 'fleet', value: 80, duration: 15 },
        cooldown: 120,
        trigger: 'active'
      },
      {
        id: 'cosmic_shield',
        name: 'Escudo Cósmico',
        description: '+50% escudos y regeneración',
        effect: { type: 'shield_regen', target: 'fleet', value: 50 },
        trigger: 'passive'
      },
      {
        id: 'black_hole',
        name: 'Agujero Negro',
        description: 'Destruye 20% de naves enemigas al azar una vez por combate',
        effect: { type: 'structure_regen', target: 'enemy', value: -20 },
        trigger: 'on_hit'
      }
    ],
    maxGems: 6,
    maxChips: 5,
    description: 'Señor de las fuerzas cósmicas, capaz de manipular la gravedad misma.',
    icon: '🌠'
  },
  {
    id: 'cmd_eternal',
    name: 'Comandante Eterno',
    rarity: 'divine' as const,
    role: 'defense' as const,
    baseStats: { attack: 250, defense: 400, speed: 200, structure: 4000, shield: 3000, stability: 300 },
    maxStats: { attack: 750, defense: 1200, speed: 600, structure: 12000, shield: 9000, stability: 900 },
    abilities: [
      {
        id: 'eternal_shield',
        name: 'Escudo Eterno',
        description: '+60% escudos y estructura',
        effect: { type: 'shield_regen', target: 'fleet', value: 60 },
        trigger: 'passive'
      },
      {
        id: 'immortality',
        name: 'Inmortalidad',
        description: 'Revive 40% de naves destruidas una vez por combate',
        effect: { type: 'structure_regen', target: 'fleet', value: 40 },
        trigger: 'on_damage'
      },
      {
        id: 'time_stop',
        name: 'Detención Temporal',
        description: 'Congela enemigos por 5 segundos (cooldown: 150s)',
        effect: { type: 'speed_boost', target: 'enemy', value: -100, duration: 5 },
        cooldown: 150,
        trigger: 'active'
      },
      {
        id: 'eternal_defense',
        name: 'Defensa Eterna',
        description: '+50% reducción de daño',
        effect: { type: 'defense_boost', target: 'fleet', value: 50 },
        trigger: 'passive'
      },
      {
        id: 'regeneration',
        name: 'Regeneración Eterna',
        description: '+30% regeneración de estructura por minuto',
        effect: { type: 'structure_regen', target: 'fleet', value: 30 },
        trigger: 'passive'
      }
    ],
    maxGems: 6,
    maxChips: 5,
    description: 'Un ser inmortal que ha existido desde el inicio de los tiempos.',
    icon: '⏳'
  },
  {
    id: 'cmd_creator',
    name: 'Creador de Mundos',
    rarity: 'divine' as const,
    role: 'balanced' as const,
    baseStats: { attack: 350, defense: 350, speed: 350, structure: 3500, shield: 2500, stability: 350 },
    maxStats: { attack: 1050, defense: 1050, speed: 1050, structure: 10500, shield: 7500, stability: 1050 },
    abilities: [
      {
        id: 'creation_power',
        name: 'Poder de Creación',
        description: '+70% todos los stats de la flota',
        effect: { type: 'damage_boost', target: 'fleet', value: 70 },
        trigger: 'passive'
      },
      {
        id: 'world_shaper',
        name: 'Moldeador de Mundos',
        description: '+50% estructura y escudos',
        effect: { type: 'structure_regen', target: 'fleet', value: 50 },
        trigger: 'passive'
      },
      {
        id: 'divine_creation',
        name: 'Creación Divina',
        description: 'Crea 25% de naves adicionales al inicio del combate',
        effect: { type: 'structure_regen', target: 'fleet', value: 25 },
        trigger: 'on_hit'
      },
      {
        id: 'omnipotence',
        name: 'Omnipotencia',
        description: '+60% daño, +40% defensa, +100% precisión',
        effect: { type: 'accuracy', target: 'fleet', value: 100 },
        trigger: 'passive'
      },
      {
        id: 'reality_warp',
        name: 'Distorsión de Realidad',
        description: 'Cambia las reglas del combate por 30 segundos (cooldown: 200s)',
        effect: { type: 'damage_boost', target: 'fleet', value: 100, duration: 30 },
        cooldown: 200,
        trigger: 'active'
      }
    ],
    maxGems: 6,
    maxChips: 5,
    description: 'El creador de galaxias, capaz de moldear la realidad a su voluntad.',
    icon: '🌌'
  }
];

// ============================================
// SISTEMA DE GEMS
// ============================================
export const COMMANDER_GEMS: CommanderGem[] = [
  // Gems Rojas (Ataque)
  { id: 'gem_red_1', name: 'Rubí Débil', color: 'red', level: 1, statBonus: { attack: 5 } },
  { id: 'gem_red_2', name: 'Rubí', color: 'red', level: 2, statBonus: { attack: 12 } },
  { id: 'gem_red_3', name: 'Rubí Brillante', color: 'red', level: 3, statBonus: { attack: 25 } },
  { id: 'gem_red_4', name: 'Rubí Real', color: 'red', level: 4, statBonus: { attack: 45 } },
  { id: 'gem_red_5', name: 'Rubí Divino', color: 'red', level: 5, statBonus: { attack: 80 } },
  
  // Gems Azules (Defensa)
  { id: 'gem_blue_1', name: 'Zafiro Débil', color: 'blue', level: 1, statBonus: { defense: 5 } },
  { id: 'gem_blue_2', name: 'Zafiro', color: 'blue', level: 2, statBonus: { defense: 12 } },
  { id: 'gem_blue_3', name: 'Zafiro Brillante', color: 'blue', level: 3, statBonus: { defense: 25 } },
  { id: 'gem_blue_4', name: 'Zafiro Real', color: 'blue', level: 4, statBonus: { defense: 45 } },
  { id: 'gem_blue_5', name: 'Zafiro Divino', color: 'blue', level: 5, statBonus: { defense: 80 } },
  
  // Gems Verdes (Velocidad)
  { id: 'gem_green_1', name: 'Esmeralda Débil', color: 'green', level: 1, statBonus: { speed: 5 } },
  { id: 'gem_green_2', name: 'Esmeralda', color: 'green', level: 2, statBonus: { speed: 12 } },
  { id: 'gem_green_3', name: 'Esmeralda Brillante', color: 'green', level: 3, statBonus: { speed: 25 } },
  { id: 'gem_green_4', name: 'Esmeralda Real', color: 'green', level: 4, statBonus: { speed: 45 } },
  { id: 'gem_green_5', name: 'Esmeralda Divina', color: 'green', level: 5, statBonus: { speed: 80 } },
  
  // Gems Amarillas (Estructura)
  { id: 'gem_yellow_1', name: 'Ámbar Débil', color: 'yellow', level: 1, statBonus: { structure: 20 } },
  { id: 'gem_yellow_2', name: 'Ámbar', color: 'yellow', level: 2, statBonus: { structure: 50 } },
  { id: 'gem_yellow_3', name: 'Ámbar Brillante', color: 'yellow', level: 3, statBonus: { structure: 100 } },
  { id: 'gem_yellow_4', name: 'Ámbar Real', color: 'yellow', level: 4, statBonus: { structure: 200 } },
  { id: 'gem_yellow_5', name: 'Ámbar Divino', color: 'yellow', level: 5, statBonus: { structure: 400 } },
  
  // Gems Púrpuras (Estabilidad)
  { id: 'gem_purple_1', name: 'Amatista Débil', color: 'purple', level: 1, statBonus: { stability: 3 } },
  { id: 'gem_purple_2', name: 'Amatista', color: 'purple', level: 2, statBonus: { stability: 8 } },
  { id: 'gem_purple_3', name: 'Amatista Brillante', color: 'purple', level: 3, statBonus: { stability: 15 } },
  { id: 'gem_purple_4', name: 'Amatista Real', color: 'purple', level: 4, statBonus: { stability: 30 } },
  { id: 'gem_purple_5', name: 'Amatista Divina', color: 'purple', level: 5, statBonus: { stability: 60 } }
];

// ============================================
// SISTEMA DE BIONIC CHIPS
// ============================================
export const BIONIC_CHIPS: BionicChip[] = [
  // Chips Comunes
  { id: 'chip_basic_1', name: 'Chip de Potencia Básico', rarity: 'common', abilityBonus: { abilityId: 'basic_attack', bonusPercent: 10 } },
  { id: 'chip_def_1', name: 'Chip de Defensa Básico', rarity: 'common', abilityBonus: { abilityId: 'defense_stance', bonusPercent: 10 } },
  
  // Chips Raros
  { id: 'chip_rare_1', name: 'Chip Táctico', rarity: 'rare', abilityBonus: { abilityId: 'tactical_mind', bonusPercent: 20 } },
  { id: 'chip_rare_2', name: 'Chip de Crítico', rarity: 'rare', abilityBonus: { abilityId: 'critical_strike', bonusPercent: 25 } },
  { id: 'chip_rare_3', name: 'Chip de Regeneración', rarity: 'rare', abilityBonus: { abilityId: 'shield_regen', bonusPercent: 20 } },
  
  // Chips Épicos
  { id: 'chip_epic_1', name: 'Chip de Mando', rarity: 'epic', abilityBonus: { abilityId: 'admiral_presence', bonusPercent: 35 } },
  { id: 'chip_epic_2', name: 'Chip de Guerra', rarity: 'epic', abilityBonus: { abilityId: 'war_cry', bonusPercent: 40 } },
  { id: 'chip_epic_3', name: 'Chip Fantasma', rarity: 'epic', abilityBonus: { abilityId: 'void_speed', bonusPercent: 35 } },
  
  // Chips Legendarios
  { id: 'chip_leg_1', name: 'Chip Supremo', rarity: 'legendary', abilityBonus: { abilityId: 'supreme_command', bonusPercent: 50 } },
  { id: 'chip_leg_2', name: 'Chip de Titán', rarity: 'legendary', abilityBonus: { abilityId: 'titan_armor', bonusPercent: 60 } },
  
  // Chips Divinos
  { id: 'chip_divine_1', name: 'Chip Divino', rarity: 'divine', abilityBonus: { abilityId: 'divine_wrath', bonusPercent: 100 } }
];

// ============================================
// TODOS LOS COMANDANTES
// ============================================
export const ALL_COMMANDERS = [
  ...commonCommanders,
  ...rareCommanders,
  ...epicCommanders,
  ...legendaryCommanders,
  ...divineCommanders
];

// ============================================
// HELPERS
// ============================================

export function getCommanderById(id: string) {
  return ALL_COMMANDERS.find(c => c.id === id);
}

export function getCommandersByRarity(rarity: CommanderRarity) {
  return ALL_COMMANDERS.filter(c => c.rarity === rarity);
}

export function getCommandersByRole(role: CommanderRole) {
  return ALL_COMMANDERS.filter(c => c.role === role);
}

export function calculateCommanderStats(
  commanderId: string,
  level: number,
  gems: CommanderGem[] = [],
  chips: BionicChip[] = []
): CommanderStats {
  const commander = getCommanderById(commanderId);
  if (!commander) throw new Error(`Comandante no encontrado: ${commanderId}`);
  
  const levelData = COMMANDER_LEVELS[level - 1];
  if (!levelData) throw new Error(`Nivel inválido: ${level}`);
  
  // Stats base escalados por nivel
  const stats: CommanderStats = {
    attack: Math.floor(commander.baseStats.attack * levelData.statMultiplier),
    defense: Math.floor(commander.baseStats.defense * levelData.statMultiplier),
    speed: Math.floor(commander.baseStats.speed * levelData.statMultiplier),
    structure: Math.floor(commander.baseStats.structure * levelData.statMultiplier),
    shield: Math.floor(commander.baseStats.shield * levelData.statMultiplier),
    stability: Math.floor(commander.baseStats.stability * levelData.statMultiplier)
  };
  
  // Aplicar bonus de gems
  for (const gem of gems) {
    if (gem.statBonus.attack) stats.attack += gem.statBonus.attack;
    if (gem.statBonus.defense) stats.defense += gem.statBonus.defense;
    if (gem.statBonus.speed) stats.speed += gem.statBonus.speed;
    if (gem.statBonus.structure) stats.structure += gem.statBonus.structure;
    if (gem.statBonus.shield) stats.shield += gem.statBonus.shield;
    if (gem.statBonus.stability) stats.stability += gem.statBonus.stability;
  }
  
  // Aplicar bonus de chips a habilidades (indirecto en stats)
  // Los chips mejoran las habilidades, no los stats directamente
  
  return stats;
}

export function calculateExpToLevel(currentLevel: number): number {
  const levelData = COMMANDER_LEVELS[currentLevel];
  return levelData?.expRequired || 0;
}

export function canEquipGem(
  commanderId: string,
  gem: CommanderGem,
  currentGems: CommanderGem[]
): boolean {
  const commander = getCommanderById(commanderId);
  if (!commander) return false;
  
  // Verificar límite de gems
  if (currentGems.length >= commander.maxGems) return false;
  
  // Verificar si ya tiene una gem del mismo color (opcional, depende de reglas)
  // return !currentGems.some(g => g.color === gem.color);
  
  return true;
}

export function canEquipChip(
  commanderId: string,
  chip: BionicChip,
  currentChips: BionicChip[]
): boolean {
  const commander = getCommanderById(commanderId);
  if (!commander) return false;
  
  // Verificar límite de chips
  if (currentChips.length >= commander.maxChips) return false;
  
  // Verificar que el comandante tenga la habilidad
  const hasAbility = commander.abilities.some(a => a.id === chip.abilityBonus.abilityId);
  return hasAbility;
}

export function getDropRateByRarity(rarity: CommanderRarity): number {
  const rates: Record<CommanderRarity, number> = {
    common: 50,      // 50%
    rare: 30,        // 30%
    epic: 15,        // 15%
    legendary: 4.5,  // 4.5%
    divine: 0.5,     // 0.5%
    super: 0.1       // 0.1% (eventos especiales)
  };
  return rates[rarity];
}

export const CommanderSystem = {
  ALL_COMMANDERS,
  COMMANDER_LEVELS,
  COMMANDER_GEMS,
  BIONIC_CHIPS,
  getCommanderById,
  getCommandersByRarity,
  getCommandersByRole,
  calculateCommanderStats,
  calculateExpToLevel,
  canEquipGem,
  canEquipChip,
  getDropRateByRarity
};
