# AI Model Generator System - Architecture Documentation

## 📐 System Overview

The AI Model Generator System is a comprehensive automation platform for creating, packaging, and delivering AI companions for TightandHard.com. The system integrates model generation, image creation, packaging, and delivery into a seamless workflow.

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  (Purchase Page | Customization UI | Model Preview | Download)   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer                 │
│              (Rate Limiting | Authentication | Routing)          │
└────────┬──────────────────────────────────────┬────────────────┘
         │                                      │
         ▼                                      ▼
┌──────────────────────┐           ┌──────────────────────────┐
│  Model Generator     │           │  Model Packager         │
│  API Server          │           │  Service                │
│  (Port 5002)         │           │                          │
│                      │           │                          │
│  • Model Generation  │           │  • ZIP Creation          │
│  • Customization     │───────────▶  • Documentation         │
│  • Persona Management│           │  • License Management    │
│  • Status Tracking   │           │  • Delivery              │
└──────────┬───────────┘           └──────────┬───────────────┘
           │                                  │
           │                                  │
           ▼                                  ▼
┌──────────────────────┐           ┌──────────────────────────┐
│  Generators          │           │  Storage Services        │
│                      │           │                          │
│  • ModelGenerator    │           │  • Local File System     │
│  • SDGenerator       │           │  • AWS S3                │
│  • OutfitGenerator   │           │  • Google Cloud Storage  │
│  • VoiceGenerator    │           │  • CDN Distribution       │
│  • MetadataGenerator │           └──────────────────────────┘
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Stable Diffusion Engine                         │
│         (AUTOMATIC1111 WebUI | Replicate | RunPod)              │
│                                                                  │
│  • Image Generation                                             │
│  • Portrait Creation                                             │
│  • Outfit Rendering                                              │
│  • Expression Generation                                         │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ PostgreSQL  │  │   Redis     │  │  File Store │             │
│  │  (TightandHard)│ │  (Cache)    │  │  (Images)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
│                                                                  │
│  • Stripe (Payments)     • SendGrid (Email)                      │
│  • Replicate (SD)        • AWS (Infrastructure)                  │
│  • GitHub (CI/CD)        • Sentry (Monitoring)                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Component Details

### 1. API Server (server.js)

**Responsibilities:**
- HTTP request handling
- Authentication & authorization
- Rate limiting & security
- Request routing
- Response formatting

**Technology:**
- Node.js + Express.js
- Helmet (security headers)
- CORS (cross-origin requests)
- express-rate-limit (rate limiting)

**Endpoints:**
```javascript
GET    /health                          // Health check
GET    /api/personas                    // List personas
GET    /api/outfit-templates            // List outfit templates
POST   /api/models/generate             // Generate model
POST   /api/models/package              // Package model
POST   /api/models/generate-images      // Generate images
GET    /api/models/package/:id/status   // Package status
GET    /api/models/download/:id         // Download package
GET    /api/stats                       // Statistics
```

### 2. Model Generator (generators/ModelGenerator.js)

**Responsibilities:**
- Load persona templates
- Generate appearance data
- Create outfit packs
- Build voice profiles
- Generate metadata & backstory
- Initialize bonding & emotion systems

**Key Methods:**
```javascript
async generateModel(config)           // Main generation method
async loadPersona(personaType)        // Load persona template
async generateAppearance(...)         // Create appearance data
async generateOutfits(count, ...)     // Generate 15 outfits
async generateVoice(persona)          // Create voice profile
async generateMetadata(...)           // Generate backstory, interests
async generateBonding(persona)        // Initialize bonding system
async generateEmotionState(persona)   // Initialize emotions
```

**Output Structure:**
```javascript
{
  id: "uuid",
  name: "Model Name",
  persona: { ... },
  appearance: { face, hair, body, features },
  outfits: [15 outfits],
  voice: { ... },
  metadata: { backstory, interests, goals },
  bonding: { currentTier, tiers },
  emotionState: { happiness, trust, ... }
}
```

