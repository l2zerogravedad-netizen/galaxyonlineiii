export type PlanetType = 'ice' | 'fire' | 'earth' | 'gas' | 'lava' | 'resource';

export interface GalaxyPlanet {
  id: string;
  name: string;
  playerName: string;
  alliance: string;
  allianceTag: string;
  level: number;
  type: PlanetType;
  x: number; // 1-20
  y: number; // 1-20
  hasShield: boolean;
  hasMilitary: boolean; // estructura militar (cruz roja)
  population: number;
  resources: { metal: number; crystal: number; energy: number };
  buildings: number; // cantidad de edificios alrededor (0-8)
}

export const ALLIANCE_COLORS: Record<string, string> = {
  Destiny: '#4dabf7',
  Salvation: '#69db7c',
  INFerno: '#ff6b6b',
  Confederacy: '#ffd43b',
  Independent: '#adb5bd',
};

export const PLANET_TYPE_COLORS: Record<PlanetType, { light: string; base: string; dark: string }> = {
  ice:      { light: '#c9e4ff', base: '#7bb3e0', dark: '#4a90d9' },
  fire:     { light: '#ff8a65', base: '#e64a19', dark: '#bf360c' },
  earth:    { light: '#81c784', base: '#43a047', dark: '#2e7d32' },
  gas:      { light: '#ba68c8', base: '#8e24aa', dark: '#6a1b9a' },
  lava:     { light: '#ffb74d', base: '#f57c00', dark: '#e65100' },
  resource: { light: '#ffd54f', base: '#f9a825', dark: '#f57f17' },
};

