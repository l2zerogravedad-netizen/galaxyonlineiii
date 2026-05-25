/**
 * SISTEMA DE CONTRABANDO / MERCADO NEGRO - GALAXY ONLINE II
 * Bienes ilegales, receptadores, cazarrecompensas, riesgos
 */

// ============================================
// TIPOS DE BIENES ILEGALES
// ============================================
export type IllegalGoodType = 
  | 'narcotics'       // Drogas
  | 'weapons_banned'  // Armas prohibidas
  | 'slaves'         // Tráfico de personas (oscuro)
  | 'artifacts_stolen' // Artefactos robados
  | 'tech_forbidden'  // Tecnología prohibida
  | 'info_classified' // Información clasificada
  | 'organs'         // Tráfico de órganos (oscuro)
  | 'counterfeit';   // Bienes falsificados

export type IllegalGoodStatus = 
  | 'readily_available'  // Fácil de conseguir
  | 'controlled'        // Controlado
  | 'heavily_monitored' // Fuertemente monitoreado
  | 'banned'           // Prohibido totalmente
  | 'death_penalty';   // Pena de muerte por posesión

// ============================================
// BIENES ILEGALES
// ============================================
export interface IllegalGood {
  id: string;
  name: string;
  type: IllegalGoodType;
  
  // Descripción
  description: string;
  lore: string; // Historia/fondo
  
  // Legalidad
  legality: {
    status: IllegalGoodStatus;
    jurisdictions: Record<string, IllegalGoodStatus>; // Por facción/sistema
    
    // Penalizaciones por posesión
    penalties: {
      fine: number;
      imprisonment: number; // segundos (tiempo de juego)
      reputationLoss: number;
      confiscation: boolean;
      execution: boolean; // Para goods muy oscuros
    };
  };
  
  // Valor económico
  value: {
    basePrice: number;
    blackMarketPrice: number; // 2-10x base
    demand: number; // 0-100
    supply: number; // 0-100
    volatility: number; // 0-100
  };
  
  // Características
  characteristics: {
    weight: number; // por unidad
    volume: number;
    perishability: number; // 0-100 (0 = eternal, 100 = dura horas)
    traceability: number; // 0-100 (qué tan fácil es detectar)
    detectability: number; // 0-100 (escáneres)
  };
  
  // Rutas típicas
  typicalRoutes: {
    source: string;
    destination: string;
    profitMargin: number;
    riskLevel: number;
  }[];
  
  // Usos
  uses: {
    consumption: boolean;
    crafting: boolean;
    quest: boolean;
    special: string[];
  };
}

// ============================================
// RECEPTADORES (FENCES)
// ============================================
export interface Fence {
  id: string;
  name: string;
  codename: string;
  
  // Ubicación
  location: {
    systemId: string;
    stationId?: string;
    planetId?: string;
    hidden: boolean; // Requiere contacto para encontrar
    coordinates?: { x: number; y: number };
  };
  
  // Especialización
  specialization: IllegalGoodType[];
  
  // Ofertas actuales
  inventory: {
    goodId: string;
    quantity: number;
    buyPrice: number; // A cuánto compra
    sellPrice: number; // A cuánto vende
    refreshTime: number;
  }[];
  
  // Relación con jugador
  reputation: {
    trust: number; // 0-100
    dealsCompleted: number;
    dealsFailed: number;
    lastDeal: number;
  };
  
  // Características del negocio
  business: {
    maxDealValue: number;
    markup: number; // Porcentaje sobre precio base
    discountForTrusted: number;
    paymentMethods: ('credits' | 'barter' | 'favor')[];
    creditLine: number; // Cuánto confía en deuda
  };
  
  // Seguridad
  security: {
    detectionRisk: number; // 0-100 probabilidad de que las autoridades te detecten
    policeInfiltration: number; // 0-100
    informants: number; // 0-100
    
    // Protección
    bribesPaid: number;
    protectionFaction?: string;
  };
  
  // Contacto
  contact: {
    method: 'direct' | 'referral' | 'coded_message' | 'dead_drop';
    requirements: string[];
    introductionCost: number;
  };
}

// ============================================
// OPERACIONES DE CONTRABANDO
// ============================================
export interface SmugglingRun {
  id: string;
  status: 'planning' | 'procurement' | 'in_transit' | 'delivery' | 'completed' | 'busted' | 'aborted';
  
  // Carga
  cargo: {
    goodId: string;
    quantity: number;
    totalValue: number;
    concealment: number; // 0-100 qué tan bien escondido
  }[];
  
