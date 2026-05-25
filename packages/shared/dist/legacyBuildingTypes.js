"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGACY_TO_CANONICAL = void 0;
exports.normalizeBuildingType = normalizeBuildingType;
exports.isCanonicalBuildingType = isCanonicalBuildingType;
/** Tipos legacy API (mayoría en mayúsculas) → snake_case canónico */
exports.LEGACY_TO_CANONICAL = {
    COMMAND_CENTER: 'control_center',
    METAL_MINE: 'metal_extractor',
    PLASMA_EXTRACTOR: 'plasma_refinery',
    SHIPYARD: 'shipyard',
    RESEARCH_LAB: 'research_lab',
    ACADEMY: 'research_lab',
    WAREHOUSE: 'warehouse',
    ENERGY: 'energy_generator',
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
