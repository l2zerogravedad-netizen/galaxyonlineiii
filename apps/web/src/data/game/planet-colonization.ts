/**
 * SISTEMA DE PLANETAS Y COLONIZACIÓN - GALAXY ONLINE II
 * Tipos de planetas, colonización, terraformación y recursos planetarios
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS DE PLANETAS
// ============================================
export type PlanetType = 
  | 'terrestrial'    // Terrestre (Tierra-like)
  | 'gas_giant'      // Gigante gaseoso
  | 'ice'            // Planeta de hielo
  | 'lava'           // Planeta de lava/volcánico
  | 'desert'         // Desierto
  | 'ocean'          // Océano
  | 'barren'         // Yermo/rocoso
  | 'toxic'          // Tóxico
  | 'radioactive'    // Radioactivo
  | 'crystalline'    // Cristalino
  | 'artificial'     // Estación espacial artificial
  | 'humaroid';      // Planeta Humaroid (especial)

export type PlanetSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'colossal';
export type PlanetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// ============================================
// CLIMA Y ATMÓSFERA
// ============================================
export type PlanetClimate = 
  | 'temperate' 
  | 'hot' 
  | 'cold' 
  | 'extreme' 
  | 'variable'
  | 'none';

export type PlanetAtmosphere = 
  | 'breathable' 
  | 'thin' 
  | 'thick' 
  | 'toxic' 
  | 'corrosive'
  | 'none';

// ============================================
// ESTRUCTURA DE PLANETA
// ============================================
export interface PlanetResourceBonus {
  resource: ResourceKey;
  bonusPercent: number; // -50% a +100%
}

export interface PlanetBuildingSlots {
  total: number;
  used: number;
  available: number;
}

export interface Planet {
  id: string;
  name: string;
  coordinates: {
    galaxy: number;
    system: number;
    planet: number;
  };
  type: PlanetType;
  size: PlanetSize;
  rarity: PlanetRarity;
  climate: PlanetClimate;
  atmosphere: PlanetAtmosphere;
  ownerId?: string;
  ownerName?: string;
  
  // Características
  gravity: number; // 0.1 a 5.0 (Tierra = 1.0)
  temperature: number; // En Celsius
  habitability: number; // 0-100%
  
  // Recursos
  resourceBonuses: PlanetResourceBonus[];
  hasArtifact: boolean;
  artifactType?: string;
  
  // Slots de construcción
  buildingSlots: PlanetBuildingSlots;
  
  // Defensas
  defenseLevel: number;
  shieldStrength: number;
  
  // Estado
  isColonized: boolean;
  isProtected: boolean; // Protección de novato
  protectionEndTime?: number;
  isUnderAttack: boolean;
  isBeingTerraformed: boolean;
  
  // Terraformación
  terraformLevel: number;
  maxTerraformLevel: number;
  
  // Información visual
  color: string;
  icon: string;
  description: string;
}

// ============================================
// TIPOS DE PLANETAS - CONFIGURACIÓN
// ============================================
export const PLANET_TYPE_CONFIG: Record<PlanetType, {
  name: string;
  description: string;
  baseHabitability: number;
  resourceBonuses: PlanetResourceBonus[];
  buildingSlots: Record<PlanetSize, number>;
  terraformable: boolean;
  color: string;
  icon: string;
}> = {
  terrestrial: {
    name: 'Terrestre',
    description: 'Planeta similar a la Tierra con condiciones ideales para la vida.',
    baseHabitability: 100,
    resourceBonuses: [
      { resource: 'metal', bonusPercent: 10 },
      { resource: 'plasma', bonusPercent: 10 }
    ],
    buildingSlots: { tiny: 40, small: 60, medium: 80, large: 100, huge: 120, colossal: 150 },
    terraformable: true,
    color: '#4A90E2',
    icon: '🌍'
  },
  
  gas_giant: {
    name: 'Gigante Gaseoso',
    description: 'Planeta masivo compuesto principalmente de gases. Raro en recursos sólidos.',
    baseHabitability: 5,
    resourceBonuses: [
      { resource: 'plasma', bonusPercent: 50 },
      { resource: 'energy', bonusPercent: 100 }
    ],
    buildingSlots: { tiny: 20, small: 30, medium: 40, large: 50, huge: 60, colossal: 80 },
    terraformable: false,
    color: '#E67E22',
    icon: '🪐'
  },
  
  ice: {
    name: 'Planeta de Hielo',
    description: 'Mundo frío cubierto de hielo y nieve. Rico en agua congelada.',
    baseHabitability: 30,
    resourceBonuses: [
      { resource: 'plasma', bonusPercent: 30 },
      { resource: 'energy', bonusPercent: -20 }
    ],
    buildingSlots: { tiny: 35, small: 50, medium: 65, large: 80, huge: 95, colossal: 120 },
    terraformable: true,
    color: '#B8E6E6',
    icon: '❄️'
  },
  
  lava: {
    name: 'Planeta de Lava',
    description: 'Mundo volcánico con magma en la superficie. Extremadamente peligroso.',
    baseHabitability: 10,
    resourceBonuses: [
      { resource: 'metal', bonusPercent: 60 },
      { resource: 'energy', bonusPercent: 40 }
    ],
    buildingSlots: { tiny: 30, small: 45, medium: 60, large: 75, huge: 90, colossal: 110 },
    terraformable: false,
    color: '#E74C3C',
    icon: '🔥'
  },
  
  desert: {
    name: 'Desierto',
    description: 'Planeta árido con poca agua pero abundantes minerales.',
    baseHabitability: 40,
    resourceBonuses: [
      { resource: 'metal', bonusPercent: 40 },
      { resource: 'plasma', bonusPercent: -10 }
    ],
    buildingSlots: { tiny: 35, small: 50, medium: 65, large: 80, huge: 95, colossal: 120 },
    terraformable: true,
    color: '#F4D03F',
    icon: '🏜️'
  },
  
  ocean: {
    name: 'Océano',
    description: 'Planeta completamente cubierto de agua. Ideal para plasma.',
    baseHabitability: 60,
    resourceBonuses: [
      { resource: 'plasma', bonusPercent: 50 },
      { resource: 'metal', bonusPercent: -30 }
    ],
    buildingSlots: { tiny: 30, small: 45, medium: 60, large: 75, huge: 90, colossal: 110 },
    terraformable: true,
    color: '#3498DB',
    icon: '🌊'
  },
  
  barren: {
    name: 'Yermo',
    description: 'Planeta sin atmósfera ni vida, pero con recursos mineros.',
    baseHabitability: 20,
    resourceBonuses: [
      { resource: 'metal', bonusPercent: 30 },
      { resource: 'plasma', bonusPercent: -20 }
    ],
    buildingSlots: { tiny: 30, small: 45, medium: 60, large: 75, huge: 90, colossal: 110 },
    terraformable: true,
    color: '#95A5A6',
    icon: '🌑'
  },
  
  toxic: {
    name: 'Tóxico',
    description: 'Atmósfera venenosa pero con químicos útiles.',
    baseHabitability: 5,
    resourceBonuses: [
      { resource: 'plasma', bonusPercent: 40 },
      { resource: 'energy', bonusPercent: 20 }
    ],
    buildingSlots: { tiny: 25, small: 40, medium: 55, large: 70, huge: 85, colossal: 100 },
    terraformable: true,
    color: '#9B59B6',
    icon: '☠️'
  },
  
  radioactive: {
    name: 'Radioactivo',
    description: 'Alta radiación pero minerales únicos y energía abundante.',
    baseHabitability: 5,
    resourceBonuses: [
      { resource: 'energy', bonusPercent: 100 },
      { resource: 'metal', bonusPercent: 20 }
    ],
    buildingSlots: { tiny: 25, small: 40, medium: 55, large: 70, huge: 85, colossal: 100 },
    terraformable: false,
    color: '#2ECC71',
    icon: '☢️'
  },
  
  crystalline: {
    name: 'Cristalino',
    description: 'Superficie cubierta de cristales energéticos. Muy valioso.',
    baseHabitability: 15,
    resourceBonuses: [
      { resource: 'energy', bonusPercent: 150 },
      { resource: 'credits', bonusPercent: 20 }
    ],
    buildingSlots: { tiny: 35, small: 50, medium: 65, large: 80, huge: 95, colossal: 120 },
    terraformable: true,
    color: '#E91E63',
    icon: '💎'
  },
  
  artificial: {
    name: 'Estación Artificial',
    description: 'Estructura artificial construida por una civilización avanzada.',
    baseHabitability: 50,
    resourceBonuses: [
      { resource: 'metal', bonusPercent: -50 },
      { resource: 'plasma', bonusPercent: 30 },
      { resource: 'credits', bonusPercent: 50 }
    ],
    buildingSlots: { tiny: 20, small: 30, medium: 40, large: 50, huge: 60, colossal: 80 },
    terraformable: false,
    color: '#607D8B',
    icon: '🛰️'
  },
  
  humaroid: {
    name: 'Humaroid',
    description: 'Planeta infectado por la raza Humaroid. Peligroso pero valioso.',
    baseHabitability: 25,
    resourceBonuses: [
      { resource: 'metal', bonusPercent: 50 },
      { resource: 'plasma', bonusPercent: 50 },
      { resource: 'credits', bonusPercent: 30 }
    ],
    buildingSlots: { tiny: 45, small: 60, medium: 80, large: 100, huge: 120, colossal: 150 },
    terraformable: false,
    color: '#8E44AD',
    icon: '👾'
  }
};

// ============================================
// SISTEMA DE COLONIZACIÓN
// ============================================
export interface ColonizationCost {
  metal: number;
  plasma: number;
  credits: number;
  ships: {
    type: string;
    count: number;
  }[];
}

export const COLONIZATION_COSTS: Record<PlanetSize, ColonizationCost> = {
  tiny: {
    metal: 50000,
    plasma: 25000,
    credits: 50000,
    ships: [{ type: 'colony_ship', count: 1 }]
  },
  small: {
    metal: 100000,
    plasma: 50000,
    credits: 100000,
    ships: [{ type: 'colony_ship', count: 1 }]
  },
  medium: {
    metal: 200000,
    plasma: 100000,
    credits: 200000,
    ships: [{ type: 'colony_ship', count: 2 }]
  },
  large: {
    metal: 500000,
    plasma: 250000,
    credits: 500000,
    ships: [{ type: 'colony_ship', count: 3 }]
  },
  huge: {
    metal: 1000000,
    plasma: 500000,
    credits: 1000000,
    ships: [{ type: 'colony_ship', count: 5 }]
  },
  colossal: {
    metal: 5000000,
    plasma: 2500000,
    credits: 5000000,
    ships: [{ type: 'colony_ship', count: 10 }]
  }
};

// ============================================
// SISTEMA DE TERRAFORMACIÓN
// ============================================
export interface TerraformLevel {
  level: number;
  name: string;
  description: string;
  cost: {
    metal: number;
    plasma: number;
    credits: number;
    energy: number;
    timeHours: number;
  };
  effects: {
    habitabilityIncrease: number;
    buildingSlotsIncrease: number;
    resourceBonusIncrease: number;
  };
  requirements: {
    researchLevel?: number;
    buildingLevel?: { buildingId: string; level: number };
  };
}

export const TERRAFORM_LEVELS: TerraformLevel[] = [
  {
    level: 1,
    name: 'Atmósfera Inicial',
    description: 'Establecer atmósfera básica.',
    cost: { metal: 100000, plasma: 50000, credits: 100000, energy: 50000, timeHours: 24 },
    effects: { habitabilityIncrease: 10, buildingSlotsIncrease: 5, resourceBonusIncrease: 5 },
    requirements: { researchLevel: 5 }
  },
  {
    level: 2,
    name: 'Calentamiento Global',
    description: 'Ajustar temperatura planetaria.',
    cost: { metal: 250000, plasma: 125000, credits: 250000, energy: 100000, timeHours: 48 },
    effects: { habitabilityIncrease: 15, buildingSlotsIncrease: 10, resourceBonusIncrease: 10 },
    requirements: { researchLevel: 10 }
  },
  {
    level: 3,
    name: 'Ciclos Hídricos',
    description: 'Crear océanos y ríos.',
    cost: { metal: 500000, plasma: 250000, credits: 500000, energy: 200000, timeHours: 72 },
    effects: { habitabilityIncrease: 20, buildingSlotsIncrease: 15, resourceBonusIncrease: 15 },
    requirements: { researchLevel: 15 }
  },
  {
    level: 4,
    name: 'Ecosistema Básico',
    description: 'Introducir vegetación y fauna básica.',
    cost: { metal: 1000000, plasma: 500000, credits: 1000000, energy: 400000, timeHours: 120 },
    effects: { habitabilityIncrease: 25, buildingSlotsIncrease: 20, resourceBonusIncrease: 20 },
    requirements: { researchLevel: 20 }
  },
  {
    level: 5,
    name: 'Habitalidad Total',
    description: 'Planeta completamente terraformado.',
    cost: { metal: 5000000, plasma: 2500000, credits: 5000000, energy: 1000000, timeHours: 240 },
    effects: { habitabilityIncrease: 30, buildingSlotsIncrease: 25, resourceBonusIncrease: 25 },
    requirements: { researchLevel: 25 }
  }
];

// ============================================
// ARTEFACTOS PLANETARIOS
// ============================================
export interface PlanetArtifact {
  id: string;
  name: string;
  description: string;
  effect: {
    type: 'resource_boost' | 'building_boost' | 'defense_boost' | 'research_boost' | 'fleet_boost';
    target: string;
    value: number;
  };
  rarity: PlanetRarity;
}

export const PLANET_ARTIFACTS: PlanetArtifact[] = [
  {
    id: 'artifact_ancient_mine',
    name: 'Mina Antigua',
    description: 'Restos de una mina de una civilización extinta.',
    effect: { type: 'resource_boost', target: 'metal', value: 25 },
    rarity: 'rare'
  },
  {
    id: 'artifact_plasma_core',
    name: 'Núcleo de Plasma',
    description: 'Fuente de plasma natural extremadamente pura.',
    effect: { type: 'resource_boost', target: 'plasma', value: 30 },
    rarity: 'epic'
  },
  {
    id: 'artifact_defense_grid',
    name: 'Red de Defensa Antigua',
    description: 'Sistema de defensa de una civilización caída.',
    effect: { type: 'defense_boost', target: 'all', value: 20 },
    rarity: 'legendary'
  },
  {
    id: 'artifact_research_cache',
    name: 'Caché de Investigación',
    description: 'Base de datos científica de tecnología avanzada.',
    effect: { type: 'research_boost', target: 'all', value: 15 },
    rarity: 'epic'
  },
  {
    id: 'artifact_fleet_dock',
    name: 'Astillero Antiguo',
    description: 'Instalación de construcción de naves abandonada.',
    effect: { type: 'fleet_boost', target: 'build_speed', value: 25 },
    rarity: 'rare'
  }
];

// ============================================
// PROTECCIÓN DE NOVATO (NEW PLAYER PROTECTION)
// ============================================
export const NEW_PLAYER_PROTECTION = {
  durationHours: 168, // 7 días
  maxLevel: 15,
  canAttackOthers: false,
  canBeAttacked: false,
  restrictions: [
    'Cannot attack other players',
    'Cannot be attacked by other players',
    'Limited trade options',
    'Cannot join corp wars'
  ]
};

// ============================================
// GENERACIÓN DE PLANETAS
// ============================================
export function generatePlanet(
  galaxy: number,
  system: number,
  planet: number,
  type?: PlanetType,
  size?: PlanetSize
): Planet {
  const planetTypes = Object.keys(PLANET_TYPE_CONFIG) as PlanetType[];
  const selectedType = type || planetTypes[Math.floor(Math.random() * planetTypes.length)];
  
  const sizes: PlanetSize[] = ['tiny', 'small', 'medium', 'large', 'huge', 'colossal'];
  const sizeWeights = [20, 30, 25, 15, 8, 2]; // Probabilidades
  const selectedSize = size || weightedRandom(sizes, sizeWeights);
  
  const config = PLANET_TYPE_CONFIG[selectedType];
  const slots = config.buildingSlots[selectedSize];
  
  // Generar rareza basada en tipo
  const rarity = generatePlanetRarity(selectedType);
  
  // Verificar si tiene artefacto
  const hasArtifact = Math.random() < (rarity === 'legendary' ? 0.3 : rarity === 'epic' ? 0.2 : 0.05);
  
  return {
    id: `planet_${galaxy}_${system}_${planet}`,
    name: `Planeta ${planet}`,
    coordinates: { galaxy, system, planet },
    type: selectedType,
    size: selectedSize,
    rarity,
    climate: determineClimate(selectedType),
    atmosphere: config.baseHabitability > 50 ? 'breathable' : 'thin',
    gravity: Math.random() * 2 + 0.5,
    temperature: generateTemperature(selectedType),
    habitability: config.baseHabitability,
    resourceBonuses: [...config.resourceBonuses],
    hasArtifact,
    artifactType: hasArtifact ? PLANET_ARTIFACTS[Math.floor(Math.random() * PLANET_ARTIFACTS.length)].id : undefined,
    buildingSlots: { total: slots, used: 0, available: slots },
    defenseLevel: 0,
    shieldStrength: 0,
    isColonized: false,
    isProtected: false,
    isUnderAttack: false,
    isBeingTerraformed: false,
    terraformLevel: 0,
    maxTerraformLevel: config.terraformable ? 5 : 0,
    color: config.color,
    icon: config.icon,
    description: config.description
  };
}

// ============================================
// HELPERS
// ============================================
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  
  return items[items.length - 1];
}

function generatePlanetRarity(type: PlanetType): PlanetRarity {
  const rarityChances: Record<PlanetType, PlanetRarity[]> = {
    terrestrial: ['common', 'common', 'common', 'uncommon', 'rare'],
    gas_giant: ['uncommon', 'uncommon', 'rare', 'rare', 'epic'],
    ice: ['common', 'common', 'uncommon', 'uncommon', 'rare'],
    lava: ['uncommon', 'uncommon', 'rare', 'rare', 'epic'],
    desert: ['common', 'common', 'common', 'uncommon', 'rare'],
    ocean: ['uncommon', 'uncommon', 'rare', 'rare', 'epic'],
    barren: ['common', 'common', 'common', 'uncommon', 'rare'],
    toxic: ['uncommon', 'rare', 'rare', 'epic', 'epic'],
    radioactive: ['rare', 'rare', 'epic', 'epic', 'legendary'],
    crystalline: ['rare', 'epic', 'epic', 'legendary', 'legendary'],
    artificial: ['rare', 'rare', 'epic', 'epic', 'legendary'],
    humaroid: ['epic', 'epic', 'legendary', 'legendary', 'legendary']
  };
  
  const options = rarityChances[type];
  return options[Math.floor(Math.random() * options.length)];
}

function determineClimate(type: PlanetType): PlanetClimate {
  const climates: Record<PlanetType, PlanetClimate> = {
    terrestrial: 'temperate',
    gas_giant: 'variable',
    ice: 'cold',
    lava: 'hot',
    desert: 'hot',
    ocean: 'temperate',
    barren: 'variable',
    toxic: 'extreme',
    radioactive: 'extreme',
    crystalline: 'variable',
    artificial: 'none',
    humaroid: 'extreme'
  };
  return climates[type];
}

function generateTemperature(type: PlanetType): number {
  const temps: Record<PlanetType, [number, number]> = {
    terrestrial: [-20, 50],
    gas_giant: [-150, -50],
    ice: [-100, -20],
    lava: [200, 800],
    desert: [30, 80],
    ocean: [-10, 40],
    barren: [-50, 100],
    toxic: [-30, 60],
    radioactive: [-20, 70],
    crystalline: [-80, 30],
    artificial: [15, 25],
    humaroid: [10, 40]
  };
  
  const [min, max] = temps[type];
  return Math.floor(Math.random() * (max - min) + min);
}

export function calculateColonizationCost(planetSize: PlanetSize, playerLevel: number): ColonizationCost {
  const baseCost = COLONIZATION_COSTS[planetSize];
  
  // Reducción de costo por nivel
  const discount = Math.min(0.5, playerLevel * 0.01); // Máximo 50% de descuento
  
  return {
    metal: Math.floor(baseCost.metal * (1 - discount)),
    plasma: Math.floor(baseCost.plasma * (1 - discount)),
    credits: Math.floor(baseCost.credits * (1 - discount)),
    ships: baseCost.ships
  };
}

export function calculateTerraformCost(level: number): TerraformLevel['cost'] | null {
  const terraformLevel = TERRAFORM_LEVELS.find(t => t.level === level);
  return terraformLevel?.cost || null;
}

export function getPlanetTypeInfo(type: PlanetType) {
  return PLANET_TYPE_CONFIG[type];
}

export function getResourceBonus(planet: Planet, resource: ResourceKey): number {
  const bonus = planet.resourceBonuses.find(b => b.resource === resource);
  return bonus?.bonusPercent || 0;
}

export const PlanetColonizationSystem = {
  PLANET_TYPE_CONFIG,
  COLONIZATION_COSTS,
  TERRAFORM_LEVELS,
  PLANET_ARTIFACTS,
  NEW_PLAYER_PROTECTION,
  generatePlanet,
  calculateColonizationCost,
  calculateTerraformCost,
  getPlanetTypeInfo,
  getResourceBonus
};
