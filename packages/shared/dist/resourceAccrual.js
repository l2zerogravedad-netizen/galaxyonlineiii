"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectiveProductionRate = effectiveProductionRate;
exports.accrueResource = accrueResource;
exports.sumCollected = sumCollected;
const resources_1 = require("./resources");
function effectiveProductionRate(type, baseRate, techBonuses) {
    const canonical = (0, resources_1.normalizeResourceType)(type);
    if (canonical === 'METAL' && techBonuses.METAL_PRODUCTION) {
        return baseRate * (1 + techBonuses.METAL_PRODUCTION);
    }
    if (canonical === 'GAS' && techBonuses.GAS_PRODUCTION) {
        return baseRate * (1 + techBonuses.GAS_PRODUCTION);
    }
    if (canonical === 'HE3' && techBonuses.HE3_PRODUCTION) {
        return baseRate * (1 + techBonuses.HE3_PRODUCTION);
    }
    return baseRate;
}
function accrueResource(resource, techBonuses = {}, now = new Date()) {
    const lastUpdate = new Date(resource.updatedAt);
    const hoursDiff = Math.max(0, (now.getTime() - lastUpdate.getTime()) / 3600000);
    const rate = effectiveProductionRate(resource.type, resource.productionPerHour, techBonuses);
    const gained = Math.floor(rate * hoursDiff);
    const amount = Math.min(Math.floor(resource.amount + gained), resource.capacity);
    return {
        amount,
        gained: Math.max(0, amount - Math.floor(resource.amount)),
        productionPerHour: Math.floor(rate),
    };
}
function sumCollected(rows) {
    const out = { metal: 0, plasma: 0, he3: 0, credits: 0 };
    for (const row of rows) {
        const c = (0, resources_1.normalizeResourceType)(row.type);
        const delta = Math.max(0, row.after - row.before);
        if (c === 'METAL')
            out.metal += delta;
        else if (c === 'GAS')
            out.plasma += delta;
        else if (c === 'HE3')
            out.he3 += delta;
        else if (c === 'CREDITS')
            out.credits += delta;
    }
    return out;
}
