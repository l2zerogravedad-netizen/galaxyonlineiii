"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.researchRoutes = researchRoutes;
const database_1 = require("@galaxy/database");
async function researchRoutes(app) {
    // Auth middleware
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
    // GET /api/research - List all technologies for empire
    app.get('/', async (request) => {
        const { empireId } = request.user;
        // Get empire technologies with their details
        const empireTechs = await database_1.prisma.empireTechnology.findMany({
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
        const allTechnologies = await database_1.prisma.technology.findMany({
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
                requiredTechId: tech.requiredTechId,
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
        const { empireId } = request.user;
        const { technologyId } = request.params;
        try {
            // Get technology details
            const technology = await database_1.prisma.technology.findUnique({
                where: { id: technologyId },
            });
            if (!technology) {
                return reply.status(404).send({ error: 'Technology not found' });
            }
            // Check if there's already an active research
            const activeResearch = await database_1.prisma.empireTechnology.findFirst({
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
            let empireTech = await database_1.prisma.empireTechnology.findFirst({
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
                const prereq = await database_1.prisma.empireTechnology.findFirst({
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
            // DEV: Fast timers for development testing (never enabled by default)
            const timeMultiplier = process.env.DEV_FAST_TIMERS === 'true' ? 0.1 : 1;
            const researchTime = technology.baseResearchTime * costMultiplier * timeMultiplier;
            // Check resources
            const resources = await database_1.prisma.resource.findMany({
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
            await database_1.prisma.$transaction(async (tx) => {
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
                }
                else {
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
        }
        catch (error) {
            console.error('Research start error:', error);
            return reply.status(500).send({ error: 'Failed to start research' });
        }
    });
    // POST /api/research/sync - Complete research and update levels
    app.post('/sync', async (request, reply) => {
        const { empireId } = request.user;
        try {
            // Find completed research
            const now = new Date();
            const completedResearches = await database_1.prisma.empireTechnology.findMany({
                where: {
                    empireId,
                    status: 'RESEARCHING',
                    researchEndsAt: { lte: now },
                },
            });
            // Complete each research
            for (const research of completedResearches) {
                await database_1.prisma.empireTechnology.update({
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
        }
        catch (error) {
            console.error('Research sync error:', error);
            return reply.status(500).send({ error: 'Failed to sync research' });
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZWFyY2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL3Jlc2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esd0NBb1JDO0FBdFJELCtDQUEwQztBQUVuQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQW9CO0lBQ3ZELGtCQUFrQjtJQUNsQixHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2hELElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCx1REFBdUQ7SUFDdkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBNEIsQ0FBQztRQUUxRCw2Q0FBNkM7UUFDN0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxpQkFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztZQUN6RCxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUU7WUFDbkIsT0FBTyxFQUFFO2dCQUNQLFVBQVUsRUFBRTtvQkFDVixPQUFPLEVBQUU7d0JBQ1AsWUFBWSxFQUFFLElBQUk7cUJBQ25CO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFDN0MsTUFBTSxlQUFlLEdBQUcsTUFBTSxpQkFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDdkQsT0FBTyxFQUFFO2dCQUNQLFlBQVksRUFBRSxJQUFJO2FB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QyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmFzdGlmeUluc3RhbmNlIH0gZnJvbSAnZmFzdGlmeSc7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAZ2FsYXh5L2RhdGFiYXNlJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc2VhcmNoUm91dGVzKGFwcDogRmFzdGlmeUluc3RhbmNlKSB7XG4gIC8vIEF1dGggbWlkZGxld2FyZVxuICBhcHAuYWRkSG9vaygnb25SZXF1ZXN0JywgYXN5bmMgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJlcXVlc3Quand0VmVyaWZ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXBseS5jb2RlKDQwMSkuc2VuZCh7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEdFVCAvYXBpL3Jlc2VhcmNoIC0gTGlzdCBhbGwgdGVjaG5vbG9naWVzIGZvciBlbXBpcmVcbiAgYXBwLmdldCgnLycsIGFzeW5jIChyZXF1ZXN0KSA9PiB7XG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xuXG4gICAgLy8gR2V0IGVtcGlyZSB0ZWNobm9sb2dpZXMgd2l0aCB0aGVpciBkZXRhaWxzXG4gICAgY29uc3QgZW1waXJlVGVjaHMgPSBhd2FpdCBwcmlzbWEuZW1waXJlVGVjaG5vbG9neS5maW5kTWFueSh7XG4gICAgICB3aGVyZTogeyBlbXBpcmVJZCB9LFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICB0ZWNobm9sb2d5OiB7XG4gICAgICAgICAgaW5jbHVkZToge1xuICAgICAgICAgICAgcmVxdWlyZWRUZWNoOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gR2V0IGFsbCB0ZWNobm9sb2dpZXMgdG8gZmluZCB1bmxvY2tlZCBvbmVzXG4gICAgY29uc3QgYWxsVGVjaG5vbG9naWVzID0gYXdhaXQgcHJpc21hLnRlY2hub2xvZ3kuZmluZE1hbnkoe1xuICAgICAgaW5jbHVkZToge1xuICAgICAgICByZXF1aXJlZFRlY2g6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gRm9ybWF0IHJlc3BvbnNlIHdpdGggY2FsY3VsYXRlZCBjb3N0cyBhbmQgc3RhdHVzXG4gICAgY29uc3QgZm9ybWF0dGVkVGVjaHMgPSBhbGxUZWNobm9sb2dpZXMubWFwKCh0ZWNoKSA9PiB7XG4gICAgICBjb25zdCBlbXBpcmVUZWNoID0gZW1waXJlVGVjaHMuZmluZCgoZXQpID0+IGV0LnRlY2hub2xvZ3lJZCA9PT0gdGVjaC5pZCk7XG4gICAgICBjb25zdCBjdXJyZW50TGV2ZWwgPSBlbXBpcmVUZWNoPy5sZXZlbCB8fCAwO1xuICAgICAgY29uc3Qgc3RhdHVzID0gZW1waXJlVGVjaD8uc3RhdHVzIHx8ICdMT0NLRUQnO1xuICAgICAgY29uc3QgaXNSZXNlYXJjaGluZyA9IHN0YXR1cyA9PT0gJ1JFU0VBUkNISU5HJztcblxuICAgICAgLy8gQ2hlY2sgaWYgcHJlcmVxdWlzaXRlcyBhcmUgbWV0XG4gICAgICBsZXQgcHJlcmVxdWlzaXRlTWV0ID0gdHJ1ZTtcbiAgICAgIGxldCBwcmVyZXF1aXNpdGVOYW1lID0gbnVsbDtcbiAgICAgIGlmICh0ZWNoLnJlcXVpcmVkVGVjaElkKSB7XG4gICAgICAgIGNvbnN0IHByZXJlcVRlY2ggPSBlbXBpcmVUZWNocy5maW5kKChldCkgPT4gZXQudGVjaG5vbG9neUlkID09PSB0ZWNoLnJlcXVpcmVkVGVjaElkKTtcbiAgICAgICAgaWYgKCFwcmVyZXFUZWNoIHx8IHByZXJlcVRlY2gubGV2ZWwgPT09IDApIHtcbiAgICAgICAgICBwcmVyZXF1aXNpdGVNZXQgPSBmYWxzZTtcbiAgICAgICAgICBwcmVyZXF1aXNpdGVOYW1lID0gdGVjaC5yZXF1aXJlZFRlY2g/Lm5hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ2FsY3VsYXRlIGNvc3RzIGZvciBuZXh0IGxldmVsXG4gICAgICBjb25zdCBuZXh0TGV2ZWwgPSBjdXJyZW50TGV2ZWwgKyAxO1xuICAgICAgY29uc3QgY29zdE11bHRpcGxpZXIgPSBuZXh0TGV2ZWw7XG4gICAgICBjb25zdCBjb3N0TWV0YWwgPSB0ZWNoLmJhc2VDb3N0TWV0YWwgKiBjb3N0TXVsdGlwbGllcjtcbiAgICAgIGNvbnN0IGNvc3RQbGFzbWEgPSB0ZWNoLmJhc2VDb3N0UGxhc21hICogY29zdE11bHRpcGxpZXI7XG4gICAgICBjb25zdCByZXNlYXJjaFRpbWUgPSB0ZWNoLmJhc2VSZXNlYXJjaFRpbWUgKiBjb3N0TXVsdGlwbGllcjtcblxuICAgICAgLy8gQ2FsY3VsYXRlIHJlbWFpbmluZyB0aW1lIGlmIHJlc2VhcmNoaW5nXG4gICAgICBsZXQgdGltZVJlbWFpbmluZyA9IDA7XG4gICAgICBsZXQgcHJvZ3Jlc3MgPSAwO1xuICAgICAgaWYgKGlzUmVzZWFyY2hpbmcgJiYgZW1waXJlVGVjaD8ucmVzZWFyY2hTdGFydGVkQXQgJiYgZW1waXJlVGVjaD8ucmVzZWFyY2hFbmRzQXQpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gbmV3IERhdGUoZW1waXJlVGVjaC5yZXNlYXJjaFN0YXJ0ZWRBdCkuZ2V0VGltZSgpO1xuICAgICAgICBjb25zdCBlbmQgPSBuZXcgRGF0ZShlbXBpcmVUZWNoLnJlc2VhcmNoRW5kc0F0KS5nZXRUaW1lKCk7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gZW5kIC0gc3RhcnQ7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBub3cgLSBzdGFydDtcbiAgICAgICAgdGltZVJlbWFpbmluZyA9IE1hdGgubWF4KDAsIGVuZCAtIG5vdyk7XG4gICAgICAgIHByb2dyZXNzID0gTWF0aC5taW4oMTAwLCAoZWxhcHNlZCAvIHRvdGFsKSAqIDEwMCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiB0ZWNoLmlkLFxuICAgICAgICBrZXk6IHRlY2gua2V5LFxuICAgICAgICBuYW1lOiB0ZWNoLm5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiB0ZWNoLmRlc2NyaXB0aW9uLFxuICAgICAgICBjYXRlZ29yeTogdGVjaC5jYXRlZ29yeSxcbiAgICAgICAgY3VycmVudExldmVsLFxuICAgICAgICBtYXhMZXZlbDogdGVjaC5tYXhMZXZlbCxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICBpc01heExldmVsOiBjdXJyZW50TGV2ZWwgPj0gdGVjaC5tYXhMZXZlbCxcbiAgICAgICAgcHJlcmVxdWlzaXRlTWV0LFxuICAgICAgICBwcmVyZXF1aXNpdGVOYW1lLFxuICAgICAgICByZXF1aXJlZFRlY2hJZDogdGVjaC5yZXF1aXJlZFRlY2hJZCxcbiAgICAgICAgY29zdHM6IHtcbiAgICAgICAgICBtZXRhbDogY29zdE1ldGFsLFxuICAgICAgICAgIHBsYXNtYTogY29zdFBsYXNtYSxcbiAgICAgICAgICB0aW1lOiByZXNlYXJjaFRpbWUsXG4gICAgICAgIH0sXG4gICAgICAgIGVmZmVjdHM6IHtcbiAgICAgICAgICB0eXBlOiB0ZWNoLmVmZmVjdFR5cGUsXG4gICAgICAgICAgdmFsdWU6IHRlY2guZWZmZWN0VmFsdWUsXG4gICAgICAgICAgZGVzY3JpcHRpb246IHRlY2guZWZmZWN0RGVzY3JpcHRpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHJlc2VhcmNoU3RhdHVzOiBpc1Jlc2VhcmNoaW5nXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIHRpbWVSZW1haW5pbmcsXG4gICAgICAgICAgICAgIHByb2dyZXNzLFxuICAgICAgICAgICAgICBlbmRzQXQ6IGVtcGlyZVRlY2g/LnJlc2VhcmNoRW5kc0F0LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbCxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4geyB0ZWNobm9sb2dpZXM6IGZvcm1hdHRlZFRlY2hzIH07XG4gIH0pO1xuXG4gIC8vIFBPU1QgL2FwaS9yZXNlYXJjaC86dGVjaG5vbG9neUlkL3N0YXJ0IC0gU3RhcnQgcmVzZWFyY2hpbmcgYSB0ZWNobm9sb2d5XG4gIGFwcC5wb3N0KCcvOnRlY2hub2xvZ3lJZC9zdGFydCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcbiAgICBjb25zdCB7IHRlY2hub2xvZ3lJZCB9ID0gcmVxdWVzdC5wYXJhbXMgYXMgeyB0ZWNobm9sb2d5SWQ6IHN0cmluZyB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEdldCB0ZWNobm9sb2d5IGRldGFpbHNcbiAgICAgIGNvbnN0IHRlY2hub2xvZ3kgPSBhd2FpdCBwcmlzbWEudGVjaG5vbG9neS5maW5kVW5pcXVlKHtcbiAgICAgICAgd2hlcmU6IHsgaWQ6IHRlY2hub2xvZ3lJZCB9LFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghdGVjaG5vbG9neSkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwNCkuc2VuZCh7IGVycm9yOiAnVGVjaG5vbG9neSBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGFscmVhZHkgYW4gYWN0aXZlIHJlc2VhcmNoXG4gICAgICBjb25zdCBhY3RpdmVSZXNlYXJjaCA9IGF3YWl0IHByaXNtYS5lbXBpcmVUZWNobm9sb2d5LmZpbmRGaXJzdCh7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgc3RhdHVzOiAnUkVTRUFSQ0hJTkcnLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChhY3RpdmVSZXNlYXJjaCkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7XG4gICAgICAgICAgZXJyb3I6ICdBbHJlYWR5IHJlc2VhcmNoaW5nIGFub3RoZXIgdGVjaG5vbG9neScsXG4gICAgICAgICAgYWN0aXZlUmVzZWFyY2hJZDogYWN0aXZlUmVzZWFyY2gudGVjaG5vbG9neUlkLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IG9yIGNyZWF0ZSBlbXBpcmUgdGVjaG5vbG9neVxuICAgICAgbGV0IGVtcGlyZVRlY2ggPSBhd2FpdCBwcmlzbWEuZW1waXJlVGVjaG5vbG9neS5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBlbXBpcmVJZCwgdGVjaG5vbG9neUlkIH0sXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY3VycmVudExldmVsID0gZW1waXJlVGVjaD8ubGV2ZWwgfHwgMDtcbiAgICAgIGNvbnN0IG5leHRMZXZlbCA9IGN1cnJlbnRMZXZlbCArIDE7XG5cbiAgICAgIC8vIENoZWNrIG1heCBsZXZlbFxuICAgICAgaWYgKGN1cnJlbnRMZXZlbCA+PSB0ZWNobm9sb2d5Lm1heExldmVsKSB7XG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdUZWNobm9sb2d5IGFscmVhZHkgYXQgbWF4IGxldmVsJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgcHJlcmVxdWlzaXRlc1xuICAgICAgaWYgKHRlY2hub2xvZ3kucmVxdWlyZWRUZWNoSWQpIHtcbiAgICAgICAgY29uc3QgcHJlcmVxID0gYXdhaXQgcHJpc21hLmVtcGlyZVRlY2hub2xvZ3kuZmluZEZpcnN0KHtcbiAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgICB0ZWNobm9sb2d5SWQ6IHRlY2hub2xvZ3kucmVxdWlyZWRUZWNoSWQsXG4gICAgICAgICAgICBsZXZlbDogeyBndDogMCB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByZXJlcSkge1xuICAgICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdQcmVyZXF1aXNpdGVzIG5vdCBtZXQnIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBjb3N0c1xuICAgICAgY29uc3QgY29zdE11bHRpcGxpZXIgPSBuZXh0TGV2ZWw7XG4gICAgICBjb25zdCBjb3N0TWV0YWwgPSB0ZWNobm9sb2d5LmJhc2VDb3N0TWV0YWwgKiBjb3N0TXVsdGlwbGllcjtcbiAgICAgIGNvbnN0IGNvc3RQbGFzbWEgPSB0ZWNobm9sb2d5LmJhc2VDb3N0UGxhc21hICogY29zdE11bHRpcGxpZXI7XG4gICAgICAvLyBERVY6IEZhc3QgdGltZXJzIGZvciBkZXZlbG9wbWVudCB0ZXN0aW5nIChuZXZlciBlbmFibGVkIGJ5IGRlZmF1bHQpXG4gICAgICBjb25zdCB0aW1lTXVsdGlwbGllciA9IHByb2Nlc3MuZW52LkRFVl9GQVNUX1RJTUVSUyA9PT0gJ3RydWUnID8gMC4xIDogMTtcbiAgICAgIGNvbnN0IHJlc2VhcmNoVGltZSA9IHRlY2hub2xvZ3kuYmFzZVJlc2VhcmNoVGltZSAqIGNvc3RNdWx0aXBsaWVyICogdGltZU11bHRpcGxpZXI7XG5cbiAgICAgIC8vIENoZWNrIHJlc291cmNlc1xuICAgICAgY29uc3QgcmVzb3VyY2VzID0gYXdhaXQgcHJpc21hLnJlc291cmNlLmZpbmRNYW55KHtcbiAgICAgICAgd2hlcmU6IHsgZW1waXJlSWQgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBtZXRhbCA9IHJlc291cmNlcy5maW5kKChyKSA9PiByLnR5cGUgPT09ICdNRVRBTCcpO1xuICAgICAgY29uc3QgcGxhc21hID0gcmVzb3VyY2VzLmZpbmQoKHIpID0+IHIudHlwZSA9PT0gJ1BMQVNNQScpO1xuXG4gICAgICBpZiAoIW1ldGFsIHx8IG1ldGFsLmFtb3VudCA8IGNvc3RNZXRhbCkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7IGVycm9yOiAnSW5zdWZmaWNpZW50IG1ldGFsJyB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghcGxhc21hIHx8IHBsYXNtYS5hbW91bnQgPCBjb3N0UGxhc21hKSB7XG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGxhc21hJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRGVkdWN0IHJlc291cmNlcyBhbmQgc3RhcnQgcmVzZWFyY2hcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBlbmRzQXQgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgcmVzZWFyY2hUaW1lICogMTAwMCk7XG5cbiAgICAgIGF3YWl0IHByaXNtYS4kdHJhbnNhY3Rpb24oYXN5bmMgKHR4KSA9PiB7XG4gICAgICAgIC8vIERlZHVjdCByZXNvdXJjZXNcbiAgICAgICAgYXdhaXQgdHgucmVzb3VyY2UudXBkYXRlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogbWV0YWwuaWQgfSxcbiAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBkZWNyZW1lbnQ6IGNvc3RNZXRhbCB9IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGF3YWl0IHR4LnJlc291cmNlLnVwZGF0ZSh7XG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IHBsYXNtYS5pZCB9LFxuICAgICAgICAgIGRhdGE6IHsgYW1vdW50OiB7IGRlY3JlbWVudDogY29zdFBsYXNtYSB9IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBvciB1cGRhdGUgZW1waXJlIHRlY2hub2xvZ3lcbiAgICAgICAgaWYgKGVtcGlyZVRlY2gpIHtcbiAgICAgICAgICBhd2FpdCB0eC5lbXBpcmVUZWNobm9sb2d5LnVwZGF0ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBpZDogZW1waXJlVGVjaC5pZCB9LFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBzdGF0dXM6ICdSRVNFQVJDSElORycsXG4gICAgICAgICAgICAgIHJlc2VhcmNoU3RhcnRlZEF0OiBub3csXG4gICAgICAgICAgICAgIHJlc2VhcmNoRW5kc0F0OiBlbmRzQXQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF3YWl0IHR4LmVtcGlyZVRlY2hub2xvZ3kuY3JlYXRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgICAgIHRlY2hub2xvZ3lJZCxcbiAgICAgICAgICAgICAgc3RhdHVzOiAnUkVTRUFSQ0hJTkcnLFxuICAgICAgICAgICAgICByZXNlYXJjaFN0YXJ0ZWRBdDogbm93LFxuICAgICAgICAgICAgICByZXNlYXJjaEVuZHNBdDogZW5kc0F0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIG1lc3NhZ2U6ICdSZXNlYXJjaCBzdGFydGVkJyxcbiAgICAgICAgZW5kc0F0LFxuICAgICAgICByZXNlYXJjaFRpbWUsXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSZXNlYXJjaCBzdGFydCBlcnJvcjonLCBlcnJvcik7XG4gICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDUwMCkuc2VuZCh7IGVycm9yOiAnRmFpbGVkIHRvIHN0YXJ0IHJlc2VhcmNoJyB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFBPU1QgL2FwaS9yZXNlYXJjaC9zeW5jIC0gQ29tcGxldGUgcmVzZWFyY2ggYW5kIHVwZGF0ZSBsZXZlbHNcbiAgYXBwLnBvc3QoJy9zeW5jJywgYXN5bmMgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEZpbmQgY29tcGxldGVkIHJlc2VhcmNoXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgY29tcGxldGVkUmVzZWFyY2hlcyA9IGF3YWl0IHByaXNtYS5lbXBpcmVUZWNobm9sb2d5LmZpbmRNYW55KHtcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICBlbXBpcmVJZCxcbiAgICAgICAgICBzdGF0dXM6ICdSRVNFQVJDSElORycsXG4gICAgICAgICAgcmVzZWFyY2hFbmRzQXQ6IHsgbHRlOiBub3cgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb21wbGV0ZSBlYWNoIHJlc2VhcmNoXG4gICAgICBmb3IgKGNvbnN0IHJlc2VhcmNoIG9mIGNvbXBsZXRlZFJlc2VhcmNoZXMpIHtcbiAgICAgICAgYXdhaXQgcHJpc21hLmVtcGlyZVRlY2hub2xvZ3kudXBkYXRlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogcmVzZWFyY2guaWQgfSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBzdGF0dXM6ICdDT01QTEVURUQnLFxuICAgICAgICAgICAgbGV2ZWw6IHsgaW5jcmVtZW50OiAxIH0sXG4gICAgICAgICAgICByZXNlYXJjaFN0YXJ0ZWRBdDogbnVsbCxcbiAgICAgICAgICAgIHJlc2VhcmNoRW5kc0F0OiBudWxsLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBjb21wbGV0ZWRDb3VudDogY29tcGxldGVkUmVzZWFyY2hlcy5sZW5ndGgsXG4gICAgICAgIGNvbXBsZXRlZElkczogY29tcGxldGVkUmVzZWFyY2hlcy5tYXAoKHIpID0+IHIudGVjaG5vbG9neUlkKSxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Jlc2VhcmNoIHN5bmMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg1MDApLnNlbmQoeyBlcnJvcjogJ0ZhaWxlZCB0byBzeW5jIHJlc2VhcmNoJyB9KTtcbiAgICB9XG4gIH0pO1xufVxuIl19