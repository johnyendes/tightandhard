const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoicePreset = sequelize.define('VoicePreset', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pitch: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0,
    validate: {
      min: 0.5,
      max: 2.0
    }
  },
  speed: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0,
    validate: {
      min: 0.5,
      max: 2.0
    }
  },
  tone: {
    type: DataTypes.ENUM(
      'soft',
      'neutral',
      'firm',
      'warm',
      'cold',
      'playful',
      'serious',
      'seductive',
      'authoritative',
      'gentle'
    ),
    defaultValue: 'neutral'
  },
  accent: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'standard'
  },
  emotionalRange: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      happiness: 1.0,
      sadness: 1.0,
      anger: 1.0,
      excitement: 1.0,
      calm: 1.0,
      fear: 1.0
    }
  },
  breathiness: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  volume: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0,
    validate: {
      min: 0.0,
      max: 2.0
    }
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'neutral', 'custom'),
    defaultValue: 'neutral'
  },
  ageRange: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      min: 18,
      max: 65
    }
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en-US'
  },
  userCustomized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  customizationDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  personalityTraits: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
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
  tableName: 'VoicePresets',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['gender']
    },
    {
      fields: ['tone']
    },
    {
      fields: ['isDefault']
    },
    {
      fields: ['isFavorite']
    },
    {
      fields: ['language']
    },
    {
      fields: ['usageCount']
    }
  ]
});

// Define associations
VoicePreset.associate = (models) => {
  VoicePreset.hasMany(models.Character, {
    foreignKey: 'voicePresetId',
    as: 'characters'
  });
};

// Instance methods
VoicePreset.prototype.use = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  await this.save();
  return this;
};

VoicePreset.prototype.favorite = function(isFavorite = true) {
  this.isFavorite = isFavorite;
  return this;
};

VoicePreset.prototype.customize = function(customizationDetails) {
  this.userCustomized = true;
  this.customizationDetails = { ...this.customizationDetails, ...customizationDetails };
  return this;
};

VoicePreset.prototype.adjustForEmotion = function(emotion, intensity = 0.5) {
  const adjustments = {
    pitch: this.pitch,
    speed: this.speed,
    tone: this.tone,
    breathiness: this.breathiness,
    volume: this.volume
  };
  
  // Apply emotion-based adjustments
  switch (emotion.toLowerCase()) {
    case 'happy':
      adjustments.pitch *= (1 + (0.1 * intensity));
      adjustments.speed *= (1 + (0.15 * intensity));
      adjustments.tone = 'warm';
      break;
    case 'sad':
      adjustments.pitch *= (1 - (0.1 * intensity));
      adjustments.speed *= (1 - (0.15 * intensity));
      adjustments.breathiness += (0.2 * intensity);
      adjustments.tone = 'soft';
      break;
    case 'angry':
      adjustments.pitch *= (1 + (0.15 * intensity));
      adjustments.speed *= (1 + (0.2 * intensity));
      adjustments.volume *= (1 + (0.2 * intensity));
      adjustments.tone = 'firm';
      break;
    case 'excited':
      adjustments.pitch *= (1 + (0.15 * intensity));
      adjustments.speed *= (1 + (0.25 * intensity));
      adjustments.tone = 'playful';
      break;
    case 'calm':
      adjustments.speed *= (1 - (0.1 * intensity));
      adjustments.breathiness += (0.1 * intensity);
      adjustments.tone = 'gentle';
      break;
    case 'fear':
      adjustments.pitch *= (1 + (0.2 * intensity));
      adjustments.speed *= (1 + (0.1 * intensity));
      adjustments.breathiness += (0.3 * intensity);
      break;
    case 'love':
      adjustments.pitch *= (1 - (0.05 * intensity));
      adjustments.speed *= (1 - (0.1 * intensity));
      adjustments.breathiness += (0.2 * intensity);
      adjustments.tone = 'warm';
      break;
    case 'confident':
      adjustments.pitch *= (1 - (0.05 * intensity));
      adjustments.volume *= (1 + (0.1 * intensity));
      adjustments.tone = 'authoritative';
      break;
    case 'shy':
      adjustments.pitch *= (1 - (0.1 * intensity));
      adjustments.volume *= (1 - (0.15 * intensity));
      adjustments.tone = 'soft';
      break;
    case 'seductive':
      adjustments.pitch *= (1 - (0.1 * intensity));
      adjustments.speed *= (1 - (0.15 * intensity));
      adjustments.breathiness += (0.3 * intensity);
      adjustments.volume *= (1 - (0.1 * intensity));
      adjustments.tone = 'seductive';
      break;
    default:
      // Keep default values
      break;
  }
  
  // Ensure values stay within valid ranges
  adjustments.pitch = Math.max(0.5, Math.min(2.0, adjustments.pitch));
  adjustments.speed = Math.max(0.5, Math.min(2.0, adjustments.speed));
  adjustments.breathiness = Math.max(0.0, Math.min(1.0, adjustments.breathiness));
  adjustments.volume = Math.max(0.0, Math.min(2.0, adjustments.volume));
  
  return adjustments;
};

