import { FastifyInstance } from 'fastify';
import { prisma } from '@galaxy/database';

export async function shipyardRoutes(app: FastifyInstance) {
  // Auth middleware
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // GET /api/shipyard - List all blueprints with build status
  app.get('/', async (request) => {
    const { empireId } = request.user as { empireId: string };

    // Get all blueprints
    const blueprints = await prisma.blueprint.findMany();

    // Get empire data for checks
    const empire = await prisma.empire.findUnique({
      where: { id: empireId },
      include: {
        technologies: {
          include: { technology: true },
        },
        planets: {
          include: { buildings: true },
        },
        ships: true,
        shipConstructions: {
          where: { status: 'BUILDING' },
          include: { blueprint: true },
        },
      },
    });

    if (!empire) {
      throw new Error('Empire not found');
    }

    // Check for shipyard building
    const hasShipyard = empire.planets.some((planet) =>
      planet.buildings.some((b) => b.type === 'shipyard' || b.type === 'SHIPYARD')
    );

    // Get completed techs for unlocking
    const completedTechs = new Set(
      empire.technologies.filter((t) => t.level > 0).map((t) => t.technologyId)
    );

    // Get ship inventory
    const shipInventory = empire.ships.reduce((acc, ship) => {
      acc[ship.blueprintId] = ship.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Get active constructions
    const activeConstructions = empire.shipConstructions;

    // Format blueprints with unlock status
    const formattedBlueprints = blueprints.map((bp) => {
      // Check tech requirement
      let techUnlocked = true;
      let requiredTechName = null;
      if (bp.requiredTechId) {
        techUnlocked = completedTechs.has(bp.requiredTechId);
        requiredTechName = null; // TODO: Fetch tech name if needed
      }

      // Check building requirement
      const buildingUnlocked = !bp.requiredBuildingType || hasShipyard;

      // Check if construction is active
      const activeConstruction = activeConstructions.find(
        (c) => c.blueprintId === bp.id
      );

      // Calculate remaining time
      let timeRemaining = 0;
      let progress = 0;
      if (activeConstruction) {
        const now = new Date().getTime();
        const end = new Date(activeConstruction.endsAt).getTime();
        const start = new Date(activeConstruction.startedAt).getTime();
        timeRemaining = Math.max(0, end - now);
        progress = Math.min(100, ((now - start) / (end - start)) * 100);
      }

      return {
        id: bp.id,
        key: bp.key,
        name: bp.name,
        type: bp.type,
        category: bp.category,
        description: bp.description,
        stats: {
          attack: bp.attack,
          defense: bp.defense,
          hp: bp.hp,
          speed: bp.speed,
          cargoCapacity: bp.cargoCapacity,
        },
        costs: {
          metal: bp.costMetal,
          plasma: bp.costPlasma,
          credits: bp.costCredits,
        },
        buildTime: bp.buildTime,
        unlocked: techUnlocked && buildingUnlocked,
        unlockRequirements: {
          tech: requiredTechName,
          building: bp.requiredBuildingType,
        },
        inventory: shipInventory[bp.id] || 0,
        activeConstruction: activeConstruction
          ? {
              id: activeConstruction.id,
              quantity: activeConstruction.quantity,
              timeRemaining,
              progress,
              endsAt: activeConstruction.endsAt,
            }
          : null,
      };
    });

    return {
      hasShipyard,
      blueprints: formattedBlueprints,
      activeConstructions: activeConstructions.map((c) => ({
        id: c.id,
        blueprintId: c.blueprintId,
        blueprintName: c.blueprint.name,
        quantity: c.quantity,
        endsAt: c.endsAt,
      })),
    };
  });

  // POST /api/shipyard/build - Start building ships
  app.post('/build', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const { blueprintId, quantity = 1 } = request.body as {
      blueprintId: string;
      quantity?: number;
    };

    // Validate quantity
    if (quantity < 1 || quantity > 100) {
      return reply.status(400).send({ error: 'Invalid quantity (1-100)' });
    }

    try {
      // Get blueprint
      const blueprint = await prisma.blueprint.findUnique({
        where: { id: blueprintId },
      });

      if (!blueprint) {
        return reply.status(404).send({ error: 'Blueprint not found' });
      }

      // Get empire with all needed data
      const empire = await prisma.empire.findUnique({
        where: { id: empireId },
        include: {
          technologies: {
            include: { technology: true },
          },
          planets: {
            include: { buildings: true },
          },
          resources: true,
          shipConstructions: {
            where: { status: 'BUILDING' },
          },
        },
      });

      if (!empire) {
        return reply.status(404).send({ error: 'Empire not found' });
      }

      // Check shipyard building
      const hasShipyard = empire.planets.some((planet) =>
        planet.buildings.some((b) => b.type === 'shipyard' || b.type === 'SHIPYARD')
      );

      if (blueprint.requiredBuildingType && !hasShipyard) {
        return reply.status(400).send({ error: 'Shipyard required' });
      }

      // Check tech requirement
      if (blueprint.requiredTechId) {
        const hasTech = empire.technologies.some(
          (t) => t.technologyId === blueprint.requiredTechId && t.level > 0
        );
        if (!hasTech) {
          return reply.status(400).send({ error: 'Required technology not researched' });
        }
      }

      // Check active constructions (limit to 1 for MVP)
      if (empire.shipConstructions.length > 0) {
        return reply.status(400).send({
          error: 'Ship construction already in progress',
          activeConstruction: empire.shipConstructions[0],
        });
      }

      // DEV_MODE: Cheap costs for development testing
      const isDevCheapCosts = process.env.DEV_CHEAP_COSTS === 'true';
      const costMultiplier = isDevCheapCosts ? 0.01 : 1; // 1% of real cost in dev mode
      
      // Calculate total costs
      const totalCostMetal = Math.max(1, Math.floor(blueprint.costMetal * quantity * costMultiplier));
      const totalCostPlasma = Math.max(1, Math.floor(blueprint.costPlasma * quantity * costMultiplier));
      const totalCostCredits = Math.max(1, Math.floor(blueprint.costCredits * quantity * costMultiplier));

      // Apply build time reduction from technology
      let effectiveBuildTime = blueprint.buildTime;
      const automationTech = empire.technologies.find(
        (t) => t.technology.key === 'INDUSTRIAL_AUTOMATION'
      );
      if (automationTech && automationTech.level > 0) {
        const reduction = automationTech.level * 0.1; // 10% per level
        effectiveBuildTime = Math.floor(effectiveBuildTime * (1 - reduction));
      }
      // DEV: Fast timers for development testing (never enabled by default)
      const timeMultiplier = process.env.DEV_FAST_TIMERS === 'true' ? 0.1 : 1;
      const totalBuildTime = Math.floor(effectiveBuildTime * quantity * timeMultiplier);

      // Check resources
      const metal = empire.resources.find((r) => r.type === 'METAL');
      const plasma = empire.resources.find((r) => r.type === 'PLASMA');
      const credits = empire.resources.find((r) => r.type === 'CREDITS');

      if (!metal || metal.amount < totalCostMetal) {
        return reply.status(400).send({ error: 'Insufficient metal' });
      }
      if (!plasma || plasma.amount < totalCostPlasma) {
        return reply.status(400).send({ error: 'Insufficient plasma' });
      }
      if (!credits || credits.amount < totalCostCredits) {
        return reply.status(400).send({ error: 'Insufficient credits' });
      }

      // Deduct resources and create construction
      const now = new Date();
      const endsAt = new Date(now.getTime() + totalBuildTime * 1000);

      await prisma.$transaction(async (tx) => {
        // Deduct resources
        await tx.resource.update({
          where: { id: metal.id },
          data: { amount: { decrement: totalCostMetal } },
        });
        await tx.resource.update({
          where: { id: plasma.id },
          data: { amount: { decrement: totalCostPlasma } },
        });
        await tx.resource.update({
          where: { id: credits.id },
          data: { amount: { decrement: totalCostCredits } },
        });

        // Create construction
        await tx.shipConstruction.create({
          data: {
            empireId,
            blueprintId,
            quantity,
            status: 'BUILDING',
            startedAt: now,
            endsAt,
          },
        });
      });

      return {
        success: true,
        message: `Started building ${quantity} ${blueprint.name}(s)`,
        endsAt,
        buildTime: totalBuildTime,
      };
    } catch (error) {
      console.error('Ship build error:', error);
      return reply.status(500).send({ error: 'Failed to start construction' });
    }
  });

  // POST /api/shipyard/sync - Complete finished constructions
  app.post('/sync', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };

    try {
      const now = new Date();

      // Find completed constructions
      const completedConstructions = await prisma.shipConstruction.findMany({
        where: {
          empireId,
          status: 'BUILDING',
          endsAt: { lte: now },
        },
        include: { blueprint: true },
      });

      // Complete each construction
      for (const construction of completedConstructions) {
        await prisma.$transaction(async (tx) => {
          // Mark construction as completed
          await tx.shipConstruction.update({
            where: { id: construction.id },
            data: {
              status: 'COMPLETED',
              completedAt: now,
            },
          });

          // Add ships to inventory
          const existingShip = await tx.ship.findFirst({
            where: {
              empireId,
              blueprintId: construction.blueprintId,
            },
          });

          if (existingShip) {
            await tx.ship.update({
              where: { id: existingShip.id },
              data: {
                quantity: { increment: construction.quantity },
              },
            });
          } else {
            await tx.ship.create({
              data: {
                empireId,
                blueprintId: construction.blueprintId,
                quantity: construction.quantity,
                status: 'AVAILABLE',
              },
            });
          }
        });
      }

      return {
        success: true,
        completedCount: completedConstructions.length,
        completedShips: completedConstructions.map((c) => ({
          blueprintId: c.blueprintId,
          name: c.blueprint.name,
          quantity: c.quantity,
        })),
      };
    } catch (error) {
      console.error('Shipyard sync error:', error);
      return reply.status(500).send({ error: 'Failed to sync shipyard' });
    }
  });

  // GET /api/ships - Get ship inventory
  app.get('/ships', async (request) => {
    const { empireId } = request.user as { empireId: string };

    const ships = await prisma.ship.findMany({
      where: { empireId },
      include: { blueprint: true },
    });

    return {
      ships: ships.map((s) => ({
        id: s.id,
        blueprintId: s.blueprintId,
        name: s.blueprint.name,
        type: s.blueprint.type,
        category: s.blueprint.category,
        quantity: s.quantity,
        stats: {
          attack: s.blueprint.attack,
          defense: s.blueprint.defense,
          hp: s.blueprint.hp,
          speed: s.blueprint.speed,
          cargoCapacity: s.blueprint.cargoCapacity,
        },
      })),
    };
  });
}
