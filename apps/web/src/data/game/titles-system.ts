/**
 * SISTEMA DE TÍTULOS - GALAXY ONLINE II
 * Títulos desbloqueables, beneficios, visual
 */

// ============================================
// TIPOS DE TÍTULOS
// ============================================
export type TitleCategory = 
  | 'combat'       // Títulos de combate
  | 'economic'     // Títulos económicos
  | 'exploration'  // Títulos de exploración
  | 'diplomatic'   // Títulos diplomáticos
  | 'criminal'     // Títulos de piratería/contrabando
  | 'crafting'     // Títulos de fabricación
  | 'social'       // Títulos sociales
  | 'achievement'  // Títulos por logros especiales
  | 'rare'         // Títulos raros/únicos
  | 'event';       // Títulos de eventos

export type TitleRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// ============================================
// TÍTULO
// ============================================
export interface Title {
  id: string;
  name: string;
  category: TitleCategory;
  rarity: TitleRarity;
  
  // Visual
  visual: {
    prefix: string;      // Prefijo (ej: "Almirante")
    suffix: string;      // Sufijo (ej: "el Invencible")
    color: string;       // Color del título
    icon: string;        // Icono asociado
    animation?: string; // Animación especial
    particleEffect?: string;
  };
  
  // Descripción
  description: string;
  lore: string;
  
  // Requisitos de desbloqueo
  requirements: {
    type: 'kills' | 'wins' | 'earned' | 'explored' | 'crafted' | 'reputation' | 'achievement' | 'event' | 'secret';
    value: number;
    specificCondition?: string;
    hidden: boolean;
  };
  
  // Beneficios
  benefits: {
    stats?: {
      attack?: number;
      defense?: number;
      speed?: number;
      cargo?: number;
    };
    bonuses?: {
      expGain?: number;
      creditGain?: number;
      reputationGain?: number;
      craftingSpeed?: number;
      researchSpeed?: number;
    };
    special?: string[]; // Habilidades/desbloqueos especiales
  };
  
  // Progreso
  progress: {
    current: number;
    max: number;
    percentage: number;
  };
  
  // Estado
  unlocked: boolean;
  unlockedAt?: number;
  equipped: boolean;
  
  // Límites
  limitations: {
    unique: boolean;           // Solo uno puede tenerlo
    limitedTime?: number;      // Duración limitada
    factionRestricted?: string[];
    levelRequired?: number;
  };
}

