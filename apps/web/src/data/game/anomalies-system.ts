/**
 * SISTEMA DE ANOMALÍAS ESPACIALES - GALAXY ONLINE II
 * Fenómenos espaciales raros, beneficios/riesgos, exploración
 */

// ============================================
// TIPOS DE ANOMALÍAS
// ============================================
export type AnomalyType = 
  | 'gravitational'    // Anomalía gravitacional
  | 'electromagnetic'  // Anomalía EM
  | 'quantum'          // Anomalía cuántica
  | 'temporal'         // Anomalía temporal
  | 'dimensional'      // Brecha dimensional
  | 'biological'       // Anomalía biológica
  | 'technological'    // Reliquia tecnológica
  | 'natural'          // Fenómeno natural extraño
  | 'artificial'       // Estructura artificial desconocida
  | 'psychic'          // Anomalía psíquica
  | 'energetic';       // Concentración de energía

export type AnomalyRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// ============================================
// ANOMALÍA ESPACIAL
// ============================================
export interface SpaceAnomaly {
  id: string;
  name: string;
  codename: string;
  type: AnomalyType;
  rarity: AnomalyRarity;
  
  // Descripción
  description: string;
  discoveryText: string; // Texto al descubrir
  lore: string;
  
  // Ubicación
  location: {
    systemId: string;
    coordinates: { x: number; y: number; z?: number };
    hidden: boolean;
    detectionDifficulty: number; // 0-100
  };
  
  // Características
  characteristics: {
    size: number; // diámetro en km
    stability: number; // 0-100 (100 = estable)
    persistence: 'permanent' | 'temporary' | 'cyclical' | 'random';
    lifespan?: number; // segundos (si es temporal)
  };
  
  // Efectos
  effects: {
    // Efectos en nave
    ship: {
      speedModifier: number;
      shieldModifier: number;
      weaponModifier: number;
      sensorRange: number;
      jumpCapability: boolean;
    };
    
    // Efectos en tripulación
    crew: {
      healthDrain: number;
      sanityEffect: number; // -100 a +100
      skillModifier: number;
      specialAbilities?: string[];
    };
    
    // Efectos en sistemas
    systems: {
      powerFluctuation: boolean;
      communicationInterference: boolean;
      navigationErrors: boolean;
      weaponMalfunction: boolean;
    };
  };
  
  // Riesgos
  risks: {
    damagePerSecond: number;
    destructionChance: number; // 0-1 probabilidad instantánea
    crewCasualtyChance: number;
    shipTrapped: boolean;
    escapeDifficulty: number; // 0-100
  };
  
  // Recompensas
  rewards: {
    experience: number;
    credits: number;
    researchPoints: number;
    reputationGain: number;
    specialResources: string[];
    uniqueItems: string[];
    technologyUnlocks: string[];
    crewBonuses: string[];
  };
  
  // Investigación
  research: {
    difficulty: number; // 0-100
    timeRequired: number; // segundos
    equipmentRequired: string[];
    skillsRequired: string[];
    sampleCollection: boolean;
  };
  
  // Eventos especiales
  events?: {
    trigger: 'approach' | 'scan' | 'enter' | 'research' | 'random';
    probability: number;
    description: string;
    outcome: 'positive' | 'negative' | 'neutral' | 'random';
  }[];
}

// ============================================
// EXPLORACIÓN DE ANOMALÍAS
// ============================================
export interface AnomalyExpedition {
  id: string;
  anomalyId: string;
  
  // Equipo
  team: {
    shipId: string;
    captain: string;
    scientists: number;
    security: number;
    specialists: string[];
  };
  
  // Equipamiento
  equipment: {
    sensors: string[];
    probes: number;
    sampleContainers: number;
    shieldBoosters: boolean;
    escapePods: boolean;
  };
  
  // Fases
  phases: {
    current: 'approach' | 'scanning' | 'investigation' | 'sample_collection' | 'extraction' | 'analysis' | 'completed';
    completed: string[];
    progress: number; // 0-100
  };
  
  // Resultados
  results: {
    dataCollected: number;
    samplesCollected: string[];
    discoveries: string[];
    crewCasualties: number;
    shipDamage: number;
    unexpectedEvents: string[];
  };
  
  // Estado
  status: 'planning' | 'in_progress' | 'successful' | 'failed' | 'aborted';
  
  // Tiempo
  timing: {
    started: number;
    estimatedDuration: number;
    actualDuration?: number;
    deadline?: number;
  };
}

