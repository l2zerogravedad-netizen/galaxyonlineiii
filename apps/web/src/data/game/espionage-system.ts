/**
 * SISTEMA DE ESPIONAJE - GALAXY ONLINE II
 * Inteligencia, sabotaje, infiltración y contrainteligencia
 */

// ============================================
// TIPOS DE OPERACIONES DE ESPIONAJE
// ============================================
export type EspionageType = 
  | 'reconnaissance'      // Reconocimiento
  | 'infiltration'        // Infiltración
  | 'sabotage'           // Sabotaje
  | 'theft'              // Robo de información/tecnología
  | 'counter_intelligence' // Contrainteligencia
  | 'disinformation'     // Desinformación
  | 'assassination';     // Eliminación de comandantes (alto riesgo)

export type EspionageStatus = 
  | 'planning'      // Planificación
  | 'in_progress'  // En progreso
  | 'successful'   // Exitosa
  | 'failed'       // Fallida
  | 'compromised'  // Comprometida (detectada)
  | 'extracting';   // Extracción

// ============================================
// AGENTES DE ESPIONAJE
// ============================================
export interface SpyAgent {
  id: string;
  name: string;
  codename: string;
  
  // Atributos base
  stats: {
    stealth: number;        // Capacidad de ocultamiento (1-100)
    hacking: number;        // Habilidad de hackeo (1-100)
    combat: number;         // Combate directo (1-100)
    charisma: number;       // Manipulación social (1-100)
    tech: number;           // Conocimiento técnico (1-100)
    luck: number;          // Factor suerte (1-100)
  };
  
  // Experiencia y nivel
  level: number;
  experience: number;
  maxExperience: number;
  
  // Especialización
  specialization: EspionageType | 'generalist';
  
  // Equipo (IDs de referencia)
  equipment: string[];
  
  // Estado
  status: 'available' | 'on_mission' | 'recovering' | 'captured' | 'dead';
  missionHistory: SpyMissionHistory[];
  
  // Costos
  recruitmentCost: { credits: number; time: number };
  maintenanceCost: { credits: number; per: 'hour' | 'day' };
  
  // Bonos de facción
  factionBonuses?: Record<string, number>;
}

export interface SpyEquipment {
  id: string;
  name: string;
  type: 'gadget' | 'weapon' | 'armor' | 'vehicle' | 'software';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  // Efectos en stats
  effects: Partial<SpyAgent['stats']>;
  
  // Usos especiales
  specialAbilities: string[];
  
  // Durabilidad
  durability: number;
  maxDurability: number;
  
  // Costo
  cost: { credits: number; metal?: number; plasma?: number };
}

export interface SpyMissionHistory {
  missionId: string;
  type: EspionageType;
  target: string;
  result: 'success' | 'partial' | 'failure';
  experienceGained: number;
  date: number;
  details: string;
}

// ============================================
// MISIONES DE ESPIONAJE
// ============================================
export interface EspionageMission {
  id: string;
  name: string;
  description: string;
  type: EspionageType;
  
  // Objetivo
  target: {
    type: 'player' | 'corporation' | 'system' | 'planet' | 'station';
    id: string;
    name: string;
    difficulty: number; // 1-100
  };
  
  // Requisitos
  requirements: {
    minAgentLevel: number;
    recommendedStats: Partial<SpyAgent['stats']>;
    equipment: string[];
    maxAgents: number;
  };
  
  // Duración
  duration: {
    base: number; // segundos
    variable: number; // +/- segundos aleatorios
    accelerationPossible: boolean;
  };
  
  // Probabilidades
  probabilities: {
    success: number;        // 0-1
    partialSuccess: number; // 0-1
    failure: number;        // 0-1
    compromise: number;     // 0-1
    capture: number;        // 0-1
    death: number;          // 0-1
  };
  
  // Costos
  costs: {
    credits: number;
    energy: number;
    agents: number;
  };
  
  // Recompensas por éxito
  rewards: {
    success: EspionageReward;
    partialSuccess: EspionageReward;
  };
  
  // Penalizaciones por fracaso
  penalties: {
    failure: EspionagePenalty;
    compromise: EspionagePenalty;
    capture: EspionagePenalty;
  };
  
  // Fases de la misión
  phases: EspionagePhase[];
  
  // Información obtenida
  intelValue: number; // 1-100, cuánta info revela
}

export interface EspionageReward {
  experience: number;
  credits: number;
  intel: IntelData[];
  items?: string[];
  reputationChange?: number;
}

