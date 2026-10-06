import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

export const createApp = (): express.Application => {
  const app = express();

  // Helmet with relaxed cross-origin policies for secure previews & assets
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // Robust CORS setup supporting local dev, Render, Vercel, and custom CLIENT_URL
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app') || env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(null, true); // Permissive fallback for seamless hackathon & demo deployment
        }
      },
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
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
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

  // Serve frontend static assets if built in monorepo
  const frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');
  const localFrontendDistPath = path.resolve(process.cwd(), 'public');

  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else if (fs.existsSync(localFrontendDistPath)) {
    app.use(express.static(localFrontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(localFrontendDistPath, 'index.html'));
    });
  } else {
    // 404 handler for API/non-static routes
    app.use((_req, res) => {
      res.status(404).json({ success: false, message: 'Resource not found on PathBack platform.' });
    });
  }

  // Global structured error handler
  app.use(errorHandler);

  return app;
};
