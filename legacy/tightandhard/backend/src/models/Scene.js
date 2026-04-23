const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scene = sequelize.define('Scene', {
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
  environment: {
    type: DataTypes.ENUM(
      'indoor',
      'outdoor',
      'urban',
      'nature',
      'fantasy',
      'underwater',
      'space',
      'custom'
    ),
    allowNull: false,
    defaultValue: 'indoor'
  },
  timeOfDay: {
    type: DataTypes.ENUM('dawn', 'morning', 'afternoon', 'evening', 'night', 'midnight'),
    defaultValue: 'evening'
  },
  weather: {
    type: DataTypes.ENUM(
      'clear',
      'cloudy',
      'rainy',
      'stormy',
      'snowy',
      'windy',
      'foggy',
      'sunny',
      'custom'
    ),
    defaultValue: 'clear'
  },
  ambiance: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      mood: 'romantic',
      intensity: 0.5,
      energy: 0.5,
      intimacy: 0.5
    }
  },
  lighting: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      brightness: 0.7,
      colorTemperature: 0.6,
      shadows: 0.3,
      highlights: 0.7
    }
  },
  soundscape: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      ambientSounds: [],
      volume: 0.5,
      music: null
    }
  },
  interactiveElements: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  isUnlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  unlockCondition: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      type: 'none',
      value: 0
    }
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  ownerCharacterId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Characters',
      key: 'id'
    }
  },
  intimacyLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5
    }
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  userRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    validate: {
      min: 0.0,
      max: 5.0
    }
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  accessibility: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      mobility: 'normal',
      vision: 'normal',
      hearing: 'normal'
    }
  },
  dynamicElements: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
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
  tableName: 'Scenes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['environment']
    },
    {
      fields: ['isUnlocked']
    },
    {
      fields: ['isPremium']
    },
    {
      fields: ['intimacyLevel']
    },
    {
      fields: ['usageCount']
    },
    {
      fields: ['userRating']
    }
  ]
});

// Define associations
Scene.associate = (models) => {
  Scene.belongsTo(models.Character, {
    foreignKey: 'ownerCharacterId',
    as: 'owner'
  });
  
  Scene.hasMany(models.Character, {
    foreignKey: 'currentSceneId',
    as: 'charactersInScene'
  });
};

// Instance methods
Scene.prototype.use = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  await this.save();
  return this;
};

Scene.prototype.unlock = function() {
  this.isUnlocked = true;
  return this;
};

Scene.prototype.lock = function() {
  this.isUnlocked = false;
  return this;
};

Scene.prototype.rate = function(rating) {
  const normalizedRating = Math.max(0.0, Math.min(5.0, rating));
  
  // Calculate new average rating
  const totalRating = this.userRating * this.ratingCount;
  this.ratingCount += 1;
  this.userRating = (totalRating + normalizedRating) / this.ratingCount;
  
  return this;
};

Scene.prototype.updateAmbiance = function(newAmbiance) {
  this.ambiance = { ...this.ambiance, ...newAmbiance };
  return this;
};

Scene.prototype.updateLighting = function(newLighting) {
  this.lighting = { ...this.lighting, ...newLighting };
  return this;
};

Scene.prototype.updateSoundscape = function(newSoundscape) {
  this.soundscape = { ...this.soundscape, ...newSoundscape };
  return this;
};

Scene.prototype.addInteractiveElement = function(element) {
  if (!this.interactiveElements.find(e => e.id === element.id)) {
    this.interactiveElements.push(element);
  }
  return this;
};

Scene.prototype.removeInteractiveElement = function(elementId) {
  this.interactiveElements = this.interactiveElements.filter(e => e.id !== elementId);
  return this;
};

Scene.prototype.updateDynamicElements = function(newDynamicElements) {
  this.dynamicElements = { ...this.dynamicElements, ...newDynamicElements };
  return this;
};