export interface EspionagePenalty {
  agentInjury?: boolean;
  agentCapture?: boolean;
  agentDeath?: boolean;
  reputationLoss: number;
  creditsFine?: number;
  diplomaticTension?: boolean;
  counterAttackRisk?: number;
}

export interface EspionagePhase {
  id: string;
  order: number;
  name: string;
  description: string;
  
  // Duración de esta fase
  duration: number;
  
  // Stat principal requerido
  primaryStat: keyof SpyAgent['stats'];
  difficulty: number;
  
  // Eventos posibles en esta fase
  possibleEvents: EspionageEvent[];
  
  // Checkpoints (para reanudar si falla)
  checkpoint: boolean;
}

export interface EspionageEvent {
  id: string;
  name: string;
  description: string;
  probability: number;
  
  // Efecto si ocurre
  effect: {
    statModifier: Partial<SpyAgent['stats']>;
    timeModifier: number;
    alertLevel: number; // 0-100
  };
  
  // Decisiones posibles
  choices: {
    id: string;
    description: string;
    requiredStat: keyof SpyAgent['stats'];
    difficulty: number;
    successEffect: string;
    failureEffect: string;
  }[];
}

// ============================================
// DATOS DE INTELIGENCIA
// ============================================
export interface IntelData {
  id: string;
  type: 'fleet_composition' | 'resource_stock' | 'building_layout' | 
        'research_progress' | 'diplomatic_relations' | 'commander_location' |
        'trade_routes' | 'defense_weakness' | 'upcoming_attacks';
  
  // Valor de la información
  value: number; // 1-100
  freshness: number; // 0-100, se degrada con el tiempo
  expiresAt: number; // timestamp
  
  // Contenido
  targetId: string;
  targetType: 'player' | 'corporation' | 'system';
  details: Record<string, any>;
  
  // Metadatos
  obtainedAt: number;
  obtainedBy: string; // agente id
  missionId: string;
  reliability: number; // 0-100, probabilidad de ser correcta
}

export interface IntelDatabase {
  playerId: string;
  
  // Intel almacenada
  intel: IntelData[];
  
  // Análisis
  analysis: {
    threats: IntelThreat[];
    opportunities: IntelOpportunity[];
    patterns: IntelPattern[];
  };
  
  // Capacidad máxima
  maxIntelSlots: number;
  currentUsage: number;
}

export interface IntelThreat {
  id: string;
  targetId: string;
  threatType: 'imminent_attack' | 'espionage_detected' | 'alliance_formation' | 'tech_breakthrough';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: number;
  confidence: number; // 0-100
  recommendedAction: string;
  relatedIntelIds: string[];
}

export interface IntelOpportunity {
  id: string;
  description: string;
  targetId: string;
  opportunityType: 'undefended_target' | 'trade_deal' | 'weak_neighbor' | 'tech_steal';
  value: number; // potencial beneficio
  expiresAt: number;
  confidence: number;
  relatedIntelIds: string[];
}

export interface IntelPattern {
  id: string;
  description: string;
  patternType: 'attack_schedule' | 'resource_flow' | 'diplomatic_shift';
  observedOccurrences: number;
  confidence: number;
  prediction: string;
  relatedIntelIds: string[];
}

// ============================================
// CONTRAINTELIGENCIA
// ============================================
export interface CounterIntelligence {
  playerId: string;
  
  // Defensas activas
  defenses: {
    securityLevel: number; // 0-100
    detectionChance: number; // 0-1
    deceptionCapability: number; // 0-100
    traceBackAccuracy: number; // 0-1, probabilidad de identificar atacante
  };
  
  // Sistemas de defensa
  systems: CounterIntelSystem[];
  
  // Operaciones en curso
  activeOperations: CounterIntelOperation[];
  
  // Historial de detecciones
  detectionHistory: IntelBreach[];
}

export interface CounterIntelSystem {
  id: string;
  name: string;
  type: 'surveillance' | 'firewall' | 'physical_security' | 'disinformation_grid';
  level: number;
  maxLevel: number;
  
  // Efectos
  detectionBonus: number;
  cost: { credits: number; energy: number; per: 'hour' };
  maintenance: { credits: number; per: 'day' };
  
  // Bonos específicos
  specialBonuses: Record<string, number>;
}

export interface CounterIntelOperation {
  id: string;
  type: 'honey_pot' | 'trace_back' | 'disinformation' | 'agent_hunt';
  status: 'active' | 'successful' | 'failed';
  
  // Objetivo
  targetSuspicion: string; // jugador/objetivo sospechoso
  
  // Progreso
  progress: number; // 0-100
  estimatedCompletion: number;
  
