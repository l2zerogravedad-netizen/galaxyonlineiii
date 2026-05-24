import type { ApiBuilding, GameDashboardDto } from '@galaxy/shared';
import type { BuildingDefinition, BuildingStatus, GridSlot, PlayerData, ResourcesData } from '@/components/game/types';
import {
  BUILDING_CATALOG,
  DEFAULT_PLAYER,
  DEFAULT_RESOURCES,
  INITIAL_GRID,
} from '@/components/game/mockData';
import { API_BUILDABLE_TYPES, TYPE_TO_CATALOG_ID } from './buildingMap';

function mapBuildingStatus(apiStatus: string): BuildingStatus {
  if (apiStatus === 'CONSTRUCTING' || apiStatus === 'UPGRADING') return 'upgrading';
  if (apiStatus === 'IDLE' || apiStatus === 'ACTIVE') return 'active';
  return 'active';
}

function productionLabel(type: string, productionPerHour: number): string {
  if (type === 'METAL_MINE' && productionPerHour > 0) {
    return `+${productionPerHour.toLocaleString()}/h metal`;
  }
  if (type === 'PLASMA_EXTRACTOR' && productionPerHour > 0) {
    return `+${productionPerHour.toLocaleString()}/h plasma`;
  }
  return '—';
}

function mergeApiBuilding(
  template: BuildingDefinition,
  api: ApiBuilding,
  resources: GameDashboardDto['resources']
): BuildingDefinition {
  const production =
    api.type === 'METAL_MINE'
      ? productionLabel(api.type, resources.metalProduction)
      : api.type === 'PLASMA_EXTRACTOR'
        ? productionLabel(api.type, resources.plasmaProduction)
        : template.production;

  return {
    ...template,
    type: api.type,
    level: api.level,
    status: mapBuildingStatus(api.status),
    slotIndex: api.slotIndex,
    production,
    apiBuildingId: api.id,
  };
}

export function dashboardToGrid(planet: GameDashboardDto['planet']): GridSlot[] {
  const grid: GridSlot[] = Array.from({ length: 9 }, (_, slotIndex) => ({
    slotIndex,
    buildingId: null,
  }));

  for (const b of planet.buildings) {
    if (b.slotIndex < 0 || b.slotIndex > 8) continue;
    const catalogId = TYPE_TO_CATALOG_ID[b.type];
    if (catalogId) {
      grid[b.slotIndex] = { slotIndex: b.slotIndex, buildingId: catalogId };
    }
  }

  return grid;
}

export function dashboardToBuildings(dto: GameDashboardDto): BuildingDefinition[] {
  const onPlanetByCatalogId = new Map<string, ApiBuilding>();

  for (const api of dto.planet.buildings) {
    const catalogId = TYPE_TO_CATALOG_ID[api.type];
    if (catalogId) onPlanetByCatalogId.set(catalogId, api);
  }

  return BUILDING_CATALOG.map((template) => {
    const api = onPlanetByCatalogId.get(template.id);
    if (api) {
      return mergeApiBuilding(template, api, dto.resources);
    }

    const buildable = API_BUILDABLE_TYPES.has(template.type);
    return {
      ...template,
      status: buildable ? ('empty' as const) : ('locked' as const),
      level: 0,
      slotIndex: undefined,
      apiBuildingId: undefined,
    };
  });
}

export function dashboardToPlayer(dto: GameDashboardDto): PlayerData {
  return {
    name: dto.player.name,
    level: dto.player.level,
    xp: dto.player.xp,
    xpMax: dto.player.xpMax,
  };
}

export function dashboardToResources(dto: GameDashboardDto): ResourcesData {
  return {
    metal: dto.resources.metal,
    plasma: dto.resources.plasma,
    credits: dto.resources.credits,
    metalCapacity: dto.resources.metalCapacity,
    plasmaCapacity: dto.resources.plasmaCapacity,
    metalProduction: dto.resources.metalProduction,
    plasmaProduction: dto.resources.plasmaProduction,
  };
}

export function getMockDashboardState() {
  return {
    player: DEFAULT_PLAYER,
    resources: DEFAULT_RESOURCES,
    planetId: null as string | null,
    planetName: 'Planeta Principal',
    planetType: 'HABITABLE',
    grid: INITIAL_GRID,
    buildings: BUILDING_CATALOG,
    usingMock: true,
  };
}