  // Ruta
  route: {
    origin: string;
    destination: string;
    waypoints: string[];
    checkpoints: {
      systemId: string;
      scanChance: number;
      bribeOption: boolean;
      bypassRoute?: string;
    }[];
  };
  
  // Transporte
  transport: {
    shipId: string;
    smugglingCompartments: boolean;
    shieldedCargo: boolean;
    falseTransponder: boolean;
    crewExperience: number;
  };
  
  // Estado de la misión
  progress: {
    currentCheckpoint: number;
    scansSurvived: number;
    scansFailed: number;
    bribesPaid: number;
    closeCalls: number;
  };
  
  // Finanzas
  finances: {
    goodsCost: number;
    transportCost: number;
    bribeBudget: number;
    bribesPaid: number;
    expectedRevenue: number;
    actualRevenue?: number;
  };
  
  // Riesgos
  risks: {
    detectionChance: number;
    confiscationRisk: number;
    imprisonmentRisk: number;
    reputationRisk: number;
  };
  
  // Tiempos
  timing: {
    started: number;
    estimatedDuration: number;
    actualDuration?: number;
    deadline: number;
  };
}

// ============================================
// CACERÍA DE RECOMPENSAS (CAZARRECOMPENSAS)
// ============================================
export interface BountyHunter {
  id: string;
  name: string;
  codename: string;
  
  // Reputación
  reputation: {
    effectiveness: number; // 0-100
    lethality: 'capture' | 'dead_or_alive' | 'dead_preferred';
    integrity: number; // 0-100 (honra contratos)
    notoriety: number; // 0-100 (qué tan conocido es)
  };
  
  // Especialización
  specialization: {
    targetTypes: ('pirates' | 'smugglers' | 'traitors' | 'war_criminals' | 'escaped_convicts')[];
    jurisdictions: string[];
    methods: ('tracking' | 'ambush' | 'infiltration' | 'negotiation')[];
  };
  
  // Recursos
  resources: {
    ship: string;
    shipClass: string;
    combatRating: number;
    crew: number;
    informants: string[];
    trackingTech: string[];
  };
  
  // Contratos activos
  activeContracts: {
    targetId: string;
    targetName: string;
    bountyAmount: number;
    deadline: number;
    conditions: string;
    progress: number;
    lastKnownLocation?: string;
  }[];
  
  // Tarifas
  rates: {
    standard: number; // Porcentaje del bounty
    rush: number;
    no_questions: number; // No pregunta por qué lo quieren
    guaranteed: number; // Paga incluso si falla
  };
  
  // Disponibilidad
  availability: {
    available: boolean;
    currentLocation: string;
    nextAvailable: number;
    queueLength: number;
  };
}

// ============================================
// SISTEMA DE RECOMPENSAS
// ============================================
export interface BountyContract {
  id: string;
  target: {
    type: 'player' | 'pirate' | 'smuggler' | 'traitor' | 'npc';
    id: string;
    name: string;
    description: string;
    
    // Inteligencia
    lastKnownLocation?: {
      systemId: string;
      coordinates: { x: number; y: number };
      timestamp: number;
      reliability: number;
    };
    
    // Capacidades
    threatLevel: number; // 0-10
    knownAssociates: string[];
    fleetComposition?: string[];
    knownWeaknesses: string[];
  };
  
  // Recompensa
  reward: {
    baseAmount: number;
    bonusConditions: { condition: string; bonus: number }[];
    total: number;
    
    // Forma de pago
    paymentType: 'credits' | 'items' | 'reputation' | 'favor';
    items?: string[];
  };
  
  // Condiciones
  conditions: {
    captureRequired: boolean;
    aliveRequired: boolean;
    proofRequired: 'body' | 'ship_debris' | 'video' | 'dna' | 'capture';
    timeLimit?: number;
    discretion: 'public' | 'confidential' | 'secret';
  };
  
  // Emisor
  issuer: {
    id: string;
    name: string;
    type: 'corporation' | 'government' | 'pirate_faction' | 'individual';
    reputation: number;
    paymentGuarantee: boolean;
  };
  
  // Cazadores
  hunters: {
    hunterId: string;
    status: 'assigned' | 'tracking' | 'engaged' | 'completed' | 'failed';
    progress: number;
    assignedAt: number;
  }[];
  
  // Estado
  status: 'open' | 'in_progress' | 'fulfilled' | 'expired' | 'cancelled';
  
  // Tiempos
  timing: {
    posted: number;
    expires?: number;
    completed?: number;
  };
  
