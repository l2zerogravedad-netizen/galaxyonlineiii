/**
 * SISTEMA DE GUERRAS - GALAXY ONLINE II
 * Guerras entre corporaciones, alianzas, sistemas de batalla y tratados
 */

// ============================================
// TIPOS DE GUERRA
// ============================================
export type WarType = 
  | 'corp_vs_corp'      // Corp vs Corp directo
  | 'corp_vs_alliance'  // Corp vs Alianza
  | 'alliance_vs_alliance' // Guerra de alianzas
  | 'territorial'       // Por control de territorio
  | 'resource'          // Por recursos específicos
  | 'revenge'           // Venganza
  | 'annihilation';     // Guerra total

export type WarStatus = 
  | 'declared'          // Declarada, esperando inicio
  | 'active'            // En curso
  | 'ceasefire'         // Alto el fuego negociado
  | 'ended_victory'     // Victoria
  | 'ended_defeat'      // Derrota
  | 'ended_draw'        // Empate
  | 'ended_peace';      // Paz negociada

export type WarPhase = 
  | 'preparation'       // Preparación
  | 'skirmish'          // Escaramuzas
  | 'major_battle'      // Batalla principal
  | 'siege'             // Asedio
  | 'final_assault';    // Asalto final

// ============================================
// ESTRUCTURA DE GUERRA
// ============================================
export interface WarParticipant {
  id: string;
  name: string;
  type: 'corp' | 'alliance';
  leaderId: string;
  members: {
    corpId: string;
    corpName: string;
    members: number;
    fleetPower: number;
    status: 'active' | 'defeated' | 'surrendered';
  }[];
  
  stats: {
    battlesWon: number;
    battlesLost: number;
    shipsDestroyed: number;
    shipsLost: number;
    structuresDestroyed: number;
    structuresLost: number;
    resourcesLooted: number;
    territoryCaptured: number;
  };
  
  warScore: number;
  warExhaustion: number; // 0-100, a 100 fuerza a rendición
  publicSupport: number; // 0-100
}

export interface WarObjective {
  id: string;
  type: 'destroy_fleet' | 'capture_planet' | 'destroy_structure' | 'hold_territory' | 'resource_goal';
  description: string;
  targetId?: string;
  targetAmount: number;
  currentAmount: number;
  points: number;
  completed: boolean;
  completedBy?: string;
  timeLimit?: number;
}

export interface WarBattle {
  id: string;
  name: string;
  type: 'skirmish' | 'field_battle' | 'siege' | 'naval_battle' | 'invasion';
  
  location: {
    systemId: string;
    systemName: string;
    coordinates: { x: number; y: number };
  };
  
  attacker: {
    participantId: string;
    forces: {
      ships: number;
      fleets: number;
      commanders: string[];
    };
  };
  
  defender: {
    participantId: string;
    forces: {
      ships: number;
      fleets: number;
      commanders: string[];
      structures?: number;
    };
  };
  
  startTime: number;
  endTime?: number;
  duration: number;
  
  result?: 'attacker_victory' | 'defender_victory' | 'draw' | 'ongoing';
  
  casualties: {
    attacker: { ships: number; commanders?: string[] };
    defender: { ships: number; commanders?: string[] };
  };
  
  impact: {
    warScoreChange: number;
    territoryChange?: string;
    resourcesLooted?: number;
  };
}

export interface War {
  id: string;
  name: string;
  type: WarType;
  status: WarStatus;
  phase: WarPhase;
  
  // Participantes
  attacker: WarParticipant;
  defender: WarParticipant;
  
  // Declaración
  declaredAt: number;
  declaredBy: string;
  declarationReason: string;
  
  // Configuración
  settings: {
    maxDuration: number; // días
    allowAlliances: boolean;
    allowMercenaries: boolean;
    allowSurrender: boolean;
    warGoals: string[];
    terms?: {
      victory: string[];
      defeat: string[];
    };
  };
  
  // Objetivos
  objectives: WarObjective[];
  
  // Batallas
  battles: WarBattle[];
  
  // Estado
  startTime: number;
  endTime?: number;
  currentPhaseStart: number;
  
  // Puntuación
  scoreToWin: number;
  currentScore: {
    attacker: number;
    defender: number;
  };
  
