/**
 * ============================================================
 * REFERENCE DATA ROUTES — Galaxy Online 2
 * Endpoints publicos para datos de referencia del juego
 * ============================================================
 *
 * Datos reales de comandantes extraidos de go2-commander-data.ts
 * 100 comandantes oficiales de Galaxy Online 2
 *
 * Endpoints:
 *   GET /api/v1/commanders       — 100+ comandantes
 *   GET /api/v1/commanders/:id   — 1 comandante por ID
 *   GET /api/v1/ships/designs    — Diseños de naves
 *   GET /api/v1/formations       — Formaciones de batalla
 */

import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import fs from 'fs';
import path from 'path';

const router = Router();

// ============================================================
// TYPES (formato real GO2 — accuracy/speed/dodge/electron)
// ============================================================

export interface CommanderStats {
  accuracy: number;
  speed: number;
  dodge: number;
  electron: number;
}

export interface CommanderCard {
  id: string;
  name: string;
  rarity: 'common' | 'super' | 'legendary' | 'divine';
  level: number;
  stars: number;
  skill: string;
  skillDescription: string;
  skillAffectedBy: string;
  status: string;
  stats: CommanderStats;
  growthRates: CommanderStats;
}

export interface ShipDesign {
  id: string;
  name: string;
  shipClass: 'frigate' | 'cruiser' | 'battleship' | 'special';
  attack: number;
  defense: number;
  structure: number;
  shield: number;
  speed: number;
  stability: number;
  weaponSlots: number;
  moduleSlots: number;
  he3Consumption: number;
  description: string;
}

export interface Formation {
  id: string;
  name: string;
  description: string;
  layout: string; // descripcion visual
  bonuses: Record<string, number>;
}

// ============================================================
// CARGAR 100+ COMANDANTES REALES DESDE JSON
// ============================================================

let COMMANDERS: CommanderCard[] = [];