  // Historial
  history: {
    attempts: number;
    failures: number;
    closeCalls: number;
    targetMoves: number;
  };
}

// ============================================
// AUTORIDADES Y POLICÍA
// ============================================
export interface LawEnforcement {
  factionId: string;
  factionName: string;
  jurisdiction: string[]; // Sistemas bajo su control
  
  // Recursos
  resources: {
    patrolShips: number;
    policeStations: string[];
    checkpoints: string[];
    detectives: number;
    informants: number;
  };
  
  // Capacidades
  capabilities: {
    scanTechnology: number; // 0-100
    databaseAccess: boolean;
    crossBorder: boolean;
    undercoverOps: boolean;
    bountyHiring: boolean;
  };
  
  // Prioridades
  priorities: {
    targetTypes: IllegalGoodType[];
    corruptionLevel: number; // 0-100 (alto = fácil sobornar)
    brutality: number; // 0-100
  };
  
  // Relación con jugador
  playerStanding: {
    wantedLevel: number; // 0-5 estrellas
    investigations: string[];
    warrants: string[];
    bribesAccepted: number;
    bribesFailed: number;
  };
}

// ============================================
// BIENES ILEGALES PREDEFINIDOS
// ============================================
export const ILLEGAL_GOODS: IllegalGood[] = [
  {
    id: 'good_stardust',
    name: 'Polvo de Estrella',
    type: 'narcotics',
    description: 'Sustancia psicoactiva derivada de nebulosas ionizadas',
    lore: 'Descubierta por mineros de nebulosa, esta sustancia crea alucinaciones vívidas del espacio profundo',
    legality: {
      status: 'heavily_monitored',
      jurisdictions: {
        'galactic_empire': 'banned',
        'frontier_territories': 'controlled',
        'pirate_zones': 'readily_available'
      },
      penalties: { fine: 50000, imprisonment: 3600, reputationLoss: 20, confiscation: true, execution: false }
    },
    value: { basePrice: 1000, blackMarketPrice: 5000, demand: 80, supply: 40, volatility: 60 },
    characteristics: { weight: 0.1, volume: 0.1, perishability: 0, traceability: 30, detectability: 40 },
    typicalRoutes: [
      { source: 'sys_nebula_fields', destination: 'sys_capitol_prime', profitMargin: 400, riskLevel: 70 }
    ],
    uses: { consumption: true, crafting: false, quest: true, special: ['recreational', 'religious'] }
  },
  {
    id: 'good_prototype_weapons',
    name: 'Prototipos de Armas Militares',
    type: 'weapons_banned',
    description: 'Armas experimentales no aprobadas por la Convención de Ginebra Espacial',
    lore: 'Tecnología militar de última generación que incluye armas de antimateria y nanodrones asesinos',
    legality: {
      status: 'death_penalty',
      jurisdictions: {
        'galactic_empire': 'death_penalty',
        'all': 'banned'
      },
      penalties: { fine: 1000000, imprisonment: 86400, reputationLoss: 100, confiscation: true, execution: true }
    },
    value: { basePrice: 50000, blackMarketPrice: 200000, demand: 60, supply: 10, volatility: 80 },
    characteristics: { weight: 50, volume: 20, perishability: 0, traceability: 80, detectability: 90 },
    typicalRoutes: [
      { source: 'sys_military_research', destination: 'sys_war_zones', profitMargin: 300, riskLevel: 95 }
    ],
    uses: { consumption: false, crafting: false, quest: true, special: ['terrorism', 'coup'] }
  },
  {
    id: 'good_ancient_artifacts',
    name: 'Artefactos Antiguos Robados',
    type: 'artifacts_stolen',
    description: 'Reliquias de civilizaciones extintas, de valor incalculable para coleccionistas',
    lore: 'Estos objetos provienen de ruinas protegidas y su venta es perseguida por conservacionistas',
    legality: {
      status: 'banned',
      jurisdictions: {
        'archaeological_protectorate': 'banned',
        'all': 'heavily_monitored'
      },
      penalties: { fine: 200000, imprisonment: 7200, reputationLoss: 40, confiscation: true, execution: false }
    },
    value: { basePrice: 100000, blackMarketPrice: 500000, demand: 90, supply: 5, volatility: 40 },
    characteristics: { weight: 5, volume: 2, perishability: 0, traceability: 60, detectability: 30 },
    typicalRoutes: [
      { source: 'sys_ruins_field', destination: 'sys_collector_haven', profitMargin: 400, riskLevel: 60 }
    ],
    uses: { consumption: false, crafting: false, quest: true, special: ['collection', 'research', 'power'] }
  },
  {
    id: 'good_ai_cores_black',
    name: 'Núcleos de IA Prohibidos',
    type: 'tech_forbidden',
    description: 'Inteligencias artificiales no registradas, capaces de hackeo cuántico',
    lore: 'IA desarrolladas en el mercado negro para fines ilícitos, prohibidas por el Consejo de Cibernética',
    legality: {
      status: 'banned',
      jurisdictions: {
        'all': 'banned'
      },
      penalties: { fine: 300000, imprisonment: 10800, reputationLoss: 50, confiscation: true, execution: false }
    },
    value: { basePrice: 20000, blackMarketPrice: 100000, demand: 70, supply: 20, volatility: 50 },
    characteristics: { weight: 2, volume: 1, perishability: 0, traceability: 90, detectability: 95 },
    typicalRoutes: [
      { source: 'sys_hacker_hideout', destination: 'sys_corporate_espionage', profitMargin: 400, riskLevel: 75 }
    ],
    uses: { consumption: false, crafting: true, quest: true, special: ['hacking', 'espionage', 'automation'] }
  }
];

