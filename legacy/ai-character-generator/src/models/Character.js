const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../config/database');

const Character = sequelize.define('Character', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  campaignId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Campaigns',
      key: 'id'
    }
  },
  // Conceptualization - Target Audience
  targetAudience: {
    type: DataTypes.JSONB,
    defaultValue: {
      demographics: [],
      ageRange: '',
      interests: [],
      psychographics: []
    }
  },
  
  // Character Bio
  bio: {
    type: DataTypes.JSONB,
    defaultValue: {
      age: '',
      ethnicity: '',
      style: '',
      personality: '',
      occupation: '',
      background: ''
    }
  },
  
  // Visual Style
  visualStyle: {
    type: DataTypes.JSONB,
    defaultValue: {
      aesthetic: 'cinematic', // cinematic, studio, candid, minimal
      lighting: 'studio',
      mood: '',
      colorPalette: []
    }
  },
  
  // Photography Settings
  photographySettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      camera: '35mm',
      lens: '50mm',
      aperture: 'f/2.8',
      iso: 100,
      depthOfField: true
    }
  },
  
  // Consistency Settings
  consistencySettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      seed: -1, // -1 = random
      masterFaceId: null,
      loraModelId: null,
      useFaceSwap: true,
      controlNetEnabled: true
    }
  },
  
  // Negative Prompts
  negativePrompts: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [
      'cartoon',
      'illustration',
      'distorted hands',
      'bad anatomy',
      'low quality',
      'blurry',
      'oversaturated',
      'plastic skin'
    ]
  },
  
  // Base Prompts
  basePrompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  // Generation Stats
  generationStats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalImages: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      avgGenerationTime: 0
    }
  },
  
  // Quality Metrics
  qualityMetrics: {
    type: DataTypes.JSONB,
    defaultValue: {
      avgPhotorealismScore: 0,
      avgConsistencyScore: 0,
      avgCompositionScore: 0
    }
  },
  
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived'),
    defaultValue: 'draft'
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'Characters',
  timestamps: true,
  indexes: [
    { fields: ['campaignId'] },
    { fields: ['status'] },
    { fields: ['name'] }
  ]
});

module.exports = Character;