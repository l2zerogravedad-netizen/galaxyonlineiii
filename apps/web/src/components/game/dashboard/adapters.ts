import { PLANET_BUILDING_SLOTS } from '@galaxy/shared';
import type { BuildingDefinition, GridSlot, ResourcesData } from '../types';
import { resourceImageSrc } from '@/lib/game-assets';

export function buildGridCellBuildings(
  grid: GridSlot[],
  catalog: BuildingDefinition[],
  slotCount: number = PLANET_BUILDING_SLOTS
): BuildingDefinition[] {
  return Array.from({ length: slotCount }, (_, slotIndex) => {
    const slot = grid.find((s) => s.slotIndex === slotIndex) ?? {
      slotIndex,
      buildingId: null,
    };

    if (!slot.buildingId) {
      return emptySlotBuilding(slotIndex);
    }

    const def = catalog.find((b) => b.id === slot.buildingId);
    if (def && def.level > 0 && def.status !== 'empty') {
      return { ...def, slotIndex };
    }

    return emptySlotBuilding(slotIndex);
  });
}

function emptySlotBuilding(slotIndex: number): BuildingDefinition {
  return {
    id: `slot-${slotIndex}`,
    name: 'Celda libre',
    type: 'EMPTY',
    level: 0,
    image: '',
    description: 'Espacio disponible en la grilla del planeta.',
    production: '—',
    capacity: '—',
    health: 0,
    category: 'core',
    upgradeCost: { metal: 0, plasma: 0, credits: 0 },
    status: 'empty',
    glow: 'none',
    slotIndex,
  };
}

export function findBuildingForSelection(
  selectedId: string,
  gridCells: BuildingDefinition[],
  catalog: BuildingDefinition[]
): BuildingDefinition {
  const fromGrid = gridCells.find((b) => b.id === selectedId);
  if (fromGrid) return fromGrid;
  const fromCatalog = catalog.find((b) => b.id === selectedId);
  if (fromCatalog) return fromCatalog;
  return gridCells[0] ?? catalog[0];
}

export function resourcesToGo2Hud(resources: ResourcesData) {
  return [
    { key: 'metal' as const, label: 'Metal', value: resources.metal, icon: '⚙️' },
    { key: 'plasma' as const, label: 'Plasma', value: resources.plasma, icon: '💎' },
    { key: 'credits' as const, label: 'Créditos', value: resources.credits, icon: '🪙' },
    { key: 'premium' as const, label: 'Premium', value: 0, icon: '💚' },
  ];
}

export function resourceImage(key: 'metal' | 'plasma' | 'credits') {
  return resourceImageSrc(key);
}

export function fmt(n: number) {
  return n.toLocaleString('es-ES');
}

export function resolveApiType(building: BuildingDefinition): string {
  if (building.type === 'EMPTY' || building.status === 'empty') {
    return building.type;
  }
  return building.type;
}
