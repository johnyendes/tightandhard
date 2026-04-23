const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmotionState = sequelize.define('EmotionState', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  characterId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Characters',
      key: 'id'
    }
  },
  happiness: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  excitement: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  trust: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.3,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  affection: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.2,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  energy: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.7,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  mood: {
    type: DataTypes.ENUM(
      'happy',
      'relaxed',
      'excited',
      'calm',
      'anxious',
      'sad',
      'angry',
      'shy',
      'confident',
      'curious'
    ),
    defaultValue: 'calm'
  },
  lastInteraction: {
    type: DataTypes.JSONB,
    defaultValue: {
      type: 'none',
      intensity: 0.0,
      timestamp: new Date().toISOString()
    }
  },
  moodHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  emotionalFactors: {
    type: DataTypes.JSONB,
    defaultValue: {
      timeOfDay: 1.0,
      outfit: 1.0,
      personality: 1.0,
      environment: 1.0
    }
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
  }
}, {
  tableName: 'EmotionStates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      unique: true,
      fields: ['characterId']
    },
    {
      fields: ['mood']
    }
  ]
});

// Define associations
EmotionState.associate = (models) => {
  EmotionState.belongsTo(models.Character, {
    foreignKey: 'characterId',
    as: 'character'
  });
};

// Instance methods
EmotionState.prototype.updateEmotion = function(emotionChanges, factors = {}) {
  const updates = emotionChanges || {};
  const emotionalFactors = { ...this.emotionalFactors, ...factors };
  
  // Apply changes with factor multipliers
  Object.keys(updates).forEach(emotion => {
    if (this[emotion] !== undefined && typeof updates[emotion] === 'number') {
      const change = updates[emotion] * emotionalFactors[emotion] || 1.0;
      this[emotion] = Math.max(0.0, Math.min(1.0, this[emotion] + change));
    }
  });
  
  // Update mood based on dominant emotion
  this.updateMood();
  
  // Record interaction
  this.lastInteraction = {
    type: 'emotion_update',
    intensity: Math.abs(Object.values(updates).reduce((sum, val) => sum + val, 0)),
    timestamp: new Date().toISOString()
  };
  
  // Add to mood history
  this.moodHistory.push({
    mood: this.mood,
    timestamp: new Date().toISOString(),
    emotions: {
      happiness: this.happiness,
      excitement: this.excitement,
      trust: this.trust,
      affection: this.affection,
      energy: this.energy
    }
  });
  
  // Keep mood history limited to last 100 entries
  if (this.moodHistory.length > 100) {
    this.moodHistory = this.moodHistory.slice(-100);
  }
  
  return this;
};

EmotionState.prototype.updateMood = function() {
  const emotions = {
    happiness: this.happiness,
    excitement: this.excitement,
    trust: this.trust,
    affection: this.affection,
    energy: this.energy
  };
  
  // Calculate mood based on emotional state
  if (emotions.happiness > 0.7 && emotions.energy > 0.6) {
    this.mood = 'happy';
  } else if (emotions.energy < 0.3 && emotions.happiness > 0.5) {
    this.mood = 'relaxed';
  } else if (emotions.excitement > 0.7 && emotions.energy > 0.7) {
    this.mood = 'excited';
  } else if (emotions.happiness < 0.3 && emotions.trust < 0.3) {
    this.mood = 'anxious';
  } else if (emotions.happiness < 0.3 && emotions.trust > 0.5) {
    this.mood = 'sad';
  } else if (emotions.trust < 0.3 && emotions.energy > 0.7) {
    this.mood = 'angry';
  } else if (emotions.trust > 0.5 && emotions.energy < 0.4) {
    this.mood = 'shy';
  } else if (emotions.trust > 0.7 && emotions.energy > 0.7) {
    this.mood = 'confident';
  } else if (emotions.excitement > 0.6 && emotions.trust > 0.5) {
    this.mood = 'curious';
  } else {
    this.mood = 'calm';
  }
  
  return this.mood;
};

EmotionState.prototype.getEmotionalState = function() {
  return {
    characterId: this.characterId,
    emotions: {
      happiness: this.happiness,
      excitement: this.excitement,
      trust: this.trust,
      affection: this.affection,
      energy: this.energy
    },
    mood: this.mood,
    lastInteraction: this.lastInteraction,
    emotionalFactors: this.emotionalFactors,
    timestamp: this.updatedAt
  };
};

module.exports = EmotionState;