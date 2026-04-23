const { VoicePreset, Character } = require('../models');
const { Op } = require('sequelize');

class VoiceController {
  // Get voice presets
  static async getVoicePresets(req, res) {
    try {
      const { personality, emotion } = req.query;

      const where = {};
      if (personality) {
        where.personalityMatch = { [Op.contains]: [personality] };
      }

      const presets = await VoicePreset.findAll({
        where,
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: presets
      });
    } catch (error) {
      console.error('Error fetching voice presets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch voice presets'
      });
    }
  }

  // Get voice preset by ID
  static async getVoicePreset(req, res) {
    try {
      const { presetId } = req.params;

      const preset = await VoicePreset.findByPk(presetId);

      if (!preset) {
        return res.status(404).json({
          success: false,
          error: 'Voice preset not found'
        });
      }

      res.json({
        success: true,
        data: preset
      });
    } catch (error) {
      console.error('Error fetching voice preset:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch voice preset'
      });
    }
  }

  // Create voice preset
  static async createVoicePreset(req, res) {
    try {
      const {
        name,
        description,
        basePitch,
        baseSpeed,
        baseTone,
        baseBreathiness,
        personalityMatch
      } = req.body;

      const preset = await VoicePreset.create({
        name,
        description,
        basePitch: basePitch || 1.0,
        baseSpeed: baseSpeed || 1.0,
        baseTone: baseTone || 'warm',
        baseBreathiness: baseBreathiness || 0.2,
        personalityMatch: personalityMatch || []
      });

      res.status(201).json({
        success: true,
        data: preset,
        message: 'Voice preset created successfully'
      });
    } catch (error) {
      console.error('Error creating voice preset:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create voice preset'
      });
    }
  }

  // Update voice preset
  static async updateVoicePreset(req, res) {
    try {
      const { presetId } = req.params;
      const updates = req.body;

      const preset = await VoicePreset.findByPk(presetId);

      if (!preset) {
        return res.status(404).json({
          success: false,
          error: 'Voice preset not found'
        });
      }

      await preset.update(updates);

      res.json({
        success: true,
        data: preset,
        message: 'Voice preset updated successfully'
      });
    } catch (error) {
      console.error('Error updating voice preset:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update voice preset'
      });
    }
  }

  // Delete voice preset
  static async deleteVoicePreset(req, res) {
    try {
      const { presetId } = req.params;

      const preset = await VoicePreset.findByPk(presetId);

      if (!preset) {
        return res.status(404).json({
          success: false,
          error: 'Voice preset not found'
        });
      }

      await preset.destroy();

      res.json({
        success: true,
        message: 'Voice preset deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting voice preset:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete voice preset'
      });
    }
  }

  // Assign voice preset to character
  static async assignVoicePreset(req, res) {
    try {
      const { characterId } = req.params;
      const { presetId, customParameters } = req.body;

      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      const preset = await VoicePreset.findByPk(presetId);
      if (!preset) {
        return res.status(404).json({
          success: false,
          error: 'Voice preset not found'
        });
      }

      await character.update({
        voicePresetId: presetId,
        voiceSettings: customParameters || {}
      });

      res.json({
        success: true,
        data: {
          characterId,
          presetId,
          preset,
          customParameters
        },
        message: 'Voice preset assigned successfully'
      });
    } catch (error) {
      console.error('Error assigning voice preset:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign voice preset'
      });
    }
  }

  // Generate voice parameters with emotional modulation
  static async generateVoiceParameters(req, res) {
    try {
      const { characterId } = req.params;
      const { emotionalState } = req.body;

      const character = await Character.findByPk(characterId, {
        include: [{ model: VoicePreset, as: 'voicePreset' }]
      });

      if (!character || !character.voicePreset) {
        return res.status(404).json({
          success: false,
          error: 'Character or voice preset not found'
        });
    }

      const preset = character.voicePreset;
      const parameters = {
        pitch: preset.basePitch,
        speed: preset.baseSpeed,
        tone: preset.baseTone,
        breathiness: preset.baseBreathiness
      };

      // Apply emotional modulation
      if (emotionalState) {
        switch (emotionalState) {
          case 'happy':
            parameters.pitch *= 1.1;
            parameters.speed *= 1.05;
            parameters.tone = 'warm';
            break;
          case 'sad':
            parameters.pitch *= 0.9;
            parameters.speed *= 0.95;
            parameters.tone = 'soft';
            parameters.breathiness *= 1.2;
            break;
          case 'excited':
            parameters.pitch *= 1.15;
            parameters.speed *= 1.2;
            parameters.tone = 'bold';
            break;
          case 'calm':
            parameters.pitch *= 0.95;
            parameters.speed *= 0.95;
            parameters.tone = 'neutral';
            break;
          case 'confident':
            parameters.pitch *= 1.05;
            parameters.speed *= 1.0;
            parameters.tone = 'bold';
            parameters.breathiness *= 0.8;
            break;
          case 'shy':
            parameters.pitch *= 0.9;
            parameters.speed *= 0.9;
            parameters.tone = 'soft';
            parameters.breathiness *= 1.3;
            break;
        }
      }

      res.json({
        success: true,
        data: {
          presetId: preset.id,
          emotionalState,
          parameters: {
            pitch: Math.max(0.5, Math.min(2.0, parameters.pitch)).toFixed(2),
            speed: Math.max(0.5, Math.min(2.0, parameters.speed)).toFixed(2),
            tone: parameters.tone,
            breathiness: Math.max(0, Math.min(1.0, parameters.breathiness)).toFixed(2)
          }
        }
      });
    } catch (error) {
      console.error('Error generating voice parameters:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate voice parameters'
      });
    }
  }
}

module.exports = VoiceController;