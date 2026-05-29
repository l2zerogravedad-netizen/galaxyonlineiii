/**
 * Límites de planeta — alineado con planet-colonization.ts (Windsurf).
 */
export type PlanetSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'colossal';
export type PlanetType = 'terrestrial' | 'gas_giant' | 'ice' | 'lava' | 'desert' | 'ocean' | 'barren' | 'toxic' | 'radioactive' | 'crystalline' | 'artificial' | 'humaroid';
export declare const STANDARD_PLAYER_PLANET_TYPE: PlanetType;
export declare const STANDARD_PLAYER_PLANET_SIZE: PlanetSize;
export declare const STANDARD_PLANET_BUILDING_SLOTS = 80;
export declare const PLANET_GRID_COLUMNS = 10;
export declare const PLANET_GRID_ROWS = 8;
export declare const PLANET_BUILDING_SLOTS = 80;
export declare const GO2_CONSTRUCTION_QUEUE_SIZE = 5;
export declare const CANONICAL_BUILDING_TYPE_IDS: readonly ["metal_extractor", "gas_refinery", "he3_extractor", "warehouse", "energy_generator", "control_center", "shipyard", "research_lab", "hangar", "defense_turret", "trading_center", "radar", "residential_area"];
export type CanonicalBuildingTypeId = (typeof CANONICAL_BUILDING_TYPE_IDS)[number];
