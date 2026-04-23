const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MirrorLearning = sequelize.define('MirrorLearning', {
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
  behaviorPattern: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  userTrigger: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  adaptedResponse: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failureCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0.5
  },
  lastReinforcement: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastUsage: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  category: {
    type: DataTypes.ENUM(
      'conversation',
      'emotional',
      'behavioral',
      'preference',
      'conflict',
      'intimacy',
      'humor',
      'support',
      'advice',
      'general'
    ),
    defaultValue: 'general'
  },
  emotionalContext: {
    type: DataTypes.JSONB,
    defaultValue: {
      mood: 'neutral',
      happiness: 0.5,
      trust: 0.5,
      affection: 0.5
    }
  },
  tags: {
    type: DataTypes.JSONB,
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
  tableName: 'MirrorLearning',
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
      fields: ['confidence']
    },
    {
      fields: ['successRate']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['lastReinforcement']
    }
  ]
});

// Define associations
MirrorLearning.associate = (models) => {
  MirrorLearning.belongsTo(models.Character, {
    foreignKey: 'characterId',
    as: 'character'
  });
};

// Instance methods
MirrorLearning.prototype.reinforce = function(successRating, feedback = {}) {
  // Success rating should be 0.0 to 1.0
  const normalizedRating = Math.max(0.0, Math.min(1.0, successRating));
  
  // Update usage statistics
  this.usageCount += 1;
  this.lastUsage = new Date();
  
  // Update success statistics
  if (normalizedRating >= 0.5) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  
  // Calculate new success rate with exponential moving average
  const alpha = 0.3; // Learning rate
  this.successRate = (alpha * normalizedRating) + ((1 - alpha) * this.successRate);
  
  // Update confidence based on success rating and usage
  const confidenceAdjustment = (normalizedRating - 0.5) * 0.1;
  const usageBoost = Math.min(0.1, this.usageCount * 0.01);
  this.confidence = Math.max(0.1, Math.min(0.95, 
    this.confidence + confidenceAdjustment + usageBoost
  ));
  
  // Deactivate if confidence drops too low
  if (this.confidence < 0.2 && this.usageCount > 10) {
    this.isActive = false;
  }
  
  // Update last reinforcement
  this.lastReinforcement = new Date();
  
  // Store feedback if provided
  if (Object.keys(feedback).length > 0) {
    this.tags = [...this.tags, `feedback_${Date.now()}`];
  }
  
  return {
    successRating: normalizedRating,
    oldConfidence: this.confidence - confidenceAdjustment,
    newConfidence: this.confidence,
    successRate: this.successRate,
    isActive: this.isActive
  };
};

MirrorLearning.prototype.recordUsage = function(successful = true) {
  this.usageCount += 1;
  this.lastUsage = new Date();
  
  if (successful) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  
  // Update success rate
  const totalAttempts = this.successCount + this.failureCount;
  this.successRate = totalAttempts > 0 ? this.successCount / totalAttempts : 0;
  
  return this;
};

MirrorLearning.prototype.getSimilarity = function(input) {
  const patternWords = this.userTrigger.toLowerCase().split(/\s+/);
  const inputWords = input.toLowerCase().split(/\s+/);
  
  const patternSet = new Set(patternWords);
  const inputSet = new Set(inputWords);
  
  const intersection = new Set([...patternSet].filter(x => inputSet.has(x)));
  const union = new Set([...patternSet, ...inputSet]);
  
  return intersection.size / union.size;
};

MirrorLearning.prototype.getApplicabilityScore = function(input, emotionalContext = {}) {
  const textSimilarity = this.getSimilarity(input);
  
  // Calculate emotional similarity
  let emotionalSimilarity = 0.5;
  if (Object.keys(emotionalContext).length > 0) {
    const moodMatch = emotionalContext.mood === this.emotionalContext.mood ? 1.0 : 0.5;
    const happinessDiff = Math.abs(emotionalContext.happiness - this.emotionalContext.happiness);
    const trustDiff = Math.abs(emotionalContext.trust - this.emotionalContext.trust);
    const affectionDiff = Math.abs(emotionalContext.affection - this.emotionalContext.affection);
    
    emotionalSimilarity = (moodMatch + 
      (1 - happinessDiff) + 
      (1 - trustDiff) + 
      (1 - affectionDiff)) / 4;
  }
  
  // Weighted combination
  const applicabilityScore = (textSimilarity * 0.7) + (emotionalSimilarity * 0.3);
  
  // Boost by confidence
  return applicabilityScore * this.confidence;
};

MirrorLearning.prototype.deactivate = function(reason = 'low_confidence') {
  this.isActive = false;
  this.tags.push(`deactivated_${reason}_${Date.now()}`);
  return this;
};

MirrorLearning.prototype.activate = function() {
  this.isActive = true;
  this.tags = this.tags.filter(tag => !tag.startsWith('deactivated_'));
  return this;
};

// Class methods
MirrorLearning.findByCharacter = async function(characterId, options = {}) {
  const defaults = {
    where: { characterId: characterId },
    order: [['confidence', 'DESC'], ['successRate', 'DESC']]
  };
  
  return await this.findAll({ ...defaults, ...options });
};

MirrorLearning.findBestMatch = async function(characterId, input, emotionalContext = {}, limit = 5) {
  const patterns = await this.findByCharacter(characterId, {
    where: { isActive: true },
    limit: 100 // Get more patterns to filter later
  });
  
  // Score each pattern
  const scoredPatterns = patterns.map(pattern => ({
    pattern,
    score: pattern.getApplicabilityScore(input, emotionalContext)
  }));
  
  // Sort by score and return top matches
  scoredPatterns.sort((a, b) => b.score - a.score);
  
  return scoredPatterns
    .filter(item => item.score > 0.3) // Filter low matches
    .slice(0, limit)
    .map(item => ({
      ...item.pattern.toJSON(),
      applicabilityScore: item.score
    }));
};

MirrorLearning.getByCategory = async function(characterId, category, minConfidence = 0.5) {
  return await this.findAll({
    where: {
      characterId: characterId,
      category: category,
      confidence: { [require('sequelize').Op.gte]: minConfidence },
      isActive: true
    },
    order: [['successRate', 'DESC'], ['confidence', 'DESC']]
  });
};

MirrorLearning.getHighConfidencePatterns = async function(characterId, minConfidence = 0.8) {
  return await this.findAll({
    where: {
      characterId: characterId,
      confidence: { [require('sequelize').Op.gte]: minConfidence },
      isActive: true
    },
    order: [['confidence', 'DESC'], ['successRate', 'DESC']]
  });
};

MirrorLearning.getReinforcementNeeded = async function(characterId, usageThreshold = 5) {
  return await this.findAll({
    where: {
      characterId: characterId,
      isActive: true,
      usageCount: { [require('sequelize').Op.gte]: usageThreshold },
      successRate: { [require('sequelize').Op.between]: [0.3, 0.7] } // Needs reinforcement
    },
    order: [['usageCount', 'DESC'], ['successRate', 'ASC']]
  });
};

module.exports = MirrorLearning;