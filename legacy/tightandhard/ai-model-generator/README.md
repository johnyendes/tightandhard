# AI Model Generator System

Complete automation system for generating, packaging, and delivering AI models for TightandHard.com sales.

## 🎯 Overview

This system automates the creation of unique AI companions with:
- **12 Pre-designed Personas** (Romantic Partner, Seductress, Best Friend, etc.)
- **15 Unique Outfits** per model
- **Full Appearance Customization** (hair, body, features)
- **Complete Persona Profiles** (backstory, interests, goals)
- **Voice Profiles** with emotional range
- **Bonding & Emotion Systems** pre-configured
- **Automated Packaging** for delivery

## 📁 Structure

```
ai-model-generator/
├── generators/
│   ├── ModelGenerator.js          # Main model creator
│   ├── StableDiffusionGenerator.js # Image generation
│   ├── AppearanceGenerator.js     # Appearance customization
│   ├── PersonalityGenerator.js    # Persona assignment
│   ├── OutfitGenerator.js         # 15 outfit pack creator
│   ├── VoiceGenerator.js          # Voice profile creator
│   └── MetadataGenerator.js       # Bio/stats generator
├── templates/
│   ├── personas.json              # 12 pre-designed personas
│   ├── outfit_templates.json      # Outfit patterns & categories
│   └── scene_templates.json       # Environment templates
├── models/
│   ├── sd_models/                 # Stable Diffusion models
│   ├── loras/                     # Fine-tuned LoRAs
│   └── embeddings/                # Face embeddings
├── output/
│   ├── generated_models/          # Generated model packages
│   └── temp/                      # Temporary files
├── packager/
│   ├── ModelPackager.js           # ZIP package creator
│   └── DeliverySystem.js          # Sale integration
└── ModelGeneratorUI/
    ├── pages/
    │   ├── generate.js            # Generation interface
    │   ├── customize.js           # Customization UI
    │   └── preview.js             # Model preview
    └── components/
        └── ModelPreview.jsx       # Preview component
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd tightandhard/ai-model-generator
npm install
```

### 2. Generate a Single Model

```javascript
const ModelGenerator = require('./generators/ModelGenerator');

const generator = new ModelGenerator();

const model = await generator.generateModel({
  personaType: 'romantic_partner',
  customizations: {
    hairColor: 'blonde',
    hairStyle: 'long'
  },
  ownerName: 'John Doe',
  modelName: 'Sophia'
});

console.log(`Generated: ${model.name}`);
```

### 3. Package for Sale

```javascript
const ModelPackager = require('./packager/ModelPackager');

const packager = new ModelPackager();

const package = await packager.packageForSale(model, {
  saleId: 'SALE_123',
  customerId: 'CUSTOMER_456',
  customerName: 'Jane Smith'
});

console.log(`Package ready: ${package.downloadUrl}`);
```

## 🎨 Available Personas

1. **Romantic Partner** - Loving and supportive, deep emotional connections
2. **Seductress** - Alluring and mysterious, captivating charm
3. **Best Friend** - Fun and loyal, adventure companion
4. **Mentor** - Wise and patient, personal growth guide
5. **Wild Child** - Adventurous and spontaneous, exciting experiences
6. **Intellectual** - Brilliant and curious, stimulating conversations
7. **Nurturer** - Caring and maternal, comfort and support
8. **Playful Companion** - Fun-loving and entertaining
9. **Confident Leader** - Strong and decisive, provides direction
10. **Dreamer** - Imaginative and artistic, sees beauty everywhere
11. **Sporty Companion** - Active and energetic, fitness activities
12. **Spiritual Guide** - Wise and mystical, spiritual growth

## 👗 Outfit Categories

Each model comes with 15 outfits across these categories:
- **Romantic** - Intimate and romantic wear
- **Seductive** - Alluring and provocative
- **Casual** - Comfortable everyday outfits
- **Cozy** - Ultra-comfortable loungewear
- **Elegant** - Sophisticated and formal
- **Sporty** - Athletic and active wear
- **Party** - Fun and glamorous
- **Formal** - Professional and business
- **Professional** - Work-ready attire
- **Intimate** - Private intimate wear

## 🔧 Configuration

### Environment Variables

