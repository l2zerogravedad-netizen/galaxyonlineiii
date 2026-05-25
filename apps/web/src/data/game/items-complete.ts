/**
 * SISTEMA DE ITEMS COMPLETO - GALAXY ONLINE II
 * Blueprints, cofres, consumibles, life boats y development items
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// TIPOS Y ENUMERACIONES
// ============================================
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'divine';
export type ItemType = 
  | 'blueprint' 
  | 'chest' 
  | 'consumable' 
  | 'life_boat' 
  | 'development' 
  | 'material' 
  | 'gem' 
  | 'chip' 
  | 'special';

export type ConsumableEffect = 
  | 'speedup_construction' 
  | 'speedup_research' 
  | 'speedup_ship' 
  | 'repair_fleet' 
  | 'shield_boost' 
  | 'resource_boost'
  | 'exp_boost'
  | 'honor_boost';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  stackable: boolean;
  maxStack?: number;
  tradable: boolean;
  dropRate?: number; // % de drop
  source?: string[]; // De dónde se obtiene
}

// ============================================
// BLUEPRINTS (Diseños de Naves)
// ============================================
export interface Blueprint extends Item {
  hullId: string;
  buildBonus?: {
    stat: 'attack' | 'defense' | 'speed' | 'structure' | 'shield';
    bonusPercent: number;
  };
}

export const BLUEPRINTS: Blueprint[] = [
  // Frigatas
  { id: 'bp_frigate_t1', name: 'Diseño: Fragata T1', description: 'Diseño básico para construir fragatas.', type: 'blueprint', rarity: 'common', hullId: 'frigate_t1', icon: '📘', stackable: true, maxStack: 99, tradable: true, dropRate: 30, source: ['instance_01', 'daily_mission'] },
  { id: 'bp_frigate_t2', name: 'Diseño: Fragata T2', description: 'Diseño mejorado de fragatas.', type: 'blueprint', rarity: 'uncommon', hullId: 'frigate_t2', icon: '📗', stackable: true, maxStack: 99, tradable: true, dropRate: 25, source: ['instance_02', 'arena'] },
  { id: 'bp_frigate_t3', name: 'Diseño: Fragata T3', description: 'Diseño avanzado de fragatas.', type: 'blueprint', rarity: 'rare', hullId: 'frigate_t3', icon: '📙', stackable: true, maxStack: 99, tradable: true, dropRate: 15, source: ['instance_03', 'pvp_league'] },
  
  // Cruceros
  { id: 'bp_cruiser_t1', name: 'Diseño: Crucero T1', description: 'Diseño básico de cruceros.', type: 'blueprint', rarity: 'uncommon', hullId: 'cruiser_t1', icon: '📗', stackable: true, maxStack: 99, tradable: true, dropRate: 20, source: ['instance_02', 'constellation'] },
  { id: 'bp_cruiser_t2', name: 'Diseño: Crucero T2', description: 'Diseño mejorado de cruceros.', type: 'blueprint', rarity: 'rare', hullId: 'cruiser_t2', icon: '📙', stackable: true, maxStack: 99, tradable: true, dropRate: 12, source: ['instance_03', 'restricted'] },
  { id: 'bp_cruiser_t3', name: 'Diseño: Crucero T3', description: 'Diseño avanzado de cruceros.', type: 'blueprint', rarity: 'epic', hullId: 'cruiser_t3', icon: '📕', stackable: true, maxStack: 99, tradable: true, dropRate: 8, source: ['restricted', 'pvp_season'] },
  
  // Acorazados
  { id: 'bp_battleship_t1', name: 'Diseño: Acorazado T1', description: 'Diseño de acorazado básico.', type: 'blueprint', rarity: 'rare', hullId: 'battleship_t1', icon: '📙', stackable: true, maxStack: 99, tradable: true, dropRate: 10, source: ['instance_03', 'championship'] },
  { id: 'bp_battleship_t2', name: 'Diseño: Acorazado T2', description: 'Diseño de acorazado pesado.', type: 'blueprint', rarity: 'epic', hullId: 'battleship_t2', icon: '📕', stackable: true, maxStack: 99, tradable: true, dropRate: 6, source: ['restricted', 'championship'] },
  { id: 'bp_battleship_t3', name: 'Diseño: Acorazado T3', description: 'Diseño de super-acorazado.', type: 'blueprint', rarity: 'legendary', hullId: 'battleship_t3', icon: '📓', stackable: true, maxStack: 50, tradable: true, dropRate: 3, source: ['constellation', 'divine_chest'] },
  
  // Naves Especiales
  { id: 'bp_flagship', name: 'Diseño: Flagship', description: 'Diseño legendario de nave insignia.', type: 'blueprint', rarity: 'legendary', hullId: 'flagship', icon: '📓', stackable: true, maxStack: 10, tradable: true, dropRate: 1, source: ['constellation', 'pvp_season_top10'] },
  { id: 'bp_dreadnought', name: 'Diseño: Dreadnought', description: 'Diseño divino de nave colosal.', type: 'blueprint', rarity: 'divine', hullId: 'dreadnought', icon: '🌟', stackable: true, maxStack: 5, tradable: false, dropRate: 0.1, source: ['championship_champion'] }
];

// ============================================
// COFRES (Chests)
// ============================================
export interface Chest extends Item {
  contents: {
    itemId: string;
    minAmount: number;
    maxAmount: number;
    dropChance: number;
  }[];
  guaranteedItems?: string[];
}

export const CHESTS: Chest[] = [
  // Cofres Básicos
  {
    id: 'chest_common',
    name: 'Cofre Común',
    description: 'Contiene recursos básicos y items comunes.',
    type: 'chest',
    rarity: 'common',
    icon: '📦',
    stackable: true,
    maxStack: 99,
    tradable: true,
    contents: [
      { itemId: 'metal', minAmount: 100, maxAmount: 500, dropChance: 100 },
      { itemId: 'plasma', minAmount: 50, maxAmount: 250, dropChance: 100 },
      { itemId: 'credits', minAmount: 100, maxAmount: 500, dropChance: 100 },
      { itemId: 'bp_frigate_t1', minAmount: 1, maxAmount: 1, dropChance: 20 },
      { itemId: 'speedup_5m', minAmount: 1, maxAmount: 2, dropChance: 30 }
    ]
  },
  {
    id: 'chest_rare',
    name: 'Cofre Raro',
    description: 'Contiene items raros y recursos valiosos.',
    type: 'chest',
    rarity: 'uncommon',
    icon: '🎁',
    stackable: true,
    maxStack: 50,
    tradable: true,
    contents: [
      { itemId: 'metal', minAmount: 500, maxAmount: 2000, dropChance: 100 },
      { itemId: 'plasma', minAmount: 250, maxAmount: 1000, dropChance: 100 },
      { itemId: 'credits', minAmount: 500, maxAmount: 2000, dropChance: 100 },
      { itemId: 'bp_frigate_t2', minAmount: 1, maxAmount: 1, dropChance: 25 },
      { itemId: 'bp_cruiser_t1', minAmount: 1, maxAmount: 1, dropChance: 15 },
      { itemId: 'speedup_30m', minAmount: 1, maxAmount: 2, dropChance: 40 },
      { itemId: 'repair_kit', minAmount: 1, maxAmount: 3, dropChance: 35 }
    ],
    guaranteedItems: ['metal', 'plasma', 'credits']
  },
  {
    id: 'chest_epic',
    name: 'Cofre Épico',
    description: 'Contiene items épicos con alta probabilidad de blueprints.',
    type: 'chest',
    rarity: 'rare',
    icon: '💎',
    stackable: true,
    maxStack: 30,
    tradable: true,
    contents: [
      { itemId: 'metal', minAmount: 2000, maxAmount: 10000, dropChance: 100 },
      { itemId: 'plasma', minAmount: 1000, maxAmount: 5000, dropChance: 100 },
      { itemId: 'credits', minAmount: 2000, maxAmount: 10000, dropChance: 100 },
      { itemId: 'bp_cruiser_t2', minAmount: 1, maxAmount: 1, dropChance: 20 },
      { itemId: 'bp_battleship_t1', minAmount: 1, maxAmount: 1, dropChance: 12 },
      { itemId: 'speedup_1h', minAmount: 1, maxAmount: 3, dropChance: 45 },
      { itemId: 'gem_red_3', minAmount: 1, maxAmount: 1, dropChance: 15 }
    ],
    guaranteedItems: ['metal', 'plasma', 'credits']
  },
  {
    id: 'chest_legendary',
    name: 'Cofre Legendario',
    description: 'Contiene items legendarios con probabilidad de comandantes.',
    type: 'chest',
    rarity: 'epic',
    icon: '🏆',
    stackable: true,
    maxStack: 20,
    tradable: true,
    contents: [
      { itemId: 'metal', minAmount: 10000, maxAmount: 50000, dropChance: 100 },
      { itemId: 'plasma', minAmount: 5000, maxAmount: 25000, dropChance: 100 },
      { itemId: 'credits', minAmount: 10000, maxAmount: 50000, dropChance: 100 },
      { itemId: 'bp_battleship_t2', minAmount: 1, maxAmount: 1, dropChance: 15 },
      { itemId: 'bp_battleship_t3', minAmount: 1, maxAmount: 1, dropChance: 8 },
      { itemId: 'cmd_rare', minAmount: 1, maxAmount: 1, dropChance: 20 },
      { itemId: 'speedup_4h', minAmount: 1, maxAmount: 2, dropChance: 50 },
      { itemId: 'gem_red_4', minAmount: 1, maxAmount: 1, dropChance: 10 }
    ],
    guaranteedItems: ['metal', 'plasma', 'credits', 'speedup_4h']
  },
  {
    id: 'chest_divine',
    name: 'Cofre Divino',
    description: 'Contiene items divinos y comandantes legendarios.',
    type: 'chest',
    rarity: 'legendary',
    icon: '👑',
    stackable: true,
    maxStack: 10,
    tradable: false,
    contents: [
      { itemId: 'metal', minAmount: 50000, maxAmount: 200000, dropChance: 100 },
      { itemId: 'plasma', minAmount: 25000, maxAmount: 100000, dropChance: 100 },
      { itemId: 'credits', minAmount: 50000, maxAmount: 200000, dropChance: 100 },
      { itemId: 'bp_flagship', minAmount: 1, maxAmount: 1, dropChance: 10 },
      { itemId: 'bp_dreadnought', minAmount: 1, maxAmount: 1, dropChance: 2 },
      { itemId: 'cmd_legendary', minAmount: 1, maxAmount: 1, dropChance: 15 },
      { itemId: 'cmd_divine', minAmount: 1, maxAmount: 1, dropChance: 3 },
      { itemId: 'gem_red_5', minAmount: 1, maxAmount: 1, dropChance: 8 },
      { itemId: 'chip_legendary', minAmount: 1, maxAmount: 1, dropChance: 12 }
    ],
    guaranteedItems: ['metal', 'plasma', 'credits', 'chip_legendary']
  }
];

// ============================================
// CONSUMIBLES
// ============================================
export interface Consumable extends Item {
  effect: ConsumableEffect;
  duration?: number; // En minutos, undefined = instantáneo
  value: number;
  cooldown?: number; // Minutos entre usos
  target: 'building' | 'research' | 'ship' | 'fleet' | 'player';
}

export const CONSUMABLES: Consumable[] = [
  // Speedups de Construcción
  { id: 'speedup_5m', name: 'Speedup 5 Minutos', description: 'Reduce 5 minutos del tiempo de construcción.', type: 'consumable', rarity: 'common', effect: 'speedup_construction', value: 5, target: 'building', icon: '⏱️', stackable: true, maxStack: 999, tradable: true, dropRate: 35 },
  { id: 'speedup_30m', name: 'Speedup 30 Minutos', description: 'Reduce 30 minutos del tiempo de construcción.', type: 'consumable', rarity: 'uncommon', effect: 'speedup_construction', value: 30, target: 'building', icon: '⏱️', stackable: true, maxStack: 999, tradable: true, dropRate: 25 },
  { id: 'speedup_1h', name: 'Speedup 1 Hora', description: 'Reduce 1 hora del tiempo de construcción.', type: 'consumable', rarity: 'rare', effect: 'speedup_construction', value: 60, target: 'building', icon: '⏱️', stackable: true, maxStack: 500, tradable: true, dropRate: 15 },
  { id: 'speedup_4h', name: 'Speedup 4 Horas', description: 'Reduce 4 horas del tiempo de construcción.', type: 'consumable', rarity: 'epic', effect: 'speedup_construction', value: 240, target: 'building', icon: '⏱️', stackable: true, maxStack: 200, tradable: true, dropRate: 8 },
  { id: 'speedup_8h', name: 'Speedup 8 Horas', description: 'Reduce 8 horas del tiempo de construcción.', type: 'consumable', rarity: 'legendary', effect: 'speedup_construction', value: 480, target: 'building', icon: '⏱️', stackable: true, maxStack: 100, tradable: true, dropRate: 3 },
  
  // Speedups de Investigación
  { id: 'research_speedup_30m', name: 'Speedup Investigación 30m', description: 'Reduce 30 minutos de investigación.', type: 'consumable', rarity: 'uncommon', effect: 'speedup_research', value: 30, target: 'research', icon: '🔬', stackable: true, maxStack: 500, tradable: true, dropRate: 20 },
  { id: 'research_speedup_2h', name: 'Speedup Investigación 2h', description: 'Reduce 2 horas de investigación.', type: 'consumable', rarity: 'rare', effect: 'speedup_research', value: 120, target: 'research', icon: '🔬', stackable: true, maxStack: 200, tradable: true, dropRate: 12 },
  
  // Speedups de Naves
  { id: 'ship_speedup_1h', name: 'Speedup Construcción Nave 1h', description: 'Reduce 1 hora de construcción de naves.', type: 'consumable', rarity: 'rare', effect: 'speedup_ship', value: 60, target: 'ship', icon: '🚀', stackable: true, maxStack: 200, tradable: true, dropRate: 15 },
  { id: 'ship_speedup_4h', name: 'Speedup Construcción Nave 4h', description: 'Reduce 4 horas de construcción de naves.', type: 'consumable', rarity: 'epic', effect: 'speedup_ship', value: 240, target: 'ship', icon: '🚀', stackable: true, maxStack: 100, tradable: true, dropRate: 8 },
  
  // Kits de Reparación
  { id: 'repair_kit', name: 'Kit de Reparación', description: 'Repara instantáneamente 25% del daño de la flota.', type: 'consumable', rarity: 'uncommon', effect: 'repair_fleet', value: 25, target: 'fleet', icon: '🔧', stackable: true, maxStack: 100, tradable: true, dropRate: 25 },
  { id: 'repair_kit_large', name: 'Kit de Reparación Grande', description: 'Repara instantáneamente 50% del daño de la flota.', type: 'consumable', rarity: 'rare', effect: 'repair_fleet', value: 50, target: 'fleet', icon: '🔧', stackable: true, maxStack: 50, tradable: true, dropRate: 12 },
  { id: 'repair_kit_full', name: 'Kit de Reparación Total', description: 'Repara instantáneamente 100% del daño de la flota.', type: 'consumable', rarity: 'epic', effect: 'repair_fleet', value: 100, target: 'fleet', icon: '🔧', stackable: true, maxStack: 20, tradable: true, dropRate: 5 },
  
  // Boosters de Escudo
  { id: 'shield_booster', name: 'Potenciador de Escudo', description: 'Aumenta escudos 25% por 1 hora.', type: 'consumable', rarity: 'rare', effect: 'shield_boost', value: 25, duration: 60, target: 'fleet', icon: '🛡️', stackable: true, maxStack: 50, tradable: true, dropRate: 15 },
  { id: 'shield_booster_large', name: 'Potenciador de Escudo Grande', description: 'Aumenta escudos 50% por 2 horas.', type: 'consumable', rarity: 'epic', effect: 'shield_boost', value: 50, duration: 120, target: 'fleet', icon: '🛡️', stackable: true, maxStack: 20, tradable: true, dropRate: 8 },
  
  // Boosters de Recursos
  { id: 'resource_boost_24h', name: 'Boost de Recursos 24h', description: '+50% producción de recursos por 24 horas.', type: 'consumable', rarity: 'epic', effect: 'resource_boost', value: 50, duration: 1440, target: 'player', icon: '💰', stackable: true, maxStack: 10, tradable: false, dropRate: 5 },
  { id: 'resource_boost_3d', name: 'Boost de Recursos 3 Días', description: '+50% producción de recursos por 3 días.', type: 'consumable', rarity: 'legendary', effect: 'resource_boost', value: 50, duration: 4320, target: 'player', icon: '💰', stackable: true, maxStack: 5, tradable: false, dropRate: 2 },
  
  // Boosters de EXP
  { id: 'exp_boost_2x_12h', name: 'Boost EXP 2x 12h', description: 'Doble experiencia por 12 horas.', type: 'consumable', rarity: 'rare', effect: 'exp_boost', value: 100, duration: 720, target: 'player', icon: '✨', stackable: true, maxStack: 20, tradable: true, dropRate: 10 },
  { id: 'exp_boost_3x_6h', name: 'Boost EXP 3x 6h', description: 'Triple experiencia por 6 horas.', type: 'consumable', rarity: 'epic', effect: 'exp_boost', value: 200, duration: 360, target: 'player', icon: '✨', stackable: true, maxStack: 10, tradable: true, dropRate: 5 },
  
  // Boosters de Honor
  { id: 'honor_boost_2x_24h', name: 'Boost Honor 2x 24h', description: 'Doble honor en PvP por 24 horas.', type: 'consumable', rarity: 'epic', effect: 'honor_boost', value: 100, duration: 1440, target: 'player', icon: '🏆', stackable: true, maxStack: 10, tradable: false, dropRate: 3 }
];

// ============================================
// LIFE BOATS (Botes Salvavidas)
// ============================================
export interface LifeBoat extends Item {
  savePercentage: number; // % de naves que salvan
  autoUse: boolean;
  cooldown: number; // Minutos
}

export const LIFE_BOATS: LifeBoat[] = [
  { id: 'life_boat_t1', name: 'Bote Salvavidas Básico', description: 'Salva 10% de las naves destruidas en combate perdido.', type: 'life_boat', rarity: 'uncommon', savePercentage: 10, autoUse: true, cooldown: 60, icon: '🛶', stackable: true, maxStack: 50, tradable: true, dropRate: 20 },
  { id: 'life_boat_t2', name: 'Bote Salvavidas Mejorado', description: 'Salva 20% de las naves destruidas en combate perdido.', type: 'life_boat', rarity: 'rare', savePercentage: 20, autoUse: true, cooldown: 60, icon: '🛶', stackable: true, maxStack: 30, tradable: true, dropRate: 12 },
  { id: 'life_boat_t3', name: 'Bote Salvavidas Avanzado', description: 'Salva 30% de las naves destruidas en combate perdido.', type: 'life_boat', rarity: 'epic', savePercentage: 30, autoUse: true, cooldown: 60, icon: '🛶', stackable: true, maxStack: 20, tradable: true, dropRate: 6 },
  { id: 'life_boat_t4', name: 'Cápsula de Escape', description: 'Salva 50% de las naves destruidas en cualquier combate.', type: 'life_boat', rarity: 'legendary', savePercentage: 50, autoUse: true, cooldown: 30, icon: '🚀', stackable: true, maxStack: 10, tradable: false, dropRate: 2 }
];

// ============================================
// DEVELOPMENT ITEMS (Items de Desarrollo)
// ============================================
export interface DevelopmentItem extends Item {
  category: 'civilization' | 'military' | 'economy';
  effect: {
    type: 'reduce_cost' | 'reduce_time' | 'increase_production' | 'increase_capacity';
    value: number; // Porcentaje
    duration?: number; // Minutos, undefined = permanente
  };
}

export const DEVELOPMENT_ITEMS: DevelopmentItem[] = [
  // Civilización
  { id: 'dev_population_boost', name: 'Incentivo Poblacional', description: 'Aumenta crecimiento poblacional 50% por 24h.', type: 'development', rarity: 'rare', category: 'civilization', effect: { type: 'increase_production', value: 50, duration: 1440 }, icon: '👥', stackable: true, maxStack: 20, tradable: true },
  { id: 'dev_construction_boost', name: 'Tecnología de Construcción', description: '-20% costo de construcción por 48h.', type: 'development', rarity: 'epic', category: 'civilization', effect: { type: 'reduce_cost', value: 20, duration: 2880 }, icon: '🏗️', stackable: true, maxStack: 10, tradable: true },
  
  // Militar
  { id: 'dev_weapon_research', name: 'Prototipo de Arma', description: '+10% daño de armas por 24h.', type: 'development', rarity: 'rare', category: 'military', effect: { type: 'increase_production', value: 10, duration: 1440 }, icon: '⚔️', stackable: true, maxStack: 15, tradable: true },
  { id: 'dev_shield_tech', name: 'Escudo Avanzado', description: '+15% escudos por 48h.', type: 'development', rarity: 'epic', category: 'military', effect: { type: 'increase_production', value: 15, duration: 2880 }, icon: '🛡️', stackable: true, maxStack: 10, tradable: true },
  
  // Economía
  { id: 'dev_mining_tech', name: 'Tecnología Minera', description: '+25% producción de metal por 24h.', type: 'development', rarity: 'rare', category: 'economy', effect: { type: 'increase_production', value: 25, duration: 1440 }, icon: '⛏️', stackable: true, maxStack: 20, tradable: true },
  { id: 'dev_plasma_efficiency', name: 'Eficiencia de Plasma', description: '+25% producción de plasma por 24h.', type: 'development', rarity: 'rare', category: 'economy', effect: { type: 'increase_production', value: 25, duration: 1440 }, icon: '⚡', stackable: true, maxStack: 20, tradable: true },
  { id: 'dev_storage_expansion', name: 'Expansión de Almacén', description: '+50% capacidad de almacén por 72h.', type: 'development', rarity: 'epic', category: 'economy', effect: { type: 'increase_capacity', value: 50, duration: 4320 }, icon: '📦', stackable: true, maxStack: 10, tradable: true }
];

// ============================================
// MATERIALES ESPECIALES
// ============================================
export const MATERIALS: Item[] = [
  { id: 'mat_carbon', name: 'Fibra de Carbono', description: 'Material ligero para construcción de naves.', type: 'material', rarity: 'uncommon', icon: '⚫', stackable: true, maxStack: 9999, tradable: true, source: ['instances', 'mining'] },
  { id: 'mat_titanium', name: 'Aleación de Titanio', description: 'Metal resistente para blindajes.', type: 'material', rarity: 'rare', icon: '⚪', stackable: true, maxStack: 5000, tradable: true, source: ['instances', 'trading'] },
  { id: 'mat_energy_core', name: 'Núcleo de Energía', description: 'Fuente de energía para sistemas avanzados.', type: 'material', rarity: 'epic', icon: '💠', stackable: true, maxStack: 1000, tradable: true, source: ['restricted_instances'] },
  { id: 'mat_dark_matter', name: 'Materia Oscura', description: 'Material misterioso de alto valor.', type: 'material', rarity: 'legendary', icon: '🌌', stackable: true, maxStack: 500, tradable: false, source: ['championships', 'divine_chests'] },
  { id: 'mat_quantum_chip', name: 'Chip Cuántico', description: 'Procesador avanzado para naves.', type: 'material', rarity: 'epic', icon: '🔲', stackable: true, maxStack: 500, tradable: true, source: ['research', 'trading'] }
];

// ============================================
// ITEMS ESPECIALES
// ============================================
export const SPECIAL_ITEMS: Item[] = [
  { id: 'rename_card', name: 'Tarjeta de Renombre', description: 'Cambia el nombre de tu planeta o comandante.', type: 'special', rarity: 'rare', icon: '✏️', stackable: true, maxStack: 10, tradable: false },
  { id: 'transfer_pass', name: 'Pase de Transferencia', description: 'Transfiere recursos entre planetas.', type: 'special', rarity: 'epic', icon: '🔄', stackable: true, maxStack: 20, tradable: false },
  { id: 'alliance_flag', name: 'Bandera de Alianza', description: 'Crea o mejora una alianza.', type: 'special', rarity: 'legendary', icon: '🚩', stackable: true, maxStack: 5, tradable: false },
  { id: 'anniversary_cake', name: 'Pastel de Aniversario', description: 'Item conmemorativo con recompensas sorpresa.', type: 'special', rarity: 'epic', icon: '🎂', stackable: true, maxStack: 50, tradable: false },
  { id: 'lucky_coin', name: 'Moneda de la Suerte', description: 'Aumenta probabilidad de drop por 1 hora.', type: 'special', rarity: 'rare', icon: '🪙', stackable: true, maxStack: 100, tradable: true }
];

// ============================================
// TODOS LOS ITEMS
// ============================================
export const ALL_ITEMS: Item[] = [
  ...BLUEPRINTS,
  ...CHESTS,
  ...CONSUMABLES,
  ...LIFE_BOATS,
  ...DEVELOPMENT_ITEMS,
  ...MATERIALS,
  ...SPECIAL_ITEMS
];

// ============================================
// HELPERS
// ============================================

export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find(item => item.id === id);
}

export function getItemsByType(type: ItemType): Item[] {
  return ALL_ITEMS.filter(item => item.type === type);
}

export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return ALL_ITEMS.filter(item => item.rarity === rarity);
}

export function getBlueprints(): Blueprint[] {
  return BLUEPRINTS;
}

export function getChestById(id: string): Chest | undefined {
  return CHESTS.find(chest => chest.id === id);
}

export function getConsumableById(id: string): Consumable | undefined {
  return CONSUMABLES.find(c => c.id === id);
}

export function getLifeBoatById(id: string): LifeBoat | undefined {
  return LIFE_BOATS.find(boat => boat.id === id);
}

/**
 * Abrir un cofre y obtener items
 */
