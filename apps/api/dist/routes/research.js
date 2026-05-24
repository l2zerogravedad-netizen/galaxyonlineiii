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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZWFyY2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL3Jlc2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esd0NBbVJDO0FBclJELCtDQUEwQztBQUVuQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQW9CO0lBQ3ZELGtCQUFrQjtJQUNsQixHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2hELElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCx1REFBdUQ7SUFDdkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBNEIsQ0FBQztRQUUxRCw2Q0FBNkM7UUFDN0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxpQkFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztZQUN6RCxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUU7WUFDbkIsT0FBTyxFQUFFO2dCQUNQLFVBQVUsRUFBRTtvQkFDVixPQUFPLEVBQUU7d0JBQ1AsWUFBWSxFQUFFLElBQUk7cUJBQ25CO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFDN0MsTUFBTSxlQUFlLEdBQUcsTUFBTSxpQkFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDdkQsT0FBTyxFQUFFO2dCQUNQLFlBQVksRUFBRSxJQUFJO2FB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b250ZW50IjpbImltcG9ydCB7IEZhc3RpZnlJbnN0YW5jZSB9IGZyb20gJ2Zhc3RpZnknO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQGdhbGF4eS9kYXRhYmFzZSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXNlYXJjaFJvdXRlcyhhcHA6IEZhc3RpZnlJbnN0YW5jZSkge1xuICAvLyBBdXRoIG1pZGRsZXdhcmVcbiAgYXBwLmFkZEhvb2soJ29uUmVxdWVzdCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCByZXF1ZXN0Lmp3dFZlcmlmeSgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmVwbHkuY29kZSg0MDEpLnNlbmQoeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBHRVQgL2FwaS9yZXNlYXJjaCAtIExpc3QgYWxsIHRlY2hub2xvZ2llcyBmb3IgZW1waXJlXG4gIGFwcC5nZXQoJy8nLCBhc3luYyAocmVxdWVzdCkgPT4ge1xuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcblxuICAgIC8vIEdldCBlbXBpcmUgdGVjaG5vbG9naWVzIHdpdGggdGhlaXIgZGV0YWlsc1xuICAgIGNvbnN0IGVtcGlyZVRlY2hzID0gYXdhaXQgcHJpc21hLmVtcGlyZVRlY2hub2xvZ3kuZmluZE1hbnkoe1xuICAgICAgd2hlcmU6IHsgZW1waXJlSWQgfSxcbiAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgdGVjaG5vbG9neToge1xuICAgICAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgICAgIHJlcXVpcmVkVGVjaDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEdldCBhbGwgdGVjaG5vbG9naWVzIHRvIGZpbmQgdW5sb2NrZWQgb25lc1xuICAgIGNvbnN0IGFsbFRlY2hub2xvZ2llcyA9IGF3YWl0IHByaXNtYS50ZWNobm9sb2d5LmZpbmRNYW55KHtcbiAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgcmVxdWlyZWRUZWNoOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEZvcm1hdCByZXNwb25zZSB3aXRoIGNhbGN1bGF0ZWQgY29zdHMgYW5kIHN0YXR1c1xuICAgIGNvbnN0IGZvcm1hdHRlZFRlY2hzID0gYWxsVGVjaG5vbG9naWVzLm1hcCgodGVjaCkgPT4ge1xuICAgICAgY29uc3QgZW1waXJlVGVjaCA9IGVtcGlyZVRlY2hzLmZpbmQoKGV0KSA9PiBldC50ZWNobm9sb2d5SWQgPT09IHRlY2guaWQpO1xuICAgICAgY29uc3QgY3VycmVudExldmVsID0gZW1waXJlVGVjaD8ubGV2ZWwgfHwgMDtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGVtcGlyZVRlY2g/LnN0YXR1cyB8fCAnTE9DS0VEJztcbiAgICAgIGNvbnN0IGlzUmVzZWFyY2hpbmcgPSBzdGF0dXMgPT09ICdSRVNFQVJDSElORyc7XG5cbiAgICAgIC8vIENoZWNrIGlmIHByZXJlcXVpc2l0ZXMgYXJlIG1ldFxuICAgICAgbGV0IHByZXJlcXVpc2l0ZU1ldCA9IHRydWU7XG4gICAgICBsZXQgcHJlcmVxdWlzaXRlTmFtZSA9IG51bGw7XG4gICAgICBpZiAodGVjaC5yZXF1aXJlZFRlY2hJZCkge1xuICAgICAgICBjb25zdCBwcmVyZXFUZWNoID0gZW1waXJlVGVjaHMuZmluZCgoZXQpID0+IGV0LnRlY2hub2xvZ3lJZCA9PT0gdGVjaC5yZXF1aXJlZFRlY2hJZCk7XG4gICAgICAgIGlmICghcHJlcmVxVGVjaCB8fCBwcmVyZXFUZWNoLmxldmVsID09PSAwKSB7XG4gICAgICAgICAgcHJlcmVxdWlzaXRlTWV0ID0gZmFsc2U7XG4gICAgICAgICAgcHJlcmVxdWlzaXRlTmFtZSA9IHRlY2gucmVxdWlyZWRUZWNoPy5uYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBjb3N0cyBmb3IgbmV4dCBsZXZlbFxuICAgICAgY29uc3QgbmV4dExldmVsID0gY3VycmVudExldmVsICsgMTtcbiAgICAgIGNvbnN0IGNvc3RNdWx0aXBsaWVyID0gbmV4dExldmVsO1xuICAgICAgY29uc3QgY29zdE1ldGFsID0gdGVjaC5iYXNlQ29zdE1ldGFsICogY29zdE11bHRpcGxpZXI7XG4gICAgICBjb25zdCBjb3N0UGxhc21hID0gdGVjaC5iYXNlQ29zdFBsYXNtYSAqIGNvc3RNdWx0aXBsaWVyO1xuICAgICAgY29uc3QgcmVzZWFyY2hUaW1lID0gdGVjaC5iYXNlUmVzZWFyY2hUaW1lICogY29zdE11bHRpcGxpZXI7XG5cbiAgICAgIC8vIENhbGN1bGF0ZSByZW1haW5pbmcgdGltZSBpZiByZXNlYXJjaGluZ1xuICAgICAgbGV0IHRpbWVSZW1haW5pbmcgPSAwO1xuICAgICAgbGV0IHByb2dyZXNzID0gMDtcbiAgICAgIGlmIChpc1Jlc2VhcmNoaW5nICYmIGVtcGlyZVRlY2g/LnJlc2VhcmNoU3RhcnRlZEF0ICYmIGVtcGlyZVRlY2g/LnJlc2VhcmNoRW5kc0F0KSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBjb25zdCBzdGFydCA9IG5ldyBEYXRlKGVtcGlyZVRlY2gucmVzZWFyY2hTdGFydGVkQXQpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3QgZW5kID0gbmV3IERhdGUoZW1waXJlVGVjaC5yZXNlYXJjaEVuZHNBdCkuZ2V0VGltZSgpO1xuICAgICAgICBjb25zdCB0b3RhbCA9IGVuZCAtIHN0YXJ0O1xuICAgICAgICBjb25zdCBlbGFwc2VkID0gbm93IC0gc3RhcnQ7XG4gICAgICAgIHRpbWVSZW1haW5pbmcgPSBNYXRoLm1heCgwLCBlbmQgLSBub3cpO1xuICAgICAgICBwcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgKGVsYXBzZWQgLyB0b3RhbCkgKiAxMDApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGVjaC5pZCxcbiAgICAgICAga2V5OiB0ZWNoLmtleSxcbiAgICAgICAgbmFtZTogdGVjaC5uYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbjogdGVjaC5kZXNjcmlwdGlvbixcbiAgICAgICAgY2F0ZWdvcnk6IHRlY2guY2F0ZWdvcnksXG4gICAgICAgIGN1cnJlbnRMZXZlbCxcbiAgICAgICAgbWF4TGV2ZWw6IHRlY2gubWF4TGV2ZWwsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgaXNNYXhMZXZlbDogY3VycmVudExldmVsID49IHRlY2gubWF4TGV2ZWwsXG4gICAgICAgIHByZXJlcXVpc2l0ZU1ldCxcbiAgICAgICAgcHJlcmVxdWlzaXRlTmFtZSxcbiAgICAgICAgY29zdHM6IHtcbiAgICAgICAgICBtZXRhbDogY29zdE1ldGFsLFxuICAgICAgICAgIHBsYXNtYTogY29zdFBsYXNtYSxcbiAgICAgICAgICB0aW1lOiByZXNlYXJjaFRpbWUsXG4gICAgICAgIH0sXG4gICAgICAgIGVmZmVjdHM6IHtcbiAgICAgICAgICB0eXBlOiB0ZWNoLmVmZmVjdFR5cGUsXG4gICAgICAgICAgdmFsdWU6IHRlY2guZWZmZWN0VmFsdWUsXG4gICAgICAgICAgZGVzY3JpcHRpb246IHRlY2guZWZmZWN0RGVzY3JpcHRpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHJlc2VhcmNoU3RhdHVzOiBpc1Jlc2VhcmNoaW5nXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIHRpbWVSZW1haW5pbmcsXG4gICAgICAgICAgICAgIHByb2dyZXNzLFxuICAgICAgICAgICAgICBlbmRzQXQ6IGVtcGlyZVRlY2g/LnJlc2VhcmNoRW5kc0F0LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbCxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4geyB0ZWNobm9sb2dpZXM6IGZvcm1hdHRlZFRlY2hzIH07XG4gIH0pO1xuXG4gIC8vIFBPU1QgL2FwaS9yZXNlYXJjaC86dGVjaG5vbG9neUlkL3N0YXJ0IC0gU3RhcnQgcmVzZWFyY2hpbmcgYSB0ZWNobm9sb2d5XG4gIGFwcC5wb3N0KCcvOnRlY2hub2xvZ3lJZC9zdGFydCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcbiAgICBjb25zdCB7IHRlY2hub2xvZ3lJZCB9ID0gcmVxdWVzdC5wYXJhbXMgYXMgeyB0ZWNobm9sb2d5SWQ6IHN0cmluZyB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEdldCB0ZWNobm9sb2d5IGRldGFpbHNcbiAgICAgIGNvbnN0IHRlY2hub2xvZ3kgPSBhd2FpdCBwcmlzbWEudGVjaG5vbG9neS5maW5kVW5pcXVlKHtcbiAgICAgICAgd2hlcmU6IHsgaWQ6IHRlY2hub2xvZ3lJZCB9LFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghdGVjaG5vbG9neSkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwNCkuc2VuZCh7IGVycm9yOiAnVGVjaG5vbG9neSBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGFscmVhZHkgYW4gYWN0aXZlIHJlc2VhcmNoXG4gICAgICBjb25zdCBhY3RpdmVSZXNlYXJjaCA9IGF3YWl0IHByaXNtYS5lbXBpcmVUZWNobm9sb2d5LmZpbmRGaXJzdCh7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgc3RhdHVzOiAnUkVTRUFSQ0hJTkcnLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChhY3RpdmVSZXNlYXJjaCkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7XG4gICAgICAgICAgZXJyb3I6ICdBbHJlYWR5IHJlc2VhcmNoaW5nIGFub3RoZXIgdGVjaG5vbG9neScsXG4gICAgICAgICAgYWN0aXZlUmVzZWFyY2hJZDogYWN0aXZlUmVzZWFyY2gudGVjaG5vbG9neUlkLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IG9yIGNyZWF0ZSBlbXBpcmUgdGVjaG5vbG9neVxuICAgICAgbGV0IGVtcGlyZVRlY2ggPSBhd2FpdCBwcmlzbWEuZW1waXJlVGVjaG5vbG9neS5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBlbXBpcmVJZCwgdGVjaG5vbG9neUlkIH0sXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY3VycmVudExldmVsID0gZW1waXJlVGVjaD8ubGV2ZWwgfHwgMDtcbiAgICAgIGNvbnN0IG5leHRMZXZlbCA9IGN1cnJlbnRMZXZlbCArIDE7XG5cbiAgICAgIC8vIENoZWNrIG1heCBsZXZlbFxuICAgICAgaWYgKGN1cnJlbnRMZXZlbCA+PSB0ZWNobm9sb2d5Lm1heExldmVsKSB7XG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdUZWNobm9sb2d5IGFscmVhZHkgYXQgbWF4IGxldmVsJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgcHJlcmVxdWlzaXRlc1xuICAgICAgaWYgKHRlY2hub2xvZ3kucmVxdWlyZWRUZWNoSWQpIHtcbiAgICAgICAgY29uc3QgcHJlcmVxID0gYXdhaXQgcHJpc21hLmVtcGlyZVRlY2hub2xvZ3kuZmluZEZpcnN0KHtcbiAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgICB0ZWNobm9sb2d5SWQ6IHRlY2hub2xvZ3kucmVxdWlyZWRUZWNoSWQsXG4gICAgICAgICAgICBsZXZlbDogeyBndDogMCB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByZXJlcSkge1xuICAgICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdQcmVyZXF1aXNpdGVzIG5vdCBtZXQnIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBjb3N0c1xuICAgICAgY29uc3QgY29zdE11bHRpcGxpZXIgPSBuZXh0TGV2ZWw7XG4gICAgICBjb25zdCBjb3N0TWV0YWwgPSB0ZWNobm9sb2d5LmJhc2VDb3N0TWV0YWwgKiBjb3N0TXVsdGlwbGllcjtcbiAgICAgIGNvbnN0IGNvc3RQbGFzbWEgPSB0ZWNobm9sb2d5LmJhc2VDb3N0UGxhc21hICogY29zdE11bHRpcGxpZXI7XG4gICAgICAvLyBERVY6IEZhc3QgdGltZXJzIGZvciBkZXZlbG9wbWVudCB0ZXN0aW5nIChuZXZlciBlbmFibGVkIGJ5IGRlZmF1bHQpXG4gICAgICBjb25zdCB0aW1lTXVsdGlwbGllciA9IHByb2Nlc3MuZW52LkRFVl9GQVNUX1RJTUVSUyA9PT0gJ3RydWUnID8gMC4xIDogMTtcbiAgICAgIGNvbnN0IHJlc2VhcmNoVGltZSA9IHRlY2hub2xvZ3kuYmFzZVJlc2VhcmNoVGltZSAqIGNvc3RNdWx0aXBsaWVyICogdGltZU11bHRpcGxpZXI7XG5cbiAgICAgIC8vIENoZWNrIHJlc291cmNlc1xuICAgICAgY29uc3QgcmVzb3VyY2VzID0gYXdhaXQgcHJpc21hLnJlc291cmNlLmZpbmRNYW55KHtcbiAgICAgICAgd2hlcmU6IHsgZW1waXJlSWQgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBtZXRhbCA9IHJlc291cmNlcy5maW5kKChyKSA9PiByLnR5cGUgPT09ICdNRVRBTCcpO1xuICAgICAgY29uc3QgcGxhc21hID0gcmVzb3VyY2VzLmZpbmQoKHIpID0+IHIudHlwZSA9PT0gJ1BMQVNNQScpO1xuXG4gICAgICBpZiAoIW1ldGFsIHx8IG1ldGFsLmFtb3VudCA8IGNvc3RNZXRhbCkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7IGVycm9yOiAnSW5zdWZmaWNpZW50IG1ldGFsJyB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghcGxhc21hIHx8IHBsYXNtYS5hbW91bnQgPCBjb3N0UGxhc21hKSB7XG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGxhc21hJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRGVkdWN0IHJlc291cmNlcyBhbmQgc3RhcnQgcmVzZWFyY2hcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBlbmRzQXQgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgcmVzZWFyY2hUaW1lICogMTAwMCk7XG5cbiAgICAgIGF3YWl0IHByaXNtYS4kdHJhbnNhY3Rpb24oYXN5bmMgKHR4KSA9PiB7XG4gICAgICAgIC8vIERlZHVjdCByZXNvdXJjZXNcbiAgICAgICAgYXdhaXQgdHgucmVzb3VyY2UudXBkYXRlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogbWV0YWwuaWQgfSxcbiAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBkZWNyZW1lbnQ6IGNvc3RNZXRhbCB9IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGF3YWl0IHR4LnJlc291cmNlLnVwZGF0ZSh7XG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IHBsYXNtYS5pZCB9LFxuICAgICAgICAgIGRhdGE6IHsgYW1vdW50OiB7IGRlY3JlbWVudDogY29zdFBsYXNtYSB9IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBvciB1cGRhdGUgZW1waXJlIHRlY2hub2xvZ3lcbiAgICAgICAgaWYgKGVtcGlyZVRlY2gpIHtcbiAgICAgICAgICBhd2FpdCB0eC5lbXBpcmVUZWNobm9sb2d5LnVwZGF0ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBpZDogZW1waXJlVGVjaC5pZCB9LFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBzdGF0dXM6ICdSRVNFQVJDSElORycsXG4gICAgICAgICAgICAgIHJlc2VhcmNoU3RhcnRlZEF0OiBub3csXG4gICAgICAgICAgICAgIHJlc2VhcmNoRW5kc0F0OiBlbmRzQXQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF3YWl0IHR4LmVtcGlyZVRlY2hub2xvZ3kuY3JlYXRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgICAgIHRlY2hub2xvZ3lJZCxcbiAgICAgICAgICAgICAgc3RhdHVzOiAnUkVTRUFSQ0hJTkcnLFxuICAgICAgICAgICAgICByZXNlYXJjaFN0YXJ0ZWRBdDogbm93LFxuICAgICAgICAgICAgICByZXNlYXJjaEVuZHNBdDogZW5kc0F0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIG1lc3NhZ2U6ICdSZXNlYXJjaCBzdGFydGVkJyxcbiAgICAgICAgZW5kc0F0LFxuICAgICAgICByZXNlYXJjaFRpbWUsXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSZXNlYXJjaCBzdGFydCBlcnJvcjonLCBlcnJvcik7XG4gICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDUwMCkuc2VuZCh7IGVycm9yOiAnRmFpbGVkIHRvIHN0YXJ0IHJlc2VhcmNoJyB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFBPU1QgL2FwaS9yZXNlYXJjaC9zeW5jIC0gQ29tcGxldGUgcmVzZWFyY2ggYW5kIHVwZGF0ZSBsZXZlbHNcbiAgYXBwLnBvc3QoJy9zeW5jJywgYXN5bmMgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEZpbmQgY29tcGxldGVkIHJlc2VhcmNoXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgY29tcGxldGVkUmVzZWFyY2hlcyA9IGF3YWl0IHByaXNtYS5lbXBpcmVUZWNobm9sb2d5LmZpbmRNYW55KHtcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICBlbXBpcmVJZCxcbiAgICAgICAgICBzdGF0dXM6ICdSRVNFQVJDSElORycsXG4gICAgICAgICAgcmVzZWFyY2hFbmRzQXQ6IHsgbHRlOiBub3cgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb21wbGV0ZSBlYWNoIHJlc2VhcmNoXG4gICAgICBmb3IgKGNvbnN0IHJlc2VhcmNoIG9mIGNvbXBsZXRlZFJlc2VhcmNoZXMpIHtcbiAgICAgICAgYXdhaXQgcHJpc21hLmVtcGlyZVRlY2hub2xvZ3kudXBkYXRlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogcmVzZWFyY2guaWQgfSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBzdGF0dXM6ICdDT01QTEVURUQnLFxuICAgICAgICAgICAgbGV2ZWw6IHsgaW5jcmVtZW50OiAxIH0sXG4gICAgICAgICAgICByZXNlYXJjaFN0YXJ0ZWRBdDogbnVsbCxcbiAgICAgICAgICAgIHJlc2VhcmNoRW5kc0F0OiBudWxsLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBjb21wbGV0ZWRDb3VudDogY29tcGxldGVkUmVzZWFyY2hlcy5sZW5ndGgsXG4gICAgICAgIGNvbXBsZXRlZElkczogY29tcGxldGVkUmVzZWFyY2hlcy5tYXAoKHIpID0+IHIudGVjaG5vbG9neUlkKSxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Jlc2VhcmNoIHN5bmMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg1MDApLnNlbmQoeyBlcnJvcjogJ0ZhaWxlZCB0byBzeW5jIHJlc2VhcmNoJyB9KTtcbiAgICB9XG4gIH0pO1xufVxuIl19