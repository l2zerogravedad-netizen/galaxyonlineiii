/**
 * Límites de planeta — alineado con planet-colonization.ts (Windsurf).
 */

export type PlanetSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'colossal';
export type PlanetType =
  | 'terrestrial'
  | 'gas_giant'
  | 'ice'
  | 'lava'
  | 'desert'
  | 'ocean'
  | 'barren'
  | 'toxic'
  | 'radioactive'
  | 'crystalline'
  | 'artificial'
  | 'humaroid';

export const STANDARD_PLAYER_PLANET_TYPE: PlanetType = 'terrestrial';
export const STANDARD_PLAYER_PLANET_SIZE: PlanetSize = 'medium';

export const STANDARD_PLANET_BUILDING_SLOTS = 80;
export const PLANET_GRID_COLUMNS = 10;
export const PLANET_GRID_ROWS = 8;
export const PLANET_BUILDING_SLOTS = STANDARD_PLANET_BUILDING_SLOTS;

export const GO2_CONSTRUCTION_QUEUE_SIZE = 5;

export const CANONICAL_BUILDING_TYPE_IDS = [
  'metal_extractor',
  'plasma_refinery',
  'warehouse',
  'energy_generator',
  'control_center',
  'shipyard',
  'research_lab',
  'hangar',
  'defense_turret',
  'trading_center',
  'radar',
  'residential_area',
] as const;

export type CanonicalBuildingTypeId = (typeof CANONICAL_BUILDING_TYPE_IDS)[number];
