const express = require('express');
const router = express.Router();
const { VoicePreset, Character, EmotionState } = require('../models');

// Get all voice presets
router.get('/', async (req, res) => {
  try {
    const presets = await VoicePreset.findAll();
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get character's current voice preset
router.get('/:characterId/current', async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { id: req.params.characterId },
      include: [{
        model: VoicePreset,
        as: 'voicePreset'
      }]
    });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character.voicePreset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create custom voice preset
router.post('/custom', async (req, res) => {
  try {
    const preset = await VoicePreset.create({
      ...req.body,
      isDefault: false
    });
    
    res.json(preset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update voice preset
router.put('/:presetId', async (req, res) => {
  try {
    const preset = await VoicePreset.findOne({
      where: { id: req.params.presetId }
    });
    
    if (!preset) {
      return res.status(404).json({ error: 'Voice preset not found' });
    }
    
    await preset.update(req.body);
    res.json(preset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set voice preset for character
router.post('/:characterId/set-preset', async (req, res) => {
  try {
    const { presetId } = req.body;
    
    const character = await Character.findOne({
      where: { id: req.params.characterId }
    });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    await character.update({ voicePresetId: presetId });
    res.json({ message: 'Voice preset updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate voice parameters based on emotion state
router.post('/:characterId/generate-voice', async (req, res) => {
  try {
    const { emotionState, text } = req.body;
    
    const character = await Character.findOne({
      where: { id: req.params.characterId },
      include: [{
        model: VoicePreset,
        as: 'voicePreset'
      }]
    });
    
    if (!character || !character.voicePreset) {
      return res.status(404).json({ error: 'Character or voice preset not found' });
    }
    
    const basePreset = character.voicePreset;
    
    // Adjust voice parameters based on emotion state
    const adjustedVoice = {
      pitch: adjustPitch(basePreset.pitch, emotionState),
      speed: adjustSpeed(basePreset.speed, emotionState),
      tone: adjustTone(basePreset.tone, emotionState),
      breathiness: adjustBreathiness(basePreset.breathiness, emotionState),
      accent: basePreset.accent
    };
    
    res.json({
      voiceParameters: adjustedVoice,
      emotionState,
      basePresetId: basePreset.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function adjustPitch(basePitch, emotionState) {
  let adjustment = 0;
  if (emotionState.mood === 'excited') adjustment += 0.1;
  if (emotionState.mood === 'shy') adjustment -= 0.05;
  if (emotionState.mood === 'confident') adjustment -= 0.02;
  if (emotionState.happiness > 0.7) adjustment += 0.05;
  
  return Math.max(0.5, Math.min(2.0, basePitch + adjustment));
}

function adjustSpeed(baseSpeed, emotionState) {
  let adjustment = 0;
  if (emotionState.mood === 'excited') adjustment += 0.2;
  if (emotionState.mood === 'shy') adjustment -= 0.1;
  if (emotionState.energy > 0.7) adjustment += 0.1;
  
  return Math.max(0.5, Math.min(2.0, baseSpeed + adjustment));
}

function adjustTone(baseTone, emotionState) {
  // Map emotion states to tones
  const toneMap = {
    'cheerful': 'warm',
    'confident': 'confident',
    'shy': 'gentle',
    'excited': 'playful',
    'melancholic': 'gentle',
    'content': 'warm',
    'neutral': 'warm'
  };
  
  // Return emotion-specific tone if different from base, otherwise keep base
  return toneMap[emotionState.mood] || baseTone;
}

function adjustBreathiness(baseBreathiness, emotionState) {
  let adjustment = 0;
  if (emotionState.mood === 'shy') adjustment += 0.1;
  if (emotionState.mood === 'confident') adjustment -= 0.05;
  if (emotionState.affection > 0.7) adjustment += 0.05;
  
  return Math.max(0, Math.min(1, baseBreathiness + adjustment));
}

module.exports = router;