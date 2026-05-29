import type { CanonicalBuildingTypeId } from './planetLayout';

export type Go2BuildTab = 'recursos' | 'desarrollo' | 'civil' | 'milicia' | 'defensa';

export const GO2_BUILD_TABS: { id: Go2BuildTab; label: string }[] = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'desarrollo', label: 'Desarrollo' },
  { id: 'civil', label: 'Civil' },
  { id: 'milicia', label: 'Milicia' },
  { id: 'defensa', label: 'Defensa' },
];

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
export const WINDSURF_TERRESTRIAL_BUILDINGS: TerrestrialBuildingSpec[] = [
  { id: 'metal_extractor', catalogId: 'metal-extractor', name: 'Extractor de Metal', apiType: 'metal_extractor', uiTab: 'recursos', maxPerPlanet: 99, category: 'production' },
  { id: 'gas_refinery', catalogId: 'gas-refinery', name: 'Refinería de Gas', apiType: 'gas_refinery', uiTab: 'recursos', maxPerPlanet: 99, category: 'production' },
  { id: 'he3_extractor', catalogId: 'he3-extractor', name: 'Extractor de He3', apiType: 'he3_extractor', uiTab: 'recursos', maxPerPlanet: 99, category: 'production' },
  { id: 'energy_generator', catalogId: 'energy-generator', name: 'Generador de Energía', apiType: 'energy_generator', uiTab: 'recursos', maxPerPlanet: 99, category: 'infrastructure' },
  { id: 'warehouse', catalogId: 'warehouse', name: 'Almacén', apiType: 'warehouse', uiTab: 'civil', maxPerPlanet: 99, category: 'storage' },
  { id: 'residential_area', catalogId: 'residential-area', name: 'Área Residencial', apiType: 'residential_area', uiTab: 'civil', maxPerPlanet: 99, category: 'infrastructure' },
  { id: 'control_center', catalogId: 'control-center', name: 'Centro de Control', apiType: 'control_center', uiTab: 'desarrollo', maxPerPlanet: 1, category: 'infrastructure' },
  { id: 'research_lab', catalogId: 'research-lab', name: 'Laboratorio', apiType: 'research_lab', uiTab: 'desarrollo', maxPerPlanet: 1, category: 'research' },
  { id: 'trading_center', catalogId: 'trading-center', name: 'Centro de Comercio', apiType: 'trading_center', uiTab: 'desarrollo', maxPerPlanet: 1, category: 'infrastructure' },
  { id: 'shipyard', catalogId: 'shipyard', name: 'Astillero', apiType: 'shipyard', uiTab: 'milicia', maxPerPlanet: 1, category: 'military' },
  { id: 'hangar', catalogId: 'hangar', name: 'Hangar', apiType: 'hangar', uiTab: 'milicia', maxPerPlanet: 1, category: 'military' },
  { id: 'defense_turret', catalogId: 'defense-turret', name: 'Torreta de Defensa', apiType: 'defense_turret', uiTab: 'defensa', maxPerPlanet: 99, category: 'defense' },
  { id: 'radar', catalogId: 'radar', name: 'Radar', apiType: 'radar', uiTab: 'defensa', maxPerPlanet: 1, category: 'defense' },
];

export const BUILDING_NAME_BY_TYPE: Record<string, string> = Object.fromEntries(
  WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.name])
);

export const TYPE_TO_CATALOG_ID: Record<string, string> = Object.fromEntries(
  WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.catalogId])
);

export const CATALOG_ID_TO_TYPE: Record<string, string> = Object.fromEntries(
  WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.catalogId, b.apiType])
);

export const API_BUILDABLE_TYPES: Set<string> = new Set(
  WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => b.apiType)
);

export const BUILD_TAB_BY_TYPE: Record<string, Go2BuildTab> = Object.fromEntries(
  WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.uiTab])
);

export const MAX_PER_PLANET_BY_TYPE: Record<string, number> = Object.fromEntries(
  WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.maxPerPlanet])
);