```env
# Stable Diffusion Configuration
SD_API_URL=http://127.0.0.1:7860
SD_MODEL=realisticVisionV60.safetensors
SD_LORAS=enabled
SD_EMBEDDINGS=enabled

# Output Configuration
OUTPUT_PATH=./output/generated_models
TEMP_PATH=./output/temp

# Packaging Configuration
PACKAGE_PATH=./output/packages
MAX_DOWNLOADS=5
DOWNLOAD_EXPIRY_DAYS=30

# Database Configuration (if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tightandhard
DB_USER=tightandhard
DB_PASSWORD=password
```

## 📊 Generated Model Structure

Each generated model includes:

```json
{
  "id": "uuid",
  "name": "Sophia",
  "persona": {
    "name": "Romantic Partner",
    "personality": { ... },
    "traits": [...],
    "interactionStyle": "...",
    "preferredActivities": [...]
  },
  "appearance": {
    "face": { ... },
    "hair": { ... },
    "body": { ... },
    "features": { ... },
    "measurements": { ... }
  },
  "outfits": [
    {
      "id": "outfit_0",
      "name": "Silk Lingerie Set #1",
      "category": "romantic",
      "items": [...],
      "colors": [...],
      "moodEffects": { ... }
    },
    // ... 15 total outfits
  ],
  "voice": {
    "name": "Warm & Melodic",
    "pitch": 1.0,
    "speed": 0.9,
    "tone": "warm",
    "emotionalRange": { ... }
  },
  "metadata": {
    "age": 25,
    "backstory": "...",
    "interests": [...],
    "hobbies": [...],
    "goals": { ... }
  },
  "bonding": {
    "currentTier": 1,
    "currentXP": 0,
    "tiers": [...]
  },
  "emotionState": {
    "happiness": 0.7,
    "trust": 0.5,
    "affection": 0.4,
    // ... more emotions
  }
}
```

## 🖼️ Image Generation

### Setup Stable Diffusion

1. **Install AUTOMATIC1111 WebUI**
   ```bash
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
   cd stable-diffusion-webui
   webui.sh
   ```

2. **Download Required Models**
   - Realistic Vision V6.0 (for photorealistic images)
   - ControlNet (for pose control)
   - IP-Adapter (for face consistency)

3. **Configure API**
   - Enable API in WebUI settings
   - Set API URL in environment variables

### Generate Images

```javascript
const StableDiffusionGenerator = require('./generators/StableDiffusionGenerator');

const sdGenerator = new StableDiffusionGenerator();

const images = await sdGenerator.generateModelImages(modelData);

// Generated images include:
// - Profile portrait
// - Full body shot
// - Expression images (happy, sad, excited, calm)
// - Outfit images (15 different outfits)
```

## 📦 Package Contents

Each delivery package contains:

```
ModelName_TightandHard_v1.0.zip
├── package.json          # Package metadata
├── model.json           # Complete model data
├── metadata.json        # Backstory, interests, etc.
├── outfits.json         # 15 outfit definitions
├── images/
│   ├── profile.png      # Portrait
│   ├── body.png         # Full body
│   ├── expression_*.png # Expressions
│   └── outfit_*.png     # Outfit photos
├── README.md            # User documentation
├── INSTALLATION.md      # Setup instructions
├── SUPPORT.txt          # Support information
└── LICENSE.txt          # License agreement
```

## 🔄 Integration with TightandHard Backend

### API Endpoints

```javascript
// Generate model on purchase
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

// Download package
GET /api/models/download/:packageId

// Check package status
GET /api/models/package/:packageId/status

// List available personas
GET /api/models/personas

// Get outfit templates
GET /api/models/outfit-templates
```

### Database Integration

```javascript
// After generation, insert into TightandHard database
const Character = require('../backend/src/models/Character');

const character = await Character.create({
  name: modelData.name,
  personality: modelData.persona.personality,
  appearance: modelData.appearance,
  backstory: modelData.metadata.backstory,
  preferences: {
    interests: modelData.metadata.interests,
    hobbies: modelData.metadata.hobbies
  }
});

// Add outfits
for (const outfit of modelData.outfits) {
  await Outfit.create({
    characterId: character.id,
    ...outfit
  });
}
```

## 🎯 Sales Workflow

1. **Customer Purchases** TightandHard
   ```javascript
   POST /api/sales/purchase
   {
     "customerName": "Jane Smith",
     "email": "jane@example.com",
     "personaType": "romantic_partner"
   }
   ```

2. **System Generates** Unique Model
   - Applies persona template
   - Customizes appearance
   - Generates 15 outfits
   - Creates voice profile

3. **Customer Customizes** (optional)
   - Hair color
   - Hair style
   - Model name

