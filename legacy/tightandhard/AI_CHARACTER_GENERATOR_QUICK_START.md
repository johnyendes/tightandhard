# AI Character Generator - Quick Start Guide

## Prerequisites

Before using the AI Character Generator, ensure you have:

1. ✅ TightandHard backend running (port 5001)
2. ✅ PostgreSQL database configured
3. ⚠️ Stable Diffusion API server (see setup below)
4. ⚠️ API keys configured (see configuration below)

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd tightandhard/backend
npm install
```

### 2. Configure Environment Variables

Add these to `backend/.env`:

```bash
# Stable Diffusion API (if using local Automatic1111)
SD_API_URL=http://localhost:7860/sdapi/v1
SD_API_KEY=your_api_key_here

# Or use Replicate API (easier, no local setup)
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# File storage
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
```

### 3. Set Up Stable Diffusion

#### Option A: Use Replicate API (Easiest)
```bash
# Get API key from https://replicate.com
# Add REPLICATE_API_KEY to .env
# No additional setup needed!
```

#### Option B: Local Automatic1111 (More Control)
```bash
# Install Automatic1111 WebUI
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Install requirements
pip install -r requirements.txt

# Start with API enabled
./webui.sh --api --listen

# API will be available at http://localhost:7860/sdapi/v1
```

### 4. Start the Backend Server

```bash
cd tightandhard/backend
npm start
```

Server should start on port 5001.

### 5. Test the API

```bash
curl -X GET http://localhost:5001/api/health
```

Should return:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## Your First Generation

### Via API

```bash
curl -X POST http://localhost:5001/api/character-generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "test-character-001",
    "prompt": "A professional woman in her late 20s, wearing a tailored beige blazer, warm smile, standing in a modern office",
    "width": 1024,
    "height": 1024,
    "steps": 30,
    "cfgScale": 7.5,
    "seed": 12345
  }'
```

### Via Web Interface

1. Navigate to: `http://localhost:5001/character-generator`
2. Enter a prompt in the text area
3. Adjust settings (width, height, steps, etc.)
4. Click "Generate Image"
5. Wait 10-30 seconds
6. View your generated character!

## Common Use Cases

### 1. Generate Consistent Character Variations

```bash
curl -X POST http://localhost:5001/api/character-generator/batch \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "sophia-001",
    "params": {
      "prompt": "A stunning woman in her mid-20s with flowing auburn hair, warm hazel eyes",
      "seed": 54321,
      "width": 1024,
      "height": 1024
    },
    "count": 5
  }'
```

### 2. Generate with Specific Outfit

```bash
curl -X POST http://localhost:5001/api/character-generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "sophia-001",
    "prompt": "Woman wearing elegant red evening gown at formal event",
    "seed": 54321,
    "width": 1024,
    "height": 1024
  }'
```

### 3. Generate in Different Scene

```bash
curl -X POST http://localhost:5001/api/character-generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "sophia-001",
    "prompt": "Woman relaxing on beach at sunset, golden hour lighting",
    "seed": 54321,
    "width": 1024,
    "height": 1024
  }'
```

## Quality Settings Guide

### Quick Settings for Different Quality Levels

**Fast/Low Quality (10-15s)**
```json
{
  "steps": 20,
  "cfgScale": 7,
  "width": 768,
  "height": 768
}
```

**Standard Quality (20-30s)**
```json
{
  "steps": 30,
  "cfgScale": 7.5,
  "width": 1024,
  "height": 1024
}
```

**High Quality (40-60s)**
```json
{
  "steps": 50,
  "cfgScale": 8,
  "width": 1024,
  "height": 1024
}
```

**Ultra Quality (60-90s)**
```json
{
  "steps": 60,
  "cfgScale": 8.5,
  "width": 1280,
  "height": 1280
}
```

## Prompt Engineering Tips

### Good Prompts

✅ "A professional woman in her late 20s, wearing a tailored beige blazer, warm smile, standing in a modern office"

✅ "Stunning woman with flowing auburn hair, warm hazel eyes, gentle smile, wearing elegant summer dress, garden background"

✅ "Confident businesswoman in power suit, skyscraper cityscape background, professional photography style"

### Bad Prompts

❌ "Woman" (too vague)

