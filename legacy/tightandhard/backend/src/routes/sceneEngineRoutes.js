const express = require('express');
const router = express.Router();
const { Scene, Character, EmotionState } = require('../models');

// Get all available scenes
router.get('/', async (req, res) => {
  try {
    const scenes = await Scene.findAll();
    res.json(scenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current scene for character
router.get('/:characterId/current', async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { id: req.params.characterId },
      include: [{
        model: Scene,
        as: 'currentScene'
      }]
    });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character.currentScene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change scene
router.post('/:characterId/change-scene', async (req, res) => {
  try {
    const { sceneId } = req.body;
    
    const character = await Character.findOne({
      where: { id: req.params.characterId }
    });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    await character.update({ currentSceneId: sceneId });
    res.json({ message: 'Scene changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create custom scene
router.post('/custom', async (req, res) => {
  try {
    const scene = await Scene.create({
      ...req.body,
      environment: 'custom',
      isUnlocked: true
    });
    
    res.json(scene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update scene ambiance
router.put('/:sceneId/ambiance', async (req, res) => {
  try {
    const scene = await Scene.findOne({
      where: { id: req.params.sceneId }
    });
    
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }
    
    await scene.update({ ambiance: req.body.ambiance });
    res.json(scene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;