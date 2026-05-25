"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGACY_CREDITS_TYPE = void 0;
exports.normalizeResourceType = normalizeResourceType;
exports.getResourceRow = getResourceRow;
exports.toGameResourcesDto = toGameResourcesDto;
exports.LEGACY_CREDITS_TYPE = 'CREDITS';
function normalizeResourceType(type) {
    if (type === 'METAL')
        return 'METAL';
    if (type === 'PLASMA' || type === 'HE3')
        return 'PLASMA';
    if (type === 'CREDITS' || type === exports.LEGACY_CREDITS_TYPE || type === 'CRYSTAL')
        return 'CREDITS';
    return null;
}
function getResourceRow(resources, canonical) {
    if (canonical === 'CREDITS') {
        return (resources.find((r) => r.type === 'CREDITS') ??
            resources.find((r) => r.type === exports.LEGACY_CREDITS_TYPE) ??
            resources.find((r) => r.type === 'CRYSTAL'));
    }
    if (canonical === 'PLASMA') {
        return resources.find((r) => r.type === 'PLASMA') ?? resources.find((r) => r.type === 'HE3');
    }
    return resources.find((r) => r.type === 'METAL');
}
function toGameResourcesDto(resources) {
    const metal = getResourceRow(resources, 'METAL');
    const plasma = getResourceRow(resources, 'PLASMA');
    const credits = getResourceRow(resources, 'CREDITS');
    const creditAmount = Math.floor(credits?.amount ?? 0);
    return {
        metal: Math.floor(metal?.amount ?? 0),
        plasma: Math.floor(plasma?.amount ?? 0),
        credits: creditAmount,
        crystal: creditAmount,
        metalCapacity: metal?.capacity ?? 0,
        plasmaCapacity: plasma?.capacity ?? 0,
        crystalCapacity: credits?.capacity ?? 0,
        metalProduction: metal?.productionPerHour ?? 0,
        plasmaProduction: plasma?.productionPerHour ?? 0,
        crystalProduction: credits?.productionPerHour ?? 0,
    };
}