  // Resultado potencial
  potentialOutcome: {
    captureAttacker: boolean;
    identifyOperatives: boolean;
    feedFalseIntel: boolean;
    diplomaticLeverage: number;
  };
}

export interface IntelBreach {
  id: string;
  detectedAt: number;
  attackerId: string;
  missionType: EspionageType;
  
  // Detección
  detectionMethod: 'automated' | 'agent_report' | 'pattern_analysis' | 'tip_off';
  detectionSpeed: number; // horas desde inicio
  
  // Daño
  damageAssessment: {
    intelLeaked: string[];
    agentsCompromised: string[];
    facilitiesAffected: string[];
    reputationImpact: number;
  };
  
  // Respuesta
  responseTaken: 'ignored' | 'traced' | 'counter_attacked' | 'diplomatic';
  outcome: string;
}

// ============================================
// EQUIPAMIENTO DE ESPIONAJE
// ============================================
export const SPY_EQUIPMENT: SpyEquipment[] = [
  {
    id: 'gadget_stealth_suit',
    name: 'Traje de Sigilo Avanzado',
    type: 'armor',
    rarity: 'rare',
    effects: { stealth: 15, combat: -5 },
    specialAbilities: ['thermal_invisibility', 'radar_scramble'],
    durability: 100,
    maxDurability: 100,
    cost: { credits: 50000, metal: 2000 }
  },
  {
    id: 'gadget_hacking_device',
    name: 'Descodificador Cuántico',
    type: 'gadget',
    rarity: 'epic',
    effects: { hacking: 25, tech: 10 },
    specialAbilities: ['instant_hack_low', 'encryption_break'],
    durability: 50,
    maxDurability: 50,
    cost: { credits: 100000, plasma: 5000 }
  },
  {
    id: 'weapon_silenced_pistol',
    name: 'Pistola Silenciada de Plasma',
    type: 'weapon',
    rarity: 'rare',
    effects: { combat: 20, stealth: -2 },
    specialAbilities: ['silent_kill', 'armor_piercing'],
    durability: 200,
    maxDurability: 200,
    cost: { credits: 30000, metal: 1000, plasma: 500 }
  },
  {
    id: 'vehicle_stealth_shuttle',
    name: 'Lanzadera de Infiltración',
    type: 'vehicle',
    rarity: 'epic',
    effects: { stealth: 10, luck: 5 },
    specialAbilities: ['cloak_field', 'rapid_extraction'],
    durability: 150,
    maxDurability: 150,
    cost: { credits: 200000, metal: 10000, plasma: 3000 }
  },
  {
    id: 'software_ghost_protocol',
    name: 'Protocolo Fantasma',
    type: 'software',
    rarity: 'legendary',
    effects: { hacking: 30, stealth: 20 },
    specialAbilities: ['trace_erasure', 'identity_spoof', 'system_override'],
    durability: 25,
    maxDurability: 25,
    cost: { credits: 500000, plasma: 10000 }
  }
];

// ============================================
// AGENTES PREDEFINIDOS
// ============================================
export const DEFAULT_AGENTS: SpyAgent[] = [
  {
    id: 'agent_recruit_01',
    name: 'Agente Novicio',
    codename: 'ROOKIE',
    stats: { stealth: 30, hacking: 25, combat: 20, charisma: 25, tech: 20, luck: 50 },
    level: 1,
    experience: 0,
    maxExperience: 1000,
    specialization: 'generalist',
    equipment: [],
    status: 'available',
    missionHistory: [],
    recruitmentCost: { credits: 10000, time: 3600 },
    maintenanceCost: { credits: 100, per: 'hour' }
  },
  {
    id: 'agent_infiltrator_01',
    name: 'Maestro Infiltrador',
    codename: 'SHADOW',
    stats: { stealth: 85, hacking: 60, combat: 40, charisma: 70, tech: 50, luck: 60 },
    level: 15,
    experience: 50000,
    maxExperience: 100000,
    specialization: 'infiltration',
    equipment: ['gadget_stealth_suit'],
    status: 'available',
    missionHistory: [],
    recruitmentCost: { credits: 500000, time: 86400 },
    maintenanceCost: { credits: 2000, per: 'hour' }
  },
  {
    id: 'agent_hacker_01',
    name: 'Hacker de Élite',
    codename: 'GHOST',
    stats: { stealth: 50, hacking: 95, combat: 10, charisma: 30, tech: 90, luck: 40 },
    level: 20,
    experience: 100000,
    maxExperience: 200000,
    specialization: 'theft',
    equipment: ['gadget_hacking_device', 'software_ghost_protocol'],
    status: 'available',
    missionHistory: [],
    recruitmentCost: { credits: 750000, time: 172800 },
    maintenanceCost: { credits: 3000, per: 'hour' }
  }
];