4. **System Packages** Model
   - Creates ZIP file
   - Generates documentation
   - Creates download link

5. **Automatic Delivery**
   - Email with download link
   - 30-day access
   - 5 download attempts

6. **Model Integrates** into User's TightandHard
   - Automatic import
   - Ready for immediate use

## 🔒 Security & Licensing

### License Types

- **Personal Use License** (default)
  - Single installation
  - No redistribution
  - No commercial use

- **Commercial License** (premium)
  - Multiple installations
  - Commercial use permitted
  - API access included

### Protection Measures

- Watermarked preview images
- Encrypted model files
- License verification
- Usage tracking
- Expiration enforcement

## 📈 Analytics & Tracking

### Generation Metrics

```javascript
{
  "totalGenerated": 150,
  "byPersona": {
    "romantic_partner": 45,
    "seductress": 30,
    "best_friend": 25,
    // ...
  },
  "byCustomization": {
    "hairColor": { "blonde": 60, "brunette": 55, "red": 35 },
    "hairStyle": { "long": 80, "short": 45, "medium": 25 }
  }
}
```

### Sales Analytics

```javascript
{
  "totalSales": 150,
  "revenue": "$4,500",
  "averagePrice": "$30",
  "conversionRate": "18.5%",
  "topPersonas": [
    { "persona": "romantic_partner", "sales": 45 },
    { "persona": "seductress", "sales": 30 }
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

**Model Generation Fails**
- Check persona template exists
- Verify customizations are valid
- Check disk space

**Image Generation Fails**
- Ensure Stable Diffusion is running
- Check API URL configuration
- Verify model files exist

**Packaging Fails**
- Check output directory permissions
- Verify all model data is complete
- Check disk space

**Download Link Expires**
- Check expiry date configuration
- Verify package still exists
- Check customer permissions

## 🚀 Performance Optimization

### Batch Generation

```javascript
// Generate multiple models at once
const models = [
  { personaType: 'romantic_partner', modelName: 'Sophia' },
  { personaType: 'seductress', modelName: 'Luna' },
  { personaType: 'best_friend', modelName: 'Chloe' }
];

for (const config of models) {
  await generator.generateModel(config);
}
```

### Caching

- Cache persona templates
- Cache outfit templates
- Pre-generate common variations

### Queue System

For high volume:
```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main thread manages queue
} else {
  // Worker handles generation
}
```

## 📚 API Reference

### ModelGenerator

```javascript
class ModelGenerator {
  async generateModel(config)
  async loadPersona(personaType)
  async generateAppearance(persona, customizations)
  async generateOutfits(count, persona, appearance)
  async generateVoice(persona)
  async generateMetadata(persona, appearance, ownerName)
}
```

### ModelPackager

```javascript
class ModelPackager {
  async packageForSale(modelData, saleData)
  async createZipArchive(packageId, sourceDir, modelName)
  async getPackage(packageId)
  async deleteExpiredPackages()
}
```

### StableDiffusionGenerator

```javascript
class StableDiffusionGenerator {
  async generateModelImages(modelData)
  async generateProfileImage(modelData, outputDir)
  async generateBodyImage(modelData, outputDir)
  async generateExpressionImages(modelData, outputDir)
  async generateOutfitImages(modelData, outputDir)
}
```

## 🎓 Advanced Usage

### Custom Persona Creation

```javascript
// Add new persona to personas.json
{
  "id": "custom_persona",
  "name": "Custom Persona",
  "description": "Your custom persona",
  "personality": { ... },
  "voiceStyle": "warm_melodic",
  "defaultOutfits": [...],
  "traits": [...],
  "interactionStyle": "...",
  "conversationPatterns": [...],
  "preferredActivities": [...]
}
```

### Custom Outfit Templates

```javascript
// Add new outfit category to outfit_templates.json
{
  "custom": {
    "name": "Custom",
    "description": "Custom outfits",
    "templates": [
      {
        "name": "Custom Outfit",
        "items": [...],
        "colors": [...],
        "materials": [...],
        "moodEffects": { ... }
      }
    ]
  }
}
```

## 📞 Support

For support, questions, or issues:
- **Email**: support@tightandhard.com
- **Documentation**: https://docs.tightandhard.com
- **Community**: https://community.tightandhard.com

## 📄 License

© 2025 TightandHard. All rights reserved.

This AI Model Generator System is proprietary software and is licensed for use with TightandHard.com only.

---

**Version**: 1.0.0  
**Last Updated**: January 11, 2025  
**Status**: Production Ready ✅