// ============================================
// ANOMALÍAS PREDEFINIDAS
// ============================================
export const SPACE_ANOMALIES: SpaceAnomaly[] = [
  {
    id: 'anomaly_gravity_well_echo',
    name: 'Eco del Pozo Gravitacional',
    codename: 'WHISPER',
    type: 'gravitational',
    rarity: 'rare',
    description: 'Remanente de un agujero negro colapsado que aún distorsiona el espacio-tiempo',
    discoveryText: 'Los sensores detectan una perturbación gravitacional imposible... un eco de algo que ya no existe.',
    lore: 'Los científicos creen que es lo que queda cuando un agujero negro microscópico se evapora por radiación de Hawking',
    location: {
      systemId: 'sys_void_sector',
      coordinates: { x: -500, y: 800, z: 100 },
      hidden: false,
      detectionDifficulty: 40
    },
    characteristics: {
      size: 50,
      stability: 30,
      persistence: 'temporary',
      lifespan: 604800
    },
    effects: {
      ship: {
        speedModifier: 0.3,
        shieldModifier: 1.5,
        weaponModifier: 0.8,
        sensorRange: 2.0,
        jumpCapability: false
      },
      crew: {
        healthDrain: 0.1,
        sanityEffect: -10,
        skillModifier: 0
      },
      systems: {
        powerFluctuation: true,
        communicationInterference: false,
        navigationErrors: true,
        weaponMalfunction: false
      }
    },
    risks: {
      damagePerSecond: 5,
      destructionChance: 0.01,
      crewCasualtyChance: 0.05,
      shipTrapped: true,
      escapeDifficulty: 60
    },
    rewards: {
      experience: 5000,
      credits: 100000,
      researchPoints: 2000,
      reputationGain: 50,
      specialResources: ['graviton_particles', 'exotic_matter_traces'],
      uniqueItems: ['gravity_wave_scanner'],
      technologyUnlocks: ['advanced_gravity_manipulation'],
      crewBonuses: []
    },
    research: {
      difficulty: 70,
      timeRequired: 36000,
      equipmentRequired: ['gravitational_sensor', 'quantum_probe'],
      skillsRequired: ['astrophysics', 'quantum_mechanics'],
      sampleCollection: true
    },
    events: [
      { trigger: 'enter', probability: 0.3, description: 'Vislumbres de realidades alternativas', outcome: 'random' },
      { trigger: 'research', probability: 0.1, description: 'Eco temporal contacta con la nave', outcome: 'negative' }
    ]
  },
  {
    id: 'anomaly_crystal_formation',
    name: 'Formación de Cristales Cuánticos',
    codename: 'PRISM',
    type: 'natural',
    rarity: 'uncommon',
    description: 'Estructuras cristalinas que amplifican y almacenan energía cuántica',
    discoveryText: 'Detectamos cristales que brillan con luz interna, resonando con frecuencias imposibles.',
    lore: 'Estos cristales se forman en el espacio profundo donde la radiación cósmica interactúa con campos magnéticos únicos',
    location: {
      systemId: 'sys_crystal_fields',
      coordinates: { x: 300, y: 400 },
      hidden: false,
      detectionDifficulty: 20
    },
    characteristics: {
      size: 200,
      stability: 80,
      persistence: 'permanent'
    },
    effects: {
      ship: {
        speedModifier: 1.0,
        shieldModifier: 2.0,
        weaponModifier: 1.3,
        sensorRange: 1.5,
        jumpCapability: true
      },
      crew: {
        healthDrain: 0,
        sanityEffect: 5,
        skillModifier: 10
      },
      systems: {
        powerFluctuation: false,
        communicationInterference: false,
        navigationErrors: false,
        weaponMalfunction: false
      }
    },
    risks: {
      damagePerSecond: 0,
      destructionChance: 0,
      crewCasualtyChance: 0,
      shipTrapped: false,
      escapeDifficulty: 0
    },
    rewards: {
      experience: 2000,
      credits: 50000,
      researchPoints: 800,
      reputationGain: 20,
      specialResources: ['quantum_crystals', 'photonic_resonators'],
      uniqueItems: ['crystal_power_cell'],
      technologyUnlocks: ['crystal_energy_harvesting'],
      crewBonuses: ['crystal_sensitivity']
    },
    research: {
      difficulty: 40,
      timeRequired: 18000,
      equipmentRequired: ['geological_scanner', 'sample_drill'],
      skillsRequired: ['geology', 'materials_science'],
      sampleCollection: true
    },
    events: [
      { trigger: 'scan', probability: 0.5, description: 'Resonancia armónica mejora sistemas', outcome: 'positive' }
    ]
  },
  {
    id: 'anomaly_derelict_ancient',
    name: 'Estructura Ancestral Derelicta',
    codename: 'REMNANT',
    type: 'artificial',
    rarity: 'epic',
    description: 'Estación espacial de una civilización desconocida, abandonada hace milenios',
    discoveryText: 'Escaneos detectan una estructura artificial... tecnología incomprensible, energía residual detectada.',
    lore: 'Los arqueólogos espaciales creen que esta estación perteneció a los Precursores, una raza que existió antes de todas las civilizaciones actuales',
    location: {
      systemId: 'sys_ancient_sector',
      coordinates: { x: -1000, y: -500 },
      hidden: true,
      detectionDifficulty: 80
    },
    characteristics: {
      size: 5000,
      stability: 60,
      persistence: 'permanent'
    },
    effects: {
      ship: {
        speedModifier: 0.8,
        shieldModifier: 0.5,
        weaponModifier: 0.5,
        sensorRange: 0.3,
        jumpCapability: true
      },
      crew: {
        healthDrain: 0,
        sanityEffect: -20,
        skillModifier: 0
      },
      systems: {
        powerFluctuation: true,
        communicationInterference: true,
        navigationErrors: false,
        weaponMalfunction: true
      }
    },
    risks: {
      damagePerSecond: 0,
      destructionChance: 0.05,
      crewCasualtyChance: 0.1,
      shipTrapped: false,
      escapeDifficulty: 30
    },
    rewards: {
      experience: 10000,
      credits: 500000,
      researchPoints: 5000,
      reputationGain: 100,
      specialResources: ['ancient_alloys', 'precursor_data_cores'],
      uniqueItems: ['precursor_artifact', 'ancient_weapon_blueprint'],
      technologyUnlocks: ['precursor_archaeology', 'advanced_materials'],
      crewBonuses: []
    },
    research: {
      difficulty: 90,
      timeRequired: 86400,
      equipmentRequired: ['archaeology_kit', 'decryption_unit', 'containment_field'],
      skillsRequired: ['archaeology', 'xenolinguistics', 'ancient_history'],
      sampleCollection: true
    },
    events: [
      { trigger: 'enter', probability: 0.4, description: 'Sistemas de defensa ancestrales activados', outcome: 'negative' },
      { trigger: 'research', probability: 0.2, description: 'Descubrimiento tecnológico revolucionario', outcome: 'positive' }
    ]
  },
  {
    id: 'anomaly_temporal_loop',
    name: 'Bucle Temporal Localizado',
    codename: 'ECHO',
    type: 'temporal',
    rarity: 'legendary',
    description: 'Punto donde el tiempo se repite en un ciclo cerrado',
    discoveryText: '¡Imposible! Los relojes de la nave se han detenido... y nuestros sensores detectan múltiples versiones de nuestra propia nave.',
    lore: 'Algunos científicos teóricos postulan que estos bucles son cicatrices en el tejido del espacio-tiempo causadas por viajes temporales previos',
    location: {
      systemId: 'sys_temporal_rift',
      coordinates: { x: 0, y: 0, z: 50 },
      hidden: true,
      detectionDifficulty: 95
    },
    characteristics: {
      size: 5,
      stability: 10,
      persistence: 'cyclical',
      lifespan: 3600
    },
    effects: {
      ship: {
        speedModifier: 0,
        shieldModifier: 0,
        weaponModifier: 0,
        sensorRange: 0,
        jumpCapability: false
      },
      crew: {
        healthDrain: 0,
        sanityEffect: -50,
        skillModifier: 0,
        specialAbilities: ['temporal_vision', 'deja_vu']
      },
      systems: {
        powerFluctuation: true,
        communicationInterference: true,
        navigationErrors: true,
        weaponMalfunction: true
      }
    },
    risks: {
      damagePerSecond: 0,
      destructionChance: 0.2,
      crewCasualtyChance: 0.3,
      shipTrapped: true,
      escapeDifficulty: 95
    },
    rewards: {
      experience: 20000,
      credits: 0,
      researchPoints: 10000,
      reputationGain: 200,
      specialResources: ['chronon_particles', 'temporal_crystals'],
      uniqueItems: ['time_anchor', 'temporal_shield'],
      technologyUnlocks: ['temporal_mechanics', 'causality_manipulation'],
      crewBonuses: ['temporal_awareness']
    },
    research: {
      difficulty: 100,
      timeRequired: 172800,
      equipmentRequired: ['temporal_scanner', 'causality_anchor', 'chrono_probe'],
      skillsRequired: ['temporal_physics', 'quantum_mechanics', 'philosophy'],
      sampleCollection: false
    },
    events: [
      { trigger: 'enter', probability: 1.0, description: 'Atrapado en el bucle temporal', outcome: 'negative' },
      { trigger: 'random', probability: 0.5, description: 'Contacto con uno mismo del pasado/futuro', outcome: 'random' }
    ]
  }
];

