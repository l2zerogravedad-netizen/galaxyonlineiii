import type { Go2FrameRarity } from '@/components/game/go2/Go2IconFrame';
import type { Go2IconName } from '@/components/game/go2/Go2Icons';

export interface DestockInventoryItem {
  id: string;
  name: string;
  category: 'resource' | 'module' | 'blueprint' | 'consumable';
  qty: number;
  icon: Go2IconName;
  rarity: Go2FrameRarity;
  description: string;
}

export const INVENTORY_ITEMS: DestockInventoryItem[] = [
  {
    id: 'i1',
    name: 'Lote de metal',
    category: 'resource',
    qty: 2400,
    icon: 'metal',
    rarity: 'common',
    description: 'Mineral refinado para construcción.',
  },
  {
    id: 'i2',
    name: 'Cristal He3',
    category: 'resource',
    qty: 800,
    icon: 'plasma',
    rarity: 'uncommon',
    description: 'Cristal de propulsión y investigación.',
  },
  {
    id: 'i3',
    name: 'Caja de créditos',
    category: 'resource',
    qty: 5000,
    icon: 'credits',
    rarity: 'rare',
    description: 'Moneda imperial del sector.',
  },
  {
    id: 'i4',
    name: 'Núcleo Nova',
    category: 'consumable',
    qty: 12,
    icon: 'premium',
    rarity: 'epic',
    description: 'Moneda premium DESTOCK SPACE.',
  },
  {
    id: 'i5',
    name: 'Módulo escudo T1',
    category: 'module',
    qty: 3,
    icon: 'shield',
    rarity: 'rare',
    description: 'Defensa para casco ligero.',
  },
  {
    id: 'i6',
    name: 'Reactor auxiliar',
    category: 'module',
    qty: 1,
    icon: 'energy',
    rarity: 'epic',
    description: 'Aumenta regeneración de energía.',
  },
  {
    id: 'i7',
    name: 'Plano Fragata',
    category: 'blueprint',
    qty: 1,
    icon: 'ship',
    rarity: 'legendary',
    description: 'Permite fabricar Fragata Ligera.',
  },
  {
    id: 'i8',
    name: 'Caja de suministros',
    category: 'consumable',
    qty: 5,
    icon: 'chest',
    rarity: 'uncommon',
    description: 'Recompensa de misión aleatoria.',
  },
];

export interface DestockMission {
  id: string;
  title: string;
  description: string;
  timeSec: number;
  rewards: { icon: Go2IconName; amount: number; label: string }[];
  status: 'available' | 'active' | 'done';
}

export const MISSIONS: DestockMission[] = [
  {
    id: 'm1',
    title: 'Patrulla del cinturón',
    description: 'Elimina 3 cazas pirata en el sector 7:4.',
    timeSec: 300,
    rewards: [
      { icon: 'metal', amount: 2000, label: 'Metal' },
      { icon: 'credits', amount: 500, label: 'Créditos' },
    ],
    status: 'available',
  },
  {
    id: 'm2',
    title: 'Convoy de cristal',
    description: 'Escolta el transporte hasta la estación aliada.',
    timeSec: 600,
    rewards: [
      { icon: 'plasma', amount: 1500, label: 'He3' },
      { icon: 'chest', amount: 1, label: 'Caja' },
    ],
    status: 'available',
  },
  {
    id: 'm3',
    title: 'Asalto al puesto Omega',
    description: 'Destruye la plataforma enemiga (Nv.12).',
    timeSec: 1200,
    rewards: [
      { icon: 'premium', amount: 5, label: 'Nova' },
      { icon: 'module', amount: 1, label: 'Módulo' },
    ],
    status: 'available',
  },
  {
    id: 'm4',
    title: 'Defensa orbital',
    description: 'Invasores entran por las 4 esquinas — protege la base.',
    timeSec: 900,
    rewards: [
      { icon: 'plasma', amount: 1200, label: 'He3' },
      { icon: 'credits', amount: 2000, label: 'Créditos' },
    ],
    status: 'available',
  },
];

export const CLAN_MOCK = {
  name: 'Alianza Destock',
  tag: 'DSX',
  level: 4,
  members: 28,
  maxMembers: 40,
  leader: 'Comandante Orion',
  bonus: '+8% producción de metal',
  wars: 1,
};
