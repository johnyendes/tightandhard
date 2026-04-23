const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BondingTier = sequelize.define('BondingTier', {
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
  currentTier: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  experiencePoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  tierName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Acquaintance'
  },
  unlockedFeatures: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: ['basic_conversation', 'daily_greeting']
  },
  milestones: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  nextTierRequirement: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalInteractions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successfulInteractions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  lastTierAdvance: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'BondingTiers',
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
      fields: ['currentTier']
    },
    {
      fields: ['experiencePoints']
    }
  ]
});

// Tier definitions
const TIER_DEFINITIONS = {
  1: { name: 'Acquaintance', xpRequired: 0, features: ['basic_conversation', 'daily_greeting'] },
  2: { name: 'Friend', xpRequired: 100, features: ['personal_questions', 'memory_sharing'] },
  3: { name: 'Close Friend', xpRequired: 250, features: ['emotional_support', 'outfit_suggestions'] },
  4: { name: 'Confidant', xpRequired: 500, features: ['deep_conversations', 'secrets_sharing'] },
  5: { name: 'Trusted Ally', xpRequired: 800, features: ['loyalty_tasks', 'protective_behavior'] },
  6: { name: 'Intimate Friend', xpRequired: 1200, features: ['physical_comfort', 'romantic_interest'] },
  7: { name: 'Deep Bond', xpRequired: 1800, features: ['emotional_vulnerability', 'exclusive_attention'] },
  8: { name: 'Soulmate', xpRequired: 2500, features: ['unconditional_support', 'life_planning'] },
  9: { name: 'Eternal Partner', xpRequired: 3500, features: ['shared_destiny', 'transcendent_connection'] },
  10: { name: 'Beyond Words', xpRequired: 5000, features: ['telepathic_understanding', 'spiritual_unity'] }
};

// Define associations
BondingTier.associate = (models) => {
  BondingTier.belongsTo(models.Character, {
    foreignKey: 'characterId',
    as: 'character'
  });
};

// Instance methods
BondingTier.prototype.addXP = function(xp, reason = 'Interaction') {
  const oldTier = this.currentTier;
  this.experiencePoints += xp;
  
  // Check for tier advancement
  let tierAdvanced = false;
  for (let tier = this.currentTier + 1; tier <= 10; tier++) {
    if (this.experiencePoints >= TIER_DEFINITIONS[tier].xpRequired) {
      this.currentTier = tier;
      this.tierName = TIER_DEFINITIONS[tier].name;
      this.lastTierAdvance = new Date();
      
      // Add new features
      const newFeatures = TIER_DEFINITIONS[tier].features.filter(
        feature => !this.unlockedFeatures.includes(feature)
      );
      this.unlockedFeatures.push(...newFeatures);
      
      // Add milestone
      this.milestones.push({
        tier: tier,
        name: TIER_DEFINITIONS[tier].name,
        unlockedAt: new Date().toISOString(),
        reason: reason
      });
      
      tierAdvanced = true;
    }
  }
  
  // Update next tier requirement
  if (this.currentTier < 10) {
    this.nextTierRequirement = TIER_DEFINITIONS[this.currentTier + 1].xpRequired;
  } else {
    this.nextTierRequirement = null;
  }
  
  return {
    xpAdded: xp,
    newXP: this.experiencePoints,
    oldTier: oldTier,
    newTier: this.currentTier,
    tierAdvanced: tierAdvanced,
    newFeatures: tierAdvanced ? TIER_DEFINITIONS[this.currentTier].features : []
  };
};

BondingTier.prototype.checkFeature = function(featureName) {
  return this.unlockedFeatures.includes(featureName);
};

BondingTier.prototype.getProgress = function() {
  if (this.currentTier >= 10) {
    return {
      currentTier: this.currentTier,
      tierName: this.tierName,
      xp: this.experiencePoints,
      nextTier: null,
      progressToNext: 1.0,
      xpNeeded: 0
    };
  }
  
  const currentTierXP = TIER_DEFINITIONS[this.currentTier].xpRequired;
  const nextTierXP = TIER_DEFINITIONS[this.currentTier + 1].xpRequired;
  const xpInCurrentTier = this.experiencePoints - currentTierXP;
  const xpRequiredForNext = nextTierXP - currentTierXP;
  const progress = xpInCurrentTier / xpRequiredForNext;
  
  return {
    currentTier: this.currentTier,
    tierName: this.tierName,
    xp: this.experiencePoints,
    nextTier: {
      tier: this.currentTier + 1,
      name: TIER_DEFINITIONS[this.currentTier + 1].name,
      xpRequired: nextTierXP,
      features: TIER_DEFINITIONS[this.currentTier + 1].features
    },
    progressToNext: Math.min(1.0, progress),
    xpNeeded: nextTierXP - this.experiencePoints
  };
};

BondingTier.prototype.recordInteraction = function(successful = true) {
  this.totalInteractions += 1;
  if (successful) {
    this.successfulInteractions += 1;
  }
  return this.getSuccessRate();
};

BondingTier.prototype.getSuccessRate = function() {
  if (this.totalInteractions === 0) return 0;
  return this.successfulInteractions / this.totalInteractions;
};

module.exports = { BondingTier, TIER_DEFINITIONS };