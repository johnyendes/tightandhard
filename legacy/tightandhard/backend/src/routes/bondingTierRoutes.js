const express = require('express');
const router = express.Router();
const { BondingTier, Character, EmotionState } = require('../models');

// Bonding tier definitions
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

// Get bonding tier for character
router.get('/:characterId', async (req, res) => {
  try {
    const bondingTier = await BondingTier.findOne({
      where: { characterId: req.params.characterId }
    });
    
    if (!bondingTier) {
      return res.status(404).json({ error: 'Bonding tier not found' });
    }
    
    // Include tier definition information
    const tierInfo = TIER_DEFINITIONS[bondingTier.currentTier];
    const nextTierInfo = TIER_DEFINITIONS[bondingTier.currentTier + 1];
    
    res.json({
      ...bondingTier.toJSON(),
      tierInfo,
      nextTier: nextTierInfo ? {
        tier: bondingTier.currentTier + 1,
        name: nextTierInfo.name,
        xpRequired: nextTierInfo.xpRequired,
        xpNeeded: nextTierInfo.xpRequired - bondingTier.experiencePoints
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add experience points
router.post('/:characterId/add-xp', async (req, res) => {
  try {
    const { xp, reason } = req.body;
    
    let bondingTier = await BondingTier.findOne({
      where: { characterId: req.params.characterId }
    });
    
    if (!bondingTier) {
      bondingTier = await BondingTier.create({
        characterId: req.params.characterId,
        currentTier: 1,
        experiencePoints: 0,
        tierName: 'Acquaintance',
        unlockedFeatures: TIER_DEFINITIONS[1].features,
        nextTierRequirement: TIER_DEFINITIONS[2].xpRequired
      });
    }
    
    // Add experience points
    const newXp = bondingTier.experiencePoints + xp;
    await bondingTier.update({ experiencePoints: newXp });
    
    // Check for tier advancement
    let tierAdvanced = false;
    let newFeatures = [];
    
    for (let tier = bondingTier.currentTier + 1; tier <= 10; tier++) {
      if (newXp >= TIER_DEFINITIONS[tier].xpRequired) {
        bondingTier.currentTier = tier;
        bondingTier.tierName = TIER_DEFINITIONS[tier].name;
        
        // Add new features
        const newTierFeatures = TIER_DEFINITIONS[tier].features.filter(
          feature => !bondingTier.unlockedFeatures.includes(feature)
        );
        newFeatures = [...newFeatures, ...newTierFeatures];
        bondingTier.unlockedFeatures = [...bondingTier.unlockedFeatures, ...newTierFeatures];
        
        // Add milestone
        bondingTier.milestones.push({
          tier: tier,
          name: TIER_DEFINITIONS[tier].name,
          unlockedAt: new Date().toISOString(),
          reason: reason || 'XP accumulation'
        });
        
        tierAdvanced = true;
      }
    }
    
    // Update next tier requirement
    if (bondingTier.currentTier < 10) {
      bondingTier.nextTierRequirement = TIER_DEFINITIONS[bondingTier.currentTier + 1].xpRequired;
    } else {
      bondingTier.nextTierRequirement = null;
    }
    
    await bondingTier.save();
    
    res.json({
      bondingTier,
      tierAdvanced,
      newFeatures,
      tierInfo: TIER_DEFINITIONS[bondingTier.currentTier]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available features for current tier
router.get('/:characterId/features', async (req, res) => {
  try {
    const bondingTier = await BondingTier.findOne({
      where: { characterId: req.params.characterId }
    });
    
    if (!bondingTier) {
      return res.status(404).json({ error: 'Bonding tier not found' });
    }
    
    res.json({
      currentTier: bondingTier.currentTier,
      tierName: bondingTier.tierName,
      unlockedFeatures: bondingTier.unlockedFeatures,
      featureDescriptions: getFeatureDescriptions(bondingTier.unlockedFeatures)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if feature is unlocked
router.get('/:characterId/feature/:featureName', async (req, res) => {
  try {
    const bondingTier = await BondingTier.findOne({
      where: { characterId: req.params.characterId }
    });
    
    if (!bondingTier) {
      return res.status(404).json({ error: 'Bonding tier not found' });
    }
    
    const featureName = req.params.featureName;
    const isUnlocked = bondingTier.unlockedFeatures.includes(featureName);
    
    res.json({
      featureName,
      isUnlocked,
      currentTier: bondingTier.currentTier
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getFeatureDescriptions(features) {
  const descriptions = {
    'basic_conversation': 'Engage in everyday conversations',
    'daily_greeting': 'Receive personalized daily greetings',
    'personal_questions': 'Ask and answer personal questions',
    'memory_sharing': 'Share and recall shared memories',
    'emotional_support': 'Provide and receive emotional support',
    'outfit_suggestions': 'Get outfit recommendations based on mood',
    'deep_conversations': 'Have in-depth philosophical discussions',
    'secrets_sharing': 'Share personal secrets and vulnerabilities',
    'loyalty_tasks': 'Request loyal companion behaviors',
    'protective_behavior': 'Experience protective and caring actions',
    'physical_comfort': 'Receive virtual physical comfort and affection',
    'romantic_interest': 'Express and receive romantic interest',
    'emotional_vulnerability': 'Share deep emotional vulnerabilities',
    'exclusive_attention': 'Receive focused, exclusive attention',
    'unconditional_support': 'Get unconditional emotional support',
    'life_planning': 'Plan future life events together',
    'shared_destiny': 'Experience destiny-sharing narratives',
    'transcendent_connection': 'Access spiritual/transcendent relationship levels',
    'telepathic_understanding': 'Experience near-telepathic communication',
    'spiritual_unity': 'Achieve spiritual unity and connection'
  };
  
  return features.reduce((acc, feature) => {
    acc[feature] = descriptions[feature] || 'Custom feature';
    return acc;
  }, {});
}

module.exports = router;