try {
  const jsonPath = path.join(__dirname, '../../../../apps/web/public/data/commanders.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  COMMANDERS = jsonData.commanders || [];
  console.log(`[GO2] ${COMMANDERS.length} comandantes cargados desde JSON`);
} catch (err) {
  console.warn('[GO2] No se pudo cargar commanders.json, usando fallback:', (err as Error).message);
  COMMANDERS = [];
}

// ============================================================
// SHIP DESIGNS (reales GO2)
// ============================================================

const SHIP_DESIGNS: ShipDesign[] = [
  {
    id: 'frigate-mk1', name: 'Frigate MK-I', shipClass: 'frigate',
    attack: 30, defense: 15, structure: 80, shield: 50, speed: 100, stability: 1.0,
    weaponSlots: 2, moduleSlots: 2, he3Consumption: 2,
    description: 'Nave ligera y rapida. Escudo fuerte, dano bajo. Ideal como tanque.',
  },
  {
    id: 'frigate-mk2', name: 'Frigate MK-II', shipClass: 'frigate',
    attack: 40, defense: 20, structure: 100, shield: 70, speed: 110, stability: 1.1,
    weaponSlots: 3, moduleSlots: 2, he3Consumption: 3,
    description: 'Mejora de la Frigate base. Mayor escudo y velocidad.',
  },
  {
    id: 'cruiser-mk1', name: 'Cruiser MK-I', shipClass: 'cruiser',
    attack: 60, defense: 40, structure: 150, shield: 80, speed: 70, stability: 1.2,
    weaponSlots: 3, moduleSlots: 3, he3Consumption: 5,
    description: 'Nave balanceada. Buen dano, defensa solida y modulos versatiles.',
  },
  {
    id: 'cruiser-mk2', name: 'Cruiser MK-II', shipClass: 'cruiser',
    attack: 75, defense: 50, structure: 180, shield: 100, speed: 75, stability: 1.3,
    weaponSlots: 4, moduleSlots: 3, he3Consumption: 6,
    description: 'Cruiser mejorada. Mayor capacidad de armamento y defensa.',
  },
  {
    id: 'battleship-mk1', name: 'Battleship MK-I', shipClass: 'battleship',
    attack: 100, defense: 70, structure: 250, shield: 60, speed: 40, stability: 1.5,
    weaponSlots: 4, moduleSlots: 4, he3Consumption: 10,
    description: 'Nave masiva con dano devastador. Lenta pero letal.',
  },
  {
    id: 'battleship-mk2', name: 'Battleship MK-II', shipClass: 'battleship',
    attack: 130, defense: 90, structure: 300, shield: 80, speed: 45, stability: 1.7,
    weaponSlots: 5, moduleSlots: 4, he3Consumption: 12,
    description: 'Battleship avanzada. Artilleria pesada de largo alcance.',
  },
  {
    id: 'special-mk1', name: 'Special Hull MK-I', shipClass: 'special',
    attack: 50, defense: 30, structure: 120, shield: 90, speed: 85, stability: 1.0,
    weaponSlots: 2, moduleSlots: 4, he3Consumption: 8,
    description: 'Nave con habilidades unicas. Slots de modulos maximos.',
  },
  {
    id: 'flagship', name: 'Flagship', shipClass: 'battleship',
    attack: 150, defense: 100, structure: 400, shield: 120, speed: 35, stability: 2.0,
    weaponSlots: 6, moduleSlots: 5, he3Consumption: 15,
    description: 'Nave insignia. La unidad mas poderosa del juego.',
  },
];

// ============================================================
// FORMATIONS
// ============================================================

const FORMATIONS: Formation[] = [
  {
    id: 'wedge', name: 'Wedge (Cuña)',
    description: 'Formacion ofensiva. Bonus de ataque al primer stack.',
    layout: '1 nave adelante, 2 detras, 3 mas atras... forma de V invertida',
    bonuses: { attack: 0.10, speed: 0.05 },
  },
  {
    id: 'shield', name: 'Shield Wall (Muro)',
    description: 'Formacion defensiva. Los stacks frontales absorben mas daño.',
    layout: '3 naves al frente, 3 en medio, 3 atras — en lineas horizontales',
    bonuses: { defense: 0.15, shield: 0.10 },
  },
  {
    id: 'diamond', name: 'Diamond (Diamante)',
    description: 'Formacion balanceada. Bonus defensivo a los stacks laterales.',
    layout: '1 centro, 2 laterales, 3 atras, 2 mas atras, 1 ultimo — forma de rombo',
    bonuses: { defense: 0.10, speed: 0.05 },
  },
  {
    id: 'arrow', name: 'Arrowhead (Flecha)',
    description: 'Formacion ofensiva concentrada. Bonus de penetracion de escudo.',
    layout: '1 punta, 2 sig linea, 3 base — forma de flecha apuntando al enemigo',
    bonuses: { attack: 0.15, shieldPenetration: 0.10 },
  },
  {
    id: 'line', name: 'Line (Linea)',
    description: 'Formacion simple. Todos los stacks atacan simultaneamente.',
    layout: '9 naves en linea horizontal',
    bonuses: { speed: 0.15 },
  },
  {
    id: 'echelon', name: 'Echelon (Escalonada)',
    description: 'Formacion escalonada. Bonus de velocidad progresivo.',
    layout: 'Cada nave ligeramente mas atras que la anterior — diagonal',
    bonuses: { speed: 0.20 },
  },
  {
    id: 'cross', name: 'Cross (Cruz)',
    description: 'Formacion defensiva central. Bonus de escudo al stack central.',
    layout: '1 centro, 4 en cruz, 4 esquinas — forma de cruz',
    bonuses: { shield: 0.20, defense: 0.05 },
  },
  {
    id: 'scatter', name: 'Scatter (Dispersa)',
    description: 'Formacion dispersa. Reduce scatter damage recibido.',
    layout: 'Naves distribuidas ampliamente para minimizar daño en area',
    bonuses: { scatterResistance: 0.25 },
  },
];

// ============================================================
// ROUTES
// ============================================================

/**
 * GET /api/v1/commanders
 * Devuelve TODOS los 100+ comandantes reales de GO2
 * Query: ?rarity=common|super|legendary|divine (filtro opcional)
 */
router.get('/commanders', asyncHandler(async (req, res) => {
  const { rarity } = req.query;
  let commanders = COMMANDERS;

  if (rarity && typeof rarity === 'string') {
    commanders = commanders.filter(c => c.rarity === rarity);
  }

  res.json({
    success: true,
    data: {
      total: commanders.length,
      byRarity: {
        common: COMMANDERS.filter(c => c.rarity === 'common').length,
        super: COMMANDERS.filter(c => c.rarity === 'super').length,
        legendary: COMMANDERS.filter(c => c.rarity === 'legendary').length,
        divine: COMMANDERS.filter(c => c.rarity === 'divine').length,
      },
      commanders: commanders.map(c => ({
        id: c.id,
        name: c.name,
        rarity: c.rarity,
        stars: c.stars,
        skill: c.skill,
        skillDescription: c.skillDescription,
        skillAffectedBy: c.skillAffectedBy,
        stats: c.stats,
        growthRates: c.growthRates,
      })),
    },
  }));
}));

/**
 * GET /api/v1/commanders/:id
 * Devuelve UN comandante por ID
 */
router.get('/commanders/:id', asyncHandler(async (req, res) => {
  const commander = COMMANDERS.find(c => c.id === req.params.id);

  if (!commander) {
    return res.status(404).json({
      success: false,
      error: { code: 'COMMANDER_NOT_FOUND', message: 'Comandante no encontrado' },
    });
  }

  res.json({ success: true, data: commander });
}));

/**
 * GET /api/v1/ships/designs
 * Devuelve todos los diseños de naves
 */
router.get('/ships/designs', asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      total: SHIP_DESIGNS.length,
      designs: SHIP_DESIGNS,
    },
  });
}));

/**
 * GET /api/v1/formations
 * Devuelve todas las formaciones de batalla
 */
router.get('/formations', asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      total: FORMATIONS.length,
      formations: FORMATIONS,
    },
  });
}));

export default router;
