"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipyardRoutes = shipyardRoutes;
const database_1 = require("@galaxy/database");
async function shipyardRoutes(app) {
    // Auth middleware
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
    // GET /api/shipyard - List all blueprints with build status
    app.get('/', async (request) => {
        const { empireId } = request.user;
        // Get all blueprints
        const blueprints = await database_1.prisma.blueprint.findMany();
        // Get empire data for checks
        const empire = await database_1.prisma.empire.findUnique({
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
        const hasShipyard = empire.planets.some((planet) => planet.buildings.some((b) => b.type === 'shipyard' || b.type === 'SHIPYARD'));
        // Get completed techs for unlocking
        const completedTechs = new Set(empire.technologies.filter((t) => t.level > 0).map((t) => t.technologyId));
        // Get ship inventory
        const shipInventory = empire.ships.reduce((acc, ship) => {
            acc[ship.blueprintId] = ship.quantity;
            return acc;
        }, {});
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
            const activeConstruction = activeConstructions.find((c) => c.blueprintId === bp.id);
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
        const { empireId } = request.user;
        const { blueprintId, quantity = 1 } = request.body;
        // Validate quantity
        if (quantity < 1 || quantity > 100) {
            return reply.status(400).send({ error: 'Invalid quantity (1-100)' });
        }
        try {
            // Get blueprint
            const blueprint = await database_1.prisma.blueprint.findUnique({
                where: { id: blueprintId },
            });
            if (!blueprint) {
                return reply.status(404).send({ error: 'Blueprint not found' });
            }
            // Get empire with all needed data
            const empire = await database_1.prisma.empire.findUnique({
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
            const hasShipyard = empire.planets.some((planet) => planet.buildings.some((b) => b.type === 'shipyard' || b.type === 'SHIPYARD'));
            if (blueprint.requiredBuildingType && !hasShipyard) {
                return reply.status(400).send({ error: 'Shipyard required' });
            }
            // Check tech requirement
            if (blueprint.requiredTechId) {
                const hasTech = empire.technologies.some((t) => t.technologyId === blueprint.requiredTechId && t.level > 0);
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
            const automationTech = empire.technologies.find((t) => t.technology.key === 'INDUSTRIAL_AUTOMATION');
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
            await database_1.prisma.$transaction(async (tx) => {
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
        }
        catch (error) {
            console.error('Ship build error:', error);
            return reply.status(500).send({ error: 'Failed to start construction' });
        }
    });
    // POST /api/shipyard/sync - Complete finished constructions
    app.post('/sync', async (request, reply) => {
        const { empireId } = request.user;
        try {
            const now = new Date();
            // Find completed constructions
            const completedConstructions = await database_1.prisma.shipConstruction.findMany({
                where: {
                    empireId,
                    status: 'BUILDING',
                    endsAt: { lte: now },
                },
                include: { blueprint: true },
            });
            // Complete each construction
            for (const construction of completedConstructions) {
                await database_1.prisma.$transaction(async (tx) => {
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
                    }
                    else {
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
        }
        catch (error) {
            console.error('Shipyard sync error:', error);
            return reply.status(500).send({ error: 'Failed to sync shipyard' });
        }
    });
    // GET /api/ships - Get ship inventory
    app.get('/ships', async (request) => {
        const { empireId } = request.user;
        const ships = await database_1.prisma.ship.findMany({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hpcHlhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL3NoaXB5YXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esd0NBcVlDO0FBdllELCtDQUEwQztBQUVuQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQW9CO0lBQ3ZELGtCQUFrQjtJQUNsQixHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2hELElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCw0REFBNEQ7SUFDNUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBNEIsQ0FBQztRQUUxRCxxQkFBcUI7UUFDckIsTUFBTSxVQUFVLEdBQUcsTUFBTSxpQkFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVyRCw2QkFBNkI7UUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxpQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDNUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUN2QixPQUFPLEVBQUU7Z0JBQ1AsWUFBWSxFQUFFO29CQUNaLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7aUJBQzlCO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUs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Q0FBQyxTQUFTLENBQUMsSUFBSTtnQkFDdEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSTtnQkFDdEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUTtnQkFDOUIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2dCQUNwQixLQUFLLEVBQUU7b0JBQ0wsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTTtvQkFDMUIsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTztvQkFDNUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDbEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSztvQkFDeEIsYUFBYSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYTtpQkFDekM7YUFDRixDQUFDLENBQUM7U0FDSixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmFzdGlmeUluc3RhbmNlIH0gZnJvbSAnZmFzdGlmeSc7XHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0BnYWxheHkvZGF0YWJhc2UnO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNoaXB5YXJkUm91dGVzKGFwcDogRmFzdGlmeUluc3RhbmNlKSB7XHJcbiAgLy8gQXV0aCBtaWRkbGV3YXJlXHJcbiAgYXBwLmFkZEhvb2soJ29uUmVxdWVzdCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgcmVxdWVzdC5qd3RWZXJpZnkoKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICByZXBseS5jb2RlKDQwMSkuc2VuZCh7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9KTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gR0VUIC9hcGkvc2hpcHlhcmQgLSBMaXN0IGFsbCBibHVlcHJpbnRzIHdpdGggYnVpbGQgc3RhdHVzXHJcbiAgYXBwLmdldCgnLycsIGFzeW5jIChyZXF1ZXN0KSA9PiB7XHJcbiAgICBjb25zdCB7IGVtcGlyZUlkIH0gPSByZXF1ZXN0LnVzZXIgYXMgeyBlbXBpcmVJZDogc3RyaW5nIH07XHJcblxyXG4gICAgLy8gR2V0IGFsbCBibHVlcHJpbnRzXHJcbiAgICBjb25zdCBibHVlcHJpbnRzID0gYXdhaXQgcHJpc21hLmJsdWVwcmludC5maW5kTWFueSgpO1xyXG5cclxuICAgIC8vIEdldCBlbXBpcmUgZGF0YSBmb3IgY2hlY2tzXHJcbiAgICBjb25zdCBlbXBpcmUgPSBhd2FpdCBwcmlzbWEuZW1waXJlLmZpbmRVbmlxdWUoe1xyXG4gICAgICB3aGVyZTogeyBpZDogZW1waXJlSWQgfSxcclxuICAgICAgaW5jbHVkZToge1xyXG4gICAgICAgIHRlY2hub2xvZ2llczoge1xyXG4gICAgICAgICAgaW5jbHVkZTogeyB0ZWNobm9sb2d5OiB0cnVlIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGFuZXRzOiB7XHJcbiAgICAgICAgICBpbmNsdWRlOiB7IGJ1aWxkaW5nczogdHJ1ZSB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hpcHM6IHRydWUsXHJcbiAgICAgICAgc2hpcENvbnN0cnVjdGlvbnM6IHtcclxuICAgICAgICAgIHdoZXJlOiB7IHN0YXR1czogJ0JVSUxESU5HJyB9LFxyXG4gICAgICAgICAgaW5jbHVkZTogeyBibHVlcHJpbnQ6IHRydWUgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFlbXBpcmUpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbXBpcmUgbm90IGZvdW5kJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIHNoaXB5YXJkIGJ1aWxkaW5nXHJcbiAgICBjb25zdCBoYXNTaGlweWFyZCA9IGVtcGlyZS5wbGFuZXRzLnNvbWUoKHBsYW5ldCkgPT5cclxuICAgICAgcGxhbmV0LmJ1aWxkaW5ncy5zb21lKChiKSA9PiBiLnR5cGUgPT09ICdzaGlweWFyZCcgfHwgYi50eXBlID09PSAnU0hJUFlBUkQnKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBHZXQgY29tcGxldGVkIHRlY2hzIGZvciB1bmxvY2tpbmdcclxuICAgIGNvbnN0IGNvbXBsZXRlZFRlY2hzID0gbmV3IFNldChcclxuICAgICAgZW1waXJlLnRlY2hub2xvZ2llcy5maWx0ZXIoKHQpID0+IHQubGV2ZWwgPiAwKS5tYXAoKHQpID0+IHQudGVjaG5vbG9neUlkKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBHZXQgc2hpcCBpbnZlbnRvcnlcclxuICAgIGNvbnN0IHNoaXBJbnZlbnRvcnkgPSBlbXBpcmUuc2hpcHMucmVkdWNlKChhY2MsIHNoaXApID0+IHtcclxuICAgICAgYWNjW3NoaXAuYmx1ZXByaW50SWRdID0gc2hpcC5xdWFudGl0eTtcclxuICAgICAgcmV0dXJuIGFjYztcclxuICAgIH0sIHt9IGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj4pO1xyXG5cclxuICAgIC8vIEdldCBhY3RpdmUgY29uc3RydWN0aW9uc1xyXG4gICAgY29uc3QgYWN0aXZlQ29uc3RydWN0aW9ucyA9IGVtcGlyZS5zaGlwQ29uc3RydWN0aW9ucztcclxuXHJcbiAgICAvLyBGb3JtYXQgYmx1ZXByaW50cyB3aXRoIHVubG9jayBzdGF0dXNcclxuICAgIGNvbnN0IGZvcm1hdHRlZEJsdWVwcmludHMgPSBibHVlcHJpbnRzLm1hcCgoYnApID0+IHtcclxuICAgICAgLy8gQ2hlY2sgdGVjaCByZXF1aXJlbWVudFxyXG4gICAgICBsZXQgdGVjaFVubG9ja2VkID0gdHJ1ZTtcclxuICAgICAgbGV0IHJlcXVpcmVkVGVjaE5hbWUgPSBudWxsO1xyXG4gICAgICBpZiAoYnAucmVxdWlyZWRUZWNoSWQpIHtcclxuICAgICAgICB0ZWNoVW5sb2NrZWQgPSBjb21wbGV0ZWRUZWNocy5oYXMoYnAucmVxdWlyZWRUZWNoSWQpO1xyXG4gICAgICAgIHJlcXVpcmVkVGVjaE5hbWUgPSBudWxsOyAvLyBUT0RPOiBGZXRjaCB0ZWNoIG5hbWUgaWYgbmVlZGVkXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGJ1aWxkaW5nIHJlcXVpcmVtZW50XHJcbiAgICAgIGNvbnN0IGJ1aWxkaW5nVW5sb2NrZWQgPSAhYnAucmVxdWlyZWRCdWlsZGluZ1R5cGUgfHwgaGFzU2hpcHlhcmQ7XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBjb25zdHJ1Y3Rpb24gaXMgYWN0aXZlXHJcbiAgICAgIGNvbnN0IGFjdGl2ZUNvbnN0cnVjdGlvbiA9IGFjdGl2ZUNvbnN0cnVjdGlvbnMuZmluZChcclxuICAgICAgICAoYykgPT4gYy5ibHVlcHJpbnRJZCA9PT0gYnAuaWRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSByZW1haW5pbmcgdGltZVxyXG4gICAgICBsZXQgdGltZVJlbWFpbmluZyA9IDA7XHJcbiAgICAgIGxldCBwcm9ncmVzcyA9IDA7XHJcbiAgICAgIGlmIChhY3RpdmVDb25zdHJ1Y3Rpb24pIHtcclxuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICBjb25zdCBlbmQgPSBuZXcgRGF0ZShhY3RpdmVDb25zdHJ1Y3Rpb24uZW5kc0F0KS5nZXRUaW1lKCk7XHJcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZShhY3RpdmVDb25zdHJ1Y3Rpb24uc3RhcnRlZEF0KS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdGltZVJlbWFpbmluZyA9IE1hdGgubWF4KDAsIGVuZCAtIG5vdyk7XHJcbiAgICAgICAgcHJvZ3Jlc3MgPSBNYXRoLm1pbigxMDAsICgobm93IC0gc3RhcnQpIC8gKGVuZCAtIHN0YXJ0KSkgKiAxMDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkOiBicC5pZCxcclxuICAgICAgICBrZXk6IGJwLmtleSxcclxuICAgICAgICBuYW1lOiBicC5uYW1lLFxyXG4gICAgICAgIHR5cGU6IGJwLnR5cGUsXHJcbiAgICAgICAgY2F0ZWdvcnk6IGJwLmNhdGVnb3J5LFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBicC5kZXNjcmlwdGlvbixcclxuICAgICAgICBzdGF0czoge1xyXG4gICAgICAgICAgYXR0YWNrOiBicC5hdHRhY2ssXHJcbiAgICAgICAgICBkZWZlbnNlOiBicC5kZWZlbnNlLFxyXG4gICAgICAgICAgaHA6IGJwLmhwLFxyXG4gICAgICAgICAgc3BlZWQ6IGJwLnNwZWVkLFxyXG4gICAgICAgICAgY2FyZ29DYXBhY2l0eTogYnAuY2FyZ29DYXBhY2l0eSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvc3RzOiB7XHJcbiAgICAgICAgICBtZXRhbDogYnAuY29zdE1ldGFsLFxyXG4gICAgICAgICAgcGxhc21hOiBicC5jb3N0UGxhc21hLFxyXG4gICAgICAgICAgY3JlZGl0czogYnAuY29zdENyZWRpdHMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBidWlsZFRpbWU6IGJwLmJ1aWxkVGltZSxcclxuICAgICAgICB1bmxvY2tlZDogdGVjaFVubG9ja2VkICYmIGJ1aWxkaW5nVW5sb2NrZWQsXHJcbiAgICAgICAgdW5sb2NrUmVxdWlyZW1lbnRzOiB7XHJcbiAgICAgICAgICB0ZWNoOiByZXF1aXJlZFRlY2hOYW1lLFxyXG4gICAgICAgICAgYnVpbGRpbmc6IGJwLnJlcXVpcmVkQnVpbGRpbmdUeXBlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW52ZW50b3J5OiBzaGlwSW52ZW50b3J5W2JwLmlkXSB8fCAwLFxyXG4gICAgICAgIGFjdGl2ZUNvbnN0cnVjdGlvbjogYWN0aXZlQ29uc3RydWN0aW9uXHJcbiAgICAgICAgICA/IHtcclxuICAgICAgICAgICAgICBpZDogYWN0aXZlQ29uc3RydWN0aW9uLmlkLFxyXG4gICAgICAgICAgICAgIHF1YW50aXR5OiBhY3RpdmVDb25zdHJ1Y3Rpb24ucXVhbnRpdHksXHJcbiAgICAgICAgICAgICAgdGltZVJlbWFpbmluZyxcclxuICAgICAgICAgICAgICBwcm9ncmVzcyxcclxuICAgICAgICAgICAgICBlbmRzQXQ6IGFjdGl2ZUNvbnN0cnVjdGlvbi5lbmRzQXQsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIDogbnVsbCxcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGhhc1NoaXB5YXJkLFxyXG4gICAgICBibHVlcHJpbnRzOiBmb3JtYXR0ZWRCbHVlcHJpbnRzLFxyXG4gICAgICBhY3RpdmVDb25zdHJ1Y3Rpb25zOiBhY3RpdmVDb25zdHJ1Y3Rpb25zLm1hcCgoYykgPT4gKHtcclxuICAgICAgICBpZDogYy5pZCxcclxuICAgICAgICBibHVlcHJpbnRJZDogYy5ibHVlcHJpbnRJZCxcclxuICAgICAgICBibHVlcHJpbnROYW1lOiBjLmJsdWVwcmludC5uYW1lLFxyXG4gICAgICAgIHF1YW50aXR5OiBjLnF1YW50aXR5LFxyXG4gICAgICAgIGVuZHNBdDogYy5lbmRzQXQsXHJcbiAgICAgIH0pKSxcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIC8vIFBPU1QgL2FwaS9zaGlweWFyZC9idWlsZCAtIFN0YXJ0IGJ1aWxkaW5nIHNoaXBzXHJcbiAgYXBwLnBvc3QoJy9idWlsZCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xyXG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xyXG4gICAgY29uc3QgeyBibHVlcHJpbnRJZCwgcXVhbnRpdHkgPSAxIH0gPSByZXF1ZXN0LmJvZHkgYXMge1xyXG4gICAgICBibHVlcHJpbnRJZDogc3RyaW5nO1xyXG4gICAgICBxdWFudGl0eT86IG51bWJlcjtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgcXVhbnRpdHlcclxuICAgIGlmIChxdWFudGl0eSA8IDEgfHwgcXVhbnRpdHkgPiAxMDApIHtcclxuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ0ludmFsaWQgcXVhbnRpdHkgKDEtMTAwKScgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gR2V0IGJsdWVwcmludFxyXG4gICAgICBjb25zdCBibHVlcHJpbnQgPSBhd2FpdCBwcmlzbWEuYmx1ZXByaW50LmZpbmRVbmlxdWUoe1xyXG4gICAgICAgIHdoZXJlOiB7IGlkOiBibHVlcHJpbnRJZCB9LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICghYmx1ZXByaW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDQpLnNlbmQoeyBlcnJvcjogJ0JsdWVwcmludCBub3QgZm91bmQnIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgZW1waXJlIHdpdGggYWxsIG5lZWRlZCBkYXRhXHJcbiAgICAgIGNvbnN0IGVtcGlyZSA9IGF3YWl0IHByaXNtYS5lbXBpcmUuZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgd2hlcmU6IHsgaWQ6IGVtcGlyZUlkIH0sXHJcbiAgICAgICAgaW5jbHVkZToge1xyXG4gICAgICAgICAgdGVjaG5vbG9naWVzOiB7XHJcbiAgICAgICAgICAgIGluY2x1ZGU6IHsgdGVjaG5vbG9neTogdHJ1ZSB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHBsYW5ldHM6IHtcclxuICAgICAgICAgICAgaW5jbHVkZTogeyBidWlsZGluZ3M6IHRydWUgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICByZXNvdXJjZXM6IHRydWUsXHJcbiAgICAgICAgICBzaGlwQ29uc3RydWN0aW9uczoge1xyXG4gICAgICAgICAgICB3aGVyZTogeyBzdGF0dXM6ICdCVUlMRElORycgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIWVtcGlyZSkge1xyXG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDA0KS5zZW5kKHsgZXJyb3I6ICdFbXBpcmUgbm90IGZvdW5kJyB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgc2hpcHlhcmQgYnVpbGRpbmdcclxuICAgICAgY29uc3QgaGFzU2hpcHlhcmQgPSBlbXBpcmUucGxhbmV0cy5zb21lKChwbGFuZXQpID0+XHJcbiAgICAgICAgcGxhbmV0LmJ1aWxkaW5ncy5zb21lKChiKSA9PiBiLnR5cGUgPT09ICdzaGlweWFyZCcgfHwgYi50eXBlID09PSAnU0hJUFlBUkQnKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKGJsdWVwcmludC5yZXF1aXJlZEJ1aWxkaW5nVHlwZSAmJiAhaGFzU2hpcHlhcmQpIHtcclxuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7IGVycm9yOiAnU2hpcHlhcmQgcmVxdWlyZWQnIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayB0ZWNoIHJlcXVpcmVtZW50XHJcbiAgICAgIGlmIChibHVlcHJpbnQucmVxdWlyZWRUZWNoSWQpIHtcclxuICAgICAgICBjb25zdCBoYXNUZWNoID0gZW1waXJlLnRlY2hub2xvZ2llcy5zb21lKFxyXG4gICAgICAgICAgKHQpID0+IHQudGVjaG5vbG9neUlkID09PSBibHVlcHJpbnQucmVxdWlyZWRUZWNoSWQgJiYgdC5sZXZlbCA+IDBcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmICghaGFzVGVjaCkge1xyXG4gICAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ1JlcXVpcmVkIHRlY2hub2xvZ3kgbm90IHJlc2VhcmNoZWQnIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgYWN0aXZlIGNvbnN0cnVjdGlvbnMgKGxpbWl0IHRvIDEgZm9yIE1WUClcclxuICAgICAgaWYgKGVtcGlyZS5zaGlwQ29uc3RydWN0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoe1xyXG4gICAgICAgICAgZXJyb3I6ICdTaGlwIGNvbnN0cnVjdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzJyxcclxuICAgICAgICAgIGFjdGl2ZUNvbnN0cnVjdGlvbjogZW1waXJlLnNoaXBDb25zdHJ1Y3Rpb25zWzBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBERVZfTU9ERTogQ2hlYXAgY29zdHMgZm9yIGRldmVsb3BtZW50IHRlc3RpbmdcclxuICAgICAgY29uc3QgaXNEZXZDaGVhcENvc3RzID0gcHJvY2Vzcy5lbnYuREVWX0NIRUFQX0NPU1RTID09PSAndHJ1ZSc7XHJcbiAgICAgIGNvbnN0IGNvc3RNdWx0aXBsaWVyID0gaXNEZXZDaGVhcENvc3RzID8gMC4wMSA6IDE7IC8vIDElIG9mIHJlYWwgY29zdCBpbiBkZXYgbW9kZVxyXG4gICAgICBcclxuICAgICAgLy8gQ2FsY3VsYXRlIHRvdGFsIGNvc3RzXHJcbiAgICAgIGNvbnN0IHRvdGFsQ29zdE1ldGFsID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihibHVlcHJpbnQuY29zdE1ldGFsICogcXVhbnRpdHkgKiBjb3N0TXVsdGlwbGllcikpO1xyXG4gICAgICBjb25zdCB0b3RhbENvc3RQbGFzbWEgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGJsdWVwcmludC5jb3N0UGxhc21hICogcXVhbnRpdHkgKiBjb3N0TXVsdGlwbGllcikpO1xyXG4gICAgICBjb25zdCB0b3RhbENvc3RDcmVkaXRzID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihibHVlcHJpbnQuY29zdENyZWRpdHMgKiBxdWFudGl0eSAqIGNvc3RNdWx0aXBsaWVyKSk7XHJcblxyXG4gICAgICAvLyBBcHBseSBidWlsZCB0aW1lIHJlZHVjdGlvbiBmcm9tIHRlY2hub2xvZ3lcclxuICAgICAgbGV0IGVmZmVjdGl2ZUJ1aWxkVGltZSA9IGJsdWVwcmludC5idWlsZFRpbWU7XHJcbiAgICAgIGNvbnN0IGF1dG9tYXRpb25UZWNoID0gZW1waXJlLnRlY2hub2xvZ2llcy5maW5kKFxyXG4gICAgICAgICh0KSA9PiB0LnRlY2hub2xvZ3kua2V5ID09PSAnSU5EVVNUUklBTF9BVVRPTUFUSU9OJ1xyXG4gICAgICApO1xyXG4gICAgICBpZiAoYXV0b21hdGlvblRlY2ggJiYgYXV0b21hdGlvblRlY2gubGV2ZWwgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgcmVkdWN0aW9uID0gYXV0b21hdGlvblRlY2gubGV2ZWwgKiAwLjE7IC8vIDEwJSBwZXIgbGV2ZWxcclxuICAgICAgICBlZmZlY3RpdmVCdWlsZFRpbWUgPSBNYXRoLmZsb29yKGVmZmVjdGl2ZUJ1aWxkVGltZSAqICgxIC0gcmVkdWN0aW9uKSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gREVWOiBGYXN0IHRpbWVycyBmb3IgZGV2ZWxvcG1lbnQgdGVzdGluZyAobmV2ZXIgZW5hYmxlZCBieSBkZWZhdWx0KVxyXG4gICAgICBjb25zdCB0aW1lTXVsdGlwbGllciA9IHByb2Nlc3MuZW52LkRFVl9GQVNUX1RJTUVSUyA9PT0gJ3RydWUnID8gMC4xIDogMTtcclxuICAgICAgY29uc3QgdG90YWxCdWlsZFRpbWUgPSBNYXRoLmZsb29yKGVmZmVjdGl2ZUJ1aWxkVGltZSAqIHF1YW50aXR5ICogdGltZU11bHRpcGxpZXIpO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgcmVzb3VyY2VzXHJcbiAgICAgIGNvbnN0IG1ldGFsID0gZW1waXJlLnJlc291cmNlcy5maW5kKChyKSA9PiByLnR5cGUgPT09ICdNRVRBTCcpO1xyXG4gICAgICBjb25zdCBwbGFzbWEgPSBlbXBpcmUucmVzb3VyY2VzLmZpbmQoKHIpID0+IHIudHlwZSA9PT0gJ1BMQVNNQScpO1xyXG4gICAgICBjb25zdCBjcmVkaXRzID0gZW1waXJlLnJlc291cmNlcy5maW5kKChyKSA9PiByLnR5cGUgPT09ICdDUkVESVRTJyk7XHJcblxyXG4gICAgICBpZiAoIW1ldGFsIHx8IG1ldGFsLmFtb3VudCA8IHRvdGFsQ29zdE1ldGFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ0luc3VmZmljaWVudCBtZXRhbCcgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFwbGFzbWEgfHwgcGxhc21hLmFtb3VudCA8IHRvdGFsQ29zdFBsYXNtYSkge1xyXG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGxhc21hJyB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIWNyZWRpdHMgfHwgY3JlZGl0cy5hbW91bnQgPCB0b3RhbENvc3RDcmVkaXRzKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ0luc3VmZmljaWVudCBjcmVkaXRzJyB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGVkdWN0IHJlc291cmNlcyBhbmQgY3JlYXRlIGNvbnN0cnVjdGlvblxyXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICBjb25zdCBlbmRzQXQgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgdG90YWxCdWlsZFRpbWUgKiAxMDAwKTtcclxuXHJcbiAgICAgIGF3YWl0IHByaXNtYS4kdHJhbnNhY3Rpb24oYXN5bmMgKHR4KSA9PiB7XHJcbiAgICAgICAgLy8gRGVkdWN0IHJlc291cmNlc1xyXG4gICAgICAgIGF3YWl0IHR4LnJlc291cmNlLnVwZGF0ZSh7XHJcbiAgICAgICAgICB3aGVyZTogeyBpZDogbWV0YWwuaWQgfSxcclxuICAgICAgICAgIGRhdGE6IHsgYW1vdW50OiB7IGRlY3JlbWVudDogdG90YWxDb3N0TWV0YWwgfSB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGF3YWl0IHR4LnJlc291cmNlLnVwZGF0ZSh7XHJcbiAgICAgICAgICB3aGVyZTogeyBpZDogcGxhc21hLmlkIH0sXHJcbiAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBkZWNyZW1lbnQ6IHRvdGFsQ29zdFBsYXNtYSB9IH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYXdhaXQgdHgucmVzb3VyY2UudXBkYXRlKHtcclxuICAgICAgICAgIHdoZXJlOiB7IGlkOiBjcmVkaXRzLmlkIH0sXHJcbiAgICAgICAgICBkYXRhOiB7IGFtb3VudDogeyBkZWNyZW1lbnQ6IHRvdGFsQ29zdENyZWRpdHMgfSB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgY29uc3RydWN0aW9uXHJcbiAgICAgICAgYXdhaXQgdHguc2hpcENvbnN0cnVjdGlvbi5jcmVhdGUoe1xyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBlbXBpcmVJZCxcclxuICAgICAgICAgICAgYmx1ZXByaW50SWQsXHJcbiAgICAgICAgICAgIHF1YW50aXR5LFxyXG4gICAgICAgICAgICBzdGF0dXM6ICdCVUlMRElORycsXHJcbiAgICAgICAgICAgIHN0YXJ0ZWRBdDogbm93LFxyXG4gICAgICAgICAgICBlbmRzQXQsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBgU3RhcnRlZCBidWlsZGluZyAke3F1YW50aXR5fSAke2JsdWVwcmludC5uYW1lfShzKWAsXHJcbiAgICAgICAgZW5kc0F0LFxyXG4gICAgICAgIGJ1aWxkVGltZTogdG90YWxCdWlsZFRpbWUsXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdTaGlwIGJ1aWxkIGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg1MDApLnNlbmQoeyBlcnJvcjogJ0ZhaWxlZCB0byBzdGFydCBjb25zdHJ1Y3Rpb24nIH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBQT1NUIC9hcGkvc2hpcHlhcmQvc3luYyAtIENvbXBsZXRlIGZpbmlzaGVkIGNvbnN0cnVjdGlvbnNcclxuICBhcHAucG9zdCgnL3N5bmMnLCBhc3luYyAocmVxdWVzdCwgcmVwbHkpID0+IHtcclxuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgLy8gRmluZCBjb21wbGV0ZWQgY29uc3RydWN0aW9uc1xyXG4gICAgICBjb25zdCBjb21wbGV0ZWRDb25zdHJ1Y3Rpb25zID0gYXdhaXQgcHJpc21hLnNoaXBDb25zdHJ1Y3Rpb24uZmluZE1hbnkoe1xyXG4gICAgICAgIHdoZXJlOiB7XHJcbiAgICAgICAgICBlbXBpcmVJZCxcclxuICAgICAgICAgIHN0YXR1czogJ0JVSUxESU5HJyxcclxuICAgICAgICAgIGVuZHNBdDogeyBsdGU6IG5vdyB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5jbHVkZTogeyBibHVlcHJpbnQ6IHRydWUgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDb21wbGV0ZSBlYWNoIGNvbnN0cnVjdGlvblxyXG4gICAgICBmb3IgKGNvbnN0IGNvbnN0cnVjdGlvbiBvZiBjb21wbGV0ZWRDb25zdHJ1Y3Rpb25zKSB7XHJcbiAgICAgICAgYXdhaXQgcHJpc21hLiR0cmFuc2FjdGlvbihhc3luYyAodHgpID0+IHtcclxuICAgICAgICAgIC8vIE1hcmsgY29uc3RydWN0aW9uIGFzIGNvbXBsZXRlZFxyXG4gICAgICAgICAgYXdhaXQgdHguc2hpcENvbnN0cnVjdGlvbi51cGRhdGUoe1xyXG4gICAgICAgICAgICB3aGVyZTogeyBpZDogY29uc3RydWN0aW9uLmlkIH0sXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICBzdGF0dXM6ICdDT01QTEVURUQnLFxyXG4gICAgICAgICAgICAgIGNvbXBsZXRlZEF0OiBub3csXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgc2hpcHMgdG8gaW52ZW50b3J5XHJcbiAgICAgICAgICBjb25zdCBleGlzdGluZ1NoaXAgPSBhd2FpdCB0eC5zaGlwLmZpbmRGaXJzdCh7XHJcbiAgICAgICAgICAgIHdoZXJlOiB7XHJcbiAgICAgICAgICAgICAgZW1waXJlSWQsXHJcbiAgICAgICAgICAgICAgYmx1ZXByaW50SWQ6IGNvbnN0cnVjdGlvbi5ibHVlcHJpbnRJZCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGlmIChleGlzdGluZ1NoaXApIHtcclxuICAgICAgICAgICAgYXdhaXQgdHguc2hpcC51cGRhdGUoe1xyXG4gICAgICAgICAgICAgIHdoZXJlOiB7IGlkOiBleGlzdGluZ1NoaXAuaWQgfSxcclxuICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBxdWFudGl0eTogeyBpbmNyZW1lbnQ6IGNvbnN0cnVjdGlvbi5xdWFudGl0eSB9LFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXdhaXQgdHguc2hpcC5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIGVtcGlyZUlkLFxyXG4gICAgICAgICAgICAgICAgYmx1ZXByaW50SWQ6IGNvbnN0cnVjdGlvbi5ibHVlcHJpbnRJZCxcclxuICAgICAgICAgICAgICAgIHF1YW50aXR5OiBjb25zdHJ1Y3Rpb24ucXVhbnRpdHksXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdBVkFJTEFCTEUnLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgY29tcGxldGVkQ291bnQ6IGNvbXBsZXRlZENvbnN0cnVjdGlvbnMubGVuZ3RoLFxyXG4gICAgICAgIGNvbXBsZXRlZFNoaXBzOiBjb21wbGV0ZWRDb25zdHJ1Y3Rpb25zLm1hcCgoYykgPT4gKHtcclxuICAgICAgICAgIGJsdWVwcmludElkOiBjLmJsdWVwcmludElkLFxyXG4gICAgICAgICAgbmFtZTogYy5ibHVlcHJpbnQubmFtZSxcclxuICAgICAgICAgIHF1YW50aXR5OiBjLnF1YW50aXR5LFxyXG4gICAgICAgIH0pKSxcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1NoaXB5YXJkIHN5bmMgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDUwMCkuc2VuZCh7IGVycm9yOiAnRmFpbGVkIHRvIHN5bmMgc2hpcHlhcmQnIH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBHRVQgL2FwaS9zaGlwcyAtIEdldCBzaGlwIGludmVudG9yeVxyXG4gIGFwcC5nZXQoJy9zaGlwcycsIGFzeW5jIChyZXF1ZXN0KSA9PiB7XHJcbiAgICBjb25zdCB7IGVtcGlyZUlkIH0gPSByZXF1ZXN0LnVzZXIgYXMgeyBlbXBpcmVJZDogc3RyaW5nIH07XHJcblxyXG4gICAgY29uc3Qgc2hpcHMgPSBhd2FpdCBwcmlzbWEuc2hpcC5maW5kTWFueSh7XHJcbiAgICAgIHdoZXJlOiB7IGVtcGlyZUlkIH0sXHJcbiAgICAgIGluY2x1ZGU6IHsgYmx1ZXByaW50OiB0cnVlIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzaGlwczogc2hpcHMubWFwKChzKSA9PiAoe1xyXG4gICAgICAgIGlkOiBzLmlkLFxyXG4gICAgICAgIGJsdWVwcmludElkOiBzLmJsdWVwcmludElkLFxyXG4gICAgICAgIG5hbWU6IHMuYmx1ZXByaW50Lm5hbWUsXHJcbiAgICAgICAgdHlwZTogcy5ibHVlcHJpbnQudHlwZSxcclxuICAgICAgICBjYXRlZ29yeTogcy5ibHVlcHJpbnQuY2F0ZWdvcnksXHJcbiAgICAgICAgcXVhbnRpdHk6IHMucXVhbnRpdHksXHJcbiAgICAgICAgc3RhdHM6IHtcclxuICAgICAgICAgIGF0dGFjazogcy5ibHVlcHJpbnQuYXR0YWNrLFxyXG4gICAgICAgICAgZGVmZW5zZTogcy5ibHVlcHJpbnQuZGVmZW5zZSxcclxuICAgICAgICAgIGhwOiBzLmJsdWVwcmludC5ocCxcclxuICAgICAgICAgIHNwZWVkOiBzLmJsdWVwcmludC5zcGVlZCxcclxuICAgICAgICAgIGNhcmdvQ2FwYWNpdHk6IHMuYmx1ZXByaW50LmNhcmdvQ2FwYWNpdHksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSkpLFxyXG4gICAgfTtcclxuICB9KTtcclxufVxyXG4iXX0=