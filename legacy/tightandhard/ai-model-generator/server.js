const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import generators and packagers
const ModelGenerator = require('./generators/ModelGenerator');
const ModelPackager = require('./packager/ModelPackager');
const StableDiffusionGenerator = require('./generators/StableDiffusionGenerator');

// Initialize app
const app = express();
const PORT = process.env.API_PORT || 5002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize generators
const modelGenerator = new ModelGenerator();
const modelPackager = new ModelPackager();
const sdGenerator = new StableDiffusionGenerator();

// Middleware for request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'TightandHard AI Model Generator API',
    version: '1.0.0'
  });
});

// Get all available personas
app.get('/api/personas', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const personasPath = path.join(__dirname, 'templates/personas.json');
    const personasData = await fs.readFile(personasPath, 'utf8');
    const personas = JSON.parse(personasData);
    
    res.json({
      success: true,
      personas: personas.personas,
      voiceStyles: personas.voiceStyles,
      styleProfiles: personas.styleProfiles
    });
  } catch (error) {
    console.error('Error loading personas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load personas' 
    });
  }
});

// Get outfit templates
app.get('/api/outfit-templates', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const templatesPath = path.join(__dirname, 'templates/outfit_templates.json');
    const templatesData = await fs.readFile(templatesPath, 'utf8');
    const templates = JSON.parse(templatesData);
    
    res.json({
      success: true,
      categories: templates.outfitCategories,
      colorPalettes: templates.colorPalettes,
      styleCombinations: templates.styleCombinations
    });
  } catch (error) {
    console.error('Error loading outfit templates:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load outfit templates' 
    });
  }
});

// Generate a new model
app.post('/api/models/generate', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const {
      personaType,
      customizations = {},
      ownerName,
      modelName = null
    } = req.body;

    // Validate required fields
    if (!personaType) {
      return res.status(400).json({
        success: false,
        error: 'personaType is required'
      });
    }

    console.log(`Generating model with persona: ${personaType}`);
    
    // Generate model
    const model = await modelGenerator.generateModel({
      personaType,
      customizations,
      ownerName,
      modelName
    });

    const duration = (Date.now() - startTime) / 1000;
    
    res.json({
      success: true,
      model: model,
      generationTime: duration,
      message: `Model "${model.name}" generated successfully`
    });
    
    console.log(`✅ Model generated in ${duration}s: ${model.name}`);
    
  } catch (error) {
    console.error('Error generating model:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate model'
    });
  }
});

// Package a model for delivery
app.post('/api/models/package', async (req, res) => {
  try {
    const { modelData, saleData } = req.body;

    // Validate required fields
    if (!modelData) {
      return res.status(400).json({
        success: false,
        error: 'modelData is required'
      });
    }

    console.log(`Packaging model: ${modelData.name}`);
    
    // Package model
    const package = await modelPackager.packageForSale(modelData, saleData);
    
    res.json({
      success: true,
      package: package,
      message: 'Model packaged successfully'
    });
    
    console.log(`✅ Package created: ${package.packageId}`);
    
  } catch (error) {
    console.error('Error packaging model:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to package model'
    });
  }
});

// Generate images for a model
app.post('/api/models/generate-images', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { modelData } = req.body;

    // Validate required fields
    if (!modelData) {
      return res.status(400).json({
        success: false,
        error: 'modelData is required'
      });
    }

    console.log(`Generating images for model: ${modelData.name}`);
    
    // Generate images
    const images = await sdGenerator.generateModelImages(modelData);
    
    const duration = (Date.now() - startTime) / 1000;
    
    res.json({
      success: true,
      images: images,
      generationTime: duration,
      message: 'Images generated successfully'
    });
    
    console.log(`✅ Images generated in ${duration}s for ${modelData.name}`);
    
  } catch (error) {
    console.error('Error generating images:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate images'
    });
  }
});

// Get package status
app.get('/api/models/package/:packageId/status', async (req, res) => {
  try {
    const { packageId } = req.params;
    
    const package = await modelPackager.getPackage(packageId);
    
    if (!package) {
      return res.status(404).json({
        success: false,
        error: 'Package not found'
      });
    }
    
    // Check if expired
    const expiresAt = new Date(package.expiresAt);
    const isExpired = new Date() > expiresAt;
    
    res.json({
      success: true,
      package: package,
      status: isExpired ? 'expired' : 'active',
      expiresAt: package.expiresAt,
      isExpired: isExpired
    });
    
  } catch (error) {
    console.error('Error getting package status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get package status'
    });
  }
});

// Download package (stream)
app.get('/api/models/download/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    
    const package = await modelPackager.getPackage(packageId);
    
    if (!package) {
      return res.status(404).json({
        success: false,
        error: 'Package not found'
      });
    }
    
    // Check if expired
    const expiresAt = new Date(package.expiresAt);
    if (new Date() > expiresAt) {
      return res.status(410).json({
        success: false,
        error: 'Package has expired'
      });
    }
    
    // Check download count
    if (package.downloadCount >= package.maxDownloads) {
      return res.status(429).json({
        success: false,
        error: 'Maximum downloads reached'
      });
    }
    
    // Stream the file
    const fs = require('fs');
    const path = require('path');
    const zipPath = path.join(modelPackager.outputPath, package.zipPath);
    
    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({
        success: false,
        error: 'Package file not found'
      });
    }
    
    res.download(zipPath, (err) => {
      if (err) {
        console.error('Error downloading package:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to download package'
        });
      }
    });
    
  } catch (error) {
    console.error('Error downloading package:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download package'
    });
  }
});

// Get generation statistics
app.get('/api/stats', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const outputDir = path.join(__dirname, 'output/generated_models');
    
    // Count generated models
    let totalModels = 0;
    try {
      const modelDirs = await fs.readdir(outputDir);
      totalModels = modelDirs.length;
    } catch (error) {
      // Directory doesn't exist yet
    }
    
    // Count packages
    const packagesDir = path.join(__dirname, 'output/packages');
    let totalPackages = 0;
    try {
      const packageDirs = await fs.readdir(packagesDir);
      totalPackages = packageDirs.length;
    } catch (error) {
      // Directory doesn't exist yet
    }
    
    res.json({
      success: true,
      stats: {
        totalModels: totalModels,
        totalPackages: totalPackages,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      }
    });
    
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎨 TightandHard AI Model Generator API                      ║
║                                                               ║
║   Status: Running ✅                                          ║
║   Port: ${PORT}                                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}       ║
║                                                               ║
║   Available Endpoints:                                        ║
║   - GET  /health                                              ║
║   - GET  /api/personas                                        ║
║   - GET  /api/outfit-templates                                ║
║   - POST /api/models/generate                                 ║
║   - POST /api/models/package                                  ║
║   - POST /api/models/generate-images                          ║
║   - GET  /api/models/package/:packageId/status                ║
║   - GET  /api/models/download/:packageId                      ║
║   - GET  /api/stats                                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;