VoicePreset.prototype.generateEmotionalParameters = function(emotionState) {
  const { happiness, excitement, trust, affection, energy, mood } = emotionState;
  
  let emotion = mood;
  let intensity = (happiness + excitement + energy) / 3;
  
  // Determine dominant emotion
  if (affection > 0.7 && trust > 0.7) {
    emotion = 'love';
  } else if (excitement > 0.7 && happiness > 0.7) {
    emotion = 'excited';
  } else if (happiness < 0.3) {
    emotion = 'sad';
  } else if (trust < 0.3 && energy > 0.7) {
    emotion = 'angry';
  } else if (energy < 0.3 && trust > 0.5) {
    emotion = 'calm';
  }
  
  return this.adjustForEmotion(emotion, intensity);
};

VoicePreset.prototype.isSuitableForPersonality = function(personality) {
  // Check if personality traits match
  const traits = personality.traits || [];
  const presetTraits = this.personalityTraits || [];
  
  // If no traits defined, it's suitable
  if (presetTraits.length === 0) {
    return true;
  }
  
  // Check for trait overlap
  const hasMatchingTraits = traits.some(trait => presetTraits.includes(trait));
  return hasMatchingTraits;
};

VoicePreset.prototype.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this;
};

VoicePreset.prototype.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this;
};

VoicePreset.prototype.getDetails = function() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    pitch: this.pitch,
    speed: this.speed,
    tone: this.tone,
    accent: this.accent,
    emotionalRange: this.emotionalRange,
    breathiness: this.breathiness,
    volume: this.volume,
    isDefault: this.isDefault,
    gender: this.gender,
    ageRange: this.ageRange,
    language: this.language,
    userCustomized: this.userCustomized,
    customizationDetails: this.customizationDetails,
    usageCount: this.usageCount,
    lastUsed: this.lastUsed,
    isFavorite: this.isFavorite,
    tags: this.tags,
    personalityTraits: this.personalityTraits
  };
};

// Class methods
VoicePreset.getDefaultPresets = async function() {
  return await this.findAll({
    where: { isDefault: true },
    order: [['name', 'ASC']]
  });
};

VoicePreset.getByGender = async function(gender) {
  return await this.findAll({
    where: { gender: gender },
    order: [['usageCount', 'DESC'], [['userCustomized', 'ASC']]]
  });
};

VoicePreset.getByTone = async function(tone) {
  return await this.findAll({
    where: { tone: tone },
    order: [['usageCount', 'DESC']]
  });
};

VoicePreset.getFavorites = async function() {
  return await this.findAll({
    where: { isFavorite: true },
    order: [['usageCount', 'DESC']]
  });
};

VoicePreset.getCustomPresets = async function() {
  return await this.findAll({
    where: { userCustomized: true },
    order: [['lastUsed', 'DESC'], [['usageCount', 'DESC']]]
  });
};

VoicePreset.getRecommendations = async function(personality, emotion = null) {
  const presets = await this.findAll({
    order: [['usageCount', 'DESC'], [['isDefault', 'DESC']]]
  });
  
  // Score presets based on suitability
  const scoredPresets = presets.map(preset => {
    let score = 0;
    
    // Personality matching
    if (preset.isSuitableForPersonality(personality)) {
      score += 30;
    }
    
    // Tone preference (if emotion is specified)
    if (emotion) {
      const preferredTones = {
        happy: 'warm',
        sad: 'soft',
        angry: 'firm',
        excited: 'playful',
        calm: 'gentle',
        love: 'warm',
        confident: 'authoritative',
        shy: 'soft',
        seductive: 'seductive'
      };
      
      if (preset.tone === preferredTones[emotion.toLowerCase()]) {
        score += 25;
      }
    }
    
    // Usage popularity
    score += Math.min(preset.usageCount * 0.5, 15);
    
    // Favorite boost
    if (preset.isFavorite) {
      score += 10;
    }
    
    return {
      preset: preset.toJSON(),
      score: score
    };
  });
  
  // Sort by score and return top recommendations
  scoredPresets.sort((a, b) => b.score - a.score);
  
  return scoredPresets.slice(0, 10).map(item => item.preset);
};

VoicePreset.createEmotionalVariants = async function(basePresetId) {
  const basePreset = await this.findByPk(basePresetId);
  if (!basePreset) {
    throw new Error('Base preset not found');
  }
  
  const emotions = ['happy', 'sad', 'angry', 'excited', 'calm', 'love'];
  const variants = [];
  
  for (const emotion of emotions) {
    const emotionalParams = basePreset.adjustForEmotion(emotion, 0.5);
    const variant = await this.create({
      ...basePreset.toJSON(),
      id: undefined,
      name: `${basePreset.name} - ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`,
      description: `Emotional variant: ${emotion}`,
      ...emotionalParams,
      isDefault: false,
      userCustomized: true,
      tags: [...basePreset.tags, emotion, 'variant']
    });
    variants.push(variant);
  }
  
  return variants;
};

module.exports = VoicePreset;