❌ "Beautiful woman with long hair" (missing details)

❌ "A girl" (wrong terminology, too simple)

### Prompt Structure Template

```
[Subject Description] + [Age] + [Physical Features] + [Clothing] + [Expression] + [Pose] + [Setting/Background]
```

Example:
```
Professional woman + in her late 20s + with flowing auburn hair and warm hazel eyes + wearing elegant business attire + with a warm smile + standing confidently + in a modern office with natural lighting
```

## Consistency Features

### Using Fixed Seeds

Use the same seed number across all generations for consistent character appearance:

```json
{
  "seed": 12345
}
```

### Face Swap (Advanced)

1. Generate a "master face" you like
2. Save the image ID
3. Use that as `masterFaceId` in subsequent generations

```json
{
  "useFaceSwap": true,
  "masterFaceId": "uuid-of-master-face-image"
}
```

### LoRA Models (For Long-Term Campaigns)

Train a LoRA model on a specific face for perfect consistency:

```json
{
  "useLoRA": true,
  "loraModelId": "your-custom-lora-model-id"
}
```

## Post-Processing

### Upscale Image

```bash
curl -X POST http://localhost:5001/api/character-generator/upscale \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": "uuid-of-image",
    "scaleFactor": 2
  }'
```

### Retouch Image

```bash
curl -X POST http://localhost:5001/api/character-generator/retouch \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": "uuid-of-image",
    "retouchOptions": {
      "enhanceSkin": true,
      "fixEyes": true,
      "adjustLighting": true,
      "addGrain": true
    }
  }'
```

## Viewing Generated Images

### Get All Images for a Character

```bash
curl http://localhost:5001/api/character-generator/images/sophia-001
```

### Get Only Favorite Images

```bash
curl "http://localhost:5001/api/character-generator/images/sophia-001?isFavorite=true"
```

### Get Only Approved Images

```bash
curl "http://localhost:5001/api/character-generator/images/sophia-001?isApproved=true"
```

## Campaign Management

### Create Campaign

```bash
curl -X POST http://localhost:5001/api/character-generator/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer 2025 Campaign",
    "campaignData": {
      "targetAudience": {
        "demographics": ["25-35", "urban professionals"],
        "ageRange": "25-35",
        "interests": ["technology", "lifestyle"]
      },
      "platforms": ["Instagram", "Facebook", "LinkedIn"],
      "adFormats": ["story", "post", "carousel"]
    },
    "styleGuide": {
      "aesthetic": "cinematic",
      "lighting": "studio",
      "mood": "professional and warm"
    }
  }'
```

### Approve Image for Campaign

```bash
curl -X PUT http://localhost:5001/api/character-generator/images/image-uuid/approve \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "adFormat": "story",
    "platform": "Instagram",
    "copyText": "Meet your new AI companion"
  }'
```

## Troubleshooting

### Issue: API returns 404

**Solution:** Check that the backend server is running on port 5001

```bash
curl http://localhost:5001/api/health
```

### Issue: Generation fails with timeout

**Solution:** 
- Reduce `steps` to 20-30
- Reduce resolution to 768x768
- Check Stable Diffusion API is accessible

### Issue: Images look cartoon-like

**Solution:**
- Increase `steps` to 40-50
- Increase `cfgScale` to 8-10
- Ensure prompt is detailed and specific

### Issue: Character face varies

**Solution:**
- Use fixed seed (not -1)
- Enable face swap with master face
- Consider training LoRA model

## Next Steps

1. ✅ Test basic generation
2. ✅ Experiment with different prompts
3. ✅ Try batch generation
4. ✅ Test consistency features
5. ✅ Set up campaign management
6. ✅ Integrate with character builder

## Getting Help

For detailed documentation, see:
- [Full Integration Guide](./AI_CHARACTER_GENERATOR_INTEGRATION.md)
- [API Documentation](./backend/API_DOCUMENTATION.md)
- [Troubleshooting Guide](./backend/TROUBLESHOOTING.md)

## Support

If you encounter issues:
1. Check server logs: `backend/logs/app.log`
2. Verify environment variables
3. Test Stable Diffusion API directly
4. Check database connections

---

**Ready to create stunning AI characters! 🎨**