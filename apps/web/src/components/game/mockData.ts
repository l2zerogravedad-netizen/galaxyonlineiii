import {
  BUILD_TAB_BY_TYPE,
  INITIAL_PLAYER_RESOURCES,
  MAX_PER_PLANET_BY_TYPE,
  WINDSURF_TERRESTRIAL_BUILDINGS,
} from '@galaxy/shared';
import type { BuildingDefinition, GridSlot, PlayerData, ResourcesData } from './types';

export const DEFAULT_PLAYER: PlayerData = {
  name: 'Imperio Demo',
  level: 1,
  xp: 0,
  xpMax: 1000,
};

export const DEFAULT_RESOURCES: ResourcesData = {
  metal: INITIAL_PLAYER_RESOURCES.metal,
  plasma: INITIAL_PLAYER_RESOURCES.plasma,
  credits: INITIAL_PLAYER_RESOURCES.credits,
  metalCapacity: 50_000,
  plasmaCapacity: 50_000,
  metalProduction: 100,
  plasmaProduction: 50,
};

const B = '/game/assets/buildings';

function catalogEntry(
  spec: (typeof WINDSURF_TERRESTRIAL_BUILDINGS)[number],
  opts: Partial<BuildingDefinition>
): BuildingDefinition {
  return {
    id: spec.catalogId,
    name: spec.name,
    type: spec.apiType,
    level: opts.level ?? 0,
    image: `${B}/${spec.catalogId}.webp`,
    description: spec.name,
    production: '—',
    capacity: '—',
    health: 100,
    category: spec.category === 'defense' ? 'defense' : spec.category === 'military' ? 'military' : spec.category === 'research' ? 'research' : spec.category === 'storage' ? 'storage' : spec.category === 'production' ? 'production' : 'core',
    upgradeCost: { metal: 100, plasma: 50, credits: 50 },
    status: opts.status ?? 'empty',
    slotIndex: opts.slotIndex,
    uiTab: BUILD_TAB_BY_TYPE[spec.apiType],
    maxPerPlanet: MAX_PER_PLANET_BY_TYPE[spec.apiType],
    glow: 'cyan',
    ...opts,
  };
}

export const BUILDING_CATALOG: BuildingDefinition[] = WINDSURF_TERRESTRIAL_BUILDINGS.map((spec) => {
  const preset: Partial<BuildingDefinition> = {};
  if (spec.apiType === 'metal_extractor') {
    Object.assign(preset, { level: 1, status: 'active' as const, slotIndex: 0, production: '+100/h metal' });
  } else if (spec.apiType === 'plasma_refinery') {
    Object.assign(preset, { level: 1, status: 'active' as const, slotIndex: 1, production: '+50/h plasma' });
  } else if (spec.apiType === 'control_center') {
    Object.assign(preset, { level: 1, status: 'active' as const, slotIndex: 40 });
  } else if (spec.apiType === 'research_lab') {
    Object.assign(preset, { level: 1, status: 'active' as const, slotIndex: 2 });
  } else if (spec.apiType === 'shipyard') {
    Object.assign(preset, { level: 1, status: 'active' as const, slotIndex: 3 });
  } else {
    Object.assign(preset, { level: 0, status: 'empty' as const });
  }
  return catalogEntry(spec, preset);
});

export function getBuildingById(id: string): BuildingDefinition | undefined {
  return BUILDING_CATALOG.find((b) => b.id === id);
}
