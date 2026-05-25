import { prisma } from '@galaxy/database';
import {
  accrueResource,
  sumCollected,
  toGameResourcesDto,
  type GameResourcesDto,
} from '@galaxy/shared';
import { finalizeCompletedBuildings } from './buildingLogic';
import { recalculateEmpireProduction } from './empireEconomy';

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

export interface SyncResult {
  resources: GameResourcesDto;
  collected: { metal: number; plasma: number; credits: number };
}

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
