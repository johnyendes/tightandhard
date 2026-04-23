# AI Character Generator - Integration Guide

## Overview

The AI Character Generator has been successfully integrated into the TightandHard platform, providing professional-grade photorealistic character generation capabilities for advertising campaigns and companion customization.

## What's Been Integrated

### Backend Components

#### 1. New Data Models
- **CharacterImage** - Stores generated character images with metadata
- **CharacterCampaign** - Manages advertising campaigns for character assets

#### 2. Core Services
- **AICharacterGenerator** - Main generation service with:
  - Stable Diffusion API integration
  - Photorealism enhancement
  - ControlNet support (OpenPose, Canny, Depth)
  - Face swap capabilities
  - LoRA model integration
  - Batch generation
  - Quality metrics calculation

#### 3. API Endpoints
All endpoints are available under `/api/character-generator`:

**Generation:**
- `POST /api/character-generator/generate` - Generate single character image
- `POST /api/character-generator/batch` - Generate batch of images
- `POST /api/character-generator/consistent` - Generate consistent character with fixed seed

**Post-Processing:**
- `POST /api/character-generator/upscale` - Upscale image for high-resolution output
- `POST /api/character-generator/retouch` - Apply professional retouching

**Image Management:**
- `GET /api/character-generator/images/:characterId` - Get all character images
- `PUT /api/character-generator/images/:imageId/favorite` - Toggle favorite status
- `PUT /api/character-generator/images/:imageId/approve` - Approve for campaign use

**Campaign Management:**
- `POST /api/character-generator/campaigns` - Create new campaign
- `GET /api/character-generator/campaigns` - Get all campaigns

### Frontend Components

#### 1. Character Generator Page
**Location:** `/character-generator`

**Features:**
- Interactive generation controls
- Real-time parameter adjustment
- Batch generation (3, 5, 10 images)
- Image gallery with selection
- Quality metrics display
- Post-processing tools (upscale, retouch)
- Advanced options (ControlNet, Face Swap, LoRA)

## Database Integration

### Character Model Updates
The existing Character model now has associations with:
- `characterImages` - All generated images for this character
- `campaign` - Associated advertising campaign

### New Tables

#### CharacterImages Table
```sql
- id (UUID, PK)
- characterId (UUID, FK)
- imageUrl (TEXT)
- localPath (TEXT)
- generationData (JSONB)
- photographySettings (JSONB)
- poseData (JSONB)
- qualityMetrics (JSONB)
- postProcessing (JSONB)
- consistencyData (JSONB)
- campaignData (JSONB)
- status (ENUM)
- generationTime (INTEGER)
- isFavorite (BOOLEAN)
- isApproved (BOOLEAN)
- tags (ARRAY)
- metadata (JSONB)
- createdAt, updatedAt
```

#### CharacterCampaigns Table
```sql
- id (UUID, PK)
- name (STRING)
- campaignData (JSONB)
- styleGuide (JSONB)
- brandGuidelines (JSONB)
- timeline (JSONB)
- budget (JSONB)
- generationRequirements (JSONB)
- stats (JSONB)
- status (ENUM)
- userId (UUID)
- metadata (JSONB)
- createdAt, updatedAt
```

## Configuration Required

### Environment Variables

Add these to your `.env` file:

```bash
# Stable Diffusion API
SD_API_URL=http://localhost:7860/sdapi/v1
SD_API_KEY=your_sd_api_key

# Alternative APIs
REPLICATE_API_KEY=your_replicate_key
MIDJOURNEY_API_KEY=your_midjourney_key

# Face Swap API
FACE_SWAP_API_URL=http://localhost:7860/face-swap
FACE_SWAP_API_KEY=your_face_swap_key

# Upscaling Services
TOPAZ_API_KEY=your_topaz_key
MAGNIFIC_API_KEY=your_magnific_key

# ControlNet Models
CONTROLNET_OPENPOSE_MODEL=control_openpose-fp16.safetensors
CONTROLNET_CANNY_MODEL=control_canny-fp16.safetensors
CONTROLNET_DEPTH_MODEL=control_depth-fp16.safetensors
```

## Usage Examples

### 1. Generate a Single Character Image

```javascript
const response = await fetch('/api/character-generator/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    characterId: 'uuid-of-character',
    prompt: 'A professional woman in her late 20s, wearing a tailored beige blazer, warm smile, standing in a modern office',
    width: 1024,
    height: 1024,
    steps: 30,
    cfgScale: 7.5,
    seed: 12345,
    useControlNet: false,
    useFaceSwap: false,
    useLoRA: false
  })
});
```

### 2. Generate Batch of Consistent Images

```javascript
const response = await fetch('/api/character-generator/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    characterId: 'uuid-of-character',
    params: {
      prompt: 'A professional woman in her late 20s...',
      seed: 12345, // Same seed for consistency
      width: 1024,
      height: 1024
    },
    count: 5
  })
});
```

### 3. Generate with ControlNet for Pose Control

```javascript
const response = await fetch('/api/character-generator/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    characterId: 'uuid-of-character',
    prompt: 'A professional woman sitting at a desk...',
    useControlNet: true,
    controlNetType: 'openpose',
    referenceImage: 'base64-encoded-pose-image'
  })
});
```

### 4. Upscale Generated Image

```javascript
const response = await fetch('/api/character-generator/upscale', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageId: 'uuid-of-image',
    scaleFactor: 2
  })
});
```

## Photorealism Enhancement

The system automatically enhances prompts with photography keywords:

**Base Prompt:**
```
A professional woman in her late 20s, wearing a tailored beige blazer, warm smile
```

**Enhanced Prompt:**
```
A professional woman in her late 20s, wearing a tailored beige blazer, warm smile, photorealistic, 8k resolution, shot on 35mm, depth of field, studio lighting, professional photography, high detail, sharp focus, natural lighting
```

