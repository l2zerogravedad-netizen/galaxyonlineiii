"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PER_PLANET_BY_TYPE = exports.BUILD_TAB_BY_TYPE = exports.API_BUILDABLE_TYPES = exports.CATALOG_ID_TO_TYPE = exports.TYPE_TO_CATALOG_ID = exports.BUILDING_NAME_BY_TYPE = exports.WINDSURF_TERRESTRIAL_BUILDINGS = exports.GO2_BUILD_TABS = void 0;
exports.GO2_BUILD_TABS = [
    { id: 'recursos', label: 'Recursos' },
    { id: 'desarrollo', label: 'Desarrollo' },
    { id: 'civil', label: 'Civil' },
    { id: 'milicia', label: 'Milicia' },
    { id: 'defensa', label: 'Defensa' },
];
/** Catálogo canónico — buildings-complete.ts + pestañas GO II */
exports.WINDSURF_TERRESTRIAL_BUILDINGS = [
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
exports.BUILDING_NAME_BY_TYPE = Object.fromEntries(exports.WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.name]));
exports.TYPE_TO_CATALOG_ID = Object.fromEntries(exports.WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.catalogId]));
exports.CATALOG_ID_TO_TYPE = Object.fromEntries(exports.WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.catalogId, b.apiType]));
exports.API_BUILDABLE_TYPES = new Set(exports.WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => b.apiType));
exports.BUILD_TAB_BY_TYPE = Object.fromEntries(exports.WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.uiTab]));
exports.MAX_PER_PLANET_BY_TYPE = Object.fromEntries(exports.WINDSURF_TERRESTRIAL_BUILDINGS.map((b) => [b.apiType, b.maxPerPlanet]));