  // Negociación
  peaceOffers?: {
    from: string;
    to: string;
    terms: {
      surrender?: boolean;
      territory?: string[];
      resources?: Record<string, number>;
      reparations?: number;
    };
    timestamp: number;
    status: 'pending' | 'accepted' | 'rejected';
  }[];
  
  // Historial
  events: {
    timestamp: number;
    type: 'battle' | 'objective' | 'surrender' | 'alliance' | 'peace_offer' | 'phase_change';
    description: string;
    impact: number;
  }[];
  
  // Recompensas
  rewards: {
    victory: {
      credits: number;
      honor: number;
      territory: string[];
      resources: Record<string, number>;
    };
    defeat: {
      credits: number;
      honor: number;
      reparations: number;
    };
  };
}

// ============================================
// COSTOS DE DECLARACIÓN DE GUERRA
// ============================================
export interface WarDeclarationCost {
  influence: number;
  credits: number;
  minimumFleetPower: number;
  preparationTime: number; // horas
}

export const WAR_DECLARATION_COSTS: Record<WarType, WarDeclarationCost> = {
  corp_vs_corp: {
    influence: 1000,
    credits: 100000,
    minimumFleetPower: 100000,
    preparationTime: 24
  },
  corp_vs_alliance: {
    influence: 5000,
    credits: 500000,
    minimumFleetPower: 500000,
    preparationTime: 48
  },
  alliance_vs_alliance: {
    influence: 10000,
    credits: 1000000,
    minimumFleetPower: 1000000,
    preparationTime: 72
  },
  territorial: {
    influence: 2000,
    credits: 200000,
    minimumFleetPower: 200000,
    preparationTime: 24
  },
  resource: {
    influence: 1500,
    credits: 150000,
    minimumFleetPower: 150000,
    preparationTime: 12
  },
  revenge: {
    influence: 500,
    credits: 50000,
    minimumFleetPower: 50000,
    preparationTime: 6
  },
  annihilation: {
    influence: 5000,
    credits: 1000000,
    minimumFleetPower: 2000000,
    preparationTime: 168 // 7 días
  }
};

// ============================================
// FASES DE GUERRA
// ============================================
export interface WarPhaseConfig {
  phase: WarPhase;
  name: string;
  description: string;
  duration: number; // horas, 0 = indefinido
  objectivesRequired: number;
  maxBattles: number;
  modifiers: {
    attackerStrength: number;
    defenderStrength: number;
    warExhaustionRate: number;
  };
  actions: {
    allowed: string[];
    restricted: string[];
  };
}

export const WAR_PHASES: WarPhaseConfig[] = [
  {
    phase: 'preparation',
    name: 'Preparación',
    description: 'Ambas partes se preparan para el conflicto.',
    duration: 24,
    objectivesRequired: 0,
    maxBattles: 0,
    modifiers: {
      attackerStrength: 1.0,
      defenderStrength: 1.1, // Bonus defensa
      warExhaustionRate: 0
    },
    actions: {
      allowed: ['mobilize', 'fortify', 'scout'],
      restricted: ['attack', 'siege', 'invade']
    }
  },
  {
    phase: 'skirmish',
    name: 'Escaramuzas',
    description: 'Combates menores y reconocimiento.',
    duration: 0, // Hasta objetivo
    objectivesRequired: 3,
    maxBattles: 5,
    modifiers: {
      attackerStrength: 1.0,
      defenderStrength: 1.0,
      warExhaustionRate: 0.5
    },
    actions: {
      allowed: ['skirmish', 'raid', 'scout', 'harass'],
      restricted: ['siege', 'major_battle']
    }
  },
  {
    phase: 'major_battle',
    name: 'Batalla Mayor',
    description: 'Choque decisivo de fuerzas principales.',
    duration: 48,
    objectivesRequired: 1,
    maxBattles: 3,
    modifiers: {
      attackerStrength: 1.1,
      defenderStrength: 0.9,
      warExhaustionRate: 2.0
    },
    actions: {
      allowed: ['field_battle', 'naval_battle', 'skirmish'],
      restricted: ['siege']
    }
  },
  {
    phase: 'siege',
    name: 'Asedio',
    description: 'Bloqueo y asedio de posiciones fortificadas.',
    duration: 168, // 7 días
    objectivesRequired: 2,
    maxBattles: 10,
    modifiers: {
      attackerStrength: 0.9,
      defenderStrength: 1.2, // Bonus defensa fuerte
      warExhaustionRate: 1.5
    },
    actions: {
      allowed: ['siege', 'blockade', 'bombard', 'skirmish'],
      restricted: ['field_battle']
    }
  },
  {
    phase: 'final_assault',
    name: 'Asalto Final',
    description: 'Último empuje decisivo.',
    duration: 24,
    objectivesRequired: 1,
    maxBattles: 1,
    modifiers: {
      attackerStrength: 1.2, // Bonus desesperación
      defenderStrength: 1.0,
      warExhaustionRate: 5.0 // Agotamiento masivo
    },
    actions: {
      allowed: ['assault', 'invasion', 'siege'],
      restricted: ['skirmish', 'raid']
    }
  }
];

