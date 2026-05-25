/**
 * SISTEMA DE PIRATERÍA - GALAXY ONLINE II
 * NPCs piratas, banderas, saqueos, escondites, patrullas
 */

// ============================================
// TIPOS DE PIRATAS
// ============================================
export type PirateType = 
  | 'raider'      // Incursor rápido
  | 'marauder'    // Saqueador
  | 'buccaneer'   // Bucanero oportunista
  | 'corsair'     // Corsario organizado
  | 'freebooter'  // Aventurero independiente
  | 'privateer'   // Corsario con patente
  | 'warlord';    // Señor de la guerra pirata

export type PirateFleetSize = 
  | 'scout'       // 1-3 naves
  | 'small'       // 4-10 naves
  | 'medium'      // 11-25 naves
  | 'large'       // 26-50 naves
  | 'armada'      // 50+ naves
  | 'flotilla';   // Móvil, se mueve entre sistemas

// ============================================
// PIRATAS NPC
// ============================================
export interface PirateNPC {
  id: string;
  name: string;
  type: PirateType;
  
  // Facción pirata
  faction: {
    id: string;
    name: string;
    symbol: string;
    colors: { primary: string; secondary: string };
    reputation: number; // -100 (odiado) a 100 (respetado)
  };
  
  // Flota
  fleet: {
    size: PirateFleetSize;
    shipClasses: string[];
    flagship: string;
    commander: string;
    commanderStats: {
      cunning: number;
      ferocity: number;
      leadership: number;
      luck: number;
    };
  };
  
  // Territorio
  territory: {
    homeSystem: string;
    controlledSystems: string[];
    hideouts: PirateHideout[];
    patrolRoutes: PatrolRoute[];
    influenceRadius: number;
  };
  
  // Comportamiento
  behavior: {
    aggression: number;      // 0-100
    cunning: number;       // 0-100
    greed: number;         // 0-100
    honor: number;        // 0-100 (piratas con código)
    paranoia: number;     // 0-100
  };
  
  // Patrones de ataque
  attackPatterns: {
    preferredTargets: string[];
    avoidedTargets: string[];
    raidFrequency: number; // horas entre raids
    preferredTradeRoutes: string[];
    lastRaid: number;
  };
  
  // Botín acumulado
  accumulatedLoot: {
    credits: number;
    metal: number;
    plasma: number;
    items: string[];
    ships: string[];
  };
  
  // Relación con jugador
  playerRelation: {
    standing: number; // -100 a 100
    truceActive: boolean;
    truceExpiresAt?: number;
    bribeAmount?: number;
    lastInteraction: number;
  };
  
  // Bounty
  bounty: {
    issuer: string;
    amount: number;
    conditions: string;
    claimed: boolean;
  };
}

// ============================================
// ESCONDITES PIRATAS
// ============================================
export interface PirateHideout {
  id: string;
  name: string;
  
  // Ubicación
  location: {
    systemId: string;
    coordinates: { x: number; y: number; z: number };
    hidden: boolean;
    discoveryChance: number; // 0-1
  };
  
  // Tipo de escondite
  type: 'asteroid_base' | 'derelict_station' | 'nebula_outpost' | 'moon_cave' | 'hidden_fleet';
  
  // Seguridad
  security: {
    level: number; // 1-10
    defenses: string[];
    patrols: number;
    detectionRange: number;
    escapeRoutes: number;
  };
  
  // Capacidades
  facilities: {
    repair: boolean;
    refuel: boolean;
    trade: boolean;
    recruitment: boolean;
    intel: boolean;
    storage: number; // capacidad
  };
  
  // Economía
  economy: {
    fence: boolean; // Puede vender botín robado
    prices: 'low' | 'normal' | 'high';
    specialGoods: string[];
  };
  
  // Dueño
  owner: {
    pirateId: string;
    factionId: string;
    protectionFee: number; // para visitantes
  };
  
  // Estado
  status: 'active' | 'under_attack' | 'evacuating' | 'destroyed' | 'relocated';
  
  // Descubrimiento
  discovery: {
    discovered: boolean;
    discoveredBy: string[];
    lastVisited: number;
  };
}

// ============================================
// RUTAS DE PATRULLA
// ============================================
export interface PatrolRoute {
  id: string;
  name: string;
  
  // Ruta
  waypoints: {
    systemId: string;
    waitTime: number; // segundos
    patrolRadius: number;
  }[];
  
