export type PlanetType = 'ice' | 'fire' | 'earth' | 'gas' | 'lava' | 'resource';

export interface GalaxyPlanet {
  id: string;
  name: string;
  playerName: string;
  alliance: string;
  allianceTag: string;
  level: number;
  type: PlanetType;
  x: number;
  y: number;
  hasShield: boolean;
  population: number;
  resources: { metal: number; crystal: number; energy: number };
}

export const ALLIANCE_COLORS: Record<string, string> = {
  Destiny: '#4dabf7',
  Salvation: '#69db7c',
  INFerno: '#ff6b6b',
  Confederacy: '#ffd43b',
  Independent: '#adb5bd',
};

export const PLANET_TYPE_COLORS: Record<PlanetType, string[]> = {
  ice: ['#a5d8ff', '#4dabf7', '#1971c2'],
  fire: ['#ff6b6b', '#c92a2a', '#750e0e'],
  earth: ['#69db7c', '#2f9e44', '#186a3b'],
  gas: ['#da77f2', '#9c36b5', '#5f1a7a'],
  lava: ['#ffa94d', '#e8590c', '#943308'],
  resource: ['#ffd43b', '#f08c00', '#b86800'],
};

const PLAYER_NAMES = [
  'Ginjaa', 'Vibrio', 'Mordor', 'Krum', 'Rixoxan',
  'Icele', 'Lobo', 'Tierra', 'MrKnocks', 'GodSlayer',
  'Arcang', 'galactusk', 'Sacer', 'Airapros', 'Zakio',
  'OnlyDisaster', 'Auraxis', 'Anzestro', 'OK420', 'Xerath',
  'Nebulon', 'VoidStar', 'QuantumX', 'AstroLord', 'CosmicRay',
  'StellarDrift', 'NebulaKing', 'ZeroKelvin', 'DarkMatter',
  'SolarFlare', 'LunarEclipse', 'RedShift', 'IonStorm',
  'PulseWave', 'GravityWell', 'EventHorizon', 'SuperNova',
  'HyperDrive', 'Photon', 'WarpSpeed', 'StarDust', 'Galactic',
  'SpaceTime', 'Celestial', 'Omega',
];

const ALLIANCES = [
  { name: 'Destiny', tag: '[D]' },
  { name: 'Salvation', tag: '[S]' },
  { name: 'INFerno', tag: '[I]' },
  { name: 'Confederacy', tag: '[C]' },
  { name: 'Independent', tag: '[IND]' },
];

const PLANET_TYPES: PlanetType[] = ['ice', 'fire', 'earth', 'gas', 'lava', 'resource'];

const PLANET_NAMES = [
  'Kepler-186f', 'Proxima Centauri b', 'TRAPPIST-1e', 'Gliese 667Cc',
  'HD 40307g', 'Wolf 1061c', 'Kapteyn b', 'Kepler-442b',
  'Kepler-62f', 'Kepler-452b', '55 Cancri e', 'WASP-12b',
  'HD 209458 b', 'Kepler-7b', 'HAT-P-7b', 'CoRoT-7b',
  'Gliese 581d', 'Kepler-22b', 'K2-18b', 'TOI-700 d',
  'LHS 1140 b', 'Kepler-1649c', 'Teegarden b', 'Ross 128 b',
  'GJ 357 d', 'Kepler-69c', 'HD 219134 b', 'Kepler-10b',
  'Kepler-37d', 'Kepler-90h', 'HD 189733 b', 'Kepler-16b',
  'PH1b', 'Kepler-11g', '55 Cancri f', 'Upsilon Andromedae d',
  'Gliese 876d', 'Kepler-20f', 'HD 85512 b', 'Gliese 581g',
  'Kepler-61b', 'KOI-4878.01', 'Kepler-283c', 'Kepler-296e',
  'Kepler-438b', 'Kepler-440b',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generatePlanets(count: number): GalaxyPlanet[] {
  const rng = seededRandom(42);
  const planets: GalaxyPlanet[] = [];
  const occupied = new Set<string>();

  for (let i = 0; i < count; i++) {
    let x: number, y: number, key: string;
    let attempts = 0;
    do {
      x = Math.floor(rng() * 20) + 1;
      y = Math.floor(rng() * 20) + 1;
      key = `${x},${y}`;
      attempts++;
    } while (occupied.has(key) && attempts < 100);

    occupied.add(key);

    const alliance = ALLIANCES[Math.floor(rng() * ALLIANCES.length)];
    const type = PLANET_TYPES[Math.floor(rng() * PLANET_TYPES.length)];

    planets.push({
      id: `planet-${i + 1}`,
      name: PLANET_NAMES[i % PLANET_NAMES.length],
      playerName: PLAYER_NAMES[i % PLAYER_NAMES.length],
      alliance: alliance.name,
      allianceTag: alliance.tag,
      level: Math.floor(rng() * 20) + 1,
      type,
      x,
      y,
      hasShield: rng() > 0.6,
      population: Math.floor(rng() * 500000) + 1000,
      resources: {
        metal: Math.floor(rng() * 100000),
        crystal: Math.floor(rng() * 100000),
        energy: Math.floor(rng() * 100000),
      },
    });
  }

  return planets;
}

export const GALAXY_PLANETS: GalaxyPlanet[] = generatePlanets(45);

export const GALAXY_SIZE = { width: 20, height: 20, cellSize: 100 };
