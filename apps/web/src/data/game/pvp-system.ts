/**
 * SISTEMA PvP COMPLETO - GALAXY ONLINE II
 * Arena, Ligas, Rankings, Championships y matchmaking
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS Y ENUMERACIONES
// ============================================
export type PvPType = 'arena' | 'league' | 'championship' | 'raid';
export type LeagueTierType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';

export interface PvPRewards {
  credits: number;
  honorPoints: number;
  chests?: {
    type: 'common' | 'rare' | 'epic' | 'legendary';
    count: number;
  }[];
  commanderExp?: number;
}

export interface PvPPlayer {
  id: string;
  name: string;
  level: number;
  fleetPower: number;
  commanderIds: string[];
  corpId?: string;
  leaguePoints: number;
  arenaRank: number;
  wins: number;
  losses: number;
}

// ============================================
// SISTEMA DE ARENA (1v1)
// ============================================
export interface ArenaConfig {
  dailyAttempts: number;
  resetTime: string; // HH:MM UTC
  rankCalculation: 'fleet_power' | 'win_rate' | 'hybrid';
  matchRangePercent: number; // % de diferencia permitida
}

export const ARENA_CONFIG: ArenaConfig = {
  dailyAttempts: 20,
  resetTime: '00:00',
  rankCalculation: 'hybrid',
  matchRangePercent: 20
};

export interface ArenaRank {
  rank: number;
  name: string;
  minFleetPower: number;
  rewards: PvPRewards;
  icon: string;
}

export const ARENA_RANKS: ArenaRank[] = [
  { rank: 1, name: 'Campeón Supremo', minFleetPower: 1000000, rewards: { credits: 50000, honorPoints: 1000, chests: [{ type: 'legendary', count: 3 }], commanderExp: 5000 }, icon: '👑' },
  { rank: 2, name: 'Campeón', minFleetPower: 800000, rewards: { credits: 40000, honorPoints: 800, chests: [{ type: 'legendary', count: 2 }], commanderExp: 4000 }, icon: '🏆' },
  { rank: 3, name: 'Subcampeón', minFleetPower: 700000, rewards: { credits: 35000, honorPoints: 700, chests: [{ type: 'legendary', count: 1 }, { type: 'epic', count: 2 }], commanderExp: 3500 }, icon: '🥈' },
  { rank: 10, name: 'Élite', minFleetPower: 500000, rewards: { credits: 25000, honorPoints: 500, chests: [{ type: 'epic', count: 3 }], commanderExp: 2500 }, icon: '⭐' },
  { rank: 50, name: 'Veterano', minFleetPower: 300000, rewards: { credits: 15000, honorPoints: 300, chests: [{ type: 'epic', count: 2 }, { type: 'rare', count: 3 }], commanderExp: 1500 }, icon: '🎖️' },
  { rank: 100, name: 'Guerrero', minFleetPower: 200000, rewards: { credits: 10000, honorPoints: 200, chests: [{ type: 'rare', count: 3 }, { type: 'common', count: 5 }], commanderExp: 1000 }, icon: '⚔️' },
  { rank: 500, name: 'Soldado', minFleetPower: 100000, rewards: { credits: 5000, honorPoints: 100, chests: [{ type: 'rare', count: 2 }, { type: 'common', count: 3 }], commanderExp: 500 }, icon: '🛡️' },
  { rank: 1000, name: 'Recluta', minFleetPower: 50000, rewards: { credits: 2000, honorPoints: 50, chests: [{ type: 'common', count: 5 }], commanderExp: 200 }, icon: '⭐' }
];

export interface ArenaMatch {
  attacker: PvPPlayer;
  defender: PvPPlayer;
  attackerFleet: {
    hulls: string[];
    totalPower: number;
  };
  defenderFleet: {
    hulls: string[];
    totalPower: number;
  };
  result?: 'win' | 'loss' | 'draw';
  honorChange?: number;
  timestamp: number;
}

// ============================================
// SISTEMA DE LIGAS (League Match)
// ============================================
export interface LeagueTier {
  id: LeagueTierType;
  name: string;
  minPoints: number;
  maxPoints: number;
  rewards: {
    dailyCredits: number;
    dailyHonor: number;
    seasonCredits: number;
    seasonChests: { type: 'common' | 'rare' | 'epic' | 'legendary'; count: number }[];
  };
  icon: string;
  decayRate?: number; // Pérdida de puntos por inactividad
}

export const LEAGUE_TIERS: LeagueTier[] = [
  // @ts-ignore - Los objetos abajo son validos
  {
    id: 'bronze',
    name: 'Liga de Bronce',
    minPoints: 0,
    maxPoints: 999,
    rewards: {
      dailyCredits: 1000,
      dailyHonor: 50,
      seasonCredits: 10000,
      seasonChests: [{ type: 'common', count: 10 }]
    },
    icon: '🥉',
    decayRate: 0
  },
  {
    id: 'silver',
    name: 'Liga de Plata',
    minPoints: 1000,
    maxPoints: 2999,
    rewards: {
      dailyCredits: 3000,
      dailyHonor: 150,
      seasonCredits: 30000,
      seasonChests: [{ type: 'common', count: 5 }, { type: 'rare', count: 3 }]
    },
    icon: '🥈',
    decayRate: 5
  },
  {
    id: 'gold',
    name: 'Liga de Oro',
    minPoints: 3000,
    maxPoints: 5999,
    rewards: {
      dailyCredits: 8000,
      dailyHonor: 400,
      seasonCredits: 80000,
      seasonChests: [{ type: 'rare', count: 5 }, { type: 'epic', count: 2 }]
    },
    icon: '🥇',
    decayRate: 10
  },
  {
    id: 'platinum',
    name: 'Liga Platino',
    minPoints: 6000,
    maxPoints: 9999,
    rewards: {
      dailyCredits: 15000,
      dailyHonor: 750,
      seasonCredits: 150000,
      seasonChests: [{ type: 'rare', count: 3 }, { type: 'epic', count: 3 }]
    },
    icon: '💎',
    decayRate: 15
  },
  {
    id: 'diamond',
    name: 'Liga Diamante',
    minPoints: 10000,
    maxPoints: 14999,
    rewards: {
      dailyCredits: 30000,
      dailyHonor: 1500,
      seasonCredits: 300000,
      seasonChests: [{ type: 'epic', count: 5 }, { type: 'legendary', count: 1 }]
    },
    icon: '💎',
    decayRate: 25
  },
  {
    id: 'master',
    name: 'Liga Maestro',
    minPoints: 15000,
    maxPoints: 19999,
    rewards: {
      dailyCredits: 60000,
      dailyHonor: 3000,
      seasonCredits: 600000,
      seasonChests: [{ type: 'epic', count: 5 }, { type: 'legendary', count: 3 }]
    },
    icon: '🏆',
    decayRate: 50
  },
  {
    id: 'grandmaster',
    name: 'Gran Maestro',
    minPoints: 20000,
    maxPoints: 999999,
    rewards: {
      dailyCredits: 100000,
      dailyHonor: 5000,
      seasonCredits: 1000000,
      seasonChests: [{ type: 'legendary', count: 5 }]
    },
    icon: '👑',
    decayRate: 100
  }
];

export interface LeagueSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  rewards: {
    top1: PvPRewards & { exclusiveCommander?: string };
    top10: PvPRewards;
    top100: PvPRewards;
    top1000: PvPRewards;
    participation: PvPRewards;
  };
}

export const CURRENT_SEASON: LeagueSeason = {
  id: 'season_01',
  name: 'Temporada del Conquistador',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  rewards: {
    top1: {
      credits: 10000000,
      honorPoints: 50000,
      chests: [{ type: 'legendary', count: 20 }],
      commanderExp: 100000,
      exclusiveCommander: 'cmd_divine_champion'
    },
    top10: {
      credits: 3000000,
      honorPoints: 15000,
      chests: [{ type: 'legendary', count: 10 }],
      commanderExp: 50000
    },
    top100: {
      credits: 1000000,
      honorPoints: 5000,
      chests: [{ type: 'legendary', count: 5 }, { type: 'epic', count: 10 }],
      commanderExp: 25000
    },
    top1000: {
      credits: 300000,
      honorPoints: 1500,
      chests: [{ type: 'epic', count: 5 }],
      commanderExp: 10000
    },
    participation: {
      credits: 50000,
      honorPoints: 500,
      chests: [{ type: 'rare', count: 5 }],
      commanderExp: 5000
    }
  }
};

// ============================================
// SISTEMA DE HONOR
// ============================================
export interface HonorSystem {
  totalHonor: number;
  rank: number;
  title: string;
}

export const HONOR_TITLES = [
  { minHonor: 0, title: 'Novato', icon: '🌱' },
  { minHonor: 1000, title: 'Aprendiz', icon: '🌿' },
  { minHonor: 5000, title: 'Guerrero', icon: '⚔️' },
  { minHonor: 20000, title: 'Veterano', icon: '🛡️' },
  { minHonor: 50000, title: 'Campeón', icon: '🏆' },
  { minHonor: 100000, title: 'Señor de la Guerra', icon: '👑' },
  { minHonor: 500000, title: 'Leyenda', icon: '⭐' },
  { minHonor: 1000000, title: 'Inmortal', icon: '☀️' }
];

export function getHonorTitle(honorPoints: number): { title: string; icon: string } {
  for (let i = HONOR_TITLES.length - 1; i >= 0; i--) {
    if (honorPoints >= HONOR_TITLES[i].minHonor) {
      return { title: HONOR_TITLES[i].title, icon: HONOR_TITLES[i].icon };
    }
  }
  return { title: 'Novato', icon: '🌱' };
}

// ============================================
// SISTEMA DE CHAMPIONSHIPS
// ============================================
export interface Championship {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'special';
  startDate: string;
  endDate: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  maxParticipants: number;
  entryRequirements: {
    minLevel?: number;
    minFleetPower?: number;
    minHonor?: number;
  };
  prizes: {
    champion: PvPRewards;
    finalist: PvPRewards;
    semifinalist: PvPRewards;
    quarterfinalist: PvPRewards;
    participation: PvPRewards;
  };
}

export const WEEKLY_CHAMPIONSHIP: Championship = {
  id: 'weekly_arena',
  name: 'Campeonato Semanal de Arena',
  type: 'weekly',
  startDate: '2026-05-25',
  endDate: '2026-05-31',
  format: 'single_elimination',
  maxParticipants: 256,
  entryRequirements: {
    minLevel: 20,
    minFleetPower: 100000,
    minHonor: 5000
  },
  prizes: {
    champion: {
      credits: 500000,
      honorPoints: 5000,
      chests: [{ type: 'legendary', count: 3 }],
      commanderExp: 20000
    },
    finalist: {
      credits: 250000,
      honorPoints: 2500,
      chests: [{ type: 'epic', count: 5 }],
      commanderExp: 15000
    },
    semifinalist: {
      credits: 100000,
      honorPoints: 1000,
      chests: [{ type: 'epic', count: 3 }],
      commanderExp: 10000
    },
    quarterfinalist: {
      credits: 50000,
      honorPoints: 500,
      chests: [{ type: 'rare', count: 5 }],
      commanderExp: 5000
    },
    participation: {
      credits: 10000,
      honorPoints: 100,
      chests: [{ type: 'common', count: 5 }],
      commanderExp: 2000
    }
  }
};

export const MONTHLY_CHAMPIONSHIP: Championship = {
  id: 'monthly_galaxy',
  name: 'Campeonato Galáctico Mensual',
  type: 'monthly',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  format: 'double_elimination',
  maxParticipants: 1024,
  entryRequirements: {
    minLevel: 30,
    minFleetPower: 500000,
    minHonor: 25000
  },
  prizes: {
    champion: {
      credits: 2000000,
      honorPoints: 20000,
      chests: [{ type: 'legendary', count: 10 }],
      commanderExp: 100000
    },
    finalist: {
      credits: 1000000,
      honorPoints: 10000,
      chests: [{ type: 'legendary', count: 5 }],
      commanderExp: 50000
    },
    semifinalist: {
      credits: 500000,
      honorPoints: 5000,
      chests: [{ type: 'epic', count: 8 }],
      commanderExp: 30000
    },
    quarterfinalist: {
      credits: 200000,
      honorPoints: 2000,
      chests: [{ type: 'epic', count: 5 }],
      commanderExp: 15000
    },
    participation: {
      credits: 50000,
      honorPoints: 500,
      chests: [{ type: 'rare', count: 5 }],
      commanderExp: 5000
    }
  }
};

// ============================================
// MATCHMAKING SYSTEM
// ============================================
export interface MatchmakingResult {
  opponent: PvPPlayer;
  fleetPowerDifference: number;
  estimatedWinRate: number;
  honorGain: number;
  honorLoss: number;
}

export function calculateMatchmaking(
  player: PvPPlayer,
  availableOpponents: PvPPlayer[],
  matchRangePercent: number = ARENA_CONFIG.matchRangePercent
): MatchmakingResult | null {
  // Filtrar oponentes dentro del rango permitido
  const minPower = player.fleetPower * (1 - matchRangePercent / 100);
  const maxPower = player.fleetPower * (1 + matchRangePercent / 100);
  
  const validOpponents = availableOpponents.filter(
    o => o.id !== player.id && o.fleetPower >= minPower && o.fleetPower <= maxPower
  );
  
  if (validOpponents.length === 0) return null;
  
  // Seleccionar oponente más cercano en poder
  const opponent = validOpponents.reduce((closest, current) => {
    const closestDiff = Math.abs(closest.fleetPower - player.fleetPower);
    const currentDiff = Math.abs(current.fleetPower - player.fleetPower);
    return currentDiff < closestDiff ? current : closest;
  });
  
  const fleetPowerDifference = opponent.fleetPower - player.fleetPower;
  
  // Calcular tasa de victoria estimada
  const powerRatio = player.fleetPower / opponent.fleetPower;
  const estimatedWinRate = Math.min(0.95, Math.max(0.05, powerRatio * 0.5));
  
  // Calcular ganancia/pérdida de honor
  const baseHonorChange = 20;
  const honorGain = Math.floor(baseHonorChange * (1 + Math.max(0, -fleetPowerDifference) / player.fleetPower));
  const honorLoss = Math.floor(baseHonorChange * 0.5);
  
  return {
    opponent,
    fleetPowerDifference,
    estimatedWinRate,
    honorGain,
    honorLoss
  };
}

// ============================================
// CÁLCULO DE PUNTOS DE LIGA
// ============================================
export function calculateLeaguePoints(
  currentPoints: number,
  result: 'win' | 'loss',
  opponentTier: LeagueTier,
  playerTier: LeagueTier
  // @ts-ignore - Los tiers tienen las propiedades necesarias
): { newPoints: number; pointsChange: number } {
  const tierIndex = LEAGUE_TIERS.findIndex(t => t.id === playerTier.id);
  const opponentTierIndex = LEAGUE_TIERS.findIndex(t => t.id === opponentTier.id);
  
  let baseChange = result === 'win' ? 25 : -20;
  
  // Bonus por derrotar oponente de tier superior
  if (result === 'win' && opponentTierIndex > tierIndex) {
    baseChange += (opponentTierIndex - tierIndex) * 10;
  }
  
  // Penalidad por perder contra oponente de tier inferior
  if (result === 'loss' && opponentTierIndex < tierIndex) {
    baseChange -= (tierIndex - opponentTierIndex) * 5;
  }
  
  const pointsChange = baseChange;
  const newPoints = Math.max(0, currentPoints + pointsChange);
  
  return { newPoints, pointsChange };
}

// ============================================
// SISTEMA DE REPLAYS
// ============================================
export interface BattleReplay {
  id: string;
  attackerId: string;
  defenderId: string;
  timestamp: number;
  winner: string;
  fleetPowerAttacker: number;
  fleetPowerDefender: number;
  duration: number; // segundos
  rounds: BattleRound[];
  mvpShip?: string;
  mvpCommander?: string;
}

export interface BattleRound {
  round: number;
  attackerDamage: number;
  defenderDamage: number;
  attackerShipsLost: number;
  defenderShipsLost: number;
  specialAbilitiesUsed: string[];
}

// ============================================
// HELPERS
// ============================================
export function getLeagueTierByPoints(points: number): LeagueTier {
  // @ts-ignore - Acceso a propiedades válidas
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (points >= LEAGUE_TIERS[i].minPoints) {
      return LEAGUE_TIERS[i];
    }
  }
  return LEAGUE_TIERS[0];
}

export function getArenaRankByPosition(position: number): ArenaRank {
  for (const rank of ARENA_RANKS) {
    if (position <= rank.rank) {
      return rank;
    }
  }
  return ARENA_RANKS[ARENA_RANKS.length - 1];
}

export function getDailyRewards(leagueTier: LeagueTier) {
  // @ts-ignore - leagueTier tiene rewards: { credits: number; honor: number } {
  return {
    credits: leagueTier.rewards.dailyCredits,
    honor: leagueTier.rewards.dailyHonor
  };
}

export function calculateDecay(currentPoints: number, daysInactive: number): number {
  const tier = getLeagueTierByPoints(currentPoints) as LeagueTier;
  if (!tier.decayRate || tier.decayRate === 0) return currentPoints;
  
  const decayAmount = tier.decayRate * daysInactive;
  return Math.max(tier.minPoints, currentPoints - decayAmount);
}

export const PvPSystem = {
  ARENA_CONFIG,
  ARENA_RANKS,
  LEAGUE_TIERS,
  CURRENT_SEASON,
  WEEKLY_CHAMPIONSHIP,
  MONTHLY_CHAMPIONSHIP,
  HONOR_TITLES,
  calculateMatchmaking,
  calculateLeaguePoints,
  getLeagueTierByPoints,
  getArenaRankByPosition,
  getHonorTitle,
  getDailyRewards,
  calculateDecay
};