Scene.prototype.checkUnlockCondition = function(bondingLevel, subscription = false) {
  const condition = this.unlockCondition;
  
  switch (condition.type) {
    case 'bonding':
      return bondingLevel >= condition.value;
    case 'subscription':
      return subscription;
    case 'both':
      return bondingLevel >= condition.value.bonding && subscription === condition.value.subscription;
    default:
      return true;
  }
};

Scene.prototype.getIntimacyEffect = function() {
  return {
    intimacyLevel: this.intimacyLevel,
    ambiance: this.ambiance,
    lighting: this.lighting,
    soundscape: this.soundscape
  };
};

Scene.prototype.isSuitableForTime = function(timeOfDay) {
  return this.timeOfDay === timeOfDay;
};

Scene.prototype.isSuitableForWeather = function(weather) {
  return this.weather === weather || this.weather === 'custom';
};

Scene.prototype.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this;
};

Scene.prototype.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this;
};

Scene.prototype.getDetails = function() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    environment: this.environment,
    timeOfDay: this.timeOfDay,
    weather: this.weather,
    ambiance: this.ambiance,
    lighting: this.lighting,
    soundscape: this.soundscape,
    interactiveElements: this.interactiveElements,
    isUnlocked: this.isUnlocked,
    unlockCondition: this.unlockCondition,
    isPremium: this.isPremium,
    price: this.price,
    intimacyLevel: this.intimacyLevel,
    usageCount: this.usageCount,
    lastUsed: this.lastUsed,
    userRating: this.userRating,
    ratingCount: this.ratingCount,
    tags: this.tags,
    accessibility: this.accessibility,
    dynamicElements: this.dynamicElements
  };
};

// Class methods
Scene.getUnlockedScenes = async function() {
  return await this.findAll({
    where: { isUnlocked: true },
    order: [['usageCount', 'DESC'], ['userRating', 'DESC']]
  });
};

Scene.getPremiumScenes = async function() {
  return await this.findAll({
    where: { isPremium: true, isUnlocked: true },
    order: [['userRating', 'DESC'], ['usageCount', 'DESC']]
  });
};

Scene.getFreeScenes = async function() {
  return await this.findAll({
    where: { isPremium: false, isUnlocked: true },
    order: [['usageCount', 'DESC'], ['userRating', 'DESC']]
  });
};

Scene.getByEnvironment = async function(environment) {
  return await this.findAll({
    where: { environment: environment, isUnlocked: true },
    order: [['userRating', 'DESC'], ['usageCount', 'DESC']]
  });
};

Scene.getByIntimacyLevel = async function(level) {
  return await this.findAll({
    where: { intimacyLevel: level, isUnlocked: true },
    order: [['userRating', 'DESC'], ['usageCount', 'DESC']]
  });
};

Scene.getRecommendations = async function(currentMood, environment = null, timeOfDay = null) {
  const whereClause = { isUnlocked: true };
  
  if (environment) {
    whereClause.environment = environment;
  }
  
  const scenes = await this.findAll({
    where: whereClause,
    order: [['userRating', 'DESC'], ['usageCount', 'DESC']]
  });
  
  // Score scenes based on suitability
  const scoredScenes = scenes.map(scene => {
    let score = scene.userRating * 10;
    
    // Mood matching
    if (scene.ambiance.mood === currentMood) {
      score += 25;
    }
    
    // Time matching
    if (timeOfDay && scene.isSuitableForTime(timeOfDay)) {
      score += 15;
    }
    
    // Usage popularity
    score += Math.min(scene.usageCount * 0.5, 15);
    
    return {
      scene: scene.toJSON(),
      score: score
    };
  });
  
  // Sort by score and return top recommendations
  scoredScenes.sort((a, b) => b.score - a.score);
  
  return scoredScenes.slice(0, 10).map(item => item.scene);
};

Scene.getCustomScenes = async function(characterId) {
  return await this.findAll({
    where: {
      ownerCharacterId: characterId,
      environment: 'custom'
    },
    order: [['updatedAt', 'DESC']]
  });
};

module.exports = Scene;