// ============================================
// TIPOS DE MISIONES DE ESPIONAJE
// ============================================
export const ESPIONAGE_MISSION_TEMPLATES: Partial<EspionageMission>[] = [
  {
    id: 'mission_recon_fleet',
    name: 'Reconocimiento de Flota',
    description: 'Infiltrarse y documentar la composición y posición de una flote enemiga',
    type: 'reconnaissance',
    requirements: {
      minAgentLevel: 1,
      recommendedStats: { stealth: 40, tech: 30 },
      equipment: [],
      maxAgents: 2
    },
    duration: { base: 7200, variable: 1800, accelerationPossible: true },
    probabilities: { success: 0.7, partialSuccess: 0.2, failure: 0.08, compromise: 0.02, capture: 0.01, death: 0 },
    costs: { credits: 5000, energy: 100, agents: 1 },
    rewards: {
      success: { experience: 500, credits: 0, intel: [{ type: 'fleet_composition', value: 60, freshness: 100 } as IntelData] },
      partialSuccess: { experience: 250, credits: 0, intel: [{ type: 'fleet_composition', value: 30, freshness: 80 } as IntelData] }
    },
    penalties: {
      failure: { reputationLoss: 5, diplomaticTension: false },
      compromise: { reputationLoss: 15, diplomaticTension: true, counterAttackRisk: 0.3 },
      capture: { reputationLoss: 25, diplomaticTension: true, creditsFine: 50000, agentCapture: true }
    },
    intelValue: 60
  },
  {
    id: 'mission_sabotage_research',
    name: 'Sabotaje de Laboratorio',
    description: 'Infiltrarse en un laboratorio enemigo y destruir investigaciones en progreso',
    type: 'sabotage',
    requirements: {
      minAgentLevel: 10,
      recommendedStats: { stealth: 70, hacking: 60, tech: 50 },
      equipment: ['gadget_hacking_device'],
      maxAgents: 3
    },
    duration: { base: 14400, variable: 3600, accelerationPossible: false },
    probabilities: { success: 0.5, partialSuccess: 0.25, failure: 0.15, compromise: 0.08, capture: 0.02, death: 0.02 },
    costs: { credits: 50000, energy: 500, agents: 2 },
    rewards: {
      success: { experience: 2000, credits: 0, intel: [{ type: 'research_progress', value: 80, freshness: 100 } as IntelData] },
      partialSuccess: { experience: 1000, credits: 0, intel: [{ type: 'research_progress', value: 40, freshness: 60 } as IntelData] }
    },
    penalties: {
      failure: { reputationLoss: 20, diplomaticTension: true },
      compromise: { reputationLoss: 40, diplomaticTension: true, counterAttackRisk: 0.5 },
      capture: { reputationLoss: 60, diplomaticTension: true, creditsFine: 200000, agentCapture: true, agentDeath: true }
    },
    intelValue: 80
  },
  {
    id: 'mission_theft_blueprints',
    name: 'Robo de Planos',
    description: 'Extraer planos de tecnología avanzada de instalaciones enemigas',
    type: 'theft',
    requirements: {
      minAgentLevel: 15,
      recommendedStats: { stealth: 80, hacking: 90, tech: 70 },
      equipment: ['gadget_hacking_device', 'software_ghost_protocol'],
      maxAgents: 1
    },
    duration: { base: 21600, variable: 7200, accelerationPossible: false },
    probabilities: { success: 0.4, partialSuccess: 0.3, failure: 0.2, compromise: 0.08, capture: 0.04, death: 0.02 },
    costs: { credits: 100000, energy: 1000, agents: 1 },
    rewards: {
      success: { experience: 5000, credits: 0, intel: [{ type: 'research_progress', value: 100, freshness: 100 } as IntelData], items: ['random_blueprint_rare'] },
      partialSuccess: { experience: 2500, credits: 0, intel: [{ type: 'research_progress', value: 50, freshness: 70 } as IntelData] }
    },
    penalties: {
      failure: { reputationLoss: 30, diplomaticTension: true },
      compromise: { reputationLoss: 50, diplomaticTension: true, counterAttackRisk: 0.7 },
      capture: { reputationLoss: 80, diplomaticTension: true, creditsFine: 500000, agentCapture: true, agentDeath: true }
    },
    intelValue: 100
  }
];

