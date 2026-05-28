import { Router } from 'express';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { asyncHandler } from '@/utils/asyncHandler';

// ============================================================
// TYPES
// ============================================================

export interface CommanderCard {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  role: 'offense' | 'defense' | 'support' | 'balanced';
  baseStats: {
    attack: number;
    defense: number;
    speed: number;
    command: number;
  };
  specialAbility?: string;
  description: string;
  imageUrl?: string;
}

export interface ShipDesign {
  id: string;
  name: string;
  type: 'fighter' | 'cruiser' | 'battleship' | 'carrier' | 'frigate' | 'destroyer';
  class: 'light' | 'medium' | 'heavy' | 'capital';
  baseStats: {
    hull: number;
    shield: number;
    speed: number;
    attack: number;
    he3Capacity: number;
  };
  weaponSlots: number;
  moduleSlots: number;
  description: string;
  techRequired?: number;
}

export interface Formation {
  id: string;
  name: string;
  description: string;
  layout: number[];
  bonuses: {
    attack?: number;
    defense?: number;
    speed?: number;
  };
  icon?: string;
}

// ============================================================
// REFERENCE DATA (Mock - replace with DB calls in production)
// ============================================================

const COMMANDERS: CommanderCard[] = [
  {
    id: 'cmd_001',
    name: 'Kaelen Voss',
    rarity: 'legendary',
    role: 'offense',
    baseStats: { attack: 95, defense: 60, speed: 80, command: 90 },
    specialAbility: 'Blitzkrieg: +25% fleet speed for 3 rounds',
    description: 'Renowned fleet admiral known for aggressive blitz tactics.',
  },
  {
    id: 'cmd_002',
    name: 'Serra Kaine',
    rarity: 'epic',
    role: 'defense',
    baseStats: { attack: 55, defense: 95, speed: 50, command: 85 },
    specialAbility: 'Iron Wall: +30% shield regeneration per round',
    description: 'Master of defensive formations and shield technologies.',
  },
  {
    id: 'cmd_003',
    name: 'Jax Rylar',
    rarity: 'rare',
    role: 'offense',
    baseStats: { attack: 80, defense: 45, speed: 90, command: 70 },
    specialAbility: 'Rapid Strike: First attack each round deals +20% damage',
    description: 'Speed-focused strike commander who hits fast and hard.',
  },
  {
    id: 'cmd_004',
    name: 'Mira Talon',
    rarity: 'epic',
    role: 'support',
    baseStats: { attack: 50, defense: 65, speed: 70, command: 95 },
    specialAbility: 'Coordination: +15% damage for all adjacent stacks',
    description: 'Expert tactician who amplifies allied fleet performance.',
  },
  {
    id: 'cmd_005',
    name: 'Darius Crowe',
    rarity: 'uncommon',
    role: 'balanced',
    baseStats: { attack: 60, defense: 60, speed: 60, command: 60 },
    specialAbility: 'Steady Command: +5% to all combat stats',
    description: 'A reliable commander with no glaring weaknesses.',
  },
  {
    id: 'cmd_006',
    name: 'Lyra Vex',
    rarity: 'rare',
    role: 'offense',
    baseStats: { attack: 85, defense: 40, speed: 75, command: 65 },
    specialAbility: 'Critical Eye: +10% critical hit chance',
    description: 'Precision-focused gunnery expert.',
  },
  {
    id: 'cmd_007',
    name: 'Orin Steele',
    rarity: 'common',
    role: 'defense',
    baseStats: { attack: 35, defense: 70, speed: 40, command: 50 },
    specialAbility: 'Hold the Line: +10% hull integrity',
    description: 'Veteran defensive commander with solid fundamentals.',
  },
  {
    id: 'cmd_008',
    name: 'Nyx Aether',
    rarity: 'legendary',
    role: 'support',
    baseStats: { attack: 45, defense: 55, speed: 85, command: 100 },
    specialAbility: 'Time Dilation: Enemy stacks act at -15 effective speed',
    description: 'Mysterious commander who manipulates the flow of battle.',
  },
  {
    id: 'cmd_009',
    name: 'Thorne Blackwell',
    rarity: 'epic',
    role: 'balanced',
    baseStats: { attack: 75, defense: 75, speed: 70, command: 80 },
    specialAbility: 'Adaptive Tactics: Switch between +20% attack or +20% defense each round',
    description: 'Versatile commander who adapts to any situation.',
  },
  {
    id: 'cmd_010',
    name: 'Elara Moon',
    rarity: 'rare',
    role: 'support',
    baseStats: { attack: 40, defense: 60, speed: 65, command: 85 },
    specialAbility: 'Repair Drones: Restore 5% hull to most damaged stack each round',
    description: 'Engineering specialist with autonomous repair capabilities.',
  },
];