  // Frecuencia
  schedule: {
    interval: number; // segundos entre patrullas
    variance: number; // +/- segundos aleatorios
    lastPatrol: number;
    nextPatrol: number;
  };
  
  // Flota asignada
  assignedFleet: {
    size: PirateFleetSize;
    shipClasses: string[];
    commander: string;
  };
  
  // Comportamiento
  behavior: {
    aggressive: boolean;
    chaseDistance: number;
    fleeThreshold: number; // % de salud para huir
  };
  
  // Prioridades
  priorities: {
    tradeRoutes: boolean;
    miningOps: boolean;
    transports: boolean;
    warships: boolean;
  };
}

// ============================================
// SAQUEOS Y ATAQUES
// ============================================
export interface Raid {
  id: string;
  type: 'trade_intercept' | 'mining_raid' | 'base_assault' | 'convoy_ambush' | 'hit_and_run';
  
  // Atacante
  attacker: {
    pirateId: string;
    factionId: string;
    fleet: string[];
    commander: string;
  };
  
  // Objetivo
  target: {
    type: 'player' | 'corporation' | 'npc';
    id: string;
    location: { systemId: string; coordinates: { x: number; y: number } };
    valueEstimate: number;
    defenseStrength: number;
  };
  
  // Estado
  status: 'planning' | 'approaching' | 'engaged' | 'looting' | 'withdrawing' | 'completed' | 'failed';
  
  // Fases
  phases: {
    current: string;
    history: { phase: string; startedAt: number; endedAt?: number }[];
  };
  
  // Botín
  loot: {
    estimated: number;
    actual: number;
    items: string[];
    ships: string[];
    capturedPersonnel: number;
  };
  
  // Daños
  damage: {
    attacker: { shipsLost: number; damageTaken: number };
    defender: { shipsLost: number; damageTaken: number; facilitiesDamaged: string[] };
  };
  
  // Tiempo
  timing: {
    startedAt: number;
    expectedDuration: number;
    actualDuration?: number;
  };
}

// ============================================
// SISTEMA DE PATENTES DE CORREO
// ============================================
export interface LetterOfMarque {
  id: string;
  issuer: {
    entityId: string;
    entityName: string;
    type: 'corporation' | 'alliance' | 'government';
  };
  
  // Titular
  holder: {
    playerId: string;
    playerName: string;
  };
  
  // Términos
  terms: {
    targetEntities: string[]; // A quiénes puede atacar
    allowedActions: ('raid' | 'pillage' | 'blockade' | 'capture')[];
    restrictedTargets: string[]; // No puede atacar
    revenueShare: number; // Porcentaje para el emisor
  };
  
  // Duración
  duration: {
    issuedAt: number;
    expiresAt: number;
    renewable: boolean;
    renewalCost: number;
  };
  
  // Beneficios
  benefits: {
    legalProtection: boolean;
    portAccess: string[];
    bountyExemption: boolean;
    reputationBonus: number;
  };
  
  // Requisitos de mantenimiento
  requirements: {
    minRaidsPerMonth: number;
    revenueTarget: number;
    shipsDestroyed: number;
  };
  
  // Estado
  status: 'active' | 'suspended' | 'expired' | 'revoked' | 'completed';
  
  // Historial de cumplimiento
  compliance: {
    raidsCompleted: number;
    revenueGenerated: number;
    shipsDestroyed: number;
    warnings: number;
  };
}

// ============================================
// CACERÍA DE RECOMPENSAS
// ============================================
export interface Bounty {
  id: string;
  target: {
    type: 'pirate' | 'player' | 'corporation';
    id: string;
    name: string;
    dangerLevel: number; // 1-10
  };
  
  // Recompensa
  reward: {
    credits: number;
    items: string[];
    reputation: number;
    exclusiveReward?: string;
  };
  
  // Emisor
  issuer: {
    id: string;
    name: string;
    type: 'player' | 'corporation' | 'government' | 'pirate_faction';
  };
  
  // Condiciones
  conditions: {
    aliveRequired: boolean;
    proofRequired: 'ship_destruction' | 'capture' | 'death';
    timeLimit?: number;
    locationRestriction?: string[];
  };
  
  // Información
  intel: {
    lastKnownLocation?: { systemId: string; timestamp: number };
    fleetComposition?: string[];
    weaknesses?: string[];
    knownAssociates?: string[];
    accuracy: number; // 0-100
  };
  
  // Estado
  status: 'open' | 'claimed' | 'expired' | 'cancelled';
  
