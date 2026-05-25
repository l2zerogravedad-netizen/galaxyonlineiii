"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionRoutes = missionRoutes;
const zod_1 = require("zod");
const database_1 = require("@galaxy/database");
const startMissionSchema = zod_1.z.object({
    fleetId: zod_1.z.string(),
});
async function missionRoutes(app) {
    // Auth middleware
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
    // Get all available PvE missions
    app.get('/', async () => {
        const missions = await database_1.prisma.mission.findMany({
            orderBy: { difficulty: 'asc' },
        });
        return { missions };
    });
    // Get active missions for empire
    app.get('/active', async (request) => {
        const { empireId } = request.user;
        const activeRuns = await database_1.prisma.missionRun.findMany({
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
        const { empireId } = request.user;
        const { missionId } = request.params;
        try {
            const data = startMissionSchema.parse(request.body);
            // Verify mission exists
            const mission = await database_1.prisma.mission.findUnique({
                where: { id: missionId },
            });
            if (!mission) {
                return reply.status(404).send({ error: 'Mission not found' });
            }
            // Verify fleet belongs to empire and is idle
            const fleet = await database_1.prisma.fleet.findFirst({
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
            const existingRun = await database_1.prisma.missionRun.findFirst({
                where: { fleetId: data.fleetId, status: 'RUNNING' },
            });
            if (existingRun) {
                return reply.status(400).send({ error: 'Fleet is already on a mission' });
            }
            // Create mission run
            const missionRun = await database_1.prisma.$transaction(async (tx) => {
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
        }
        catch (error) {
            console.error('Start mission error:', error);
            return reply.status(500).send({ error: 'Failed to start mission' });
        }
    });
    // Sync missions (check completions)
    app.post('/sync', async (request) => {
        const { empireId } = request.user;
        const now = new Date();
        // Find completed missions
        const activeRuns = await database_1.prisma.missionRun.findMany({
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
                    await database_1.prisma.$transaction(async (tx) => {
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
                            }
                            else if (res.type === 'PLASMA') {
                                await tx.resource.update({
                                    where: { id: res.id },
                                    data: { amount: { increment: run.mission.rewardPlasma } },
                                });
                            }
                            else if (res.type === 'CREDITS') {
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
            }
            else {
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
        const { empireId } = request.user;
        const history = await database_1.prisma.missionRun.findMany({
            where: { empireId, status: { in: ['COMPLETED', 'CANCELLED'] } },
            include: { mission: true, fleet: true },
            orderBy: { completedAt: 'desc' },
            take: 50,
        });
        return { history };
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL21pc3Npb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEsc0NBZ09DO0FBdk9ELDZCQUF3QjtBQUN4QiwrQ0FBMEM7QUFFMUMsTUFBTSxrQkFBa0IsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2xDLE9BQU8sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0NBQ3BCLENBQUMsQ0FBQztBQUVJLEtBQUssVUFBVSxhQUFhLENBQUMsR0FBb0I7SUFDdEQsa0JBQWtCO0lBQ2xCLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDaEQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILGlDQUFpQztJQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN0QixNQUFNLFFBQVEsR0FBRyxNQUFNLGlCQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUM3QyxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFO1NBQy9CLENBQUMsQ0FBQztRQUVILE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUVILGlDQUFpQztJQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDbkMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFH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RSxPQUFPLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGYXN0aWZ5SW5zdGFuY2UgfSBmcm9tICdmYXN0aWZ5JztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0BnYWxheHkvZGF0YWJhc2UnO1xyXG5cclxuY29uc3Qgc3RhcnRNaXNzaW9uU2NoZW1hID0gei5vYmplY3Qoe1xyXG4gIGZsZWV0SWQ6IHouc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1pc3Npb25Sb3V0ZXMoYXBwOiBGYXN0aWZ5SW5zdGFuY2UpIHtcclxuICAvLyBBdXRoIG1pZGRsZXdhcmVcclxuICBhcHAuYWRkSG9vaygnb25SZXF1ZXN0JywgYXN5bmMgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCByZXF1ZXN0Lmp3dFZlcmlmeSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHJlcGx5LmNvZGUoNDAxKS5zZW5kKHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBHZXQgYWxsIGF2YWlsYWJsZSBQdkUgbWlzc2lvbnNcclxuICBhcHAuZ2V0KCcvJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgbWlzc2lvbnMgPSBhd2FpdCBwcmlzbWEubWlzc2lvbi5maW5kTWFueSh7XHJcbiAgICAgIG9yZGVyQnk6IHsgZGlmZmljdWx0eTogJ2FzYycgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7IG1pc3Npb25zIH07XHJcbiAgfSk7XHJcblxyXG4gIC8vIEdldCBhY3RpdmUgbWlzc2lvbnMgZm9yIGVtcGlyZVxyXG4gIGFwcC5nZXQoJy9hY3RpdmUnLCBhc3luYyAocmVxdWVzdCkgPT4ge1xyXG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xyXG5cclxuICAgIGNvbnN0IGFjdGl2ZVJ1bnMgPSBhd2FpdCBwcmlzbWEubWlzc2lvblJ1bi5maW5kTWFueSh7XHJcbiAgICAgIHdoZXJlOiB7IGVtcGlyZUlkLCBzdGF0dXM6ICdSVU5OSU5HJyB9LFxyXG4gICAgICBpbmNsdWRlOiB7XHJcbiAgICAgICAgbWlzc2lvbjogdHJ1ZSxcclxuICAgICAgICBmbGVldDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgb3JkZXJCeTogeyBzdGFydGVkQXQ6ICdkZXNjJyB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHJlbWFpbmluZyB0aW1lXHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY29uc3QgcnVuc1dpdGhUaW1lID0gYWN0aXZlUnVucy5tYXAoKHJ1bikgPT4ge1xyXG4gICAgICBjb25zdCBlbmRzQXQgPSBuZXcgRGF0ZShydW4uc3RhcnRlZEF0LmdldFRpbWUoKSArIHJ1bi5taXNzaW9uLmR1cmF0aW9uU2Vjb25kcyAqIDEwMDApO1xyXG4gICAgICBjb25zdCByZW1haW5pbmdTZWNvbmRzID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcigoZW5kc0F0LmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMCkpO1xyXG4gICAgICBjb25zdCBpc0NvbXBsZXRlID0gcmVtYWluaW5nU2Vjb25kcyA8PSAwO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5ydW4sXHJcbiAgICAgICAgZW5kc0F0OiBlbmRzQXQudG9JU09TdHJpbmcoKSxcclxuICAgICAgICByZW1haW5pbmdTZWNvbmRzLFxyXG4gICAgICAgIGlzQ29tcGxldGUsXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4geyBhY3RpdmVNaXNzaW9uczogcnVuc1dpdGhUaW1lIH07XHJcbiAgfSk7XHJcblxyXG4gIC8vIFN0YXJ0IGEgbWlzc2lvblxyXG4gIGFwcC5wb3N0KCcvOm1pc3Npb25JZC9zdGFydCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xyXG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xyXG4gICAgY29uc3QgeyBtaXNzaW9uSWQgfSA9IHJlcXVlc3QucGFyYW1zIGFzIHsgbWlzc2lvbklkOiBzdHJpbmcgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBkYXRhID0gc3RhcnRNaXNzaW9uU2NoZW1hLnBhcnNlKHJlcXVlc3QuYm9keSk7XHJcblxyXG4gICAgICAvLyBWZXJpZnkgbWlzc2lvbiBleGlzdHNcclxuICAgICAgY29uc3QgbWlzc2lvbiA9IGF3YWl0IHByaXNtYS5taXNzaW9uLmZpbmRVbmlxdWUoe1xyXG4gICAgICAgIHdoZXJlOiB7IGlkOiBtaXNzaW9uSWQgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIW1pc3Npb24pIHtcclxuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwNCkuc2VuZCh7IGVycm9yOiAnTWlzc2lvbiBub3QgZm91bmQnIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWZXJpZnkgZmxlZXQgYmVsb25ncyB0byBlbXBpcmUgYW5kIGlzIGlkbGVcclxuICAgICAgY29uc3QgZmxlZXQgPSBhd2FpdCBwcmlzbWEuZmxlZXQuZmluZEZpcnN0KHtcclxuICAgICAgICB3aGVyZTogeyBpZDogZGF0YS5mbGVldElkLCBlbXBpcmVJZCwgc3RhdHVzOiAnSURMRScgfSxcclxuICAgICAgICBpbmNsdWRlOiB7IGZvcm1hdGlvbnM6IHRydWUgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIWZsZWV0KSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDQpLnNlbmQoeyBlcnJvcjogJ0ZsZWV0IG5vdCBmb3VuZCBvciBub3QgaWRsZScgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGZsZWV0IGhhcyBlbm91Z2ggc2hpcHNcclxuICAgICAgY29uc3QgdG90YWxTaGlwcyA9IGZsZWV0LmZvcm1hdGlvbnMucmVkdWNlKChzdW0sIGYpID0+IHN1bSArIGYucXVhbnRpdHksIDApO1xyXG4gICAgICBpZiAodG90YWxTaGlwcyA8IG1pc3Npb24ubWluU2hpcHNSZXF1aXJlZCkge1xyXG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHtcclxuICAgICAgICAgIGVycm9yOiBgRmxlZXQgbmVlZHMgYXQgbGVhc3QgJHttaXNzaW9uLm1pblNoaXBzUmVxdWlyZWR9IHNoaXBzYCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgZmxlZXQgaXMgbm90IGFscmVhZHkgb24gYSBtaXNzaW9uXHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nUnVuID0gYXdhaXQgcHJpc21hLm1pc3Npb25SdW4uZmluZEZpcnN0KHtcclxuICAgICAgICB3aGVyZTogeyBmbGVldElkOiBkYXRhLmZsZWV0SWQsIHN0YXR1czogJ1JVTk5JTkcnIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGV4aXN0aW5nUnVuKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ0ZsZWV0IGlzIGFscmVhZHkgb24gYSBtaXNzaW9uJyB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ3JlYXRlIG1pc3Npb24gcnVuXHJcbiAgICAgIGNvbnN0IG1pc3Npb25SdW4gPSBhd2FpdCBwcmlzbWEuJHRyYW5zYWN0aW9uKGFzeW5jICh0eCkgPT4ge1xyXG4gICAgICAgIC8vIFNldCBmbGVldCBzdGF0dXNcclxuICAgICAgICBhd2FpdCB0eC5mbGVldC51cGRhdGUoe1xyXG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IGRhdGEuZmxlZXRJZCB9LFxyXG4gICAgICAgICAgZGF0YTogeyBzdGF0dXM6ICdPTl9NSVNTSU9OJyB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgbWlzc2lvbiBydW5cclxuICAgICAgICBjb25zdCBydW4gPSBhd2FpdCB0eC5taXNzaW9uUnVuLmNyZWF0ZSh7XHJcbiAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGVtcGlyZUlkLFxyXG4gICAgICAgICAgICBtaXNzaW9uSWQsXHJcbiAgICAgICAgICAgIGZsZWV0SWQ6IGRhdGEuZmxlZXRJZCxcclxuICAgICAgICAgICAgc3RhdHVzOiAnUlVOTklORycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcnVuO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbWlzc2lvblJ1bixcclxuICAgICAgICBlbmRzQXQ6IG5ldyBEYXRlKERhdGUubm93KCkgKyBtaXNzaW9uLmR1cmF0aW9uU2Vjb25kcyAqIDEwMDApLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdTdGFydCBtaXNzaW9uIGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg1MDApLnNlbmQoeyBlcnJvcjogJ0ZhaWxlZCB0byBzdGFydCBtaXNzaW9uJyB9KTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gU3luYyBtaXNzaW9ucyAoY2hlY2sgY29tcGxldGlvbnMpXHJcbiAgYXBwLnBvc3QoJy9zeW5jJywgYXN5bmMgKHJlcXVlc3QpID0+IHtcclxuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcclxuXHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG5cclxuICAgIC8vIEZpbmQgY29tcGxldGVkIG1pc3Npb25zXHJcbiAgICBjb25zdCBhY3RpdmVSdW5zID0gYXdhaXQgcHJpc21hLm1pc3Npb25SdW4uZmluZE1hbnkoe1xyXG4gICAgICB3aGVyZTogeyBlbXBpcmVJZCwgc3RhdHVzOiAnUlVOTklORycgfSxcclxuICAgICAgaW5jbHVkZTogeyBtaXNzaW9uOiB0cnVlLCBmbGVldDogeyBpbmNsdWRlOiB7IGZvcm1hdGlvbnM6IHRydWUgfSB9IH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBjb21wbGV0ZWQgPSBbXTtcclxuICAgIGNvbnN0IHN0aWxsUnVubmluZyA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgcnVuIG9mIGFjdGl2ZVJ1bnMpIHtcclxuICAgICAgY29uc3QgZW5kc0F0ID0gbmV3IERhdGUocnVuLnN0YXJ0ZWRBdC5nZXRUaW1lKCkgKyBydW4ubWlzc2lvbi5kdXJhdGlvblNlY29uZHMgKiAxMDAwKTtcclxuXHJcbiAgICAgIGlmIChub3cgPj0gZW5kc0F0KSB7XHJcbiAgICAgICAgLy8gTWlzc2lvbiBjb21wbGV0ZSAtIGdpdmUgcmV3YXJkc1xyXG4gICAgICAgIGlmICghcnVuLnJld2FyZHNHaXZlbikge1xyXG4gICAgICAgICAgYXdhaXQgcHJpc21hLiR0cmFuc2FjdGlvbihhc3luYyAodHgpID0+IHtcclxuICAgICAgICAgICAgLy8gVXBkYXRlIG1pc3Npb24gcnVuXHJcbiAgICAgICAgICAgIGF3YWl0IHR4Lm1pc3Npb25SdW4udXBkYXRlKHtcclxuICAgICAgICAgICAgICB3aGVyZTogeyBpZDogcnVuLmlkIH0sXHJcbiAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnQ09NUExFVEVEJyxcclxuICAgICAgICAgICAgICAgIHJlc3VsdDogJ1dJTicsXHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRBdDogbm93LFxyXG4gICAgICAgICAgICAgICAgcmV3YXJkc0dpdmVuOiB0cnVlLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIGZsZWV0IHRvIGlkbGVcclxuICAgICAgICAgICAgYXdhaXQgdHguZmxlZXQudXBkYXRlKHtcclxuICAgICAgICAgICAgICB3aGVyZTogeyBpZDogcnVuLmZsZWV0SWQgfSxcclxuICAgICAgICAgICAgICBkYXRhOiB7IHN0YXR1czogJ0lETEUnIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gR2l2ZSByZXdhcmRzXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlcyA9IGF3YWl0IHR4LnJlc291cmNlLmZpbmRNYW55KHtcclxuICAgICAgICAgICAgICB3aGVyZTogeyBlbXBpcmVJZCB9LFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzIG9mIHJlc291cmNlcykge1xyXG4gICAgICAgICAgICAgIGlmIChyZXMudHlwZSA9PT0gJ01FVEFMJykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdHgucmVzb3VyY2UudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgICAgd2hlcmU6IHsgaWQ6IHJlcy5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBpbmNyZW1lbnQ6IHJ1bi5taXNzaW9uLnJld2FyZE1ldGFsIH0gfSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzLnR5cGUgPT09ICdQTEFTTUEnKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0eC5yZXNvdXJjZS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgICB3aGVyZTogeyBpZDogcmVzLmlkIH0sXHJcbiAgICAgICAgICAgICAgICAgIGRhdGE6IHsgYW1vdW50OiB7IGluY3JlbWVudDogcnVuLm1pc3Npb24ucmV3YXJkUGxhc21hIH0gfSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzLnR5cGUgPT09ICdDUkVESVRTJykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdHgucmVzb3VyY2UudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgICAgd2hlcmU6IHsgaWQ6IHJlcy5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBpbmNyZW1lbnQ6IHJ1bi5taXNzaW9uLnJld2FyZENyZWRpdHMgfSB9LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBjb21wbGV0ZWQucHVzaCh7XHJcbiAgICAgICAgICAgIG1pc3Npb25SdW5JZDogcnVuLmlkLFxyXG4gICAgICAgICAgICBtaXNzaW9uTmFtZTogcnVuLm1pc3Npb24ubmFtZSxcclxuICAgICAgICAgICAgcmV3YXJkczoge1xyXG4gICAgICAgICAgICAgIG1ldGFsOiBydW4ubWlzc2lvbi5yZXdhcmRNZXRhbCxcclxuICAgICAgICAgICAgICBwbGFzbWE6IHJ1bi5taXNzaW9uLnJld2FyZFBsYXNtYSxcclxuICAgICAgICAgICAgICBjcmVkaXRzOiBydW4ubWlzc2lvbi5yZXdhcmRDcmVkaXRzLFxyXG4gICAgICAgICAgICAgIHhwOiBydW4ubWlzc2lvbi5yZXdhcmRYcCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzdGlsbFJ1bm5pbmcucHVzaCh7XHJcbiAgICAgICAgICBtaXNzaW9uUnVuSWQ6IHJ1bi5pZCxcclxuICAgICAgICAgIHJlbWFpbmluZ1NlY29uZHM6IE1hdGguZmxvb3IoKGVuZHNBdC5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDApLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHsgY29tcGxldGVkLCBzdGlsbFJ1bm5pbmcgfTtcclxuICB9KTtcclxuXHJcbiAgLy8gR2V0IG1pc3Npb24gaGlzdG9yeVxyXG4gIGFwcC5nZXQoJy9oaXN0b3J5JywgYXN5bmMgKHJlcXVlc3QpID0+IHtcclxuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcclxuXHJcbiAgICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgcHJpc21hLm1pc3Npb25SdW4uZmluZE1hbnkoe1xyXG4gICAgICB3aGVyZTogeyBlbXBpcmVJZCwgc3RhdHVzOiB7IGluOiBbJ0NPTVBMRVRFRCcsICdDQU5DRUxMRUQnXSB9IH0sXHJcbiAgICAgIGluY2x1ZGU6IHsgbWlzc2lvbjogdHJ1ZSwgZmxlZXQ6IHRydWUgfSxcclxuICAgICAgb3JkZXJCeTogeyBjb21wbGV0ZWRBdDogJ2Rlc2MnIH0sXHJcbiAgICAgIHRha2U6IDUwLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHsgaGlzdG9yeSB9O1xyXG4gIH0pO1xyXG59XHJcbiJdfQ==