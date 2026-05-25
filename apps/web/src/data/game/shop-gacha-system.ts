/**
 * SISTEMA COMPLETO DE SHOP, GACHA Y COMPRAS - GALAXY ONLINE II
 * Tienda, gacha de comandantes, probabilidades, eventos, descuentos y ofertas
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';
import type { CommanderRarity } from './commanders-complete';
import type { ItemRarity } from './items-complete';

// ============================================
// TIPOS Y ENUMERACIONES
// ============================================
export type CurrencyType = 'credits' | 'gold' | 'honor' | 'vouchers' | 'event_tokens';
export type ShopCategory = 'commanders' | 'items' | 'resources' | 'speedups' | 'special' | 'packages';
export type GachaType = 'basic' | 'advanced' | 'legendary' | 'event' | 'divine';
export type OfferType = 'daily' | 'weekly' | 'flash' | 'new_player' | 'vip' | 'event';

// ============================================
// CURRENCY EXCHANGE RATES
// ============================================
export const CURRENCY_RATES: Record<string, number> = {
  gold_to_credits: 100,      // 1 gold = 100 credits
  gold_to_honor: 10,         // 1 gold = 10 honor
  gold_to_vouchers: 1,       // 1 gold = 1 voucher
  credits_to_metal: 0.8,     // 1 credit = 0.8 metal
  credits_to_plasma: 0.4,    // 1 credit = 0.4 plasma
};

// ============================================
// SISTEMA GACHA - PROBABILIDADES BASE
// ============================================
export interface GachaProbabilities {
  type: GachaType;
  cost: {
    currency: CurrencyType;
    amount: number;
  };
  probabilities: Record<CommanderRarity | ItemRarity, number>;
  pitySystem?: {
    guaranteedRarity: CommanderRarity | ItemRarity;
    pullsRequired: number;
  };
  bonusRewards?: {
    pullsRequired: number;
    bonusItem: string;
  }[];
}

export const GACHA_SYSTEMS: GachaProbabilities[] = [
  // GACHA BÁSICO
  {
    type: 'basic',
    cost: { currency: 'credits', amount: 5000 },
    probabilities: {
      common: 60,
      uncommon: 30,
      rare: 9,
      epic: 1,
      legendary: 0,
      divine: 0,
      super: 0
    },
    pitySystem: {
      guaranteedRarity: 'rare',
      pullsRequired: 20
    },
    bonusRewards: [
      { pullsRequired: 10, bonusItem: 'speedup_1h' },
      { pullsRequired: 50, bonusItem: 'chest_rare' }
    ]
  },
  
  // GACHA AVANZADO
  {
    type: 'advanced',
    cost: { currency: 'gold', amount: 100 },
    probabilities: {
      common: 30,
      uncommon: 40,
      rare: 20,
      epic: 8,
      legendary: 1.9,
      divine: 0.1,
      super: 0
    },
    pitySystem: {
      guaranteedRarity: 'epic',
      pullsRequired: 30
    },
    bonusRewards: [
      { pullsRequired: 10, bonusItem: 'chest_epic' },
      { pullsRequired: 50, bonusItem: 'gem_red_3' },
      { pullsRequired: 100, bonusItem: 'cmd_rare_random' }
    ]
  },
  
  // GACHA LEGENDARIO
  {
    type: 'legendary',
    cost: { currency: 'gold', amount: 500 },
    probabilities: {
      common: 0,
      uncommon: 10,
      rare: 30,
      epic: 40,
      legendary: 19,
      divine: 1,
      super: 0
    },
    pitySystem: {
      guaranteedRarity: 'legendary',
      pullsRequired: 50
    },
    bonusRewards: [
      { pullsRequired: 10, bonusItem: 'chest_legendary' },
      { pullsRequired: 50, bonusItem: 'cmd_legendary_random' },
      { pullsRequired: 100, bonusItem: 'chip_legendary' }
    ]
  },
  
  // GACHA DIVINO (Eventos especiales)
  {
    type: 'divine',
    cost: { currency: 'gold', amount: 2000 },
    probabilities: {
      common: 0,
      uncommon: 0,
      rare: 10,
      epic: 30,
      legendary: 50,
      divine: 10,
      super: 0
    },
    pitySystem: {
      guaranteedRarity: 'divine',
      pullsRequired: 100
    },
    bonusRewards: [
      { pullsRequired: 10, bonusItem: 'chest_divine' },
      { pullsRequired: 50, bonusItem: 'cmd_divine_random' },
      { pullsRequired: 100, bonusItem: 'exclusive_avatar' }
    ]
  }
];

// ============================================
// TODOS LOS COMANDANTES DISPONIBLES EN GACHA
// ============================================
export interface GachaCommander {
  commanderId: string;
  name: string;
  rarity: CommanderRarity;
  dropWeight: number; // Peso dentro de su rareza
  featured?: boolean; // Si está en banner destacado
  limited?: boolean; // Si es de tiempo limitado
}

export const GACHA_COMMANDERS_POOL: GachaCommander[] = [
  // COMUNES (Common) - Drop Weight Total: 100
  { commanderId: 'cmd_basic_01', name: 'Cadete Estelar', rarity: 'common', dropWeight: 30 },
  { commanderId: 'cmd_basic_02', name: 'Piloto Cadete', rarity: 'common', dropWeight: 25 },
  { commanderId: 'cmd_defense_01', name: 'Oficial de Defensa', rarity: 'common', dropWeight: 20 },
  { commanderId: 'cmd_speed_01', name: 'Piloto de Intercepción', rarity: 'common', dropWeight: 25 },
  
  // POCO COMUNES (Uncommon) - Drop Weight Total: 100
  { commanderId: 'cmd_balanced_01', name: 'Capitán Galáctico', rarity: 'rare', dropWeight: 20 },
  { commanderId: 'cmd_attack_01', name: 'Asesino Espacial', rarity: 'rare', dropWeight: 20 },
  { commanderId: 'cmd_support_01', name: 'Ingeniero de Flota', rarity: 'rare', dropWeight: 20 },
  { commanderId: 'cmd_sniper_01', name: 'Francotirador Cósmico', rarity: 'rare', dropWeight: 20 },
  { commanderId: 'cmd_tank_01', name: 'Piloto de Blindaje', rarity: 'rare', dropWeight: 20 },
  
  // RAROS (Rare/Epic) - Drop Weight Total: 100
  { commanderId: 'cmd_epic_01', name: 'Almirante del Sector', rarity: 'epic', dropWeight: 25 },
  { commanderId: 'cmd_warlord', name: 'Señor de la Guerra', rarity: 'epic', dropWeight: 25 },
  { commanderId: 'cmd_void_walker', name: 'Caminante del Vacío', rarity: 'epic', dropWeight: 25 },
  { commanderId: 'cmd_healer', name: 'Médico de Combate', rarity: 'epic', dropWeight: 15 },
  { commanderId: 'cmd_saboteur', name: 'Saboteador', rarity: 'epic', dropWeight: 10, limited: true },
  
  // LEGENDARIOS (Legendary) - Drop Weight Total: 100
  { commanderId: 'cmd_legend_01', name: 'Comandante Supremo', rarity: 'legendary', dropWeight: 30, featured: true },
  { commanderId: 'cmd_titan', name: 'Titán Indestructible', rarity: 'legendary', dropWeight: 25 },
  { commanderId: 'cmd_phoenix', name: 'Almirante Fénix', rarity: 'legendary', dropWeight: 20 },
  { commanderId: 'cmd_nightmare', name: 'Pesadilla Espacial', rarity: 'legendary', dropWeight: 15 },
  { commanderId: 'cmd_emperor', name: 'Emperador Galáctico', rarity: 'legendary', dropWeight: 10, limited: true },
  
  // DIVINOS (Divine) - Drop Weight Total: 100
  { commanderId: 'cmd_divine_01', name: 'Avatar de la Galaxia', rarity: 'divine', dropWeight: 40 },
  { commanderId: 'cmd_cosmos', name: 'Señor del Cosmos', rarity: 'divine', dropWeight: 30, featured: true },
  { commanderId: 'cmd_eternal', name: 'Comandante Eterno', rarity: 'divine', dropWeight: 20 },
  { commanderId: 'cmd_creator', name: 'Creador de Mundos', rarity: 'divine', dropWeight: 10, limited: true }
];

// ============================================
// SISTEMA DE FUSIÓN DE COMANDANTES
// ============================================
export interface FusionRecipe {
  inputRarity: CommanderRarity;
  inputCount: number; // Cuántas cartas necesitas
  outputRarity: CommanderRarity;
  successRate: number; // 0-100%
  cost: {
    credits?: number;
    gold?: number;
    materials?: string[];
  };
  failureResult?: 'nothing' | 'lower_rarity' | 'partial_refund';
}

export const FUSION_RECIPES: FusionRecipe[] = [
  // Fusión Básica: 3 Common → 1 Uncommon (Rare)
  {
    inputRarity: 'common',
    inputCount: 3,
    outputRarity: 'rare',
    successRate: 80,
    cost: { credits: 5000 },
    failureResult: 'partial_refund'
  },
  
  // Fusión Intermedia: 3 Uncommon → 1 Rare (Epic)
  {
    inputRarity: 'rare',
    inputCount: 3,
    outputRarity: 'epic',
    successRate: 70,
    cost: { credits: 25000, gold: 50 },
    failureResult: 'lower_rarity'
  },
  
  // Fusión Avanzada: 3 Rare → 1 Epic (Legendary)
  {
    inputRarity: 'epic',
    inputCount: 3,
    outputRarity: 'legendary',
    successRate: 60,
    cost: { credits: 100000, gold: 200 },
    failureResult: 'lower_rarity'
  },
  
  // Fusión Legendaria: 3 Epic → 1 Legendary (Divine)
  {
    inputRarity: 'legendary',
    inputCount: 3,
    outputRarity: 'divine',
    successRate: 40,
    cost: { credits: 500000, gold: 1000, materials: ['mat_dark_matter', 'mat_quantum_chip'] },
    failureResult: 'partial_refund'
  },
  
  // Fusión Garantizada: 5 Legendary → 1 Divine (100%)
  {
    inputRarity: 'legendary',
    inputCount: 5,
    outputRarity: 'divine',
    successRate: 100,
    cost: { credits: 1000000, gold: 2000 },
    failureResult: 'nothing' // No puede fallar
  }
];

// ============================================
// SHOP ITEMS
// ============================================
export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  itemId: string;
  currency: CurrencyType;
  basePrice: number;
  stockType: 'unlimited' | 'limited' | 'daily' | 'weekly';
  stockLimit?: number;
  vipLevelRequired?: number;
  levelRequired?: number;
  discountable: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  // RECURSOS
  { id: 'shop_metal_1k', name: 'Metal x1,000', category: 'resources', itemId: 'metal_1000', currency: 'credits', basePrice: 1200, stockType: 'unlimited', discountable: true },
  { id: 'shop_metal_10k', name: 'Metal x10,000', category: 'resources', itemId: 'metal_10000', currency: 'credits', basePrice: 11000, stockType: 'unlimited', discountable: true },
  { id: 'shop_plasma_1k', name: 'Plasma x1,000', category: 'resources', itemId: 'plasma_1000', currency: 'credits', basePrice: 2400, stockType: 'unlimited', discountable: true },
  { id: 'shop_plasma_5k', name: 'Plasma x5,000', category: 'resources', itemId: 'plasma_5000', currency: 'credits', basePrice: 11000, stockType: 'unlimited', discountable: true },
  
  // SPEEDUPS
  { id: 'shop_speedup_1h', name: 'Speedup 1 Hora', category: 'speedups', itemId: 'speedup_1h', currency: 'credits', basePrice: 5000, stockType: 'daily', stockLimit: 10, discountable: true },
  { id: 'shop_speedup_4h', name: 'Speedup 4 Horas', category: 'speedups', itemId: 'speedup_4h', currency: 'credits', basePrice: 18000, stockType: 'daily', stockLimit: 5, discountable: true },
  { id: 'shop_speedup_8h', name: 'Speedup 8 Horas', category: 'speedups', itemId: 'speedup_8h', currency: 'gold', basePrice: 50, stockType: 'daily', stockLimit: 3, discountable: false },
  
  // COFRES
  { id: 'shop_chest_rare', name: 'Cofre Raro', category: 'items', itemId: 'chest_rare', currency: 'credits', basePrice: 25000, stockType: 'daily', stockLimit: 3, discountable: true },
  { id: 'shop_chest_epic', name: 'Cofre Épico', category: 'items', itemId: 'chest_epic', currency: 'gold', basePrice: 100, stockType: 'weekly', stockLimit: 2, discountable: false },
  { id: 'shop_chest_legendary', name: 'Cofre Legendario', category: 'items', itemId: 'chest_legendary', currency: 'gold', basePrice: 500, stockType: 'weekly', stockLimit: 1, discountable: false, vipLevelRequired: 5 },
  
  // BLUEPRINTS
  { id: 'shop_bp_frigate', name: 'Blueprint Fragata T3', category: 'items', itemId: 'bp_frigate_t3', currency: 'honor', basePrice: 5000, stockType: 'weekly', stockLimit: 2, levelRequired: 15, discountable: false },
  { id: 'shop_bp_cruiser', name: 'Blueprint Crucero T2', category: 'items', itemId: 'bp_cruiser_t2', currency: 'honor', basePrice: 15000, stockType: 'weekly', stockLimit: 1, levelRequired: 25, discountable: false },
  
  // GEMS
  { id: 'shop_gem_red_3', name: 'Rubí Brillante', category: 'items', itemId: 'gem_red_3', currency: 'gold', basePrice: 200, stockType: 'weekly', stockLimit: 3, discountable: false },
  { id: 'shop_gem_blue_3', name: 'Zafiro Brillante', category: 'items', itemId: 'gem_blue_3', currency: 'gold', basePrice: 200, stockType: 'weekly', stockLimit: 3, discountable: false },
  
  // PAQUETES ESPECIALES
  { id: 'shop_starter_pack', name: 'Paquete de Inicio', category: 'packages', itemId: 'starter_pack', currency: 'gold', basePrice: 99, stockType: 'limited', stockLimit: 1, discountable: false },
  { id: 'shop_weekly_pack', name: 'Paquete Semanal', category: 'packages', itemId: 'weekly_pack', currency: 'gold', basePrice: 499, stockType: 'weekly', stockLimit: 1, discountable: false },
  { id: 'shop_monthly_pack', name: 'Paquete Mensual', category: 'packages', itemId: 'monthly_pack', currency: 'gold', basePrice: 1999, stockType: 'limited', stockLimit: 1, discountable: false }
];

// ============================================
// OFERTAS Y DESCUENTOS
// ============================================
export interface ShopOffer {
  id: string;
  name: string;
  type: OfferType;
  description: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
  originalPrice: number;
  discountedPrice: number;
  currency: CurrencyType;
  discountPercent: number;
  startTime?: number;
  endTime?: number;
  purchaseLimit: number;
  targetVipLevels?: number[];
  targetPlayerLevels?: [number, number]; // [min, max]
  icon: string;
}

export const SHOP_OFFERS: ShopOffer[] = [
  // OFERTAS DIARIAS
  {
    id: 'offer_daily_resources',
    name: 'Paquete Diario de Recursos',
    type: 'daily',
    description: 'Recursos esenciales para tu imperio galáctico.',
    items: [
      { itemId: 'metal_5000', quantity: 1 },
      { itemId: 'plasma_2500', quantity: 1 },
      { itemId: 'credits_5000', quantity: 1 },
      { itemId: 'speedup_1h', quantity: 2 }
    ],
    originalPrice: 15000,
    discountedPrice: 5000,
    currency: 'credits',
    discountPercent: 67,
    purchaseLimit: 1,
    icon: '📦'
  },
  {
    id: 'offer_daily_speedups',
    name: 'Paquete Diario de Speedups',
    type: 'daily',
    description: 'Acelera tu progreso con speedups.',
    items: [
      { itemId: 'speedup_1h', quantity: 5 },
      { itemId: 'speedup_4h', quantity: 2 }
    ],
    originalPrice: 61000,
    discountedPrice: 25000,
    currency: 'credits',
    discountPercent: 59,
    purchaseLimit: 1,
    icon: '⏱️'
  },
  
  // OFERTAS SEMANALES
  {
    id: 'offer_weekly_commander',
    name: 'Paquete de Comandante Semanal',
    type: 'weekly',
    description: 'Gacha x10 + Recursos para mejorar comandantes.',
    items: [
      { itemId: 'gacha_advanced_10', quantity: 1 },
      { itemId: 'exp_booster_2x', quantity: 5 },
      { itemId: 'gem_red_2', quantity: 3 }
    ],
    originalPrice: 1500,
    discountedPrice: 999,
    currency: 'gold',
    discountPercent: 33,
    purchaseLimit: 1,
    targetVipLevels: [1, 10],
    icon: '👤'
  },
  
  // OFERTAS FLASH (Tiempo limitado)
  {
    id: 'offer_flash_gems',
    name: 'Flash Sale: Gemas',
    type: 'flash',
    description: '¡Solo por 2 horas! Gemas al 50% de descuento.',
    items: [
      { itemId: 'gem_red_4', quantity: 2 },
      { itemId: 'gem_blue_4', quantity: 2 },
      { itemId: 'gem_green_4', quantity: 2 }
    ],
    originalPrice: 2400,
    discountedPrice: 1200,
    currency: 'gold',
    discountPercent: 50,
    purchaseLimit: 2,
    icon: '💎'
  },
  
  // OFERTAS NUEVO JUGADOR
  {
    id: 'offer_new_player_starter',
    name: 'Paquete de Bienvenida',
    type: 'new_player',
    description: 'Impulso inicial para nuevos comandantes. Disponible solo 7 días.',
    items: [
      { itemId: 'cmd_rare_random', quantity: 1 },
      { itemId: 'metal_10000', quantity: 1 },
      { itemId: 'plasma_5000', quantity: 1 },
      { itemId: 'speedup_4h', quantity: 5 },
      { itemId: 'chest_epic', quantity: 2 }
    ],
    originalPrice: 2000,
    discountedPrice: 499,
    currency: 'gold',
    discountPercent: 75,
    purchaseLimit: 1,
    targetPlayerLevels: [1, 10],
    icon: '🎁'
  },
  
  // OFERTAS VIP
  {
    id: 'offer_vip_monthly',
    name: 'Paquete VIP Mensual',
    type: 'vip',
    description: 'Exclusivo para jugadores VIP. Incluye comandante legendario.',
    items: [
      { itemId: 'cmd_legendary_random', quantity: 1 },
      { itemId: 'gem_red_5', quantity: 1 },
      { itemId: 'chip_legendary', quantity: 1 },
      { itemId: 'chest_divine', quantity: 1 }
    ],
    originalPrice: 5000,
    discountedPrice: 2999,
    currency: 'gold',
    discountPercent: 40,
    purchaseLimit: 1,
    targetVipLevels: [8, 15],
    icon: '👑'
  },
  
  // OFERTAS DE EVENTO
  {
    id: 'offer_event_anniversary',
    name: 'Paquete de Aniversario',
    type: 'event',
    description: 'Celebración especial del juego. ¡Edición limitada!',
    items: [
      { itemId: 'cmd_divine_random', quantity: 1 },
      { itemId: 'exclusive_skin', quantity: 1 },
      { itemId: 'title_legend', quantity: 1 },
      { itemId: 'chest_divine', quantity: 5 }
    ],
    originalPrice: 10000,
    discountedPrice: 4999,
    currency: 'gold',
    discountPercent: 50,
    purchaseLimit: 1,
    icon: '🎉'
  }
];

// ============================================
// SISTEMA DE SORTEOS (RAFFLES)
// ============================================
export interface RaffleEvent {
  id: string;
  name: string;
  description: string;
  ticketCost: {
    currency: CurrencyType;
    amount: number;
  };
  ticketCurrency: CurrencyType;
  maxTicketsPerPlayer: number;
  totalTickets: number;
  prizes: {
    rank: number;
    itemId: string;
    quantity: number;
    probability?: number; // Para sorteos con múltiples ganadores
  }[];
  startTime: number;
  endTime: number;
  drawTime: number;
}

export const RAFFLE_EVENTS: RaffleEvent[] = [
  {
    id: 'raffle_weekly_gold',
    name: 'Sorteo Semanal de Oro',
    description: '¡Gana hasta 100,000 de oro!',
    ticketCost: { currency: 'credits', amount: 10000 },
    ticketCurrency: 'credits',
    maxTicketsPerPlayer: 100,
    totalTickets: 10000,
    prizes: [
      { rank: 1, itemId: 'gold_100000', quantity: 1 },
      { rank: 2, itemId: 'gold_50000', quantity: 1 },
      { rank: 3, itemId: 'gold_25000', quantity: 1 },
      { rank: 4, itemId: 'gold_10000', quantity: 1, probability: 0.1 } // 10% de los participantes
    ],
    startTime: 0,
    endTime: 604800, // 7 días
    drawTime: 604800
  },
  {
    id: 'raffle_monthly_commander',
    name: 'Sorteo Mensual de Comandante Divino',
    description: '¡Gana un Comandante Divino exclusivo!',
    ticketCost: { currency: 'gold', amount: 100 },
    ticketCurrency: 'gold',
    maxTicketsPerPlayer: 50,
    totalTickets: 5000,
    prizes: [
      { rank: 1, itemId: 'cmd_divine_random', quantity: 1 },
      { rank: 2, itemId: 'cmd_legendary_random', quantity: 1 },
      { rank: 3, itemId: 'cmd_legendary_random', quantity: 1 },
      { rank: 4, itemId: 'chest_legendary', quantity: 5, probability: 0.05 }
    ],
    startTime: 0,
    endTime: 2592000, // 30 días
    drawTime: 2592000
  }
];

// ============================================
// EVENTOS DE COMPRA
// ============================================
export interface PurchaseEvent {
  id: string;
  name: string;
  description: string;
  type: 'spending' | 'purchase_amount' | 'purchase_count';
  startTime: number;
  endTime: number;
  milestones: {
    threshold: number; // Cantidad de oro gastado/comprado
    reward: {
      itemId: string;
      quantity: number;
    };
  }[];
}

export const PURCHASE_EVENTS: PurchaseEvent[] = [
  {
    id: 'event_spending_weekly',
    name: 'Evento de Gasto Semanal',
    description: 'Gasta oro y gana recompensas exclusivas.',
    type: 'spending',
    startTime: 0,
    endTime: 604800,
    milestones: [
      { threshold: 500, reward: { itemId: 'chest_rare', quantity: 2 } },
      { threshold: 1000, reward: { itemId: 'chest_epic', quantity: 1 } },
      { threshold: 3000, reward: { itemId: 'cmd_rare_random', quantity: 1 } },
      { threshold: 5000, reward: { itemId: 'chest_legendary', quantity: 1 } },
      { threshold: 10000, reward: { itemId: 'cmd_legendary_random', quantity: 1 } },
      { threshold: 50000, reward: { itemId: 'cmd_divine_random', quantity: 1 } }
    ]
  },
  {
    id: 'event_recharge_bonus',
    name: 'Bonus de Recarga',
    description: 'Recarga oro y obtén bonus adicional.',
    type: 'purchase_amount',
    startTime: 0,
    endTime: 2592000,
    milestones: [
      { threshold: 99, reward: { itemId: 'chest_rare', quantity: 3 } },
      { threshold: 499, reward: { itemId: 'chest_epic', quantity: 2 } },
      { threshold: 999, reward: { itemId: 'chest_legendary', quantity: 1 } },
      { threshold: 1999, reward: { itemId: 'cmd_legendary_random', quantity: 1 } },
      { threshold: 4999, reward: { itemId: 'cmd_divine_random', quantity: 1 } }
    ]
  }
];

// ============================================
// CÁLCULO DE PROBABILIDADES GACHA
// ============================================
export function calculateGachaDrop(
  gachaType: GachaType,
  pityCounter: number,
  featuredCommanderId?: string
): { rarity: CommanderRarity | ItemRarity; commanderId?: string; isPity: boolean } {
  const gachaSystem = GACHA_SYSTEMS.find(g => g.type === gachaType);
  if (!gachaSystem) throw new Error(`Sistema gacha no encontrado: ${gachaType}`);
  
  // Verificar sistema de pity
  if (gachaSystem.pitySystem && pityCounter >= gachaSystem.pitySystem.pullsRequired) {
    const guaranteedPool = GACHA_COMMANDERS_POOL.filter(
      c => c.rarity === gachaSystem.pitySystem!.guaranteedRarity
    );
    const selected = guaranteedPool[Math.floor(Math.random() * guaranteedPool.length)];
    return {
      rarity: gachaSystem.pitySystem.guaranteedRarity,
      commanderId: selected?.commanderId,
      isPity: true
    };
  }
  
  // Roll normal
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  const rarities: (CommanderRarity | ItemRarity)[] = ['divine', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  
  for (const rarity of rarities) {
    const probability = gachaSystem.probabilities[rarity] || 0;
    cumulative += probability;
    
    if (roll <= cumulative) {
      // Seleccionar comandante del pool
      const pool = GACHA_COMMANDERS_POOL.filter(c => c.rarity === rarity);
      
      if (pool.length === 0) continue;
      
      // Si hay featured, aumentar probabilidad
      let selected = pool[Math.floor(Math.random() * pool.length)];
      
      if (featuredCommanderId) {
        const featured = pool.find(c => c.commanderId === featuredCommanderId && c.featured);
        if (featured && Math.random() < 0.5) { // 50% de chance de forzar featured
          selected = featured;
        }
      }
      
      return {
        rarity,
        commanderId: selected?.commanderId,
        isPity: false
      };
    }
  }
  
  // Default a common
  const commonPool = GACHA_COMMANDERS_POOL.filter(c => c.rarity === 'common');
  return {
    rarity: 'common',
    commanderId: commonPool[Math.floor(Math.random() * commonPool.length)]?.commanderId,
    isPity: false
  };
}

// ============================================
// CÁLCULO DE FUSIÓN
// ============================================
export function calculateFusion(
  inputRarity: CommanderRarity,
  inputCount: number,
  recipe: FusionRecipe
): { success: boolean; resultRarity: CommanderRarity; refundAmount?: number } {
  // Verificar si la receta coincide
  if (recipe.inputRarity !== inputRarity || recipe.inputCount > inputCount) {
    throw new Error('Materiales insuficientes para la fusión');
  }
  
  const roll = Math.random() * 100;
  const success = roll <= recipe.successRate;
  
  if (success) {
    return {
      success: true,
      resultRarity: recipe.outputRarity
    };
  } else {
    // Manejar fallo según el tipo
    switch (recipe.failureResult) {
      case 'nothing':
        return { success: false, resultRarity: inputRarity };
      case 'lower_rarity':
        const lowerRarities: CommanderRarity[] = ['common', 'rare', 'epic', 'legendary', 'divine'];
        const currentIndex = lowerRarities.indexOf(inputRarity);
        const lowerRarity = currentIndex > 0 ? lowerRarities[currentIndex - 1] : inputRarity;
        return { success: false, resultRarity: lowerRarity };
      case 'partial_refund':
        return {
          success: false,
          resultRarity: inputRarity,
          refundAmount: Math.floor(inputCount * 0.5)
        };
      default:
        return { success: false, resultRarity: inputRarity };
    }
  }
}

// ============================================
// CÁLCULO DE PRECIOS CON DESCUENTO
// ============================================
export function calculateDiscountedPrice(
  basePrice: number,
  discountPercent: number,
  vipLevel: number = 0
): { finalPrice: number; discountApplied: number; vipBonus: number } {
  // Bonus VIP adicional
  const vipBonus = vipLevel * 0.02; // 2% extra por nivel VIP
  const totalDiscount = Math.min(95, discountPercent + vipBonus * 100); // Máximo 95%
  
  const discountApplied = basePrice * (totalDiscount / 100);
  const finalPrice = Math.floor(basePrice - discountApplied);
  
  return {
    finalPrice,
    discountApplied: Math.floor(discountApplied),
    vipBonus: vipBonus * 100
  };
}

// ============================================
// HELPERS
// ============================================
export function getGachaSystem(type: GachaType): GachaProbabilities | undefined {
  return GACHA_SYSTEMS.find(g => g.type === type);
}

export function getCommanderDropRate(commanderId: string, gachaType: GachaType): number {
  const commander = GACHA_COMMANDERS_POOL.find(c => c.commanderId === commanderId);
  if (!commander) return 0;
  
  const gachaSystem = getGachaSystem(gachaType);
  if (!gachaSystem) return 0;
  
  // Calcular rate basado en peso dentro de la rareza
  const rarityPool = GACHA_COMMANDERS_POOL.filter(c => c.rarity === commander.rarity);
  const totalWeight = rarityPool.reduce((sum, c) => sum + c.dropWeight, 0);
  const individualWeight = commander.dropWeight / totalWeight;
  
  const rarityProbability = gachaSystem.probabilities[commander.rarity] || 0;
  return rarityProbability * individualWeight;
}

export function getFusionRecipe(
  inputRarity: CommanderRarity,
  inputCount: number
): FusionRecipe | undefined {
  return FUSION_RECIPES.find(
    r => r.inputRarity === inputRarity && r.inputCount === inputCount
  );
}

export function getActiveOffers(
  currentTime: number,
  playerLevel: number,
  vipLevel: number
): ShopOffer[] {
  return SHOP_OFFERS.filter(offer => {
    // Verificar tiempo
    if (offer.startTime && currentTime < offer.startTime) return false;
    if (offer.endTime && currentTime > offer.endTime) return false;
    
    // Verificar nivel
    if (offer.targetPlayerLevels) {
      const [min, max] = offer.targetPlayerLevels;
      if (playerLevel < min || playerLevel > max) return false;
    }
    
    // Verificar VIP
    if (offer.targetVipLevels && !offer.targetVipLevels.includes(vipLevel)) {
      return false;
    }
    
    return true;
  });
}

export const ShopGachaSystem = {
  CURRENCY_RATES,
  GACHA_SYSTEMS,
  GACHA_COMMANDERS_POOL,
  FUSION_RECIPES,
  SHOP_ITEMS,
  SHOP_OFFERS,
  RAFFLE_EVENTS,
  PURCHASE_EVENTS,
  calculateGachaDrop,
  calculateFusion,
  calculateDiscountedPrice,
  getGachaSystem,
  getCommanderDropRate,
  getFusionRecipe,
  getActiveOffers
};
