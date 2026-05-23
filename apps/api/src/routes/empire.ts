import { FastifyInstance } from 'fastify';
import { prisma } from '@galaxy/database';

// Helper to calculate current resources with technology bonuses
function calculateResources(resource: any, techBonuses: Record<string, number> = {}) {
  const now = new Date();
  const lastUpdate = new Date(resource.updatedAt);
  const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  // Apply technology bonuses
  let effectiveProductionPerHour = resource.productionPerHour;
  if (resource.type === 'METAL' && techBonuses['METAL_PRODUCTION']) {
    effectiveProductionPerHour *= (1 + techBonuses['METAL_PRODUCTION']);
  }
  if (resource.type === 'PLASMA' && techBonuses['PLASMA_PRODUCTION']) {
    effectiveProductionPerHour *= (1 + techBonuses['PLASMA_PRODUCTION']);
  }
  
  const production = effectiveProductionPerHour * hoursDiff;
  const newAmount = Math.min(resource.amount + production, resource.capacity);
  
  return {
    ...resource,
    amount: Math.floor(newAmount),
    productionPerHour: Math.floor(effectiveProductionPerHour),
  };
}

export async function empireRoutes(app: FastifyInstance) {
  // Auth middleware
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Get empire data
  app.get('/', async (request) => {
    const { empireId } = request.user as { empireId: string };
    
    const empire = await prisma.empire.findUnique({
      where: { id: empireId },
      include: {
        resources: true,
        planets: {
          include: {
            buildings: true,
          },
        },
        technologies: {
          include: {
            technology: true,
          },
        },
      },
    });

    if (!empire) {
      throw new Error('Empire not found');
    }

    // Calculate technology bonuses
    const techBonuses: Record<string, number> = {};
    for (const empireTech of empire.technologies) {
      if (empireTech.level > 0 && empireTech.technology.effectType) {
        techBonuses[empireTech.technology.effectType] = 
          (techBonuses[empireTech.technology.effectType] || 0) + 
          (empireTech.technology.effectValue * empireTech.level);
      }
    }

    // Calculate current resources with bonuses
    const resourcesWithProduction = empire.resources.map(r => calculateResources(r, techBonuses));

    return {
      id: empire.id,
      name: empire.name,
      level: empire.level,
      experience: empire.experience,
      resources: resourcesWithProduction,
      planets: empire.planets,
      technologies: empire.technologies,
    };
  });

  // Get resources only
  app.get('/resources', async (request) => {
    const { empireId } = request.user as { empireId: string };
    
    // Get resources and technologies
    const [resources, empireTechs] = await Promise.all([
      prisma.resource.findMany({ where: { empireId } }),
      prisma.empireTechnology.findMany({ 
        where: { empireId, level: { gt: 0 } },
        include: { technology: true }
      }),
    ]);

    // Calculate technology bonuses
    const techBonuses: Record<string, number> = {};
    for (const empireTech of empireTechs) {
      if (empireTech.technology.effectType) {
        techBonuses[empireTech.technology.effectType] = 
          (techBonuses[empireTech.technology.effectType] || 0) + 
          (empireTech.technology.effectValue * empireTech.level);
      }
    }

    return resources.map(r => calculateResources(r, techBonuses));
  });

  // Update empire (name only for now)
  app.patch('/', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const { name } = request.body as { name?: string };

    if (!name || name.length < 3 || name.length > 30) {
      return reply.status(400).send({ error: 'Invalid name' });
    }

    const empire = await prisma.empire.update({
      where: { id: empireId },
      data: { name },
    });

    return empire;
  });
}
