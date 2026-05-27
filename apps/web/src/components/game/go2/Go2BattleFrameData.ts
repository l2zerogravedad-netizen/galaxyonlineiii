/**
 * Go2BattleFrameData.ts
 *
 * Pure data types and demo frame generator for the battle system.
 * NO Three.js dependencies — safe to import anywhere.
 */

/* ─── TYPES ─── */

export interface GridShip {
  id: string;
  shipType: 'frigate' | 'cruiser' | 'battleship';
  side: 'attacker' | 'defender';
  count: number;
  cell: number;
  speed: number;
  minRange: number;
  maxRange: number;
  structure: number;
  shield: number;
  modelVariant: number;
}

export interface FrameAction {
  type: 'move' | 'attack' | 'destroy' | 'explosion';
  shipId?: string;
  targetId?: string;
  damage?: number;
  weaponType?: string;
  fromCell?: number;
  toCell?: number;
  cell?: number;
  x?: number;
  z?: number;
}

export interface BattleFrame {
  round: number;
  phase: 'move' | 'attack' | 'end';
  attackerShips: GridShip[];
  defenderShips: GridShip[];
  actions: FrameAction[];
}

/* ─── HELPERS ─── */

export function createDefaultFrame(): BattleFrame {
  return {
    round: 0,
    phase: 'move',
    attackerShips: [],
    defenderShips: [],
    actions: [],
  };
}

/* ─── DEMO DATA GENERATOR ─── */

export function generateDemoBattleFrames(): BattleFrame[] {
  const frames: BattleFrame[] = [];

  const attackers: GridShip[] = [
    {
      id: 'a1', shipType: 'frigate', side: 'attacker', count: 1000,
      cell: 1, speed: 2, minRange: 1, maxRange: 5,
      structure: 100, shield: 100, modelVariant: 0,
    },
    {
      id: 'a2', shipType: 'cruiser', side: 'attacker', count: 500,
      cell: 2, speed: 1, minRange: 2, maxRange: 8,
      structure: 100, shield: 100, modelVariant: 1,
    },
    {
      id: 'a3', shipType: 'battleship', side: 'attacker', count: 200,
      cell: 3, speed: 1, minRange: 3, maxRange: 10,
      structure: 100, shield: 100, modelVariant: 2,
    },
  ];

  const defenders: GridShip[] = [
    {
      id: 'd1', shipType: 'frigate', side: 'defender', count: 800,
      cell: 8, speed: 2, minRange: 1, maxRange: 5,
      structure: 100, shield: 100, modelVariant: 0,
    },
    {
      id: 'd2', shipType: 'cruiser', side: 'defender', count: 400,
      cell: 7, speed: 1, minRange: 2, maxRange: 8,
      structure: 100, shield: 100, modelVariant: 1,
    },
    {
      id: 'd3', shipType: 'battleship', side: 'defender', count: 150,
      cell: 9, speed: 1, minRange: 3, maxRange: 10,
      structure: 100, shield: 100, modelVariant: 2,
    },
  ];

  // Round 1: Movement
  frames.push({
    round: 1, phase: 'move',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'move', shipId: 'a1', fromCell: 1, toCell: 3 },
      { type: 'move', shipId: 'a2', fromCell: 2, toCell: 3 },
      { type: 'move', shipId: 'd1', fromCell: 8, toCell: 6 },
      { type: 'move', shipId: 'd2', fromCell: 7, toCell: 6 },
    ],
  });

  attackers[0].cell = 3; attackers[1].cell = 3;
  defenders[0].cell = 6; defenders[1].cell = 6;

  // Round 1: Attack
  frames.push({
    round: 1, phase: 'attack',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'attack', shipId: 'a1', targetId: 'd1', damage: 25, weaponType: 'laser' },
      { type: 'attack', shipId: 'd1', targetId: 'a1', damage: 20, weaponType: 'cannon' },
    ],
  });

  defenders[0].shield = 75; defenders[0].structure = 95;
  attackers[0].shield = 80; attackers[0].structure = 97;

  // Round 2: Movement
  frames.push({
    round: 2, phase: 'move',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'move', shipId: 'a1', fromCell: 3, toCell: 4 },
      { type: 'move', shipId: 'a2', fromCell: 3, toCell: 4 },
      { type: 'move', shipId: 'd1', fromCell: 6, toCell: 5 },
      { type: 'move', shipId: 'd2', fromCell: 6, toCell: 5 },
    ],
  });

  attackers[0].cell = 4; attackers[1].cell = 4;
  defenders[0].cell = 5; defenders[1].cell = 5;

  // Round 2: Attack
  attackers[0].shield = 50; attackers[0].structure = 70;
  defenders[0].shield = 30; defenders[0].structure = 60;
  defenders[1].shield = 60; defenders[1].structure = 85;

  frames.push({
    round: 2, phase: 'attack',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'attack', shipId: 'a1', targetId: 'd1', damage: 40, weaponType: 'laser' },
      { type: 'attack', shipId: 'a2', targetId: 'd1', damage: 30, weaponType: 'cannon' },
      { type: 'attack', shipId: 'd1', targetId: 'a1', damage: 35, weaponType: 'laser' },
      { type: 'attack', shipId: 'd2', targetId: 'a1', damage: 25, weaponType: 'cannon' },
    ],
  });

  // Round 3: d1 destroyed
  frames.push({
    round: 3, phase: 'move',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'explosion', cell: 5 },
      { type: 'destroy', shipId: 'd1' },
    ],
  });

  defenders[0].structure = 0; defenders[0].shield = 0;

  // Round 3: Attack
  frames.push({
    round: 3, phase: 'attack',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'attack', shipId: 'a1', targetId: 'd2', damage: 30, weaponType: 'laser' },
      { type: 'attack', shipId: 'd2', targetId: 'a1', damage: 20, weaponType: 'cannon' },
    ],
  });

  defenders[1].shield = 30; defenders[1].structure = 55;
  attackers[0].shield = 20; attackers[0].structure = 45;

  // Round 4
  frames.push({
    round: 4, phase: 'move',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [],
  });

  frames.push({
    round: 4, phase: 'attack',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'attack', shipId: 'a2', targetId: 'd2', damage: 50, weaponType: 'cannon' },
      { type: 'attack', shipId: 'd2', targetId: 'a2', damage: 40, weaponType: 'laser' },
    ],
  });

  defenders[1].shield = 0; defenders[1].structure = 5;
  attackers[1].shield = 40; attackers[1].structure = 60;

  // Round 5: Final
  frames.push({
    round: 5, phase: 'attack',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [
      { type: 'explosion', cell: defenders[1].cell },
      { type: 'destroy', shipId: 'd2' },
      { type: 'attack', shipId: 'd3', targetId: 'a3', damage: 20, weaponType: 'cannon' },
    ],
  });

  defenders[1].structure = 0; defenders[1].shield = 0;
  attackers[2].shield = 80; attackers[2].structure = 92;

  // End
  frames.push({
    round: 5, phase: 'end',
    attackerShips: attackers.map(s => ({ ...s })),
    defenderShips: defenders.map(s => ({ ...s })),
    actions: [],
  });

  return frames;
}
