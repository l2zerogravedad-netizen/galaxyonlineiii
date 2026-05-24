import type { ApiBuildingType } from '@galaxy/shared';

/** API building type → catalog id (UI assets / copy). */
export const TYPE_TO_CATALOG_ID: Record<string, string> = {
  COMMAND_CENTER: 'control-center',
  METAL_MINE: 'metal-extractor',
  PLASMA_EXTRACTOR: 'plasma-refinery',
  WAREHOUSE: 'warehouse',
  SHIPYARD: 'shipyard',
  RESEARCH_LAB: 'research-lab',
  ACADEMY: 'research-lab',
  ENERGY: 'energy-generator',
  DEFENSE: 'defense-turret',
  HANGAR: 'hangar',
};

export const CATALOG_ID_TO_TYPE: Record<string, string> = {
  'control-center': 'COMMAND_CENTER',
  'metal-extractor': 'METAL_MINE',
  'plasma-refinery': 'PLASMA_EXTRACTOR',
  warehouse: 'WAREHOUSE',
  shipyard: 'SHIPYARD',
  'research-lab': 'RESEARCH_LAB',
  'energy-generator': 'ENERGY',
  'defense-turret': 'DEFENSE',
  hangar: 'HANGAR',
};

export const API_BUILDABLE_TYPES = new Set<string>([
  'COMMAND_CENTER',
  'METAL_MINE',
  'PLASMA_EXTRACTOR',
  'SHIPYARD',
  'RESEARCH_LAB',
  'ACADEMY',
  'WAREHOUSE',
]);

export function isApiBuildable(type: string): type is ApiBuildingType {
  return API_BUILDABLE_TYPES.has(type);
}
