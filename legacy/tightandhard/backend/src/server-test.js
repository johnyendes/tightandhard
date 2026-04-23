const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes (they won't work without DB but server will start)
const memorySystemRoutes = require('./routes/memorySystemRoutes');
const bondingTierRoutes = require('./routes/bondingTierRoutes');
const mirrorLearningRoutes = require('./routes/mirrorLearningRoutes');
const outfitDresserRoutes = require('./routes/outfitDresserRoutes');
const sceneEngineRoutes = require('./routes/sceneEngineRoutes');
const voiceSynthesisRoutes = require('./routes/voiceSynthesisRoutes');
const emotionEngineRoutes = require('./routes/emotionEngineRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    note: 'Running in test mode without database'
  });
});

// API routes
app.use('/api/emotion', emotionEngineRoutes);
app.use('/api/bonding', bondingTierRoutes);
app.use('/api/memory', memorySystemRoutes);
app.use('/api/mirror', mirrorLearningRoutes);
app.use('/api/outfit', outfitDresserRoutes);
app.use('/api/scene', sceneEngineRoutes);
app.use('/api/voice', voiceSynthesisRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TightandHard.com API',
    version: '1.0.0',
    description: 'AI Companion System Backend (Test Mode)',
    note: 'This server is running in test mode without database connections',
    endpoints: {
      health: '/api/health',
      emotion: '/api/emotion',
      bonding: '/api/bonding',
      memory: '/api/memory',
      mirror: '/api/mirror',
      outfit: '/api/outfit',
      scene: '/api/scene',
      voice: '/api/voice'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Starting TightandHard.com API Server (Test Mode)...');
  console.log('⚠️  Running in TEST MODE - Database connections disabled');
  console.log('✅ Server successfully started!');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API documentation: http://localhost:${PORT}/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;