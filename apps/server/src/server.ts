import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { pino } from 'pino';
import { env } from './config/env.js';
import { redisClient } from './config/redis.js';
import { authenticate } from './middleware/authenticate.js';
import { requireRole } from './middleware/requireRole.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import configRoutes, { seedDefaultConfig } from './routes/configRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import socialRoutes, { seedDefaultSocials } from './routes/socialRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

const app: Application = express();

// ─── Core middleware pipeline ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  // Accept comma-separated list of allowed origins e.g. "https://a.vercel.app,http://localhost:5173"
  origin: (origin, callback) => {
    const allowed = env.CORS_ORIGIN.split(',').map((o) => o.trim());
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ─── Utility routes ───────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API Gateway is active' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────

// Auth — public (no guard)
app.use('/api/auth', authRoutes);

// Projects — GET is public, mutating methods require admin
app.use(
  '/api/projects',
  (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') return next();
    authenticate(req, res, () => requireRole('admin')(req, res, next));
  },
  projectRoutes
);

// Media — GET /api/media is public; POST/PATCH/DELETE and /admin require auth
app.use('/api/media', mediaRoutes);

// Config — GET is public; PATCH and image upload require admin
app.use('/api/config', configRoutes);

// Contact — POST is public; GET/PATCH/DELETE require admin
app.use('/api/contact', contactRoutes);

// Social links — GET is public; all mutations require admin
app.use('/api/socials', socialRoutes);

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    logger.info('Connected to MongoDB successfully.');

    // Seed default site config keys if not already present
    await seedDefaultConfig();
    logger.info('Site config seeded.');

    // Seed default social links if collection is empty
    await seedDefaultSocials();
    logger.info('Social links seeded.');

    logger.info('Connecting to Redis...');
    await redisClient.connect();
    logger.info('Connected to Redis successfully.');

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
