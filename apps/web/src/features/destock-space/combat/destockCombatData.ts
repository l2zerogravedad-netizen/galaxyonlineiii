/**
 * Misiones de combate PvE — referencia video Misión 1 (UHNnmxPLsPg).
 */

// GO2_GRID_CORNER_CELLS: 4 esquinas de la grilla 9×9 (idéntico a combatSim de GO II).
// Definido localmente porque @galaxy/shared no lo expone en esta rama.
const GO2_GRID_CORNER_CELLS = [0, 8, 72, 80] as const;

export type CombatMissionMode = 'instance' | 'base_defense';

export interface CombatUnitTemplate {
  name: string;
  attack: number;
  defense: number;
  hp: number;
  shield: number;
}

export interface Go2CombatMission {
  id: number;
  title: string;
  subtitle: string;
  mode: CombatMissionMode;
  difficulty: number;
  maxRounds: number;
  /** Solo si no hay flota guardada en /destock/fleets */
  playerStarter: { cell: number; template: CombatUnitTemplate }[];
  waves: { cell: number; template: CombatUnitTemplate }[][];
  rewards: { icon: 'metal' | 'plasma' | 'credits' | 'premium'; amount: number; label: string }[];
}

const FRIGATE_PLAYER: CombatUnitTemplate = {
  name: 'Fragata DSX',
  attack: 28,
  defense: 12,
  hp: 200,
  shield: 80,
};

const FRIGATE_ENEMY: CombatUnitTemplate = {
  name: 'Caza pirata',
  attack: 18,
  defense: 8,
  hp: 120,
  shield: 40,
};

const CORVETTE_ENEMY: CombatUnitTemplate = {
  name: 'Corbeta hostil',
  attack: 32,
  defense: 14,
  hp: 280,
  shield: 100,
};

/** Despliegue inicial estilo Misión 1 — línea delantera jugador. */
const M1_PLAYER = [
  { cell: 58, template: FRIGATE_PLAYER },
  { cell: 59, template: FRIGATE_PLAYER },
  { cell: 60, template: FRIGATE_PLAYER },
  { cell: 49, template: FRIGATE_PLAYER },
];

export const GO2_COMBAT_MISSIONS: Go2CombatMission[] = [
  {
    id: 1,
    title: 'Misión 1',
    subtitle: 'Patrulla del sector — primer contacto',
    mode: 'instance',
    difficulty: 1,
    maxRounds: 40,
    playerStarter: M1_PLAYER,
    waves: [
      [
        { cell: 2, template: FRIGATE_ENEMY },
        { cell: 4, template: FRIGATE_ENEMY },
        { cell: 6, template: FRIGATE_ENEMY },
      ],
    ],
    rewards: [
      { icon: 'metal', amount: 1500, label: 'Metal' },
      { icon: 'credits', amount: 800, label: 'Créditos' },
    ],
  },
  {
    id: 2,
    title: 'Misión 2',
    subtitle: 'Escolta mercante',
    mode: 'instance',
    difficulty: 2,
    maxRounds: 50,
    playerStarter: M1_PLAYER,
    waves: [
      [
        { cell: 1, template: FRIGATE_ENEMY },
        { cell: 3, template: FRIGATE_ENEMY },
        { cell: 5, template: FRIGATE_ENEMY },
        { cell: 7, template: FRIGATE_ENEMY },
      ],
      [{ cell: 4, template: CORVETTE_ENEMY }],
    ],
    rewards: [
      { icon: 'plasma', amount: 900, label: 'He3' },
      { icon: 'credits', amount: 1200, label: 'Créditos' },
    ],
  },
  {
    id: 3,
    title: 'Misión 3',
    subtitle: 'Asalto al convoy',
    mode: 'instance',
    difficulty: 3,
    maxRounds: 60,
    playerStarter: [
      ...M1_PLAYER,
      { cell: 50, template: { ...FRIGATE_PLAYER, name: 'Fragata II', attack: 34 } },
    ],
    waves: [[{ cell: 0, template: CORVETTE_ENEMY }, { cell: 8, template: CORVETTE_ENEMY }]],
    rewards: [
      { icon: 'premium', amount: 2, label: 'Nova' },
      { icon: 'metal', amount: 2500, label: 'Metal' },
    ],
  },
  {
    id: 4,
    title: 'Defensa orbital',
    subtitle: 'Invasores por las 4 esquinas — protege la base',
    mode: 'base_defense',
    difficulty: 4,
    maxRounds: 55,
    playerStarter: M1_PLAYER,
    waves: [
      GO2_GRID_CORNER_CELLS.map((cell, i) => ({
        cell,
        template: { ...FRIGATE_ENEMY, name: `Incursión ${i + 1}` },
      })),
      [
        { cell: 0, template: CORVETTE_ENEMY },
        { cell: 80, template: CORVETTE_ENEMY },
      ],
    ],
    rewards: [
      { icon: 'plasma', amount: 1200, label: 'He3' },
      { icon: 'credits', amount: 2000, label: 'Créditos' },
    ],
  },
];

export function getCombatMission(id: number): Go2CombatMission | undefined {
  return GO2_COMBAT_MISSIONS.find((m) => m.id === id);
}
