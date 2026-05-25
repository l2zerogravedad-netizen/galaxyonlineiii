import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@galaxy/database';
import {
  API_BUILDABLE_TYPES,
  normalizeBuildingType,
  PLANET_BUILDING_SLOTS,
} from '@galaxy/shared';
import {
  buildCostForLevel,
  finalizeCompletedBuildings,
  validateBuildRequest,
} from '../lib/buildingLogic';
import { recalculateEmpireProduction } from '../lib/empireEconomy';

const createBuildingSchema = z.object({
  type: z.string().min(1),
  slotIndex: z.number().min(0).max(PLANET_BUILDING_SLOTS - 1),
});

export async function planetRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { empireId } = request.user as { empireId: string };

    const planet = await prisma.planet.findFirst({
      where: { id, empireId },
      include: { buildings: true },
    });

    if (!planet) {
      return reply.status(404).send({ error: 'Planet not found' });
    }

    const buildings = await finalizeCompletedBuildings(id);
    return { ...planet, buildings };
  });

  app.post('/:id/build', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { empireId } = request.user as { empireId: string };

    try {
      const data = createBuildingSchema.parse(request.body);
      const canonicalInput = normalizeBuildingType(data.type);

      if (!API_BUILDABLE_TYPES.has(canonicalInput)) {
        return reply.status(400).send({ error: 'Invalid building type' });
      }

      const planet = await prisma.planet.findFirst({
        where: { id, empireId },
        include: { buildings: true },
      });

      if (!planet) {
        return reply.status(404).send({ error: 'Planet not found' });
      }

      let buildings = await finalizeCompletedBuildings(id);
      const validation = validateBuildRequest(
        canonicalInput,
        data.slotIndex,
        buildings
      );
      if (!validation.ok) {
        return reply.status(400).send({ error: validation.error });
      }

      const canonicalType = validation.canonicalType;

      const existingBuilding = buildings.find(
        (b) => b.slotIndex === data.slotIndex
      );

      const resources = await prisma.resource.findMany({ where: { empireId } });
      const metal = resources.find((r) => r.type === 'METAL');
      const plasma = resources.find((r) => r.type === 'PLASMA');
      const credits = resources.find((r) => r.type === 'CREDITS');

      if (!metal || !plasma || !credits) {
        return reply.status(400).send({ error: 'Resources not found' });
      }

      const isUpgrade = existingBuilding !== undefined;
      const targetLevel = isUpgrade ? existingBuilding.level + 1 : 1;

      if (targetLevel > 30) {
        return reply.status(400).send({ error: 'Maximum level reached (30)' });
      }

      const totalCost = buildCostForLevel(canonicalType, targetLevel);

      if (
        metal.amount < totalCost.metal ||
        plasma.amount < totalCost.plasma ||
        credits.amount < totalCost.credits
      ) {
        return reply.status(400).send({ error: 'Insufficient resources' });
      }

      const endsAt = new Date(Date.now() + totalCost.time * 1000);

      const result = await prisma.$transaction(async (tx) => {
        await tx.resource.update({
          where: { id: metal.id },
          data: { amount: { decrement: totalCost.metal } },
        });
        await tx.resource.update({
          where: { id: plasma.id },
          data: { amount: { decrement: totalCost.plasma } },
        });
        if (totalCost.credits > 0) {
          await tx.resource.update({
            where: { id: credits.id },
            data: { amount: { decrement: totalCost.credits } },
          });
        }

        if (isUpgrade) {
          return tx.building.update({
            where: { id: existingBuilding!.id },
            data: {
              type: canonicalType,
              level: existingBuilding!.level,
              status: 'UPGRADING',
              constructionEndsAt: endsAt,
            },
          });
        }

        return tx.building.create({
          data: {
            planetId: id,
            type: canonicalType,
            slotIndex: data.slotIndex,
            status: 'CONSTRUCTING',
            constructionEndsAt: endsAt,
          },
        });
      });

      await recalculateEmpireProduction(empireId);

      return {
        ...result,
        constructionEndsAt: result.constructionEndsAt?.toISOString() ?? null,
      };
    } catch (error) {
      console.error('Building error:', error);
      return reply.status(500).send({ error: 'Failed to build' });
    }
  });
}
