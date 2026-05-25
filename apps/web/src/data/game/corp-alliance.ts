/**
 * SISTEMA CORP/ALIANZA COMPLETO - GALAXY ONLINE II
 * Corporaciones, misiones cooperativas, bonus de alianza y sistema de ayuda
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS Y ENUMERACIONES
// ============================================
export type CorpRank = 'recruit' | 'member' | 'veteran' | 'officer' | 'vice_leader' | 'leader';
export type CorpSize = 'small' | 'medium' | 'large' | 'mega';
export type CorpActivity = 'casual' | 'active' | 'competitive' | 'hardcore';

export interface CorpMember {
  playerId: string;
  playerName: string;
  rank: CorpRank;
  contributionPoints: number;
  joinedAt: number;
  lastActive: number;
  fleetPower: number;
  donations: {
    metal: number;
    plasma: number;
    credits: number;
  };
}

// ============================================
// ESTRUCTURA DE CORP
// ============================================
export interface Corp {
  id: string;
  name: string;
  tag: string;
  description: string;
  emblem: string;
  level: number;
  experience: number;
  maxMembers: number;
  members: CorpMember[];
  leaderId: string;
  createdAt: number;
  size: CorpSize;
  activity: CorpActivity;
  requirements: {
    minLevel?: number;
    minFleetPower?: number;
    applicationRequired: boolean;
  };
  stats: {
    totalFleetPower: number;
    totalContributions: number;
    warsWon: number;
    warsLost: number;
    constellationCompletions: number;
  };
  technologies: CorpTechnology[];
  store: CorpStore;
}

// ============================================
// RANGOS DE CORP
// ============================================
export interface CorpRankInfo {
  rank: CorpRank;
  name: string;
  permissions: {
    invite: boolean;
    kick: boolean;
    promote: boolean;
    demote: boolean;
    manageStore: boolean;
    startWar: boolean;
    editCorp: boolean;
    distributeDividends: boolean;
  };
  maxMembersAtRank: number;
}

export const CORP_RANKS: CorpRankInfo[] = [
  {
    rank: 'recruit',
    name: 'Recluta',
    permissions: {
      invite: false,
      kick: false,
      promote: false,
      demote: false,
      manageStore: false,
      startWar: false,
      editCorp: false,
      distributeDividends: false
    },
    maxMembersAtRank: 100
  },
  {
    rank: 'member',
    name: 'Miembro',
    permissions: {
      invite: true,
      kick: false,
      promote: false,
      demote: false,
      manageStore: false,
      startWar: false,
      editCorp: false,
      distributeDividends: false
    },
    maxMembersAtRank: 50
  },
  {
    rank: 'veteran',
    name: 'Veterano',
    permissions: {
      invite: true,
      kick: false,
      promote: false,
      demote: false,
      manageStore: true,
      startWar: false,
      editCorp: false,
      distributeDividends: false
    },
    maxMembersAtRank: 20
  },
  {
    rank: 'officer',
    name: 'Oficial',
    permissions: {
      invite: true,
      kick: true,
      promote: true,
      demote: true,
      manageStore: true,
      startWar: true,
      editCorp: false,
      distributeDividends: false
    },
    maxMembersAtRank: 10
  },
  {
    rank: 'vice_leader',
    name: 'Vice-Líder',
    permissions: {
      invite: true,
      kick: true,
      promote: true,
      demote: true,
      manageStore: true,
      startWar: true,
      editCorp: true,
      distributeDividends: true
    },
    maxMembersAtRank: 2
  },
  {
    rank: 'leader',
    name: 'Líder',
    permissions: {
      invite: true,
      kick: true,
      promote: true,
      demote: true,
      manageStore: true,
      startWar: true,
      editCorp: true,
      distributeDividends: true
    },
    maxMembersAtRank: 1
  }
];

// ============================================
// TAMAÑOS DE CORP
// ============================================
export const CORP_SIZES: Record<CorpSize, { maxMembers: number; baseTechSlots: number }> = {
  small: { maxMembers: 20, baseTechSlots: 3 },
  medium: { maxMembers: 50, baseTechSlots: 5 },
  large: { maxMembers: 100, baseTechSlots: 7 },
  mega: { maxMembers: 200, baseTechSlots: 10 }
};

// ============================================
// TECNOLOGÍAS DE CORP
// ============================================
export interface CorpTechnology {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  costPerLevel: {
    corpExp: number;
    metal: number;
    plasma: number;
    credits: number;
  };
  effect: {
    type: 'production' | 'combat' | 'defense' | 'research' | 'trade';
    bonusPercent: number;
  };
}

export const CORP_TECHNOLOGIES: CorpTechnology[] = [
  {
    id: 'tech_production_boost',
    name: 'Producción Mejorada',
    description: 'Aumenta la producción de recursos de todos los miembros.',
    maxLevel: 20,
    currentLevel: 0,
    costPerLevel: {
      corpExp: 1000,
      metal: 10000,
      plasma: 5000,
      credits: 10000
    },
    effect: {
      type: 'production',
      bonusPercent: 2
    }
  },
  {
    id: 'tech_combat_training',
    name: 'Entrenamiento de Combate',
    description: 'Aumenta el poder de ataque de las flotas de los miembros.',
    maxLevel: 20,
    currentLevel: 0,
    costPerLevel: {
      corpExp: 1500,
      metal: 15000,
      plasma: 10000,
      credits: 15000
    },
    effect: {
      type: 'combat',
      bonusPercent: 3
    }
  },
  {
    id: 'tech_defense_matrix',
    name: 'Matriz de Defensa',
    description: 'Aumenta la defensa de las flotas y estructuras de los miembros.',
    maxLevel: 20,
    currentLevel: 0,
    costPerLevel: {
      corpExp: 1500,
      metal: 20000,
      plasma: 10000,
      credits: 15000
    },
    effect: {
      type: 'defense',
      bonusPercent: 3
    }
  },
  {
    id: 'tech_research_collaboration',
    name: 'Colaboración de Investigación',
    description: 'Reduce el tiempo de investigación para todos los miembros.',
    maxLevel: 15,
    currentLevel: 0,
    costPerLevel: {
      corpExp: 2000,
      metal: 10000,
      plasma: 15000,
      credits: 20000
    },
    effect: {
      type: 'research',
      bonusPercent: 2
    }
  },
  {
    id: 'tech_trade_network',
    name: 'Red de Comercio',
    description: 'Reduce las tarifas de comercio entre miembros.',
    maxLevel: 10,
    currentLevel: 0,
    costPerLevel: {
      corpExp: 2500,
      metal: 5000,
      plasma: 5000,
      credits: 25000
    },
    effect: {
      type: 'trade',
      bonusPercent: 5
    }
  },
  {
    id: 'tech_constellation_mastery',
    name: 'Maestría de Constelación',
    description: 'Aumenta las recompensas de instancias de constelación.',
    maxLevel: 10,
    currentLevel: 0,
    costPerLevel: {
      corpExp: 3000,
      metal: 30000,
      plasma: 30000,
      credits: 30000
    },
    effect: {
      type: 'combat',
      bonusPercent: 5
    }
  }
];

// ============================================
// MISIÓNES CORPORATIVAS
// ============================================
export interface CorpMission {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'event';
  requirements: {
    type: 'donate' | 'combat' | 'research' | 'construction' | 'constellation';
    target: string;
    amount: number;
  };
  rewards: {
    corpExp: number;
    contributionPoints: number;
    personalCredits: number;
    chests?: string[];
  };
  timeLimit: number; // En horas
  participatingMembers: string[];
}

export const CORP_MISSIONS: CorpMission[] = [
  {
    id: 'mission_daily_donate',
    name: 'Donación Diaria',
    description: 'Dona recursos a la corporación.',
    type: 'daily',
    requirements: {
      type: 'donate',
      target: 'metal',
      amount: 10000
    },
    rewards: {
      corpExp: 500,
      contributionPoints: 50,
      personalCredits: 5000
    },
    timeLimit: 24,
    participatingMembers: []
  },
  {
    id: 'mission_weekly_combat',
    name: 'Guerreros Semanales',
    description: 'Completa 10 victorias en Arena o League.',
    type: 'weekly',
    requirements: {
      type: 'combat',
      target: 'pvp_wins',
      amount: 10
    },
    rewards: {
      corpExp: 2000,
      contributionPoints: 200,
      personalCredits: 20000,
      chests: ['chest_epic']
    },
    timeLimit: 168,
    participatingMembers: []
  },
  {
    id: 'mission_monthly_research',
    name: 'Investigación Masiva',
    description: 'Completa 5 investigaciones.',
    type: 'monthly',
    requirements: {
      type: 'research',
      target: 'any',
      amount: 5
    },
    rewards: {
      corpExp: 5000,
      contributionPoints: 500,
      personalCredits: 50000,
      chests: ['chest_legendary']
    },
    timeLimit: 720,
    participatingMembers: []
  },
  {
    id: 'mission_constellation',
    name: 'Conquistadores de Constelación',
    description: 'Completa una instancia de constelación.',
    type: 'weekly',
    requirements: {
      type: 'constellation',
      target: 'any',
      amount: 1
    },
    rewards: {
      corpExp: 3000,
      contributionPoints: 300,
      personalCredits: 30000,
      chests: ['chest_legendary']
    },
    timeLimit: 168,
    participatingMembers: []
  }
];

// ============================================
// TIENDA CORP
// ============================================
export interface CorpStoreItem {
  itemId: string;
  contributionCost: number;
  stock: number;
  maxStock: number;
  refreshTime: number;
}

export interface CorpStore {
  items: CorpStoreItem[];
  level: number;
  refreshCost: number;
  lastRefresh: number;
}

export const CORP_STORE_ITEMS: CorpStoreItem[] = [
  { itemId: 'chest_common', contributionCost: 100, stock: 50, maxStock: 50, refreshTime: 24 },
  { itemId: 'chest_rare', contributionCost: 500, stock: 20, maxStock: 20, refreshTime: 24 },
  { itemId: 'chest_epic', contributionCost: 2000, stock: 5, maxStock: 5, refreshTime: 72 },
  { itemId: 'speedup_1h', contributionCost: 300, stock: 30, maxStock: 30, refreshTime: 24 },
  { itemId: 'speedup_4h', contributionCost: 1000, stock: 10, maxStock: 10, refreshTime: 48 },
  { itemId: 'repair_kit', contributionCost: 150, stock: 50, maxStock: 50, refreshTime: 24 },
  { itemId: 'bp_frigate_t3', contributionCost: 2000, stock: 5, maxStock: 5, refreshTime: 168 },
  { itemId: 'bp_cruiser_t2', contributionCost: 5000, stock: 3, maxStock: 3, refreshTime: 168 },
  { itemId: 'gem_red_3', contributionCost: 3000, stock: 2, maxStock: 2, refreshTime: 168 },
  { itemId: 'gem_blue_3', contributionCost: 3000, stock: 2, maxStock: 2, refreshTime: 168 }
];

// ============================================
// GUERRAS CORP
// ============================================
export interface CorpWar {
  id: string;
  attackerCorpId: string;
  defenderCorpId: string;
  status: 'pending' | 'active' | 'ended';
  startTime: number;
  endTime: number;
  participants: {
    attacker: string[];
    defender: string[];
  };
  battles: CorpBattle[];
  winner?: string;
  rewards: {
    winner: {
      corpExp: number;
      honorPoints: number;
      credits: number;
    };
    loser: {
      corpExp: number;
      honorPoints: number;
    };
  };
}

export interface CorpBattle {
  id: string;
  attackerId: string;
  defenderId: string;
  attackerFleetPower: number;
  defenderFleetPower: number;
  winner: string;
  timestamp: number;
  honorGained: number;
}

// ============================================
// BONUS DE ALIANZA
// ============================================
export interface AllianceBonuses {
  production: number;
  combat: number;
  defense: number;
  research: number;
  trade: number;
}

export function calculateAllianceBonuses(
  corpLevel: number,
  technologies: CorpTechnology[]
): AllianceBonuses {
  const bonuses: AllianceBonuses = {
    production: 0,
    combat: 0,
    defense: 0,
    research: 0,
    trade: 0
  };
  
  // Bonus base por nivel de corp
  bonuses.production += corpLevel * 0.5; // +0.5% por nivel
  bonuses.combat += corpLevel * 0.3;
  bonuses.defense += corpLevel * 0.3;
  
  // Bonus por tecnologías
  for (const tech of technologies) {
    const bonus = tech.currentLevel * tech.effect.bonusPercent;
    bonuses[tech.effect.type] += bonus;
  }
  
  return bonuses;
}

// ============================================
// SISTEMA DE AYUDA MUTUA
// ============================================
export interface HelpRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  type: 'construction' | 'research' | 'ship_build';
  targetId: string;
  helpReceived: number;
  maxHelp: number;
  timeReduction: number; // Minutos reducidos por cada ayuda
  expiresAt: number;
  helpers: string[];
}

export const HELP_SYSTEM_CONFIG = {
  maxHelpPerRequest: 10,
  timeReductionPerHelp: 5, // 5 minutos
  maxTimeReduction: 30, // 30 minutos máximo
  rewardForHelping: {
    contributionPoints: 5,
    credits: 100
  }
};

// ============================================
// CALCULOS DE CONTRIBUCIÓN
// ============================================
export function calculateContributionPoints(
  action: 'donate' | 'combat' | 'construction' | 'research',
  amount: number
): number {
  const multipliers: Record<string, number> = {
    donate: 0.01,      // 1 punto por cada 100 unidades
    combat: 100,       // 100 puntos por victoria
    construction: 50,  // 50 puntos por construcción
    research: 75       // 75 puntos por investigación
  };
  
  return Math.floor(amount * multipliers[action]);
}

export function calculateCorpExpGain(
  action: 'mission_complete' | 'donation' | 'war_win' | 'constellation',
  amount: number
): number {
  const baseGains: Record<string, number> = {
    mission_complete: 500,
    donation: 0.05,    // 1 exp por cada 20 unidades
    war_win: 5000,
    constellation: 3000
  };
  
  if (action === 'donation') {
    return Math.floor(amount * baseGains[action]);
  }
  
  return baseGains[action] || 0;
}

// ============================================
// CREAR NUEVA CORP
// ============================================
export const CORP_CREATION_COST: Record<ResourceKey, number> = {
  metal: 100000,
  plasma: 50000,
  credits: 100000,
  energy: 0
};

export const CORP_CREATION_REQUIREMENTS = {
  playerLevel: 10,
  fleetPower: 50000
};

export function createCorp(
  founderId: string,
  founderName: string,
  name: string,
  tag: string,
  description: string,
  size: CorpSize = 'small'
): Corp {
  const now = Date.now();
  const sizeConfig = CORP_SIZES[size];
  
  return {
    id: `corp_${now}`,
    name,
    tag,
    description,
    emblem: '🏢',
    level: 1,
    experience: 0,
    maxMembers: sizeConfig.maxMembers,
    members: [
      {
        playerId: founderId,
        playerName: founderName,
        rank: 'leader',
        contributionPoints: 0,
        joinedAt: now,
        lastActive: now,
        fleetPower: 0,
        donations: { metal: 0, plasma: 0, credits: 0 }
      }
    ],
    leaderId: founderId,
    createdAt: now,
    size,
    activity: 'active',
    requirements: {
      minLevel: 5,
      applicationRequired: true
    },
    stats: {
      totalFleetPower: 0,
      totalContributions: 0,
      warsWon: 0,
      warsLost: 0,
      constellationCompletions: 0
    },
    technologies: CORP_TECHNOLOGIES.map(tech => ({ ...tech, currentLevel: 0 })),
    store: {
      items: [...CORP_STORE_ITEMS],
      level: 1,
      refreshCost: 100,
      lastRefresh: now
    }
  };
}

// ============================================
// HELPERS
// ============================================

export function getCorpRankInfo(rank: CorpRank): CorpRankInfo | undefined {
  return CORP_RANKS.find(r => r.rank === rank);
}

export function canPerformAction(
  memberRank: CorpRank,
  action: keyof CorpRankInfo['permissions']
): boolean {
  const rankInfo = getCorpRankInfo(memberRank);
  return rankInfo?.permissions[action] || false;
}

export function getMaxMembersForSize(size: CorpSize): number {
  return CORP_SIZES[size].maxMembers;
}

export function calculateCorpLevel(corpExp: number): number {
  // Fórmula exponencial: nivel = log(experiencia / 1000) / log(1.5) + 1
  const level = Math.floor(Math.log(corpExp / 1000) / Math.log(1.5)) + 1;
  return Math.max(1, level);
}

export function getNextLevelExp(corpLevel: number): number {
  return Math.floor(1000 * Math.pow(1.5, corpLevel - 1));
}

export function isRankHigher(rankA: CorpRank, rankB: CorpRank): boolean {
  const ranks: CorpRank[] = ['recruit', 'member', 'veteran', 'officer', 'vice_leader', 'leader'];
  return ranks.indexOf(rankA) > ranks.indexOf(rankB);
}

export function canPromote(
  promoterRank: CorpRank,
  targetCurrentRank: CorpRank,
  targetNewRank: CorpRank
): boolean {
  // Solo puedes promover a alguien a un rango menor que el tuyo
  if (!isRankHigher(promoterRank, targetNewRank)) return false;
  
  // Solo puedes promover a alguien si eres oficial o superior
  const promoterInfo = getCorpRankInfo(promoterRank);
  if (!promoterInfo?.permissions.promote) return false;
  
  // No puedes promover a alguien a un rango igual o mayor que el tuyo
  if (!isRankHigher(promoterRank, targetNewRank)) return false;
  
  return true;
}

export const CorpSystem = {
  CORP_RANKS,
  CORP_SIZES,
  CORP_TECHNOLOGIES,
  CORP_MISSIONS,
  CORP_STORE_ITEMS,
  HELP_SYSTEM_CONFIG,
  CORP_CREATION_COST,
  CORP_CREATION_REQUIREMENTS,
  createCorp,
  calculateAllianceBonuses,
  calculateContributionPoints,
  calculateCorpExpGain,
  calculateCorpLevel,
  getNextLevelExp,
  getCorpRankInfo,
  canPerformAction,
  getMaxMembersForSize,
  isRankHigher,
  canPromote
};
