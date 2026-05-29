"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGACY_TO_CANONICAL = void 0;
exports.normalizeBuildingType = normalizeBuildingType;
exports.isCanonicalBuildingType = isCanonicalBuildingType;
/** Tipos legacy API (mayoría en mayúsculas) → snake_case canónico */
exports.LEGACY_TO_CANONICAL = {
    COMMAND_CENTER: 'control_center',
    NEXUS_COMMAND: 'control_center',
    METAL_MINE: 'metal_extractor',
    METAL_QUARRY: 'metal_extractor',
    GAS_EXTRACTOR: 'gas_refinery',
    HE3_SYNTHESIZER: 'gas_refinery',
    SHIPYARD: 'shipyard',
    STELLAR_FOUNDRY: 'shipyard',
    RESEARCH_LAB: 'research_lab',
    INSIGHT_SPIRE: 'research_lab',
    ACADEMY: 'research_lab',
    WAREHOUSE: 'warehouse',
    ENERGY: 'energy_generator',
    SOLAR_HELIX: 'energy_generator',
    DEFENSE: 'defense_turret',
    HANGAR: 'hangar',
};
function normalizeBuildingType(type) {
    if (exports.LEGACY_TO_CANONICAL[type])
        return exports.LEGACY_TO_CANONICAL[type];
    return type;
}
function isCanonicalBuildingType(type) {
    const n = normalizeBuildingType(type);
    return n === type || !!exports.LEGACY_TO_CANONICAL[type];
}
