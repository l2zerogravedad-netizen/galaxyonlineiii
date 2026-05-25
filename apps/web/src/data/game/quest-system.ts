/**
 * SISTEMA DE MISIONES Y QUESTS - GALAXY ONLINE II
 * Quests principales, secundarias, eventos temporales y logros
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS DE MISIONES
// ============================================
export type QuestType = 
  | 'main'           // Misión principal de historia
  | 'side'           // Misión secundaria
  | 'daily'          // Misión diaria
  | 'weekly'         // Misión semanal
  | 'achievement'    // Logro desbloqueable
  | 'event'          // Misión de evento temporal
  | 'tutorial'       // Misión de tutorial
  | 'chain'          // Cadena de misiones
  | 'hidden';        // Misión secreta

export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary';

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'claimed';

export type QuestObjectiveType =
  | 'build'
  | 'upgrade'
  | 'research'
  | 'build_ship'
  | 'win_battle'
  | 'collect_resources'
  | 'defeat_enemy'
  | 'explore'
  | 'trade'
  | 'join_corp'
  | 'complete_instance'
  | 'reach_level'
  | 'have_fleet_power'
  | 'capture_planet'
  | 'defend_base'
  | 'spy'
  | 'donate';

// ============================================
// ESTRUCTURA DE QUEST
// ============================================
export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  targetId?: string; // ID del edificio/nave/investigación/etc
  targetAmount: number;
  currentAmount: number;
  completed: boolean;
}

export interface QuestReward {
  resources?: Partial<Record<ResourceKey, number>>;
  items?: { itemId: string; quantity: number }[];
  experience?: number;
  honorPoints?: number;
  achievementPoints?: number;
  unlockQuestId?: string;
  unlockBuildingId?: string;
  unlockResearchId?: string;
  title?: string;
  emblem?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  status: QuestStatus;
  levelRequired: number;
  prerequisites?: {
    questIds?: string[];
    buildingLevel?: { buildingId: string; level: number };
    researchLevel?: { researchId: string; level: number };
    fleetPower?: number;
    playerLevel?: number;
  };
  objectives: QuestObjective[];
  rewards: QuestReward;
  timeLimit?: number; // En segundos, 0 = sin límite
  chainInfo?: {
    chainId: string;
    step: number;
    totalSteps: number;
    previousQuestId?: string;
    nextQuestId?: string;
  };
  isRepeatable: boolean;
  cooldown?: number; // Tiempo antes de poder repetir
  icon: string;
  hint?: string; // Pista para misiones ocultas
}

// ============================================
// MISIONES PRINCIPALES (MAIN STORY)
// ============================================
export const MAIN_STORY_QUESTS: Quest[] = [
  {
    id: 'quest_chapter1_01',
    name: 'El Comienzo',
    description: 'Construye tu primer Centro de Comando y establece tu base en el planeta.',
    type: 'main',
    difficulty: 'easy',
    status: 'available',
    levelRequired: 1,
    objectives: [
      { id: 'obj_build_cc', type: 'build', description: 'Construir Centro de Comando', targetId: 'command_center', targetAmount: 1, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { metal: 1000, plasma: 500, credits: 1000 },
      experience: 100,
      unlockQuestId: 'quest_chapter1_02'
    },
    isRepeatable: false,
    icon: '🏗️'
  },
  {
    id: 'quest_chapter1_02',
    name: 'Recursos Básicos',
    description: 'Construye un extractor de metal y una planta de plasma para obtener recursos.',
    type: 'main',
    difficulty: 'easy',
    status: 'locked',
    levelRequired: 1,
    prerequisites: { questIds: ['quest_chapter1_01'] },
    objectives: [
      { id: 'obj_build_metal', type: 'build', description: 'Construir Extractor de Metal', targetId: 'metal_extractor', targetAmount: 1, currentAmount: 0, completed: false },
      { id: 'obj_build_plasma', type: 'build', description: 'Construir Planta de Plasma', targetId: 'plasma_plant', targetAmount: 1, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { metal: 2000, plasma: 1000, credits: 1500 },
      experience: 200,
      unlockQuestId: 'quest_chapter1_03'
    },
    isRepeatable: false,
    icon: '⛏️'
  },
  {
    id: 'quest_chapter1_03',
    name: 'Primeras Naves',
    description: 'Construye un Astillero y fabrica tu primera fragata.',
    type: 'main',
    difficulty: 'easy',
    status: 'locked',
    levelRequired: 2,
    prerequisites: { questIds: ['quest_chapter1_02'] },
    objectives: [
      { id: 'obj_build_shipyard', type: 'build', description: 'Construir Astillero', targetId: 'shipyard', targetAmount: 1, currentAmount: 0, completed: false },
      { id: 'obj_build_frigate', type: 'build_ship', description: 'Fabricar 3 Fragatas', targetId: 'frigate_t1', targetAmount: 3, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { metal: 3000, plasma: 1500, credits: 2000 },
      experience: 300,
      items: [{ itemId: 'repair_kit', quantity: 5 }],
      unlockQuestId: 'quest_chapter1_04'
    },
    isRepeatable: false,
    icon: '🚀'
  },
  {
    id: 'quest_chapter1_04',
    name: 'Investigación Inicial',
    description: 'Construye un Laboratorio de Investigación y completa tu primera investigación.',
    type: 'main',
    difficulty: 'normal',
    status: 'locked',
    levelRequired: 3,
    prerequisites: { questIds: ['quest_chapter1_03'] },
    objectives: [
      { id: 'obj_build_research', type: 'build', description: 'Construir Laboratorio', targetId: 'research_lab', targetAmount: 1, currentAmount: 0, completed: false },
      { id: 'obj_research', type: 'research', description: 'Completar cualquier investigación', targetAmount: 1, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { metal: 5000, plasma: 2500, credits: 3000 },
      experience: 500,
      unlockQuestId: 'quest_chapter2_01'
    },
    isRepeatable: false,
    icon: '🔬'
  },
  {
    id: 'quest_chapter2_01',
    name: 'Expansión Galáctica',
    description: 'Mejora tu Centro de Comando a nivel 5 y expande tu imperio.',
    type: 'main',
    difficulty: 'normal',
    status: 'locked',
    levelRequired: 5,
    prerequisites: { 
      questIds: ['quest_chapter1_04'],
      buildingLevel: { buildingId: 'command_center', level: 3 }
    },
    objectives: [
      { id: 'obj_upgrade_cc', type: 'upgrade', description: 'Centro de Comando a nivel 5', targetId: 'command_center', targetAmount: 5, currentAmount: 0, completed: false },
      { id: 'obj_fleet_power', type: 'have_fleet_power', description: 'Alcanzar 50,000 de poder de flota', targetAmount: 50000, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { metal: 10000, plasma: 5000, credits: 10000 },
      experience: 1000,
      items: [{ itemId: 'chest_epic', quantity: 1 }],
      unlockQuestId: 'quest_chapter2_02'
    },
    isRepeatable: false,
    icon: '🌌'
  },
  {
    id: 'quest_chapter2_02',
    name: 'Primer Combate',
    description: 'Gana tu primera batalla en el PvP Arena.',
    type: 'main',
    difficulty: 'normal',
    status: 'locked',
    levelRequired: 8,
    prerequisites: { questIds: ['quest_chapter2_01'] },
    objectives: [
      { id: 'obj_win_arena', type: 'win_battle', description: 'Ganar 5 batallas en Arena', targetAmount: 5, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 15000 },
      experience: 1500,
      honorPoints: 500,
      unlockQuestId: 'quest_chapter2_03'
    },
    isRepeatable: false,
    icon: '⚔️'
  },
  {
    id: 'quest_chapter2_03',
    name: 'Únete a una Corporación',
    description: 'Únete o crea una corporación para acceder a misiones cooperativas.',
    type: 'main',
    difficulty: 'normal',
    status: 'locked',
    levelRequired: 10,
    prerequisites: { questIds: ['quest_chapter2_02'] },
    objectives: [
      { id: 'obj_join_corp', type: 'join_corp', description: 'Unirse a una Corporación', targetAmount: 1, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 20000 },
      experience: 2000,
      items: [{ itemId: 'corp_token', quantity: 100 }],
      unlockQuestId: 'quest_chapter3_01'
    },
    isRepeatable: false,
    icon: '🏢'
  },
  {
    id: 'quest_chapter3_01',
    name: 'Conquistador de Instancias',
    description: 'Completa tu primera instancia de Constelación.',
    type: 'main',
    difficulty: 'hard',
    status: 'locked',
    levelRequired: 15,
    prerequisites: { questIds: ['quest_chapter2_03'] },
    objectives: [
      { id: 'obj_complete_instance', type: 'complete_instance', description: 'Completar cualquier instancia de Constelación', targetAmount: 1, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 50000 },
      experience: 5000,
      items: [{ itemId: 'chest_legendary', quantity: 1 }],
      unlockQuestId: 'quest_chapter3_02'
    },
    isRepeatable: false,
    icon: '🌟'
  },
  {
    id: 'quest_chapter3_02',
    name: 'Poder Supremo',
    description: 'Alcanza 1,000,000 de poder de flota y domina la galaxia.',
    type: 'main',
    difficulty: 'legendary',
    status: 'locked',
    levelRequired: 50,
    prerequisites: { 
      questIds: ['quest_chapter3_01'],
      fleetPower: 500000
    },
    objectives: [
      { id: 'obj_fleet_power_supreme', type: 'have_fleet_power', description: 'Alcanzar 1,000,000 de poder de flota', targetAmount: 1000000, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 1000000 },
      experience: 50000,
      items: [{ itemId: 'cmd_divine_random', quantity: 1 }],
      title: 'Señor de la Galaxia',
      emblem: '👑'
    },
    isRepeatable: false,
    icon: '👑'
  }
];

// ============================================
// MISIONES SECUNDARIAS
// ============================================
export const SIDE_QUESTS: Quest[] = [
  {
    id: 'quest_side_economy',
    name: 'Maestro de la Economía',
    description: 'Produce 100,000 de cada recurso básico.',
    type: 'side',
    difficulty: 'normal',
    status: 'available',
    levelRequired: 5,
    objectives: [
      { id: 'obj_produce_metal', type: 'collect_resources', description: 'Producir 100,000 de Metal', targetId: 'metal', targetAmount: 100000, currentAmount: 0, completed: false },
      { id: 'obj_produce_plasma', type: 'collect_resources', description: 'Producir 100,000 de Plasma', targetId: 'plasma', targetAmount: 100000, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 25000 },
      experience: 2000,
      achievementPoints: 100
    },
    isRepeatable: true,
    cooldown: 86400, // 24 horas
    icon: '💰'
  },
  {
    id: 'quest_side_fleet_commander',
    name: 'Comandante de Flota',
    description: 'Fabrica 100 naves de cualquier tipo.',
    type: 'side',
    difficulty: 'normal',
    status: 'available',
    levelRequired: 10,
    objectives: [
      { id: 'obj_build_ships', type: 'build_ship', description: 'Fabricar 100 naves', targetAmount: 100, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 30000 },
      experience: 3000,
      items: [{ itemId: 'speedup_4h', quantity: 5 }]
    },
    isRepeatable: true,
    cooldown: 172800, // 48 horas
    icon: '🚀'
  },
  {
    id: 'quest_side_defender',
    name: 'Defensor del Imperio',
    description: 'Construye 50 torres defensivas.',
    type: 'side',
    difficulty: 'hard',
    status: 'available',
    levelRequired: 15,
    objectives: [
      { id: 'obj_build_defenses', type: 'build', description: 'Construir 50 defensas', targetAmount: 50, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 50000 },
      experience: 5000,
      items: [{ itemId: 'chest_epic', quantity: 2 }]
    },
    isRepeatable: true,
    cooldown: 259200, // 72 horas
    icon: '🛡️'
  },
  {
    id: 'quest_side_researcher',
    name: 'Científico Galáctico',
    description: 'Completa 20 investigaciones.',
    type: 'side',
    difficulty: 'hard',
    status: 'available',
    levelRequired: 20,
    objectives: [
      { id: 'obj_complete_research', type: 'research', description: 'Completar 20 investigaciones', targetAmount: 20, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 75000 },
      experience: 8000,
      items: [{ itemId: 'gem_blue_4', quantity: 1 }]
    },
    isRepeatable: true,
    cooldown: 604800, // 7 días
    icon: '🔬'
  },
  {
    id: 'quest_side_pvp_master',
    name: 'Maestro del PvP',
    description: 'Gana 50 batallas en Arena o League.',
    type: 'side',
    difficulty: 'extreme',
    status: 'available',
    levelRequired: 25,
    objectives: [
      { id: 'obj_win_pvp', type: 'win_battle', description: 'Ganar 50 batallas PvP', targetAmount: 50, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 100000 },
      experience: 15000,
      honorPoints: 2500,
      items: [{ itemId: 'chest_legendary', quantity: 1 }]
    },
    isRepeatable: true,
    cooldown: 604800, // 7 días
    icon: '🏆'
  }
];

// ============================================
// CADENAS DE MISIONES
// ============================================
export const CHAIN_QUESTS: Quest[] = [
  {
    id: 'quest_chain_tutorial_01',
    name: 'Tutorial: Básico',
    description: 'Aprende los conceptos básicos del juego.',
    type: 'tutorial',
    difficulty: 'easy',
    status: 'available',
    levelRequired: 1,
    objectives: [
      { id: 'obj_tutorial_click', type: 'build', description: 'Hacer clic en un edificio', targetAmount: 1, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 500 },
      experience: 50
    },
    chainInfo: {
      chainId: 'tutorial_chain',
      step: 1,
      totalSteps: 5,
      nextQuestId: 'quest_chain_tutorial_02'
    },
    isRepeatable: false,
    icon: '📖'
  },
  {
    id: 'quest_chain_tutorial_02',
    name: 'Tutorial: Recursos',
    description: 'Aprende a recolectar recursos.',
    type: 'tutorial',
    difficulty: 'easy',
    status: 'locked',
    levelRequired: 1,
    prerequisites: { questIds: ['quest_chain_tutorial_01'] },
    objectives: [
      { id: 'obj_tutorial_collect', type: 'collect_resources', description: 'Recolectar 100 Metal', targetId: 'metal', targetAmount: 100, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 1000 },
      experience: 100
    },
    chainInfo: {
      chainId: 'tutorial_chain',
      step: 2,
      totalSteps: 5,
      previousQuestId: 'quest_chain_tutorial_01',
      nextQuestId: 'quest_chain_tutorial_03'
    },
    isRepeatable: false,
    icon: '📖'
  }
];

// ============================================
// MISIONES OCULTAS (SECRETAS)
// ============================================
export const HIDDEN_QUESTS: Quest[] = [
  {
    id: 'quest_hidden_easter_egg',
    name: 'El Easter Egg Galáctico',
    description: 'Has encontrado un secreto oculto.',
    type: 'hidden',
    difficulty: 'hard',
    status: 'locked',
    levelRequired: 1,
    objectives: [
      { id: 'obj_hidden_click', type: 'explore', description: 'Hacer clic 1000 veces en el logo del juego', targetAmount: 1000, currentAmount: 0, completed: false }
    ],
    rewards: {
      resources: { credits: 99999 },
      experience: 9999,
      title: 'Buscador de Secretos',
      emblem: '🥚'
    },
    isRepeatable: false,
    icon: '🥚',
    hint: 'Los secretos a veces están en los lugares más obvios...'
  }
];

// ============================================
// TODAS LAS MISIONES
// ============================================
export const ALL_QUESTS: Quest[] = [
  ...MAIN_STORY_QUESTS,
  ...SIDE_QUESTS,
  ...CHAIN_QUESTS,
  ...HIDDEN_QUESTS
];

// ============================================
// HELPERS
// ============================================
export function getQuestById(id: string): Quest | undefined {
  return ALL_QUESTS.find(q => q.id === id);
}

export function getQuestsByType(type: QuestType): Quest[] {
  return ALL_QUESTS.filter(q => q.type === type);
}

export function getQuestsByDifficulty(difficulty: QuestDifficulty): Quest[] {
  return ALL_QUESTS.filter(q => q.difficulty === difficulty);
}

export function getAvailableQuests(playerLevel: number, completedQuests: string[]): Quest[] {
  return ALL_QUESTS.filter(q => {
    // Verificar nivel
    if (q.levelRequired > playerLevel) return false;
    
    // Verificar si ya está completada
    if (completedQuests.includes(q.id)) return false;
    
    // Verificar prerequisitos
    if (q.prerequisites?.questIds) {
      const prereqsMet = q.prerequisites.questIds.every(id => completedQuests.includes(id));
      if (!prereqsMet) return false;
    }
    
    return true;
  });
}

export function calculateQuestProgress(quest: Quest): number {
  const totalObjectives = quest.objectives.length;
  const completedObjectives = quest.objectives.filter(o => o.completed).length;
  return (completedObjectives / totalObjectives) * 100;
}

export function isQuestCompletable(quest: Quest): boolean {
  return quest.objectives.every(o => o.completed);
}

export function getChainQuests(chainId: string): Quest[] {
  return ALL_QUESTS.filter(q => q.chainInfo?.chainId === chainId).sort(
    (a, b) => (a.chainInfo?.step || 0) - (b.chainInfo?.step || 0)
  );
}

// ============================================
// SISTEMA DE NOTIFICACIONES DE MISIONES
// ============================================
export interface QuestNotification {
  questId: string;
  type: 'available' | 'completed' | 'objective_updated' | 'expiring';
  message: string;
  timestamp: number;
  read: boolean;
}

export function generateQuestNotifications(
  quests: Quest[],
  completedQuests: string[]
): QuestNotification[] {
  const notifications: QuestNotification[] = [];
  
  for (const quest of quests) {
    // Notificación de quest completada
    if (quest.status === 'completed' && !quest.isRepeatable) {
      notifications.push({
        questId: quest.id,
        type: 'completed',
        message: `¡Misión completada: ${quest.name}!`,
        timestamp: Date.now(),
        read: false
      });
    }
    
    // Notificación de quest disponible
    if (quest.status === 'available') {
      notifications.push({
        questId: quest.id,
        type: 'available',
        message: `Nueva misión disponible: ${quest.name}`,
        timestamp: Date.now(),
        read: false
      });
    }
  }
  
  return notifications;
}

export const QuestSystem = {
  MAIN_STORY_QUESTS,
  SIDE_QUESTS,
  CHAIN_QUESTS,
  HIDDEN_QUESTS,
  ALL_QUESTS,
  getQuestById,
  getQuestsByType,
  getQuestsByDifficulty,
  getAvailableQuests,
  calculateQuestProgress,
  isQuestCompletable,
  getChainQuests,
  generateQuestNotifications
};
