import { prisma } from '@galaxy/database';
import {
  capacityBonusFromBuilding,
  INITIAL_RESOURCE_CAPACITY,
  normalizeBuildingType,
  productionFromBuilding,
} from '@galaxy/shared';

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
