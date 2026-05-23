import { FastifyInstance } from 'fastify';
import { prisma } from '@galaxy/database';

export async function researchRoutes(app: FastifyInstance) {
  // Auth middleware
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // GET /api/research - List all technologies for empire
  app.get('/', async (request) => {
    const { empireId } = request.user as { empireId: string };

    // Get empire technologies with their details
    const empireTechs = await prisma.empireTechnology.findMany({
      where: { empireId },
      include: {
        technology: {
          include: {
            requiredTech: true,
          },
        },
      },
    });

    // Get all technologies to find unlocked ones
    const allTechnologies = await prisma.technology.findMany({
      include: {
        requiredTech: true,
      },
    });

    // Format response with calculated costs and status
    const formattedTechs = allTechnologies.map((tech) => {
      const empireTech = empireTechs.find((et) => et.technologyId === tech.id);
      const currentLevel = empireTech?.level || 0;
      const status = empireTech?.status || 'LOCKED';
      const isResearching = status === 'RESEARCHING';

      // Check if prerequisites are met
      let prerequisiteMet = true;
      let prerequisiteName = null;
      if (tech.requiredTechId) {
        const prereqTech = empireTechs.find((et) => et.technologyId === tech.requiredTechId);
        if (!prereqTech || prereqTech.level === 0) {
          prerequisiteMet = false;
          prerequisiteName = tech.requiredTech?.name;
        }
      }

      // Calculate costs for next level
      const nextLevel = currentLevel + 1;
      const costMultiplier = nextLevel;
      const costMetal = tech.baseCostMetal * costMultiplier;
      const costPlasma = tech.baseCostPlasma * costMultiplier;
      const researchTime = tech.baseResearchTime * costMultiplier;

      // Calculate remaining time if researching
      let timeRemaining = 0;
      let progress = 0;
      if (isResearching && empireTech?.researchStartedAt && empireTech?.researchEndsAt) {
        const now = new Date().getTime();
        const start = new Date(empireTech.researchStartedAt).getTime();
        const end = new Date(empireTech.researchEndsAt).getTime();
        const total = end - start;
        const elapsed = now - start;
        timeRemaining = Math.max(0, end - now);
        progress = Math.min(100, (elapsed / total) * 100);
      }

      return {
        id: tech.id,
        key: tech.key,
        name: tech.name,
        description: tech.description,
        category: tech.category,
        currentLevel,
        maxLevel: tech.maxLevel,
        status,
        isMaxLevel: currentLevel >= tech.maxLevel,
        prerequisiteMet,
        prerequisiteName,
        costs: {
          metal: costMetal,
          plasma: costPlasma,
          time: researchTime,
        },
        effects: {
          type: tech.effectType,
          value: tech.effectValue,
          description: tech.effectDescription,
        },
        researchStatus: isResearching
          ? {
              timeRemaining,
              progress,
              endsAt: empireTech?.researchEndsAt,
            }
          : null,
      };
    });

    return { technologies: formattedTechs };
  });

  // POST /api/research/:technologyId/start - Start researching a technology
  app.post('/:technologyId/start', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const { technologyId } = request.params as { technologyId: string };

    try {
      // Get technology details
      const technology = await prisma.technology.findUnique({
        where: { id: technologyId },
      });

      if (!technology) {
        return reply.status(404).send({ error: 'Technology not found' });
      }

      // Check if there's already an active research
      const activeResearch = await prisma.empireTechnology.findFirst({
        where: {
          empireId,
          status: 'RESEARCHING',
        },
      });

      if (activeResearch) {
        return reply.status(400).send({
          error: 'Already researching another technology',
          activeResearchId: activeResearch.technologyId,
        });
      }

      // Get or create empire technology
      let empireTech = await prisma.empireTechnology.findFirst({
        where: { empireId, technologyId },
      });

      const currentLevel = empireTech?.level || 0;
      const nextLevel = currentLevel + 1;

      // Check max level
      if (currentLevel >= technology.maxLevel) {
        return reply.status(400).send({ error: 'Technology already at max level' });
      }

      // Check prerequisites
      if (technology.requiredTechId) {
        const prereq = await prisma.empireTechnology.findFirst({
          where: {
            empireId,
            technologyId: technology.requiredTechId,
            level: { gt: 0 },
          },
        });
        if (!prereq) {
          return reply.status(400).send({ error: 'Prerequisites not met' });
        }
      }

      // Calculate costs
      const costMultiplier = nextLevel;
      const costMetal = technology.baseCostMetal * costMultiplier;
      const costPlasma = technology.baseCostPlasma * costMultiplier;
      const researchTime = technology.baseResearchTime * costMultiplier;

      // Check resources
      const resources = await prisma.resource.findMany({
        where: { empireId },
      });

      const metal = resources.find((r) => r.type === 'METAL');
      const plasma = resources.find((r) => r.type === 'PLASMA');

      if (!metal || metal.amount < costMetal) {
        return reply.status(400).send({ error: 'Insufficient metal' });
      }
      if (!plasma || plasma.amount < costPlasma) {
        return reply.status(400).send({ error: 'Insufficient plasma' });
      }

      // Deduct resources and start research
      const now = new Date();
      const endsAt = new Date(now.getTime() + researchTime * 1000);

      await prisma.$transaction(async (tx) => {
        // Deduct resources
        await tx.resource.update({
          where: { id: metal.id },
          data: { amount: { decrement: costMetal } },
        });

        await tx.resource.update({
          where: { id: plasma.id },
          data: { amount: { decrement: costPlasma } },
        });

        // Create or update empire technology
        if (empireTech) {
          await tx.empireTechnology.update({
            where: { id: empireTech.id },
            data: {
              status: 'RESEARCHING',
              researchStartedAt: now,
              researchEndsAt: endsAt,
            },
          });
        } else {
          await tx.empireTechnology.create({
            data: {
              empireId,
              technologyId,
              status: 'RESEARCHING',
              researchStartedAt: now,
              researchEndsAt: endsAt,
            },
          });
        }
      });

      return {
        success: true,
        message: 'Research started',
        endsAt,
        researchTime,
      };
    } catch (error) {
      console.error('Research start error:', error);
      return reply.status(500).send({ error: 'Failed to start research' });
    }
  });

  // POST /api/research/sync - Complete research and update levels
  app.post('/sync', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };

    try {
      // Find completed research
      const now = new Date();
      const completedResearches = await prisma.empireTechnology.findMany({
        where: {
          empireId,
          status: 'RESEARCHING',
          researchEndsAt: { lte: now },
        },
      });

      // Complete each research
      for (const research of completedResearches) {
        await prisma.empireTechnology.update({
          where: { id: research.id },
          data: {
            status: 'COMPLETED',
            level: { increment: 1 },
            researchStartedAt: null,
            researchEndsAt: null,
          },
        });
      }

      return {
        success: true,
        completedCount: completedResearches.length,
        completedIds: completedResearches.map((r) => r.technologyId),
      };
    } catch (error) {
      console.error('Research sync error:', error);
      return reply.status(500).send({ error: 'Failed to sync research' });
    }
  });
}
