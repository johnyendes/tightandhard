# 🚀 Quick Start Guide - AI Model Generator

Get the AI Model Generator System up and running in under 10 minutes!

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

```bash
cd tightandhard/ai-model-generator
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings (minimum required):
nano .env
```

**Required Settings:**
```env
NODE_ENV=development
API_PORT=5002
SD_API_URL=http://127.0.0.1:7860
```

### Step 3: Start the Server

```bash
npm start
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎨 TightandHard AI Model Generator API                      ║
║                                                               ║
║   Status: Running ✅                                          ║
║   Port: 5002                                                  ║
║   Environment: development                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### Step 4: Test the API

```bash
# Check health
curl http://localhost:5002/health

# Get available personas
curl http://localhost:5002/api/personas

# Generate a model
curl -X POST http://localhost:5002/api/models/generate \
  -H "Content-Type: application/json" \
  -d '{
    "personaType": "romantic_partner",
    "customizations": {
      "hairColor": "blonde",
      "hairStyle": "long"
    },
    "ownerName": "Test User"
  }'
```

## 🎯 Generate Your First Model

### Using cURL

```bash
curl -X POST http://localhost:5002/api/models/generate \
  -H "Content-Type: application/json" \
  -d '{
    "personaType": "romantic_partner",
    "customizations": {
      "hairColor": "blonde",
      "hairStyle": "long"
    },
    "ownerName": "John Doe",
    "modelName": "Sophia"
  }' \
  | jq '.'
```

**Response:**
```json
{
  "success": true,
  "model": {
    "id": "uuid-here",
    "name": "Sophia",
    "persona": {
      "name": "Romantic Partner",
      "description": "A loving and supportive companion..."
    },
    "appearance": {
      "hair": {
        "color": "blonde",
        "style": "long"
      },
      "face": {
        "eyeColor": "blue",
        "skinTone": "fair"
      }
    },
    "outfits": [
      {
        "id": "outfit_0",
        "name": "Silk Lingerie Set #1",
        "category": "romantic"
      }
      // ... 15 outfits total
    ],
    "voice": {
      "name": "Warm & Melodic",
      "pitch": 1.0,
      "tone": "warm"
    }
  },
  "generationTime": 0.5
}
```

### Using Node.js

```javascript
// generate-model.js
const axios = require('axios');

async function generateModel() {
  const response = await axios.post('http://localhost:5002/api/models/generate', {
    personaType: 'romantic_partner',
    customizations: {
      hairColor: 'blonde',
      hairStyle: 'long'
    },
    ownerName: 'John Doe',
    modelName: 'Sophia'
  });
  
  console.log('Generated model:', response.data.model.name);
  console.log('Outfits:', response.data.model.outfits.length);
  console.log('Persona:', response.data.model.persona.name);
}

generateModel().catch(console.error);
```

Run it:
```bash
node generate-model.js
```

### Using Python

```python
# generate_model.py
import requests
import json

def generate_model():
    url = 'http://localhost:5002/api/models/generate'
    data = {
        'personaType': 'romantic_partner',
        'customizations': {
            'hairColor': 'blonde',
            'hairStyle': 'long'
        },
        'ownerName': 'John Doe',
        'modelName': 'Sophia'
    }
    
    response = requests.post(url, json=data)
    result = response.json()
    
    print(f"Generated model: {result['model']['name']}")
    print(f"Outfits: {len(result['model']['outfits'])}")
    print(f"Persona: {result['model']['persona']['name']}")

if __name__ == '__main__':
    generate_model()