// ============================================
// SISTEMAS DE CONTRAINTELIGENCIA
// ============================================
export const COUNTER_INTEL_SYSTEMS: CounterIntelSystem[] = [
  {
    id: 'sys_surveillance_grid',
    name: 'Red de Vigilancia',
    type: 'surveillance',
    level: 1,
    maxLevel: 10,
    detectionBonus: 5,
    cost: { credits: 10000, energy: 50, per: 'hour' },
    maintenance: { credits: 5000, per: 'day' },
    specialBonuses: { early_warning: 10, pattern_detection: 5 }
  },
  {
    id: 'sys_quantum_firewall',
    name: 'Firewall Cuántico',
    type: 'firewall',
    level: 1,
    maxLevel: 10,
    detectionBonus: 10,
    cost: { credits: 25000, energy: 100, per: 'hour' },
    maintenance: { credits: 10000, per: 'day' },
    specialBonuses: { hacking_defense: 20, trace_improvement: 15 }
  },
  {
    id: 'sys_honey_pot',
    name: 'Red Honey Pot',
    type: 'disinformation_grid',
    level: 1,
    maxLevel: 5,
    detectionBonus: 15,
    cost: { credits: 50000, energy: 200, per: 'hour' },
    maintenance: { credits: 20000, per: 'day' },
    specialBonuses: { false_intel_feed: 30, attacker_identification: 25 }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateMissionSuccess(
  mission: EspionageMission,
  agents: SpyAgent[],
  equipment: SpyEquipment[]
): { successChance: number; riskLevel: string } {
  // Calcular stats combinados
  const combinedStats: SpyAgent['stats'] = {
    stealth: 0, hacking: 0, combat: 0, charisma: 0, tech: 0, luck: 0
  };
  
  agents.forEach(agent => {
    Object.keys(combinedStats).forEach(stat => {
      combinedStats[stat as keyof SpyAgent['stats']] += agent.stats[stat as keyof SpyAgent['stats']];
    });
  });
  
  // Promediar
  Object.keys(combinedStats).forEach(stat => {
    combinedStats[stat as keyof SpyAgent['stats']] /= agents.length || 1;
  });
  
  // Aplicar bonos de equipo
  equipment.forEach(item => {
    Object.keys(item.effects).forEach(stat => {
      combinedStats[stat as keyof SpyAgent['stats']] += item.effects[stat as keyof SpyAgent['stats']] || 0;
    });
  });
  
  // Calcular probabilidad base
  let baseChance = mission.probabilities.success;
  
  // Ajustar por stats
  const recommendedStats = mission.requirements.recommendedStats;
  Object.keys(recommendedStats).forEach(stat => {
    const required = recommendedStats[stat as keyof SpyAgent['stats']] || 0;
    const actual = combinedStats[stat as keyof SpyAgent['stats']];
    const diff = actual - required;
    
    baseChance += diff * 0.005; // +/- 0.5% por punto de stat
  });
  
  // Limitar
  baseChance = Math.max(0.05, Math.min(0.95, baseChance));
  
  // Determinar nivel de riesgo
  let riskLevel = 'low';
  if (mission.probabilities.capture > 0.03 || mission.probabilities.death > 0.01) riskLevel = 'critical';
  else if (mission.probabilities.capture > 0.01) riskLevel = 'high';
  else if (mission.probabilities.compromise > 0.05) riskLevel = 'medium';
  
  return { successChance: baseChance, riskLevel };
}

export function getEquipmentByType(type: SpyEquipment['type']): SpyEquipment[] {
  return SPY_EQUIPMENT.filter(e => e.type === type);
}

export function getAgentBySpecialization(spec: SpyAgent['specialization']): SpyAgent[] {
  return DEFAULT_AGENTS.filter(a => a.specialization === spec);
}

export function estimateMissionDuration(
  mission: EspionageMission,
  agentSpeed: number
): number {
  const base = mission.duration.base;
  const variable = mission.duration.variable;
  const randomFactor = (Math.random() * 2 - 1) * variable;
  const speedModifier = 1 - (agentSpeed / 200); // Max 50% reducción
  
  return Math.floor((base + randomFactor) * speedModifier);
}

export const EspionageSystem = {
  SPY_EQUIPMENT,
  DEFAULT_AGENTS,
  ESPIONAGE_MISSION_TEMPLATES,
  COUNTER_INTEL_SYSTEMS,
  calculateMissionSuccess,
  getEquipmentByType,
  getAgentBySpecialization,
  estimateMissionDuration
};
