import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@galaxy/database';

const startMissionSchema = z.object({
  fleetId: z.string(),
});

export async function missionRoutes(app: FastifyInstance) {
  // Auth middleware
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Get all available PvE missions
  app.get('/', async () => {
    const missions = await prisma.mission.findMany({
      orderBy: { difficulty: 'asc' },
    });

    return { missions };
  });

  // Get active missions for empire
  app.get('/active', async (request) => {
    const { empireId } = request.user as { empireId: string };

    const activeRuns = await prisma.missionRun.findMany({
      where: { empireId, status: 'RUNNING' },
      include: {
        mission: true,
        fleet: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    // Calculate remaining time
    const now = new Date();
    const runsWithTime = activeRuns.map((run) => {
      const endsAt = new Date(run.startedAt.getTime() + run.mission.durationSeconds * 1000);
      const remainingSeconds = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));
      const isComplete = remainingSeconds <= 0;

      return {
        ...run,
        endsAt: endsAt.toISOString(),
        remainingSeconds,
        isComplete,
      };
    });

    return { activeMissions: runsWithTime };
  });

  // Start a mission
  app.post('/:missionId/start', async (request, reply) => {
    const { empireId } = request.user as { empireId: string };
    const { missionId } = request.params as { missionId: string };

    try {
      const data = startMissionSchema.parse(request.body);

      // Verify mission exists
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        return reply.status(404).send({ error: 'Mission not found' });
      }

      // Verify fleet belongs to empire and is idle
      const fleet = await prisma.fleet.findFirst({
        where: { id: data.fleetId, empireId, status: 'IDLE' },
        include: { formations: true },
      });

      if (!fleet) {
        return reply.status(404).send({ error: 'Fleet not found or not idle' });
      }

      // Check fleet has enough ships
      const totalShips = fleet.formations.reduce((sum, f) => sum + f.quantity, 0);
      if (totalShips < mission.minShipsRequired) {
        return reply.status(400).send({
          error: `Fleet needs at least ${mission.minShipsRequired} ships`,
        });
      }

      // Check fleet is not already on a mission
      const existingRun = await prisma.missionRun.findFirst({
        where: { fleetId: data.fleetId, status: 'RUNNING' },
      });

      if (existingRun) {
        return reply.status(400).send({ error: 'Fleet is already on a mission' });
      }

      // Create mission run
      const missionRun = await prisma.$transaction(async (tx) => {
        // Set fleet status
        await tx.fleet.update({
          where: { id: data.fleetId },
          data: { status: 'ON_MISSION' },
        });

        // Create mission run
        const run = await tx.missionRun.create({
          data: {
            empireId,
            missionId,
            fleetId: data.fleetId,
            status: 'RUNNING',
          },
        });

        return run;
      });

      return {
        missionRun,
        endsAt: new Date(Date.now() + mission.durationSeconds * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Start mission error:', error);
      return reply.status(500).send({ error: 'Failed to start mission' });
    }
  });

  // Sync missions (check completions)
  app.post('/sync', async (request) => {
    const { empireId } = request.user as { empireId: string };

    const now = new Date();

    // Find completed missions
    const activeRuns = await prisma.missionRun.findMany({
      where: { empireId, status: 'RUNNING' },
      include: { mission: true, fleet: { include: { formations: true } } },
    });

    const completed = [];
    const stillRunning = [];

    for (const run of activeRuns) {
      const endsAt = new Date(run.startedAt.getTime() + run.mission.durationSeconds * 1000);

      if (now >= endsAt) {
        // Mission complete - give rewards
        if (!run.rewardsGiven) {
          await prisma.$transaction(async (tx) => {
            // Update mission run
            await tx.missionRun.update({
              where: { id: run.id },
              data: {
                status: 'COMPLETED',
                result: 'WIN',
                completedAt: now,
                rewardsGiven: true,
              },
            });

            // Return fleet to idle
            await tx.fleet.update({
              where: { id: run.fleetId },
              data: { status: 'IDLE' },
            });

            // Give rewards
            const resources = await tx.resource.findMany({
              where: { empireId },
            });

            for (const res of resources) {
              if (res.type === 'METAL') {
                await tx.resource.update({
                  where: { id: res.id },
                  data: { amount: { increment: run.mission.rewardMetal } },
                });
              } else if (res.type === 'PLASMA') {
                await tx.resource.update({
                  where: { id: res.id },
                  data: { amount: { increment: run.mission.rewardPlasma } },
                });
              } else if (res.type === 'CREDITS') {
                await tx.resource.update({
                  where: { id: res.id },
                  data: { amount: { increment: run.mission.rewardCredits } },
                });
              }
            }
          });

          completed.push({
            missionRunId: run.id,
            missionName: run.mission.name,
            rewards: {
              metal: run.mission.rewardMetal,
              plasma: run.mission.rewardPlasma,
              credits: run.mission.rewardCredits,
              xp: run.mission.rewardXp,
            },
          });
        }
      } else {
        stillRunning.push({
          missionRunId: run.id,
          remainingSeconds: Math.floor((endsAt.getTime() - now.getTime()) / 1000),
        });
      }
    }

    return { completed, stillRunning };
  });

  // Get mission history
  app.get('/history', async (request) => {
    const { empireId } = request.user as { empireId: string };

    const history = await prisma.missionRun.findMany({
      where: { empireId, status: { in: ['COMPLETED', 'CANCELLED'] } },
      include: { mission: true, fleet: true },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    return { history };
  });
}