```

Run it:
```bash
python3 generate_model.py
```

## 🎨 Available Personas

1. **romantic_partner** - Loving and supportive
2. **seductress** - Alluring and mysterious
3. **best_friend** - Fun and loyal
4. **mentor** - Wise and patient
5. **wild_child** - Adventurous and spontaneous
6. **intellectual** - Brilliant and curious
7. **nurturer** - Caring and maternal
8. **playful_companion** - Fun-loving and entertaining
9. **confident_leader** - Strong and decisive
10. **dreamer** - Imaginative and artistic
11. **sporty_companion** - Active and energetic
12. **spiritual_guide** - Wise and mystical

## 👗 Customization Options

### Hair Colors
```json
{
  "hairColor": "blonde" | "brunette" | "red" | "black" | "auburn" | 
               "chestnut" | "dirty blonde" | "platinum blonde" | "strawberry blonde"
}
```

### Hair Styles
```json
{
  "hairStyle": "long" | "medium" | "short" | "pixie" | "bob" | 
              "layers" | "curly" | "straight" | "wavy"
}
```

## 📦 Package for Delivery

```bash
curl -X POST http://localhost:5002/api/models/package \
  -H "Content-Type: application/json" \
  -d '{
    "modelData": {
      "id": "model-uuid",
      "name": "Sophia",
      "persona": {...},
      "outfits": [...],
      "voice": {...}
    },
    "saleData": {
      "saleId": "SALE_123",
      "customerId": "CUSTOMER_456",
      "customerName": "Jane Smith"
    }
  }'
```

## 🔍 View Generated Models

```bash
# List all generated models
ls output/generated_models/

# View specific model
cat output/generated_models/{model-id}/model.json | jq '.'
```

## 📊 Check Statistics

```bash
curl http://localhost:5002/api/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalModels": 5,
    "totalPackages": 3,
    "uptime": 1234.56,
    "memory": {
      "rss": 123456789,
      "heapTotal": 12345678
    },
    "version": "1.0.0"
  }
}
```

## 🛠️ Development Mode

For auto-reload during development:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## 🐛 Troubleshooting

### Server Won't Start

**Issue:** Port 5002 already in use

**Solution:**
```bash
# Find process using port 5002
lsof -i :5002

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5003 npm start
```

### Model Generation Fails

**Issue:** Persona not found

**Solution:**
```bash
# Check available personas
curl http://localhost:5002/api/personas

# Use valid persona type from response
```

### Environment Variables Not Loading

**Issue:** .env file not found

**Solution:**
```bash
# Verify .env exists
ls -la .env

# Copy from example if missing
cp .env.example .env

# Verify file permissions
chmod 644 .env
```

## 📚 Next Steps

1. **Read Full Documentation:** [README.md](README.md)
2. **Setup Stable Diffusion:** See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
3. **Integrate with TightandHard:** See [SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md)
4. **Setup Sales Workflow:** See [SALES_WORKFLOW.md](docs/SALES_WORKFLOW.md)

## 🎓 Example Workflows

### Generate Multiple Models

```javascript
// batch-generate.js
const axios = require('axios');

const personas = [
  { type: 'romantic_partner', name: 'Sophia' },
  { type: 'seductress', name: 'Luna' },
  { type: 'best_friend', name: 'Chloe' }
];

async function batchGenerate() {
  for (const persona of personas) {
    const response = await axios.post('http://localhost:5002/api/models/generate', {
      personaType: persona.type,
      modelName: persona.name,
      ownerName: 'Batch Generator'
    });
    
    console.log(`✅ Generated: ${response.data.model.name}`);
  }
}

batchGenerate().catch(console.error);
```

### Custom Outfit Generation

```javascript
const response = await axios.post('http://localhost:5002/api/models/generate', {
  personaType: 'romantic_partner',
  customizations: {
    hairColor: 'brunette',
    hairStyle: 'wavy'
  },
  ownerName: 'Jane Doe'
});

// Add custom outfit
const customOutfit = {
  id: 'custom_outfit',
  name: 'Custom Evening Gown',
  category: 'elegant',
  items: ['evening gown', 'heels', 'jewelry'],
  colors: ['black', 'gold'],
  moodEffects: { elegance: 1.0, confidence: 0.9 }
};

response.data.model.outfits.push(customOutfit);

console.log('Model with custom outfit:', response.data.model);
```

## 📞 Need Help?

- **Documentation:** [README.md](README.md)
- **Implementation Guide:** [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Architecture:** [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md)
- **Support:** support@tightandhard.com

---

**Ready to generate your first AI companion?** 🚀

```bash
npm start && \
curl -X POST http://localhost:5002/api/models/generate \
  -H "Content-Type: application/json" \
  -d '{
    "personaType": "romantic_partner",
    "customizations": {"hairColor": "blonde"},
    "ownerName": "Your Name"
  }'
```