// ============================================
// SISTEMA DE AGOTAMIENTO DE GUERRA
// ============================================
export interface WarExhaustionFactors {
  battlesLost: number;       // +5 por batalla perdida
  shipsLost: number;         // +0.1 por nave perdida
  structuresLost: number;    // +2 por estructura
  resourcesSpent: number;    // +1 por 100k créditos
  duration: number;          // +1 por día
  civilianCasualties: number; // +10 por incidente
}

export const WAR_EXHAUSTION_CALCULATION = {
  baseRate: 0.5, // Por día
  battleLost: 5,
  battleWon: -2,
  shipLost: 0.1,
  structureLost: 2,
  resourceSpent: 0.01, // Por 1000 créditos
  dayPassed: 1,
  
  // Penalizaciones
  noBattles3Days: 10, // Si no hay batallas en 3 días
  homelandInvaded: 15,
  leaderDefeated: 20,
  
  // Recuperación
  victory: -10,
  objectiveCompleted: -5,
  peaceOfferAccepted: -15
};

// ============================================
// TIPOS DE BATALLA EN GUERRA
// ============================================
export interface BattleType {
  id: string;
  name: string;
  description: string;
  minForces: number;
  maxForces: number;
  duration: number; // minutos
  victoryConditions: string[];
  terrainEffects: boolean;
  weatherEffects: boolean;
  
  scoring: {
    victory: number;
    defeat: number;
    draw: number;
  };
}

export const BATTLE_TYPES: Record<string, BattleType> = {
  skirmish: {
    id: 'battle_skirmish',
    name: 'Escaramuza',
    description: 'Combate menor entre fuerzas de reconocimiento.',
    minForces: 10,
    maxForces: 100,
    duration: 5,
    victoryConditions: ['destroy_50_percent', 'rout_enemy'],
    terrainEffects: true,
    weatherEffects: false,
    scoring: { victory: 5, defeat: -3, draw: 0 }
  },
  
  field_battle: {
    id: 'battle_field',
    name: 'Batalla de Campo',
    description: 'Combate decisivo en campo abierto.',
    minForces: 500,
    maxForces: 10000,
    duration: 15,
    victoryConditions: ['destroy_enemy', 'capture_commander', 'hold_field'],
    terrainEffects: true,
    weatherEffects: true,
    scoring: { victory: 25, defeat: -15, draw: 5 }
  },
  
  naval_battle: {
    id: 'battle_naval',
    name: 'Batalla Naval',
    description: 'Combate en el espacio profundo.',
    minForces: 1000,
    maxForces: 50000,
    duration: 20,
    victoryConditions: ['destroy_fleet', 'capture_sector'],
    terrainEffects: false,
    weatherEffects: true, // Nebulosas, asteroides
    scoring: { victory: 30, defeat: -20, draw: 5 }
  },
  
  siege: {
    id: 'battle_siege',
    name: 'Asedio',
    description: 'Asedio a estructuras fortificadas.',
    minForces: 2000,
    maxForces: 100000,
    duration: 60,
    victoryConditions: ['destroy_structures', 'breach_defenses', 'starve_defenders'],
    terrainEffects: true,
    weatherEffects: false,
    scoring: { victory: 50, defeat: -30, draw: 10 }
  },
  
  invasion: {
    id: 'battle_invasion',
    name: 'Invasión Planetaria',
    description: 'Asalto a un planeta.',
    minForces: 5000,
    maxForces: 200000,
    duration: 120,
    victoryConditions: ['capture_planet', 'destroy_defenses', 'establish_beachhead'],
    terrainEffects: true,
    weatherEffects: true,
    scoring: { victory: 100, defeat: -50, draw: 20 }
  }
};

