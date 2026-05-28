/**
 * ========================================================================
 * Galaxy Online 3 — Battle Presets
 * ========================================================================
 * Presets de batalla demo con datos reales de comandantes de
 * go2-commander-data.ts y el BattleEngine.
 *
 * Proporciona configuraciones de batalla listas para usar con
 * initBattle() en el useBattleState hook.
 *
 * @module battle/data/battlePresets
 * ========================================================================
 */

import type { ShipStack, Commander as EngineCommander, WeaponType, ShipType } from '../engine/types';
import { createShipStack } from '../engine/ShieldSystem';
import { createWeapon } from '../engine/WeaponSystem';
import { COMMANDERS, calculateStatsAtLevel } from '@/components/game/go2/go2-commander-data';
import type { Commander as DataCommander } from '@/components/game/go2/go2-commander-data';

// ============================================================================
// COMMANDER CONVERSION
// ============================================================================

/**
 * Convierte un comandante del data system al formato del battle engine.
 * Calcula stats al nivel indicado y genera el effectiveStackBonus.
 */
function convertCommander(dataCmd: DataCommander, level: number = 1): EngineCommander {
  const stats = calculateStatsAtLevel(dataCmd, level);
  const stars = Math.min(5, Math.max(1, dataCmd.stars));

  // Bonus por estrellas al effective stack
  const starBonus: Record<number, number> = {
    1: 100,
    2: 250,
    3: 450,
    4: 700,
    5: 1000,
  };

  return {
    id: dataCmd.id,
    name: dataCmd.name,
    level,
    stars,
    accuracy: stats.accuracy,
    speed: stats.speed,
    dodge: stats.dodge,
    electron: stats.electron,
    effectiveStackBonus: starBonus[stars] ?? 100,
    hasEOS: dataCmd.rarity === 'divine',
    eosMultiplier: dataCmd.rarity === 'divine' ? 2.0 : undefined,
    specialAbility: dataCmd.skill
      ? {
          id: `${dataCmd.id}_skill`,
          name: dataCmd.skill,
          description: dataCmd.skillDescription,
          trigger: 'passive',
          effect: {
            type: 'damage_boost',
            value: 0.1,
            procChance: 0.2,
          },
        }
      : undefined,
  };
}

