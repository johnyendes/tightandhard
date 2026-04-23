const express = require('express');
const router = express.Router();
const { MirrorLearning, Character, EmotionState } = require('../models');

// Get all learned patterns for a character
router.get('/:characterId', async (req, res) => {
  try {
    const patterns = await MirrorLearning.findAll({
      where: { characterId: req.params.characterId },
      order: [['confidence', 'DESC']]
    });
    
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record new learning pattern
router.post('/:characterId/learn', async (req, res) => {
  try {
    const { behaviorPattern, userTrigger, adaptedResponse } = req.body;
    
    // Check if pattern already exists
    let pattern = await MirrorLearning.findOne({
      where: { 
        characterId: req.params.characterId,
        userTrigger,
        behaviorPattern
      }
    });
    
    if (pattern) {
      // Update existing pattern
      await pattern.update({
        adaptedResponse,
        usageCount: pattern.usageCount + 1,
        lastReinforcement: new Date()
      });
    } else {
      // Create new pattern
      pattern = await MirrorLearning.create({
        characterId: req.params.characterId,
        behaviorPattern,
        userTrigger,
        adaptedResponse,
        confidence: 0.5,
        usageCount: 1
      });
    }
    
    res.json(pattern);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reinforce successful pattern
router.post('/:characterId/:patternId/reinforce', async (req, res) => {
  try {
    const { successRating } = req.body;
    
    const pattern = await MirrorLearning.findOne({
      where: { 
        id: req.params.patternId,
        characterId: req.params.characterId 
      }
    });
    
    if (!pattern) {
      return res.status(404).json({ error: 'Pattern not found' });
    }
    
    // Update confidence based on success rating
    const newConfidence = pattern.confidence * 0.7 + (successRating / 5) * 0.3;
    const newSuccessRate = pattern.successRate * 0.8 + (successRating / 5) * 0.2;
    
    await pattern.update({
      confidence: newConfidence,
      successRate: newSuccessRate,
      usageCount: pattern.usageCount + 1,
      lastReinforcement: new Date()
    });
    
    res.json(pattern);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get adaptive response for user input
router.post('/:characterId/adapt', async (req, res) => {
  try {
    const { userTrigger, emotionState } = req.body;
    
    // Find matching patterns with high confidence
    const patterns = await MirrorLearning.findAll({
      where: { 
        characterId: req.params.characterId,
        isActive: true,
        confidence: { [require('sequelize').Op.gte]: 0.6 }
      },
      order: [['confidence', 'DESC'], ['usageCount', 'DESC']],
      limit: 3
    });
    
    // Find best matching pattern
    let bestMatch = null;
    let highestScore = 0;
    
    for (const pattern of patterns) {
      const similarityScore = calculateSimilarity(userTrigger, pattern.userTrigger);
      if (similarityScore > highestScore) {
        highestScore = similarityScore;
        bestMatch = pattern;
      }
    }
    
    if (bestMatch && highestScore > 0.5) {
      res.json({
        response: bestMatch.adaptedResponse,
        confidence: bestMatch.confidence,
        patternId: bestMatch.id
      });
    } else {
      res.json({
        response: null,
        confidence: 0,
        patternId: null
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple similarity calculation function
function calculateSimilarity(str1, str2) {
  const words1 = str1.toLowerCase().split(' ');
  const words2 = str2.toLowerCase().split(' ');
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

module.exports = router;