// ============================================
// RECEPTADORES PREDEFINIDOS
// ============================================
export const FENCES: Fence[] = [
  {
    id: 'fence_the_cleaner',
    name: 'El Limpiador',
    codename: 'MR_CLEAN',
    location: {
      systemId: 'sys_neutral_zone',
      stationId: 'station_outlaw_haven',
      hidden: false,
      coordinates: { x: 100, y: -50 }
    },
    specialization: ['narcotics', 'weapons_banned', 'artifacts_stolen'],
    inventory: [],
    reputation: { trust: 60, dealsCompleted: 0, dealsFailed: 0, lastDeal: 0 },
    business: { maxDealValue: 500000, markup: 0.3, discountForTrusted: 0.15, paymentMethods: ['credits', 'barter'], creditLine: 100000 },
    security: { detectionRisk: 40, policeInfiltration: 20, informants: 30, bribesPaid: 50000, protectionFaction: 'red_harbor_syndicate' },
    contact: { method: 'direct', requirements: ['reputation_10'], introductionCost: 1000 }
  },
  {
    id: 'fence_ghost_broker',
    name: 'El Corredor Fantasma',
    codename: 'GHOST',
    location: {
      systemId: 'sys_hidden_sector',
      hidden: true
    },
    specialization: ['tech_forbidden', 'info_classified', 'weapons_banned'],
    inventory: [],
    reputation: { trust: 30, dealsCompleted: 0, dealsFailed: 0, lastDeal: 0 },
    business: { maxDealValue: 2000000, markup: 0.5, discountForTrusted: 0.25, paymentMethods: ['credits', 'favor'], creditLine: 0 },
    security: { detectionRisk: 10, policeInfiltration: 5, informants: 10, bribesPaid: 200000, protectionFaction: 'ghost_hand' },
    contact: { method: 'referral', requirements: ['reputation_50', 'referral_from_trusted'], introductionCost: 50000 }
  }
];

// ============================================
// CACERÍA DE RECOMPENSAS PREDEFINIDOS
// ============================================
export const BOUNTY_HUNTERS: BountyHunter[] = [
  {
    id: 'hunter_vex',
    name: 'Vex el Rastreador',
    codename: 'BLOODHOUND',
    reputation: { effectiveness: 85, lethality: 'dead_or_alive', integrity: 90, notoriety: 70 },
    specialization: {
      targetTypes: ['pirates', 'smugglers', 'escaped_convicts'],
      jurisdictions: ['sector_alpha', 'frontier_territories'],
      methods: ['tracking', 'ambush']
    },
    resources: { ship: 'Hunter_Interceptor_Mk3', shipClass: 'interceptor', combatRating: 75, crew: 3, informants: ['underworld_network', 'police_informant'], trackingTech: ['thermal_sensors', 'quantum_trace'] },
    activeContracts: [],
    rates: { standard: 0.2, rush: 0.3, no_questions: 0.25, guaranteed: 0.5 },
    availability: { available: true, currentLocation: 'sys_alpha_prime', nextAvailable: 0, queueLength: 2 }
  },
  {
    id: 'hunter_silence',
    name: 'Silencio',
    codename: 'VOID',
    reputation: { effectiveness: 95, lethality: 'dead_preferred', integrity: 40, notoriety: 90 },
    specialization: {
      targetTypes: ['traitors', 'war_criminals'],
      jurisdictions: ['all'],
      methods: ['infiltration', 'ambush']
    },
    resources: { ship: 'Stealth_Assassin_Craft', shipClass: 'stealth_corvette', combatRating: 90, crew: 1, informants: ['deep_cover_agents', 'hacker_network'], trackingTech: ['dna_tracker', 'psychic_amplifier'] },
    activeContracts: [],
    rates: { standard: 0.3, rush: 0.5, no_questions: 0.35, guaranteed: 0.8 },
    availability: { available: false, currentLocation: 'unknown', nextAvailable: Date.now() + 86400000, queueLength: 5 }
  }
];

