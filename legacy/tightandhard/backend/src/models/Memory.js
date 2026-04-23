const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Memory = sequelize.define('Memory', {
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
  type: {
    type: DataTypes.ENUM(
      'conversation',
      'event',
      'preference',
      'milestone',
      'emotional',
      'learning',
      'shared_experience',
      'conflict',
      'resolution',
      'dream'
    ),
    allowNull: false,
    defaultValue: 'conversation'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  emotionalWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  importance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 10
    }
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  linkedMemories: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  context: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  accessCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAccessed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isCore: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isArchived: {
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
  }
}, {
  tableName: 'Memories',
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
      fields: ['type']
    },
    {
      fields: ['importance']
    },
    {
      fields: ['isCore']
    },
    {
      fields: ['lastAccessed']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Define associations
Memory.associate = (models) => {
  Memory.belongsTo(models.Character, {
    foreignKey: 'characterId',
    as: 'character'
  });
  
  // Self-referential association for linked memories
  Memory.hasMany(models.Memory, {
    as: 'linkedMemoryObjects',
    foreignKey: 'linkedMemories',
    through: 'MemoryLinks'
  });
};

// Instance methods
Memory.prototype.access = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  
  // Gradually increase emotional weight based on access
  if (this.emotionalWeight < 0.9) {
    this.emotionalWeight = Math.min(0.9, this.emotionalWeight + 0.01);
  }
  
  return this;
};

Memory.prototype.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this;
};

Memory.prototype.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this;
};

Memory.prototype.linkMemory = function(memoryId) {
  if (!this.linkedMemories.includes(memoryId)) {
    this.linkedMemories.push(memoryId);
  }
  return this;
};

Memory.prototype.unlinkMemory = function(memoryId) {
  this.linkedMemories = this.linkedMemories.filter(id => id !== memoryId);
  return this;
};

Memory.prototype.setCore = function(isCore = true) {
  this.isCore = isCore;
  if (isCore && this.importance < 8) {
    this.importance = 8;
  }
  return this;
};

Memory.prototype.archive = function(archived = true) {
  this.isArchived = archived;
  return this;
};

Memory.prototype.getRelevanceScore = function() {
  let score = this.importance * 10;
  
  // Boost based on emotional weight
  score += this.emotionalWeight * 5;
  
  // Boost based on access frequency
  score += Math.min(this.accessCount * 2, 20);
  
  // Boost for core memories
  if (this.isCore) {
    score += 30;
  }
  
  // Decay based on age
  const ageInDays = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.max(0.1, 1 - (ageInDays * 0.01));
  score *= decayFactor;
  
  return Math.min(100, Math.round(score));
};

Memory.prototype.getSummary = function() {
  return {
    id: this.id,
    type: this.type,
    content: this.content.substring(0, 200) + (this.content.length > 200 ? '...' : ''),
    emotionalWeight: this.emotionalWeight,
    importance: this.importance,
    tags: this.tags,
    isCore: this.isCore,
    accessCount: this.accessCount,
    relevanceScore: this.getRelevanceScore(),
    createdAt: this.createdAt,
    lastAccessed: this.lastAccessed
  };
};

// Class methods
Memory.getCoreMemories = async function(characterId) {
  return await this.findAll({
    where: {
      characterId: characterId,
      isCore: true,
      isArchived: false
    },
    order: [['importance', 'DESC']]
  });
};

Memory.getMemoriesByType = async function(characterId, type, limit = 50) {
  return await this.findAll({
    where: {
      characterId: characterId,
      type: type,
      isArchived: false
    },
    order: [['importance', 'DESC']],
    limit: limit
  });
};

Memory.searchMemories = async function(characterId, query) {
  return await this.findAll({
    where: {
      characterId: characterId,
      isArchived: false,
      [require('sequelize').Op.or]: [
        { content: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { tags: { [require('sequelize').Op.contains]: [query] } }
      ]
    },
    order: [['importance', 'DESC'], ['accessCount', 'DESC']]
  });
};

Memory.getImportantMemories = async function(characterId, minImportance = 7) {
  return await this.findAll({
    where: {
      characterId: characterId,
      importance: { [require('sequelize').Op.gte]: minImportance },
      isArchived: false
    },
    order: [['importance', 'DESC'], ['lastAccessed', 'DESC']]
  });
};

Memory.getRecentMemories = async function(characterId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return await this.findAll({
    where: {
      characterId: characterId,
      createdAt: { [require('sequelize').Op.gte]: cutoffDate },
      isArchived: false
    },
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Memory;