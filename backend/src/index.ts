import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from '@/utils/logger';
import { connectDatabase } from '@/database/connection';
import { connectRedis } from '@/database/redis';
import { errorHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';
import { validationMiddleware } from '@/middleware/validation';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import economyRoutes from '@/routes/economy';
import inventoryRoutes from '@/routes/inventory';
import shipsRoutes from '@/routes/ships';
import marketplaceRoutes from '@/routes/marketplace';
import combatRoutes from '@/routes/combat';

// Import WebSocket handlers
import { initializeWebSocket } from '@/websocket/index';

// Load environment variables
dotenv.config();

class DestockSpaceBackend {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Type']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Custom middleware to set client type
    this.app.use((req, res, next) => {
      const clientType = req.headers['x-client-type'] as string;
      req.clientType = clientType || 'unknown';
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', authMiddleware, userRoutes);
    this.app.use('/api/v1/economy', authMiddleware, economyRoutes);
    this.app.use('/api/v1/inventory', authMiddleware, inventoryRoutes);
    this.app.use('/api/v1/ships', authMiddleware, shipsRoutes);
    this.app.use('/api/v1/marketplace', authMiddleware, marketplaceRoutes);
    this.app.use('/api/v1/combat', authMiddleware, combatRoutes);

    // API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        message: 'DESTOCK SPACE API Documentation',
        version: 'v1',
        endpoints: {
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          economy: '/api/v1/economy',
          inventory: '/api/v1/inventory',
          ships: '/api/v1/ships',
          marketplace: '/api/v1/marketplace',
          combat: '/api/v1/combat'
        },
        documentation: 'https://docs.destockspace.com/api'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found',
          path: req.originalUrl
        }
      });
    });
  }

  private initializeWebSocket(): void {
    initializeWebSocket(this.io);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      logger.info('Database connected successfully');

      // Connect to Redis
      await connectRedis();
      logger.info('Redis connected successfully');

      // Start server
      const port = process.env.PORT || 3000;
      this.server.listen(port, () => {
        logger.info(`🚀 DESTOCK SPACE Backend started on port ${port}`);
        logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🔗 WebSocket server initialized`);
        logger.info(`📖 API Documentation: http://localhost:${port}/api/docs`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    this.server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close database connections
        const { closeDatabase } = await import('@/database/connection');
        await closeDatabase();
        logger.info('Database connections closed');

        // Close Redis connections
        const { closeRedis } = await import('@/database/redis');
        await closeRedis();
        logger.info('Redis connections closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  }
}

// Start the backend
const backend = new DestockSpaceBackend();
backend.start().catch((error) => {
  logger.error('Failed to start backend:', error);
  process.exit(1);
});

export default backend;