const SHIP_DESIGNS: ShipDesign[] = [
  {
    id: 'ship_001',
    name: 'Viper Interceptor',
    type: 'fighter',
    class: 'light',
    baseStats: { hull: 400, shield: 200, speed: 120, attack: 80, he3Capacity: 50 },
    weaponSlots: 2,
    moduleSlots: 1,
    description: 'Fast and agile fighter ideal for first strikes.',
  },
  {
    id: 'ship_002',
    name: 'Goliath Destroyer',
    type: 'destroyer',
    class: 'medium',
    baseStats: { hull: 1200, shield: 600, speed: 70, attack: 150, he3Capacity: 100 },
    weaponSlots: 3,
    moduleSlots: 2,
    description: 'Heavy hitter with balanced offensive and defensive stats.',
  },
  {
    id: 'ship_003',
    name: 'Leviathan Battleship',
    type: 'battleship',
    class: 'heavy',
    baseStats: { hull: 3000, shield: 1500, speed: 40, attack: 250, he3Capacity: 200 },
    weaponSlots: 4,
    moduleSlots: 3,
    description: 'Slow but devastating. The ultimate damage dealer.',
  },
  {
    id: 'ship_004',
    name: 'Aegis Cruiser',
    type: 'cruiser',
    class: 'medium',
    baseStats: { hull: 1800, shield: 1200, speed: 60, attack: 120, he3Capacity: 150 },
    weaponSlots: 2,
    moduleSlots: 3,
    description: 'Shield-focused vessel with exceptional survivability.',
  },
  {
    id: 'ship_005',
    name: 'Nimbus Carrier',
    type: 'carrier',
    class: 'capital',
    baseStats: { hull: 2500, shield: 1000, speed: 35, attack: 100, he3Capacity: 180 },
    weaponSlots: 3,
    moduleSlots: 4,
    description: 'Command vessel with extensive support capabilities.',
  },
  {
    id: 'ship_006',
    name: 'Spectre Frigate',
    type: 'frigate',
    class: 'light',
    baseStats: { hull: 800, shield: 400, speed: 95, attack: 110, he3Capacity: 80 },
    weaponSlots: 2,
    moduleSlots: 2,
    description: 'Stealth-oriented hit-and-run vessel.',
  },
  {
    id: 'ship_007',
    name: 'Titan Dreadnought',
    type: 'battleship',
    class: 'capital',
    baseStats: { hull: 5000, shield: 2500, speed: 25, attack: 350, he3Capacity: 300 },
    weaponSlots: 5,
    moduleSlots: 4,
    description: 'The ultimate warship. Slow but virtually unstoppable.',
  },
  {
    id: 'ship_008',
    name: 'Wraith Fighter',
    type: 'fighter',
    class: 'light',
    baseStats: { hull: 300, shield: 150, speed: 140, attack: 65, he3Capacity: 40 },
    weaponSlots: 2,
    moduleSlots: 1,
    description: 'Extremely fast but fragile interceptor.',
  },
  {
    id: 'ship_009',
    name: 'Bulwark Defender',
    type: 'cruiser',
    class: 'heavy',
    baseStats: { hull: 2200, shield: 1800, speed: 45, attack: 90, he3Capacity: 120 },
    weaponSlots: 2,
    moduleSlots: 4,
    description: 'Defensive specialist with massive shield capacity.',
  },
  {
    id: 'ship_010',
    name: 'Harbinger Destroyer',
    type: 'destroyer',
    class: 'medium',
    baseStats: { hull: 1000, shield: 500, speed: 80, attack: 180, he3Capacity: 90 },
    weaponSlots: 3,
    moduleSlots: 1,
    description: 'Glass cannon design with devastating burst damage.',
  },
];

const FORMATIONS: Formation[] = [
  {
    id: 'fmt_001',
    name: 'Line Ahead',
    description: 'Standard formation. All stacks act in pure speed order.',
    layout: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    bonuses: {},
  },
  {
    id: 'fmt_002',
    name: 'Wedge',
    description: 'V-shaped assault formation. Front stacks gain +10% attack.',
    layout: [5, 2, 8, 1, 3, 7, 9, 4, 6],
    bonuses: { attack: 0.10 },
  },
  {
    id: 'fmt_003',
    name: 'Shield Wall',
    description: 'Defensive grid pattern. All stacks gain +10% shield capacity.',
    layout: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    bonuses: { defense: 0.10 },
  },
  {
    id: 'fmt_004',
    name: 'Blitz',
    description: 'Speed-focused dispersal. All stacks gain +10% speed.',
    layout: [3, 1, 5, 7, 9, 2, 4, 6, 8],
    bonuses: { speed: 0.10 },
  },
  {
    id: 'fmt_005',
    name: 'Diamond',
    description: 'Balanced formation. Center stack gains +15% to all stats.',
    layout: [5, 2, 4, 6, 8, 1, 3, 7, 9],
    bonuses: { attack: 0.05, defense: 0.05 },
  },
  {
    id: 'fmt_006',
    name: 'Echelon',
    description: 'Diagonal sweep pattern. Side stacks gain +10% attack power.',
    layout: [1, 5, 9, 2, 6, 3, 7, 4, 8],
    bonuses: { attack: 0.10 },
  },
  {
    id: 'fmt_007',
    name: 'Phalanx',
    description: 'Compact defensive cluster. All stacks gain +15% hull integrity.',
    layout: [4, 5, 6, 1, 2, 3, 7, 8, 9],
    bonuses: { defense: 0.15 },
  },
  {
    id: 'fmt_008',
    name: 'Swarm',
    description: 'Highly dispersed formation. +10% speed, -5% defense.',
    layout: [1, 3, 7, 9, 5, 2, 4, 6, 8],
    bonuses: { speed: 0.10 },
  },
];

// ============================================================
// ROUTER
// ============================================================

const router = Router();

/**
 * GET /api/v1/commanders
 * Listar todos los comandantes disponibles.
 */
router.get(
  '/commanders',
  rateLimitMiddleware.general,
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        commanders: COMMANDERS,
        total: COMMANDERS.length,
      },
    });
  })
);

/**
 * GET /api/v1/ships/designs
 * Listar disenos de naves disponibles.
 */
router.get(
  '/ships/designs',
  rateLimitMiddleware.general,
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        designs: SHIP_DESIGNS,
        total: SHIP_DESIGNS.length,
      },
    });
  })
);

/**
 * GET /api/v1/formations
 * Listar formaciones disponibles.
 */
router.get(
  '/formations',
  rateLimitMiddleware.general,
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        formations: FORMATIONS,
      },
    });
  })
);

export default router;