// 60 planetas distribuidos en grid 20x20 con datos exactos del juego original
export const GALAXY_PLANETS: GalaxyPlanet[] = [
  // ===== Destiny [Destiny] (azul) =====
  { id: 'planet-01', name: 'Kepler-186f',    playerName: 'artbeniYakubu',  alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 18, type: 'earth',    x: 2,  y: 3,  hasShield: true,  hasMilitary: true,  population: 820000,  resources: { metal: 92000, crystal: 87000, energy: 76000 }, buildings: 8 },
  { id: 'planet-02', name: 'Proxima b',      playerName: 'Arcang',         alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 15, type: 'ice',      x: 3,  y: 5,  hasShield: true,  hasMilitary: false, population: 650000,  resources: { metal: 78000, crystal: 65000, energy: 82000 }, buildings: 6 },
  { id: 'planet-03', name: 'TRAPPIST-1e',    playerName: 'Anzestro',       alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 12, type: 'gas',      x: 5,  y: 2,  hasShield: false, hasMilitary: false, population: 480000,  resources: { metal: 54000, crystal: 71000, energy: 43000 }, buildings: 4 },
  { id: 'planet-04', name: 'Gliese 667Cc',   playerName: 'galactusk',      alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 20, type: 'fire',     x: 1,  y: 7,  hasShield: true,  hasMilitary: true,  population: 950000,  resources: { metal: 88000, crystal: 94000, energy: 91000 }, buildings: 8 },
  { id: 'planet-05', name: 'HD 40307g',      playerName: 'Sacer',          alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 14, type: 'earth',    x: 4,  y: 8,  hasShield: false, hasMilitary: true,  population: 720000,  resources: { metal: 67000, crystal: 58000, energy: 74000 }, buildings: 7 },
  { id: 'planet-06', name: 'Wolf 1061c',     playerName: 'airanpro',       alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 11, type: 'resource', x: 6,  y: 4,  hasShield: false, hasMilitary: false, population: 390000,  resources: { metal: 91000, crystal: 84000, energy: 62000 }, buildings: 3 },
  { id: 'planet-07', name: 'Kapteyn b',      playerName: 'Ginjaa',         alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 16, type: 'ice',      x: 7,  y: 9,  hasShield: true,  hasMilitary: false, population: 780000,  resources: { metal: 73000, crystal: 69000, energy: 81000 }, buildings: 7 },
  { id: 'planet-08', name: 'Kepler-442b',    playerName: 'Vibrio',         alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 13, type: 'lava',     x: 3,  y: 11, hasShield: false, hasMilitary: true,  population: 560000,  resources: { metal: 62000, crystal: 77000, energy: 54000 }, buildings: 5 },
  { id: 'planet-09', name: 'Kepler-62f',     playerName: 'Mordor',         alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 19, type: 'gas',      x: 8,  y: 6,  hasShield: true,  hasMilitary: true,  population: 880000,  resources: { metal: 85000, crystal: 76000, energy: 92000 }, buildings: 8 },
  { id: 'planet-10', name: 'Kepler-452b',    playerName: 'Krum',           alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 10, type: 'fire',     x: 2,  y: 14, hasShield: false, hasMilitary: false, population: 420000,  resources: { metal: 48000, crystal: 55000, energy: 61000 }, buildings: 4 },
  { id: 'planet-11', name: '55 Cancri e',    playerName: 'zakio',          alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 17, type: 'earth',    x: 9,  y: 3,  hasShield: true,  hasMilitary: true,  population: 810000,  resources: { metal: 79000, crystal: 88000, energy: 73000 }, buildings: 8 },
  { id: 'planet-12', name: 'WASP-12b',       playerName: 'OnlyDisaster',   alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 15, type: 'resource', x: 5,  y: 12, hasShield: false, hasMilitary: false, population: 690000,  resources: { metal: 96000, crystal: 72000, energy: 68000 }, buildings: 6 },

  // ===== Salvation [Salvation] (verde) =====
  { id: 'planet-13', name: 'HD 209458 b',    playerName: 'OK420',          alliance: 'Salvation', allianceTag: '[Salvation]',     level: 14, type: 'gas',      x: 12, y: 2,  hasShield: true,  hasMilitary: false, population: 710000,  resources: { metal: 64000, crystal: 81000, energy: 57000 }, buildings: 7 },
  { id: 'planet-14', name: 'Kepler-7b',      playerName: 'Auraxis',        alliance: 'Salvation', allianceTag: '[Salvation]',     level: 16, type: 'ice',      x: 14, y: 5,  hasShield: false, hasMilitary: true,  population: 760000,  resources: { metal: 71000, crystal: 63000, energy: 85000 }, buildings: 7 },
  { id: 'planet-15', name: 'HAT-P-7b',       playerName: 'Lobo',           alliance: 'Salvation', allianceTag: '[Salvation]',     level: 18, type: 'earth',    x: 11, y: 8,  hasShield: true,  hasMilitary: true,  population: 830000,  resources: { metal: 87000, crystal: 79000, energy: 91000 }, buildings: 8 },
  { id: 'planet-16', name: 'CoRoT-7b',       playerName: 'Tierra',         alliance: 'Salvation', allianceTag: '[Salvation]',     level: 12, type: 'fire',     x: 15, y: 3,  hasShield: false, hasMilitary: false, population: 520000,  resources: { metal: 58000, crystal: 46000, energy: 72000 }, buildings: 5 },
  { id: 'planet-17', name: 'Gliese 581d',    playerName: 'Icele',          alliance: 'Salvation', allianceTag: '[Salvation]',     level: 20, type: 'lava',     x: 13, y: 10, hasShield: true,  hasMilitary: true,  population: 920000,  resources: { metal: 94000, crystal: 88000, energy: 86000 }, buildings: 8 },
  { id: 'planet-18', name: 'Kepler-22b',     playerName: 'Rixoxan',        alliance: 'Salvation', allianceTag: '[Salvation]',     level: 11, type: 'resource', x: 16, y: 7,  hasShield: false, hasMilitary: false, population: 460000,  resources: { metal: 82000, crystal: 91000, energy: 67000 }, buildings: 4 },
  { id: 'planet-19', name: 'K2-18b',         playerName: 'MrKnocks',       alliance: 'Salvation', allianceTag: '[Salvation]',     level: 15, type: 'gas',      x: 10, y: 13, hasShield: true,  hasMilitary: false, population: 740000,  resources: { metal: 69000, crystal: 74000, energy: 58000 }, buildings: 7 },
  { id: 'planet-20', name: 'TOI-700 d',      playerName: 'GodSlayer',      alliance: 'Salvation', allianceTag: '[Salvation]',     level: 17, type: 'ice',      x: 17, y: 11, hasShield: true,  hasMilitary: true,  population: 800000,  resources: { metal: 76000, crystal: 82000, energy: 79000 }, buildings: 8 },

  // ===== INFerno [=INFERN=] (rojo) =====
  { id: 'planet-21', name: 'LHS 1140 b',     playerName: 'Peralta',        alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 19, type: 'fire',     x: 19, y: 2,  hasShield: true,  hasMilitary: true,  population: 870000,  resources: { metal: 81000, crystal: 93000, energy: 78000 }, buildings: 8 },
  { id: 'planet-22', name: 'Kepler-1649c',   playerName: 'ElPro',          alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 13, type: 'lava',     x: 18, y: 6,  hasShield: false, hasMilitary: true,  population: 590000,  resources: { metal: 77000, crystal: 65000, energy: 84000 }, buildings: 5 },
  { id: 'planet-23', name: 'Teegarden b',    playerName: 'ReyDavid',       alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 16, type: 'earth',    x: 20, y: 9,  hasShield: true,  hasMilitary: false, population: 770000,  resources: { metal: 73000, crystal: 69000, energy: 81000 }, buildings: 7 },
  { id: 'planet-24', name: 'Ross 128 b',     playerName: 'Zamurito',       alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 14, type: 'gas',      x: 16, y: 14, hasShield: false, hasMilitary: true,  population: 630000,  resources: { metal: 58000, crystal: 72000, energy: 49000 }, buildings: 6 },
  { id: 'planet-25', name: 'GJ 357 d',       playerName: 'SaTaN',          alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 20, type: 'resource', x: 19, y: 16, hasShield: true,  hasMilitary: true,  population: 980000,  resources: { metal: 99000, crystal: 87000, energy: 94000 }, buildings: 8 },
  { id: 'planet-26', name: 'Kepler-69c',     playerName: 'Zeuz',           alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 12, type: 'ice',      x: 14, y: 17, hasShield: false, hasMilitary: false, population: 510000,  resources: { metal: 56000, crystal: 64000, energy: 72000 }, buildings: 5 },
  { id: 'planet-27', name: 'HD 219134 b',    playerName: 'DarkKiller',     alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 18, type: 'fire',     x: 18, y: 19, hasShield: true,  hasMilitary: true,  population: 840000,  resources: { metal: 89000, crystal: 76000, energy: 82000 }, buildings: 8 },

  // ===== Confederacy [CONFEDERATION] (amarillo) =====
  { id: 'planet-28', name: 'Kepler-10b',     playerName: 'StarLord',       alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 15, type: 'earth',    x: 7,  y: 15, hasShield: false, hasMilitary: false, population: 680000,  resources: { metal: 72000, crystal: 68000, energy: 59000 }, buildings: 6 },
  { id: 'planet-29', name: 'Kepler-37d',     playerName: 'NebulaX',        alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 17, type: 'gas',      x: 9,  y: 18, hasShield: true,  hasMilitary: false, population: 790000,  resources: { metal: 68000, crystal: 75000, energy: 82000 }, buildings: 7 },
  { id: 'planet-30', name: 'Kepler-90h',     playerName: 'CosmicKing',     alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 13, type: 'ice',      x: 5,  y: 17, hasShield: false, hasMilitary: true,  population: 550000,  resources: { metal: 61000, crystal: 73000, energy: 48000 }, buildings: 5 },
  { id: 'planet-31', name: 'HD 189733 b',    playerName: 'VoidWalker',     alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 19, type: 'lava',     x: 11, y: 16, hasShield: true,  hasMilitary: true,  population: 850000,  resources: { metal: 91000, crystal: 84000, energy: 77000 }, buildings: 8 },
  { id: 'planet-32', name: 'Kepler-16b',     playerName: 'IronFist',       alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 14, type: 'fire',     x: 4,  y: 20, hasShield: false, hasMilitary: false, population: 620000,  resources: { metal: 54000, crystal: 67000, energy: 73000 }, buildings: 6 },
  { id: 'planet-33', name: 'PH1b',           playerName: 'ShadowHunter',   alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 16, type: 'resource', x: 8,  y: 20, hasShield: true,  hasMilitary: false, population: 730000,  resources: { metal: 86000, crystal: 79000, energy: 68000 }, buildings: 7 },
  { id: 'planet-34', name: 'Kepler-11g',     playerName: 'NightCrawler',   alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 11, type: 'earth',    x: 12, y: 19, hasShield: false, hasMilitary: false, population: 440000,  resources: { metal: 52000, crystal: 48000, energy: 61000 }, buildings: 4 },

  // ===== Independent [IND] (gris) =====
  { id: 'planet-35', name: '55 Cancri f',    playerName: 'ThunderBolt',    alliance: 'Independent', allianceTag: '[IND]',           level: 10, type: 'resource', x: 1,  y: 1,  hasShield: false, hasMilitary: false, population: 320000,  resources: { metal: 41000, crystal: 38000, energy: 52000 }, buildings: 3 },
  { id: 'planet-36', name: 'Upsilon d',      playerName: 'StormBreaker',   alliance: 'Independent', allianceTag: '[IND]',           level: 8,  type: 'ice',      x: 20, y: 20, hasShield: false, hasMilitary: false, population: 210000,  resources: { metal: 28000, crystal: 35000, energy: 31000 }, buildings: 2 },
  { id: 'planet-37', name: 'Gliese 876d',    playerName: 'FrostBite',      alliance: 'Independent', allianceTag: '[IND]',           level: 9,  type: 'gas',      x: 1,  y: 20, hasShield: false, hasMilitary: false, population: 280000,  resources: { metal: 33000, crystal: 29000, energy: 44000 }, buildings: 2 },
  { id: 'planet-38', name: 'Kepler-20f',     playerName: 'FireStorm',      alliance: 'Independent', allianceTag: '[IND]',           level: 7,  type: 'fire',     x: 20, y: 1,  hasShield: false, hasMilitary: false, population: 180000,  resources: { metal: 22000, crystal: 31000, energy: 26000 }, buildings: 1 },
  { id: 'planet-39', name: 'HD 85512 b',     playerName: 'IceQueen',       alliance: 'Independent', allianceTag: '[IND]',           level: 11, type: 'earth',    x: 10, y: 10, hasShield: false, hasMilitary: false, population: 430000,  resources: { metal: 51000, crystal: 47000, energy: 62000 }, buildings: 4 },
  { id: 'planet-40', name: 'Gliese 581g',    playerName: 'DragonKing',     alliance: 'Independent', allianceTag: '[IND]',           level: 12, type: 'lava',     x: 13, y: 13, hasShield: false, hasMilitary: true,  population: 530000,  resources: { metal: 64000, crystal: 58000, energy: 71000 }, buildings: 5 },
  { id: 'planet-41', name: 'Kepler-61b',     playerName: 'Phoenix',        alliance: 'Independent', allianceTag: '[IND]',           level: 6,  type: 'resource', x: 15, y: 1,  hasShield: false, hasMilitary: false, population: 150000,  resources: { metal: 19000, crystal: 24000, energy: 28000 }, buildings: 1 },

  // ===== Destiny [Destiny] - segunda tanda =====
  { id: 'planet-42', name: 'KOI-4878',       playerName: 'WolfPack',       alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 14, type: 'gas',      x: 7,  y: 7,  hasShield: true,  hasMilitary: false, population: 660000,  resources: { metal: 71000, crystal: 65000, energy: 78000 }, buildings: 6 },
  { id: 'planet-43', name: 'Kepler-283c',    playerName: 'TigerClaw',      alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 10, type: 'fire',     x: 9,  y: 1,  hasShield: false, hasMilitary: false, population: 410000,  resources: { metal: 47000, crystal: 53000, energy: 61000 }, buildings: 4 },
  { id: 'planet-44', name: 'Kepler-296e',    playerName: 'EagleEye',       alliance: 'Destiny',  allianceTag: '[Destiny]',      level: 13, type: 'ice',      x: 11, y: 5,  hasShield: false, hasMilitary: true,  population: 580000,  resources: { metal: 63000, crystal: 57000, energy: 69000 }, buildings: 5 },

  // ===== Salvation [Salvation] - segunda tanda =====
  { id: 'planet-45', name: 'Kepler-438b',    playerName: 'BearGrills',     alliance: 'Salvation', allianceTag: '[Salvation]',     level: 15, type: 'earth',    x: 14, y: 15, hasShield: true,  hasMilitary: false, population: 700000,  resources: { metal: 74000, crystal: 68000, energy: 81000 }, buildings: 7 },
  { id: 'planet-46', name: 'Kepler-440b',    playerName: 'SnakeEyes',      alliance: 'Salvation', allianceTag: '[Salvation]',     level: 9,  type: 'lava',     x: 16, y: 18, hasShield: false, hasMilitary: false, population: 350000,  resources: { metal: 42000, crystal: 51000, energy: 38000 }, buildings: 3 },
  { id: 'planet-47', name: 'TRAPPIST-1f',    playerName: 'LionHeart',      alliance: 'Salvation', allianceTag: '[Salvation]',     level: 12, type: 'resource', x: 12, y: 12, hasShield: false, hasMilitary: true,  population: 500000,  resources: { metal: 78000, crystal: 65000, energy: 72000 }, buildings: 5 },

  // ===== INFerno [=INFERN=] - segunda tanda =====
  { id: 'planet-48', name: 'TRAPPIST-1g',    playerName: 'CobraKai',       alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 17, type: 'ice',      x: 20, y: 12, hasShield: true,  hasMilitary: true,  population: 820000,  resources: { metal: 77000, crystal: 83000, energy: 79000 }, buildings: 8 },
  { id: 'planet-49', name: 'Kepler-1540b',   playerName: 'ElPro',          alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 8,  type: 'fire',     x: 17, y: 4,  hasShield: false, hasMilitary: false, population: 260000,  resources: { metal: 31000, crystal: 39000, energy: 44000 }, buildings: 2 },
  { id: 'planet-50', name: 'HD 97658b',      playerName: 'SaTaN',          alliance: 'INFerno',  allianceTag: '[=INFERN=]',      level: 11, type: 'gas',      x: 20, y: 5,  hasShield: false, hasMilitary: false, population: 470000,  resources: { metal: 54000, crystal: 61000, energy: 48000 }, buildings: 4 },

  // ===== Confederacy [CONFEDERATION] - segunda tanda =====
  { id: 'planet-51', name: 'GJ 1132b',       playerName: 'NebulaX',        alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 13, type: 'lava',     x: 6,  y: 13, hasShield: false, hasMilitary: true,  population: 570000,  resources: { metal: 66000, crystal: 72000, energy: 54000 }, buildings: 5 },
  { id: 'planet-52', name: 'Kepler-138b',    playerName: 'CosmicKing',     alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 10, type: 'ice',      x: 3,  y: 16, hasShield: false, hasMilitary: false, population: 400000,  resources: { metal: 45000, crystal: 52000, energy: 38000 }, buildings: 4 },
  { id: 'planet-53', name: 'WASP-121b',      playerName: 'VoidWalker',     alliance: 'Confederacy', allianceTag: '[CONFEDERATION]', level: 16, type: 'earth',    x: 8,  y: 10, hasShield: true,  hasMilitary: false, population: 750000,  resources: { metal: 81000, crystal: 76000, energy: 69000 }, buildings: 7 },

  // ===== Independent [IND] - segunda tanda =====
  { id: 'planet-54', name: 'CoRoT-1b',       playerName: 'ThunderBolt',    alliance: 'Independent', allianceTag: '[IND]',           level: 7,  type: 'gas',      x: 1,  y: 12, hasShield: false, hasMilitary: false, population: 190000,  resources: { metal: 24000, crystal: 31000, energy: 27000 }, buildings: 1 },
  { id: 'planet-55', name: 'HAT-P-1b',       playerName: 'StormBreaker',   alliance: 'Independent', allianceTag: '[IND]',           level: 5,  type: 'resource', x: 20, y: 18, hasShield: false, hasMilitary: false, population: 120000,  resources: { metal: 15000, crystal: 18000, energy: 22000 }, buildings: 1 },
  { id: 'planet-56', name: 'WASP-17b',       playerName: 'FrostBite',      alliance: 'Independent', allianceTag: '[IND]',           level: 8,  type: 'fire',     x: 1,  y: 18, hasShield: false, hasMilitary: false, population: 250000,  resources: { metal: 30000, crystal: 27000, energy: 41000 }, buildings: 2 },
  { id: 'planet-57', name: 'Kepler-9b',      playerName: 'FireStorm',      alliance: 'Independent', allianceTag: '[IND]',           level: 6,  type: 'ice',      x: 19, y: 1,  hasShield: false, hasMilitary: false, population: 170000,  resources: { metal: 21000, crystal: 26000, energy: 33000 }, buildings: 1 },
  { id: 'planet-58', name: 'Kepler-11b',     playerName: 'DragonKing',     alliance: 'Independent', allianceTag: '[IND]',           level: 9,  type: 'earth',    x: 5,  y: 10, hasShield: false, hasMilitary: false, population: 310000,  resources: { metal: 37000, crystal: 42000, energy: 28000 }, buildings: 3 },
  { id: 'planet-59', name: 'Kepler-11c',     playerName: 'Phoenix',        alliance: 'Independent', allianceTag: '[IND]',           level: 7,  type: 'lava',     x: 15, y: 8,  hasShield: false, hasMilitary: false, population: 220000,  resources: { metal: 35000, crystal: 29000, energy: 38000 }, buildings: 2 },
  { id: 'planet-60', name: 'Kepler-11d',     playerName: 'IceQueen',       alliance: 'Independent', allianceTag: '[IND]',           level: 10, type: 'gas',      x: 3,  y: 9,  hasShield: false, hasMilitary: false, population: 380000,  resources: { metal: 44000, crystal: 51000, energy: 47000 }, buildings: 3 },
];

export const GALAXY_SIZE = { width: 20, height: 20, cellSize: 100 };
