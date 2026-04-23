/**
 * Adult-Only API Routes
 * Private simulation endpoints for intimate companion interactions
 */

const express = require('express');
const router = express.Router();
const { AdultCompanion } = require('../services/adult_companion');
const { SubscriptionManager } = require('../services/subscription_manager');
const { IntimateSceneEngine } = require('../services/intimate_scene_engine');

// Initialize services
const subscriptionManager = new SubscriptionManager();
const activeCompanions = new Map();

// ===== COMPANION MANAGEMENT =====

// Initialize new companion
router.post('/companion/initialize', (req, res) => {
  try {
    const { ownerId, name, personality } = req.body;
    
    if (!ownerId) {
      return res.status(400).json({ error: 'OwnerId required' });
    }
    
    const companion = new AdultCompanion(ownerId, { name, personality });
    activeCompanions.set(ownerId, companion);
    
    // Initialize basic subscription
    subscriptionManager.subscribe(ownerId, 'basic');
    
    res.json({
      success: true,
      companion: companion.getCurrentState(),
      message: 'Companion initialized successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get companion state
router.get('/companion/:ownerId', (req, res) => {
  try {
    const { ownerId } = req.params;
    const companion = activeCompanions.get(ownerId);
    
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    res.json({
      success: true,
      state: companion.getCurrentState()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process owner request
router.post('/companion/:ownerId/request', (req, res) => {
  try {
    const { ownerId } = req.params;
    const { type, intensity, specificPreference } = req.body;
    
    const companion = activeCompanions.get(ownerId);
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    const response = companion.processRequest({
      type,
      intensity,
      specificPreference
    });
    
    // Learn from this interaction
    companion.learnFromInteraction({
      type,
      ownerPreference: specificPreference,
      outcome: response.canFulfill ? 1.0 : 0.5,
      intimacyLevel: intensity || 5
    });
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get companion suggestions
router.get('/companion/:ownerId/suggestions', (req, res) => {
  try {
    const { ownerId } = req.params;
    const companion = activeCompanions.get(ownerId);
    
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    const suggestion = companion.anticipateNeeds();
    
    res.json({
      success: true,
      suggestion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SUBSCRIPTION MANAGEMENT =====

// Get available scenes
router.get('/scenes', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }
    
    const availableScenes = subscriptionManager.getAvailableScenes(userId);
    
    res.json({
      success: true,
      scenes: availableScenes,
      count: availableScenes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all scene packs
router.get('/scenes/packs', (req, res) => {
  try {
    const packs = subscriptionManager.getAllMonthlyPacks();
    
    res.json({
      success: true,
      packs,
      count: packs.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to XPlus
router.post('/subscribe/xplus', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }
    
    const subscription = subscriptionManager.upgradeToXPlus(userId);
    
    res.json({
      success: true,
      subscription,
      message: 'Successfully upgraded to XPlus'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlock monthly pack
router.post('/scenes/unpack', (req, res) => {
  try {
    const { userId, month } = req.body;
    
    if (!userId || !month) {
      return res.status(400).json({ error: 'UserId and month required' });
    }
    
    const result = subscriptionManager.unlockMonthlyPack(userId, month);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== INTIMATE SCENES =====

// Start intimate scene
router.post('/scenes/start', (req, res) => {
  try {
    const { userId, sceneId } = req.body;
    
    if (!userId || !sceneId) {
      return res.status(400).json({ error: 'UserId and sceneId required' });
    }
    
    const companion = activeCompanions.get(userId);
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    const sceneEngine = new IntimateSceneEngine(companion);
    const result = sceneEngine.startScene(userId, sceneId);
    
    if (result.success) {
      res.json({
        success: true,
        ...result
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scene dialogue
router.post('/scenes/dialogue', (req, res) => {
  try {
    const { userId, userInput } = req.body;
    
    if (!userId || !userInput) {
      return res.status(400).json({ error: 'UserId and userInput required' });
    }
    
    const companion = activeCompanions.get(userId);
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    const sceneEngine = new IntimateSceneEngine(companion);
    const response = sceneEngine.generateSceneDialogue(userId, userInput);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End scene
router.post('/scenes/end', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }
    
    const companion = activeCompanions.get(userId);
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    const sceneEngine = new IntimateSceneEngine(companion);
    const result = sceneEngine.endScene(userId);
    
    res.json({
      success: true,
      sceneSummary: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== INTERACTION HISTORY =====

// Get interaction history
router.get('/companion/:ownerId/history', (req, res) => {
  try {
    const { ownerId } = req.params;
    const companion = activeCompanions.get(ownerId);
    
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    const history = companion.saveOwnerHistory();
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get learned preferences
router.get('/companion/:ownerId/preferences', (req, res) => {
  try {
    const { ownerId } = req.params;
    const companion = activeCompanions.get(ownerId);
    
    if (!companion) {
      return res.status(404).json({ error: 'Companion not found' });
    }
    
    const state = companion.getCurrentState();
    
    res.json({
      success: true,
      learnedPreferences: companion.learnedPreferences,
      ownerDesires: companion.ownerDesires,
      bondLevel: state.bondLevel
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;