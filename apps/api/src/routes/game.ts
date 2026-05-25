import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@galaxy/database';
import {
  buildGo2ConstructionQueue,
  getBuildingLevelCost,
  normalizeBuildingType,
  PLANET_BUILDING_SLOTS,
} from '@galaxy/shared';
import { syncEmpireGameState } from '../lib/gameState';
import { finalizeCompletedBuildings } from '../lib/buildingLogic';

function xpMaxForLevel(level: number): number {
  return Math.max(level * 1000, 1000);
}

const isDevCheap =
  process.env.DEV_CHEAP_COSTS === 'true' || process.env.DEV_CHEAP_COSTS === '1';

export async function gameRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/dashboard', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };

    const synced = await syncEmpireGameState(empireId);

    const empire = await prisma.empire.findUnique({
      where: { id: empireId },
      include: {
        planets: {
          include: { buildings: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!empire) {
      return reply.status(404).send({ error: 'Empire not found' });
    }

    const planet = empire.planets[0];
    let buildings = planet?.buildings ?? [];
    if (planet) {
      buildings = (await finalizeCompletedBuildings(planet.id)) as typeof buildings;
    }

    const normalized = buildings.map((b) => ({
      id: b.id,
      planetId: b.planetId,
      type: normalizeBuildingType(b.type),
      level: b.level,
      slotIndex: b.slotIndex,
      status: b.status,
      constructionEndsAt:
        b.constructionEndsAt instanceof Date
          ? b.constructionEndsAt.toISOString()
          : (b.constructionEndsAt as string | null) ?? null,
    }));

    const constructionQueue = buildGo2ConstructionQueue(normalized, isDevCheap);

    return {
      player: {
        empireId: empire.id,
        name: empire.name,
        level: empire.level,
        xp: empire.experience,
        xpMax: xpMaxForLevel(empire.level),
      },
      resources: synced.resources,
      collected: synced.collected,
      planet: {
        id: planet?.id ?? '',
        name: planet?.name ?? 'Planeta Principal',
        type: planet?.type ?? 'HABITABLE',
        maxBuildingSlots: planet?.maxBuildingSlots ?? PLANET_BUILDING_SLOTS,
        buildings: normalized,
      },
      constructionQueue,
    };
  });

  app.post('/resources/collect', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const empire = await prisma.empire.findUnique({ where: { id: empireId } });
    if (!empire) {
      return reply.status(404).send({ error: 'Empire not found' });
    }
    return syncEmpireGameState(empireId);
  });

  app.get('/buildings/:type/cost', async (request, reply) => {
    const { type } = request.params as { type: string };
    const level = Math.min(
      30,
      Math.max(1, Number((request.query as { level?: string })?.level) || 1)
    );
    const canonical = normalizeBuildingType(type);
    const cost = getBuildingLevelCost(canonical, level, isDevCheap);
    return {
      type: canonical,
      level,
      cost: { metal: cost.metal, plasma: cost.plasma, credits: cost.credits },
      timeSeconds: cost.time,
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
    slotIndex: z.number().min(0).max(PLANET_BUILDING_SLOTS - 1).optional(),
    type: z.string().optional(),
  });

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

    const res = await app.inject({
      method: 'POST',
      url: `/api/planets/${building.planetId}/build`,
      headers: { authorization: request.headers.authorization ?? '' },
      payload: {
        slotIndex: body.slotIndex ?? building.slotIndex,
        type: body.type ?? building.type,
      },
    });

    return reply.status(res.statusCode).send(JSON.parse(res.body));
  });
}
