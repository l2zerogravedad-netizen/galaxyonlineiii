import { GO2_TEST_GLB_BUILDING } from '@/lib/destockHdAssets';
import type { BuildingId } from '@/features/destock-space/types';

/** Modelos GLB construibles en mapa cuadrado (demo / destock) */
export const BUILDING_GLB_URL: Partial<Record<BuildingId, string>> = {
  blueforge_citadel: GO2_TEST_GLB_BUILDING.url,
};

export function getGlbUrlForBuilding(id: BuildingId): string | undefined {
  return BUILDING_GLB_URL[id];
}

export function hasGlbBuilding(id: BuildingId): boolean {
  return id in BUILDING_GLB_URL;
}
