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
        const hasShipyard = empire.planets.some((planet) => planet.buildings.some((b) => b.type === 'SHIPYARD'));
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
            const hasShipyard = empire.planets.some((planet) => planet.buildings.some((b) => b.type === 'SHIPYARD'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hpcHlhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL3NoaXB5YXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esd0NBcVlDO0FBdllELCtDQUEwQztBQUVuQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQW9CO0lBQ3ZELGtCQUFrQjtJQUNsQixHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2hELElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCw0REFBNEQ7SUFDNUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBNEIsQ0FBQztRQUUxRCxxQkFBcUI7UUFDckIsTUFBTSxVQUFVLEdBQUcsTUFBTSxpQkFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVyRCw2QkFBNkI7UUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxpQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDNUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUN2QixPQUFPLEVBQUU7Z0JBQ1AsWUFBWSxFQUFFO29CQUNaLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7aUJBQzlCO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO2lCQUM3QjtnQkFDRCxLQUFLLEVBQUUsSUFBSTtnQkFDWCxpQkFBaUIsRUFBRTtvQkFDakIsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRTtvQkFDN0IsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtpQkFDN0I7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsOEJBQThCO1FBQzlCLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDakQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQ3BELENBQUM7UUFFRixvQ0FBb0M7UUFDcEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQzVCLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUMxRSxDQUFDO1FBRUYscUJBQXFCO1FBQ3JCLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3RELEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN0QyxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUMsRUFBRSxFQUE0QixDQUFDLENBQUM7UUFFakMsMkJBQTJCO1FBQzNCLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1FBRXJELHVDQUF1QztRQUN2QyxNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUNoRCx5QkFBeUI7WUFDekIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBQzVCLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN0QixZQUFZLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3JELGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDLGtDQUFrQztZQUM3RCxDQUFDO1lBRUQsNkJBQTZCO1lBQzdCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLElBQUksV0FBVyxDQUFDO1lBRWpFLGtDQUFrQztZQUNsQyxNQUFNLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FDakQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FDL0IsQ0FBQztZQUVGLDJCQUEyQjtZQUMzQixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksa0JBQWtCLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFELE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMvRCxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFFRCxPQUFPO2dCQUNMLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDVCxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUc7Z0JBQ1gsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO2dCQUNiLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSTtnQkFDYixRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVE7Z0JBQ3JCLFdBQVcsRUFBRSxFQUFFLENBQUMsV0FBVztnQkFDM0IsS0FBSyxFQUFFO29CQUNMLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTtvQkFDakIsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPO29CQUNuQixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQ1QsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLO29CQUNmLGFBQWEsRUFBRSxFQUFFLENBQUMsYUFBYTtpQkFDaEM7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLEtBQUssRUFBRSxFQUFFLENBQUMsU0FBUztvQkFDbkIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxVQUFVO29CQUNyQixPQUFPLEVBQUUsRUFBRSxDQUFDLFdBQVc7aUJBQ3hCO2dCQUNELFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUztnQkFDdkIsUUFBUSxFQUFFLFlBQVksSUFBSSxnQkFBZ0I7Z0JBQzFDLGtCQUFrQixFQUFFO29CQUNsQixJQUFJLEVBQUUsZ0JBQWdCO29CQUN0QixRQUFRLEVBQUUsRUFBRSxDQUFDLG9CQUFvQjtpQkFDbEM7Z0JBQ0QsU0FBUyxFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztnQkFDcEMsa0JBQWtCLEVBQUUsa0JBQWtCO29CQUNwQyxDQUFDLENBQUM7d0JBQ0UsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7d0JBQ3pCLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRO3dCQUNyQyxhQUFhO3dCQUNiLFFBQVE7d0JBQ1IsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE1BQU07cUJBQ2xDO29CQUNILENBQUMsQ0FBQyxJQUFJO2FBQ1QsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNMLFdBQVc7WUFDWCxVQUFVLEVBQUUsbUJBQW1CO1lBQy9CLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDbkQsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUNSLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztnQkFDMUIsYUFBYSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSTtnQkFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2dCQUNwQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07YUFDakIsQ0FBQyxDQUFDO1NBQ0osQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsa0RBQWtEO0lBQ2xELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDMUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUE0QixDQUFDO1FBQzFELE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUc3QyxDQUFDO1FBRUYsb0JBQW9CO1FBQ3BCLElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDbkMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVELElBQUksQ0FBQztZQUNILGdCQUFnQjtZQUNoQixNQUFNLFNBQVMsR0FBRyxNQUFNLGlCQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztnQkFDbEQsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRTthQUMzQixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxDQUFDLENBQUM7WUFDbEUsQ0FBQztZQUVELGtDQUFrQztZQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLGlCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDNUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRTtnQkFDdkIsT0FBTyxFQUFFO29CQUNQLFlBQVksRUFBRTt3QkFDWixPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO3FCQUM5QjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1AsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtxQkFDN0I7b0JBQ0QsU0FBUyxFQUFFLElBQUk7b0JBQ2YsaUJBQWlCLEVBQUU7d0JBQ2pCLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUU7cUJBQzlCO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNaLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFFRCwwQkFBMEI7WUFDMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUNqRCxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsQ0FDcEQsQ0FBQztZQUVGLElBQUksU0FBUyxDQUFDLG9CQUFvQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ25ELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLENBQUM7WUFFRCx5QkFBeUI7WUFDekIsSUFBSSxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUN0QyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUNsRSxDQUFDO2dCQUNGLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDYixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLG9DQUFvQyxFQUFFLENBQUMsQ0FBQztnQkFDakYsQ0FBQztZQUNILENBQUM7WUFFRCxrREFBa0Q7WUFDbEQsSUFBSSxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUM1QixLQUFLLEVBQUUsdUNBQXVDO29CQUM5QyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2lCQUNoRCxDQUFDLENBQUM7WUFDTCxDQUFDO1lBRUQsZ0RBQWdEO1lBQ2hELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxLQUFLLE1BQU0sQ0FBQztZQUMvRCxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsOEJBQThCO1lBRWpGLHdCQUF3QjtZQUN4QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDaEcsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2xHLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBRXBHLDZDQUE2QztZQUM3QyxJQUFJLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7WUFDN0MsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQzdDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyx1QkFBdUIsQ0FDcEQsQ0FBQztZQUNGLElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQy9DLE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsZ0JBQWdCO2dCQUM5RCxrQkFBa0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEUsQ0FBQztZQUNELHNFQUFzRTtZQUN0RSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxHQUFHLGNBQWMsQ0FBQyxDQUFDO1lBRWxGLGtCQUFrQjtZQUNsQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQztZQUMvRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQztZQUNqRSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQztZQUVuRSxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsY0FBYyxFQUFFLENBQUM7Z0JBQzVDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7WUFDRCxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsZUFBZSxFQUFFLENBQUM7Z0JBQy9DLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFDRCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbEQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxDQUFDLENBQUM7WUFDbkUsQ0FBQztZQUVELDJDQUEyQztZQUMzQyxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFL0QsTUFBTSxpQkFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUU7Z0JBQ3JDLG1CQUFtQjtnQkFDbkIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDdkIsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZCLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsRUFBRTtpQkFDaEQsQ0FBQyxDQUFDO2dCQUNILE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQ3ZCLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO29CQUN4QixJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLEVBQUU7aUJBQ2pELENBQUMsQ0FBQztnQkFDSCxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUN2QixLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRTtvQkFDekIsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEVBQUU7aUJBQ2xELENBQUMsQ0FBQztnQkFFSCxzQkFBc0I7Z0JBQ3RCLE1BQU0sRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztvQkFDL0IsSUFBSSxFQUFFO3dCQUNKLFFBQVE7d0JBQ1IsV0FBVzt3QkFDWCxRQUFRO3dCQUNSLE1BQU0sRUFBRSxVQUFVO3dCQUNsQixTQUFTLEVBQUUsR0FBRzt3QkFDZCxNQUFNO3FCQUNQO2lCQUNGLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPLEVBQUUsb0JBQW9CLFFBQVEsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLO2dCQUM1RCxNQUFNO2dCQUNOLFNBQVMsRUFBRSxjQUFjO2FBQzFCLENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSw4QkFBOEIsRUFBRSxDQUFDLENBQUM7UUFDM0UsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsNERBQTREO0lBQzVELEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDekMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUE0QixDQUFDO1FBRTFELElBQUksQ0FBQztZQUNILE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFFdkIsK0JBQStCO1lBQy9CLE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxpQkFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztnQkFDcEUsS0FBSyxFQUFFO29CQUNMLFFBQVE7b0JBQ1IsTUFBTSxFQUFFLFVBQVU7b0JBQ2xCLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7aUJBQ3JCO2dCQUNELE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUU7YUFDN0IsQ0FBQyxDQUFDO1lBRUgsNkJBQTZCO1lBQzdCLEtBQUssTUFBTSxZQUFZLElBQUksc0JBQXNCLEVBQUUsQ0FBQztnQkFDbEQsTUFBTSxpQkFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUU7b0JBQ3JDLGlDQUFpQztvQkFDakMsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO3dCQUMvQixLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFBRTt3QkFDOUIsSUFBSSxFQUFFOzRCQUNKLE1BQU0sRUFBRSxXQUFXOzRCQUNuQixXQUFXLEVBQUUsR0FBRzt5QkFDakI7cUJBQ0YsQ0FBQyxDQUFDO29CQUVILHlCQUF5QjtvQkFDekIsTUFBTSxZQUFZLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDM0MsS0FBSyxFQUFFOzRCQUNMLFFBQVE7NEJBQ1IsV0FBVyxFQUFFLFlBQVksQ0FBQyxXQUFXO3lCQUN0QztxQkFDRixDQUFDLENBQUM7b0JBRUgsSUFBSSxZQUFZLEVBQUUsQ0FBQzt3QkFDakIsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs0QkFDbkIsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUU7NEJBQzlCLElBQUksRUFBRTtnQ0FDSixRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLFFBQVEsRUFBRTs2QkFDL0M7eUJBQ0YsQ0FBQyxDQUFDO29CQUNMLENBQUM7eUJBQU0sQ0FBQzt3QkFDTixNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDOzRCQUNuQixJQUFJLEVBQUU7Z0NBQ0osUUFBUTtnQ0FDUixXQUFXLEVBQUUsWUFBWSxDQUFDLFdBQVc7Z0NBQ3JDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUTtnQ0FDL0IsTUFBTSxFQUFFLFdBQVc7NkJBQ3BCO3lCQUNGLENBQUMsQ0FBQztvQkFDTCxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsY0FBYyxFQUFFLHNCQUFzQixDQUFDLE1BQU07Z0JBQzdDLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ2pELFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDMUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSTtvQkFDdEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2lCQUNyQixDQUFDLENBQUM7YUFDSixDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILHNDQUFzQztJQUN0QyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDbEMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUE0QixDQUFDO1FBRTFELE1BQU0sS0FBSyxHQUFHLE1BQU0saUJBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUNuQixPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO1NBQzdCLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTCxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDdkIsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUNSLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztnQkFDMUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSTtnQkFDdEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSTtnQkFDdEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUTtnQkFDOUIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2dCQUNwQixLQUFLLEVBQUU7b0JBQ0wsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTTtvQkFDMUIsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTztvQkFDNUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDbEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSztvQkFDeEIsYUFBYSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYTtpQkFDekM7YUFDRixDQUFDLENBQUM7U0FDSixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmFzdGlmeUluc3RhbmNlIH0gZnJvbSAnZmFzdGlmeSc7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAZ2FsYXh5L2RhdGFiYXNlJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNoaXB5YXJkUm91dGVzKGFwcDogRmFzdGlmeUluc3RhbmNlKSB7XG4gIC8vIEF1dGggbWlkZGxld2FyZVxuICBhcHAuYWRkSG9vaygnb25SZXF1ZXN0JywgYXN5bmMgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJlcXVlc3Quand0VmVyaWZ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXBseS5jb2RlKDQwMSkuc2VuZCh7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEdFVCAvYXBpL3NoaXB5YXJkIC0gTGlzdCBhbGwgYmx1ZXByaW50cyB3aXRoIGJ1aWxkIHN0YXR1c1xuICBhcHAuZ2V0KCcvJywgYXN5bmMgKHJlcXVlc3QpID0+IHtcbiAgICBjb25zdCB7IGVtcGlyZUlkIH0gPSByZXF1ZXN0LnVzZXIgYXMgeyBlbXBpcmVJZDogc3RyaW5nIH07XG5cbiAgICAvLyBHZXQgYWxsIGJsdWVwcmludHNcbiAgICBjb25zdCBibHVlcHJpbnRzID0gYXdhaXQgcHJpc21hLmJsdWVwcmludC5maW5kTWFueSgpO1xuXG4gICAgLy8gR2V0IGVtcGlyZSBkYXRhIGZvciBjaGVja3NcbiAgICBjb25zdCBlbXBpcmUgPSBhd2FpdCBwcmlzbWEuZW1waXJlLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IGVtcGlyZUlkIH0sXG4gICAgICBpbmNsdWRlOiB7XG4gICAgICAgIHRlY2hub2xvZ2llczoge1xuICAgICAgICAgIGluY2x1ZGU6IHsgdGVjaG5vbG9neTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgICBwbGFuZXRzOiB7XG4gICAgICAgICAgaW5jbHVkZTogeyBidWlsZGluZ3M6IHRydWUgfSxcbiAgICAgICAgfSxcbiAgICAgICAgc2hpcHM6IHRydWUsXG4gICAgICAgIHNoaXBDb25zdHJ1Y3Rpb25zOiB7XG4gICAgICAgICAgd2hlcmU6IHsgc3RhdHVzOiAnQlVJTERJTkcnIH0sXG4gICAgICAgICAgaW5jbHVkZTogeyBibHVlcHJpbnQ6IHRydWUgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIWVtcGlyZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbXBpcmUgbm90IGZvdW5kJyk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHNoaXB5YXJkIGJ1aWxkaW5nXG4gICAgY29uc3QgaGFzU2hpcHlhcmQgPSBlbXBpcmUucGxhbmV0cy5zb21lKChwbGFuZXQpID0+XG4gICAgICBwbGFuZXQuYnVpbGRpbmdzLnNvbWUoKGIpID0+IGIudHlwZSA9PT0gJ1NISVBZQVJEJylcbiAgICApO1xuXG4gICAgLy8gR2V0IGNvbXBsZXRlZCB0ZWNocyBmb3IgdW5sb2NraW5nXG4gICAgY29uc3QgY29tcGxldGVkVGVjaHMgPSBuZXcgU2V0KFxuICAgICAgZW1waXJlLnRlY2hub2xvZ2llcy5maWx0ZXIoKHQpID0+IHQubGV2ZWwgPiAwKS5tYXAoKHQpID0+IHQudGVjaG5vbG9neUlkKVxuICAgICk7XG5cbiAgICAvLyBHZXQgc2hpcCBpbnZlbnRvcnlcbiAgICBjb25zdCBzaGlwSW52ZW50b3J5ID0gZW1waXJlLnNoaXBzLnJlZHVjZSgoYWNjLCBzaGlwKSA9PiB7XG4gICAgICBhY2Nbc2hpcC5ibHVlcHJpbnRJZF0gPSBzaGlwLnF1YW50aXR5O1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KTtcblxuICAgIC8vIEdldCBhY3RpdmUgY29uc3RydWN0aW9uc1xuICAgIGNvbnN0IGFjdGl2ZUNvbnN0cnVjdGlvbnMgPSBlbXBpcmUuc2hpcENvbnN0cnVjdGlvbnM7XG5cbiAgICAvLyBGb3JtYXQgYmx1ZXByaW50cyB3aXRoIHVubG9jayBzdGF0dXNcbiAgICBjb25zdCBmb3JtYXR0ZWRCbHVlcHJpbnRzID0gYmx1ZXByaW50cy5tYXAoKGJwKSA9PiB7XG4gICAgICAvLyBDaGVjayB0ZWNoIHJlcXVpcmVtZW50XG4gICAgICBsZXQgdGVjaFVubG9ja2VkID0gdHJ1ZTtcbiAgICAgIGxldCByZXF1aXJlZFRlY2hOYW1lID0gbnVsbDtcbiAgICAgIGlmIChicC5yZXF1aXJlZFRlY2hJZCkge1xuICAgICAgICB0ZWNoVW5sb2NrZWQgPSBjb21wbGV0ZWRUZWNocy5oYXMoYnAucmVxdWlyZWRUZWNoSWQpO1xuICAgICAgICByZXF1aXJlZFRlY2hOYW1lID0gbnVsbDsgLy8gVE9ETzogRmV0Y2ggdGVjaCBuYW1lIGlmIG5lZWRlZFxuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBidWlsZGluZyByZXF1aXJlbWVudFxuICAgICAgY29uc3QgYnVpbGRpbmdVbmxvY2tlZCA9ICFicC5yZXF1aXJlZEJ1aWxkaW5nVHlwZSB8fCBoYXNTaGlweWFyZDtcblxuICAgICAgLy8gQ2hlY2sgaWYgY29uc3RydWN0aW9uIGlzIGFjdGl2ZVxuICAgICAgY29uc3QgYWN0aXZlQ29uc3RydWN0aW9uID0gYWN0aXZlQ29uc3RydWN0aW9ucy5maW5kKFxuICAgICAgICAoYykgPT4gYy5ibHVlcHJpbnRJZCA9PT0gYnAuaWRcbiAgICAgICk7XG5cbiAgICAgIC8vIENhbGN1bGF0ZSByZW1haW5pbmcgdGltZVxuICAgICAgbGV0IHRpbWVSZW1haW5pbmcgPSAwO1xuICAgICAgbGV0IHByb2dyZXNzID0gMDtcbiAgICAgIGlmIChhY3RpdmVDb25zdHJ1Y3Rpb24pIHtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGFjdGl2ZUNvbnN0cnVjdGlvbi5lbmRzQXQpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZShhY3RpdmVDb25zdHJ1Y3Rpb24uc3RhcnRlZEF0KS5nZXRUaW1lKCk7XG4gICAgICAgIHRpbWVSZW1haW5pbmcgPSBNYXRoLm1heCgwLCBlbmQgLSBub3cpO1xuICAgICAgICBwcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgKChub3cgLSBzdGFydCkgLyAoZW5kIC0gc3RhcnQpKSAqIDEwMCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBicC5pZCxcbiAgICAgICAga2V5OiBicC5rZXksXG4gICAgICAgIG5hbWU6IGJwLm5hbWUsXG4gICAgICAgIHR5cGU6IGJwLnR5cGUsXG4gICAgICAgIGNhdGVnb3J5OiBicC5jYXRlZ29yeSxcbiAgICAgICAgZGVzY3JpcHRpb246IGJwLmRlc2NyaXB0aW9uLFxuICAgICAgICBzdGF0czoge1xuICAgICAgICAgIGF0dGFjazogYnAuYXR0YWNrLFxuICAgICAgICAgIGRlZmVuc2U6IGJwLmRlZmVuc2UsXG4gICAgICAgICAgaHA6IGJwLmhwLFxuICAgICAgICAgIHNwZWVkOiBicC5zcGVlZCxcbiAgICAgICAgICBjYXJnb0NhcGFjaXR5OiBicC5jYXJnb0NhcGFjaXR5LFxuICAgICAgICB9LFxuICAgICAgICBjb3N0czoge1xuICAgICAgICAgIG1ldGFsOiBicC5jb3N0TWV0YWwsXG4gICAgICAgICAgcGxhc21hOiBicC5jb3N0UGxhc21hLFxuICAgICAgICAgIGNyZWRpdHM6IGJwLmNvc3RDcmVkaXRzLFxuICAgICAgICB9LFxuICAgICAgICBidWlsZFRpbWU6IGJwLmJ1aWxkVGltZSxcbiAgICAgICAgdW5sb2NrZWQ6IHRlY2hVbmxvY2tlZCAmJiBidWlsZGluZ1VubG9ja2VkLFxuICAgICAgICB1bmxvY2tSZXF1aXJlbWVudHM6IHtcbiAgICAgICAgICB0ZWNoOiByZXF1aXJlZFRlY2hOYW1lLFxuICAgICAgICAgIGJ1aWxkaW5nOiBicC5yZXF1aXJlZEJ1aWxkaW5nVHlwZSxcbiAgICAgICAgfSxcbiAgICAgICAgaW52ZW50b3J5OiBzaGlwSW52ZW50b3J5W2JwLmlkXSB8fCAwLFxuICAgICAgICBhY3RpdmVDb25zdHJ1Y3Rpb246IGFjdGl2ZUNvbnN0cnVjdGlvblxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBpZDogYWN0aXZlQ29uc3RydWN0aW9uLmlkLFxuICAgICAgICAgICAgICBxdWFudGl0eTogYWN0aXZlQ29uc3RydWN0aW9uLnF1YW50aXR5LFxuICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nLFxuICAgICAgICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgICAgICAgZW5kc0F0OiBhY3RpdmVDb25zdHJ1Y3Rpb24uZW5kc0F0LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogbnVsbCxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaGFzU2hpcHlhcmQsXG4gICAgICBibHVlcHJpbnRzOiBmb3JtYXR0ZWRCbHVlcHJpbnRzLFxuICAgICAgYWN0aXZlQ29uc3RydWN0aW9uczogYWN0aXZlQ29uc3RydWN0aW9ucy5tYXAoKGMpID0+ICh7XG4gICAgICAgIGlkOiBjLmlkLFxuICAgICAgICBibHVlcHJpbnRJZDogYy5ibHVlcHJpbnRJZCxcbiAgICAgICAgYmx1ZXByaW50TmFtZTogYy5ibHVlcHJpbnQubmFtZSxcbiAgICAgICAgcXVhbnRpdHk6IGMucXVhbnRpdHksXG4gICAgICAgIGVuZHNBdDogYy5lbmRzQXQsXG4gICAgICB9KSksXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gUE9TVCAvYXBpL3NoaXB5YXJkL2J1aWxkIC0gU3RhcnQgYnVpbGRpbmcgc2hpcHNcbiAgYXBwLnBvc3QoJy9idWlsZCcsIGFzeW5jIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcbiAgICBjb25zdCB7IGJsdWVwcmludElkLCBxdWFudGl0eSA9IDEgfSA9IHJlcXVlc3QuYm9keSBhcyB7XG4gICAgICBibHVlcHJpbnRJZDogc3RyaW5nO1xuICAgICAgcXVhbnRpdHk/OiBudW1iZXI7XG4gICAgfTtcblxuICAgIC8vIFZhbGlkYXRlIHF1YW50aXR5XG4gICAgaWYgKHF1YW50aXR5IDwgMSB8fCBxdWFudGl0eSA+IDEwMCkge1xuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ0ludmFsaWQgcXVhbnRpdHkgKDEtMTAwKScgfSk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEdldCBibHVlcHJpbnRcbiAgICAgIGNvbnN0IGJsdWVwcmludCA9IGF3YWl0IHByaXNtYS5ibHVlcHJpbnQuZmluZFVuaXF1ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiBibHVlcHJpbnRJZCB9LFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghYmx1ZXByaW50KSB7XG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDA0KS5zZW5kKHsgZXJyb3I6ICdCbHVlcHJpbnQgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IGVtcGlyZSB3aXRoIGFsbCBuZWVkZWQgZGF0YVxuICAgICAgY29uc3QgZW1waXJlID0gYXdhaXQgcHJpc21hLmVtcGlyZS5maW5kVW5pcXVlKHtcbiAgICAgICAgd2hlcmU6IHsgaWQ6IGVtcGlyZUlkIH0sXG4gICAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgICB0ZWNobm9sb2dpZXM6IHtcbiAgICAgICAgICAgIGluY2x1ZGU6IHsgdGVjaG5vbG9neTogdHJ1ZSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGxhbmV0czoge1xuICAgICAgICAgICAgaW5jbHVkZTogeyBidWlsZGluZ3M6IHRydWUgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlc291cmNlczogdHJ1ZSxcbiAgICAgICAgICBzaGlwQ29uc3RydWN0aW9uczoge1xuICAgICAgICAgICAgd2hlcmU6IHsgc3RhdHVzOiAnQlVJTERJTkcnIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWVtcGlyZSkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwNCkuc2VuZCh7IGVycm9yOiAnRW1waXJlIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIHNoaXB5YXJkIGJ1aWxkaW5nXG4gICAgICBjb25zdCBoYXNTaGlweWFyZCA9IGVtcGlyZS5wbGFuZXRzLnNvbWUoKHBsYW5ldCkgPT5cbiAgICAgICAgcGxhbmV0LmJ1aWxkaW5ncy5zb21lKChiKSA9PiBiLnR5cGUgPT09ICdTSElQWUFSRCcpXG4gICAgICApO1xuXG4gICAgICBpZiAoYmx1ZXByaW50LnJlcXVpcmVkQnVpbGRpbmdUeXBlICYmICFoYXNTaGlweWFyZCkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7IGVycm9yOiAnU2hpcHlhcmQgcmVxdWlyZWQnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayB0ZWNoIHJlcXVpcmVtZW50XG4gICAgICBpZiAoYmx1ZXByaW50LnJlcXVpcmVkVGVjaElkKSB7XG4gICAgICAgIGNvbnN0IGhhc1RlY2ggPSBlbXBpcmUudGVjaG5vbG9naWVzLnNvbWUoXG4gICAgICAgICAgKHQpID0+IHQudGVjaG5vbG9neUlkID09PSBibHVlcHJpbnQucmVxdWlyZWRUZWNoSWQgJiYgdC5sZXZlbCA+IDBcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFoYXNUZWNoKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoeyBlcnJvcjogJ1JlcXVpcmVkIHRlY2hub2xvZ3kgbm90IHJlc2VhcmNoZWQnIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGFjdGl2ZSBjb25zdHJ1Y3Rpb25zIChsaW1pdCB0byAxIGZvciBNVlApXG4gICAgICBpZiAoZW1waXJlLnNoaXBDb25zdHJ1Y3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDApLnNlbmQoe1xuICAgICAgICAgIGVycm9yOiAnU2hpcCBjb25zdHJ1Y3Rpb24gYWxyZWFkeSBpbiBwcm9ncmVzcycsXG4gICAgICAgICAgYWN0aXZlQ29uc3RydWN0aW9uOiBlbXBpcmUuc2hpcENvbnN0cnVjdGlvbnNbMF0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBERVZfTU9ERTogQ2hlYXAgY29zdHMgZm9yIGRldmVsb3BtZW50IHRlc3RpbmdcbiAgICAgIGNvbnN0IGlzRGV2Q2hlYXBDb3N0cyA9IHByb2Nlc3MuZW52LkRFVl9DSEVBUF9DT1NUUyA9PT0gJ3RydWUnO1xuICAgICAgY29uc3QgY29zdE11bHRpcGxpZXIgPSBpc0RldkNoZWFwQ29zdHMgPyAwLjAxIDogMTsgLy8gMSUgb2YgcmVhbCBjb3N0IGluIGRldiBtb2RlXG4gICAgICBcbiAgICAgIC8vIENhbGN1bGF0ZSB0b3RhbCBjb3N0c1xuICAgICAgY29uc3QgdG90YWxDb3N0TWV0YWwgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGJsdWVwcmludC5jb3N0TWV0YWwgKiBxdWFudGl0eSAqIGNvc3RNdWx0aXBsaWVyKSk7XG4gICAgICBjb25zdCB0b3RhbENvc3RQbGFzbWEgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGJsdWVwcmludC5jb3N0UGxhc21hICogcXVhbnRpdHkgKiBjb3N0TXVsdGlwbGllcikpO1xuICAgICAgY29uc3QgdG90YWxDb3N0Q3JlZGl0cyA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoYmx1ZXByaW50LmNvc3RDcmVkaXRzICogcXVhbnRpdHkgKiBjb3N0TXVsdGlwbGllcikpO1xuXG4gICAgICAvLyBBcHBseSBidWlsZCB0aW1lIHJlZHVjdGlvbiBmcm9tIHRlY2hub2xvZ3lcbiAgICAgIGxldCBlZmZlY3RpdmVCdWlsZFRpbWUgPSBibHVlcHJpbnQuYnVpbGRUaW1lO1xuICAgICAgY29uc3QgYXV0b21hdGlvblRlY2ggPSBlbXBpcmUudGVjaG5vbG9naWVzLmZpbmQoXG4gICAgICAgICh0KSA9PiB0LnRlY2hub2xvZ3kua2V5ID09PSAnSU5EVVNUUklBTF9BVVRPTUFUSU9OJ1xuICAgICAgKTtcbiAgICAgIGlmIChhdXRvbWF0aW9uVGVjaCAmJiBhdXRvbWF0aW9uVGVjaC5sZXZlbCA+IDApIHtcbiAgICAgICAgY29uc3QgcmVkdWN0aW9uID0gYXV0b21hdGlvblRlY2gubGV2ZWwgKiAwLjE7IC8vIDEwJSBwZXIgbGV2ZWxcbiAgICAgICAgZWZmZWN0aXZlQnVpbGRUaW1lID0gTWF0aC5mbG9vcihlZmZlY3RpdmVCdWlsZFRpbWUgKiAoMSAtIHJlZHVjdGlvbikpO1xuICAgICAgfVxuICAgICAgLy8gREVWOiBGYXN0IHRpbWVycyBmb3IgZGV2ZWxvcG1lbnQgdGVzdGluZyAobmV2ZXIgZW5hYmxlZCBieSBkZWZhdWx0KVxuICAgICAgY29uc3QgdGltZU11bHRpcGxpZXIgPSBwcm9jZXNzLmVudi5ERVZfRkFTVF9USU1FUlMgPT09ICd0cnVlJyA/IDAuMSA6IDE7XG4gICAgICBjb25zdCB0b3RhbEJ1aWxkVGltZSA9IE1hdGguZmxvb3IoZWZmZWN0aXZlQnVpbGRUaW1lICogcXVhbnRpdHkgKiB0aW1lTXVsdGlwbGllcik7XG5cbiAgICAgIC8vIENoZWNrIHJlc291cmNlc1xuICAgICAgY29uc3QgbWV0YWwgPSBlbXBpcmUucmVzb3VyY2VzLmZpbmQoKHIpID0+IHIudHlwZSA9PT0gJ01FVEFMJyk7XG4gICAgICBjb25zdCBwbGFzbWEgPSBlbXBpcmUucmVzb3VyY2VzLmZpbmQoKHIpID0+IHIudHlwZSA9PT0gJ1BMQVNNQScpO1xuICAgICAgY29uc3QgY3JlZGl0cyA9IGVtcGlyZS5yZXNvdXJjZXMuZmluZCgocikgPT4gci50eXBlID09PSAnQ1JFRElUUycpO1xuXG4gICAgICBpZiAoIW1ldGFsIHx8IG1ldGFsLmFtb3VudCA8IHRvdGFsQ29zdE1ldGFsKSB7XG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgbWV0YWwnIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCFwbGFzbWEgfHwgcGxhc21hLmFtb3VudCA8IHRvdGFsQ29zdFBsYXNtYSkge1xuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBsYXNtYScgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIWNyZWRpdHMgfHwgY3JlZGl0cy5hbW91bnQgPCB0b3RhbENvc3RDcmVkaXRzKSB7XG4gICAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNDAwKS5zZW5kKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgY3JlZGl0cycgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIERlZHVjdCByZXNvdXJjZXMgYW5kIGNyZWF0ZSBjb25zdHJ1Y3Rpb25cbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBlbmRzQXQgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgdG90YWxCdWlsZFRpbWUgKiAxMDAwKTtcblxuICAgICAgYXdhaXQgcHJpc21hLiR0cmFuc2FjdGlvbihhc3luYyAodHgpID0+IHtcbiAgICAgICAgLy8gRGVkdWN0IHJlc291cmNlc1xuICAgICAgICBhd2FpdCB0eC5yZXNvdXJjZS51cGRhdGUoe1xuICAgICAgICAgIHdoZXJlOiB7IGlkOiBtZXRhbC5pZCB9LFxuICAgICAgICAgIGRhdGE6IHsgYW1vdW50OiB7IGRlY3JlbWVudDogdG90YWxDb3N0TWV0YWwgfSB9LFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgdHgucmVzb3VyY2UudXBkYXRlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogcGxhc21hLmlkIH0sXG4gICAgICAgICAgZGF0YTogeyBhbW91bnQ6IHsgZGVjcmVtZW50OiB0b3RhbENvc3RQbGFzbWEgfSB9LFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgdHgucmVzb3VyY2UudXBkYXRlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogY3JlZGl0cy5pZCB9LFxuICAgICAgICAgIGRhdGE6IHsgYW1vdW50OiB7IGRlY3JlbWVudDogdG90YWxDb3N0Q3JlZGl0cyB9IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBjb25zdHJ1Y3Rpb25cbiAgICAgICAgYXdhaXQgdHguc2hpcENvbnN0cnVjdGlvbi5jcmVhdGUoe1xuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGVtcGlyZUlkLFxuICAgICAgICAgICAgYmx1ZXByaW50SWQsXG4gICAgICAgICAgICBxdWFudGl0eSxcbiAgICAgICAgICAgIHN0YXR1czogJ0JVSUxESU5HJyxcbiAgICAgICAgICAgIHN0YXJ0ZWRBdDogbm93LFxuICAgICAgICAgICAgZW5kc0F0LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIG1lc3NhZ2U6IGBTdGFydGVkIGJ1aWxkaW5nICR7cXVhbnRpdHl9ICR7Ymx1ZXByaW50Lm5hbWV9KHMpYCxcbiAgICAgICAgZW5kc0F0LFxuICAgICAgICBidWlsZFRpbWU6IHRvdGFsQnVpbGRUaW1lLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignU2hpcCBidWlsZCBlcnJvcjonLCBlcnJvcik7XG4gICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDUwMCkuc2VuZCh7IGVycm9yOiAnRmFpbGVkIHRvIHN0YXJ0IGNvbnN0cnVjdGlvbicgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBQT1NUIC9hcGkvc2hpcHlhcmQvc3luYyAtIENvbXBsZXRlIGZpbmlzaGVkIGNvbnN0cnVjdGlvbnNcbiAgYXBwLnBvc3QoJy9zeW5jJywgYXN5bmMgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgY29uc3QgeyBlbXBpcmVJZCB9ID0gcmVxdWVzdC51c2VyIGFzIHsgZW1waXJlSWQ6IHN0cmluZyB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG5cbiAgICAgIC8vIEZpbmQgY29tcGxldGVkIGNvbnN0cnVjdGlvbnNcbiAgICAgIGNvbnN0IGNvbXBsZXRlZENvbnN0cnVjdGlvbnMgPSBhd2FpdCBwcmlzbWEuc2hpcENvbnN0cnVjdGlvbi5maW5kTWFueSh7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgc3RhdHVzOiAnQlVJTERJTkcnLFxuICAgICAgICAgIGVuZHNBdDogeyBsdGU6IG5vdyB9LFxuICAgICAgICB9LFxuICAgICAgICBpbmNsdWRlOiB7IGJsdWVwcmludDogdHJ1ZSB9LFxuICAgICAgfSk7XG5cbiAgICAgIC8vIENvbXBsZXRlIGVhY2ggY29uc3RydWN0aW9uXG4gICAgICBmb3IgKGNvbnN0IGNvbnN0cnVjdGlvbiBvZiBjb21wbGV0ZWRDb25zdHJ1Y3Rpb25zKSB7XG4gICAgICAgIGF3YWl0IHByaXNtYS4kdHJhbnNhY3Rpb24oYXN5bmMgKHR4KSA9PiB7XG4gICAgICAgICAgLy8gTWFyayBjb25zdHJ1Y3Rpb24gYXMgY29tcGxldGVkXG4gICAgICAgICAgYXdhaXQgdHguc2hpcENvbnN0cnVjdGlvbi51cGRhdGUoe1xuICAgICAgICAgICAgd2hlcmU6IHsgaWQ6IGNvbnN0cnVjdGlvbi5pZCB9LFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBzdGF0dXM6ICdDT01QTEVURUQnLFxuICAgICAgICAgICAgICBjb21wbGV0ZWRBdDogbm93LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEFkZCBzaGlwcyB0byBpbnZlbnRvcnlcbiAgICAgICAgICBjb25zdCBleGlzdGluZ1NoaXAgPSBhd2FpdCB0eC5zaGlwLmZpbmRGaXJzdCh7XG4gICAgICAgICAgICB3aGVyZToge1xuICAgICAgICAgICAgICBlbXBpcmVJZCxcbiAgICAgICAgICAgICAgYmx1ZXByaW50SWQ6IGNvbnN0cnVjdGlvbi5ibHVlcHJpbnRJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoZXhpc3RpbmdTaGlwKSB7XG4gICAgICAgICAgICBhd2FpdCB0eC5zaGlwLnVwZGF0ZSh7XG4gICAgICAgICAgICAgIHdoZXJlOiB7IGlkOiBleGlzdGluZ1NoaXAuaWQgfSxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHF1YW50aXR5OiB7IGluY3JlbWVudDogY29uc3RydWN0aW9uLnF1YW50aXR5IH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdHguc2hpcC5jcmVhdGUoe1xuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZW1waXJlSWQsXG4gICAgICAgICAgICAgICAgYmx1ZXByaW50SWQ6IGNvbnN0cnVjdGlvbi5ibHVlcHJpbnRJZCxcbiAgICAgICAgICAgICAgICBxdWFudGl0eTogY29uc3RydWN0aW9uLnF1YW50aXR5LFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ0FWQUlMQUJMRScsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBjb21wbGV0ZWRDb3VudDogY29tcGxldGVkQ29uc3RydWN0aW9ucy5sZW5ndGgsXG4gICAgICAgIGNvbXBsZXRlZFNoaXBzOiBjb21wbGV0ZWRDb25zdHJ1Y3Rpb25zLm1hcCgoYykgPT4gKHtcbiAgICAgICAgICBibHVlcHJpbnRJZDogYy5ibHVlcHJpbnRJZCxcbiAgICAgICAgICBuYW1lOiBjLmJsdWVwcmludC5uYW1lLFxuICAgICAgICAgIHF1YW50aXR5OiBjLnF1YW50aXR5LFxuICAgICAgICB9KSksXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdTaGlweWFyZCBzeW5jIGVycm9yOicsIGVycm9yKTtcbiAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNTAwKS5zZW5kKHsgZXJyb3I6ICdGYWlsZWQgdG8gc3luYyBzaGlweWFyZCcgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBHRVQgL2FwaS9zaGlwcyAtIEdldCBzaGlwIGludmVudG9yeVxuICBhcHAuZ2V0KCcvc2hpcHMnLCBhc3luYyAocmVxdWVzdCkgPT4ge1xuICAgIGNvbnN0IHsgZW1waXJlSWQgfSA9IHJlcXVlc3QudXNlciBhcyB7IGVtcGlyZUlkOiBzdHJpbmcgfTtcblxuICAgIGNvbnN0IHNoaXBzID0gYXdhaXQgcHJpc21hLnNoaXAuZmluZE1hbnkoe1xuICAgICAgd2hlcmU6IHsgZW1waXJlSWQgfSxcbiAgICAgIGluY2x1ZGU6IHsgYmx1ZXByaW50OiB0cnVlIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2hpcHM6IHNoaXBzLm1hcCgocykgPT4gKHtcbiAgICAgICAgaWQ6IHMuaWQsXG4gICAgICAgIGJsdWVwcmludElkOiBzLmJsdWVwcmludElkLFxuICAgICAgICBuYW1lOiBzLmJsdWVwcmludC5uYW1lLFxuICAgICAgICB0eXBlOiBzLmJsdWVwcmludC50eXBlLFxuICAgICAgICBjYXRlZ29yeTogcy5ibHVlcHJpbnQuY2F0ZWdvcnksXG4gICAgICAgIHF1YW50aXR5OiBzLnF1YW50aXR5LFxuICAgICAgICBzdGF0czoge1xuICAgICAgICAgIGF0dGFjazogcy5ibHVlcHJpbnQuYXR0YWNrLFxuICAgICAgICAgIGRlZmVuc2U6IHMuYmx1ZXByaW50LmRlZmVuc2UsXG4gICAgICAgICAgaHA6IHMuYmx1ZXByaW50LmhwLFxuICAgICAgICAgIHNwZWVkOiBzLmJsdWVwcmludC5zcGVlZCxcbiAgICAgICAgICBjYXJnb0NhcGFjaXR5OiBzLmJsdWVwcmludC5jYXJnb0NhcGFjaXR5LFxuICAgICAgICB9LFxuICAgICAgfSkpLFxuICAgIH07XG4gIH0pO1xufVxuIl19