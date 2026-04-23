const express = require('express');
const router = express.Router();
const { EmotionState, Character } = require('../models');
const { body, param } = require('express-validator');

// Get current emotion state for a character
router.get('/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    
    const emotionState = await EmotionState.findOne({
      where: { characterId },
      include: [{ 
        model: Character, 
        as: 'character',
        attributes: ['id', 'name', 'personality'] 
      }]
    });
    
    if (!emotionState) {
      // Create default emotion state if doesn't exist
      const newEmotionState = await EmotionState.create({
        characterId,
        happiness: 50,
        trust: 50,
        affection: 50,
        mood: 'neutral',
        dominantEmotion: 'neutral'
      });
      return res.json(newEmotionState);
    }
    
    res.json(emotionState);
  } catch (error) {
    console.error('Error getting emotion state:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update emotion state
router.put('/:characterId', [
  param('characterId').isUUID().withMessage('Valid character ID required'),
  body('happiness').optional().isInt({ min: 0, max: 100 }),
  body('trust').optional().isInt({ min: 0, max: 100 }),
  body('affection').optional().isInt({ min: 0, max: 100 }),
  body('mood').optional().isIn(['happy', 'sad', 'angry', 'fearful', 'neutral', 'excited', 'calm', 'anxious']),
  body('dominantEmotion').optional().isIn(['happy', 'sad', 'angry', 'fearful', 'neutral', 'excited', 'calm', 'anxious', 'love', 'hate', 'trust', 'jealousy'])
], async (req, res) => {
  try {
    const { characterId } = req.params;
    const updates = req.body;
    
    let emotionState = await EmotionState.findOne({
      where: { characterId }
    });
    
    if (!emotionState) {
      emotionState = await EmotionState.create({
        characterId,
        ...updates
      });
    } else {
      await emotionState.update(updates);
      // Recalculate mood and dominant emotion
      await emotionState.calculateMood();
    }
    
    res.json(emotionState);
  } catch (error) {
    console.error('Error updating emotion state:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply emotion modifier (adjust emotions based on events)
router.post('/:characterId/modify', [
  param('characterId').isUUID().withMessage('Valid character ID required'),
  body('modifiers').isObject().withMessage('Modifiers object required'),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const { characterId } = req.params;
    const { modifiers, reason } = req.body;
    
    let emotionState = await EmotionState.findOne({
      where: { characterId }
    });
    
    if (!emotionState) {
      return res.status(404).json({ error: 'Emotion state not found' });
    }
    
    // Apply modifiers
    if (modifiers.happiness) {
      emotionState.happiness = Math.max(0, Math.min(100, emotionState.happiness + modifiers.happiness));
    }
    if (modifiers.trust) {
      emotionState.trust = Math.max(0, Math.min(100, emotionState.trust + modifiers.trust));
    }
    if (modifiers.affection) {
      emotionState.affection = Math.max(0, Math.min(100, emotionState.affection + modifiers.affection));
    }
    
    // Recalculate mood
    await emotionState.calculateMood();
    
    // Add to history if reason provided
    if (reason) {
      const historyEntry = emotionState.history || [];
      historyEntry.unshift({
        timestamp: new Date(),
        reason,
        previousState: {
          happiness: emotionState.happiness,
          trust: emotionState.trust,
          affection: emotionState.affection
        },
        modifiers
      });
      
      // Keep only last 50 history entries
      if (historyEntry.length > 50) {
        historyEntry.pop();
      }
      
      await emotionState.update({ history: historyEntry });
    }
    
    res.json({
      emotionState,
      message: 'Emotions modified successfully'
    });
  } catch (error) {
    console.error('Error modifying emotions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get emotion history
router.get('/:characterId/history', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { limit = 20 } = req.query;
    
    const emotionState = await EmotionState.findOne({
      where: { characterId }
    });
    
    if (!emotionState) {
      return res.status(404).json({ error: 'Emotion state not found' });
    }
    
    const history = (emotionState.history || []).slice(0, parseInt(limit));
    
    res.json({
      history,
      total: emotionState.history?.length || 0
    });
  } catch (error) {
    console.error('Error getting emotion history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset emotions to baseline
router.post('/:characterId/reset', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { baseline = 50 } = req.body;
    
    const emotionState = await EmotionState.findOne({
      where: { characterId }
    });
    
    if (!emotionState) {
      return res.status(404).json({ error: 'Emotion state not found' });
    }
    
    await emotionState.update({
      happiness: baseline,
      trust: baseline,
      affection: baseline,
      mood: 'neutral',
      dominantEmotion: 'neutral'
    });
    
    res.json({
      emotionState,
      message: 'Emotions reset to baseline'
    });
  } catch (error) {
    console.error('Error resetting emotions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get emotion statistics
router.get('/:characterId/stats', async (req, res) => {
  try {
    const { characterId } = req.params;
    
    const emotionState = await EmotionState.findOne({
      where: { characterId }
    });
    
    if (!emotionState) {
      return res.status(404).json({ error: 'Emotion state not found' });
    }
    
    const history = emotionState.history || [];
    
    // Calculate averages
    let avgHappiness = 0, avgTrust = 0, avgAffection = 0;
    let moodCounts = {};
    
    history.forEach(entry => {
      if (entry.previousState) {
        avgHappiness += entry.previousState.happiness;
        avgTrust += entry.previousState.trust;
        avgAffection += entry.previousState.affection;
      }
    });
    
    if (history.length > 0) {
      avgHappiness /= history.length;
      avgTrust /= history.length;
      avgAffection /= history.length;
    }
    
    // Count mood occurrences
    history.forEach(entry => {
      // We'd need to track mood changes in history for accurate counting
    });
    
    res.json({
      current: {
        happiness: emotionState.happiness,
        trust: emotionState.trust,
        affection: emotionState.affection,
        mood: emotionState.mood,
        dominantEmotion: emotionState.dominantEmotion
      },
      averages: {
        happiness: Math.round(avgHappiness),
        trust: Math.round(avgTrust),
        affection: Math.round(avgAffection)
      },
      historyCount: history.length
    });
  } catch (error) {
    console.error('Error getting emotion statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;