export function openChest(chestId: string): { itemId: string; amount: number }[] {
  const chest = getChestById(chestId);
  if (!chest) return [];
  
  const rewards: { itemId: string; amount: number }[] = [];
  
  // Items garantizados
  for (const guaranteedId of chest.guaranteedItems || []) {
    const content = chest.contents.find(c => c.itemId === guaranteedId);
    if (content) {
      const amount = Math.floor(Math.random() * (content.maxAmount - content.minAmount + 1)) + content.minAmount;
      rewards.push({ itemId: guaranteedId, amount });
    }
  }
  
  // Items aleatorios
  for (const content of chest.contents) {
    // Skip si ya está en garantizados
    if (chest.guaranteedItems?.includes(content.itemId)) continue;
    
    const roll = Math.random() * 100;
    if (roll <= content.dropChance) {
      const amount = Math.floor(Math.random() * (content.maxAmount - content.minAmount + 1)) + content.minAmount;
      rewards.push({ itemId: content.itemId, amount });
    }
  }
  
  return rewards;
}

/**
 * Calcular precio de venta de un item
 */
export function calculateItemSellPrice(item: Item): number {
  const basePrices: Record<ItemRarity, number> = {
    common: 100,
    uncommon: 250,
    rare: 500,
    epic: 1500,
    legendary: 5000,
    divine: 20000
  };
  
  let price = basePrices[item.rarity];
  
  // Multiplicador por tipo
  const typeMultipliers: Record<ItemType, number> = {
    blueprint: 2,
    chest: 1.5,
    consumable: 0.8,
    life_boat: 1.2,
    development: 1.5,
    material: 0.5,
    gem: 3,
    chip: 2.5,
    special: 1
  };
  
  price *= typeMultipliers[item.type];
  
  return Math.floor(price);
}

/**
 * Obtener drop rate de un item de una fuente específica
 */
export function getDropRate(itemId: string, source: string): number {
  const item = getItemById(itemId);
  if (!item || !item.dropRate) return 0;
  
  // Verificar si la fuente está en las fuentes del item
  if (!item.source?.includes(source)) return 0;
  
  // Modificadores de fuente
  const sourceModifiers: Record<string, number> = {
    'daily_mission': 1.5,
    'arena': 1.2,
    'pvp_season': 2.0,
    'constellation': 1.8,
    'restricted': 1.5,
    'championship': 2.5,
    'divine_chest': 3.0
  };
  
  const modifier = sourceModifiers[source] || 1.0;
  return item.dropRate * modifier;
}

export const ItemSystem = {
  ALL_ITEMS,
  BLUEPRINTS,
  CHESTS,
  CONSUMABLES,
  LIFE_BOATS,
  DEVELOPMENT_ITEMS,
  MATERIALS,
  SPECIAL_ITEMS,
  getItemById,
  getItemsByType,
  getItemsByRarity,
  getBlueprints,
  getChestById,
  getConsumableById,
  getLifeBoatById,
  openChest,
  calculateItemSellPrice,
  getDropRate
};
