import type { ApiBuilding, Go2ConstructionQueueItemDto } from '../game';
import { getBuildingLevelCost } from '../buildingCosts';
import { BUILDING_NAME_BY_TYPE } from '../terrestrialCatalog';
import { GO2_CONSTRUCTION_QUEUE_SIZE } from '../planetLayout';
import { normalizeBuildingType } from '../legacyBuildingTypes';

export function buildGo2ConstructionQueue(
  buildings: ApiBuilding[],
  devCheap = false
): Go2ConstructionQueueItemDto[] {
  const active = buildings
    .filter(
      (b) =>
        (b.status === 'CONSTRUCTING' || b.status === 'UPGRADING') &&
        b.constructionEndsAt
    )
    .sort(
      (a, b) =>
        new Date(a.constructionEndsAt!).getTime() -
        new Date(b.constructionEndsAt!).getTime()
    )
    .slice(0, GO2_CONSTRUCTION_QUEUE_SIZE);

  const now = Date.now();

  return active.map((b) => {
    const type = normalizeBuildingType(b.type);
    const ends = new Date(b.constructionEndsAt!).getTime();
    const isUpgrade = b.status === 'UPGRADING';
    const targetLevel = isUpgrade ? b.level + 1 : 1;
    const durationMs = Math.max(
      getBuildingLevelCost(type, targetLevel, devCheap).time * 1000,
      1000
    );
    const started = ends - durationMs;
    const pct =
      ends <= now
        ? 100
        : Math.min(
            99,
            Math.max(0, Math.round(((now - started) / (ends - started)) * 100))
          );

    return {
      id: b.id,
      buildingType: type,
      buildingName: BUILDING_NAME_BY_TYPE[type] ?? type,
      level: isUpgrade ? b.level : 0,
      targetLevel,
      slotIndex: b.slotIndex,
      status: b.status as 'CONSTRUCTING' | 'UPGRADING',
      endsAt: b.constructionEndsAt ?? null,
      progressPct: pct,
    };
  });
}
