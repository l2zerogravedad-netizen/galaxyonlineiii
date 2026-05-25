/**
 * SISTEMA DE RANKINGS - GALAXY ONLINE II
 * Leaderboards, ligas, divisiones y clasificaciones
 */

// ============================================
// TIPOS DE RANKING
// ============================================
export type RankingType = 
  | 'power'           // Poder total
  | 'pvp'             // Victorias PvP
  | 'honor'           // Puntos de honor
  | 'achievements'    // Puntos de logros
  | 'economy'         // Riqueza total
  | 'research'        // Nivel de investigación
  | 'fleet'           // Poder de flota
  | 'corps'           // Ranking de corporaciones
  | 'instances'       // Instancias completadas
  | 'arena'           // Ranking de arena
  | 'weekly'          // Competencia semanal
  | 'monthly';        // Competencia mensual

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'all_time';

// ============================================
// ESTRUCTURA DE RANKING
// ============================================
export interface RankingEntry {
  rank: number;
  previousRank: number;
  playerId: string;
  playerName: string;
  corpName?: string;
  level: number;
  value: number; // El valor que se clasifica
  title?: string;
  avatar?: string;
  region?: string;
}

export interface Ranking {
  id: string;
  type: RankingType;
  period: RankingPeriod;
  name: string;
  description: string;
  lastUpdated: number;
  entries: RankingEntry[];
  playerRank?: number;
  totalParticipants: number;
}

// ============================================
// REWARDS DE RANKING
// ============================================
export interface RankingReward {
  rankMin: number;
  rankMax: number;
  rewards: {
    credits: number;
    gold?: number;
    items?: string[];
    title?: string;
    emblem?: string;
  };
}

export const RANKING_REWARDS: Record<RankingType, RankingReward[]> = {
  power: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 1000000, gold: 1000, items: ['chest_divine', 'cmd_divine_selector'], title: 'Supremo' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 500000, gold: 500, items: ['chest_divine'], title: 'Titán' } },
    { rankMin: 11, rankMax: 100, rewards: { credits: 200000, gold: 200, items: ['chest_legendary'] } },
    { rankMin: 101, rankMax: 1000, rewards: { credits: 50000, gold: 50 } }
  ],
  pvp: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 500000, gold: 500, items: ['chest_legendary', 'cmd_legendary_selector'], title: 'Campeón de Guerra' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 300000, gold: 300, items: ['chest_legendary'] } },
    { rankMin: 11, rankMax: 100, rewards: { credits: 100000, gold: 100 } }
  ],
  honor: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 300000, gold: 300, title: 'El Honorable' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 150000, gold: 150 } },
    { rankMin: 11, rankMax: 100, rewards: { credits: 50000 } }
  ],
  achievements: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 200000, gold: 200, title: 'Maestro de Logros' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 100000, gold: 100 } }
  ],
  economy: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 500000, gold: 500, title: 'Magnate' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 300000, gold: 300 } }
  ],
  research: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 300000, gold: 300, title: 'Científico Jefe' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 150000, gold: 150 } }
  ],
  fleet: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 400000, gold: 400, title: 'Almirante Supremo' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 200000, gold: 200 } }
  ],
  corps: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 1000000, gold: 1000, title: 'Corp #1' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 500000, gold: 500 } }
  ],
  instances: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 300000, gold: 300, title: 'Conquistador' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 150000, gold: 150 } }
  ],
  arena: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 500000, gold: 500, title: 'Rey de la Arena' } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 300000, gold: 300 } }
  ],
  weekly: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 200000, gold: 200 } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 100000, gold: 100 } }
  ],
  monthly: [
    { rankMin: 1, rankMax: 1, rewards: { credits: 500000, gold: 500 } },
    { rankMin: 2, rankMax: 10, rewards: { credits: 250000, gold: 250 } }
  ]
};

// ============================================
// LIGAS Y DIVISIONES
// ============================================
export interface League {
  id: string;
  name: string;
  tier: number; // 1 = más alta
  minRating: number;
  maxRating: number;
  players: number;
  promotionSpots: number;
  demotionSpots: number;
  rewards: {
    daily: { credits: number };
    weekly: { credits: number; gold?: number; items?: string[] };
  };
}