/** Busca un comandante por nombre (insensitive) */
function findCommander(name: string): DataCommander | undefined {
  return COMMANDERS.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

/** Busca un comandante por ID */
function findCommanderById(id: string): DataCommander | undefined {
  return COMMANDERS.find((c) => c.id === id);
}

// ============================================================================
// STACK CONFIG
// ============================================================================

export interface StackConfig {
  /** ID unico del stack */
  id: string;
  /** Tipo de nave */
  shipType: ShipType;
  /** Cantidad de naves */
  count: number;
  /** Comandante (nombre o null) */
  commander: string | null;
  /** Tipos de armas a equipar */
  weapons: WeaponType[];
  /** Nivel del comandante (1-50) */
  commanderLevel?: number;
  /** Posicion en el grid (1-12 atacante, 13-24 defensor) */
  position?: number;
}

// ============================================================================
// STACK FACTORY
// ============================================================================

/**
 * Crea un ShipStack completo a partir de una configuracion simplificada.
 *
 * @param config - Configuracion del stack
 * @param faction - Faccion (attacker/defender)
 * @param defaultPosition - Posicion por defecto
 * @returns ShipStack listo para el BattleEngine
 */
export function createStack(
  config: StackConfig,
  faction: 'attacker' | 'defender',
  defaultPosition: number
): ShipStack {
  // Resolver comandante
  let engineCommander: EngineCommander | undefined;
  if (config.commander) {
    const dataCmd = findCommander(config.commander) || findCommanderById(config.commander);
    if (dataCmd) {
      engineCommander = convertCommander(dataCmd, config.commanderLevel ?? 1);
    }
  }

  // Crear armas
  const weapons = config.weapons.map((wt) => createWeapon(wt));

  // Calcular posicion
  const position = config.position ?? defaultPosition;

  // Crear el stack
  const stack = createShipStack({
    id: config.id,
    shipType: config.shipType,
    totalShips: config.count,
    position,
    faction,
    weapons,
    commander: engineCommander,
  });

  return stack;
}

// ============================================================================
// PRESET 1: Batalla Demo Basica (3 vs 3)
// ============================================================================

export const demoBattleBasic = {
  name: 'Demo Basica',
  description: 'Batalla introductoria 3 stacks vs 3 stacks con comandantes comunes y legendarios.',
  attacker: [
    createStack(
      { id: 'atk_f1', shipType: 'frigate', count: 1000, commander: 'Reggie', weapons: ['ballistic', 'ballistic'], commanderLevel: 5 },
      'attacker',
      1
    ),
    createStack(
      { id: 'atk_c1', shipType: 'cruiser', count: 800, commander: null, weapons: ['directional', 'directional'] },
      'attacker',
      3
    ),
    createStack(
      { id: 'atk_b1', shipType: 'battleship', count: 600, commander: 'Gastaf', weapons: ['ship_based', 'missile'], commanderLevel: 3 },
      'attacker',
      5
    ),
  ],
  defender: [
    createStack(
      { id: 'def_f1', shipType: 'frigate', count: 1200, commander: null, weapons: ['ballistic', 'ballistic'] },
      'defender',
      13
    ),
    createStack(
      { id: 'def_c1', shipType: 'cruiser', count: 900, commander: 'Sandora', weapons: ['missile', 'directional'], commanderLevel: 4 },
      'defender',
      15
    ),
    createStack(
      { id: 'def_b1', shipType: 'battleship', count: 500, commander: null, weapons: ['directional', 'ship_based'] },
      'defender',
      17
    ),
  ],
};

// ============================================================================
// PRESET 2: Batalla Epica (6 vs 6)
// ============================================================================

export const demoBattleEpic = {
  name: 'Batalla Epica',
  description: 'Gran batalla 6 stacks vs 6 stacks con comandantes de multiples rarezas.',
  attacker: [
    createStack(
      { id: 'atk_f1', shipType: 'frigate', count: 1500, commander: 'Jerome', weapons: ['ballistic'], commanderLevel: 8 },
      'attacker',
      1
    ),
    createStack(
      { id: 'atk_f2', shipType: 'frigate', count: 1200, commander: 'Natiya', weapons: ['ballistic', 'ballistic'], commanderLevel: 6 },
      'attacker',
      2
    ),
    createStack(
      { id: 'atk_c1', shipType: 'cruiser', count: 900, commander: 'Eveline', weapons: ['directional', 'directional'], commanderLevel: 7 },
      'attacker',
      4
    ),
    createStack(
      { id: 'atk_c2', shipType: 'cruiser', count: 800, commander: null, weapons: ['missile', 'directional'] },
      'attacker',
      6
    ),
    createStack(
      { id: 'atk_b1', shipType: 'battleship', count: 700, commander: 'Todd', weapons: ['ship_based', 'missile'], commanderLevel: 5 },
      'attacker',
      8
    ),
    createStack(
      { id: 'atk_b2', shipType: 'battleship', count: 600, commander: 'Penni', weapons: ['ship_based', 'ship_based'], commanderLevel: 4 },
      'attacker',
      10
    ),
  ],
  defender: [
    createStack(
      { id: 'def_f1', shipType: 'frigate', count: 1400, commander: 'Sofia', weapons: ['ballistic'], commanderLevel: 7 },
      'defender',
      13
    ),
    createStack(
      { id: 'def_f2', shipType: 'frigate', count: 1100, commander: null, weapons: ['ballistic', 'ballistic'] },
      'defender',
      14
    ),
    createStack(
      { id: 'def_c1', shipType: 'cruiser', count: 1000, commander: 'Raslin', weapons: ['directional', 'missile'], commanderLevel: 6 },
      'defender',
      16
    ),
    createStack(
      { id: 'def_c2', shipType: 'cruiser', count: 850, commander: 'Anna', weapons: ['missile', 'directional'], commanderLevel: 5 },
      'defender',
      18
    ),
    createStack(
      { id: 'def_b1', shipType: 'battleship', count: 650, commander: 'Rocky', weapons: ['ship_based', 'ship_based'], commanderLevel: 8 },
      'defender',
      20
    ),
    createStack(
      { id: 'def_b2', shipType: 'battleship', count: 550, commander: null, weapons: ['directional', 'ship_based'] },
      'defender',
      22
    ),
  ],
};

// ============================================================================
// PRESET 3: Fragatas Swarm (4 vs 4, solo frigates)
// ============================================================================

export const demoBattleSwarm = {
  name: 'Swarm de Fragatas',
  description: 'Batalla especializada con solo fragatas. Alta movilidad, muchas naves.',
  attacker: [
    createStack(
      { id: 'atk_f1', shipType: 'frigate', count: 2000, commander: 'Shaba', weapons: ['ballistic'], commanderLevel: 10 },
      'attacker',
      1
    ),
    createStack(
      { id: 'atk_f2', shipType: 'frigate', count: 1800, commander: 'Kelly', weapons: ['ballistic', 'ballistic'], commanderLevel: 8 },
      'attacker',
      3
    ),
    createStack(
      { id: 'atk_f3', shipType: 'frigate', count: 1600, commander: null, weapons: ['ballistic'] },
      'attacker',
      5
    ),
    createStack(
      { id: 'atk_f4', shipType: 'frigate', count: 1400, commander: 'Wayne', weapons: ['ballistic', 'ballistic'], commanderLevel: 6 },
      'attacker',
      7
    ),
  ],
  defender: [
    createStack(
      { id: 'def_f1', shipType: 'frigate', count: 2200, commander: 'Panis', weapons: ['ballistic'], commanderLevel: 9 },
      'defender',
      13
    ),
    createStack(
      { id: 'def_f2', shipType: 'frigate', count: 1900, commander: null, weapons: ['ballistic', 'ballistic'] },
      'defender',
      15
    ),
    createStack(
      { id: 'def_f3', shipType: 'frigate', count: 1700, commander: 'Motima', weapons: ['ballistic'], commanderLevel: 7 },
      'defender',
      17
    ),
    createStack(
      { id: 'def_f4', shipType: 'frigate', count: 1500, commander: 'Lawrence', weapons: ['ballistic', 'ballistic'], commanderLevel: 8 },
      'defender',
      19
    ),
  ],
};

// ============================================================================
// PRESET 4: Batalla Legendary (3 vs 3, solo legendarios)
// ============================================================================

export const demoBattleLegendary = {
  name: 'Clash de Legendarios',
  description: 'Batalla con solo comandantes legendarios. Alto poder, habilidades devastadoras.',
  attacker: [
    createStack(
      { id: 'atk_f1', shipType: 'frigate', count: 1100, commander: 'Callisto', weapons: ['ballistic', 'ballistic'], commanderLevel: 15 },
      'attacker',
      1
    ),
    createStack(
      { id: 'atk_c1', shipType: 'cruiser', count: 850, commander: 'Cassius', weapons: ['directional', 'directional'], commanderLevel: 12 },
      'attacker',
      4
    ),
    createStack(
      { id: 'atk_b1', shipType: 'battleship', count: 650, commander: 'Titan', weapons: ['ship_based', 'missile'], commanderLevel: 20 },
      'attacker',
      8
    ),
  ],
  defender: [
    createStack(
      { id: 'def_f1', shipType: 'frigate', count: 1300, commander: 'Medusa', weapons: ['ballistic', 'ballistic'], commanderLevel: 14 },
      'defender',
      13
    ),
    createStack(
      { id: 'def_c1', shipType: 'cruiser', count: 900, commander: 'Hellen', weapons: ['missile', 'directional'], commanderLevel: 13 },
      'defender',
      16
    ),
    createStack(
      { id: 'def_b1', shipType: 'battleship', count: 600, commander: 'Venus', weapons: ['ship_based', 'ship_based'], commanderLevel: 16 },
      'defender',
      20
    ),
  ],
};

// ============================================================================
// PRESET 5: Divine Onslaught (4 vs 4, comandantes divinos)
// ============================================================================

export const demoBattleDivine = {
  name: 'Divine Onslaught',
  description: 'Batalla con comandantes divinos. Poder maximo, habilidades unicas.',
  attacker: [
    createStack(
      { id: 'atk_f1', shipType: 'frigate', count: 1300, commander: 'Death from Above', weapons: ['ballistic', 'ballistic'], commanderLevel: 12 },
      'attacker',
      1
    ),
    createStack(
      { id: 'atk_c1', shipType: 'cruiser', count: 950, commander: 'Feral Raptors', weapons: ['directional', 'missile'], commanderLevel: 10 },
      'attacker',
      4
    ),
    createStack(
      { id: 'atk_b1', shipType: 'battleship', count: 750, commander: 'Fatal Furies', weapons: ['ship_based', 'ship_based'], commanderLevel: 11 },
      'attacker',
      7
    ),
    createStack(
      { id: 'atk_b2', shipType: 'battleship', count: 650, commander: null, weapons: ['ship_based', 'missile'] },
      'attacker',
      10
    ),
  ],
  defender: [
    createStack(
      { id: 'def_f1', shipType: 'frigate', count: 1400, commander: 'Kismet Beams', weapons: ['ballistic', 'ballistic'], commanderLevel: 11 },
      'defender',
      13
    ),
    createStack(
      { id: 'def_c1', shipType: 'cruiser', count: 1000, commander: 'Hand of Lelantos', weapons: ['directional', 'directional'], commanderLevel: 13 },
      'defender',
      16
    ),
    createStack(
      { id: 'def_b1', shipType: 'battleship', count: 700, commander: 'Victory Roar', weapons: ['ship_based', 'missile'], commanderLevel: 12 },
      'defender',
      19
    ),
    createStack(
      { id: 'def_b2', shipType: 'battleship', count: 600, commander: 'Wildfire', weapons: ['ship_based', 'ship_based'], commanderLevel: 10 },
      'defender',
      22
    ),
  ],
};

// ============================================================================
// PRESET 6: Asalto de Acorazados (3 vs 3, solo battleships)
// ============================================================================

export const demoBattleDreadnought = {
  name: 'Asalto de Acorazados',
  description: 'Solo acorazados. Daño masivo, escudos pesados, batalla lenta y brutal.',
  attacker: [
    createStack(
      { id: 'atk_b1', shipType: 'battleship', count: 800, commander: 'Bain', weapons: ['ship_based', 'missile', 'directional'], commanderLevel: 14 },
      'attacker',
      3
    ),
    createStack(
      { id: 'atk_b2', shipType: 'battleship', count: 700, commander: 'Robert', weapons: ['ship_based', 'ship_based', 'missile'], commanderLevel: 12 },
      'attacker',
      6
    ),
    createStack(
      { id: 'atk_b3', shipType: 'battleship', count: 650, commander: 'Carlos', weapons: ['missile', 'ship_based', 'directional'], commanderLevel: 11 },
      'attacker',
      9
    ),
  ],
  defender: [
    createStack(
      { id: 'def_b1', shipType: 'battleship', count: 900, commander: 'Nora', weapons: ['ship_based', 'missile'], commanderLevel: 13 },
      'defender',
      15
    ),
    createStack(
      { id: 'def_b2', shipType: 'battleship', count: 750, commander: 'Rayo', weapons: ['ship_based', 'ship_based', 'directional'], commanderLevel: 14 },
      'defender',
      18
    ),
    createStack(
      { id: 'def_b3', shipType: 'battleship', count: 680, commander: null, weapons: ['missile', 'ship_based'] },
      'defender',
      21
    ),
  ],
};

// ============================================================================
// PRESET 7: Cruiser Blitz (4 vs 4, solo cruisers)
// ============================================================================

export const demoBattleCruiserBlitz = {
  name: 'Cruiser Blitz',
  description: 'Solo cruceros. Balance perfecto entre velocidad y poder.',
  attacker: [
    createStack(
      { id: 'atk_c1', shipType: 'cruiser', count: 1000, commander: 'Evi', weapons: ['directional', 'directional'], commanderLevel: 10 },
      'attacker',
      1
    ),
    createStack(
      { id: 'atk_c2', shipType: 'cruiser', count: 900, commander: 'Linda', weapons: ['missile', 'directional'], commanderLevel: 9 },
      'attacker',
      4
    ),
    createStack(
      { id: 'atk_c3', shipType: 'cruiser', count: 850, commander: 'Lynn', weapons: ['directional', 'missile'], commanderLevel: 8 },
      'attacker',
      7
    ),
    createStack(
      { id: 'atk_c4', shipType: 'cruiser', count: 750, commander: null, weapons: ['directional'] },
      'attacker',
      10
    ),
  ],
  defender: [
    createStack(
      { id: 'def_c1', shipType: 'cruiser', count: 1100, commander: 'Bruce', weapons: ['missile', 'directional'], commanderLevel: 11 },
      'defender',
      13
    ),
    createStack(
      { id: 'def_c2', shipType: 'cruiser', count: 950, commander: 'Leo', weapons: ['directional', 'directional'], commanderLevel: 9 },
      'defender',
      16
    ),
    createStack(
      { id: 'def_c3', shipType: 'cruiser', count: 880, commander: 'Jakar', weapons: ['directional', 'missile'], commanderLevel: 10 },
      'defender',
      19
    ),
    createStack(
      { id: 'def_c4', shipType: 'cruiser', count: 800, commander: 'Joseph', weapons: ['missile', 'missile'], commanderLevel: 8 },
      'defender',
      22
    ),
  ],
};

// ============================================================================
// PRESET 8: Tournament Final (6 vs 6, max level legendarios y divinos)
// ============================================================================

export const demoBattleTournament = {
  name: 'Final del Torneo',
  description: 'La batalla definitiva. Comandantes al maximo nivel, flotas completas.',
  attacker: [
    createStack(
      { id: 'atk_f1', shipType: 'frigate', count: 2000, commander: 'Circe', weapons: ['ballistic', 'ballistic'], commanderLevel: 30 },
      'attacker',
      1
    ),
    createStack(
      { id: 'atk_f2', shipType: 'frigate', count: 1800, commander: 'Dilira', weapons: ['ballistic'], commanderLevel: 28 },
      'attacker',
      2
    ),
    createStack(
      { id: 'atk_c1', shipType: 'cruiser', count: 1200, commander: 'Death from Above', weapons: ['directional', 'missile'], commanderLevel: 25 },
      'attacker',
      4
    ),
    createStack(
      { id: 'atk_c2', shipType: 'cruiser', count: 1100, commander: 'Fearmongers', weapons: ['directional', 'directional'], commanderLevel: 22 },
      'attacker',
      6
    ),
    createStack(
      { id: 'atk_b1', shipType: 'battleship', count: 900, commander: 'Titan', weapons: ['ship_based', 'ship_based', 'missile'], commanderLevel: 35 },
      'attacker',
      8
    ),
    createStack(
      { id: 'atk_b2', shipType: 'battleship', count: 800, commander: 'Krina Klaus', weapons: ['ship_based', 'missile'], commanderLevel: 30 },
      'attacker',
      10
    ),
  ],
  defender: [
    createStack(
      { id: 'def_f1', shipType: 'frigate', count: 2100, commander: 'Aileen', weapons: ['ballistic', 'ballistic'], commanderLevel: 28 },
      'defender',
      13
    ),
    createStack(
      { id: 'def_f2', shipType: 'frigate', count: 1900, commander: 'Desolate Prayers', weapons: ['ballistic'], commanderLevel: 26 },
      'defender',
      14
    ),
    createStack(
      { id: 'def_c1', shipType: 'cruiser', count: 1300, commander: 'The Ravagers', weapons: ['missile', 'directional'], commanderLevel: 24 },
      'defender',
      16
    ),
    createStack(
      { id: 'def_c2', shipType: 'cruiser', count: 1150, commander: 'Pernicious Princes', weapons: ['directional', 'directional'], commanderLevel: 23 },
      'defender',
      18
    ),
    createStack(
      { id: 'def_b1', shipType: 'battleship', count: 850, commander: 'Hand of Lelantos', weapons: ['ship_based', 'missile', 'ship_based'], commanderLevel: 28 },
      'defender',
      20
    ),
    createStack(
      { id: 'def_b2', shipType: 'battleship', count: 780, commander: 'Singhri', weapons: ['ship_based', 'ship_based'], commanderLevel: 25 },
      'defender',
      22
    ),
  ],
};

// ============================================================================
// ARRAY DE TODOS LOS PRESETS
// ============================================================================

export interface BattlePreset {
  name: string;
  description: string;
  attacker: ShipStack[];
  defender: ShipStack[];
}

export const ALL_PRESETS: BattlePreset[] = [
  demoBattleBasic,
  demoBattleEpic,
  demoBattleSwarm,
  demoBattleLegendary,
  demoBattleDivine,
  demoBattleDreadnought,
  demoBattleCruiserBlitz,
  demoBattleTournament,
];

/** Obtiene un preset por indice */
export function getPreset(index: number): BattlePreset {
  return ALL_PRESETS[Math.max(0, Math.min(ALL_PRESETS.length - 1, index))];
}

/** Obtiene un preset aleatorio */
export function getRandomPreset(): BattlePreset {
  return ALL_PRESETS[Math.floor(Math.random() * ALL_PRESETS.length)];
}

// Default export para conveniencia
export default ALL_PRESETS;
