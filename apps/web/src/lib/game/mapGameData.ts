import type { ApiBuilding, GameDashboardDto, Go2ConstructionQueueItemDto } from '@galaxy/shared';
import {
  getBuildingLevelCost,
  normalizeBuildingType,
  PLANET_BUILDING_SLOTS,
  TYPE_TO_CATALOG_ID,
} from '@galaxy/shared';
import type { BuildingDefinition, BuildingStatus, GridSlot, PlayerData, ResourcesData } from '@/components/game/types';
import {
  BUILDING_CATALOG,
  DEFAULT_PLAYER,
  DEFAULT_RESOURCES,
} from '@/components/game/mockData';
import { API_BUILDABLE_TYPES } from './buildingMap';
import { BUILD_TAB_BY_TYPE, MAX_PER_PLANET_BY_TYPE } from '@galaxy/shared';

function mapBuildingStatus(apiStatus: string): BuildingStatus {
  if (apiStatus === 'CONSTRUCTING' || apiStatus === 'UPGRADING') return 'upgrading';
  return 'active';
}

function productionLabel(type: string, dto: GameDashboardDto['resources']): string {
  const t = normalizeBuildingType(type);
  if (t === 'metal_extractor' && dto.metalProduction > 0) {
    return `+${dto.metalProduction.toLocaleString()}/h metal`;
  }
  if (t === 'plasma_refinery' && dto.plasmaProduction > 0) {
    return `+${dto.plasmaProduction.toLocaleString()}/h plasma`;
  }
  return '—';
}

function mergeApiBuilding(
  template: BuildingDefinition,
  api: ApiBuilding,
  dto: GameDashboardDto['resources']
): BuildingDefinition {
  const canonical = normalizeBuildingType(api.type);
  return {
    ...template,
    type: canonical,
    level: api.level,
    status: mapBuildingStatus(api.status),
    slotIndex: api.slotIndex,
    production: productionLabel(canonical, dto),
    apiBuildingId: api.id,
    constructionEndsAt: api.constructionEndsAt ?? null,
    uiTab: BUILD_TAB_BY_TYPE[canonical],
    maxPerPlanet: MAX_PER_PLANET_BY_TYPE[canonical],
  };
}

export function dashboardToGrid(planet: GameDashboardDto['planet']): GridSlot[] {
  const grid: GridSlot[] = Array.from({ length: PLANET_BUILDING_SLOTS }, (_, slotIndex) => ({
    slotIndex,
    buildingId: null,
  }));

  for (const b of planet.buildings) {
    if (b.slotIndex < 0 || b.slotIndex >= PLANET_BUILDING_SLOTS) continue;
    const canonical = normalizeBuildingType(b.type);
    const catalogId = TYPE_TO_CATALOG_ID[canonical];
    if (catalogId) {
      grid[b.slotIndex] = { slotIndex: b.slotIndex, buildingId: catalogId };
    }
  }

  return grid;
}

export function dashboardToBuildings(dto: GameDashboardDto): BuildingDefinition[] {
  const onPlanetByCatalogId = new Map<string, ApiBuilding>();

  for (const api of dto.planet.buildings) {
    const canonical = normalizeBuildingType(api.type);
    const catalogId = TYPE_TO_CATALOG_ID[canonical];
    if (catalogId) onPlanetByCatalogId.set(catalogId, { ...api, type: canonical });
  }

  return BUILDING_CATALOG.map((template) => {
    const api = onPlanetByCatalogId.get(template.id);
    if (api) {
      const merged = mergeApiBuilding(template, api, dto.resources);
      const targetLevel =
        api.status === 'CONSTRUCTING'
          ? 1
          : api.status === 'UPGRADING'
            ? api.level + 1
            : api.level + 1;
      const cost = getBuildingLevelCost(merged.type, Math.max(1, targetLevel));
      return {
        ...merged,
        upgradeCost: { metal: cost.metal, plasma: cost.plasma, credits: cost.credits },
      };
    }

    const buildable = API_BUILDABLE_TYPES.has(template.type);
    const cost = getBuildingLevelCost(template.type, 1);
    return {
      ...template,
      status: buildable ? ('empty' as const) : ('locked' as const),
      level: 0,
      slotIndex: undefined,
      apiBuildingId: undefined,
      upgradeCost: { metal: cost.metal, plasma: cost.plasma, credits: cost.credits },
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
  const r = dto.resources as GameDashboardDto['resources'] & {
    crystal?: number;
    crystalCapacity?: number;
    crystalProduction?: number;
  };
  return {
    metal: dto.resources.metal,
    plasma: dto.resources.plasma,
    credits: dto.resources.credits ?? r.crystal ?? 0,
    metalCapacity: dto.resources.metalCapacity,
    plasmaCapacity: dto.resources.plasmaCapacity,
    metalProduction: dto.resources.metalProduction,
    plasmaProduction: dto.resources.plasmaProduction,
  };
}

export function getMockDashboardState() {
  const grid: GridSlot[] = Array.from({ length: PLANET_BUILDING_SLOTS }, (_, slotIndex) => ({
    slotIndex,
    buildingId: null,
  }));
  for (const b of BUILDING_CATALOG) {
    if (b.slotIndex != null && b.level > 0) {
      grid[b.slotIndex] = { slotIndex: b.slotIndex, buildingId: b.id };
    }
  }

  return {
    player: DEFAULT_PLAYER,
    resources: DEFAULT_RESOURCES,
    planetId: null as string | null,
    planetName: 'Planeta Principal',
    planetType: 'HABITABLE',
    grid,
    buildings: BUILDING_CATALOG,
    constructionQueue: [] as Go2ConstructionQueueItemDto[],
    usingMock: true,
  };
}
