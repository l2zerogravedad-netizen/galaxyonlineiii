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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZWFyY2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL3Jlc2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esd0NBb1JDO0FBdFJELCtDQUEwQztBQUVuQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQW9CO0lBQ3ZELGtCQUFrQjtJQUNsQixHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2hELElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCx1REFBdUQ7SUFDdkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBNEIsQ0FBQztRQUUxRCw2Q0FBNkM7UUFDN0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxpQkFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztZQUN6RCxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUU7WUFDbkIsT0FBTyxFQUFFO2dCQUNQLFVBQVUsRUFBRTtvQkFDVixPQUFPLEVBQUU7d0JBQ1AsWUFBWSxFQUFFLElBQUk7cUJBQ25CO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFDN0MsTUFBTSxlQUFlLEdBQUcsTUFBTSxpQkFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDdkQsT0FBTyxFQUFFO2dCQUNQLFlBQVksRUFBRSxJQUFJO2FB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QyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmFzdGlmeUluc3RhbmNlIH0gZnJvbSAnZmFzdGlmeSc7XHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0BnYWxheHkvZGF0YWJhc2UnO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc2VhcmNoUm91dGVzKGFwcDogRmFzdGlmeUluc3RhbmNlKSB7XHJcbiAgLy8gQXV0aCBtaWRkbGV3YXJlXHJcbiAgYXBwLmFkZEhvb2soJ29uUmVxdWVzdCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgcmVxdWVzdC5qd3RWZXJpZnkoKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICByZXBseS5jb2RlKDQwMSkuc2VuZCh7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9KTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gR0VUIC9hcGkvcmVzZWFyY2ggLSBMaXN0IGFsbCB0ZWNobm9sb2dpZXMgZm9yIGVtcGlyZVxyXG4gIGFwcC5nZXQoJy8nLCBhc3luYyAocmVxdWVzdCkgPT4ge1xyXG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xyXG5cclxuICAgIC8vIEdldCBlbXBpcmUgdGVjaG5vbG9naWVzIHdpdGggdGhlaXIgZGV0YWlsc1xyXG4gICAgY29uc3QgZW1waXJlVGVjaHMgPSBhd2FpdCBwcmlzbWEuZW1waXJlVGVjaG5vbG9neS5maW5kTWFueSh7XHJcbiAgICAgIHdoZXJlOiB7IGVtcGlyZUlkIH0sXHJcbiAgICAgIGluY2x1ZGU6IHtcclxuICAgICAgICB0ZWNobm9sb2d5OiB7XHJcbiAgICAgICAgICBpbmNsdWRlOiB7XHJcbiAgICAgICAgICAgIHJlcXVpcmVkVGVjaDogdHJ1ZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdldCBhbGwgdGVjaG5vbG9naWVzIHRvIGZpbmQgdW5sb2NrZWQgb25lc1xyXG4gICAgY29uc3QgYWxsVGVjaG5vbG9naWVzID0gYXdhaXQgcHJpc21hLnRlY2hub2xvZ3kuZmluZE1hbnkoe1xyXG4gICAgICBpbmNsdWRlOiB7XHJcbiAgICAgICAgcmVxdWlyZWRUZWNoOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gRm9ybWF0IHJlc3BvbnNlIHdpdGggY2FsY3VsYXRlZCBjb3N0cyBhbmQgc3RhdHVzXHJcbiAgICBjb25zdCBmb3JtYXR0ZWRUZWNocyA9IGFsbFRlY2hub2xvZ2llcy5tYXAoKHRlY2gpID0+IHtcclxuICAgICAgY29uc3QgZW1waXJlVGVjaCA9IGVtcGlyZVRlY2hzLmZpbmQoKGV0KSA9PiBldC50ZWNobm9sb2d5SWQgPT09IHRlY2guaWQpO1xyXG4gICAgICBjb25zdCBjdXJyZW50TGV2ZWwgPSBlbXBpcmVUZWNoPy5sZXZlbCB8fCAwO1xyXG4gICAgICBjb25zdCBzdGF0dXMgPSBlbXBpcmVUZWNoPy5zdGF0dXMgfHwgJ0xPQ0tFRCc7XHJcbiAgICAgIGNvbnN0IGlzUmVzZWFyY2hpbmcgPSBzdGF0dXMgPT09ICdSRVNFQVJDSElORyc7XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBwcmVyZXF1aXNpdGVzIGFyZSBtZXRcclxuICAgICAgbGV0IHByZXJlcXVpc2l0ZU1ldCA9IHRydWU7XHJcbiAgICAgIGxldCBwcmVyZXF1aXNpdGVOYW1lID0gbnVsbDtcclxuICAgICAgaWYgKHRlY2gucmVxdWlyZWRUZWNoSWQpIHtcclxuICAgICAgICBjb25zdCBwcmVyZXFUZWNoID0gZW1waXJlVGVjaHMuZmluZCgoZXQpID0+IGV0LnRlY2hub2xvZ3lJZCA9PT0gdGVjaC5yZXF1aXJlZFRlY2hJZCk7XHJcbiAgICAgICAgaWYgKCFwcmVyZXFUZWNoIHx8IHByZXJlcVRlY2gubGV2ZWwgPT09IDApIHtcclxuICAgICAgICAgIHByZXJlcXVpc2l0ZU1ldCA9IGZhbHNlO1xyXG4gICAgICAgICAgcHJlcmVxdWlzaXRlTmFtZSA9IHRlY2gucmVxdWlyZWRUZWNoPy5uYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIGNvc3RzIGZvciBuZXh0IGxldmVsXHJcbiAgICAgIGNvbnN0IG5leHRMZXZlbCA9IGN1cnJlbnRMZXZlbCArIDE7XHJcbiAgICAgIGNvbnN0IGNvc3RNdWx0aXBsaWVyID0gbmV4dExldmVsO1xyXG4gICAgICBjb25zdCBjb3N0TWV0YWwgPSB0ZWNoLmJhc2VDb3N0TWV0YWwgKiBjb3N0TXVsdGlwbGllcjtcclxuICAgICAgY29uc3QgY29zdFBsYXNtYSA9IHRlY2guYmFzZUNvc3RQbGFzbWEgKiBjb3N0TXVsdGlwbGllcjtcclxuICAgICAgY29uc3QgcmVzZWFyY2hUaW1lID0gdGVjaC5iYXNlUmVzZWFyY2hUaW1lICogY29zdE11bHRpcGxpZXI7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgcmVtYWluaW5nIHRpbWUgaWYgcmVzZWFyY2hpbmdcclxuICAgICAgbGV0IHRpbWVSZW1haW5pbmcgPSAwO1xyXG4gICAgICBsZXQgcHJvZ3Jlc3MgPSAwO1xyXG4gICAgICBpZiAoaXNSZXNlYXJjaGluZyAmJiBlbXBpcmVUZWNoPy5yZXNlYXJjaFN0YXJ0ZWRBdCAmJiBlbXBpcmVUZWNoPy5yZXNlYXJjaEVuZHNBdCkge1xyXG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gbmV3IERhdGUoZW1waXJlVGVjaC5yZXNlYXJjaFN0YXJ0ZWRBdCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGVtcGlyZVRlY2gucmVzZWFyY2hFbmRzQXQpLmdldFRpbWUoKTtcclxuICAgICAgICBjb25zdCB0b3RhbCA9IGVuZCAtIHN0YXJ0O1xyXG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBub3cgLSBzdGFydDtcclxuICAgICAgICB0aW1lUmVtYWluaW5nID0gTWF0aC5tYXgoMCwgZW5kIC0gbm93KTtcclxuICAgICAgICBwcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgKGVsYXBzZWQgLyB0b3RhbCkgKiAxMDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkOiB0ZWNoLmlkLFxyXG4gICAgICAgIGtleTogdGVjaC5rZXksXHJcbiAgICAgICAgbmFtZTogdGVjaC5uYW1lLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiB0ZWNoLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgIGNhdGVnb3J5OiB0ZWNoLmNhdGVnb3J5LFxyXG4gICAgICAgIGN1cnJlbnRMZXZlbCxcclxuICAgICAgICBtYXhMZXZlbDogdGVjaC5tYXhMZXZlbCxcclxuICAgICAgICBzdGF0dXMsXHJcbiAgICAgICAgaXNNYXhMZXZlbDogY3VycmVudExldmVsID49IHRlY2gubWF4TGV2ZWwsXHJcbiAgICAgICAgcHJlcmVxdWlzaXRlTWV0LFxyXG4gICAgICAgIHByZXJlcXVpc2l0ZU5hbWUsXHJcbiAgICAgICAgcmVxdWlyZWRUZWNoSWQ6IHRlY2gucmVxdWlyZWRUZWNoSWQsXHJcbiAgICAgICAgY29zdHM6IHtcclxuICAgICAgICAgIG1ldGFsOiBjb3N0TWV0YWwsXHJcbiAgICAgICAgICBwbGFzbWE6IGNvc3RQbGFzbWEsXHJcbiAgICAgICAgICB0aW1lOiByZXNlYXJjaFRpbWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlZmZlY3RzOiB7XHJcbiAgICAgICAgICB0eXBlOiB0ZWNoLmVmZmVjdFR5cGUsXHJcbiAgICAgICAgICB2YWx1ZTogdGVjaC5lZmZlY3RWYWx1ZSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiB0ZWNoLmVmZmVjdERlc2NyaXB0aW9uLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzZWFyY2hTdGF0dXM6IGlzUmVzZWFyY2hpbmdcclxuICAgICAgICAgID8ge1xyXG4gICAgICAgICAgICAgIHRpbWVSZW1haW5pbmcsXHJcbiAgICAgICAgICAgICAgcHJvZ3Jlc3MsXHJcbiAgICAgICAgICAgICAgZW5kc0F0OiBlbXBpcmVUZWNoPy5yZXNlYXJjaEVuZHNBdCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgOiBudWxsLFxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHsgdGVjaG5vbG9naWVzOiBmb3JtYXR0ZWRUZWNocyB9O1xyXG4gIH0pO1xyXG5cclxuICAvLyBQT1NUIC9hcGkvcmVzZWFyY2gvOnRlY2hub2xvZ3lJZC9zdGFydCAtIFN0YXJ0IHJlc2VhcmNoaW5nIGEgdGVjaG5vbG9neVxyXG4gIGFwcC5wb3N0KCcvOnRlY2hub2xvZ3lJZC9zdGFydCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xyXG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xyXG4gICAgY29uc3QgeyB0ZWNobm9sb2d5SWQgfSA9IHJlcXVlc3QucGFyYW1zIGFzIHsgdGVjaG5vbG9neUlkOiBzdHJpbmcgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBHZXQgdGVjaG5vbG9neSBkZXRhaWxzXHJcbiAgICAgIGNvbnN0IHRlY2hub2xvZ3kgPSBhd2FpdCBwcmlzbWEudGVjaG5vbG9neS5maW5kVW5pcXVlKHtcclxuICAgICAgICB3aGVyZTogeyBpZDogdGVjaG5vbG9neUlkIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF0ZWNobm9sb2d5KSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDQpLnNlbmQoeyBlcnJvcjogJ1RlY2hub2xvZ3kgbm90IGZvdW5kJyB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBhbHJlYWR5IGFuIGFjdGl2ZSByZXNlYXJjaFxyXG4gICAgICBjb25zdCBhY3RpdmVSZXNlYXJjaCA9IGF3YWl0IHByaXNtYS5lbXBpcmVUZWNobm9sb2d5LmZpbmRGaXJzdCh7XHJcbiAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgIGVtcGlyZUlkLFxyXG4gICAgICAgICAgc3RhdHVzOiAnUkVTRUFSQ0hJTkcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGFjdGl2ZVJlc2VhcmNoKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoe1xyXG4gICAgICAgICAgZXJyb3I6ICdBbHJlYWR5IHJlc2VhcmNoaW5nIGFub3RoZXIgdGVjaG5vbG9neScsXHJcbiAgICAgICAgICBhY3RpdmVSZXNlYXJjaElkOiBhY3RpdmVSZXNlYXJjaC50ZWNobm9sb2d5SWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEdldCBvciBjcmVhdGUgZW1waXJlIHRlY2hub2xvZ3lcclxuICAgICAgbGV0IGVtcGlyZVRlY2ggPSBhd2FpdCBwcmlzbWEuZW1waXJlVGVjaG5vbG9neS5maW5kRmlyc3Qoe1xyXG4gICAgICAgIHdoZXJlOiB7IGVtcGlyZUlkLCB0ZWNobm9sb2d5SWQgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBjdXJyZW50TGV2ZWwgPSBlbXBpcmVUZWNoPy5sZXZlbCB8fCAwO1xyXG4gICAgICBjb25zdCBuZXh0TGV2ZWwgPSBjdXJyZW50TGV2ZWwgKyAxO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgbWF4IGxldmVsXHJcbiAgICAgIGlmIChjdXJyZW50TGV2ZWwgPj0gdGVjaG5vbG9neS5tYXhMZXZlbCkge1xyXG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdUZWNobm9sb2d5IGFscmVhZHkgYXQgbWF4IGxldmVsJyB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgcHJlcmVxdWlzaXRlc1xyXG4gICAgICBpZiAodGVjaG5vbG9neS5yZXF1aXJlZFRlY2hJZCkge1xyXG4gICAgICAgIGNvbnN0IHByZXJlcSA9IGF3YWl0IHByaXNtYS5lbXBpcmVUZWNobm9sb2d5LmZpbmRGaXJzdCh7XHJcbiAgICAgICAgICB3aGVyZToge1xyXG4gICAgICAgICAgICBlbXBpcmVJZCxcclxuICAgICAgICAgICAgdGVjaG5vbG9neUlkOiB0ZWNobm9sb2d5LnJlcXVpcmVkVGVjaElkLFxyXG4gICAgICAgICAgICBsZXZlbDogeyBndDogMCB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIXByZXJlcSkge1xyXG4gICAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ1ByZXJlcXVpc2l0ZXMgbm90IG1ldCcgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgY29zdHNcclxuICAgICAgY29uc3QgY29zdE11bHRpcGxpZXIgPSBuZXh0TGV2ZWw7XHJcbiAgICAgIGNvbnN0IGNvc3RNZXRhbCA9IHRlY2hub2xvZ3kuYmFzZUNvc3RNZXRhbCAqIGNvc3RNdWx0aXBsaWVyO1xyXG4gICAgICBjb25zdCBjb3N0UGxhc21hID0gdGVjaG5vbG9neS5iYXNlQ29zdFBsYXNtYSAqIGNvc3RNdWx0aXBsaWVyO1xyXG4gICAgICAvLyBERVY6IEZhc3QgdGltZXJzIGZvciBkZXZlbG9wbWVudCB0ZXN0aW5nIChuZXZlciBlbmFibGVkIGJ5IGRlZmF1bHQpXHJcbiAgICAgIGNvbnN0IHRpbWVNdWx0aXBsaWVyID0gcHJvY2Vzcy5lbnYuREVWX0ZBU1RfVElNRVJTID09PSAndHJ1ZScgPyAwLjEgOiAxO1xyXG4gICAgICBjb25zdCByZXNlYXJjaFRpbWUgPSB0ZWNobm9sb2d5LmJhc2VSZXNlYXJjaFRpbWUgKiBjb3N0TXVsdGlwbGllciAqIHRpbWVNdWx0aXBsaWVyO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgcmVzb3VyY2VzXHJcbiAgICAgIGNvbnN0IHJlc291cmNlcyA9IGF3YWl0IHByaXNtYS5yZXNvdXJjZS5maW5kTWFueSh7XHJcbiAgICAgICAgd2hlcmU6IHsgZW1waXJlSWQgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBtZXRhbCA9IHJlc291cmNlcy5maW5kKChyKSA9PiByLnR5cGUgPT09ICdNRVRBTCcpO1xyXG4gICAgICBjb25zdCBwbGFzbWEgPSByZXNvdXJjZXMuZmluZCgocikgPT4gci50eXBlID09PSAnUExBU01BJyk7XHJcblxyXG4gICAgICBpZiAoIW1ldGFsIHx8IG1ldGFsLmFtb3VudCA8IGNvc3RNZXRhbCkge1xyXG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgbWV0YWwnIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghcGxhc21hIHx8IHBsYXNtYS5hbW91bnQgPCBjb3N0UGxhc21hKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ0luc3VmZmljaWVudCBwbGFzbWEnIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEZWR1Y3QgcmVzb3VyY2VzIGFuZCBzdGFydCByZXNlYXJjaFxyXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICBjb25zdCBlbmRzQXQgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgcmVzZWFyY2hUaW1lICogMTAwMCk7XHJcblxyXG4gICAgICBhd2FpdCBwcmlzbWEuJHRyYW5zYWN0aW9uKGFzeW5jICh0eCkgPT4ge1xyXG4gICAgICAgIC8vIERlZHVjdCByZXNvdXJjZXNcclxuICAgICAgICBhd2FpdCB0eC5yZXNvdXJjZS51cGRhdGUoe1xyXG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IG1ldGFsLmlkIH0sXHJcbiAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBkZWNyZW1lbnQ6IGNvc3RNZXRhbCB9IH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGF3YWl0IHR4LnJlc291cmNlLnVwZGF0ZSh7XHJcbiAgICAgICAgICB3aGVyZTogeyBpZDogcGxhc21hLmlkIH0sXHJcbiAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBkZWNyZW1lbnQ6IGNvc3RQbGFzbWEgfSB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgb3IgdXBkYXRlIGVtcGlyZSB0ZWNobm9sb2d5XHJcbiAgICAgICAgaWYgKGVtcGlyZVRlY2gpIHtcclxuICAgICAgICAgIGF3YWl0IHR4LmVtcGlyZVRlY2hub2xvZ3kudXBkYXRlKHtcclxuICAgICAgICAgICAgd2hlcmU6IHsgaWQ6IGVtcGlyZVRlY2guaWQgfSxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgIHN0YXR1czogJ1JFU0VBUkNISU5HJyxcclxuICAgICAgICAgICAgICByZXNlYXJjaFN0YXJ0ZWRBdDogbm93LFxyXG4gICAgICAgICAgICAgIHJlc2VhcmNoRW5kc0F0OiBlbmRzQXQsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYXdhaXQgdHguZW1waXJlVGVjaG5vbG9neS5jcmVhdGUoe1xyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgZW1waXJlSWQsXHJcbiAgICAgICAgICAgICAgdGVjaG5vbG9neUlkLFxyXG4gICAgICAgICAgICAgIHN0YXR1czogJ1JFU0VBUkNISU5HJyxcclxuICAgICAgICAgICAgICByZXNlYXJjaFN0YXJ0ZWRBdDogbm93LFxyXG4gICAgICAgICAgICAgIHJlc2VhcmNoRW5kc0F0OiBlbmRzQXQsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXNlYXJjaCBzdGFydGVkJyxcclxuICAgICAgICBlbmRzQXQsXHJcbiAgICAgICAgcmVzZWFyY2hUaW1lLFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignUmVzZWFyY2ggc3RhcnQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDUwMCkuc2VuZCh7IGVycm9yOiAnRmFpbGVkIHRvIHN0YXJ0IHJlc2VhcmNoJyB9KTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gUE9TVCAvYXBpL3Jlc2VhcmNoL3N5bmMgLSBDb21wbGV0ZSByZXNlYXJjaCBhbmQgdXBkYXRlIGxldmVsc1xyXG4gIGFwcC5wb3N0KCcvc3luYycsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xyXG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIEZpbmQgY29tcGxldGVkIHJlc2VhcmNoXHJcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGNvbnN0IGNvbXBsZXRlZFJlc2VhcmNoZXMgPSBhd2FpdCBwcmlzbWEuZW1waXJlVGVjaG5vbG9neS5maW5kTWFueSh7XHJcbiAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgIGVtcGlyZUlkLFxyXG4gICAgICAgICAgc3RhdHVzOiAnUkVTRUFSQ0hJTkcnLFxyXG4gICAgICAgICAgcmVzZWFyY2hFbmRzQXQ6IHsgbHRlOiBub3cgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENvbXBsZXRlIGVhY2ggcmVzZWFyY2hcclxuICAgICAgZm9yIChjb25zdCByZXNlYXJjaCBvZiBjb21wbGV0ZWRSZXNlYXJjaGVzKSB7XHJcbiAgICAgICAgYXdhaXQgcHJpc21hLmVtcGlyZVRlY2hub2xvZ3kudXBkYXRlKHtcclxuICAgICAgICAgIHdoZXJlOiB7IGlkOiByZXNlYXJjaC5pZCB9LFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBzdGF0dXM6ICdDT01QTEVURUQnLFxyXG4gICAgICAgICAgICBsZXZlbDogeyBpbmNyZW1lbnQ6IDEgfSxcclxuICAgICAgICAgICAgcmVzZWFyY2hTdGFydGVkQXQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJlc2VhcmNoRW5kc0F0OiBudWxsLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGNvbXBsZXRlZENvdW50OiBjb21wbGV0ZWRSZXNlYXJjaGVzLmxlbmd0aCxcclxuICAgICAgICBjb21wbGV0ZWRJZHM6IGNvbXBsZXRlZFJlc2VhcmNoZXMubWFwKChyKSA9PiByLnRlY2hub2xvZ3lJZCksXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdSZXNlYXJjaCBzeW5jIGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg1MDApLnNlbmQoeyBlcnJvcjogJ0ZhaWxlZCB0byBzeW5jIHJlc2VhcmNoJyB9KTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG4iXX0=