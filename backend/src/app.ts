import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

export const createApp = (): express.Application => {
  const app = express();

  // Helmet with relaxed cross-origin policies for secure local dev previews
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // Strict CORS setup
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Static uploads directory serving
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      platform: 'PathBack — Finding a safer path back home.',
      tagline: 'Finding a safer path back home.',
      version: '1.0.0',
      demoMode: env.DEMO_MODE,
      devOtpMode: env.DEV_OTP_MODE,
    });
  });

  // Main API Routes with rate limiter
  app.use('/api', apiLimiter, apiRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found on PathBack platform.' });
  });

  // Global structured error handler
  app.use(errorHandler);

  return app;
};
