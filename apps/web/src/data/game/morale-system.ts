/**
 * SISTEMA DE MORAL - GALAXY ONLINE II
 * Efecto en tropas, deserciones, fanatismo, líderes carismáticos
 */

// ============================================
// TIPOS DE MORAL
// ============================================
export type MoraleLevel = 
  | 'mutinous'    // Amotinado (-100 a -80)
  | 'rebellious'  // Rebelde (-80 a -60)
  | 'dissatisfied' // Insatisfecho (-60 a -40)
  | 'uneasy'      // Inquieto (-40 a -20)
  | 'neutral'     // Neutral (-20 a 20)
  | 'satisfied'   // Satisfecho (20 a 40)
  | 'motivated'   // Motivado (40 a 60)
  | 'enthusiastic' // Entusiasta (60 a 80)
  | 'fanatical';  // Fanático (80 a 100)

// ============================================
// SISTEMA DE MORAL DE TRIPULACIÓN/TROPAS
// ============================================
export interface TroopMorale {
  unitId: string;
  unitName: string;
  unitType: 'crew' | 'marines' | 'pilots' | 'technicians' | 'scientists';
  
  // Nivel de moral (-100 a 100)
  value: number;
  level: MoraleLevel;
  
  // Factores de moral
  factors: {
    pay: number;           // Pago (-20 a +20)
    conditions: number;    // Condiciones de vida (-20 a +20)
    leadership: number;   // Calidad de liderazgo (-30 a +30)
    danger: number;        // Exposición al peligro (-30 a +10)
    victory: number;       // Racha de victorias/derrotas (-40 a +40)
    supplies: number;      // Suministros (-20 a +20)
    homesickness: number;  // Nostalgia (-15 a +5)
    purpose: number;       // Sentido de propósito (-10 a +20)
  };
  
  // Efectos de baja moral
  penalties: {
    efficiencyLoss: number;     // 0-1
    desertionRisk: number;      // 0-1
    mutinyRisk: number;         // 0-1
    errorRate: number;          // 0-1
    combatPenalty: number;     // 0-1
    skillReduction: number;     // 0-1
  };
  
  // Efectos de alta moral
  bonuses: {
    efficiencyBonus: number;    // 0-1
    combatBonus: number;        // 0-1
    skillBonus: number;         // 0-1
    specialActions: string[];   // Acciones desbloqueadas
  };
  
  // Historial
  history: {
    peakMorale: number;
    lowestMorale: number;
    desertions: number;
    mutinies: number;
    heroics: number;
    trend: 'rising' | 'stable' | 'falling';
  };
}

// ============================================
// LÍDERES Y CARISMA
// ============================================
export interface CharismaticLeader {
  id: string;
  name: string;
  rank: string;
  
  // Atributos de liderazgo
  charisma: number;      // 0-100
  leadership: number;   // 0-100
  inspiration: number;  // 0-100
  discipline: number;   // 0-100
  empathy: number;     // 0-100
  intimidation: number; // 0-100 (líder por miedo)
  
  // Estilo de liderazgo
  style: 'inspirational' | 'authoritarian' | 'democratic' | 'strategic' | 'fear_based';
  
  // Habilidades especiales
  specialAbilities: {
    name: string;
    description: string;
    moraleEffect: number;
    combatEffect: string;
    cooldown: number;
  }[];
  
  // Efectos
  effects: {
    baseMoraleBonus: number;
    combatMoraleBonus: number;
    crisisMoraleBonus: number;
    fanaticismChance: number;
    loyaltyBonus: number;
  };
  
  // Historial
  history: {
    battlesLed: number;
    victories: number;
    defeats: number;
    troopsSaved: number;
    heroicActs: number;
    controversies: number;
  };
}

// ============================================
// EVENTOS DE MORAL
// ============================================
export interface MoraleEvent {
  id: string;
  name: string;
  description: string;
  
  // Tipo
  type: 'positive' | 'negative' | 'crisis' | 'victory' | 'defeat';
  
  // Efecto
  effect: {
    immediateChange: number; // Cambio instantáneo
    duration: number;      // Duración del efecto
    decayRate: number;     // Pérdida por hora
    permanent: boolean;
  };
  