// ============================================
// AUTORIDADES PREDEFINIDAS
// ============================================
export const LAW_ENFORCEMENT: LawEnforcement[] = [
  {
    factionId: 'galactic_police_force',
    factionName: 'Fuerza Policial Galáctica',
    jurisdiction: ['sys_alpha_prime', 'sys_beta_sector', 'sys_capitol_prime'],
    resources: { patrolShips: 500, policeStations: ['station_alpha_pd', 'station_capitol_pd'], checkpoints: ['checkpoint_1', 'checkpoint_2'], detectives: 200, informants: 1000 },
    capabilities: { scanTechnology: 80, databaseAccess: true, crossBorder: true, undercoverOps: true, bountyHiring: true },
    priorities: { targetTypes: ['weapons_banned', 'narcotics', 'slaves'], corruptionLevel: 20, brutality: 30 },
    playerStanding: { wantedLevel: 0, investigations: [], warrants: [], bribesAccepted: 0, bribesFailed: 0 }
  },
  {
    factionId: 'corporate_security',
    factionName: 'Seguridad Corporativa',
    jurisdiction: ['sys_tech_corridor', 'sys_research_alpha'],
    resources: { patrolShips: 300, policeStations: ['station_corp_security'], checkpoints: ['corp_gate_1'], detectives: 100, informants: 500 },
    capabilities: { scanTechnology: 95, databaseAccess: true, crossBorder: false, undercoverOps: true, bountyHiring: true },
    priorities: { targetTypes: ['tech_forbidden', 'info_classified'], corruptionLevel: 40, brutality: 20 },
    playerStanding: { wantedLevel: 0, investigations: [], warrants: [], bribesAccepted: 0, bribesFailed: 0 }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateSmugglingRisk(
  good: IllegalGood,
  route: string[],
  concealment: number
): { detectionChance: number; profitPotential: number; riskLevel: string } {
  const baseDetection = good.characteristics.detectability;
  const routeRisk = route.length * 5; // 5% por sistema
  const concealmentBonus = concealment * 0.5;
  
  const detectionChance = Math.min(95, Math.max(5, baseDetection + routeRisk - concealmentBonus));
  const profitPotential = (good.value.blackMarketPrice / good.value.basePrice) * 100;
  
  let riskLevel = 'low';
  if (detectionChance > 70) riskLevel = 'extreme';
  else if (detectionChance > 50) riskLevel = 'high';
  else if (detectionChance > 30) riskLevel = 'medium';
  
  return { detectionChance, profitPotential, riskLevel };
}

export function getFenceByLocation(systemId: string): Fence | undefined {
  return FENCES.find(f => f.location.systemId === systemId);
}

export function getAvailableMercenaries(): BountyHunter[] {
  return BOUNTY_HUNTERS.filter(h => h.availability.available);
}

export function calculateBountyHunterSuccess(
  hunter: BountyHunter,
  target: { threatLevel: number; lastKnownLocation?: string }
): { successChance: number; estimatedTime: number; cost: number } {
  const effectiveness = hunter.reputation.effectiveness;
  const threat = target.threatLevel * 10;
  const successChance = Math.min(95, Math.max(10, effectiveness - threat + (Math.random() * 20 - 10)));
  
  const estimatedTime = (100 - effectiveness) * 3600; // segundos
  const baseCost = target.threatLevel * 10000;
  const cost = baseCost * (1 + hunter.rates.standard);
  
  return { successChance, estimatedTime, cost };
}

export const BlackMarketSystem = {
  ILLEGAL_GOODS,
  FENCES,
  BOUNTY_HUNTERS,
  LAW_ENFORCEMENT,
  calculateSmugglingRisk,
  getFenceByLocation,
  getAvailableMercenaries,
  calculateBountyHunterSuccess
};
