export type Rarity = 'common' | 'super' | 'legendary' | 'divine';

export interface EquipmentItem {
  id: string;
  name: string;
  quality: 'S' | 'A' | 'B' | 'C' | 'D';
  icon: string;
}

export interface CommanderStats {
  accuracy: number;
  speed: number;
  dodge: number;
  electron: number;
}

export interface Commander {
  id: string;
  name: string;
  rarity: Rarity;
  level: number;
  exp: number;
  expMax: number;
  stars: number;
  skill: string;
  status: string;
  stats: CommanderStats;
  equipment: {
    weapons: (EquipmentItem | null)[];
    defense: (EquipmentItem | null)[];
  };
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#4caf50',
  super: '#2196f3',
  legendary: '#9c27b0',
  divine: '#ff9800',
};

export const RARITY_DOT_CLASS: Record<Rarity, string> = {
  common: 'bg-[#4caf50]',
  super: 'bg-[#2196f3]',
  legendary: 'bg-[#9c27b0]',
  divine: 'bg-[#ff9800]',
};

export const QUALITY_COLORS: Record<string, { border: string; bg: string }> = {
  S: { border: 'border-[#ffd54f]', bg: 'bg-gradient-to-br from-[#b8860b] to-[#8b6914]' },
  A: { border: 'border-[#4caf50]', bg: 'bg-gradient-to-br from-[#2e7d32] to-[#1b5e20]' },
  B: { border: 'border-[#42a5f5]', bg: 'bg-gradient-to-br from-[#1565c0] to-[#0d47a1]' },
  C: { border: 'border-[#757575]', bg: 'bg-gradient-to-br from-[#616161] to-[#424242]' },
  D: { border: 'border-[#e53935]', bg: 'bg-gradient-to-br from-[#c62828] to-[#8e0000]' },
};

export const COMMANDERS: Commander[] = [
  {
    id: 'panis',
    name: 'Panis',
    rarity: 'common',
    level: 1,
    exp: 0,
    expMax: 180,
    stars: 1,
    skill: 'Precision Fire',
    status: 'Normal',
    stats: { accuracy: 4, speed: 2.8, dodge: 6, electron: 1.2 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'sofia',
    name: 'Sofia',
    rarity: 'common',
    level: 1,
    exp: 0,
    expMax: 180,
    stars: 1,
    skill: 'Rapid Reload',
    status: 'Normal',
    stats: { accuracy: 3, speed: 3.2, dodge: 5, electron: 1.5 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'jerome',
    name: 'Jerome',
    rarity: 'common',
    level: 1,
    exp: 0,
    expMax: 180,
    stars: 1,
    skill: 'Shield Boost',
    status: 'Normal',
    stats: { accuracy: 2, speed: 2.5, dodge: 7, electron: 2.1 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'donna',
    name: 'Donna',
    rarity: 'common',
    level: 1,
    exp: 0,
    expMax: 180,
    stars: 1,
    skill: 'Repair',
    status: 'Normal',
    stats: { accuracy: 3.5, speed: 2.2, dodge: 6, electron: 1.8 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'reggie',
    name: 'Reggie',
    rarity: 'common',
    level: 1,
    exp: 0,
    expMax: 180,
    stars: 1,
    skill: 'Paralyze',
    status: 'Normal',
    stats: { accuracy: 5, speed: 3.6, dodge: 8, electron: 1.4 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'angla',
    name: 'Angla',
    rarity: 'super',
    level: 1,
    exp: 0,
    expMax: 200,
    stars: 1,
    skill: 'Critical Hit',
    status: 'Normal',
    stats: { accuracy: 6, speed: 4.1, dodge: 9, electron: 2.2 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'gastaf',
    name: 'Gastaf',
    rarity: 'legendary',
    level: 38,
    exp: 14500,
    expMax: 20000,
    stars: 5,
    skill: 'Meteor Shower',
    status: 'Normal',
    stats: { accuracy: 12, speed: 8.5, dodge: 15, electron: 5.8 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'penni',
    name: 'Penni',
    rarity: 'legendary',
    level: 42,
    exp: 18200,
    expMax: 24000,
    stars: 6,
    skill: 'Black Hole',
    status: 'Normal',
    stats: { accuracy: 14, speed: 9.2, dodge: 17, electron: 6.5 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'aileen',
    name: 'Aileen',
    rarity: 'legendary',
    level: 45,
    exp: 21500,
    expMax: 28000,
    stars: 7,
    skill: 'Supernova',
    status: 'Normal',
    stats: { accuracy: 15, speed: 10.1, dodge: 18, electron: 7.2 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'titan',
    name: 'Titan',
    rarity: 'divine',
    level: 50,
    exp: 50000,
    expMax: 50000,
    stars: 9,
    skill: 'Galactic Destroyer',
    status: 'Normal',
    stats: { accuracy: 18, speed: 12.5, dodge: 22, electron: 9.8 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'death-from-above',
    name: 'Death from Above',
    rarity: 'divine',
    level: 50,
    exp: 50000,
    expMax: 50000,
    stars: 9,
    skill: 'Obliterate',
    status: 'Normal',
    stats: { accuracy: 20, speed: 11.8, dodge: 20, electron: 10.5 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
  {
    id: 'hand-of-lelantos',
    name: 'Hand of Lelantos',
    rarity: 'divine',
    level: 50,
    exp: 50000,
    expMax: 50000,
    stars: 9,
    skill: 'Divine Wrath',
    status: 'Normal',
    stats: { accuracy: 19, speed: 13.2, dodge: 24, electron: 11.0 },
    equipment: {
      weapons: [
        { id: 'w1', name: 'Laser Rifle', quality: 'S', icon: '🔫' },
        { id: 'w2', name: 'Plasma Sword', quality: 'A', icon: '⚔️' },
        { id: 'w3', name: 'Ion Dagger', quality: 'B', icon: '🗡️' },
        { id: 'w4', name: 'Pulse Grenade', quality: 'C', icon: '💥' },
      ],
      defense: [
        { id: 'd1', name: 'Shield Gen', quality: 'C', icon: '🛸' },
        { id: 'd2', name: 'Armor Plating', quality: 'B', icon: '🚀' },
        { id: 'd3', name: 'Deflector', quality: 'A', icon: '🛰️' },
        { id: 'd4', name: 'Repair Bot', quality: 'B', icon: '✈️' },
      ],
    },
  },
];
