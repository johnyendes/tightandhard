const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CharacterCampaign = sequelize.define('CharacterCampaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  
  // Campaign details
  campaignData: {
    type: DataTypes.JSONB,
    defaultValue: {
      targetAudience: {
        demographics: [],
        ageRange: '',
        interests: [],
        psychographics: []
      },
      objectives: [],
      platforms: [],
      adFormats: []
    }
  },
  
  // Visual style guide
  styleGuide: {
    type: DataTypes.JSONB,
    defaultValue: {
      aesthetic: 'cinematic',
      lighting: 'studio',
      mood: '',
      colorPalette: [],
      photographyStyle: 'professional'
    }
  },
  
  // Brand guidelines
  brandGuidelines: {
    type: DataTypes.JSONB,
    defaultValue: {
      logoPlacement: 'top-right',
      colorScheme: [],
      fonts: [],
      tone: 'professional'
    }
  },
  
  // Campaign timeline
  timeline: {
    type: DataTypes.JSONB,
    defaultValue: {
      startDate: null,
      endDate: null,
      milestones: []
    }
  },
  
  // Budget and tracking
  budget: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalBudget: 0,
      imageBudget: 0,
      perImageCost: 0,
      currency: 'USD'
    }
  },
  
  // Generation requirements
  generationRequirements: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalImagesNeeded: 10,
      charactersPerImage: 1,
      minResolution: '1024x1024',
      outputFormat: 'PNG'
    }
  },
  
  // Stats
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      imagesGenerated: 0,
      imagesApproved: 0,
      imagesRejected: 0,
      avgQualityScore: 0
    }
  },
  
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'completed'),
    defaultValue: 'draft'
  },
  
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'CharacterCampaigns',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] }
  ]
});

// Define associations
CharacterCampaign.associate = (models) => {
  CharacterCampaign.hasMany(models.Character, {
    foreignKey: 'campaignId',
    as: 'characters'
  });
};

module.exports = CharacterCampaign;