  // Competencia
  hunters: {
    playerId: string;
    claimed: boolean;
    claimedAt?: number;
  }[];
  
  // Tiempo
  timing: {
    postedAt: number;
    expiresAt?: number;
    claimedAt?: number;
  };
}

// ============================================
// DEFENSA CONTRA PIRATAS
// ============================================
export interface AntiPiracyMeasures {
  // Escoltas
  escorts: {
    enabled: boolean;
    fleetSize: number;
    shipClasses: string[];
    autoEngage: boolean;
    costPerTrip: number;
  };
  
  // Convoyes
  convoySystem: {
    enabled: boolean;
    minShips: number;
    maxShips: number;
    bonusDefense: number;
    speedPenalty: number;
  };
  
  // Ruta segura
  safeRouting: {
    enabled: boolean;
    avoidPirateSystems: boolean;
    avoidHighRiskRoutes: boolean;
    maxDetourDistance: number;
  };
  
  // Contramedidas
  countermeasures: {
    decoyTransponders: boolean;
    stealthCoating: boolean;
    jammers: boolean;
    mines: boolean;
    turrets: boolean;
  };
  
  // Seguros
  insurance: {
    enabled: boolean;
    coverage: number; // porcentaje
    premium: number;
    deductible: number;
  };
  
  // Patentes
  letterOfMarque?: LetterOfMarque;
}

// ============================================
// PIRATAS PREDEFINIDOS
// ============================================
export const PIRATE_FACTIONS: PirateNPC[] = [
  {
    id: 'pirate_red_harbor',
    name: 'Capitán Vorath',
    type: 'warlord',
    faction: {
      id: 'faction_red_harbor',
      name: 'Hermandad del Puerto Rojo',
      symbol: 'skull_crossed_sabers',
      colors: { primary: '#8B0000', secondary: '#FFD700' },
      reputation: 75
    },
    fleet: {
      size: 'armada',
      shipClasses: ['battleship_pirate', 'cruiser_pirate', 'frigate_pirate'],
      flagship: 'Red_Harbor_Dreadnought',
      commander: 'Capitán Vorath',
      commanderStats: { cunning: 85, ferocity: 90, leadership: 95, luck: 60 }
    },
    territory: {
      homeSystem: 'sys_nebula_x7',
      controlledSystems: ['sys_nebula_x7', 'sys_asteroid_belt_3', 'sys_derelict_zone'],
      hideouts: [],
      patrolRoutes: [],
      influenceRadius: 50
    },
    behavior: { aggression: 85, cunning: 80, greed: 70, honor: 30, paranoia: 40 },
    attackPatterns: {
      preferredTargets: ['trade_convoys', 'mining_operations', 'weak_military'],
      avoidedTargets: ['heavy_escorts', 'capitals', 'known_dangerous'],
      raidFrequency: 12,
      preferredTradeRoutes: ['route_alpha_prime', 'route_metal_run'],
      lastRaid: 0
    },
    accumulatedLoot: { credits: 5000000, metal: 200000, plasma: 50000, items: [], ships: [] },
    playerRelation: { standing: -50, truceActive: false, lastInteraction: 0 },
    bounty: { issuer: 'galactic_trade_union', amount: 1000000, conditions: 'Kill or capture', claimed: false }
  },
  {
    id: 'pirate_ghost_hand',
    name: 'El Fantasma',
    type: 'corsair',
    faction: {
      id: 'faction_ghost_hand',
      name: 'Mano Fantasma',
      symbol: 'ghost_fist',
      colors: { primary: '#2F4F4F', secondary: '#00CED1' },
      reputation: 45
    },
    fleet: {
      size: 'medium',
      shipClasses: ['cruiser_stealth', 'frigate_stealth'],
      flagship: 'Ghost_Touch',
      commander: 'El Fantasma',
      commanderStats: { cunning: 95, ferocity: 50, leadership: 70, luck: 80 }
    },
    territory: {
      homeSystem: 'sys_dark_matter_field',
      controlledSystems: ['sys_dark_matter_field'],
      hideouts: [],
      patrolRoutes: [],
      influenceRadius: 30
    },
    behavior: { aggression: 40, cunning: 95, greed: 80, honor: 60, paranoia: 70 },
    attackPatterns: {
      preferredTargets: ['rich_merchants', 'tech_shipments', 'isolated_travelers'],
      avoidedTargets: ['military_convoys', 'groups'],
      raidFrequency: 24,
      preferredTradeRoutes: ['route_tech_corridor'],
      lastRaid: 0
    },
    accumulatedLoot: { credits: 800000, metal: 30000, plasma: 8000, items: [], ships: [] },
    playerRelation: { standing: 0, truceActive: false, lastInteraction: 0 },
    bounty: { issuer: 'tech_corporation', amount: 400000, conditions: 'Capture preferred', claimed: false }
  },
  {
    id: 'pirate_iron_jaw',
    name: 'Korg el Destripador',
    type: 'marauder',
    faction: {
      id: 'faction_iron_jaw',
      name: 'Mandíbula de Hierro',
      symbol: 'broken_chain',
      colors: { primary: '#696969', secondary: '#DC143C' },
      reputation: 30
    },
    fleet: {
      size: 'large',
      shipClasses: ['battleship_brutal', 'cruiser_brutal', 'destroyer_brutal'],
      flagship: 'Iron_Maw',
      commander: 'Korg',
      commanderStats: { cunning: 30, ferocity: 100, leadership: 60, luck: 40 }
    },
    territory: {
      homeSystem: 'sys_battlefield_remnants',
      controlledSystems: ['sys_battlefield_remnants', 'sys_wreckage_field'],
      hideouts: [],
      patrolRoutes: [],
      influenceRadius: 40
    },
    behavior: { aggression: 100, cunning: 20, greed: 60, honor: 10, paranoia: 20 },
    attackPatterns: {
      preferredTargets: ['anything_moving', 'military_targets', 'bases'],
      avoidedTargets: ['overwhelming_force'],
      raidFrequency: 8,
      preferredTradeRoutes: ['all_routes'],
      lastRaid: 0
    },
    accumulatedLoot: { credits: 2000000, metal: 100000, plasma: 20000, items: [], ships: [] },
    playerRelation: { standing: -80, truceActive: false, lastInteraction: 0 },
    bounty: { issuer: 'military_command', amount: 750000, conditions: 'Dead preferred', claimed: false }
  }
];

