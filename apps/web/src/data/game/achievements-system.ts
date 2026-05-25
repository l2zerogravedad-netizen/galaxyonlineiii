/**
 * SISTEMA DE LOGROS/ACHIEVEMENTS - GALAXY ONLINE II
 * Logros desbloqueables, medallas, títulos y recompensas
 */

import type { ResourceKey } from '@/components/game/game-data';

export type AchievementCategory = 
  | 'combat' | 'economy' | 'research' | 'social' | 'exploration' 
  | 'collection' | 'special' | 'secret';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface AchievementRequirement {
  type: 'count' | 'reach' | 'collect' | 'win' | 'build' | 'research' | 'join';
  target: string;
  amount: number;
}

export interface PlayerAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  requirements: AchievementRequirement[];
  reward: {
    resources?: Partial<Record<ResourceKey, number>>;
    items?: string[];
    title?: string;
    emblem?: string;
    border?: string;
  };
  icon: string;
  hidden: boolean;
}

// ============================================
// LOGROS DE COMBATE
// ============================================
export const COMBAT_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_combat_01',
    name: 'Primer Sangre',
    description: 'Gana tu primera batalla PvP.',
    category: 'combat',
    tier: 'bronze',
    points: 10,
    requirements: [{ type: 'win', target: 'pvp', amount: 1 }],
    reward: { resources: { credits: 5000 }, title: 'Combatiente' },
    icon: '⚔️',
    hidden: false
  },
  {
    id: 'ach_combat_02',
    name: 'Veterano',
    description: 'Gana 100 batallas PvP.',
    category: 'combat',
    tier: 'silver',
    points: 50,
    requirements: [{ type: 'win', target: 'pvp', amount: 100 }],
    reward: { resources: { credits: 50000 }, title: 'Veterano' },
    icon: '🎖️',
    hidden: false
  },
  {
    id: 'ach_combat_03',
    name: 'Campeón de Arena',
    description: 'Alcanza el rango Diamond en Arena.',
    category: 'combat',
    tier: 'gold',
    points: 100,
    requirements: [{ type: 'reach', target: 'arena_diamond', amount: 1 }],
    reward: { resources: { credits: 200000 }, items: ['chest_legendary'], title: 'Campeón', emblem: '🏆' },
    icon: '👑',
    hidden: false
  },
  {
    id: 'ach_combat_04',
    name: 'Asesino de Humaroids',
    description: 'Derrota 1000 Humaroids.',
    category: 'combat',
    tier: 'platinum',
    points: 200,
    requirements: [{ type: 'win', target: 'humaroid', amount: 1000 }],
    reward: { resources: { credits: 500000 }, items: ['cmd_divine_random'], title: 'Cazador de Humaroids' },
    icon: '👾',
    hidden: false
  },
  {
    id: 'ach_combat_05',
    name: 'Inconquistable',
    description: 'Defiende exitosamente tu base 100 veces.',
    category: 'combat',
    tier: 'diamond',
    points: 500,
    requirements: [{ type: 'win', target: 'defense', amount: 100 }],
    reward: { resources: { credits: 1000000 }, items: ['chest_divine', 'chest_divine'], title: 'Inconquistable', border: 'diamond' },
    icon: '🛡️',
    hidden: false
  }
];