// ============================================
// TRATADOS Y PAZ
// ============================================
export interface PeaceTreaty {
  id: string;
  warId: string;
  type: 'white_peace' | 'surrender' | 'victory' | 'negotiated';
  
  terms: {
    whitePeace: boolean;        // Sin ganadores
    unconditionalSurrender: boolean;
    
    territorial: {
      cededSystems: string[];
      demilitarizedZones: string[];
    };
    
    economic: {
      reparations: number;
      resourceTransfers: Record<string, number>;
      tradeAgreements: string[];
    };
    
    military: {
      fleetLimit: number;
      structureLimits: Record<string, number>;
      disarmament: boolean;
    };
    
    political: {
      vassalage: boolean;
      allianceBreak: string[];
      nonAggressionPacts: number; // duración en días
    };
  };
  
  duration: number; // días de vigencia
  enforceable: boolean;
  enforcers?: string[]; // Quién garantiza el tratado
  
  signed: {
    by: string;
    date: number;
    witnessed: string[];
  }[];
}

// ============================================
// GUERRAS HISTÓRICAS (EJEMPLOS)
// ============================================
export const HISTORIC_WARS: War[] = [
  {
    id: 'war_001',
    name: 'Guerra de los Tres Sistemas',
    type: 'territorial',
    status: 'ended_victory',
    phase: 'final_assault',
    
    attacker: {
      id: 'corp_federation',
      name: 'Federación Galáctica',
      type: 'alliance',
      leaderId: 'corp_stellar_empire',
      members: [
        { corpId: 'corp_stellar', corpName: 'Stellar Empire', members: 150, fleetPower: 5000000, status: 'active' },
        { corpId: 'corp_nova', corpName: 'Nova Legion', members: 100, fleetPower: 3000000, status: 'active' }
      ],
      stats: {
        battlesWon: 12,
        battlesLost: 3,
        shipsDestroyed: 50000,
        shipsLost: 15000,
        structuresDestroyed: 25,
        structuresLost: 5,
        resourcesLooted: 100000000,
        territoryCaptured: 3
      },
      warScore: 850,
      warExhaustion: 25,
      publicSupport: 85
    },
    
    defender: {
      id: 'corp_coalition',
      name: 'Coalición Independiente',
      type: 'alliance',
      leaderId: 'corp_free_traders',
      members: [
        { corpId: 'corp_free', corpName: 'Free Traders Guild', members: 80, fleetPower: 2000000, status: 'defeated' },
        { corpId: 'corp_merchant', corpName: 'Merchant Princes', members: 60, fleetPower: 1500000, status: 'surrendered' }
      ],
      stats: {
        battlesWon: 3,
        battlesLost: 12,
        shipsDestroyed: 15000,
        shipsLost: 50000,
        structuresDestroyed: 5,
        structuresLost: 25,
        resourcesLooted: 10000000,
        territoryCaptured: 0
      },
      warScore: 150,
      warExhaustion: 95,
      publicSupport: 20
    },
    
    declaredAt: Date.now() - 2592000000, // 30 días atrás
    declaredBy: 'corp_stellar_empire',
    declarationReason: 'Disputa territorial por los sistemas ricos en recursos del sector Norte.',
    
    settings: {
      maxDuration: 30,
      allowAlliances: true,
      allowMercenaries: false,
      allowSurrender: true,
      warGoals: ['capture_territory', 'resources'],
      terms: {
        victory: ['Territorios disputados', 'Recursos del sector'],
        defeat: ['Pagar reparaciones', 'Desmilitarizar']
      }
    },
    
    objectives: [
      { id: 'obj_1', type: 'capture_planet', description: 'Capturar Planeta Alpha', targetId: 'planet_alpha', targetAmount: 1, currentAmount: 1, points: 100, completed: true, completedBy: 'corp_federation' },
      { id: 'obj_2', type: 'destroy_fleet', description: 'Destruir flota enemiga principal', targetAmount: 50000, currentAmount: 50000, points: 200, completed: true, completedBy: 'corp_federation' },
      { id: 'obj_3', type: 'hold_territory', description: 'Mantener control por 7 días', targetAmount: 7, currentAmount: 7, points: 150, completed: true, completedBy: 'corp_federation' }
    ],
    
    battles: [
      {
        id: 'battle_001',
        name: 'Batalla de Alpha Prime',
        type: 'field_battle',
        location: { systemId: 'sys_alpha', systemName: 'Alpha Prime', coordinates: { x: 100, y: 200 } },
        attacker: {
          participantId: 'corp_federation',
          forces: { ships: 10000, fleets: 50, commanders: ['cmd_legend_01', 'cmd_legend_02'] }
        },
        defender: {
          participantId: 'corp_coalition',
          forces: { ships: 8000, fleets: 40, commanders: ['cmd_epic_01'] }
        },
        startTime: Date.now() - 2419200000,
        endTime: Date.now() - 2419140000,
        duration: 10,
        result: 'attacker_victory',
        casualties: {
          attacker: { ships: 2000 },
          defender: { ships: 6000 }
        },
        impact: { warScoreChange: 50 }
      }
    ],
    
    startTime: Date.now() - 2592000000,
    endTime: Date.now() - 86400000,
    currentPhaseStart: Date.now() - 604800000,
    
    scoreToWin: 800,
    currentScore: {
      attacker: 850,
      defender: 150
    },
    
    peaceOffers: [],
    
    events: [
      { timestamp: Date.now() - 2592000000, type: 'phase_change', description: 'Fase de Preparación', impact: 0 },
      { timestamp: Date.now() - 2505600000, type: 'battle', description: 'Batalla de Alpha Prime', impact: 50 },
      { timestamp: Date.now() - 86400000, type: 'phase_change', description: 'Victoria de la Federación', impact: 800 }
    ],
    
    rewards: {
      victory: {
        credits: 10000000,
        honor: 10000,
        territory: ['sys_alpha', 'sys_beta', 'sys_gamma'],
        resources: { metal: 1000000, plasma: 500000 }
      },
      defeat: {
        credits: 1000000,
        honor: 1000,
        reparations: 5000000
      }
    }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateWarDeclarationCost(type: WarType): WarDeclarationCost {
  return WAR_DECLARATION_COSTS[type];
}

export function calculateWarExhaustion(factors: WarExhaustionFactors): number {
  let exhaustion = 0;
  
  exhaustion += factors.battlesLost * WAR_EXHAUSTION_CALCULATION.battleLost;
  exhaustion += factors.shipsLost * WAR_EXHAUSTION_CALCULATION.shipLost;
  exhaustion += factors.structuresLost * WAR_EXHAUSTION_CALCULATION.structureLost;
  exhaustion += (factors.resourcesSpent / 1000) * WAR_EXHAUSTION_CALCULATION.resourceSpent;
  exhaustion += factors.duration * WAR_EXHAUSTION_CALCULATION.dayPassed;
  
  return Math.min(100, exhaustion);
}

export function getBattleType(type: string): BattleType | undefined {
  return BATTLE_TYPES[type];
}

export function calculateBattleScore(battle: WarBattle, winner: 'attacker' | 'defender'): number {
  const type = BATTLE_TYPES[battle.type];
  if (!type) return 0;
  
  const baseScore = winner === 'attacker' ? type.scoring.victory : type.scoring.defeat;
  const casualtyBonus = Math.min(50, (battle.casualties.defender.ships / 1000));
  
  return baseScore + casualtyBonus;
}

export function getWarPhaseConfig(phase: WarPhase): WarPhaseConfig | undefined {
  return WAR_PHASES.find(p => p.phase === phase);
}

export function canDeclareWar(
  attackerPower: number,
  defenderPower: number,
  type: WarType
): { canDeclare: boolean; reasons: string[] } {
  const costs = WAR_DECLARATION_COSTS[type];
  const reasons: string[] = [];
  
  if (attackerPower < costs.minimumFleetPower) {
    reasons.push(`Se requieren ${costs.minimumFleetPower} de poder de flota`);
  }
  
  // Verificar balance de poder
  const powerRatio = attackerPower / defenderPower;
  if (powerRatio < 0.5) {
    reasons.push('El enemigo es demasiado poderoso');
  }
  
  return {
    canDeclare: reasons.length === 0,
    reasons
  };
}

export const WarSystem = {
  WAR_DECLARATION_COSTS,
  WAR_PHASES,
  WAR_EXHAUSTION_CALCULATION,
  BATTLE_TYPES,
  HISTORIC_WARS,
  calculateWarDeclarationCost,
  calculateWarExhaustion,
  getBattleType,
  calculateBattleScore,
  getWarPhaseConfig,
  canDeclareWar
};
