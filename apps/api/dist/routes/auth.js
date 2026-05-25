"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const database_1 = require("@galaxy/database");
const shared_1 = require("@galaxy/shared");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    username: zod_1.z.string().min(3).max(20),
    empireName: zod_1.z.string().min(3).max(30),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
async function authRoutes(app) {
    // Register
    app.post('/register', async (request, reply) => {
        try {
            const data = registerSchema.parse(request.body);
            // Check if user exists
            const existingUser = await database_1.prisma.user.findFirst({
                where: { OR: [{ email: data.email }, { username: data.username }] },
            });
            if (existingUser) {
                return reply.status(400).send({ error: 'User already exists' });
            }
            // Hash password
            const passwordHash = await bcrypt_1.default.hash(data.password, 10);
            // Create user with empire in transaction
            const result = await database_1.prisma.$transaction(async (tx) => {
                // Create user
                const user = await tx.user.create({
                    data: {
                        email: data.email,
                        passwordHash,
                        username: data.username,
                    },
                });
                // Create empire
                const empire = await tx.empire.create({
                    data: {
                        userId: user.id,
                        name: data.empireName,
                    },
                });
                // Create initial planet
                const planet = await tx.planet.create({
                    data: {
                        empireId: empire.id,
                        name: 'Planeta Principal',
                        type: 'HABITABLE',
                        maxBuildingSlots: shared_1.PLANET_BUILDING_SLOTS,
                    },
                });
                const centerSlot = Math.floor(shared_1.PLANET_BUILDING_SLOTS / 2);
                const initialBuildings = [
                    { type: 'control_center', slotIndex: centerSlot },
                    { type: 'metal_extractor', slotIndex: 0 },
                    { type: 'plasma_refinery', slotIndex: 1 },
                    { type: 'research_lab', slotIndex: 2 },
                    { type: 'shipyard', slotIndex: 3 },
                ];
                for (const building of initialBuildings) {
                    await tx.building.create({
                        data: {
                            planetId: planet.id,
                            ...building,
                        },
                    });
                }
                // Create resources
                // DEV_MODE: High resources for development testing
                const isDevHighResources = process.env.DEV_HIGH_STARTING_RESOURCES === 'true';
                const devAmount = 1000000;
                const devCapacity = 100000000;
                await tx.resource.createMany({
                    data: [
                        {
                            empireId: empire.id,
                            type: 'METAL',
                            amount: isDevHighResources ? devAmount : shared_1.INITIAL_PLAYER_RESOURCES.metal,
                            capacity: isDevHighResources ? devCapacity : shared_1.INITIAL_RESOURCE_CAPACITY.metal,
                            productionPerHour: 100,
                        },
                        {
                            empireId: empire.id,
                            type: 'PLASMA',
                            amount: isDevHighResources ? devAmount : shared_1.INITIAL_PLAYER_RESOURCES.plasma,
                            capacity: isDevHighResources ? devCapacity : shared_1.INITIAL_RESOURCE_CAPACITY.plasma,
                            productionPerHour: 50,
                        },
                        {
                            empireId: empire.id,
                            type: 'CREDITS',
                            amount: isDevHighResources ? devAmount : shared_1.INITIAL_PLAYER_RESOURCES.credits,
                            capacity: shared_1.INITIAL_RESOURCE_CAPACITY.credits,
                            productionPerHour: 0,
                        },
                    ],
                });
                // Initialize technologies
                // Tier 1 (no requiredTechId) are AVAILABLE for research
                // Others are LOCKED until prerequisites are met
                const allTechs = await tx.technology.findMany();
                if (allTechs.length > 0) {
                    for (const tech of allTechs) {
                        const status = tech.requiredTechId ? 'LOCKED' : 'AVAILABLE';
                        await tx.empireTechnology.create({
                            data: {
                                empireId: empire.id,
                                technologyId: tech.id,
                                level: 0,
                                status,
                            },
                        });
                    }
                }
                return { user, empire };
            });
            // Generate JWT
            const token = app.jwt.sign({ userId: result.user.id, empireId: result.empire.id });
            return {
                token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username,
                },
                empire: {
                    id: result.empire.id,
                    name: result.empire.name,
                    level: result.empire.level,
                },
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return reply.status(500).send({ error: 'Failed to register' });
        }
    });
    // Login
    app.post('/login', async (request, reply) => {
        try {
            const data = loginSchema.parse(request.body);
            // Find user
            const user = await database_1.prisma.user.findUnique({
                where: { email: data.email },
                include: { empire: true },
            });
            if (!user || !user.isActive) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }
            // Verify password
            const valid = await bcrypt_1.default.compare(data.password, user.passwordHash);
            if (!valid) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }
            // Update last login
            await database_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
            // Generate JWT
            const token = app.jwt.sign({ userId: user.id, empireId: user.empire.id });
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
                empire: {
                    id: user.empire.id,
                    name: user.empire.name,
                    level: user.empire.level,
                },
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return reply.status(500).send({ error: 'Failed to login' });
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvYXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQXNCQSxnQ0EyTEM7QUFoTkQsb0RBQTRCO0FBQzVCLDZCQUF3QjtBQUN4QiwrQ0FBMEM7QUFDMUMsMkNBSXdCO0FBRXhCLE1BQU0sY0FBYyxHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDOUIsS0FBSyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUU7SUFDekIsUUFBUSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNCLFFBQVEsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDbkMsVUFBVSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztDQUN0QyxDQUFDLENBQUM7QUFFSCxNQUFNLFdBQVcsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQzNCLEtBQUssRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFO0lBQ3pCLFFBQVEsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0NBQ3JCLENBQUMsQ0FBQztBQUVJLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBb0I7SUFDbkQsV0FBVztJQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDN0MsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEQsdUJBQXVCO1lBQ3ZCLE1BQU0sWUFBWSxHQUFHLE1BQU0saUJBQU0s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TSxpQkFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUN0QixJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxJQUFJLEVBQUUsRUFBRTthQUNsQyxDQUFDLENBQUM7WUFFSCxlQUFlO1lBQ2YsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTNFLE9BQU87Z0JBQ0wsS0FBSztnQkFDTCxJQUFJLEVBQUU7b0JBQ0osRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUNYLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztvQkFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2lCQUN4QjtnQkFDRCxNQUFNLEVBQUU7b0JBQ04sRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFPLENBQUMsRUFBRTtvQkFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFPLENBQUMsSUFBSTtvQkFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFPLENBQUMsS0FBSztpQkFDMUI7YUFDRixDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztRQUM5RCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmFzdGlmeUluc3RhbmNlIH0gZnJvbSAnZmFzdGlmeSc7XHJcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0JztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0BnYWxheHkvZGF0YWJhc2UnO1xyXG5pbXBvcnQge1xyXG4gIElOSVRJQUxfUExBWUVSX1JFU09VUkNFUyxcclxuICBJTklUSUFMX1JFU09VUkNFX0NBUEFDSVRZLFxyXG4gIFBMQU5FVF9CVUlMRElOR19TTE9UUyxcclxufSBmcm9tICdAZ2FsYXh5L3NoYXJlZCc7XHJcblxyXG5jb25zdCByZWdpc3RlclNjaGVtYSA9IHoub2JqZWN0KHtcclxuICBlbWFpbDogei5zdHJpbmcoKS5lbWFpbCgpLFxyXG4gIHBhc3N3b3JkOiB6LnN0cmluZygpLm1pbig4KSxcclxuICB1c2VybmFtZTogei5zdHJpbmcoKS5taW4oMykubWF4KDIwKSxcclxuICBlbXBpcmVOYW1lOiB6LnN0cmluZygpLm1pbigzKS5tYXgoMzApLFxyXG59KTtcclxuXHJcbmNvbnN0IGxvZ2luU2NoZW1hID0gei5vYmplY3Qoe1xyXG4gIGVtYWlsOiB6LnN0cmluZygpLmVtYWlsKCksXHJcbiAgcGFzc3dvcmQ6IHouc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGF1dGhSb3V0ZXMoYXBwOiBGYXN0aWZ5SW5zdGFuY2UpIHtcclxuICAvLyBSZWdpc3RlclxyXG4gIGFwcC5wb3N0KCcvcmVnaXN0ZXInLCBhc3luYyAocmVxdWVzdCwgcmVwbHkpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSByZWdpc3RlclNjaGVtYS5wYXJzZShyZXF1ZXN0LmJvZHkpO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgdXNlciBleGlzdHNcclxuICAgICAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZEZpcnN0KHtcclxuICAgICAgICB3aGVyZTogeyBPUjogW3sgZW1haWw6IGRhdGEuZW1haWwgfSwgeyB1c2VybmFtZTogZGF0YS51c2VybmFtZSB9XSB9LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChleGlzdGluZ1VzZXIpIHtcclxuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMCkuc2VuZCh7IGVycm9yOiAnVXNlciBhbHJlYWR5IGV4aXN0cycgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEhhc2ggcGFzc3dvcmRcclxuICAgICAgY29uc3QgcGFzc3dvcmRIYXNoID0gYXdhaXQgYmNyeXB0Lmhhc2goZGF0YS5wYXNzd29yZCwgMTApO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHVzZXIgd2l0aCBlbXBpcmUgaW4gdHJhbnNhY3Rpb25cclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJpc21hLiR0cmFuc2FjdGlvbihhc3luYyAodHgpID0+IHtcclxuICAgICAgICAvLyBDcmVhdGUgdXNlclxyXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCB0eC51c2VyLmNyZWF0ZSh7XHJcbiAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGVtYWlsOiBkYXRhLmVtYWlsLFxyXG4gICAgICAgICAgICBwYXNzd29yZEhhc2gsXHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiBkYXRhLnVzZXJuYW1lLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGVtcGlyZVxyXG4gICAgICAgIGNvbnN0IGVtcGlyZSA9IGF3YWl0IHR4LmVtcGlyZS5jcmVhdGUoe1xyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICB1c2VySWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgICAgIG5hbWU6IGRhdGEuZW1waXJlTmFtZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBsYW5ldFxyXG4gICAgICAgIGNvbnN0IHBsYW5ldCA9IGF3YWl0IHR4LnBsYW5ldC5jcmVhdGUoe1xyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBlbXBpcmVJZDogZW1waXJlLmlkLFxyXG4gICAgICAgICAgICBuYW1lOiAnUGxhbmV0YSBQcmluY2lwYWwnLFxyXG4gICAgICAgICAgICB0eXBlOiAnSEFCSVRBQkxFJyxcclxuICAgICAgICAgICAgbWF4QnVpbGRpbmdTbG90czogUExBTkVUX0JVSUxESU5HX1NMT1RTLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgY2VudGVyU2xvdCA9IE1hdGguZmxvb3IoUExBTkVUX0JVSUxESU5HX1NMT1RTIC8gMik7XHJcbiAgICAgICAgY29uc3QgaW5pdGlhbEJ1aWxkaW5ncyA9IFtcclxuICAgICAgICAgIHsgdHlwZTogJ2NvbnRyb2xfY2VudGVyJywgc2xvdEluZGV4OiBjZW50ZXJTbG90IH0sXHJcbiAgICAgICAgICB7IHR5cGU6ICdtZXRhbF9leHRyYWN0b3InLCBzbG90SW5kZXg6IDAgfSxcclxuICAgICAgICAgIHsgdHlwZTogJ3BsYXNtYV9yZWZpbmVyeScsIHNsb3RJbmRleDogMSB9LFxyXG4gICAgICAgICAgeyB0eXBlOiAncmVzZWFyY2hfbGFiJywgc2xvdEluZGV4OiAyIH0sXHJcbiAgICAgICAgICB7IHR5cGU6ICdzaGlweWFyZCcsIHNsb3RJbmRleDogMyB9LFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgYnVpbGRpbmcgb2YgaW5pdGlhbEJ1aWxkaW5ncykge1xyXG4gICAgICAgICAgYXdhaXQgdHguYnVpbGRpbmcuY3JlYXRlKHtcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgIHBsYW5ldElkOiBwbGFuZXQuaWQsXHJcbiAgICAgICAgICAgICAgLi4uYnVpbGRpbmcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSByZXNvdXJjZXNcclxuICAgICAgICAvLyBERVZfTU9ERTogSGlnaCByZXNvdXJjZXMgZm9yIGRldmVsb3BtZW50IHRlc3RpbmdcclxuICAgICAgICBjb25zdCBpc0RldkhpZ2hSZXNvdXJjZXMgPSBwcm9jZXNzLmVudi5ERVZfSElHSF9TVEFSVElOR19SRVNPVVJDRVMgPT09ICd0cnVlJztcclxuICAgICAgICBjb25zdCBkZXZBbW91bnQgPSAxXzAwMF8wMDA7XHJcbiAgICAgICAgY29uc3QgZGV2Q2FwYWNpdHkgPSAxMDBfMDAwXzAwMDtcclxuICAgICAgICBhd2FpdCB0eC5yZXNvdXJjZS5jcmVhdGVNYW55KHtcclxuICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGVtcGlyZUlkOiBlbXBpcmUuaWQsXHJcbiAgICAgICAgICAgICAgdHlwZTogJ01FVEFMJyxcclxuICAgICAgICAgICAgICBhbW91bnQ6IGlzRGV2SGlnaFJlc291cmNlcyA/IGRldkFtb3VudCA6IElOSVRJQUxfUExBWUVSX1JFU09VUkNFUy5tZXRhbCxcclxuICAgICAgICAgICAgICBjYXBhY2l0eTogaXNEZXZIaWdoUmVzb3VyY2VzID8gZGV2Q2FwYWNpdHkgOiBJTklUSUFMX1JFU09VUkNFX0NBUEFDSVRZLm1ldGFsLFxyXG4gICAgICAgICAgICAgIHByb2R1Y3Rpb25QZXJIb3VyOiAxMDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBlbXBpcmVJZDogZW1waXJlLmlkLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdQTEFTTUEnLFxyXG4gICAgICAgICAgICAgIGFtb3VudDogaXNEZXZIaWdoUmVzb3VyY2VzID8gZGV2QW1vdW50IDogSU5JVElBTF9QTEFZRVJfUkVTT1VSQ0VTLnBsYXNtYSxcclxuICAgICAgICAgICAgICBjYXBhY2l0eTogaXNEZXZIaWdoUmVzb3VyY2VzID8gZGV2Q2FwYWNpdHkgOiBJTklUSUFMX1JFU09VUkNFX0NBUEFDSVRZLnBsYXNtYSxcclxuICAgICAgICAgICAgICBwcm9kdWN0aW9uUGVySG91cjogNTAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBlbXBpcmVJZDogZW1waXJlLmlkLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdDUkVESVRTJyxcclxuICAgICAgICAgICAgICBhbW91bnQ6IGlzRGV2SGlnaFJlc291cmNlcyA/IGRldkFtb3VudCA6IElOSVRJQUxfUExBWUVSX1JFU09VUkNFUy5jcmVkaXRzLFxyXG4gICAgICAgICAgICAgIGNhcGFjaXR5OiBJTklUSUFMX1JFU09VUkNFX0NBUEFDSVRZLmNyZWRpdHMsXHJcbiAgICAgICAgICAgICAgcHJvZHVjdGlvblBlckhvdXI6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIHRlY2hub2xvZ2llc1xyXG4gICAgICAgIC8vIFRpZXIgMSAobm8gcmVxdWlyZWRUZWNoSWQpIGFyZSBBVkFJTEFCTEUgZm9yIHJlc2VhcmNoXHJcbiAgICAgICAgLy8gT3RoZXJzIGFyZSBMT0NLRUQgdW50aWwgcHJlcmVxdWlzaXRlcyBhcmUgbWV0XHJcbiAgICAgICAgY29uc3QgYWxsVGVjaHMgPSBhd2FpdCB0eC50ZWNobm9sb2d5LmZpbmRNYW55KCk7XHJcbiAgICAgICAgaWYgKGFsbFRlY2hzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGZvciAoY29uc3QgdGVjaCBvZiBhbGxUZWNocykge1xyXG4gICAgICAgICAgICBjb25zdCBzdGF0dXMgPSB0ZWNoLnJlcXVpcmVkVGVjaElkID8gJ0xPQ0tFRCcgOiAnQVZBSUxBQkxFJztcclxuICAgICAgICAgICAgYXdhaXQgdHguZW1waXJlVGVjaG5vbG9neS5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIGVtcGlyZUlkOiBlbXBpcmUuaWQsXHJcbiAgICAgICAgICAgICAgICB0ZWNobm9sb2d5SWQ6IHRlY2guaWQsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogMCxcclxuICAgICAgICAgICAgICAgIHN0YXR1cyxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7IHVzZXIsIGVtcGlyZSB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEdlbmVyYXRlIEpXVFxyXG4gICAgICBjb25zdCB0b2tlbiA9IGFwcC5qd3Quc2lnbih7IHVzZXJJZDogcmVzdWx0LnVzZXIuaWQsIGVtcGlyZUlkOiByZXN1bHQuZW1waXJlLmlkIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0b2tlbixcclxuICAgICAgICB1c2VyOiB7XHJcbiAgICAgICAgICBpZDogcmVzdWx0LnVzZXIuaWQsXHJcbiAgICAgICAgICBlbWFpbDogcmVzdWx0LnVzZXIuZW1haWwsXHJcbiAgICAgICAgICB1c2VybmFtZTogcmVzdWx0LnVzZXIudXNlcm5hbWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXBpcmU6IHtcclxuICAgICAgICAgIGlkOiByZXN1bHQuZW1waXJlLmlkLFxyXG4gICAgICAgICAgbmFtZTogcmVzdWx0LmVtcGlyZS5uYW1lLFxyXG4gICAgICAgICAgbGV2ZWw6IHJlc3VsdC5lbXBpcmUubGV2ZWwsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ2lzdHJhdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiByZXBseS5zdGF0dXMoNTAwKS5zZW5kKHsgZXJyb3I6ICdGYWlsZWQgdG8gcmVnaXN0ZXInIH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBMb2dpblxyXG4gIGFwcC5wb3N0KCcvbG9naW4nLCBhc3luYyAocmVxdWVzdCwgcmVwbHkpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBsb2dpblNjaGVtYS5wYXJzZShyZXF1ZXN0LmJvZHkpO1xyXG5cclxuICAgICAgLy8gRmluZCB1c2VyXHJcbiAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcclxuICAgICAgICB3aGVyZTogeyBlbWFpbDogZGF0YS5lbWFpbCB9LFxyXG4gICAgICAgIGluY2x1ZGU6IHsgZW1waXJlOiB0cnVlIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF1c2VyIHx8ICF1c2VyLmlzQWN0aXZlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg0MDEpLnNlbmQoeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWZXJpZnkgcGFzc3dvcmRcclxuICAgICAgY29uc3QgdmFsaWQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShkYXRhLnBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkSGFzaCk7XHJcbiAgICAgIGlmICghdmFsaWQpIHtcclxuICAgICAgICByZXR1cm4gcmVwbHkuc3RhdHVzKDQwMSkuc2VuZCh7IGVycm9yOiAnSW52YWxpZCBjcmVkZW50aWFscycgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBsYXN0IGxvZ2luXHJcbiAgICAgIGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XHJcbiAgICAgICAgd2hlcmU6IHsgaWQ6IHVzZXIuaWQgfSxcclxuICAgICAgICBkYXRhOiB7IGxhc3RMb2dpbkF0OiBuZXcgRGF0ZSgpIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gR2VuZXJhdGUgSldUXHJcbiAgICAgIGNvbnN0IHRva2VuID0gYXBwLmp3dC5zaWduKHsgdXNlcklkOiB1c2VyLmlkLCBlbXBpcmVJZDogdXNlci5lbXBpcmUhLmlkIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0b2tlbixcclxuICAgICAgICB1c2VyOiB7XHJcbiAgICAgICAgICBpZDogdXNlci5pZCxcclxuICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbXBpcmU6IHtcclxuICAgICAgICAgIGlkOiB1c2VyLmVtcGlyZSEuaWQsXHJcbiAgICAgICAgICBuYW1lOiB1c2VyLmVtcGlyZSEubmFtZSxcclxuICAgICAgICAgIGxldmVsOiB1c2VyLmVtcGlyZSEubGV2ZWwsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0xvZ2luIGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIHJlcGx5LnN0YXR1cyg1MDApLnNlbmQoeyBlcnJvcjogJ0ZhaWxlZCB0byBsb2dpbicgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuIl19