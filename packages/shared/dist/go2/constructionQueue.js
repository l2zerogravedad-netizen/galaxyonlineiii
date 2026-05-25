"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGo2ConstructionQueue = buildGo2ConstructionQueue;
const buildingCosts_1 = require("../buildingCosts");
const terrestrialCatalog_1 = require("../terrestrialCatalog");
const planetLayout_1 = require("../planetLayout");
const legacyBuildingTypes_1 = require("../legacyBuildingTypes");
function buildGo2ConstructionQueue(buildings, devCheap = false) {
    const active = buildings
        .filter((b) => (b.status === 'CONSTRUCTING' || b.status === 'UPGRADING') &&
        b.constructionEndsAt)
        .sort((a, b) => new Date(a.constructionEndsAt).getTime() -
        new Date(b.constructionEndsAt).getTime())
        .slice(0, planetLayout_1.GO2_CONSTRUCTION_QUEUE_SIZE);
    const now = Date.now();
    return active.map((b) => {
        const type = (0, legacyBuildingTypes_1.normalizeBuildingType)(b.type);
        const ends = new Date(b.constructionEndsAt).getTime();
        const isUpgrade = b.status === 'UPGRADING';
        const targetLevel = isUpgrade ? b.level + 1 : 1;
        const durationMs = Math.max((0, buildingCosts_1.getBuildingLevelCost)(type, targetLevel, devCheap).time * 1000, 1000);
        const started = ends - durationMs;
        const pct = ends <= now
            ? 100
            : Math.min(99, Math.max(0, Math.round(((now - started) / (ends - started)) * 100)));
        return {
            id: b.id,
            buildingType: type,
            buildingName: terrestrialCatalog_1.BUILDING_NAME_BY_TYPE[type] ?? type,
            level: isUpgrade ? b.level : 0,
            targetLevel,
            slotIndex: b.slotIndex,
            status: b.status,
            endsAt: b.constructionEndsAt ?? null,
            progressPct: pct,
        };
    });
}