// ============================================
// LOGROS DE ECONOMÍA
// ============================================
export const ECONOMY_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_econ_01',
    name: 'Recolector',
    description: 'Recolecta 1,000,000 de metal.',
    category: 'economy',
    tier: 'bronze',
    points: 10,
    requirements: [{ type: 'collect', target: 'metal', amount: 1000000 }],
    reward: { resources: { credits: 10000 } },
    icon: '⛏️',
    hidden: false
  },
  {
    id: 'ach_econ_02',
    name: 'Magnate',
    description: 'Acumula 10,000,000 de créditos.',
    category: 'economy',
    tier: 'silver',
    points: 50,
    requirements: [{ type: 'reach', target: 'credits', amount: 10000000 }],
    reward: { resources: { credits: 100000 }, title: 'Magnate' },
    icon: '💰',
    hidden: false
  },
  {
    id: 'ach_econ_03',
    name: 'Constructor',
    description: 'Construye 500 edificios.',
    category: 'economy',
    tier: 'silver',
    points: 50,
    requirements: [{ type: 'build', target: 'buildings', amount: 500 }],
    reward: { resources: { credits: 100000 } },
    icon: '🏗️',
    hidden: false
  },
  {
    id: 'ach_econ_04',
    name: 'Imperio Galáctico',
    description: 'Coloniza 10 planetas.',
    category: 'economy',
    tier: 'gold',
    points: 150,
    requirements: [{ type: 'count', target: 'planets', amount: 10 }],
    reward: { resources: { credits: 500000 }, items: ['chest_legendary'], title: 'Emperador' },
    icon: '🌌',
    hidden: false
  },
  {
    id: 'ach_econ_05',
    name: 'Capitalista Galáctico',
    description: 'Comercia por 100,000,000 de créditos.',
    category: 'economy',
    tier: 'platinum',
    points: 200,
    requirements: [{ type: 'reach', target: 'trade_volume', amount: 100000000 }],
    reward: { resources: { credits: 1000000 }, title: 'Capitalista', emblem: '💎' },
    icon: '💹',
    hidden: false
  }
];

// ============================================
// LOGROS DE INVESTIGACIÓN
// ============================================
export const RESEARCH_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_research_01',
    name: 'Científico',
    description: 'Completa 10 investigaciones.',
    category: 'research',
    tier: 'bronze',
    points: 10,
    requirements: [{ type: 'research', target: 'any', amount: 10 }],
    reward: { resources: { credits: 10000 }, title: 'Científico' },
    icon: '🔬',
    hidden: false
  },
  {
    id: 'ach_research_02',
    name: 'Genio Galáctico',
    description: 'Completa todas las investigaciones de un árbol.',
    category: 'research',
    tier: 'gold',
    points: 150,
    requirements: [{ type: 'research', target: 'tree_complete', amount: 1 }],
    reward: { resources: { credits: 300000 }, items: ['chest_epic'], title: 'Genio' },
    icon: '🧠',
    hidden: false
  },
  {
    id: 'ach_research_03',
    name: 'Sabio Supremo',
    description: 'Alcanza nivel 30 en 5 investigaciones diferentes.',
    category: 'research',
    tier: 'platinum',
    points: 250,
    requirements: [{ type: 'reach', target: 'research_level_30', amount: 5 }],
    reward: { resources: { credits: 500000 }, items: ['chest_legendary'], title: 'Sabio' },
    icon: '📚',
    hidden: false
  }
];

// ============================================
// LOGROS SOCIALES
// ============================================
export const SOCIAL_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_social_01',
    name: 'Corporativo',
    description: 'Únete a una corporación.',
    category: 'social',
    tier: 'bronze',
    points: 10,
    requirements: [{ type: 'join', target: 'corp', amount: 1 }],
    reward: { resources: { credits: 5000 } },
    icon: '🏢',
    hidden: false
  },
  {
    id: 'ach_social_02',
    name: 'Comandante de Corp',
    description: 'Conviértete en líder de una corporación.',
    category: 'social',
    tier: 'silver',
    points: 50,
    requirements: [{ type: 'reach', target: 'corp_leader', amount: 1 }],
    reward: { resources: { credits: 100000 }, title: 'Líder' },
    icon: '👔',
    hidden: false
  },
  {
    id: 'ach_social_03',
    name: 'Diplomático',
    description: 'Establece alianzas con 5 corporaciones.',
    category: 'social',
    tier: 'gold',
    points: 100,
    requirements: [{ type: 'count', target: 'alliances', amount: 5 }],
    reward: { resources: { credits: 200000 }, title: 'Diplomático' },
    icon: '🤝',
    hidden: false
  }
];

