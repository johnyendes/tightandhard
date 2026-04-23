const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Character = sequelize.define('Character', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  personality: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      traits: [],
      interests: [],
      values: [],
      communicationStyle: 'balanced'
    }
  },
  appearance: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      gender: 'female',
      age: 25,
      ethnicity: 'caucasian',
      height: 170,
      weight: 65,
      build: 'mesomorph',
      facialFeatures: {},
      hairStyle: {}
    }
  },
  backstory: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  currentSceneId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Scenes',
      key: 'id'
    }
  },
  voicePresetId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'VoicePresets',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  lastInteractionAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Characters',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['lastInteractionAt']
    }
  ]
});

// Define associations
Character.associate = (models) => {
  Character.hasOne(models.EmotionState, {
    foreignKey: 'characterId',
    as: 'emotionState'
  });
  
  Character.hasOne(models.BondingTier, {
    foreignKey: 'characterId',
    as: 'bondingTier'
  });
  
  Character.hasMany(models.Memory, {
    foreignKey: 'characterId',
    as: 'memories'
  });
  
  Character.hasMany(models.MirrorLearning, {
    foreignKey: 'characterId',
    as: 'learningPatterns'
  });
  
  Character.hasMany(models.Outfit, {
    foreignKey: 'characterId',
    as: 'outfits'
  });
  
  Character.belongsTo(models.Scene, {
    foreignKey: 'currentSceneId',
    as: 'currentScene'
  });
  
  Character.belongsTo(models.VoicePreset, {
    foreignKey: 'voicePresetId',
    as: 'voicePreset'
  });
  
  Character.hasMany(models.Scene, {
    foreignKey: 'ownerId',
    as: 'customScenes'
  });
  
  Character.hasMany(models.CharacterImage, {
    foreignKey: 'characterId',
    as: 'characterImages'
  });
  
  Character.belongsTo(models.CharacterCampaign, {
    foreignKey: 'campaignId',
    as: 'campaign'
  });
};

module.exports = Character;