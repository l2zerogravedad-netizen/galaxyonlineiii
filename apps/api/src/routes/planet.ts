import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@galaxy/database';

const buildingCost: Record<string, { metal: number; plasma: number; time: number }> = {
  COMMAND_CENTER: { metal: 1000, plasma: 500, time: 600 },
  METAL_MINE: { metal: 100, plasma: 50, time: 60 },
  PLASMA_EXTRACTOR: { metal: 100, plasma: 50, time: 60 },
  SHIPYARD: { metal: 500, plasma: 200, time: 300 },
  RESEARCH_LAB: { metal: 400, plasma: 200, time: 240 },
  ACADEMY: { metal: 300, plasma: 150, time: 180 },
  WAREHOUSE: { metal: 200, plasma: 100, time: 120 },
};

const createBuildingSchema = z.object({
  type: z.enum([
    'COMMAND_CENTER',
    'METAL_MINE',
    'PLASMA_EXTRACTOR',
    'SHIPYARD',
    'RESEARCH_LAB',
    'ACADEMY',
    'WAREHOUSE',
  ] as const),
  slotIndex: z.number().min(0).max(8),
});

export async function planetRoutes(app: FastifyInstance) {
  // Auth middleware
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Get planet by ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { empireId } = request.user as { empireId: string };

    const planet = await prisma.planet.findFirst({
      where: { id, empireId },
      include: {
        buildings: true,
      },
    });

    if (!planet) {
      return reply.status(404).send({ error: 'Planet not found' });
    }

    return planet;
  });

  // Build/upgrade building
  app.post('/:id/build', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { empireId } = request.user as { empireId: string };

    try {
      const data = createBuildingSchema.parse(request.body);

      // Verify planet belongs to empire
      const planet = await prisma.planet.findFirst({
        where: { id, empireId },
        include: { buildings: true },
      });

      if (!planet) {
        return reply.status(404).send({ error: 'Planet not found' });
      }

      // Check if slot is occupied
      const existingBuilding = planet.buildings.find(
        (b) => b.slotIndex === data.slotIndex
      );

      if (existingBuilding && existingBuilding.type !== data.type) {
        return reply.status(400).send({ error: 'Slot already occupied' });
      }

      // Get resources
      const resources = await prisma.resource.findMany({
        where: { empireId },
      });

      const metal = resources.find((r) => r.type === 'METAL');
      const plasma = resources.find((r) => r.type === 'PLASMA');

      if (!metal || !plasma) {
        return reply.status(400).send({ error: 'Resources not found' });
      }

      const cost = buildingCost[data.type];
      if (!cost) {
        return reply.status(400).send({ error: 'Invalid building type' });
      }

      // Check if upgrading or building new
      const isUpgrade = existingBuilding !== undefined;
      const level = isUpgrade ? existingBuilding.level + 1 : 1;
      const totalCost = {
        metal: cost.metal * level,
        plasma: cost.plasma * level,
        time: cost.time * level,
      };

      // Check resources
      if (metal.amount < totalCost.metal || plasma.amount < totalCost.plasma) {
        return reply.status(400).send({ error: 'Insufficient resources' });
      }

      // Deduct resources and create building
      const result = await prisma.$transaction(async (tx) => {
        // Deduct resources
        await tx.resource.update({
          where: { id: metal.id },
          data: { amount: { decrement: totalCost.metal } },
        });

        await tx.resource.update({
          where: { id: plasma.id },
          data: { amount: { decrement: totalCost.plasma } },
        });

        // Create or update building
        const endsAt = new Date(Date.now() + totalCost.time * 1000);

        if (isUpgrade) {
          return await tx.building.update({
            where: { id: existingBuilding.id },
            data: {
              level,
              status: 'UPGRADING',
              constructionEndsAt: endsAt,
            },
          });
        } else {
          return await tx.building.create({
            data: {
              planetId: id,
              type: data.type,
              slotIndex: data.slotIndex,
              status: 'CONSTRUCTING',
              constructionEndsAt: endsAt,
            },
          });
        }
      });

      return result;
    } catch (error) {
      console.error('Building error:', error);
      return reply.status(500).send({ error: 'Failed to build' });
    }
  });
}
