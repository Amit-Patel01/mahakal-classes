import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import v1Routes from './routes/v1';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Security Headers with relaxed policies for PDF & media streaming
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    frameguard: false, // Allows browser iframes to preview PDFs and media
    contentSecurityPolicy: false,
  })
);

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        env.CORS_ORIGINS.includes('*') ||
        env.CORS_ORIGINS.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked this origin'));
      }
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Global API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
app.use('/api', apiLimiter);

// Mount V1 API Routes
app.use('/api/v1', v1Routes);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Mahakal Classes Education Platform API',
    documentation: '/docs',
    health: '/api/v1/health',
    version: '1.0.0',
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
