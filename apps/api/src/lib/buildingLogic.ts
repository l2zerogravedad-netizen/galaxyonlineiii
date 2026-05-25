import { prisma } from '@galaxy/database';
import {
  API_BUILDABLE_TYPES,
  buildGo2ConstructionQueue,
  canPlaceBuildingType,
  getBuildingLevelCost,
  GO2_CONSTRUCTION_QUEUE_SIZE,
  normalizeBuildingType,
  PLANET_BUILDING_SLOTS,
  type ApiBuilding,
} from '@galaxy/shared';
import { recalculateEmpireProduction } from './empireEconomy';

const isDevCheap =
  process.env.DEV_CHEAP_COSTS === 'true' || process.env.DEV_CHEAP_COSTS === '1';
const isDevFastTimers =
  process.env.DEV_FAST_TIMERS === 'true' || process.env.DEV_FAST_TIMERS === '1';

export async function finalizeCompletedBuildings(
  planetId: string
): Promise<ApiBuilding[]> {
  const now = new Date();
  const pending = await prisma.building.findMany({
    where: {
      planetId,
      status: { in: ['CONSTRUCTING', 'UPGRADING'] },
      constructionEndsAt: { lte: now },
    },
  });

  let empireId: string | null = null;
  for (const b of pending) {
    const canonical = normalizeBuildingType(b.type);
    const newLevel = b.status === 'UPGRADING' ? b.level + 1 : 1;
    const updated = await prisma.building.update({
      where: { id: b.id },
      data: {
        type: canonical,
        level: newLevel,
        status: 'IDLE',
        constructionEndsAt: null,
      },
      include: { planet: { select: { empireId: true } } },
    });
    empireId = updated.planet.empireId;
  }

  if (empireId && pending.length > 0) {
    await recalculateEmpireProduction(empireId);
  }

  const buildings = await prisma.building.findMany({ where: { planetId } });
  return buildings.map((b: { id: string; planetId: string; type: string; level: number; slotIndex: number; status: string; constructionEndsAt: Date | null }) => ({
    ...b,
    type: normalizeBuildingType(b.type),
    constructionEndsAt: b.constructionEndsAt?.toISOString() ?? null,
  }));
}

export function countActiveConstruction(buildings: ApiBuilding[]): number {
  return buildings.filter(
    (b) => b.status === 'CONSTRUCTING' || b.status === 'UPGRADING'
  ).length;
}

export function validateBuildRequest(
  type: string,
  slotIndex: number,
  buildings: ApiBuilding[]
): { ok: true; canonicalType: string } | { ok: false; error: string } {
  const canonicalType = normalizeBuildingType(type);

  if (!API_BUILDABLE_TYPES.has(canonicalType)) {
    return { ok: false, error: 'Invalid building type' };
  }

  if (slotIndex < 0 || slotIndex >= PLANET_BUILDING_SLOTS) {
    return { ok: false, error: 'Invalid slot index' };
  }

  if (countActiveConstruction(buildings) >= GO2_CONSTRUCTION_QUEUE_SIZE) {
    return { ok: false, error: 'Construction queue is full (max 5)' };
  }

  const place = canPlaceBuildingType(
    buildings.map((b) => ({
      type: b.type,
      level: b.level,
      slotIndex: b.slotIndex,
      status: b.status,
    })),
    canonicalType,
    slotIndex
  );
  if (!place.ok) {
    return { ok: false, error: place.error ?? 'Cannot place building' };
  }

  return { ok: true, canonicalType };
}

export function buildCostForLevel(type: string, targetLevel: number) {
  const cost = getBuildingLevelCost(type, targetLevel, isDevCheap);
  if (isDevFastTimers) {
    return { ...cost, time: Math.max(3, Math.floor(cost.time * 0.1)) };
  }
  return cost;
}

export function constructionQueueFromBuildings(buildings: ApiBuilding[]) {
  return buildGo2ConstructionQueue(buildings, isDevCheap);
}
