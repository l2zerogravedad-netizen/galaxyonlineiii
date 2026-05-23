import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { prisma } from '@galaxy/database';
import { authRoutes } from './routes/auth';
import { empireRoutes } from './routes/empire';
import { planetRoutes } from './routes/planet';
import { researchRoutes } from './routes/research';
import { shipyardRoutes } from './routes/shipyard';

const app = fastify({ logger: true });

// Plugins
app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret-change-in-production' });

// Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(empireRoutes, { prefix: '/api/empire' });
app.register(planetRoutes, { prefix: '/api/planets' });
app.register(researchRoutes, { prefix: '/api/research' });

// Health check
app.get('/health', async () => ({ status: 'ok', time: new Date().toISOString() }));

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`API running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