  // Condiciones
  conditions: {
    minMorale?: number;
    maxMorale?: number;
    requiresLeader?: boolean;
    requiresVictory?: boolean;
    requiresDefeat?: boolean;
  };
  
  // Narrativa
  narrative: {
    announcement: string;
    aftermath: string;
    rumors: string[];
  };
}

// ============================================
// MECÁNICAS DE FANATISMO
// ============================================
export interface Fanaticism {
  // Estado fanático
  active: boolean;
  level: number; // 0-100
  
  // Causas
  causes: {
    ideological: boolean;
    religious: boolean;
    revenge: boolean;
    charismatic_leader: boolean;
    desperation: boolean;
    propaganda: boolean;
  };
  
  // Efectos
  effects: {
    fearless: boolean;
    noRetreat: boolean;
    fightToDeath: boolean;
    bonusDamage: number;
    damageResistance: number;
    noHealing: boolean;
    berserkerRage: boolean;
  };
  
  // Riesgos
  risks: {
    recklessBehavior: number; // 0-1
    friendlyFire: number;     // 0-1
    suicideAttacks: boolean;
    warCrimes: boolean;
  };
  
  // Duración
  duration: {
    permanent: boolean;
    expiresAt?: number;
    canBeCalmed: boolean;
    calmingDifficulty: number;
  };
}

// ============================================
// SISTEMA DE DESERCIÓN
// ============================================
export interface DesertionSystem {
  // Riesgo actual
  currentRisk: number; // 0-1
  
  // Factores
  factors: {
    moraleThreshold: number; // Por debajo de este, riesgo de deserción
    payDelay: number;        // Días sin pago
    dangerExposure: number;  // Tiempo en combate
    homeProximity: number;   // Qué tan cerca de casa
    enemyPropaganda: number; // 0-100
    alternativeOpportunities: number; // 0-100
  };
  
  // Prevención
  prevention: {
    loyaltyOaths: boolean;
    familyHostages: boolean; // Oscuro
    punishments: string[];
    incentives: string[];
    eliteStatus: boolean;
    psychologicalConditioning: boolean;
  };
  
  // Efectos de deserción
  effects: {
    unitStrengthLoss: number; // 0-1
    informationLeaked: boolean;
    equipmentStolen: boolean;
    moraleImpact: number;
    reputationDamage: number;
  };
}

// ============================================
// MECÁNICAS DE MORAL
// ============================================
export const MORALE_MECHANICS = {
  // Umbrales de moral
  thresholds: {
    mutinous: -100,
    rebellious: -80,
    dissatisfied: -60,
    uneasy: -40,
    neutral_low: -20,
    neutral_high: 20,
    satisfied: 40,
    motivated: 60,
    enthusiastic: 80,
    fanatical: 100
  },
  
  // Efectos por nivel
  effects: {
    mutinous: {
      efficiencyLoss: 0.8,
      desertionRisk: 0.5,
      mutinyRisk: 0.3,
      combatPenalty: 0.6,
      skillReduction: 0.5,
      special: ['sabotage', 'betrayal']
    },
    rebellious: {
      efficiencyLoss: 0.5,
      desertionRisk: 0.3,
      mutinyRisk: 0.1,
      combatPenalty: 0.4,
      skillReduction: 0.3,
      special: ['disobedience']
    },
    dissatisfied: {
      efficiencyLoss: 0.3,
      desertionRisk: 0.15,
      mutinyRisk: 0.02,
      combatPenalty: 0.2,
      skillReduction: 0.15,
      special: []
    },
    uneasy: {
      efficiencyLoss: 0.15,
      desertionRisk: 0.05,
      mutinyRisk: 0,
      combatPenalty: 0.1,
      skillReduction: 0.05,
      special: []
    },
    neutral: {
      efficiencyLoss: 0,
      desertionRisk: 0.01,
      mutinyRisk: 0,
      combatPenalty: 0,
      skillReduction: 0,
      special: []
    },
    satisfied: {
      efficiencyBonus: 0.1,
      combatBonus: 0.05,
      skillBonus: 0.05,
      special: []
    },
    motivated: {
      efficiencyBonus: 0.2,
      combatBonus: 0.15,
      skillBonus: 0.1,
      special: ['initiative']
    },
    enthusiastic: {
      efficiencyBonus: 0.3,
      combatBonus: 0.25,
      skillBonus: 0.2,
      special: ['initiative', 'heroics']
    },
    fanatical: {
      efficiencyBonus: 0.4,
      combatBonus: 0.4,
      skillBonus: 0.3,
      special: ['initiative', 'heroics', 'no_retreat', 'fight_to_death']
    }
  },
  
  // Eventos que afectan moral
  events: {
    victory: { immediate: 20, decay: 1, duration: 86400 },
    defeat: { immediate: -30, decay: 2, duration: 172800 },
    pay_raise: { immediate: 15, decay: 0.5, duration: 604800 },
    pay_cut: { immediate: -25, decay: 1, duration: 2592000 },
    leader_killed: { immediate: -40, decay: 3, duration: 345600 },
    comrade_rescued: { immediate: 10, decay: 2, duration: 43200 },
    supplies_shortage: { immediate: -20, decay: 1, duration: 86400 },
    shore_leave: { immediate: 25, decay: 3, duration: 259200 },
    homesick_news: { immediate: -10, decay: 0.5, duration: 86400 }
  },
  
  // Deserción
  desertion: {
    baseChance: 0.01,
    moraleMultiplier: 0.005,
    payDelayMultiplier: 0.02,
    dangerMultiplier: 0.001,
    preventionEffectiveness: 0.5
  }
};