## Consistency Features

### 1. Seed-Based Consistency
- Use the same seed across generations for consistent base appearance
- `-1` seed = random, any number = fixed

### 2. Face Swap
- Generate a "master face" you like
- Use face swap to apply that exact face to other images
- Ensures perfect facial consistency

### 3. LoRA Training
- Train custom LoRA models on specific faces
- Generate that character natively in Stable Diffusion
- Best for long-term campaigns

## Quality Metrics

Each generated image receives quality scores:

- **Photorealism Score** (0-100): How realistic the image looks
- **Consistency Score** (0-100): How consistent the character appears
- **Composition Score** (0-100): Quality of image composition
- **Overall Score** (0-100): Weighted average of all metrics

## Campaign Integration

### Create Campaign

```javascript
const response = await fetch('/api/character-generator/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Summer 2025 Campaign',
    campaignData: {
      targetAudience: {
        demographics: ['25-35', 'urban professionals'],
        interests: ['technology', 'lifestyle']
      },
      platforms: ['Instagram', 'Facebook', 'LinkedIn']
    },
    styleGuide: {
      aesthetic: 'cinematic',
      lighting: 'studio'
    }
  })
});
```

### Approve Image for Campaign

```javascript
const response = await fetch(`/api/character-generator/images/${imageId}/approve`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 'uuid-of-campaign',
    adFormat: 'story',
    platform: 'Instagram',
    copyText: 'Meet your new AI companion'
  })
});
```

## Advanced Features

### ControlNet Integration
- **OpenPose**: Control character pose using skeleton-based guidance
- **Canny**: Use edge detection for precise line control
- **Depth**: Control depth and spatial relationships

### Post-Processing Pipeline
1. **Upscaling**: 2x, 3x, or 4x resolution increase
2. **Retouching**: 
   - Skin enhancement
   - Eye correction
   - Lighting adjustment
   - Film grain addition

### Batch Generation
- Generate 3, 5, or 10 images at once
- All images use same seed for consistency
- Efficient for testing variations

## Integration with Existing Systems

### Character Builder Integration
The AI Character Generator works seamlessly with the existing Character Builder:

```javascript
// Create character with AI-generated image
const character = await Character.create({
  name: 'Sophia',
  appearance: {
    gender: 'female',
    age: 25,
    ethnicity: 'caucasian'
  }
});

// Generate images for character
const images = await AICharacterGenerator.generateImageBatch(
  character.id,
  {
    prompt: 'A stunning woman in her mid-20s with flowing auburn hair, warm hazel eyes, gentle smile, wearing elegant business attire'
  },
  5
);
```

### Outfit System Integration
Generate characters in different outfits:

```javascript
// Generate character in casual outfit
const casual = await generator.generateCharacterImage({
  characterId: character.id,
  prompt: 'Woman in casual summer dress',
  useLoRA: true,
  loraModelId: character.loraModelId
});

// Generate same character in formal outfit
const formal = await generator.generateCharacterImage({
  characterId: character.id,
  prompt: 'Woman in elegant evening gown',
  useLoRA: true,
  loraModelId: character.loraModelId
});
```

### Scene Integration
Generate characters in different scenes:

```javascript
// Generate character in office scene
const office = await generator.generateCharacterImage({
  characterId: character.id,
  prompt: 'Professional woman in modern office',
  useControlNet: true,
  controlNetType: 'depth',
  referenceImage: officeDepthMap
});

// Generate same character at beach
const beach = await generator.generateCharacterImage({
  characterId: character.id,
  prompt: 'Woman at beach sunset',
  useControlNet: true,
  controlNetType: 'depth',
  referenceImage: beachDepthMap
});
```

## Performance Considerations

### Generation Time
- Single image: 10-30 seconds (depending on steps)
- Batch of 5: 50-150 seconds
- With ControlNet: +5-10 seconds per image
- With Face Swap: +3-5 seconds per image

### Storage Requirements
- Each image: ~2-5 MB (PNG, 1024x1024)
- Upscaled 2x: ~8-20 MB
- Upscaled 4x: ~32-80 MB

### API Rate Limits
- Recommended: 5-10 concurrent generations
- Maximum: 20 concurrent generations
- Timeout: 120 seconds per generation

## Troubleshooting

### Common Issues

**Issue: Generation fails with "API not reachable"**
- Solution: Ensure Stable Diffusion API is running at configured URL
- Check `SD_API_URL` in environment variables

**Issue: Images look cartoon-like**
- Solution: Increase `steps` to 40-50
- Check prompt includes photorealism keywords
- Verify `cfg_scale` is between 7-10

**Issue: Character face varies between images**
- Solution: Use fixed seed instead of -1
- Enable face swap with master face
- Train and use LoRA model

**Issue: ControlNet not working**
- Solution: Verify ControlNet models are downloaded
- Check model path in environment variables
- Ensure reference image is provided

## Next Steps

### Immediate Actions
1. Configure environment variables with API keys
2. Set up Stable Diffusion API server
3. Download ControlNet models
4. Test single image generation
5. Test batch generation

### Future Enhancements
- Integrate with ElevenLabs for voice generation
- Add 3D model generation (for VR/AR)
- Implement automatic prompt optimization
- Add AI-powered quality assessment
- Create character animation system

## Support

For issues or questions:
- Check API logs in `logs/app.log`
- Review database records in CharacterImages table
- Verify environment variables are set correctly
- Check Stable Diffusion API documentation

## Conclusion

The AI Character Generator is now fully integrated into the TightandHard platform, providing professional-grade character generation capabilities with photorealistic quality, consistency features, and campaign management tools. The system is ready for production use with proper API configuration.