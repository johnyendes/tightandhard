const express = require('express');
const router = express.Router();
const { Outfit, Character } = require('../models');

// Get all outfits for a character
router.get('/:characterId', async (req, res) => {
  try {
    const outfits = await Outfit.findAll({
      where: { characterId: req.params.characterId }
    });
    
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new outfit
router.post('/:characterId', async (req, res) => {
  try {
    const outfit = await Outfit.create({
      ...req.body,
      characterId: req.params.characterId
    });
    
    res.json(outfit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update outfit
router.put('/:characterId/:outfitId', async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      where: { 
        id: req.params.outfitId,
        characterId: req.params.characterId 
      }
    });
    
    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    await outfit.update(req.body);
    res.json(outfit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete outfit
router.delete('/:characterId/:outfitId', async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      where: { 
        id: req.params.outfitId,
        characterId: req.params.characterId 
      }
    });
    
    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    await outfit.destroy();
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set active outfit
router.post('/:characterId/:outfitId/activate', async (req, res) => {
  try {
    const characterId = req.params.characterId;
    const outfitId = req.params.outfitId;
    
    // Deactivate all outfits for this character
    await Outfit.update(
      { isActive: false },
      { where: { characterId } }
    );
    
    // Activate the selected outfit
    const outfit = await Outfit.findOne({
      where: { id: outfitId, characterId }
    });
    
    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    await outfit.update({ isActive: true });
    res.json(outfit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;