export const ARENA_LEAGUES: League[] = [
  {
    id: 'legend',
    name: 'Legend',
    tier: 1,
    minRating: 2400,
    maxRating: 9999,
    players: 100,
    promotionSpots: 0,
    demotionSpots: 10,
    rewards: { daily: { credits: 50000 }, weekly: { credits: 500000, gold: 500 } }
  },
  {
    id: 'diamond',
    name: 'Diamond',
    tier: 2,
    minRating: 2100,
    maxRating: 2399,
    players: 500,
    promotionSpots: 10,
    demotionSpots: 20,
    rewards: { daily: { credits: 30000 }, weekly: { credits: 300000, gold: 300 } }
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tier: 3,
    minRating: 1800,
    maxRating: 2099,
    players: 1000,
    promotionSpots: 20,
    demotionSpots: 50,
    rewards: { daily: { credits: 20000 }, weekly: { credits: 200000, gold: 200 } }
  },
  {
    id: 'gold',
    name: 'Gold',
    tier: 4,
    minRating: 1500,
    maxRating: 1799,
    players: 2000,
    promotionSpots: 50,
    demotionSpots: 100,
    rewards: { daily: { credits: 10000 }, weekly: { credits: 100000, gold: 100 } }
  },
  {
    id: 'silver',
    name: 'Silver',
    tier: 5,
    minRating: 1200,
    maxRating: 1499,
    players: 5000,
    promotionSpots: 100,
    demotionSpots: 200,
    rewards: { daily: { credits: 5000 }, weekly: { credits: 50000 } }
  },
  {
    id: 'bronze',
    name: 'Bronze',
    tier: 6,
    minRating: 0,
    maxRating: 1199,
    players: 10000,
    promotionSpots: 200,
    demotionSpots: 0,
    rewards: { daily: { credits: 2000 }, weekly: { credits: 20000 } }
  }
];

// ============================================
// SISTEMA DE TEMPORADAS
// ============================================
export interface Season {
  id: string;
  name: string;
  number: number;
  startDate: number;
  endDate: number;
  theme: string;
  exclusiveRewards: string[];
  description: string;
}

export const SEASONS: Season[] = [
  {
    id: 'season_1',
    name: 'Orígenes Galácticos',
    number: 1,
    startDate: new Date('2024-01-01').getTime(),
    endDate: new Date('2024-03-31').getTime(),
    theme: 'space_exploration',
    exclusiveRewards: ['cmd_season_1', 'emblem_season_1', 'skin_season_1'],
    description: 'La primera temporada de Galaxy Online II.'
  },
  {
    id: 'season_2',
    name: 'Guerra de Corporaciones',
    number: 2,
    startDate: new Date('2024-04-01').getTime(),
    endDate: new Date('2024-06-30').getTime(),
    theme: 'corp_warfare',
    exclusiveRewards: ['cmd_season_2', 'emblem_season_2', 'skin_season_2'],
    description: 'Las corporaciones luchan por el control.'
  }
];

// ============================================
// PASE DE BATALLA (BATTLE PASS)
// ============================================
export interface BattlePassTier {
  tier: number;
  freeReward?: { type: string; id: string; quantity: number };
  premiumReward: { type: string; id: string; quantity: number };
  xpRequired: number;
}

export interface BattlePass {
  id: string;
  name: string;
  season: number;
  price: number; // Gold
  tiers: BattlePassTier[];
  totalXp: number;
}

export const BATTLE_PASS: BattlePass = {
  id: 'bp_2024_1',
  name: 'Pase Galáctico',
  season: 1,
  price: 1000,
  tiers: Array.from({ length: 100 }, (_, i) => ({
    tier: i + 1,
    freeReward: i % 5 === 0 ? { type: 'chest', id: 'chest_rare', quantity: 1 } : undefined,
    premiumReward: { 
      type: i % 10 === 0 ? 'commander' : i % 5 === 0 ? 'chest' : 'resources',
      id: i % 10 === 0 ? 'cmd_random' : i % 5 === 0 ? 'chest_epic' : 'credits',
      quantity: i % 10 === 0 ? 1 : i % 5 === 0 ? 2 : 10000 * (i + 1)
    },
    xpRequired: 1000 * (i + 1)
  })),
  totalXp: 5000000
};

// ============================================
// HELPERS
// ============================================
export function getRankingRewards(type: RankingType, rank: number): RankingReward['rewards'] | null {
  const rewards = RANKING_REWARDS[type];
  const reward = rewards.find(r => rank >= r.rankMin && rank <= r.rankMax);
  return reward?.rewards || null;
}

export function getLeagueByRating(rating: number): League | undefined {
  return ARENA_LEAGUES.find(l => rating >= l.minRating && rating <= l.maxRating);
}

export function getCurrentSeason(): Season | null {
  const now = Date.now();
  return SEASONS.find(s => now >= s.startDate && now <= s.endDate) || null;
}

export function getBattlePassTier(tier: number): BattlePassTier | undefined {
  return BATTLE_PASS.tiers.find(t => t.tier === tier);
}

export function calculateRankChange(currentRank: number, previousRank: number): number {
  return previousRank - currentRank; // Positivo = subió, Negativo = bajó
}

export const RankingsSystem = {
  RANKING_REWARDS,
  ARENA_LEAGUES,
  SEASONS,
  BATTLE_PASS,
  getRankingRewards,
  getLeagueByRating,
  getCurrentSeason,
  getBattlePassTier,
  calculateRankChange
};