// ============================================
// LOGROS DE EXPLORACIÓN
// ============================================
export const EXPLORATION_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_explore_01',
    name: 'Explorador',
    description: 'Explora 10 sistemas diferentes.',
    category: 'exploration',
    tier: 'bronze',
    points: 10,
    requirements: [{ type: 'count', target: 'systems', amount: 10 }],
    reward: { resources: { credits: 10000 } },
    icon: '🔭',
    hidden: false
  },
  {
    id: 'ach_explore_02',
    name: 'Viajero Galáctico',
    description: 'Visita 5 galaxias diferentes.',
    category: 'exploration',
    tier: 'silver',
    points: 50,
    requirements: [{ type: 'count', target: 'galaxies', amount: 5 }],
    reward: { resources: { credits: 50000 } },
    icon: '🚀',
    hidden: false
  },
  {
    id: 'ach_explore_03',
    name: 'Conquistador de Instancias',
    description: 'Completa 50 instancias.',
    category: 'exploration',
    tier: 'gold',
    points: 150,
    requirements: [{ type: 'count', target: 'instances', amount: 50 }],
    reward: { resources: { credits: 200000 }, items: ['chest_legendary'], title: 'Conquistador' },
    icon: '🌟',
    hidden: false
  }
];

// ============================================
// LOGROS DE COLECCIÓN
// ============================================
export const COLLECTION_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_collect_01',
    name: 'Comandante Novato',
    description: 'Obtén 5 comandantes diferentes.',
    category: 'collection',
    tier: 'bronze',
    points: 10,
    requirements: [{ type: 'collect', target: 'commanders', amount: 5 }],
    reward: { resources: { credits: 10000 } },
    icon: '🎴',
    hidden: false
  },
  {
    id: 'ach_collect_02',
    name: 'Coleccionista',
    description: 'Obtén 20 comandantes diferentes.',
    category: 'collection',
    tier: 'silver',
    points: 50,
    requirements: [{ type: 'collect', target: 'commanders', amount: 20 }],
    reward: { resources: { credits: 100000 }, items: ['chest_epic'] },
    icon: '🃏',
    hidden: false
  },
  {
    id: 'ach_collect_03',
    name: 'Maestro de Comandantes',
    description: 'Obtén todos los comandantes.',
    category: 'collection',
    tier: 'platinum',
    points: 300,
    requirements: [{ type: 'collect', target: 'all_commanders', amount: 1 }],
    reward: { resources: { credits: 1000000 }, items: ['cmd_divine_selector'], title: 'Maestro' },
    icon: '👑',
    hidden: false
  },
  {
    id: 'ach_collect_04',
    name: 'Flota Completa',
    description: 'Desbloquea todos los tipos de naves.',
    category: 'collection',
    tier: 'gold',
    points: 100,
    requirements: [{ type: 'collect', target: 'ship_types', amount: 10 }],
    reward: { resources: { credits: 200000 } },
    icon: '🚀',
    hidden: false
  }
];

// ============================================
// LOGROS ESPECIALES
// ============================================
export const SPECIAL_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_special_01',
    name: 'Beta Tester',
    description: 'Participa en la beta del juego.',
    category: 'special',
    tier: 'platinum',
    points: 100,
    requirements: [{ type: 'reach', target: 'beta_participant', amount: 1 }],
    reward: { title: 'Beta Tester', border: 'beta', emblem: '🔧' },
    icon: '🧪',
    hidden: true
  },
  {
    id: 'ach_special_02',
    name: 'Fundador',
    description: 'Juega desde el día de lanzamiento.',
    category: 'special',
    tier: 'diamond',
    points: 500,
    requirements: [{ type: 'reach', target: 'launch_day_player', amount: 1 }],
    reward: { title: 'Fundador', border: 'founder', emblem: '💎' },
    icon: '🌟',
    hidden: true
  },
  {
    id: 'ach_special_03',
    name: 'Veterano de 1 Año',
    description: 'Juega activamente durante 1 año.',
    category: 'special',
    tier: 'diamond',
    points: 1000,
    requirements: [{ type: 'reach', target: 'play_time_1_year', amount: 1 }],
    reward: { title: 'Veterano', border: 'veteran', emblem: '⏳' },
    icon: '🎂',
    hidden: false
  }
];

