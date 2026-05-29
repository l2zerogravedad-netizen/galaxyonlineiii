/**
 * Empire sync helpers — server-side only.
 * Replicates logic from apps/api/src/lib/gameState.ts, empireEconomy.ts, buildingLogic.ts
 */

import {
  accrueResource,
  buildGo2ConstructionQueue,
  buildCostForLevel,
  canPlaceBuildingType,
  countActiveConstruction,
  normalizeBuildingType,
  PLANET_BUILDING_SLOTS,
  API_BUILDABLE_TYPES,
  INITIAL_RESOURCE_CAPACITY,
  productionFromBuilding,
  capacityBonusFromBuilding,
  sumCollected,
  toGameResourcesDto,
  getBuildingLevelCost,
  GO2_CONSTRUCTION_QUEUE_SIZE,
  type GameResourcesDto,
  type ApiBuilding,
} from '@galaxy/shared';
import { prisma } from './prisma';

/* ──────────────────────────── Dev flags ──────────────────────────── */

const isDevCheap =
  process.env.DEV_CHEAP_COSTS === 'true' || process.env.DEV_CHEAP_COSTS === '1';
const isDevFastTimers =
  process.env.DEV_FAST_TIMERS === 'true' || process.env.DEV_FAST_TIMERS === '1';

/* ──────────────────── Technology bonuses ─────────────────────────── */

async function getTechBonuses(empireId: string): Promise<Record<string, number>> {
  const empireTechs = await prisma.empireTechnology.findMany({
    where: { empireId, level: { gt: 0 } },
    include: { technology: true },
  });
  const techBonuses: Record<string, number> = {};
  for (const et of empireTechs) {
    if (et.technology.effectType) {
      techBonuses[et.technology.effectType] =
        (techBonuses[et.technology.effectType] || 0) +
        et.technology.effectValue * et.level;
    }
  }
  return techBonuses;
}

/* ──────────────────── Finalize completed buildings ───────────────── */

export async function finalizeCompletedBuildings(planetId: string): Promise<ApiBuilding[]> {
  const now = new Date();
  const pending = await prisma.building.findMany({
    where: {
      planetId,
      status: { in: ['CONSTRUCTING', 'UPGRADING'] },
      constructionEndsAt: { lte: now },
    },
  });

  let empireIdForRecalc: string | null = null;

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
    empireIdForRecalc = updated.planet.empireId;
  }

  if (empireIdForRecalc && pending.length > 0) {
    await recalculateEmpireProduction(empireIdForRecalc);
  }

  const buildings = await prisma.building.findMany({ where: { planetId } });
  return buildings.map((b) => ({
    ...b,
    type: normalizeBuildingType(b.type),
    constructionEndsAt: b.constructionEndsAt?.toISOString() ?? null,
  }));
}

/* ──────────────────── Recalculate production ─────────────────────── */

export async function recalculateEmpireProduction(empireId: string): Promise<void> {
  const planet = await prisma.planet.findFirst({
    where: { empireId },
    include: { buildings: true },
    orderBy: { createdAt: 'asc' },
  });

  let metalPerHour = 0;
  let plasmaPerHour = 0;
  let creditsPerHour = 0;
  let metalCapacity = INITIAL_RESOURCE_CAPACITY.metal;
  let plasmaCapacity = INITIAL_RESOURCE_CAPACITY.plasma;

  for (const b of planet?.buildings ?? []) {
    if (b.status === 'CONSTRUCTING') continue;
    const t = normalizeBuildingType(b.type);
    const prod = productionFromBuilding(t, b.level);
    metalPerHour += prod.metal ?? 0;
    plasmaPerHour += prod.plasma ?? 0;
    creditsPerHour += prod.credits ?? 0;
    const cap = capacityBonusFromBuilding(t, b.level);
    metalCapacity += cap.metal ?? 0;
    plasmaCapacity += cap.plasma ?? 0;
  }

  await prisma.$transaction([
    prisma.resource.updateMany({
      where: { empireId, type: 'METAL' },
      data: { productionPerHour: metalPerHour, capacity: metalCapacity },
    }),
    prisma.resource.updateMany({
      where: { empireId, type: 'PLASMA' },
      data: { productionPerHour: plasmaPerHour, capacity: plasmaCapacity },
    }),
    prisma.resource.updateMany({
      where: { empireId, type: 'CREDITS' },
      data: { productionPerHour: creditsPerHour },
    }),
  ]);
}

/* ──────────────────── Complete due buildings for empire ──────────── */

export async function completeDueBuildingsForEmpire(empireId: string): Promise<number> {
  const planets = await prisma.planet.findMany({
    where: { empireId },
    select: { id: true },
  });
  let total = 0;
  for (const p of planets) {
    const before = await prisma.building.count({
      where: {
        planetId: p.id,
        status: { in: ['CONSTRUCTING', 'UPGRADING'] },
        constructionEndsAt: { lte: new Date() },
      },
    });
    if (before > 0) {
      await finalizeCompletedBuildings(p.id);
      total += before;
    }
  }
  if (total > 0) {
    await recalculateEmpireProduction(empireId);
  }
  return total;
}

/* ──────────────────── Sync result type ───────────────────────────── */

export interface SyncResult {
  resources: GameResourcesDto;
  collected: { metal: number; plasma: number; credits: number };
}

/* ──────────────────── Sync empire game state ─────────────────────── */

export async function syncEmpireGameState(empireId: string): Promise<SyncResult> {
  await completeDueBuildingsForEmpire(empireId);
  await recalculateEmpireProduction(empireId);

  const now = new Date();
  const techBonuses = await getTechBonuses(empireId);
  const rows = await prisma.resource.findMany({ where: { empireId } });
  const deltas: { type: string; before: number; after: number }[] = [];

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const before = Math.floor(row.amount);
      const accrued = accrueResource(
        {
          type: row.type,
          amount: row.amount,
          capacity: row.capacity,
          productionPerHour: row.productionPerHour,
          updatedAt: row.updatedAt,
        },
        techBonuses,
        now
      );
      deltas.push({ type: row.type, before, after: accrued.amount });
      await tx.resource.update({
        where: { id: row.id },
        data: {
          amount: accrued.amount,
          productionPerHour: accrued.productionPerHour,
          updatedAt: now,
        },
      });
    }
  });

  const updated = await prisma.resource.findMany({ where: { empireId } });
  return {
    resources: toGameResourcesDto(updated),
    collected: sumCollected(deltas),
  };
}

/* ──────────────────── Validate build request ─────────────────────── */

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

/* ──────────────────── Build cost helpers ─────────────────────────── */

export { buildCostForLevel, isDevCheap, isDevFastTimers };