// ============================================
// CATÁLOGO DE ANOMALÍAS
// ============================================
export interface AnomalyCatalog {
  playerId: string;
  discoveredAnomalies: {
    anomalyId: string;
    discoveredAt: number;
    researchLevel: number; // 0-100
    secretsUncovered: string[];
    samplesCollected: number;
    expeditionsCompleted: number;
  }[];
  
  // Estadísticas
  stats: {
    totalDiscovered: number;
    totalResearched: number;
    rareFinds: number;
    crewLostToAnomalies: number;
    rewardsGained: number;
  };
  
  // Reputación
  reputation: {
    asAnomalyHunter: number;
    scientificCommunity: number;
    explorerGuild: number;
  };
}

// ============================================
// HELPERS
// ============================================
export function calculateAnomalyRisk(
  ship: { shield: number; armor: number; techLevel: number; crewSkill: number },
  anomaly: SpaceAnomaly
): { riskLevel: string; survivalChance: number; recommendedPreparation: string[] } {
  const riskScore = 
    (anomaly.risks.damagePerSecond * 10) +
    (anomaly.risks.destructionChance * 100) +
    (anomaly.risks.crewCasualtyChance * 50) +
    (anomaly.risks.escapeDifficulty / 2);
  
  const shipBonus = (ship.shield / 100) + (ship.techLevel / 10) + (ship.crewSkill / 100);
  const finalRisk = Math.max(0, riskScore - shipBonus * 10);
  
  let riskLevel = 'low';
  if (finalRisk > 80) riskLevel = 'extreme';
  else if (finalRisk > 60) riskLevel = 'high';
  else if (finalRisk > 40) riskLevel = 'medium';
  
  const survivalChance = Math.max(5, 100 - finalRisk);
  
  const recommendedPreparation = [];
  if (anomaly.risks.damagePerSecond > 0) recommendedPreparation.push('Reforzar escudos');
  if (anomaly.risks.crewCasualtyChance > 0.1) recommendedPreparation.push('Trajes de protección');
  if (anomaly.research.difficulty > 70) recommendedPreparation.push('Especialistas científicos');
  if (anomaly.risks.shipTrapped) recommendedPreparation.push('Motores de escape de emergencia');
  
  return { riskLevel, survivalChance, recommendedPreparation };
}

