/**
 * SISTEMA DE RECOLECCIÓN DE RECURSOS - GALAXY ONLINE II
 * Planetas de recursos, minas, extracción y competencia por recursos
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS DE PLANETAS DE RECURSOS
// ============================================
export type ResourcePlanetType = 
  | 'asteroid_belt'      // Cinturón de asteroides
  | 'gas_cloud'          // Nube de gas
  | 'debris_field'       // Campo de escombros
  | 'mining_colony'      // Colonia minera abandonada
  | 'crystal_formation'  // Formación de cristales
  | 'ancient_ruins'      // Ruinas antiguas con recursos
  | 'nebula_cloud';      // Nebulosa rica en plasma

export type ResourcePlanetTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ResourceRichness = 'poor' | 'common' | 'rich' | 'abundant' | 'legendary';

// ============================================
// PLANETA DE RECURSOS
// ============================================
export interface ResourceDeposit {
  type: ResourceKey;
  amount: number;
  extractionRate: number; // Por hora
  quality: number; // 1-100, afecta valor
  depth: number; // Profundidad, afecta dificultad
}

export interface ResourcePlanet {
  id: string;
  name: string;
  type: ResourcePlanetType;
  tier: ResourcePlanetTier;
  
  // Ubicación
  coordinates: {
    galaxy: number;
    system: number;
    sector: string;
  };
  
  // Recursos
  deposits: ResourceDeposit[];
  totalResources: number;
  remainingResources: number;
  richness: ResourceRichness;
  
  // Estado
  discoveredAt: number;
  lastMinedAt?: number;
  isDepleted: boolean;
  regenerationRate?: number; // Si regenera
  
  // Seguridad
  isContested?: boolean;
  controllingCorp?: string;
  protectionTime?: number; // Tiempo de protección post-descubrimiento
  
  // Peligros
  hazards: {
    pirates: boolean;
    environment: boolean; // Radiación, tormentas
    competition: boolean; // Otros jugadores
    defenseSystems: boolean; // Sistemas defensivos antiguos
  };
  
  // Requisitos
  requirements: {
    minLevel: number;
    minFleetPower: number;
    miningTechnology: number;
    shipType: string[]; // Tipos de naves mineras permitidas
  };
  
  // Bonificaciones
  bonuses: {
    extractionSpeed: number;
    yieldBonus: number;
    critChance: number;
    rareFindChance: number;
  };
  
  // Metadatos
  description: string;
  icon: string;
  color: string;
}

// ============================================
// CONFIGURACIÓN DE PLANETAS POR TIPO
// ============================================
export const RESOURCE_PLANET_TYPES: Record<ResourcePlanetType, {
  name: string;
  description: string;
  primaryResource: ResourceKey;
  secondaryResources: ResourceKey[];
  baseYield: number;
  hazardLevel: 1 | 2 | 3 | 4 | 5;
  icon: string;
  color: string;
}> = {
  asteroid_belt: {
    name: 'Cinturón de Asteroides',
    description: 'Cinturón denso de asteroides ricos en minerales.',
    primaryResource: 'metal',
    secondaryResources: ['credits'],
    baseYield: 1000,
    hazardLevel: 2,
    icon: '☄️',
    color: '#8B4513'
  },
  
  gas_cloud: {
    name: 'Nube de Gas',
    description: 'Nube cósmica rica en plasma energético.',
    primaryResource: 'plasma',
    secondaryResources: ['energy'],
    baseYield: 800,
    hazardLevel: 3,
    icon: '☁️',
    color: '#00CED1'
  },
  
  debris_field: {
    name: 'Campo de Escombros',
    description: 'Restos de batallas pasadas, ricos en metal reciclable.',
    primaryResource: 'metal',
    secondaryResources: ['credits', 'energy'],
    baseYield: 600,
    hazardLevel: 4,
    icon: '🔧',
    color: '#696969'
  },
  
  mining_colony: {
    name: 'Colonia Minera',
    description: 'Colonia minera abandonada con infraestructura intacta.',
    primaryResource: 'metal',
    secondaryResources: ['plasma', 'credits'],
    baseYield: 1500,
    hazardLevel: 3,
    icon: '⛏️',
    color: '#D2691E'
  },
  
  crystal_formation: {
    name: 'Formación de Cristales',
    description: 'Cristales energéticos de alta pureza.',
    primaryResource: 'energy',
    secondaryResources: ['credits', 'plasma'],
    baseYield: 1200,
    hazardLevel: 4,
    icon: '💎',
    color: '#E91E63'
  },
  
  ancient_ruins: {
    name: 'Ruinas Antiguas',
    description: 'Ruinas de civilización antigua con tecnología valiosa.',
    primaryResource: 'credits',
    secondaryResources: ['metal', 'plasma', 'energy'],
    baseYield: 2000,
    hazardLevel: 5,
    icon: '🏛️',
    color: '#FFD700'
  },
  
  nebula_cloud: {
    name: 'Nebulosa',
    description: 'Nebulosa rica en plasma y partículas exóticas.',
    primaryResource: 'plasma',
    secondaryResources: ['energy'],
    baseYield: 900,
    hazardLevel: 4,
    icon: '🌌',
    color: '#9C27B0'
  }
};

// ============================================
// CONFIGURACIÓN POR NIVEL (TIER)
// ============================================
export const RESOURCE_PLANET_TIERS: Record<ResourcePlanetTier, {
  name: string;
  yieldMultiplier: number;
  hazardMultiplier: number;
  minLevel: number;
  minFleetPower: number;
  maxMiners: number;
  protectionHours: number;
  rarity: ResourceRichness;
}> = {
  1: { name: 'Tier I - Básico', yieldMultiplier: 1.0, hazardMultiplier: 1.0, minLevel: 1, minFleetPower: 10000, maxMiners: 5, protectionHours: 0, rarity: 'poor' },
  2: { name: 'Tier II - Simple', yieldMultiplier: 1.5, hazardMultiplier: 1.2, minLevel: 5, minFleetPower: 50000, maxMiners: 8, protectionHours: 2, rarity: 'common' },
  3: { name: 'Tier III - Moderado', yieldMultiplier: 2.0, hazardMultiplier: 1.4, minLevel: 10, minFleetPower: 100000, maxMiners: 10, protectionHours: 4, rarity: 'common' },
  4: { name: 'Tier IV - Avanzado', yieldMultiplier: 2.5, hazardMultiplier: 1.6, minLevel: 15, minFleetPower: 250000, maxMiners: 12, protectionHours: 6, rarity: 'rich' },
  5: { name: 'Tier V - Experto', yieldMultiplier: 3.0, hazardMultiplier: 1.8, minLevel: 20, minFleetPower: 500000, maxMiners: 15, protectionHours: 8, rarity: 'rich' },
  6: { name: 'Tier VI - Elite', yieldMultiplier: 4.0, hazardMultiplier: 2.0, minLevel: 25, minFleetPower: 1000000, maxMiners: 18, protectionHours: 12, rarity: 'abundant' },
  7: { name: 'Tier VII - Maestro', yieldMultiplier: 5.0, hazardMultiplier: 2.2, minLevel: 30, minFleetPower: 2000000, maxMiners: 20, protectionHours: 18, rarity: 'abundant' },
  8: { name: 'Tier VIII - Legendario', yieldMultiplier: 6.0, hazardMultiplier: 2.5, minLevel: 35, minFleetPower: 5000000, maxMiners: 25, protectionHours: 24, rarity: 'legendary' },
  9: { name: 'Tier IX - Mítico', yieldMultiplier: 8.0, hazardMultiplier: 3.0, minLevel: 40, minFleetPower: 10000000, maxMiners: 30, protectionHours: 48, rarity: 'legendary' },
  10: { name: 'Tier X - Divino', yieldMultiplier: 10.0, hazardMultiplier: 4.0, minLevel: 50, minFleetPower: 50000000, maxMiners: 50, protectionHours: 72, rarity: 'legendary' }
};

// ============================================
// NAVES MINERAS
// ============================================
export interface MiningShip {
  id: string;
  name: string;
  type: string;
  
  // Stats de minería
  extractionRate: number; // Recursos por hora
  cargoCapacity: number; // Capacidad de carga
  miningLaserPower: number; // Afecta velocidad
  scanningRange: number; // Detectar depósitos
  
  // Defensa
  hull: number;
  shield: number;
  evasion: number;
  
  // Eficiencia por recurso
  efficiency: Record<ResourceKey, number>;
  
  // Costo
  cost: {
    metal: number;
    plasma: number;
    credits: number;
    buildTime: number;
  };
  
  // Requisitos
  requirements: {
    shipyardLevel: number;
    researchLevel: number;
  };
  
  description: string;
  icon: string;
}

export const MINING_SHIPS: MiningShip[] = [
  {
    id: 'mining_ship_t1',
    name: 'Extractor Básico',
    type: 'mining_frigate',
    extractionRate: 100,
    cargoCapacity: 5000,
    miningLaserPower: 10,
    scanningRange: 50,
    hull: 500,
    shield: 200,
    evasion: 20,
    efficiency: { metal: 1.0, plasma: 0.8, credits: 0.5, energy: 0.6 },
    cost: { metal: 10000, plasma: 5000, credits: 5000, buildTime: 3600 },
    requirements: { shipyardLevel: 3, researchLevel: 5 },
    description: 'Nave minera básica para operaciones simples.',
    icon: '🚀'
  },
  {
    id: 'mining_ship_t2',
    name: 'Cosechador Industrial',
    type: 'mining_cruiser',
    extractionRate: 300,
    cargoCapacity: 15000,
    miningLaserPower: 25,
    scanningRange: 100,
    hull: 1500,
    shield: 800,
    evasion: 15,
    efficiency: { metal: 1.2, plasma: 1.0, credits: 0.8, energy: 0.9 },
    cost: { metal: 50000, plasma: 25000, credits: 25000, buildTime: 7200 },
    requirements: { shipyardLevel: 5, researchLevel: 10 },
    description: 'Nave de minería industrial con mejor capacidad.',
    icon: '🛸'
  },
  {
    id: 'mining_ship_t3',
    name: 'Mega-Extractor',
    type: 'mining_battleship',
    extractionRate: 800,
    cargoCapacity: 50000,
    miningLaserPower: 60,
    scanningRange: 200,
    hull: 5000,
    shield: 3000,
    evasion: 10,
    efficiency: { metal: 1.5, plasma: 1.3, credits: 1.0, energy: 1.2 },
    cost: { metal: 200000, plasma: 100000, credits: 100000, buildTime: 14400 },
    requirements: { shipyardLevel: 8, researchLevel: 15 },
    description: 'Nave minera masiva para operaciones a gran escala.',
    icon: '🌑'
  },
  {
    id: 'mining_ship_special',
    name: 'Explorador de Nebulosas',
    type: 'specialized_gas',
    extractionRate: 400,
    cargoCapacity: 20000,
    miningLaserPower: 40,
    scanningRange: 300,
    hull: 2000,
    shield: 4000,
    evasion: 30,
    efficiency: { metal: 0.5, plasma: 2.0, credits: 0.7, energy: 1.5 },
    cost: { metal: 150000, plasma: 150000, credits: 75000, buildTime: 18000 },
    requirements: { shipyardLevel: 7, researchLevel: 20 },
    description: 'Especializada en extracción de plasma de nebulosas.',
    icon: '☁️'
  },
  {
    id: 'mining_ship_ancient',
    name: 'Excavador de Ruinas',
    type: 'specialized_salvage',
    extractionRate: 200,
    cargoCapacity: 10000,
    miningLaserPower: 80,
    scanningRange: 250,
    hull: 3000,
    shield: 1500,
    evasion: 25,
    efficiency: { metal: 1.0, plasma: 0.8, credits: 2.5, energy: 1.0 },
    cost: { metal: 250000, plasma: 100000, credits: 200000, buildTime: 21600 },
    requirements: { shipyardLevel: 10, researchLevel: 25 },
    description: 'Especializado en recuperar tesoros de ruinas antiguas.',
    icon: '🏛️'
  }
];

// ============================================
// TECNOLOGÍAS DE MINERÍA
// ============================================
export interface MiningTechnology {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  
  effects: {
    extractionSpeed?: number; // % bonus
    cargoCapacity?: number;
    scanningRange?: number;
    hazardResistance?: number;
    rareFindChance?: number;
    efficiency?: Record<ResourceKey, number>;
  };
  
  cost: {
    metal: number;
    plasma: number;
    credits: number;
    time: number;
  };
}

export const MINING_TECHNOLOGIES: MiningTechnology[] = [
  {
    id: 'tech_laser_mining',
    name: 'Láseres de Minería',
    description: 'Mejora la velocidad de extracción.',
    level: 1,
    maxLevel: 20,
    effects: { extractionSpeed: 5 }, // +5% por nivel
    cost: { metal: 10000, plasma: 5000, credits: 5000, time: 3600 }
  },
  {
    id: 'tech_cargo_optimization',
    name: 'Optimización de Carga',
    description: 'Aumenta la capacidad de carga de naves mineras.',
    level: 1,
    maxLevel: 15,
    effects: { cargoCapacity: 10 }, // +10% por nivel
    cost: { metal: 15000, plasma: 7500, credits: 7500, time: 5400 }
  },
  {
    id: 'tech_deep_scanning',
    name: 'Escaneo Profundo',
    description: 'Detecta depósitos más profundos y ricos.',
    level: 1,
    maxLevel: 10,
    effects: { scanningRange: 20, rareFindChance: 2 },
    cost: { metal: 20000, plasma: 10000, credits: 10000, time: 7200 }
  },
  {
    id: 'tech_hazard_shielding',
    name: 'Blindaje contra Peligros',
    description: 'Reduce daño de peligros ambientales.',
    level: 1,
    maxLevel: 10,
    effects: { hazardResistance: 10 },
    cost: { metal: 25000, plasma: 12500, credits: 12500, time: 9000 }
  },
  {
    id: 'tech_metal_extraction',
    name: 'Extracción de Metales',
    description: 'Mejora eficiencia en extracción de metal.',
    level: 1,
    maxLevel: 20,
    effects: { efficiency: { metal: 1.05, plasma: 1.0, credits: 1.0, energy: 1.0 } },
    cost: { metal: 12000, plasma: 6000, credits: 6000, time: 3600 }
  },
  {
    id: 'tech_plasma_harvesting',
    name: 'Cosecha de Plasma',
    description: 'Mejora eficiencia en extracción de plasma.',
    level: 1,
    maxLevel: 20,
    effects: { efficiency: { metal: 1.0, plasma: 1.05, credits: 1.0, energy: 1.0 } },
    cost: { metal: 12000, plasma: 6000, credits: 6000, time: 3600 }
  }
];

// ============================================
// OPERACIÓN DE MINERÍA
// ============================================
export interface MiningOperation {
  id: string;
  planetId: string;
  playerId: string;
  corpId?: string;
  
  // Naves asignadas
  ships: {
    shipId: string;
    count: number;
    assignedAt: number;
  }[];
  
  // Estado
  status: 'traveling' | 'mining' | 'returning' | 'completed' | 'attacked';
  startTime: number;
  estimatedEndTime: number;
  
  // Producción
  resourcesMined: Record<ResourceKey, number>;
  efficiency: number;
  
  // Riesgos
  encounters: {
    type: 'pirates' | 'competitors' | 'environmental';
    severity: 1 | 2 | 3 | 4 | 5;
    resolved: boolean;
    losses: number;
  }[];
  
  // Retorno
  returnTrip: boolean;
  escortFleet?: string;
}

// ============================================
// EVENTOS DE RECOLECCIÓN
// ============================================
export type MiningEventType = 
  | 'pirate_attack'
  | 'rich_vein_found'
  | 'equipment_failure'
  | 'competitor_encounter'
  | 'ancient_discovery'
  | 'storm_damage'
  | 'efficiency_boost';

export interface MiningEvent {
  id: string;
  type: MiningEventType;
  operationId: string;
  
  description: string;
  severity: 'positive' | 'neutral' | 'negative' | 'critical';
  
  effects: {
    resourceBonus?: number;
    timeModifier?: number;
    shipDamage?: number;
    shipLoss?: number;
    rareItem?: string;
  };
  
  choices?: {
    text: string;
    consequence: string;
    successRate: number;
  }[];
  
  timestamp: number;
  resolved: boolean;
}

export const MINING_EVENTS: Record<MiningEventType, {
  name: string;
  description: string;
  probability: number;
  severity: MiningEvent['severity'];
}> = {
  pirate_attack: {
    name: 'Ataque Pirata',
    description: 'Naves piratas atacan tu operación minera.',
    probability: 0.15,
    severity: 'negative'
  },
  rich_vein_found: {
    name: 'Veta Rica Descubierta',
    description: 'Encuentras un depósito inesperadamente rico.',
    probability: 0.10,
    severity: 'positive'
  },
  equipment_failure: {
    name: 'Falla de Equipo',
    description: 'Tu equipo de minería sufre una falla mecánica.',
    probability: 0.08,
    severity: 'negative'
  },
  competitor_encounter: {
    name: 'Competidor Encontrado',
    description: 'Otro jugador está minando el mismo planeta.',
    probability: 0.20,
    severity: 'neutral'
  },
  ancient_discovery: {
    name: 'Descubrimiento Antiguo',
    description: 'Encuentras tecnología o recursos de una civilización antigua.',
    probability: 0.05,
    severity: 'positive'
  },
  storm_damage: {
    name: 'Tormenta de Radiación',
    description: 'Una tormenta solar daña tus naves.',
    probability: 0.12,
    severity: 'negative'
  },
  efficiency_boost: {
    name: 'Momento de Inspiración',
    description: 'Tu equipo encuentra un método más eficiente.',
    probability: 0.15,
    severity: 'positive'
  }
};

// ============================================
// PLANETAS DE RECURSOS EJEMPLO
// ============================================
export const EXAMPLE_RESOURCE_PLANETS: ResourcePlanet[] = [
  {
    id: 'resource_planet_001',
    name: 'Cinturón Alpha-7',
    type: 'asteroid_belt',
    tier: 3,
    coordinates: { galaxy: 1, system: 7, sector: 'Alpha' },
    deposits: [
      { type: 'metal', amount: 1000000, extractionRate: 500, quality: 75, depth: 10 },
      { type: 'credits', amount: 50000, extractionRate: 25, quality: 60, depth: 20 }
    ],
    totalResources: 1050000,
    remainingResources: 950000,
    richness: 'rich',
    discoveredAt: Date.now() - 86400000,
    lastMinedAt: Date.now() - 3600000,
    isDepleted: false,
    hazards: { pirates: true, environment: false, competition: true, defenseSystems: false },
    requirements: { minLevel: 10, minFleetPower: 100000, miningTechnology: 5, shipType: ['mining_frigate', 'mining_cruiser'] },
    bonuses: { extractionSpeed: 1.1, yieldBonus: 1.2, critChance: 0.05, rareFindChance: 0.02 },
    description: 'Cinturón de asteroides estable con abundante metal.',
    icon: '☄️',
    color: '#8B4513'
  },
  {
    id: 'resource_planet_002',
    name: 'Nebulosa Primordial',
    type: 'nebula_cloud',
    tier: 6,
    coordinates: { galaxy: 2, system: 42, sector: 'Primordial' },
    deposits: [
      { type: 'plasma', amount: 5000000, extractionRate: 2000, quality: 90, depth: 50 },
      { type: 'energy', amount: 1000000, extractionRate: 400, quality: 85, depth: 30 }
    ],
    totalResources: 6000000,
    remainingResources: 5800000,
    richness: 'abundant',
    discoveredAt: Date.now() - 604800000,
    isDepleted: false,
    regenerationRate: 100, // Regeneración lenta
    hazards: { pirates: false, environment: true, competition: true, defenseSystems: false },
    requirements: { minLevel: 25, minFleetPower: 1000000, miningTechnology: 15, shipType: ['specialized_gas'] },
    bonuses: { extractionSpeed: 1.3, yieldBonus: 1.5, critChance: 0.10, rareFindChance: 0.05 },
    description: 'Nebulosa rica en plasma, peligrosa pero extremadamente valiosa.',
    icon: '🌌',
    color: '#9C27B0'
  },
  {
    id: 'resource_planet_003',
    name: 'Ruinas de Aethelgard',
    type: 'ancient_ruins',
    tier: 9,
    coordinates: { galaxy: 3, system: 99, sector: 'Ancient' },
    deposits: [
      { type: 'credits', amount: 10000000, extractionRate: 5000, quality: 95, depth: 100 },
      { type: 'metal', amount: 2000000, extractionRate: 1000, quality: 80, depth: 50 },
      { type: 'plasma', amount: 1500000, extractionRate: 750, quality: 85, depth: 75 }
    ],
    totalResources: 13500000,
    remainingResources: 13500000,
    richness: 'legendary',
    discoveredAt: Date.now() - 2592000000,
    isDepleted: false,
    isContested: true,
    controllingCorp: 'corp_ancient_guardians',
    hazards: { pirates: true, environment: true, competition: true, defenseSystems: true },
    requirements: { minLevel: 40, minFleetPower: 10000000, miningTechnology: 25, shipType: ['specialized_salvage'] },
    bonuses: { extractionSpeed: 1.5, yieldBonus: 2.0, critChance: 0.20, rareFindChance: 0.15 },
    description: 'Ruinas legendarias de la civilización Aethelgard. Extremadamente peligroso.',
    icon: '🏛️',
    color: '#FFD700'
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateMiningYield(
  planet: ResourcePlanet,
  ships: MiningShip[],
  technologies: MiningTechnology[],
  duration: number // horas
): Record<ResourceKey, number> {
  const yield_result: Record<ResourceKey, number> = { metal: 0, plasma: 0, credits: 0, energy: 0 };
  
  // Calcular bonificaciones totales
  let extractionBonus = 1.0;
  let cargoBonus = 1.0;
  
  technologies.forEach(tech => {
    if (tech.effects.extractionSpeed) {
      extractionBonus += (tech.effects.extractionSpeed / 100) * tech.level;
    }
    if (tech.effects.cargoCapacity) {
      cargoBonus += (tech.effects.cargoCapacity / 100) * tech.level;
    }
  });
  
  // Aplicar bonificaciones del planeta
  extractionBonus *= planet.bonuses.extractionSpeed;
  extractionBonus *= planet.bonuses.yieldBonus;
  
  // Calcular para cada nave
  ships.forEach(ship => {
    planet.deposits.forEach(deposit => {
      const shipEfficiency = ship.efficiency[deposit.type] || 0.5;
      const baseExtraction = Math.min(
        ship.extractionRate * shipEfficiency * extractionBonus,
        deposit.extractionRate // Límite del planeta
      );
      
      const amount = baseExtraction * duration;
      yield_result[deposit.type] += Math.min(amount, ship.cargoCapacity * cargoBonus);
    });
  });
  
  // Aplicar calidad del depósito
  Object.keys(yield_result).forEach(key => {
    const deposit = planet.deposits.find(d => d.type === key);
    if (deposit) {
      yield_result[key as ResourceKey] *= (deposit.quality / 100);
    }
  });
  
  return yield_result;
}

export function getMiningShipById(id: string): MiningShip | undefined {
  return MINING_SHIPS.find(s => s.id === id);
}

export function getResourcePlanetTierConfig(tier: ResourcePlanetTier) {
  return RESOURCE_PLANET_TIERS[tier];
}

export function canMinePlanet(
  playerLevel: number,
  fleetPower: number,
  planet: ResourcePlanet
): { canMine: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  if (playerLevel < planet.requirements.minLevel) {
    reasons.push(`Nivel ${planet.requirements.minLevel} requerido`);
  }
  
  if (fleetPower < planet.requirements.minFleetPower) {
    reasons.push(`Poder de flota ${planet.requirements.minFleetPower} requerido`);
  }
  
  if (planet.isDepleted) {
    reasons.push('Planeta agotado');
  }
  
  if (planet.protectionTime && planet.protectionTime > Date.now()) {
    reasons.push('Planeta protegido por descubridor');
  }
  
  return {
    canMine: reasons.length === 0,
    reasons
  };
}

export function generateResourcePlanet(
  galaxy: number,
  system: number,
  tier: ResourcePlanetTier
): ResourcePlanet {
  const types = Object.keys(RESOURCE_PLANET_TYPES) as ResourcePlanetType[];
  const type = types[Math.floor(Math.random() * types.length)];
  const typeConfig = RESOURCE_PLANET_TYPES[type];
  const tierConfig = RESOURCE_PLANET_TIERS[tier];
  
  // Generar depósitos
  const deposits: ResourceDeposit[] = [{
    type: typeConfig.primaryResource,
    amount: 100000 * tier * (0.8 + Math.random() * 0.4),
    extractionRate: 100 * tier,
    quality: 50 + tier * 5 + Math.random() * 20,
    depth: tier * 10
  }];
  
  // Añadir secundarios
  typeConfig.secondaryResources.forEach(res => {
    if (Math.random() > 0.3) {
      deposits.push({
        type: res,
        amount: 50000 * tier * (0.5 + Math.random() * 0.5),
        extractionRate: 50 * tier,
        quality: 40 + tier * 4 + Math.random() * 15,
        depth: tier * 15
      });
    }
  });
  
  const totalResources = deposits.reduce((sum, d) => sum + d.amount, 0);
  
  return {
    id: `resource_${galaxy}_${system}_${Date.now()}`,
    name: `${typeConfig.name} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${system}`,
    type,
    tier,
    coordinates: { galaxy, system, sector: `Sector-${galaxy}` },
    deposits,
    totalResources,
    remainingResources: totalResources,
    richness: tierConfig.rarity,
    discoveredAt: Date.now(),
    isDepleted: false,
    regenerationRate: type === 'nebula_cloud' ? tier * 10 : undefined,
    hazards: {
      pirates: tier > 2 && Math.random() > 0.5,
      environment: type === 'nebula_cloud' || type === 'ancient_ruins',
      competition: tier > 4,
      defenseSystems: type === 'ancient_ruins' || type === 'mining_colony'
    },
    requirements: {
      minLevel: tierConfig.minLevel,
      minFleetPower: tierConfig.minFleetPower,
      miningTechnology: tier * 2,
      shipType: tier > 5 ? ['mining_cruiser', 'mining_battleship'] : ['mining_frigate', 'mining_cruiser']
    },
    bonuses: {
      extractionSpeed: 1 + (tier * 0.1),
      yieldBonus: 1 + (tier * 0.15),
      critChance: tier * 0.01,
      rareFindChance: tier > 5 ? (tier - 5) * 0.02 : 0
    },
    description: typeConfig.description,
    icon: typeConfig.icon,
    color: typeConfig.color
  };
}

export const ResourceCollectionSystem = {
  RESOURCE_PLANET_TYPES,
  RESOURCE_PLANET_TIERS,
  MINING_SHIPS,
  MINING_TECHNOLOGIES,
  MINING_EVENTS,
  EXAMPLE_RESOURCE_PLANETS,
  calculateMiningYield,
  getMiningShipById,
  getResourcePlanetTierConfig,
  canMinePlanet,
  generateResourcePlanet
};
