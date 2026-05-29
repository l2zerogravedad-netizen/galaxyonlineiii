"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionFromBuilding = productionFromBuilding;
exports.capacityBonusFromBuilding = capacityBonusFromBuilding;
exports.countBuildingsOfType = countBuildingsOfType;
exports.canPlaceBuildingType = canPlaceBuildingType;
const legacyBuildingTypes_1 = require("./legacyBuildingTypes");
const terrestrialCatalog_1 = require("./terrestrialCatalog");
/** Producción por hora según buildings-complete (nivel lineal). */
function productionFromBuilding(type, level) {
    const t = (0, legacyBuildingTypes_1.normalizeBuildingType)(type);
    if (level < 1)
        return {};
    switch (t) {
        case 'metal_extractor':
            return { metal: 20 * level };
        case 'gas_refinery':
            return { plasma: 10 * level };
        case 'control_center':
            return { credits: 5 * level };
        case 'trading_center':
            return { credits: 10 * level };
        case 'energy_generator':
            return {};
        default:
            return {};
    }
}
function capacityBonusFromBuilding(type, level) {
    const t = (0, legacyBuildingTypes_1.normalizeBuildingType)(type);
    if (t === 'warehouse' && level >= 1) {
        return { metal: 500 * level, plasma: 300 * level };
    }
    return {};
}
function countBuildingsOfType(buildings, apiType) {
    const canonical = (0, legacyBuildingTypes_1.normalizeBuildingType)(apiType);
    return buildings.filter((b) => (0, legacyBuildingTypes_1.normalizeBuildingType)(b.type) === canonical &&
        b.level > 0 &&
        (b.status === 'IDLE' || b.status === 'UPGRADING')).length;
}
function canPlaceBuildingType(buildings, apiType, slotIndex) {
    const canonical = (0, legacyBuildingTypes_1.normalizeBuildingType)(apiType);
    const max = terrestrialCatalog_1.MAX_PER_PLANET_BY_TYPE[canonical] ?? 99;
    const occupied = buildings.find((b) => b.slotIndex === slotIndex);
    if (occupied) {
        if ((0, legacyBuildingTypes_1.normalizeBuildingType)(occupied.type) !== canonical) {
            return { ok: false, error: 'Slot already occupied' };
        }
        return { ok: true };
    }
    const count = countBuildingsOfType(buildings, canonical);
    if (count >= max) {
        return { ok: false, error: `Maximum ${max} of this building on planet` };
    }
    return { ok: true };
}
