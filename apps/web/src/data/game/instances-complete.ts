/**
 * DATOS COMPLETOS DE INSTANCIAS Y RECOMPENSAS - GALAXY ONLINE II
 * PvE, misiones, premios y sistema de loot
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

export type InstanceType = 'normal' | 'restricted' | 'scenario' | 'constellation' | 'humaroid';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type RewardType = 'resource' | 'item' | 'blueprint' | 'experience' | 'credits' | 'commander';

export interface Reward {
  type: RewardType;
  resourceKey?: ResourceKey;
  itemId?: string;
  amount: number;
  chance: number; // 0-100%
}

export interface InstanceStage {
  stage: number;
  name: string;
  enemyFleets: number;
  enemyPower: number;
  rewards: Reward[];
  unlockRequirement?: {
    previousStage?: number;
    playerLevel?: number;
  };
}

export interface GameInstance {
  id: string;
  name: string;
  description: string;
  type: InstanceType;
  difficulty: Difficulty;
  maxStages: number;
  stages: InstanceStage[];
  dailyAttempts: number;
  unlockRequirement?: {
    playerLevel?: number;
    previousInstance?: string;
    researchId?: string;
  };
  icon: string;
}

// ============================================
// INSTANCIAS NORMALES
// ============================================
export const normalInstances: GameInstance[] = [
  {
    id: 'instance_01',
    name: 'Sistema Alpha',
    description: 'Sistema estelar básico con defensas mínimas. Ideal para nuevos comandantes.',
    type: 'normal',
    difficulty: 'easy',
    maxStages: 5,
    dailyAttempts: 10,
    icon: '⭐',
    stages: [
      {
        stage: 1,
        name: 'Periferia del Sistema',
        enemyFleets: 1,
        enemyPower: 100,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 500, chance: 100 },
          { type: 'experience', amount: 50, chance: 100 }
        ]
      },
      {
        stage: 2,
        name: 'Cinturón de Asteroides',
        enemyFleets: 2,
        enemyPower: 200,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 800, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 300, chance: 80 },
          { type: 'experience', amount: 100, chance: 100 }
        ]
      },
      {
        stage: 3,
        name: 'Base Pirata',
        enemyFleets: 3,
        enemyPower: 350,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 1200, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 500, chance: 100 },
          { type: 'credits', amount: 500, chance: 90 },
          { type: 'experience', amount: 150, chance: 100 }
        ]
      },
      {
        stage: 4,
        name: 'Defensas Orbitales',
        enemyFleets: 4,
        enemyPower: 500,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 2000, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 800, chance: 100 },
          { type: 'credits', amount: 1000, chance: 100 },
          { type: 'item', itemId: 'repair_kit', amount: 1, chance: 30 },
          { type: 'experience', amount: 250, chance: 100 }
        ]
      },
      {
        stage: 5,
        name: 'Comandante Pirata',
        enemyFleets: 5,
        enemyPower: 800,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 5000, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 2000, chance: 100 },
          { type: 'credits', amount: 3000, chance: 100 },
          { type: 'blueprint', itemId: 'frigate_bp', amount: 1, chance: 40 },
          { type: 'experience', amount: 500, chance: 100 }
        ]
      }
    ]
  },
  {
    id: 'instance_02',
    name: 'Nebulosa de Orion',
    description: 'Sector nebuloso con visibilidad reducida. Enemigos ocultos en la niebla cósmica.',
    type: 'normal',
    difficulty: 'medium',
    maxStages: 8,
    dailyAttempts: 8,
    unlockRequirement: { playerLevel: 5, previousInstance: 'instance_01' },
    icon: '🌫️',
    stages: [
      {
        stage: 1,
        name: 'Nebulosa Exterior',
        enemyFleets: 2,
        enemyPower: 400,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 1500, chance: 100 },
          { type: 'experience', amount: 150, chance: 100 }
        ]
      },
      {
        stage: 4,
        name: 'Tormenta de Radiación',
        enemyFleets: 4,
        enemyPower: 1000,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 4000, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 2000, chance: 100 },
          { type: 'credits', amount: 2000, chance: 100 },
          { type: 'experience', amount: 400, chance: 100 }
        ]
      },
      {
        stage: 8,
        name: 'Núcleo de la Nebulosa',
        enemyFleets: 8,
        enemyPower: 2500,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 15000, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 8000, chance: 100 },
          { type: 'credits', amount: 10000, chance: 100 },
          { type: 'blueprint', itemId: 'cruiser_bp', amount: 1, chance: 35 },
          { type: 'item', itemId: 'shield_booster', amount: 1, chance: 25 },
          { type: 'experience', amount: 1500, chance: 100 }
        ]
      }
    ]
  },
  {
    id: 'instance_03',
    name: 'Sector Muerte',
    description: 'Zona de guerra activa con flotas enemigas patrullando. Alto riesgo, alta recompensa.',
    type: 'normal',
    difficulty: 'hard',
    maxStages: 10,
    dailyAttempts: 5,
    unlockRequirement: { playerLevel: 15, previousInstance: 'instance_02' },
    icon: '☠️',
    stages: [
      {
        stage: 10,
        name: 'Fortaleza Enemiga',
        enemyFleets: 12,
        enemyPower: 8000,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 50000, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 25000, chance: 100 },
          { type: 'credits', amount: 50000, chance: 100 },
          { type: 'blueprint', itemId: 'battleship_bp', amount: 1, chance: 30 },
          { type: 'commander', amount: 1, chance: 10 },
          { type: 'experience', amount: 5000, chance: 100 }
        ]
      }
    ]
  }
];

// ============================================
// INSTANCIAS RESTRINGIDAS
// ============================================
export const restrictedInstances: GameInstance[] = [
  {
    id: 'restricted_01',
    name: 'Laberinto Temporal',
    description: 'Instancia de alta dificultad que requiere llave temporal para acceder. Recompensas legendarias.',
    type: 'restricted',
    difficulty: 'extreme',
    maxStages: 15,
    dailyAttempts: 1,
    unlockRequirement: { playerLevel: 25, researchId: 'missile' },
    icon: '⏳',
    stages: [
      {
        stage: 15,
        name: 'Corazón del Tiempo',
        enemyFleets: 20,
        enemyPower: 50000,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 200000, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 100000, chance: 100 },
          { type: 'credits', amount: 250000, chance: 100 },
          { type: 'blueprint', itemId: 'flagship_bp', amount: 1, chance: 15 },
          { type: 'commander', amount: 1, chance: 25 },
          { type: 'experience', amount: 20000, chance: 100 }
        ]
      }
    ]
  }
];

// ============================================
// INSTANCIAS CONSTELACIÓN (Cooperativas)
// ============================================
export const constellationInstances: GameInstance[] = [
  {
    id: 'constellation_01',
    name: 'Constelación de Pegaso',
    description: 'Misión cooperativa masiva. Requiere alianza completa para completar.',
    type: 'constellation',
    difficulty: 'extreme',
    maxStages: 25,
    dailyAttempts: 1,
    unlockRequirement: { playerLevel: 30 },
    icon: '🌟',
    stages: [
      {
        stage: 25,
        name: 'Pacto Estelar',
        enemyFleets: 50,
        enemyPower: 200000,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 1000000, chance: 100 },
          { type: 'credits', amount: 2000000, chance: 100 },
          { type: 'blueprint', itemId: 'dreadnought_bp', amount: 1, chance: 5 },
          { type: 'commander', amount: 3, chance: 50 },
          { type: 'experience', amount: 100000, chance: 100 }
        ]
      }
    ]
  }
];

// ============================================
// HUMAROIDES (NPCs Especiales)
// ============================================
export const humaroidInstances: GameInstance[] = [
  {
    id: 'humaroid_01',
    name: 'Enclave Humaroid',
    description: 'Sector controlado por la misteriosa raza Humaroid. Sus naves tienen tecnología única.',
    type: 'humaroid',
    difficulty: 'hard',
    maxStages: 6,
    dailyAttempts: 3,
    unlockRequirement: { playerLevel: 20 },
    icon: '👽',
    stages: [
      {
        stage: 6,
        name: 'Colmena Humaroid',
        enemyFleets: 10,
        enemyPower: 15000,
        rewards: [
          { type: 'resource', resourceKey: 'metal', amount: 80000, chance: 100 },
          { type: 'resource', resourceKey: 'plasma', amount: 40000, chance: 100 },
          { type: 'blueprint', itemId: 'humaroid_hull_bp', amount: 1, chance: 20 },
          { type: 'experience', amount: 8000, chance: 100 }
        ]
      }
    ]
  }
];

// ============================================
// TODAS LAS INSTANCIAS
// ============================================
export const ALL_INSTANCES: GameInstance[] = [
  ...normalInstances,
  ...restrictedInstances,
  ...constellationInstances,
  ...humaroidInstances
];

// ============================================
// SISTEMA DE PREMIOS Y RECOMPENSAS
// ============================================
export interface DailyReward {
  day: number;
  rewards: Reward[];
  special?: boolean;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, rewards: [{ type: 'resource', resourceKey: 'metal', amount: 1000, chance: 100 }] },
  { day: 2, rewards: [{ type: 'resource', resourceKey: 'plasma', amount: 500, chance: 100 }] },
  { day: 3, rewards: [{ type: 'credits', amount: 1000, chance: 100 }] },
  { day: 4, rewards: [{ type: 'resource', resourceKey: 'metal', amount: 2000, chance: 100 }, { type: 'resource', resourceKey: 'plasma', amount: 1000, chance: 100 }] },
  { day: 5, rewards: [{ type: 'item', itemId: 'speedup_1h', amount: 1, chance: 100 }] },
  { day: 6, rewards: [{ type: 'resource', resourceKey: 'metal', amount: 3000, chance: 100 }, { type: 'resource', resourceKey: 'plasma', amount: 1500, chance: 100 }, { type: 'credits', amount: 2000, chance: 100 }] },
  { day: 7, rewards: [{ type: 'blueprint', itemId: 'random_bp', amount: 1, chance: 50 }, { type: 'credits', amount: 5000, chance: 100 }], special: true }
];

// ============================================
// LOGROS Y RECOMPENSAS
// ============================================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: {
    type: 'build' | 'research' | 'combat' | 'collect';
    target: string;
    amount: number;
  };
  rewards: Reward[];
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'Primeros Pasos',
    description: 'Construye tu primer edificio.',
    requirement: { type: 'build', target: 'any', amount: 1 },
    rewards: [{ type: 'credits', amount: 500, chance: 100 }]
  },
  {
    id: 'industrial_revolution',
    name: 'Revolución Industrial',
    description: 'Alcanza nivel 10 en tu Extractor de Metal.',
    requirement: { type: 'build', target: 'metal_extractor', amount: 10 },
    rewards: [{ type: 'resource', resourceKey: 'metal', amount: 10000, chance: 100 }, { type: 'credits', amount: 5000, chance: 100 }]
  },
  {
    id: 'warrior_born',
    name: 'Guerrero Naciente',
    description: 'Construye tu primera nave.',
    requirement: { type: 'build', target: 'ship', amount: 1 },
    rewards: [{ type: 'resource', resourceKey: 'metal', amount: 5000, chance: 100 }, { type: 'item', itemId: 'weapon_module_t1', amount: 1, chance: 100 }]
  },
  {
    id: 'conqueror',
    name: 'Conquistador',
    description: 'Completa 10 instancias.',
    requirement: { type: 'combat', target: 'instances', amount: 10 },
    rewards: [{ type: 'credits', amount: 20000, chance: 100 }, { type: 'blueprint', itemId: 'cruiser_bp', amount: 1, chance: 50 }]
  },
  {
    id: 'scientist',
    name: 'Científico Galáctico',
    description: 'Completa 20 investigaciones.',
    requirement: { type: 'research', target: 'any', amount: 20 },
    rewards: [{ type: 'credits', amount: 30000, chance: 100 }, { type: 'resource', resourceKey: 'plasma', amount: 20000, chance: 100 }]
  }
];

// ============================================
// SISTEMA DE MISIONES DIARIAS
// ============================================
export interface DailyMission {
  id: string;
  name: string;
  description: string;
  objective: {
    type: 'build' | 'collect' | 'combat' | 'research';
    target: string;
    amount: number;
  };
  rewards: Reward[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'daily_collect',
    name: 'Recolector',
    description: 'Recolecta 5,000 de metal.',
    objective: { type: 'collect', target: 'metal', amount: 5000 },
    rewards: [{ type: 'credits', amount: 1000, chance: 100 }, { type: 'experience', amount: 200, chance: 100 }],
    difficulty: 'easy'
  },
  {
    id: 'daily_build',
    name: 'Constructor',
    description: 'Mejora 2 edificios.',
    objective: { type: 'build', target: 'any', amount: 2 },
    rewards: [{ type: 'resource', resourceKey: 'plasma', amount: 1000, chance: 100 }, { type: 'experience', amount: 300, chance: 100 }],
    difficulty: 'medium'
  },
  {
    id: 'daily_combat',
    name: 'Combatiente',
    description: 'Completa 3 instancias.',
    objective: { type: 'combat', target: 'instances', amount: 3 },
    rewards: [{ type: 'credits', amount: 3000, chance: 100 }, { type: 'item', itemId: 'repair_kit', amount: 2, chance: 100 }],
    difficulty: 'medium'
  },
  {
    id: 'daily_research',
    name: 'Investigador',
    description: 'Completa 1 investigación.',
    objective: { type: 'research', target: 'any', amount: 1 },
    rewards: [{ type: 'credits', amount: 5000, chance: 100 }, { type: 'resource', resourceKey: 'metal', amount: 3000, chance: 100 }],
    difficulty: 'hard'
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getInstanceById(id: string): GameInstance | undefined {
  return ALL_INSTANCES.find(i => i.id === id);
}

export function getInstancesByType(type: InstanceType): GameInstance[] {
  return ALL_INSTANCES.filter(i => i.type === type);
}

export function getInstancesByDifficulty(difficulty: Difficulty): GameInstance[] {
  return ALL_INSTANCES.filter(i => i.difficulty === difficulty);
}

export function calculateTotalRewards(instanceId: string): Record<ResourceKey, number> & { credits: number; experience: number } {
  const instance = getInstanceById(instanceId);
  const totals = { metal: 0, plasma: 0, credits: 0, energy: 0, experience: 0 };
  
  if (!instance) return totals;
  
  for (const stage of instance.stages) {
    for (const reward of stage.rewards) {
      if (reward.type === 'resource' && reward.resourceKey) {
        totals[reward.resourceKey] += reward.amount;
      } else if (reward.type === 'credits') {
        totals.credits += reward.amount;
      } else if (reward.type === 'experience') {
        totals.experience += reward.amount;
      }
    }
  }
  
  return totals;
}

export function canAccessInstance(
  instanceId: string,
  playerLevel: number,
  completedInstances: string[],
  completedResearch: Map<string, number>
): { canAccess: boolean; reason?: string } {
  const instance = getInstanceById(instanceId);
  if (!instance) return { canAccess: false, reason: 'Instancia no encontrada' };
  
  if (instance.unlockRequirement) {
    if (instance.unlockRequirement.playerLevel && playerLevel < instance.unlockRequirement.playerLevel) {
      return { canAccess: false, reason: `Requiere nivel ${instance.unlockRequirement.playerLevel}` };
    }
    
    if (instance.unlockRequirement.previousInstance && !completedInstances.includes(instance.unlockRequirement.previousInstance)) {
      return { canAccess: false, reason: 'Completa la instancia anterior primero' };
    }
    
    if (instance.unlockRequirement.researchId) {
      const researchLevel = completedResearch.get(instance.unlockRequirement.researchId) || 0;
      if (researchLevel === 0) {
        return { canAccess: false, reason: 'Investigación requerida no completada' };
      }
    }
  }
  
  return { canAccess: true };
}
