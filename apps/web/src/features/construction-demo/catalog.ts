import type { BuildingCatalogItem, Resources } from './types';

export const GRID_COLS = 12;
export const GRID_ROWS = 10;

export const STARTING_RESOURCES: Resources = {
  metal: 15_000,
  energy: 12_000,
  crystal: 10_000,
};

export const BUILDING_CATALOG: BuildingCatalogItem[] = [
  {
    id: 'metal_mine',
    name: 'Mina de Metal',
    description: 'Produce metal pasivo.',
    cost: { metal: 120, energy: 40, crystal: 20 },
    footprint: { w: 2, h: 2 },
    color: '#b45309',
    accent: '#fbbf24',
    icon: '⛏',
  },
  {
    id: 'power_plant',
    name: 'Planta de Energía',
    description: 'Genera energía para la base.',
    cost: { metal: 200, energy: 80, crystal: 60 },
    footprint: { w: 2, h: 1 },
    color: '#15803d',
    accent: '#4ade80',
    icon: '⚡',
  },
  {
    id: 'warehouse',
    name: 'Almacén',
    description: 'Aumenta capacidad de almacenamiento.',
    cost: { metal: 150, energy: 50, crystal: 100 },
    footprint: { w: 2, h: 2 },
    color: '#a16207',
    accent: '#fde68a',
    icon: '📦',
  },
  {
    id: 'shipyard',
    name: 'Astillero',
    description: 'Construye naves (demo visual).',
    cost: { metal: 800, energy: 400, crystal: 300 },
    footprint: { w: 3, h: 2 },
    color: '#1d4ed8',
    accent: '#60a5fa',
    icon: '🚀',
    maxOnMap: 2,
  },
  {
    id: 'command_center',
    name: 'Centro de Comando',
    description: 'Núcleo de la base. Solo uno.',
    cost: { metal: 500, energy: 300, crystal: 250 },
    footprint: { w: 2, h: 2 },
    color: '#7c3aed',
    accent: '#c4b5fd',
    icon: '🏛',
    maxOnMap: 1,
  },
];

export function getCatalogItem(id: string): BuildingCatalogItem | undefined {
  return BUILDING_CATALOG.find((b) => b.id === id);
}