// ============================================
// TÍTULOS PREDEFINIDOS
// ============================================
export const TITLES: Title[] = [
  // Títulos de Combate
  {
    id: 'title_novice_warrior',
    name: 'Guerrero Novato',
    category: 'combat',
    rarity: 'common',
    visual: { prefix: '', suffix: 'el Novato', color: '#9E9E9E', icon: 'sword_basic' },
    description: 'Has dado tus primeros pasos en el campo de batalla',
    lore: 'Todo gran guerrero comenzó alguna vez como novato',
    requirements: { type: 'kills', value: 10, hidden: false },
    benefits: { stats: { attack: 1 }, bonuses: { expGain: 0.02 } },
    progress: { current: 0, max: 10, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: false }
  },
  {
    id: 'title_veteran_commander',
    name: 'Comandante Veterano',
    category: 'combat',
    rarity: 'uncommon',
    visual: { prefix: 'Comandante', suffix: '', color: '#4CAF50', icon: 'helmet_veteran' },
    description: 'Cien batallas te han convertido en un líder respetado',
    lore: 'La experiencia es la mejor maestra en la guerra',
    requirements: { type: 'wins', value: 100, hidden: false },
    benefits: { stats: { attack: 3, defense: 2 }, bonuses: { expGain: 0.05 } },
    progress: { current: 0, max: 100, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: false }
  },
  {
    id: 'title_legendary_admiral',
    name: 'Almirante Legendario',
    category: 'combat',
    rarity: 'legendary',
    visual: { prefix: 'Almirante', suffix: 'el Invencible', color: '#FFD700', icon: 'crown_admiral', animation: 'golden_aura' },
    description: 'Mil victorias te han convertido en leyenda viviente',
    lore: 'Los bardos cantarán tus hazañas por siglos',
    requirements: { type: 'wins', value: 1000, hidden: false },
    benefits: { stats: { attack: 10, defense: 10, speed: 5 }, bonuses: { expGain: 0.15, reputationGain: 0.2 }, special: ['command_aura', 'fleet_morale_bonus'] },
    progress: { current: 0, max: 1000, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: true, levelRequired: 50 }
  },
  
  // Títulos Económicos
  {
    id: 'title_merchant_apprentice',
    name: 'Aprendiz de Mercader',
    category: 'economic',
    rarity: 'common',
    visual: { prefix: '', suffix: 'el Comerciante', color: '#8D6E63', icon: 'coin_basic' },
    description: 'Tus primeros créditos ganados honradamente',
    lore: 'El camino hacia la riqueza comienza con un solo crédito',
    requirements: { type: 'earned', value: 10000, hidden: false },
    benefits: { bonuses: { creditGain: 0.03 } },
    progress: { current: 0, max: 10000, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: false }
  },
  {
    id: 'title_wealthy_magnate',
    name: 'Magnate Galáctico',
    category: 'economic',
    rarity: 'epic',
    visual: { prefix: 'Magnate', suffix: '', color: '#00BCD4', icon: 'diamond_wealth', animation: 'money_particles' },
    description: 'Tu fortuna rivaliza con la de pequeños planetas',
    lore: 'El dinero compra todo... incluso respeto',
    requirements: { type: 'earned', value: 1000000000, hidden: false },
    benefits: { stats: { cargo: 50 }, bonuses: { creditGain: 0.2, reputationGain: 0.1 }, special: ['market_manipulation', 'tax_exemption'] },
    progress: { current: 0, max: 1000000000, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: true, levelRequired: 40 }
  },
  
  // Títulos de Exploración
  {
    id: 'title_star wanderer',
    name: 'Caminante de Estrellas',
    category: 'exploration',
    rarity: 'uncommon',
    visual: { prefix: '', suffix: 'el Explorador', color: '#3F51B5', icon: 'compass_star' },
    description: 'Has visitado más sistemas de los que la mayoría verá en su vida',
    lore: 'El universo es tu patio de juegos',
    requirements: { type: 'explored', value: 50, hidden: false },
    benefits: { stats: { speed: 5 }, bonuses: { expGain: 0.05 } },
    progress: { current: 0, max: 50, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: false }
  },
  {
    id: 'title_galaxy_pioneer',
    name: 'Pionero Galáctico',
    category: 'exploration',
    rarity: 'epic',
    visual: { prefix: 'Pionero', suffix: '', color: '#673AB7', icon: 'rocket_pioneer', animation: 'star_trail' },
    description: 'Primero en pisar mundos donde ningún humano había estado',
    lore: 'Donde nadie ha llegado antes, tú estabas allí',
    requirements: { type: 'explored', value: 500, hidden: false },
    benefits: { stats: { speed: 15 }, bonuses: { expGain: 0.15, researchSpeed: 0.2 }, special: ['first_contact_bonus', 'anomaly_detection'] },
    progress: { current: 0, max: 500, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: true, levelRequired: 45 }
  },
  
  // Títulos de Logros
  {
    id: 'title_perfect_victory',
    name: 'Victoria Perfecta',
    category: 'achievement',
    rarity: 'rare',
    visual: { prefix: '', suffix: 'el Invicto', color: '#FF5722', icon: 'laurel_perfect' },
    description: 'Ganaste una batalla sin recibir daño',
    lore: 'La perfección es rara, pero tú la alcanzaste',
    requirements: { type: 'achievement', value: 1, specificCondition: 'win_without_damage', hidden: true },
    benefits: { stats: { defense: 5 }, bonuses: { expGain: 0.1 } },
    progress: { current: 0, max: 1, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: false }
  },
  {
    id: 'title_lone_survivor',
    name: 'Último Sobreviviente',
    category: 'achievement',
    rarity: 'epic',
    visual: { prefix: '', suffix: 'el Inmortal', color: '#E91E63', icon: 'phoenix_solo', animation: 'phoenix_rebirth' },
    description: 'Ganaste una batalla estando solo contra cinco',
    lore: 'Contra todo pronóstico, prevaleciste',
    requirements: { type: 'achievement', value: 1, specificCondition: 'win_1v5', hidden: true },
    benefits: { stats: { attack: 8, defense: 8 }, bonuses: { expGain: 0.2 }, special: ['second_wind', 'desperation_bonus'] },
    progress: { current: 0, max: 1, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: false }
  },
  
  // Títulos Raros Únicos
  {
    id: 'title_first_emperor',
    name: 'Primer Emperador',
    category: 'rare',
    rarity: 'mythic',
    visual: { prefix: 'Emperador', suffix: '', color: '#FFD700', icon: 'throne_imperial', animation: 'imperial_aura', particleEffect: 'golden_rain' },
    description: 'Primero en conquistar la galaxia entera',
    lore: 'Los historiadores discutirán tu reinio por milenios',
    requirements: { type: 'achievement', value: 1, specificCondition: 'first_galaxy_conquest', hidden: false },
    benefits: { stats: { attack: 20, defense: 20, speed: 10, cargo: 100 }, bonuses: { expGain: 0.5, creditGain: 0.3, reputationGain: 0.5 }, special: ['imperial_command', 'tax_galaxy_wide', 'unique_ships'] },
    progress: { current: 0, max: 1, percentage: 0 },
    unlocked: false,
    equipped: false,
    limitations: { unique: true, limitedTime: 31536000 } // 1 año
  }
];

