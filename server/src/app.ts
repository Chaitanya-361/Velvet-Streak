import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import habitRoutes from './routes/habit.routes';
import checkinRoutes from './routes/checkin.routes';
import restdayRoutes from './routes/restday.routes';
import todoRoutes from './routes/todo.routes';
import statsRoutes from './routes/stats.routes';
import zenRoutes from './routes/zen.routes';

export function createApp() {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Rate limiting
  app.use(globalLimiter);

  // Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('short'));
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        store: 'in-memory',
      },
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/habits', habitRoutes);
  app.use('/api/checkins', checkinRoutes);
  app.use('/api/restdays', restdayRoutes);
  app.use('/api/todos', todoRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/zen', zenRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