// ============================================
// RIESGO PIRATA POR SECTOR
// ============================================
export interface PirateRiskZone {
  systemId: string;
  riskLevel: 'safe' | 'low' | 'moderate' | 'high' | 'extreme';
  
  // Factores
  factors: {
    piratePresence: boolean;
    pirateFactions: string[];
    recentRaids: number;
    distanceToHideout: number;
    tradeRouteDensity: number;
    militaryPresence: number;
  };
  
  // Estadísticas
  stats: {
    raidsLastMonth: number;
    shipsLost: number;
    cargoStolen: number;
    bountiesPaid: number;
  };
  
  // Recomendaciones
  recommendations: {
    minEscort: number;
    avoidNight?: boolean;
    convoyRecommended: boolean;
    insuranceRequired: boolean;
  };
}

export const PIRATE_RISK_ZONES: PirateRiskZone[] = [
  {
    systemId: 'sys_alpha_prime',
    riskLevel: 'safe',
    factors: {
      piratePresence: false,
      pirateFactions: [],
      recentRaids: 0,
      distanceToHideout: 100,
      tradeRouteDensity: 10,
      militaryPresence: 90
    },
    stats: { raidsLastMonth: 0, shipsLost: 0, cargoStolen: 0, bountiesPaid: 0 },
    recommendations: { minEscort: 0, convoyRecommended: false, insuranceRequired: false }
  },
  {
    systemId: 'sys_nebula_x7',
    riskLevel: 'extreme',
    factors: {
      piratePresence: true,
      pirateFactions: ['faction_red_harbor'],
      recentRaids: 15,
      distanceToHideout: 0,
      tradeRouteDensity: 8,
      militaryPresence: 10
    },
    stats: { raidsLastMonth: 45, shipsLost: 23, cargoStolen: 5000000, bountiesPaid: 100000 },
    recommendations: { minEscort: 10, convoyRecommended: true, insuranceRequired: true }
  },
  {
    systemId: 'sys_asteroid_belt_3',
    riskLevel: 'high',
    factors: {
      piratePresence: true,
      pirateFactions: ['faction_red_harbor'],
      recentRaids: 8,
      distanceToHideout: 5,
      tradeRouteDensity: 6,
      militaryPresence: 20
    },
    stats: { raidsLastMonth: 24, shipsLost: 12, cargoStolen: 2000000, bountiesPaid: 50000 },
    recommendations: { minEscort: 6, convoyRecommended: true, insuranceRequired: true }
  },
  {
    systemId: 'sys_tech_corridor',
    riskLevel: 'moderate',
    factors: {
      piratePresence: true,
      pirateFactions: ['faction_ghost_hand'],
      recentRaids: 3,
      distanceToHideout: 25,
      tradeRouteDensity: 9,
      militaryPresence: 50
    },
    stats: { raidsLastMonth: 8, shipsLost: 4, cargoStolen: 800000, bountiesPaid: 20000 },
    recommendations: { minEscort: 3, convoyRecommended: true, insuranceRequired: false }
  }
];