### 3. Stable Diffusion Generator (generators/StableDiffusionGenerator.js)

**Responsibilities:**
- Generate profile portraits
- Create full body images
- Render expression images
- Generate outfit photos
- Batch image generation

**Image Types:**
1. **Profile Portrait** (512x768)
   - Front-facing shot
   - Professional lighting
   - Soft focus background

2. **Full Body** (512x768)
   - Complete body view
   - Standing pose
   - Default outfit

3. **Expressions** (512x512)
   - Happy, sad, excited, calm
   - Close-up shots
   - Emotional range

4. **Outfits** (512x768)
   - 15 different outfits
   - Full body shots
   - Fashion photography style

**Prompt Engineering:**
```javascript
// Base prompt structure
prompt = `${quality_tags} + ${appearance} + ${pose} + ${outfit} + ${lighting} + ${style}`

// Negative prompt
negative = `${bad_anatomy} + ${deformations} + ${low_quality}`
```

### 4. Model Packager (packager/ModelPackager.js)

**Responsibilities:**
- Create delivery packages
- Generate ZIP archives
- Create documentation
- Manage download links
- Track expiration
- Handle cleanup

**Package Contents:**
```
ModelName_v1.0.zip
├── package.json              // Package metadata
├── model.json               // Complete model data
├── metadata.json            // Backstory, interests
├── outfits.json             // 15 outfit definitions
├── images/
│   ├── profile.png
│   ├── body.png
│   ├── expression_*.png
│   └── outfit_*.png
├── README.md                // User documentation
├── INSTALLATION.md          // Setup instructions
├── SUPPORT.txt              // Support info
└── LICENSE.txt              // License agreement
```

**Delivery Flow:**
```javascript
1. Package created → packageId generated
2. ZIP file created → stored in output/packages/
3. Download link generated → /api/models/download/:id
4. Email sent → with download link
5. Link expires → after 30 days or 5 downloads
6. Cleanup → automatic deletion of expired packages
```

### 5. Templates

**Personas (templates/personas.json):**
- 12 pre-designed persona types
- Personality profiles
- Voice style mappings
- Default outfit preferences
- Interaction patterns
- Preferred activities

**Outfits (templates/outfit_templates.json):**
- 10 outfit categories
- 5 templates per category (50 total)
- Color palettes
- Material definitions
- Mood effect mappings
- Style combinations

### 6. Data Layer

**PostgreSQL (TightandHard Backend):**
- Character data
- User information
- Purchase history
- Analytics

**Redis (Cache):**
- Persona templates cache
- Outfit templates cache
- Session data
- Rate limiting counters

**File System:**
- Generated models (output/generated_models/)
- Packages (output/packages/)
- Temporary files (output/temp/)
- Logs (logs/)

### 7. External Services

**Stripe:**
- Payment processing
- Webhook integration
- Customer management

**SendGrid:**
- Delivery emails
- Notification emails
- Support emails

**Stable Diffusion:**
- Image generation
- AUTOMATIC1111 WebUI
- Replicate API (cloud)

**AWS:**
- S3 (storage)
- CloudFront (CDN)
- Lambda (serverless)

## 🔄 Data Flow

### Purchase & Generation Flow

```
1. User purchases TightandHard
   ↓
2. Stripe webhook triggered
   ↓
3. POST /api/models/generate
   {
     personaType: "romantic_partner",
     customizations: { hairColor: "blonde" },
     ownerName: "John Doe"
   }
   ↓
4. ModelGenerator.generateModel()
   - Load persona template
   - Generate appearance
   - Create 15 outfits
   - Build voice profile
   - Generate metadata
   ↓
5. Return model data
   ↓
6. POST /api/models/package
   ↓
7. ModelPackager.packageForSale()
   - Create package structure
   - Generate documentation
   - Create ZIP archive
   ↓
8. Return package with download URL
   ↓
9. Send email with download link
   ↓
10. User downloads and installs
```

### Image Generation Flow

