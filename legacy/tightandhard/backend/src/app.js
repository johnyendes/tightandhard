const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const emotionRoutes = require('./routes/emotionEngineRoutes');
const bondingRoutes = require('./routes/bondingTierRoutes');
const memoryRoutes = require('./routes/memorySystemRoutes');
const mirrorRoutes = require('./routes/mirrorLearningRoutes');
const outfitRoutes = require('./routes/outfitDresserRoutes');
const sceneRoutes = require('./routes/sceneEngineRoutes');
const voiceRoutes = require('./routes/voiceSynthesisRoutes');
const autoRepairRoutes = require('./routes/autoRepairRoutes');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandlers');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

// Health check endpoint (before auth)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    autoRepair: process.env.AUTO_REPAIR_ENABLED === 'true'
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'AI Companion API',
    version: '1.0.0',
    description: 'RESTful API for AI Companion System with Auto-Repair',
    endpoints: {
      emotion: '/api/emotion',
      bonding: '/api/bonding',
      memory: '/api/memory',
      mirror: '/api/mirror',
      outfits: '/api/outfits',
      scenes: '/api/scenes',
      voice: '/api/voice',
      autoRepair: '/api/auto-repair'
    },
    documentation: 'https://docs.ai-companion.com',
    features: [
      'Emotional Intelligence',
      'Memory Management',
      'Bonding Progression',
      'Auto-Repair System',
      'Real-time Monitoring'
    ]
  });
});

// Protected routes (require authentication)
app.use('/api/emotion', authenticateToken, emotionRoutes);
app.use('/api/bonding', authenticateToken, bondingRoutes);
app.use('/api/memory', authenticateToken, memoryRoutes);
app.use('/api/mirror', authenticateToken, mirrorRoutes);
app.use('/api/outfits', authenticateToken, outfitRoutes);
app.use('/api/scenes', authenticateToken, sceneRoutes);
app.use('/api/voice', authenticateToken, voiceRoutes);

// Auto-repair routes (require admin)
app.use('/api/auto-repair', autoRepairRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;