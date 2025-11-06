import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './utils/env-validator';

// Environment variables are validated on import (fail-fast)
const app = express();
const PORT = parseInt(env.PORT, 10);
const FRONTEND_URL = env.FRONTEND_URL;

// Middleware - CORS configuration for production
const allowedOrigins = [
  FRONTEND_URL, // From env (http://localhost:5173 in dev)
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

// API routes placeholder
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'MemeDo API v1',
      endpoints: {
        health: '/health',
        api: '/api',
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ MemeDo Backend running on http://localhost:${PORT}`);
  console.log(`✅ Frontend allowed from: ${FRONTEND_URL}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
