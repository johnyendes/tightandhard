const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Outfit = sequelize.define('Outfit', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  category: {
    type: DataTypes.ENUM(
      'casual',
      'formal',
      'athletic',
      'sleepwear',
      'fantasy',
      'seasonal',
      'swimwear',
      'intimate',
      'roleplay',
      'traditional'
    ),
    allowNull: false,
    defaultValue: 'casual'
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  colors: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#808080'
    }
  },
  style: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'modern'
  },
  mood: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      targetMood: 'calm',
      happinessBoost: 0.0,
      confidenceBoost: 0.0,
      affectionBoost: 0.0
    }
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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wearCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastWorn: {
    type: DataTypes.DATE,
    allowNull: true
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
  tags: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  season: {
    type: DataTypes.ENUM('spring', 'summer', 'autumn', 'winter', 'all'),
    defaultValue: 'all'
  },
  occasion: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  comfortLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 10
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
  tableName: 'Outfits',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['characterId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isUnlocked']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isFavorite']
    },
    {
      fields: ['season']
    },
    {
      fields: ['wearCount']
    }
  ]
});

// Define associations
Outfit.associate = (models) => {
  Outfit.belongsTo(models.Character, {
    foreignKey: 'characterId',
    as: 'character'
  });
};

// Instance methods
Outfit.prototype.activate = async function() {
  // Deactivate all other outfits for this character
  await Outfit.update(
    { isActive: false },
    { where: { characterId: this.characterId } }
  );
  
  // Activate this outfit
  this.isActive = true;
  this.wearCount += 1;
  this.lastWorn = new Date();
  await this.save();
  
  return this;
};

Outfit.prototype.unlock = function() {
  this.isUnlocked = true;
  return this;
};

Outfit.prototype.lock = function() {
  this.isUnlocked = false;
  this.isActive = false;
  return this;
};

Outfit.prototype.favorite = function(isFavorite = true) {
  this.isFavorite = isFavorite;
  return this;
};

Outfit.prototype.customize = function(customizationDetails) {
  this.userCustomized = true;
  this.customizationDetails = { ...this.customizationDetails, ...customizationDetails };
  return this;
};

Outfit.prototype.checkUnlockCondition = function(bondingLevel, tokens) {
  const condition = this.unlockCondition;
  
  switch (condition.type) {
    case 'bonding':
      return bondingLevel >= condition.value;
    case 'tokens':
      return tokens >= condition.value;
    case 'both':
      return bondingLevel >= condition.value.bonding && tokens >= condition.value.tokens;
    default:
      return true;
  }
};

Outfit.prototype.getMoodEffect = function() {
  return {
    targetMood: this.mood.targetMood,
    happinessBoost: this.mood.happinessBoost,
    confidenceBoost: this.mood.confidenceBoost,
    affectionBoost: this.mood.affectionBoost
  };
};

Outfit.prototype.isSuitableForOccasion = function(occasion) {
  return this.occasion.includes(occasion);
};

Outfit.prototype.isSuitableForSeason = function(season) {
  return this.season === 'all' || this.season === season;
};

Outfit.prototype.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this;
};

Outfit.prototype.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this;
};

Outfit.prototype.getDetails = function() {
  return {
    id: this.id,
    name: this.name,
    category: this.category,
    items: this.items,
    colors: this.colors,
    style: this.style,
    mood: this.mood,
    isUnlocked: this.isUnlocked,
    unlockCondition: this.unlockCondition,
    isActive: this.isActive,
    isFavorite: this.isFavorite,
    wearCount: this.wearCount,
    lastWorn: this.lastWorn,
    userCustomized: this.userCustomized,
    tags: this.tags,
    season: this.season,
    occasion: this.occasion,
    comfortLevel: this.comfortLevel
  };
};

// Class methods
Outfit.getActiveOutfit = async function(characterId) {
  return await this.findOne({
    where: {
      characterId: characterId,
      isActive: true
    }
  });
};

Outfit.getUnlockedOutfits = async function(characterId) {
  return await this.findAll({
    where: {
      characterId: characterId,
      isUnlocked: true
    },
    order: [['isFavorite', 'DESC'], ['wearCount', 'DESC']]
  });
};

Outfit.getLockedOutfits = async function(characterId) {
  return await this.findAll({
    where: {
      characterId: characterId,
      isUnlocked: false
    },
    order: [['unlockCondition', 'ASC']]
  });
};

Outfit.getFavorites = async function(characterId) {
  return await this.findAll({
    where: {
      characterId: characterId,
      isFavorite: true
    },
    order: [['wearCount', 'DESC']]
  });
};

Outfit.getByCategory = async function(characterId, category) {
  return await this.findAll({
    where: {
      characterId: characterId,
      category: category
    },
    order: [['wearCount', 'DESC']]
  });
};

Outfit.getBySeason = async function(characterId, season) {
  return await this.findAll({
    where: {
      characterId: characterId,
      season: { [require('sequelize').Op.or]: [season, 'all'] }
    },
    order: [['wearCount', 'DESC']]
  });
};

Outfit.getRecommendations = async function(characterId, currentMood, occasion = null, season = null) {
  const whereClause = {
    characterId: characterId,
    isUnlocked: true
  };
  
  if (season) {
    whereClause.season = { [require('sequelize').Op.or]: [season, 'all'] };
  }
  
  const outfits = await this.findAll({
    where: whereClause,
    order: [['wearCount', 'DESC']]
  });
  
  // Score outfits based on suitability
  const scoredOutfits = outfits.map(outfit => {
    let score = 0;
    
    // Mood matching
    if (outfit.mood.targetMood === currentMood) {
      score += 20;
    }
    
    // Occasion matching
    if (occasion && outfit.isSuitableForOccasion(occasion)) {
      score += 15;
    }
    
    // Favorite boost
    if (outfit.isFavorite) {
      score += 10;
    }
    
    // Comfort level
    score += outfit.comfortLevel;
    
    return {
      outfit: outfit.toJSON(),
      score: score
    };
  });
  
  // Sort by score and return top recommendations
  scoredOutfits.sort((a, b) => b.score - a.score);
  
  return scoredOutfits.slice(0, 10).map(item => item.outfit);
};

module.exports = Outfit;