import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@galaxy/database';

const createFleetSchema = z.object({
  name: z.string().min(1).max(50),
});

const assignShipsSchema = z.object({
  shipId: z.string(),
  quantity: z.number().int().min(1),
});

export async function fleetRoutes(app: FastifyInstance) {
  // Auth middleware
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Get all fleets for empire
  app.get('/', async (request) => {
    const { empireId } = request.user as { empireId: string };

    const fleets = await prisma.fleet.findMany({
      where: { empireId },
      include: {
        formations: {
          include: {
            ship: {
              include: {
                blueprint: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { fleets };
  });

  // Create new fleet
  app.post('/', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };

    try {
      const data = createFleetSchema.parse(request.body);

      const fleet = await prisma.fleet.create({
        data: {
          empireId,
          name: data.name,
          status: 'IDLE',
          totalPower: 0,
        },
      });

      return { fleet };
    } catch (error) {
      console.error('Create fleet error:', error);
      return reply.status(500).send({ error: 'Failed to create fleet' });
    }
  });

  // Assign ships to fleet
  app.post('/:id/assign-ships', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const { id } = request.params as { id: string };

    try {
      const data = assignShipsSchema.parse(request.body);

      // Verify fleet belongs to empire and is idle
      const fleet = await prisma.fleet.findFirst({
        where: { id, empireId, status: 'IDLE' },
      });

      if (!fleet) {
        return reply.status(404).send({ error: 'Fleet not found or not idle' });
      }

      // Verify ship exists and belongs to empire
      const ship = await prisma.ship.findFirst({
        where: { id: data.shipId, empireId },
        include: { blueprint: true },
      });

      if (!ship || ship.quantity < data.quantity) {
        return reply.status(400).send({ error: 'Not enough ships in inventory' });
      }

      // Check if ship already in fleet
      const existingFormation = await prisma.fleetFormation.findFirst({
        where: { fleetId: id, shipId: data.shipId },
      });

      await prisma.$transaction(async (tx) => {
        // Deduct from inventory
        await tx.ship.update({
          where: { id: data.shipId },
          data: { quantity: { decrement: data.quantity } },
        });

        if (existingFormation) {
          // Update existing
          await tx.fleetFormation.update({
            where: { id: existingFormation.id },
            data: { quantity: { increment: data.quantity } },
          });
        } else {
          // Create new formation entry
          await tx.fleetFormation.create({
            data: {
              fleetId: id,
              shipId: data.shipId,
              quantity: data.quantity,
              slotIndex: 0,
            },
          });
        }

        // Update fleet power
        const power = (ship.blueprint.attack + ship.blueprint.hp + ship.blueprint.defense + ship.blueprint.speed) * data.quantity;
        await tx.fleet.update({
          where: { id },
          data: { totalPower: { increment: power } },
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Assign ships error:', error);
      return reply.status(500).send({ error: 'Failed to assign ships' });
    }
  });

  // Remove ships from fleet (return to inventory)
  app.post('/:id/remove-ships', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const { id } = request.params as { id: string };

    try {
      const data = assignShipsSchema.parse(request.body);

      const fleet = await prisma.fleet.findFirst({
        where: { id, empireId, status: 'IDLE' },
      });

      if (!fleet) {
        return reply.status(404).send({ error: 'Fleet not found or not idle' });
      }

      const formation = await prisma.fleetFormation.findFirst({
        where: { fleetId: id, shipId: data.shipId },
        include: { ship: { include: { blueprint: true } } },
      });

      if (!formation || formation.quantity < data.quantity) {
        return reply.status(400).send({ error: 'Not enough ships in fleet' });
      }

      await prisma.$transaction(async (tx) => {
        // Return to inventory
        await tx.ship.update({
          where: { id: data.shipId },
          data: { quantity: { increment: data.quantity } },
        });

        if (formation.quantity <= data.quantity) {
          // Remove formation entry
          await tx.fleetFormation.delete({
            where: { id: formation.id },
          });
        } else {
          // Decrement quantity
          await tx.fleetFormation.update({
            where: { id: formation.id },
            data: { quantity: { decrement: data.quantity } },
          });
        }

        // Update fleet power
        const power = (formation.ship.blueprint.attack + formation.ship.blueprint.hp + formation.ship.blueprint.defense + formation.ship.blueprint.speed) * data.quantity;
        await tx.fleet.update({
          where: { id },
          data: { totalPower: { decrement: power } },
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Remove ships error:', error);
      return reply.status(500).send({ error: 'Failed to remove ships' });
    }
  });

  // Disband fleet
  app.delete('/:id', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const { id } = request.params as { id: string };

    try {
      const fleet = await prisma.fleet.findFirst({
        where: { id, empireId, status: 'IDLE' },
        include: { formations: { include: { ship: true } } },
      });

      if (!fleet) {
        return reply.status(404).send({ error: 'Fleet not found or not idle' });
      }

      // Return all ships to inventory
      await prisma.$transaction(async (tx) => {
        for (const formation of fleet.formations) {
          await tx.ship.update({
            where: { id: formation.shipId },
            data: { quantity: { increment: formation.quantity } },
          });
        }

        await tx.fleetFormation.deleteMany({
          where: { fleetId: id },
        });

        await tx.fleet.delete({
          where: { id },
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Disband fleet error:', error);
      return reply.status(500).send({ error: 'Failed to disband fleet' });
    }
  });
}