// ============================================
// LOGROS SECRETOS
// ============================================
export const SECRET_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    id: 'ach_secret_01',
    name: '???',
    description: 'Has descubierto un secreto.',
    category: 'secret',
    tier: 'diamond',
    points: 1000,
    requirements: [{ type: 'reach', target: 'secret_condition', amount: 1 }],
    reward: { title: 'Descubridor', emblem: '❓' },
    icon: '❓',
    hidden: true
  }
];

// ============================================
// TODOS LOS LOGROS
// ============================================
export const ALL_ACHIEVEMENTS: PlayerAchievement[] = [
  ...COMBAT_ACHIEVEMENTS,
  ...ECONOMY_ACHIEVEMENTS,
  ...RESEARCH_ACHIEVEMENTS,
  ...SOCIAL_ACHIEVEMENTS,
  ...EXPLORATION_ACHIEVEMENTS,
  ...COLLECTION_ACHIEVEMENTS,
  ...SPECIAL_ACHIEVEMENTS,
  ...SECRET_ACHIEVEMENTS
];

// ============================================
// SISTEMA DE PUNTOS Y RECOMPENSAS
// ============================================
export const ACHIEVEMENT_POINTS_REWARDS = {
  100: { resources: { credits: 10000 } },
  500: { resources: { credits: 50000 }, items: ['chest_rare'] },
  1000: { resources: { credits: 100000 }, items: ['chest_epic'], title: 'Logrero' },
  2500: { resources: { credits: 300000 }, items: ['chest_legendary'], title: 'Maestro de Logros' },
  5000: { resources: { credits: 1000000 }, items: ['cmd_divine_random'], title: 'Leyenda' },
  10000: { resources: { credits: 5000000 }, items: ['chest_divine', 'chest_divine'], title: 'Dios de los Logros', emblem: '🏆' }
};

// ============================================
// HELPERS
// ============================================
export function getAchievementById(id: string): PlayerAchievement | undefined {
  return ALL_ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): PlayerAchievement[] {
  return ALL_ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementsByTier(tier: AchievementTier): PlayerAchievement[] {
  return ALL_ACHIEVEMENTS.filter(a => a.tier === tier);
}

export function calculateTotalPoints(achievements: string[]): number {
  return achievements.reduce((total, id) => {
    const ach = getAchievementById(id);
    return total + (ach?.points || 0);
  }, 0);
}

export function getPointsReward(points: number): typeof ACHIEVEMENT_POINTS_REWARDS[keyof typeof ACHIEVEMENT_POINTS_REWARDS] | null {
  const thresholds = Object.keys(ACHIEVEMENT_POINTS_REWARDS)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (points >= threshold) {
      return ACHIEVEMENT_POINTS_REWARDS[threshold as keyof typeof ACHIEVEMENT_POINTS_REWARDS];
    }
  }
  
  return null;
}

export const AchievementsSystem = {
  COMBAT_ACHIEVEMENTS,
  ECONOMY_ACHIEVEMENTS,
  RESEARCH_ACHIEVEMENTS,
  SOCIAL_ACHIEVEMENTS,
  EXPLORATION_ACHIEVEMENTS,
  COLLECTION_ACHIEVEMENTS,
  SPECIAL_ACHIEVEMENTS,
  SECRET_ACHIEVEMENTS,
  ALL_ACHIEVEMENTS,
  ACHIEVEMENT_POINTS_REWARDS,
  getAchievementById,
  getAchievementsByCategory,
  getAchievementsByTier,
  calculateTotalPoints,
  getPointsReward
};
