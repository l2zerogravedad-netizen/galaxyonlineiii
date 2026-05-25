import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@galaxy/database';
import {
  INITIAL_PLAYER_RESOURCES,
  INITIAL_RESOURCE_CAPACITY,
  PLANET_BUILDING_SLOTS,
} from '@galaxy/shared';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(20),
  empireName: z.string().min(3).max(30),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/register', async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: data.email }, { username: data.username }] },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create user with empire in transaction
      const result = await prisma.$transaction(async (tx) => {
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
            maxBuildingSlots: PLANET_BUILDING_SLOTS,
          },
        });

        const centerSlot = Math.floor(PLANET_BUILDING_SLOTS / 2);
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
        const devAmount = 1_000_000;
        const devCapacity = 100_000_000;
        await tx.resource.createMany({
          data: [
            {
              empireId: empire.id,
              type: 'METAL',
              amount: isDevHighResources ? devAmount : INITIAL_PLAYER_RESOURCES.metal,
              capacity: isDevHighResources ? devCapacity : INITIAL_RESOURCE_CAPACITY.metal,
              productionPerHour: 100,
            },
            {
              empireId: empire.id,
              type: 'PLASMA',
              amount: isDevHighResources ? devAmount : INITIAL_PLAYER_RESOURCES.plasma,
              capacity: isDevHighResources ? devCapacity : INITIAL_RESOURCE_CAPACITY.plasma,
              productionPerHour: 50,
            },
            {
              empireId: empire.id,
              type: 'CREDITS',
              amount: isDevHighResources ? devAmount : INITIAL_PLAYER_RESOURCES.credits,
              capacity: INITIAL_RESOURCE_CAPACITY.credits,
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
    } catch (error) {
      console.error('Registration error:', error);
      return reply.status(500).send({ error: 'Failed to register' });
    }
  });

  // Login
  app.post('/login', async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: { empire: true },
      });

      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Verify password
      const valid = await bcrypt.compare(data.password, user.passwordHash);
      if (!valid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT
      const token = app.jwt.sign({ userId: user.id, empireId: user.empire!.id });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        empire: {
          id: user.empire!.id,
          name: user.empire!.name,
          level: user.empire!.level,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return reply.status(500).send({ error: 'Failed to login' });
    }
  });
}
