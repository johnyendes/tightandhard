const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configurations
const { sequelize, testConnection, syncDatabase } = require('./config/database');
const { testConnection: testRedisConnection } = require('./config/redis');

// Import models
const { setupAssociations } = require('./models');

// Import routes
const emotionEngineRoutes = require('./routes/emotionEngineRoutes');
const bondingTierRoutes = require('./routes/bondingTierRoutes');
const memorySystemRoutes = require('./routes/memorySystemRoutes');
const mirrorLearningRoutes = require('./routes/mirrorLearningRoutes');
const outfitDresserRoutes = require('./routes/outfitDresserRoutes');
const sceneEngineRoutes = require('./routes/sceneEngineRoutes');
const voiceSynthesisRoutes = require('./routes/voiceSynthesisRoutes');
const autoRepairRoutes = require('./routes/autoRepairRoutes');
const characterGeneratorRoutes = require('./routes/characterGeneratorRoutes');

// Import auto-repair orchestrator
const { getAutoRepairOrchestrator } = require('./services/AutoRepairOrchestrator');

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
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
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
    autoRepair: process.env.AUTO_REPAIR_ENABLED === 'true'
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
app.use('/api/auto-repair', autoRepairRoutes);
app.use('/api/character-generator', characterGeneratorRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TightandHard.com API',
    version: '1.0.0',
    description: 'AI Companion System Backend with Auto-Repair',
    endpoints: {
      health: '/api/health',
      emotion: '/api/emotion',
      bonding: '/api/bonding',
      memory: '/api/memory',
      mirror: '/api/mirror',
      outfit: '/api/outfit',
      scene: '/api/scene',
      voice: '/api/voice',
      autoRepair: '/api/auto-repair'
    },
    features: [
      'Emotional Intelligence',
      'Memory Management',
      'Bonding Progression',
      'Auto-Repair System',
      'Real-time Monitoring'
    ]
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

// Initialize database and start server
const initializeServer = async () => {
  try {
    console.log('🚀 Starting TightandHard.com API Server...');
    
    // Test database connection
    console.log('📊 Connecting to database...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Test Redis connection
    console.log('🔴 Connecting to Redis...');
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      console.warn('⚠️  Redis connection failed, continuing without cache...');
    }
    
    // Setup model associations
    console.log('🔗 Setting up model associations...');
    setupAssociations();
    
    // Sync database
    console.log('🔄 Syncing database schema...');
    const syncSuccess = await syncDatabase(false);
    if (!syncSuccess) {
      throw new Error('Database synchronization failed');
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('✅ Server successfully started!');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📖 API documentation: http://localhost:${PORT}/`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔧 Auto-Repair: ${process.env.AUTO_REPAIR_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
    });

    // Initialize and start auto-repair system if enabled
    if (process.env.AUTO_REPAIR_ENABLED === 'true') {
      try {
        console.log('🔧 Initializing Auto-Repair System...');
        const autoRepairOrchestrator = getAutoRepairOrchestrator(app, sequelize);
        await autoRepairOrchestrator.start();
        console.log('✅ Auto-Repair System started successfully');
      } catch (error) {
        console.error('⚠️  Failed to start Auto-Repair System:', error.message);
        console.log('⚠️  Continuing without auto-repair...');
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  
  // Stop auto-repair system
  if (process.env.AUTO_REPAIR_ENABLED === 'true') {
    const { autoRepairOrchestrator } = require('./services/AutoRepairOrchestrator');
    if (autoRepairOrchestrator) {
      await autoRepairOrchestrator.stop();
    }
  }
  
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  
  // Stop auto-repair system
  if (process.env.AUTO_REPAIR_ENABLED === 'true') {
    const { autoRepairOrchestrator } = require('./services/AutoRepairOrchestrator');
    if (autoRepairOrchestrator) {
      await autoRepairOrchestrator.stop();
    }
  }
  
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Start the server
initializeServer();

module.exports = app;