// ============================================
// LÍDERES CARISMÁTICOS PREDEFINIDOS
// ============================================
export const CHARISMATIC_LEADERS: CharismaticLeader[] = [
  {
    id: 'leader_khan',
    name: 'Khan el Inquebrantable',
    rank: 'Almirante',
    charisma: 95,
    leadership: 90,
    inspiration: 85,
    discipline: 95,
    empathy: 40,
    intimidation: 90,
    style: 'authoritarian',
    specialAbilities: [
      { name: 'Grito de Guerra', description: 'Aumenta moral 30% temporalmente', moraleEffect: 30, combatEffect: 'damage_bonus_20', cooldown: 86400 },
      { name: 'Presencia Inquebrantable', description: 'Nadie puede retirarse', moraleEffect: 10, combatEffect: 'no_retreat', cooldown: 0 }
    ],
    effects: {
      baseMoraleBonus: 15,
      combatMoraleBonus: 25,
      crisisMoraleBonus: 35,
      fanaticismChance: 0.2,
      loyaltyBonus: 30
    },
    history: {
      battlesLed: 150,
      victories: 140,
      defeats: 10,
      troopsSaved: 5000,
      heroicActs: 20,
      controversies: 5
    }
  },
  {
    id: 'leader_elena',
    name: 'Elena Voss',
    rank: 'Capitán',
    charisma: 85,
    leadership: 80,
    inspiration: 95,
    discipline: 60,
    empathy: 95,
    intimidation: 20,
    style: 'inspirational',
    specialAbilities: [
      { name: 'Palabras de Esperanza', description: 'Recupera moral en crisis', moraleEffect: 40, combatEffect: 'heal_morale', cooldown: 43200 },
      { name: 'Liderazgo por Ejemplo', description: 'Bonus cuando ella está en peligro', moraleEffect: 20, combatEffect: 'rally', cooldown: 86400 }
    ],
    effects: {
      baseMoraleBonus: 20,
      combatMoraleBonus: 15,
      crisisMoraleBonus: 30,
      fanaticismChance: 0.05,
      loyaltyBonus: 40
    },
    history: {
      battlesLed: 80,
      victories: 65,
      defeats: 15,
      troopsSaved: 3000,
      heroicActs: 35,
      controversies: 0
    }
  },
  {
    id: 'leader_terror',
    name: 'El Terror',
    rank: 'Comandante',
    charisma: 40,
    leadership: 70,
    inspiration: 10,
    discipline: 100,
    empathy: 5,
    intimidation: 100,
    style: 'fear_based',
    specialAbilities: [
      { name: 'Miedo Paralizante', description: 'Enemigos tienen -20% moral', moraleEffect: -10, combatEffect: 'enemy_morale_penalty', cooldown: 0 },
      { name: 'Ejemplo Ejemplar', description: 'Ejecuta desertor, moral sube temporalmente', moraleEffect: 25, combatEffect: 'prevent_desertion', cooldown: 172800 }
    ],
    effects: {
      baseMoraleBonus: 5,
      combatMoraleBonus: 20,
      crisisMoraleBonus: 15,
      fanaticismChance: 0.1,
      loyaltyBonus: 10
    },
    history: {
      battlesLed: 200,
      victories: 180,
      defeats: 20,
      troopsSaved: 0,
      heroicActs: 0,
      controversies: 50
    }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateMoraleLevel(value: number): MoraleLevel {
  if (value <= -80) return 'mutinous';
  if (value <= -60) return 'rebellious';
  if (value <= -40) return 'dissatisfied';
  if (value <= -20) return 'uneasy';
  if (value <= 20) return 'neutral';
  if (value <= 40) return 'satisfied';
  if (value <= 60) return 'motivated';
  if (value <= 80) return 'enthusiastic';
  return 'fanatical';
}

export function getMoraleEffects(level: MoraleLevel): any {
  return MORALE_MECHANICS.effects[level] || MORALE_MECHANICS.effects.neutral;
}

export function calculateMoraleChange(
  currentMorale: number,
  factors: TroopMorale['factors'],
  leader?: CharismaticLeader,
  recentEvent?: string
): { newMorale: number; change: number } {
  let change = 0;
  
  // Aplicar factores
  change += factors.pay * 0.5;
  change += factors.conditions * 0.3;
  change += factors.leadership * 0.8;
  change += factors.danger * 0.4;
  change += factors.victory * 0.6;
  change += factors.supplies * 0.4;
  change += factors.homesickness * 0.2;
  change += factors.purpose * 0.5;
  
  // Líder
  if (leader) {
    change += leader.effects.baseMoraleBonus * 0.3;
  }
  
  // Evento reciente
  if (recentEvent && MORALE_MECHANICS.events[recentEvent as keyof typeof MORALE_MECHANICS.events]) {
    const event = MORALE_MECHANICS.events[recentEvent as keyof typeof MORALE_MECHANICS.events];
    change += event.immediate;
  }
  
  // Limitar cambio
  change = Math.max(-20, Math.min(20, change));
  
  // Aplicar
  const newMorale = Math.max(-100, Math.min(100, currentMorale + change));
  
  return { newMorale, change };
}

export function calculateDesertionRisk(
  morale: number,
  factors: DesertionSystem['factors'],
  prevention: DesertionSystem['prevention']
): number {
  let baseRisk = MORALE_MECHANICS.desertion.baseChance;
  
  if (morale < factors.moraleThreshold) {
    baseRisk += (factors.moraleThreshold - morale) * MORALE_MECHANICS.desertion.moraleMultiplier;
  }
  
  baseRisk += factors.payDelay * MORALE_MECHANICS.desertion.payDelayMultiplier;
  baseRisk += factors.dangerExposure * MORALE_MECHANICS.desertion.dangerMultiplier;
  
  // Reducir por prevención
  if (prevention.loyaltyOaths) baseRisk *= 0.8;
  if (prevention.familyHostages) baseRisk *= 0.5; // Oscuro pero efectivo
  if (prevention.eliteStatus) baseRisk *= 0.7;
  if (prevention.psychologicalConditioning) baseRisk *= 0.6;
  
  return Math.min(0.5, baseRisk); // Máximo 50% riesgo
}

export function getLeaderByStyle(style: CharismaticLeader['style']): CharismaticLeader[] {
  return CHARISMATIC_LEADERS.filter(l => l.style === style);
}

export const MoraleSystem = {
  MORALE_MECHANICS,
  CHARISMATIC_LEADERS,
  calculateMoraleLevel,
  getMoraleEffects,
  calculateMoraleChange,
  calculateDesertionRisk,
  getLeaderByStyle
};
