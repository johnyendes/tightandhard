# AI Model Generator - Implementation Guide

Complete step-by-step guide for implementing and deploying the AI Model Generation System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Testing](#test)
5. [Integration](#integration)
6. [Deployment](#deployment)
7. [Monitoring](#monitoring)
8. [Maintenance](#maintenance)

---

## 1️⃣ Prerequisites

### System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 16GB
- GPU: 8GB VRAM (NVIDIA)
- Storage: 100GB SSD
- OS: Ubuntu 20.04+ / Windows 10+ / macOS 11+

**Recommended:**
- CPU: 8+ cores
- RAM: 32GB+
- GPU: 16GB+ VRAM (NVIDIA RTX 3070+)
- Storage: 500GB+ NVMe SSD
- OS: Ubuntu 22.04 LTS

### Software Requirements

- **Node.js**: v18.0+
- **Python**: 3.8+
- **PostgreSQL**: 14+
- **Redis**: 7+
- **Stable Diffusion**: AUTOMATIC1111 WebUI v1.6+
- **Git**: Latest

### External Services

- **Stable Diffusion API**: Local installation or cloud service
- **Email Service**: SendGrid, Mailgun, or AWS SES
- **Cloud Storage**: AWS S3, Google Cloud Storage, or similar (optional)
- **Payment Gateway**: Stripe (already integrated)

---

## 2️⃣ Installation

### Step 1: Clone Repository

```bash
cd /workspace/tightandhard
git clone <repository-url> ai-model-generator
cd ai-model-generator
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

**Key Dependencies:**
- `uuid` - Unique ID generation
- `adm-zip` - ZIP file creation
- `axios` - HTTP client for API calls
- `dotenv` - Environment variable management

### Step 3: Install Stable Diffusion

#### Option A: Local Installation (Recommended)

```bash
# Clone Stable Diffusion WebUI
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
cd stable-diffusion-webui

# Download required models
# Realistic Vision V6.0
wget https://huggingface.co/SG161222/Realistic_Vision_V6.0_NV_Beta/resolve/main/RealisticVisionV60.safetensors -O models/Stable-diffusion/RealisticVisionV60.safetensors

# ControlNet models
mkdir -p models/ControlNet
wget https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose.pth -O models/ControlNet/control_v11p_sd15_openpose.pth

# Install Python dependencies
pip install -r requirements.txt

# Start WebUI with API enabled
./webui.sh --api --listen --xformers
```

#### Option B: Cloud Service

**Replicate:**
```javascript
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const output = await replicate.run(
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  {
    input: {
      prompt: "A beautiful woman",
      negative_prompt: "ugly, deformed",
      width: 512,
      height: 768
    }
  }
);
```

**RunPod / Lambda Labs:**
- Deploy SD WebUI on GPU instances
- Configure API access
- Update environment variables

### Step 4: Configure Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit with your settings
nano .env
```

```env
# Stable Diffusion Configuration
SD_API_URL=http://127.0.0.1:7860
SD_MODEL=RealisticVisionV60.safetensors
SD_STEPS=40
SD_CFG_SCALE=7.5

# API Configuration
API_PORT=5002
API_RATE_LIMIT=100

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tightandhard
DB_USER=tightandhard
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@tightandhard.com

# Storage Configuration
STORAGE_TYPE=local  # or 's3', 'gcs'
STORAGE_PATH=./output
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Packaging
MAX_DOWNLOADS=5
DOWNLOAD_EXPIRY_DAYS=30
PACKAGE_RETENTION_DAYS=90
```

### Step 5: Initialize Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE tightandhard;"

# Run migrations
cd ../backend
npm run migrate

# Seed data (optional)
npm run seed
```

### Step 6: Start Redis

```bash
# Using Docker (recommended)
docker run -d -p 6379:6379 redis:7-alpine

# Or using system package manager
sudo systemctl start redis
```

### Step 7: Verify Installation

```bash
# Test Stable Diffusion API
curl http://127.0.0.1:7860/sdapi/v1/sd-models

# Test database connection
npm run test:db

# Test Redis connection
npm run test:redis

# Run all tests
npm test
```

---

## 3️⃣ Configuration

### Model Generator Configuration

Create `config/generator.js`:

```javascript
module.exports = {
  // Generation settings
  generation: {
    defaultPersona: 'romantic_partner',
    outfitCount: 15,
    defaultHairColor: 'brunette',
    defaultHairStyle: 'long'
  },

  // Image generation
  images: {
    width: 512,
    height: 768,
    steps: 40,
    guidanceScale: 7.5,
    batchSize: 1
  },

  // Output settings
  output: {
    format: 'json',
    compression: true,
    includeImages: true,
    imageFormat: 'png'
  },

  // Quality settings
  quality: {
    minFaceQuality: 0.8,
    minBodyQuality: 0.7,
    minOutfitQuality: 0.6
  }
};
```

### Packaging Configuration

Create `config/packager.js`:

```javascript
module.exports = {
  // Package settings
  package: {
    version: '1.0',
    compressionLevel: 9,
    includeDocumentation: true,
    includeLicense: true
  },

  // Download settings
  download: {
    maxAttempts: 5,
    expiryDays: 30,
    cleanupInterval: 86400000  // 24 hours
  },

  // Storage settings
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    path: process.env.STORAGE_PATH || './output/packages',
    bucket: process.env.AWS_S3_BUCKET,
    cdn: process.env.CDN_URL
  },

  // Security
  security: {
    encryptPackages: true,
    watermarkPreviews: true,
    verifyLicense: true
  }
};
```

### API Configuration

Create `config/api.js`:

```javascript
module.exports = {
  // Server settings
  server: {
    port: process.env.API_PORT || 5002,
    host: '0.0.0.0',
    timeout: 120000  // 2 minutes
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: process.env.API_RATE_LIMIT || 100
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiry: '24h'
  },

  // Endpoints
  endpoints: {
    generate: '/api/models/generate',
    download: '/api/models/download/:packageId',
    status: '/api/models/status/:packageId',
    personas: '/api/models/personas',
    customize: '/api/models/customize'
  }
};
```

---

## 4️⃣ Testing

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- generators/ModelGenerator.test.js

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Test model generation
npm run test:integration -- test-generation.js

# Test packaging
npm run test:integration -- test-packaging.js

# Test API endpoints
npm run test:integration -- test-api.js
```

### End-to-End Tests

```bash
# Test complete workflow
npm run test:e2e

# Test purchase workflow
npm run test:e2e -- test-purchase-workflow.js
```

### Manual Testing

#### Test Model Generation

```javascript
// test-manual-generation.js
const ModelGenerator = require('./generators/ModelGenerator');

async function testGeneration() {
  const generator = new ModelGenerator();
  
  const model = await generator.generateModel({
    personaType: 'romantic_partner',
    customizations: {
      hairColor: 'blonde',
      hairStyle: 'long'
    },
    ownerName: 'Test User',
    modelName: 'Test Model'
  });
  
  console.log('Generated model:', model);
  console.log('Outfits:', model.outfits.length);
  console.log('Persona:', model.persona.name);
}

testGeneration().catch(console.error);
```

#### Test Packaging

```javascript
// test-manual-packaging.js
const ModelPackager = require('./packager/ModelPackager');

async function testPackaging() {
  const packager = new ModelPackager();
  
  const package = await packager.packageForSale(modelData, {
    saleId: 'TEST_SALE_001',
    customerId: 'TEST_CUSTOMER_001',
    customerName: 'Test Customer'
  });
  
  console.log('Package created:', package);
  console.log('Download URL:', package.downloadUrl);
}

testPackaging().catch(console.error);
```

---

## 5️⃣ Integration

### Integration with TightandHard Backend

#### Add API Routes

Create `backend/src/routes/modelGeneratorRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const ModelGenerator = require('../../ai-model-generator/generators/ModelGenerator');
const ModelPackager = require('../../ai-model-generator/packager/ModelPackager');

const generator = new ModelGenerator();
const packager = new ModelPackager();

// Generate model on purchase
router.post('/generate', async (req, res) => {
  try {
    const { personaType, customizations, ownerName, modelName } = req.body;
    
    const model = await generator.generateModel({
      personaType,
      customizations,
      ownerName,
      modelName
    });
    
    res.json({ success: true, model });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Package for delivery
router.post('/package', async (req, res) => {
  try {
    const { modelId, saleData } = req.body;
    
    const package = await packager.packageForSale(modelData, saleData);
    
    res.json({ success: true, package });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download package
router.get('/download/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const package = await packager.getPackage(packageId);
    
    // Check if package exists and hasn't expired
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    // Stream the file
    res.download(package.zipPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### Add to Main App

In `backend/src/app.js`:

```javascript
const modelGeneratorRoutes = require('./routes/modelGeneratorRoutes');

app.use('/api/models', modelGeneratorRoutes);
```

### Stripe Webhook Integration

Create `backend/src/webhooks/stripe.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ModelGenerator = require('../../ai-model-generator/generators/ModelGenerator');
const ModelPackager = require('../../ai-model-generator/packager/ModelPackager');

const generator = new ModelGenerator();
const packager = new ModelPackager();

async function handlePaymentSuccess(session) {
  const metadata = session.metadata;
  
  // 1. Generate model
  const model = await generator.generateModel({
    personaType: metadata.personaType,
    customizations: JSON.parse(metadata.customizations || '{}'),
    ownerName: metadata.customerName,
    modelName: metadata.modelName
  });
  
  // 2. Package for delivery
  const package = await packager.packageForSale(model, {
    saleId: session.payment_intent,
    customerId: session.customer,
    customerName: metadata.customerName
  });
  
  // 3. Send email with download link
  await sendDeliveryEmail(session.customer_details.email, package);
  
  // 4. Record in database
  await recordSale(session, model, package);
}

app.post('/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handlePaymentSuccess(event.data.object);
      break;
  }
  
  res.json({received: true});
});
```

### Email Delivery System

Create `backend/src/services/emailService.js`:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

async function sendDeliveryEmail(email, package) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your TightandHard AI Companion is Ready! 🎉',
    html: `
      <h1>Your AI Companion is Ready!</h1>
      <p>Thank you for your purchase. Your unique AI companion has been generated and is ready for download.</p>
      <p><a href="${process.env.BASE_URL}${package.downloadUrl}">Download Your AI Companion</a></p>
      <p><strong>Important:</strong> This link will expire in 30 days and can be used up to 5 times.</p>
      <p>If you have any questions, please contact support@tightandhard.com</p>
      <p>Enjoy your new companion!</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

module.exports = { sendDeliveryEmail };
```

---

## 6️⃣ Deployment

### Production Deployment

#### Docker Setup

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    git

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create output directories
RUN mkdir -p output/generated_models output/packages output/temp

# Expose API port
EXPOSE 5002

# Start application
CMD ["node", "server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  model-generator:
    build: .
    ports:
      - "5002:5002"
    environment:
      - NODE_ENV=production
      - SD_API_URL=http://stable-diffusion:7860
      - DB_HOST=postgres
      - REDIS_HOST=redis
    volumes:
      - ./output:/app/output
      - ./templates:/app/templates
    depends_on:
      - postgres
      - redis
      - stable-diffusion

  stable-diffusion:
    image: stabilityai/stable-diffusion-webui:latest
    ports:
      - "7860:7860"
    volumes:
      - ./models:/app/models
    environment:
      - COMMANDLINE_ARGS=--api --listen --xformers

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: tightandhard
      POSTGRES_USER: tightandhard
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

#### Deploy to Production

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f model-generator

# Scale for high volume
docker-compose up -d --scale model-generator=3
```

#### Cloud Deployment (AWS)

**EC2 Deployment:**
```bash
# Launch EC2 instance with GPU
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repository
git clone <repo-url> /opt/tightandhard
cd /opt/tightandhard

# Deploy
docker-compose up -d
```

**ECS Deployment:**
```bash
# Push Docker image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag tightandhard-model-generator:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tightandhard-model-generator:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tightandhard-model-generator:latest

# Deploy to ECS
aws ecs update-service --cluster tightandhard --service model-generator --force-new-deployment
```

---

## 7️⃣ Monitoring

### Health Checks

Create `health.js`:

```javascript
const { performance } = require('perf_hooks');

async function checkHealth() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };

  // Check Stable Diffusion API
  try {
    const response = await axios.get(`${process.env.SD_API_URL}/sdapi/v1/sd-models`);
    health.checks.stableDiffusion = 'ok';
  } catch (error) {
    health.checks.stableDiffusion = 'error';
    health.status = 'unhealthy';
  }

  // Check database
  try {
    await sequelize.authenticate();
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'unhealthy';
  }

  // Check Redis
  try {
    await redis.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = ' 'error';
    health.status = 'unhealthy';
  }

  // Check disk space
  const diskUsage = await checkDiskSpace();
  health.checks.disk = {
    available: diskUsage.available,
    usagePercent: diskUsage.usagePercent
  };

  return health;
}

app.get('/health', async (req, res) => {
  const health = await checkHealth();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Metrics Collection

```javascript
const promClient = require('prom-client');

// Metrics
const generationCounter = new promClient.Counter({
  name: 'model_generations_total',
  help: 'Total number of models generated',
  labelNames: ['persona_type', 'status']
});

const generationDuration = new promClient.Histogram({
  name: 'model_generation_duration_seconds',
  help: 'Time taken to generate models',
  labelNames: ['persona_type'],
  buckets: [1, 5, 10, 30, 60, 120]
});

const packageCounter = new promClient.Counter({
  name: 'packages_created_total',
  help: 'Total number of packages created',
  labelNames: ['status']
});

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

### Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Model generated', { modelId, personaType });
logger.error('Generation failed', { error: err.message });
```

---

## 8️⃣ Maintenance

### Automated Tasks

Create `scripts/cleanup.js`:

```javascript
const ModelPackager = require('../packager/ModelPackager');

async function cleanupExpiredPackages() {
  const packager = new ModelPackager();
  await packager.deleteExpiredPackages();
  console.log('Cleanup complete');
}

// Run daily
cron.schedule('0 0 * * *', cleanupExpiredPackages);
```

Create `scripts/maintenance.js`:

```javascript
async function runMaintenance() {
  console.log('Starting maintenance...');
  
  // 1. Delete expired packages
  await deleteExpiredPackages();
  
  // 2. Clean up temp files
  await cleanupTempFiles();
  
  // 3. Optimize database
  await optimizeDatabase();
  
  // 4. Generate analytics report
  await generateReport();
  
  console.log('Maintenance complete');
}

// Run weekly
cron.schedule('0 2 * * 0', runMaintenance);
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump tightandhard > backups/db_$DATE.sql

# Backup generated models
tar -czf backups/models_$DATE.tar.gz output/generated_models

# Backup packages
tar -czf backups/packages_$DATE.tar.gz output/packages

# Upload to S3
aws s3 cp backups/db_$DATE.sql s3://tightandhard-backups/db/
aws s3 cp backups/models_$DATE.tar.gz s3://tightandhard-backups/models/
aws s3 cp backups/packages_$DATE.tar.gz s3://tightandhard-backups/packages/

# Clean up old backups (keep 30 days)
find backups/ -name "*.sql" -mtime +30 -delete
find backups/ -name "*.tar.gz" -mtime +30 -delete
```

### Update Procedure

```bash
#!/bin/bash
# update.sh

# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run migrations
npm run migrate

# 4. Restart services
docker-compose down
docker-compose pull
docker-compose up -d

# 5. Run health checks
curl http://localhost:5002/health

echo "Update complete"
```

---

## 📞 Support

For implementation support:
- **Documentation**: https://docs.tightandhard.com
- **Email**: support@tightandhard.com
- **Slack**: tightandhard.slack.com

---

**Last Updated**: January 11, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