export function getAnomalyBySystem(systemId: string): SpaceAnomaly[] {
  return SPACE_ANOMALIES.filter(a => a.location.systemId === systemId);
}

export function getAnomalyByRarity(rarity: AnomalyRarity): SpaceAnomaly[] {
  return SPACE_ANOMALIES.filter(a => a.rarity === rarity);
}

export function getUndiscoveredAnomalies(
  discoveredIds: string[]
): SpaceAnomaly[] {
  return SPACE_ANOMALIES.filter(a => !discoveredIds.includes(a.id));
}

export function calculateResearchReward(
  anomaly: SpaceAnomaly,
  researchTime: number,
  equipmentQuality: number,
  scientistSkill: number
): { success: boolean; rewardMultiplier: number; discoveries: number } {
  const baseSuccess = (equipmentQuality + scientistSkill) / 2;
  const timeBonus = Math.min(1, researchTime / anomaly.research.timeRequired);
  const finalChance = baseSuccess * timeBonus;
  
  const success = Math.random() * 100 < finalChance;
  const rewardMultiplier = success ? (1 + (scientistSkill / 100)) : 0.3;
  const discoveries = success ? Math.floor(Math.random() * 3) + 1 : 0;
  
  return { success, rewardMultiplier, discoveries };
}

export const AnomaliesSystem = {
  SPACE_ANOMALIES,
  calculateAnomalyRisk,
  getAnomalyBySystem,
  getAnomalyByRarity,
  getUndiscoveredAnomalies,
  calculateResearchReward
};
