const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CharacterImage = sequelize.define('CharacterImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  characterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Characters',
      key: 'id'
    }
  },
  // Image metadata
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  localPath: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Generation details
  generationData: {
    type: DataTypes.JSONB,
    defaultValue: {
      prompt: '',
      negativePrompt: [],
      seed: -1,
      steps: 30,
      cfgScale: 7.5,
      width: 1024,
      height: 1024,
      model: 'stable-diffusion-xl',
      controlNetUsed: false,
      controlNetType: null,
      faceSwapUsed: false,
      loraUsed: false,
      loraModelId: null
    }
  },
  
  // Photography settings
  photographySettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      camera: '35mm',
      lens: '50mm',
      aperture: 'f/2.8',
      iso: 100,
      lighting: 'studio'
    }
  },
  
  // Pose and composition
  poseData: {
    type: DataTypes.JSONB,
    defaultValue: {
      poseType: 'standing',
      bodyLanguage: 'neutral',
      orientation: 'front',
      angle: 'eye-level'
    }
  },
  
  // Quality metrics
  qualityMetrics: {
    type: DataTypes.JSONB,
    defaultValue: {
      photorealismScore: 0,
      consistencyScore: 0,
      compositionScore: 0,
      overallScore: 0,
      aiAnalysis: {}
    }
  },
  
  // Post-processing
  postProcessing: {
    type: DataTypes.JSONB,
    defaultValue: {
      upscaled: false,
      upscaleFactor: 1,
      retouched: false,
      retouchDetails: [],
      grainAdded: false
    }
  },
  
  // Consistency tracking
  consistencyData: {
    type: DataTypes.JSONB,
    defaultValue: {
      masterFaceMatch: 0,
      seedConsistency: false,
      loraMatch: 0
    }
  },
  
  // Campaign usage
  campaignData: {
    type: DataTypes.JSONB,
    defaultValue: {
      campaignId: null,
      adFormat: null,
      platform: null,
      copyText: null
    }
  },
  
  // Status and metadata
  status: {
    type: DataTypes.ENUM('generating', 'completed', 'failed', 'processing'),
    defaultValue: 'generating'
  },
  
  generationTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  tags: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'CharacterImages',
  timestamps: true,
  indexes: [
    { fields: ['characterId'] },
    { fields: ['status'] },
    { fields: ['isFavorite'] },
    { fields: ['isApproved'] }
  ]
});

// Define associations
CharacterImage.associate = (models) => {
  CharacterImage.belongsTo(models.Character, {
    foreignKey: 'characterId',
    as: 'character'
  });
};

module.exports = CharacterImage;