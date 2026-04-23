const { Scene, Character } = require('../models');
const { Op } = require('sequelize');

class SceneController {
  // Get all scenes
  static async getScenes(req, res) {
    try {
      const { environment, isUnlocked, limit = 50 } = req.query;

      const where = {};
      if (environment) {
        where.environment = environment;
      }
      if (isUnlocked !== undefined) {
        where.isUnlocked = isUnlocked === 'true';
      }

      const scenes = await Scene.findAll({
        where,
        order: [
          ['isUnlocked', 'DESC'],
          ['isFavorite', 'DESC'],
          ['timesUsed', 'DESC'],
          ['name', 'ASC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: scenes,
        count: scenes.length
      });
    } catch (error) {
      console.error('Error fetching scenes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch scenes'
      });
    }
  }

  // Create scene
  static async createScene(req, res) {
    try {
      const {
        name,
        description,
        environment,
        timeOfDay,
        weather,
        season,
        lighting,
        ambiance,
        soundscape,
        interactiveElements
      } = req.body;

      const scene = await Scene.create({
        name,
        description: description || '',
        environment: environment || 'custom',
        timeOfDay: timeOfDay || 'evening',
        weather: weather || 'clear',
        season: season || 'summer',
        lighting: lighting || 'natural',
        ambiance: ambiance || {},
        soundscape: soundscape || [],
        interactiveElements: interactiveElements || [],
        isUnlocked: true,
        isPublic: false
      });

      res.status(201).json({
        success: true,
        data: scene,
        message: 'Scene created successfully'
      });
    } catch (error) {
      console.error('Error creating scene:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create scene'
      });
    }
  }

  // Get specific scene
  static async getScene(req, res) {
    try {
      const { sceneId } = req.params;

      const scene = await Scene.findByPk(sceneId);

      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      res.json({
        success: true,
        data: scene
      });
    } catch (error) {
      console.error('Error fetching scene:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch scene'
      });
    }
  }

  // Update scene
  static async updateScene(req, res) {
    try {
      const { sceneId } = req.params;
      const updates = req.body;

      const scene = await Scene.findByPk(sceneId);

      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      await scene.update(updates);

      res.json({
        success: true,
        data: scene,
        message: 'Scene updated successfully'
      });
    } catch (error) {
      console.error('Error updating scene:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update scene'
      });
    }
  }

  // Delete scene
  static async deleteScene(req, res) {
    try {
      const { sceneId } = req.params;

      const scene = await Scene.findByPk(sceneId);

      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      await scene.destroy();

      res.json({
        success: true,
        message: 'Scene deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting scene:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete scene'
      });
    }
  }

  // Activate scene for character
  static async activateScene(req, res) {
    try {
      const { sceneId } = req.params;
      const { characterId } = req.body;

      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      const scene = await Scene.findByPk(sceneId);
      if (!scene || !scene.isUnlocked) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found or not unlocked'
        });
      }

      // Update character's current scene
      await character.update({ currentSceneId: sceneId });

      // Update scene usage statistics
      await scene.update({
        timesUsed: scene.timesUsed + 1,
        lastUsed: new Date()
      });

      res.json({
        success: true,
        data: {
          characterId,
          sceneId,
          scene
        },
        message: 'Scene activated successfully'
      });
    } catch (error) {
      console.error('Error activating scene:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to activate scene'
      });
    }
  }

  // Get scene suggestions
  static async getSceneSuggestions(req, res) {
    try {
      const { characterId } = req.params;
      const { context, mood, timeOfDay, weather, limit = 3 } = req.query;

      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      // Get available scenes
      const scenes = await Scene.findAll({
        where: { isUnlocked: true }
      });

      // Score each scene based on context
      const scoredScenes = scenes.map(scene => {
        let score = 0;

        // Context matching
        if (context === 'romantic' && scene.environment === 'bedroom') score += 30;
        if (context === 'social' && ['cafe', 'restaurant', 'living_room'].includes(scene.environment)) score += 25;
        if (context === 'peaceful' && ['garden', 'beach', 'library'].includes(scene.environment)) score += 25;
        if (context === 'active' && ['gym', 'park'].includes(scene.environment)) score += 25;

        // Time matching
        if (timeOfDay && scene.timeOfDay === timeOfDay) score += 15;

        // Weather matching
        if (weather && scene.weather === weather) score += 10;

        // User preferences
        if (scene.isFavorite) score += 20;
        if (scene.userRating) score += scene.userRating * 3;

        // Variety bonus
        if (scene.timesUsed === 0) score += 10;
        else if (scene.timesUsed < 3) score += 5;

        return { ...scene.toJSON(), suggestionScore: score };
      });

      // Sort by score and return top suggestions
      scoredScenes.sort((a, b) => b.suggestionScore - a.suggestionScore);

      res.json({
        success: true,
        data: scoredScenes.slice(0, parseInt(limit)).map(scene => ({
          scene: {
            id: scene.id,
            name: scene.name,
            environment: scene.environment,
            timeOfDay: scene.timeOfDay,
            weather: scene.weather,
            lighting: scene.lighting,
            ambiance: scene.ambiance
          },
          score: scene.suggestionScore
        }))
      });
    } catch (error) {
      console.error('Error getting scene suggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scene suggestions'
      });
    }
  }

  // Toggle scene favorite
  static async toggleFavorite(req, res) {
    try {
      const { sceneId } = req.params;

      const scene = await Scene.findByPk(sceneId);
      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      await scene.update({ isFavorite: !scene.isFavorite });

      res.json({
        success: true,
        data: scene,
        message: `Scene ${scene.isFavorite ? 'unfavorited' : 'favorited'} successfully`
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle favorite'
      });
    }
  }

  // Rate scene
  static async rateScene(req, res) {
    try {
      const { sceneId } = req.params;
      const { rating } = req.body;

      const scene = await Scene.findByPk(sceneId);
      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      await scene.update({ userRating: rating });

      res.json({
        success: true,
        data: scene,
        message: 'Scene rated successfully'
      });
    } catch (error) {
      console.error('Error rating scene:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to rate scene'
      });
    }
  }
}

module.exports = SceneController;