// ============================================
// SISTEMA DE PROGRESO DE TÍTULOS
// ============================================
export interface TitleProgress {
  playerId: string;
  
  // Títulos
  unlockedTitles: string[];
  equippedTitle: string | null;
  
  // Progreso hacia desbloqueos
  progress: Record<string, {
    current: number;
    lastUpdated: number;
  }>;
  
  // Estadísticas
  stats: {
    totalUnlocked: number;
    rarestOwned: TitleRarity;
    completionPercentage: number;
  };
  
  // Historial
  history: {
    titleId: string;
    unlockedAt: number;
    equippedAt?: number;
  }[];
}

// ============================================
// CATÁLOGO DE TÍTULOS
// ============================================
export interface TitleCatalog {
  // Categorías
  categories: {
    id: TitleCategory;
    name: string;
    description: string;
    totalTitles: number;
    unlockedCount: number;
  }[];
  
  // Filtros
  filters: {
    byRarity: TitleRarity[];
    byStatus: 'all' | 'unlocked' | 'locked' | 'equipped';
    byBenefit: string[];
  };
  
  // Recomendaciones
  recommendations: {
    closestToUnlock: string[];
    bestBenefits: string[];
    rareOpportunities: string[];
  };
}

// ============================================
// HELPERS
// ============================================
export function getTitleById(id: string): Title | undefined {
  return TITLES.find(t => t.id === id);
}

export function getTitlesByCategory(category: TitleCategory): Title[] {
  return TITLES.filter(t => t.category === category);
}

export function getTitlesByRarity(rarity: TitleRarity): Title[] {
  return TITLES.filter(t => t.rarity === rarity);
}

export function getUnlockedTitles(progress: TitleProgress): Title[] {
  return TITLES.filter(t => progress.unlockedTitles.includes(t.id));
}

export function getNextUnlockableTitles(progress: TitleProgress): Title[] {
  return TITLES.filter(t => {
    if (progress.unlockedTitles.includes(t.id)) return false;
    const progressData = progress.progress[t.id];
    if (!progressData) return false;
    return progressData.current > 0;
  }).sort((a, b) => {
    const progressA = progress.progress[a.id]?.current || 0;
    const progressB = progress.progress[b.id]?.current || 0;
    return (progressB / b.requirements.value) - (progressA / a.requirements.value);
  });
}

export function calculateTitleBenefits(equippedTitles: Title[]): Title['benefits'] {
  const combined: Title['benefits'] = {
    stats: {} as Record<string, number>,
    bonuses: {} as Record<string, number>,
    special: []
  };
  
  equippedTitles.forEach(title => {
    if (title.benefits.stats) {
      Object.entries(title.benefits.stats).forEach(([stat, value]) => {
        combined.stats![stat] = (combined.stats![stat] || 0) + value;
      });
    }
    if (title.benefits.bonuses) {
      Object.entries(title.benefits.bonuses).forEach(([bonus, value]) => {
        combined.bonuses![bonus] = (combined.bonuses![bonus] || 0) + (value as number);
      });
    }
    if (title.benefits.special) {
      combined.special!.push(...title.benefits.special);
    }
  });
  
  return combined;
}

export function checkTitleUnlock(
  title: Title,
  playerStats: Record<string, number>
): boolean {
  const currentValue = playerStats[title.requirements.type] || 0;
  return currentValue >= title.requirements.value;
}

export function getRarityMultiplier(rarity: TitleRarity): number {
  const multipliers = {
    'common': 1,
    'uncommon': 2,
    'rare': 5,
    'epic': 10,
    'legendary': 25,
    'mythic': 100
  };
  return multipliers[rarity];
}

export const TitlesSystem = {
  TITLES,
  getTitleById,
  getTitlesByCategory,
  getTitlesByRarity,
  getUnlockedTitles,
  getNextUnlockableTitles,
  calculateTitleBenefits,
  checkTitleUnlock,
  getRarityMultiplier
};
