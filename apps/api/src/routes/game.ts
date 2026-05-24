import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@galaxy/database';

function xpMaxForLevel(level: number): number {
  return Math.max(level * 1000, 1000);
}

export async function gameRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  /** GET /api/game/dashboard — player, resources, main planet + buildings */
  app.get('/dashboard', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };

    const empire = await prisma.empire.findUnique({
      where: { id: empireId },
      include: {
        resources: true,
        planets: {
          include: { buildings: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!empire) {
      return reply.status(404).send({ error: 'Empire not found' });
    }

    const metal = empire.resources.find((r) => r.type === 'METAL');
    const plasma = empire.resources.find((r) => r.type === 'PLASMA');
    const credits = empire.resources.find((r) => r.type === 'CREDITS');
    const planet = empire.planets[0];

    return {
      player: {
        empireId: empire.id,
        name: empire.name,
        level: empire.level,
        xp: empire.experience,
        xpMax: xpMaxForLevel(empire.level),
      },
      resources: {
        metal: metal?.amount ?? 0,
        plasma: plasma?.amount ?? 0,
        credits: credits?.amount ?? 0,
        metalCapacity: metal?.capacity ?? 0,
        plasmaCapacity: plasma?.capacity ?? 0,
        metalProduction: metal?.productionPerHour ?? 0,
        plasmaProduction: plasma?.productionPerHour ?? 0,
      },
      planet: {
        id: planet?.id ?? '',
        name: planet?.name ?? 'Planeta Principal',
        type: planet?.type ?? 'HABITABLE',
        buildings: planet?.buildings ?? [],
      },
    };
  });

  app.get('/player', async (request, reply) => {
    const dashboard = await app.inject({
      method: 'GET',
      url: '/api/game/dashboard',
      headers: { authorization: request.headers.authorization ?? '' },
    });
    if (dashboard.statusCode >= 400) {
      return reply.status(dashboard.statusCode).send(JSON.parse(dashboard.body));
    }
    return JSON.parse(dashboard.body).player;
  });

  app.get('/resources', async (request, reply) => {
    const dashboard = await app.inject({
      method: 'GET',
      url: '/api/game/dashboard',
      headers: { authorization: request.headers.authorization ?? '' },
    });
    if (dashboard.statusCode >= 400) {
      return reply.status(dashboard.statusCode).send(JSON.parse(dashboard.body));
    }
    return JSON.parse(dashboard.body).resources;
  });

  app.get('/planet', async (request, reply) => {
    const dashboard = await app.inject({
      method: 'GET',
      url: '/api/game/dashboard',
      headers: { authorization: request.headers.authorization ?? '' },
    });
    if (dashboard.statusCode >= 400) {
      return reply.status(dashboard.statusCode).send(JSON.parse(dashboard.body));
    }
    return JSON.parse(dashboard.body).planet;
  });

  app.get('/buildings', async (request, reply) => {
    const dashboard = await app.inject({
      method: 'GET',
      url: '/api/game/dashboard',
      headers: { authorization: request.headers.authorization ?? '' },
    });
    if (dashboard.statusCode >= 400) {
      return reply.status(dashboard.statusCode).send(JSON.parse(dashboard.body));
    }
    return JSON.parse(dashboard.body).planet.buildings;
  });

  const upgradeBodySchema = z.object({
    slotIndex: z.number().min(0).max(8).optional(),
    type: z.string().optional(),
  });

  /** POST /api/game/buildings/:id/upgrade — :id = building UUID */
  app.post('/buildings/:id/upgrade', async (request, reply) => {
    const { id: buildingId } = request.params as { id: string };
    const { empireId } = request.user as { empireId: string };
    const body = upgradeBodySchema.parse(request.body ?? {});

    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      include: { planet: true },
    });

    if (!building || building.planet.empireId !== empireId) {
      return reply.status(404).send({ error: 'Building not found' });
    }

    const slotIndex = body.slotIndex ?? building.slotIndex;
    const type = body.type ?? building.type;

    const res = await app.inject({
      method: 'POST',
      url: `/api/planets/${building.planetId}/build`,
      headers: { authorization: request.headers.authorization ?? '' },
      payload: { slotIndex, type },
    });

    return reply.status(res.statusCode).send(JSON.parse(res.body));
  });
}
