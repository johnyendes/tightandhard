# TightandHard.com - AI Companion System

## Overview

TightandHard.com is a sophisticated AI companion simulation platform featuring emotional intelligence, adaptive learning, and immersive character interactions.

## Architecture

### Tech Stack

**Backend:**
- Node.js 18+ with Express.js
- PostgreSQL 15 with Sequelize ORM
- Redis 7 for caching and session management
- Docker containerization

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- WebSocket support for real-time interactions

### Core Systems

1. **Emotion Engine™** - Dynamic emotional state management
2. **Mirror Learning System** - Adaptive behavior based on user interactions
3. **Bonding Tier System** - Progressive relationship development (1-10 levels)
4. **Memory System** - Persistent context and conversation history
5. **Voice Synthesis** - Emotion-aware voice parameter generation
6. **Outfit Dresser** - Contextual character appearance management
7. **Scene Engine** - Environmental context and atmosphere control

## Project Structure

```
tightandhard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── redis.js
│   │   ├── models/
│   │   │   ├── Character.js
│   │   │   ├── EmotionState.js
│   │   │   ├── BondingTier.js
│   │   │   ├── Memory.js
│   │   │   ├── MirrorLearning.js
│   │   │   ├── Outfit.js
│   │   │   ├── Scene.js
│   │   │   └── VoicePreset.js
│   │   ├── routes/
│   │   │   ├── emotionEngineRoutes.js
│   │   │   ├── bondingTierRoutes.js
│   │   │   ├── memorySystemRoutes.js
│   │   │   ├── mirrorLearningRoutes.js
│   │   │   ├── outfitDresserRoutes.js
│   │   │   ├── sceneEngineRoutes.js
│   │   │   └── voiceSynthesisRoutes.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── styles/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

## Installation & Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15 (for local development)
- Redis 7 (for local development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd tightandhard
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the application:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- API Health: http://localhost:5001/api/health

### Local Development Setup

1. Backend Setup:
```bash
cd backend
npm install
cp .env.example .env
# Configure database and Redis in .env
npm run dev
```

2. Frontend Setup:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Documentation

### Health Check
```
GET /api/health
```

### Emotion Engine
```
GET /api/emotion/:characterId
POST /api/emotion/:characterId/update
POST /api/emotion/:characterId/process-interaction
```

### Bonding System
```
GET /api/bonding/:characterId
POST /api/bonding/:characterId/add-xp
GET /api/bonding/:characterId/features
GET /api/bonding/:characterId/feature/:featureName
```

### Memory System
```
GET /api/memory/:characterId
POST /api/memory/:characterId
PUT /api/memory/:characterId/:memoryId
DELETE /api/memory/:characterId/:memoryId
GET /api/memory/:characterId/search
GET /api/memory/:characterId/core
POST /api/memory/:characterId/:memoryId/access
```

### Mirror Learning
```
GET /api/mirror/:characterId
POST /api/mirror/:characterId/learn
POST /api/mirror/:characterId/:patternId/reinforce
POST /api/mirror/:characterId/adapt
```

### Voice Synthesis
```
GET /api/voice/
GET /api/voice/:characterId/current
POST /api/voice/custom
PUT /api/voice/:presetId
POST /api/voice/:characterId/set-preset
POST /api/voice/:characterId/generate-voice
```

### Outfit System
```
GET /api/outfit/:characterId
POST /api/outfit/:characterId
PUT /api/outfit/:characterId/:outfitId
DELETE /api/outfit/:characterId/:outfitId
POST /api/outfit/:characterId/:outfitId/activate
```

### Scene Engine
```
GET /api/scene/
GET /api/scene/:characterId/current
POST /api/scene/:characterId/change-scene
POST /api/scene/custom
PUT /api/scene/:sceneId/ambiance
```

## Bonding Tiers

The companion system features 10 bonding levels:

1. **Acquaintance** (0 XP) - Basic conversation, daily greetings
2. **Friend** (100 XP) - Personal questions, memory sharing
3. **Close Friend** (250 XP) - Emotional support, outfit suggestions
4. **Confidant** (500 XP) - Deep conversations, secrets sharing
5. **Trusted Ally** (800 XP) - Loyalty tasks, protective behavior
6. **Intimate Friend** (1200 XP) - Physical comfort, romantic interest
7. **Deep Bond** (1800 XP) - Emotional vulnerability, exclusive attention
8. **Soulmate** (2500 XP) - Unconditional support, life planning
9. **Eternal Partner** (3500 XP) - Shared destiny, transcendent connection
10. **Beyond Words** (5000 XP) - Telepathic understanding, spiritual unity

## Database Schema

### Core Models

**Character**
- id, name, personality, appearance, backstory
- currentSceneId, voicePresetId, isActive

**EmotionState**
- id, characterId, happiness, excitement, trust, affection, energy
- mood, lastInteraction

**BondingTier**
- id, characterId, currentTier, experiencePoints, tierName
- unlockedFeatures, milestones, nextTierRequirement

**Memory**
- id, characterId, type, content, emotionalWeight, importance
- tags, linkedMemories, lastAccessed, isCore

**MirrorLearning**
- id, characterId, behaviorPattern, userTrigger, adaptedResponse
- confidence, usageCount, successRate, lastReinforcement, isActive

**Outfit**
- id, characterId, name, category, items, colors, style, mood
- isUnlocked, unlockCondition, isActive

**Scene**
- id, name, environment, timeOfDay, weather, ambiance
- lighting, soundscape, interactiveElements, isUnlocked

**VoicePreset**
- id, name, pitch, speed, tone, accent, emotionalRange
- breathiness, isDefault

## Development

### Code Style
- Use ESLint for linting
- Follow conventional commit messages
- Write unit tests for new features
- Document API endpoints with Swagger/OpenAPI

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Deployment

The application is containerized for easy deployment to any Docker-compatible platform:

1. **Production Build:**
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

2. **Environment Variables:**
Ensure production environment variables are properly configured in `.env` or via your hosting platform's configuration management.

3. **Database Migration:**
Run database migrations in production:
```bash
docker-compose exec backend npm run migrate
```

4. **Health Monitoring:**
Monitor the health endpoint: `GET /api/health`

## Security Considerations

- All API endpoints should be protected with authentication middleware
- Use HTTPS in production
- Implement rate limiting to prevent abuse
- Sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Secure JWT secrets with strong, randomly generated values
- Implement proper CORS configuration

## Performance Optimization

- Redis caching for frequently accessed data
- Database connection pooling
- CDN for static assets
- Image optimization and lazy loading
- WebSocket connections for real-time updates
- Background job processing for heavy operations

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify network connectivity between containers

### Redis Connection Issues
- Ensure Redis is running
- Check Redis URL configuration
- Verify Redis health check status

### Application Not Starting
- Check logs: `docker-compose logs`
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check port conflicts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

PROPRIETARY - All rights reserved

## Support

For technical support, contact: support@tightandhard.com

## Changelog

### Version 1.0.0
- Initial release
- Core emotion engine implementation
- Bonding tier system
- Mirror learning system
- Memory management
- Voice synthesis
- Outfit system
- Scene engine
- Full API documentation
- Docker deployment support