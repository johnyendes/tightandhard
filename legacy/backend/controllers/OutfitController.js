const { Outfit, Character } = require('../models');
const { Op } = require('sequelize');

class OutfitController {
  // Get all outfits for character
  static async getOutfits(req, res) {
    try {
      const { characterId } = req.params;
      const { category, isUnlocked } = req.query;

      const where = {};
      if (category) {
        where.category = category;
      }
      if (isUnlocked !== undefined) {
        where.isUnlocked = isUnlocked === 'true';
      }

      const outfits = await Outfit.findAll({
        where,
        order: [
          ['isCurrentOutfit', 'DESC'],
          ['isUnlocked', 'DESC'],
          ['name', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: outfits,
        count: outfits.length
      });
    } catch (error) {
      console.error('Error fetching outfits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch outfits'
      });
    }
  }

  // Create outfit
  static async createOutfit(req, res) {
    try {
      const {
        name,
        category,
        description,
        colors,
        moodEffects,
        unlockTokens,
        unlockBond
      } = req.body;

      const outfit = await Outfit.create({
        name,
        category: category || 'casual',
        description,
        colors: colors || [],
        moodEffects: moodEffects || {},
        unlockTokens: unlockTokens || 0,
        unlockBond: unlockBond || 0,
        isUnlocked: unlockTokens === 0 && unlockBond === 0
      });

      res.status(201).json({
        success: true,
        data: outfit,
        message: 'Outfit created successfully'
      });
    } catch (error) {
      console.error('Error creating outfit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create outfit'
      });
    }
  }

  // Get specific outfit
  static async getOutfit(req, res) {
    try {
      const { characterId, outfitId } = req.params;

      const outfit = await Outfit.findOne({
        where: { id: outfitId }
      });

      if (!outfit) {
        return res.status(404).json({
          success: false,
          error: 'Outfit not found'
        });
      }

      res.json({
        success: true,
        data: outfit
      });
    } catch (error) {
      console.error('Error fetching outfit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch outfit'
      });
    }
  }

  // Update outfit
  static async updateOutfit(req, res) {
    try {
      const { characterId, outfitId } = req.params;
      const updates = req.body;

      const outfit = await Outfit.findByPk(outfitId);

      if (!outfit) {
        return res.status(404).json({
          success: false,
          error: 'Outfit not found'
        });
      }

      await outfit.update(updates);

      res.json({
        success: true,
        data: outfit,
        message: 'Outfit updated successfully'
      });
    } catch (error) {
      console.error('Error updating outfit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update outfit'
      });
    }
  }

  // Delete outfit
  static async deleteOutfit(req, res) {
    try {
      const { characterId, outfitId } = req.params;

      const outfit = await Outfit.findByPk(outfitId);

      if (!outfit) {
        return res.status(404).json({
          success: false,
          error: 'Outfit not found'
        });
      }

      await outfit.destroy();

      res.json({
        success: true,
        message: 'Outfit deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting outfit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete outfit'
      });
    }
  }

  // Activate outfit for character
  static async activateOutfit(req, res) {
    try {
      const { characterId, outfitId } = req.body;

      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      const outfit = await Outfit.findByPk(outfitId);
      if (!outfit || !outfit.isUnlocked) {
        return res.status(404).json({
          success: false,
          error: 'Outfit not found or not unlocked'
        });
      }

      // Deactivate current outfit
      if (character.currentOutfitId) {
        await Outfit.update(
          { isCurrentOutfit: false },
          { where: { id: character.currentOutfitId } }
        );
      }

      // Activate new outfit
      await outfit.update({ isCurrentOutfit: true });
      await character.update({ currentOutfitId: outfitId });

      res.json({
        success: true,
        data: {
          characterId,
          outfitId,
          outfit
        },
        message: 'Outfit activated successfully'
      });
    } catch (error) {
      console.error('Error activating outfit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to activate outfit'
      });
    }
  }

  // Unlock outfit
  static async unlockOutfit(req, res) {
    try {
      const { characterId, outfitId } = req.body;

      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      const outfit = await Outfit.findByPk(outfitId);
      if (!outfit) {
        return res.status(404).json({
          success: false,
          error: 'Outfit not found'
        });
      }

      if (outfit.isUnlocked) {
        return res.status(400).json({
          success: false,
          error: 'Outfit is already unlocked'
        });
      }

      // Check if character meets requirements
      // (In a real implementation, you'd check tokens and bond level here)

      await outfit.update({ isUnlocked: true });

      res.json({
        success: true,
        data: outfit,
        message: 'Outfit unlocked successfully'
      });
    } catch (error) {
      console.error('Error unlocking outfit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unlock outfit'
      });
    }
  }

  // Get outfit recommendations
  static async getOutfitRecommendations(req, res) {
    try {
      const { characterId } = req.params;
      const { mood, weather, occasion } = req.query;

      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      // Get unlocked outfits
      const outfits = await Outfit.findAll({
        where: { isUnlocked: true }
      });

      // Score each outfit based on context
      const scoredOutfits = outfits.map(outfit => {
        let score = 0;

        // Mood matching
        if (mood && outfit.moodEffects?.mood === mood) {
          score += 30;
        }

        // Weather matching
        if (weather && outfit.moodEffects?.weather === weather) {
          score += 20;
        }

        // Occasion matching
        if (occasion && outfit.moodEffects?.occasion === occasion) {
          score += 25;
        }

        // Variety bonus (encourage trying different outfits)
        if (!outfit.isCurrentOutfit) {
          score += 10;
        }

        // Favorite bonus
        if (outfit.isFavorite) {
          score += 15;
        }

        return { ...outfit.toJSON(), recommendationScore: score };
      });

      // Sort by score and return top 4
      scoredOutfits.sort((a, b) => b.recommendationScore - a.recommendationScore);

      res.json({
        success: true,
        data: scoredOutfits.slice(0, 4)
      });
    } catch (error) {
      console.error('Error getting outfit recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get outfit recommendations'
      });
    }
  }

  // Toggle outfit favorite
  static async toggleFavorite(req, res) {
    try {
      const { characterId, outfitId } = req.params;

      const outfit = await Outfit.findByPk(outfitId);
      if (!outfit) {
        return res.status(404).json({
          success: false,
          error: 'Outfit not found'
        });
      }

      await outfit.update({ isFavorite: !outfit.isFavorite });

      res.json({
        success: true,
        data: outfit,
        message: `Outfit ${outfit.isFavorite ? 'unfavorited' : 'favorited'} successfully`
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle favorite'
      });
    }
  }
}

module.exports = OutfitController;