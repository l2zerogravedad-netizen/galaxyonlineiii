import type { CanonicalBuildingTypeId } from './planetLayout';
export type Go2BuildTab = 'recursos' | 'desarrollo' | 'civil' | 'milicia' | 'defensa';
export declare const GO2_BUILD_TABS: {
    id: Go2BuildTab;
    label: string;
}[];
export interface TerrestrialBuildingSpec {
    id: CanonicalBuildingTypeId;
    catalogId: string;
    name: string;
    apiType: CanonicalBuildingTypeId;
    uiTab: Go2BuildTab;
    maxPerPlanet: number;
    category: 'production' | 'storage' | 'infrastructure' | 'military' | 'research' | 'defense';
}
/** Catálogo canónico — buildings-complete.ts + pestañas GO II */
export declare const WINDSURF_TERRESTRIAL_BUILDINGS: TerrestrialBuildingSpec[];
export declare const BUILDING_NAME_BY_TYPE: Record<string, string>;
export declare const TYPE_TO_CATALOG_ID: Record<string, string>;
export declare const CATALOG_ID_TO_TYPE: Record<string, string>;
export declare const API_BUILDABLE_TYPES: Set<string>;
export declare const BUILD_TAB_BY_TYPE: Record<string, Go2BuildTab>;
export declare const MAX_PER_PLANET_BY_TYPE: Record<string, number>;