```
1. Model data available
   ↓
2. POST /api/models/generate-images
   ↓
3. StableDiffusionGenerator.generateModelImages()
   ↓
4. For each image type:
   - Build prompt
   - Build negative prompt
   - Call SD API
   - Save image
   - Generate metadata
   ↓
5. Return image set
   {
     profile: { ... },
     body: { ... },
     expressions: { ... },
     outfits: [ ... ]
   }
```

## 🔐 Security Architecture

### Authentication
- JWT tokens for API access
- Stripe webhook signatures
- Admin API keys

### Authorization
- Role-based access control
- Resource ownership checks
- Rate limiting per user

### Data Protection
- Encrypted model files
- Watermarked preview images
- Secure download links
- License verification

### Network Security
- HTTPS only (TLS 1.3)
- CORS configuration
- Helmet security headers
- DDoS protection

## 📊 Scalability

### Horizontal Scaling
```yaml
# Docker Compose scaling
services:
  model-generator:
    scale: 3
    load_balancer:
      - nginx
```

### Vertical Scaling
- GPU acceleration for SD
- More RAM for batch processing
- Faster SSD storage

### Caching Strategy
- Redis cache for templates
- CDN for image delivery
- Database query optimization

### Queue System (Future)
- Bull queue for job processing
- Worker threads for generation
- Priority queues for paid orders

## 📈 Performance Optimization

### Generation Performance
- Parallel outfit generation
- Cached persona templates
- Optimized prompt building

### Image Generation Performance
- Batch SD requests
- Pre-loaded SD models
- GPU acceleration

### Packaging Performance
- Streaming ZIP creation
- Asynchronous file operations
- Compression optimization

### API Performance
- Response caching
- Connection pooling
- CDN for downloads

## 🔍 Monitoring & Observability

### Metrics Collection
- Prometheus metrics
- Custom business metrics
- Performance metrics

### Logging
- Winston structured logging
- Log levels (error, warn, info, debug)
- Log rotation

### Health Checks
- API health endpoint
- SD API health
- Database health
- Redis health

### Alerts
- Sentry error tracking
- PagerDuty integration
- Email notifications

## 🚀 Deployment Architecture

### Development
```bash
npm run dev
# Runs on port 5002
# Hot reload with nodemon
```

### Production (Docker)
```bash
docker-compose up -d
# Multi-container deployment
# Auto-scaling enabled
# Load balancing
```

### Cloud (AWS)
```bash
# ECS/Fargate deployment
# Auto-scaling groups
# CloudFront CDN
# RDS for database
```

## 📝 API Documentation

### Request/Response Format

**Generate Model Request:**
```json
POST /api/models/generate
{
  "personaType": "romantic_partner",
  "customizations": {
    "hairColor": "blonde",
    "hairStyle": "long"
  },
  "ownerName": "John Doe",
  "modelName": "Sophia"
}
```

**Generate Model Response:**
```json
{
  "success": true,
  "model": {
    "id": "uuid",
    "name": "Sophia",
    "persona": { ... },
    "outfits": [ ... ],
    "voice": { ... }
  },
  "generationTime": 2.5
}
```

### Error Handling

**Standard Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

**Error Codes:**
- `PERSONA_NOT_FOUND` - Persona type doesn't exist
- `GENERATION_FAILED` - Model generation failed
- `PACKAGING_FAILED` - Packaging failed
- `PACKAGE_EXPIRED` - Download link expired
- `MAX_DOWNLOADS_REACHED` - Download limit reached

## 🔮 Future Enhancements

### Phase 2 (Q2 2025)
- Real-time WebSocket updates
- Advanced customizations
- Video generation
- Voice audio generation

### Phase 3 (Q3 2025)
- AI-powered outfit suggestions
- Dynamic personality adaptation
- Multi-language support
- Mobile app integration

### Phase 4 (Q4 2025)
- AR/VR model preview
- Blockchain-based ownership
- Marketplace for user-generated content
- Social features

---

**Document Version:** 1.0.0  
**Last Updated:** January 11, 2025  
**Maintained By:** TightandHard Development Team