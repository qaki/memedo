import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './utils/env-validator.js';
import { ensureSchema } from './db/ensure-schema.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import twoFARoutes from './routes/2fa.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

// Environment variables are validated on import (fail-fast)
const app = express();
const PORT = parseInt(env.PORT, 10);
const FRONTEND_URL = env.FRONTEND_URL;

// Middleware - CORS configuration for production
const allowedOrigins = [
  FRONTEND_URL, // From env (http://localhost:5173 in dev)
  'https://meme-go.com',
  'https://www.meme-go.com',
  'https://meme-do.com',
  'https://www.meme-do.com',
  'http://localhost:5173', // Explicit dev origin
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'memedo-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/2fa', twoFARoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'MemeDo API v1',
      endpoints: {
        health: '/health',
        api: '/api',
        auth: '/api/auth',
        user: '/api/user',
        analysis: '/api/analysis',
        analytics: '/api/analytics (admin only)',
        subscription: '/api/subscription',
        webhooks: '/api/webhooks',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server with schema verification
async function startServer() {
  try {
    // Ensure database schema is up-to-date before starting server
    await ensureSchema();

    app.listen(PORT, () => {
      console.log(`✅ MemeDo Backend running on http://localhost:${PORT}`);
      console.log(`✅ Frontend allowed from: ${FRONTEND_URL}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