// ============================================
// ECONOMÍA PIRATA
// ============================================
export interface PirateEconomy {
  // Mercado negro
  blackMarket: {
    available: boolean;
    location: string;
    goods: {
      id: string;
      name: string;
      type: 'stolen' | 'illegal' | 'contraband';
      basePrice: number;
      piratePrice: number; // más bajo
      quantity: number;
      seller: string;
    }[];
    reputationRequired: number;
    riskOfDiscovery: number;
  };
  
  // Receptadores
  fences: {
    id: string;
    name: string;
    location: string;
    specialization: string[];
    prices: 'low' | 'fair' | 'high';
    trustLevel: number;
    policeRisk: number;
  }[];
  
  // Servicios
  services: {
    shipRepair: { available: boolean; costMultiplier: number };
    refueling: { available: boolean; costMultiplier: number };
    crewRecruitment: { available: boolean; quality: 'low' | 'medium' | 'high' };
    intel: { available: boolean; cost: number; reliability: number };
    forgedDocuments: { available: boolean; cost: number; detectionRisk: number };
  };
  
  // Ransom y extorsión
  extortion: {
    ransomRates: { ship: number; captain: number; cargo: number };
    protectionRackets: { systemId: string; cost: number; protection: boolean }[];
  };
}

// ============================================
// HELPERS
// ============================================
export function calculateRaidSuccess(
  pirate: PirateNPC,
  target: { defenseStrength: number; escortSize: number }
): { successChance: number; expectedLoot: number; riskToPirate: number } {
  const pirateStrength = pirate.fleet.size === 'armada' ? 100 :
                          pirate.fleet.size === 'large' ? 70 :
                          pirate.fleet.size === 'medium' ? 50 : 30;
  
  const totalPiratePower = pirateStrength * (pirate.behavior.aggression / 100) * (pirate.fleet.commanderStats.cunning / 100);
  const totalTargetPower = target.defenseStrength + (target.escortSize * 5);
  
  const powerRatio = totalPiratePower / (totalTargetPower || 1);
  const baseSuccess = Math.min(0.9, Math.max(0.1, powerRatio * 0.5));
  
  const luckFactor = (Math.random() * 0.2) - 0.1;
  const successChance = Math.max(0.05, Math.min(0.95, baseSuccess + luckFactor));
  
  const expectedLoot = successChance * target.defenseStrength * 1000;
  const riskToPirate = (1 - successChance) * 0.3;
  
  return { successChance, expectedLoot, riskToPirate };
}

export function getPirateRisk(systemId: string): PirateRiskZone | undefined {
  return PIRATE_RISK_ZONES.find(z => z.systemId === systemId);
}

export function getPiratesInSystem(systemId: string): PirateNPC[] {
  return PIRATE_FACTIONS.filter(p => 
    p.territory.controlledSystems.includes(systemId) ||
    p.territory.homeSystem === systemId
  );
}

export function calculateBountyValue(
  pirate: PirateNPC,
  includeLoot: boolean
): number {
  let baseValue = pirate.bounty.amount;
  
  if (includeLoot) {
    baseValue += pirate.accumulatedLoot.credits * 0.1;
    baseValue += pirate.accumulatedLoot.metal * 0.5;
    baseValue += pirate.accumulatedLoot.plasma * 2;
  }
  
  // Modificadores
  if (pirate.behavior.aggression > 80) baseValue *= 1.5;
  if (pirate.fleet.size === 'armada') baseValue *= 3;
  else if (pirate.fleet.size === 'large') baseValue *= 2;
  
  return Math.floor(baseValue);
}

export const PiracySystem = {
  PIRATE_FACTIONS,
  PIRATE_RISK_ZONES,
  calculateRaidSuccess,
  getPirateRisk,
  getPiratesInSystem,
  calculateBountyValue
};
