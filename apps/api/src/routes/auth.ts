import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@galaxy/database';

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
          },
        });

        // Create initial buildings
        const initialBuildings = [
          { type: 'COMMAND_CENTER', slotIndex: 4 },
          { type: 'METAL_MINE', slotIndex: 0 },
          { type: 'PLASMA_EXTRACTOR', slotIndex: 1 },
          { type: 'SHIPYARD', slotIndex: 2 },
          { type: 'RESEARCH_LAB', slotIndex: 3 },
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
        await tx.resource.createMany({
          data: [
            { empireId: empire.id, type: 'METAL', amount: 500, capacity: 1000, productionPerHour: 100 },
            { empireId: empire.id, type: 'PLASMA', amount: 200, capacity: 1000, productionPerHour: 50 },
            { empireId: empire.id, type: 'CREDITS', amount: 1000, capacity: 999999999, productionPerHour: 0 },
          ],
        });

        // Initialize technologies
        // Tier 1 (no requiredTechId) are AVAILABLE for research
        // Others are LOCKED until prerequisites are met
        const allTechs = await tx.technology.findMany();
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
