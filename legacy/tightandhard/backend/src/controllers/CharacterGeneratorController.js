const AICharacterGenerator = require('../services/AICharacterGenerator');
const Character = require('../models/Character');
const CharacterImage = require('../models/CharacterImage');
const CharacterCampaign = require('../models/CharacterCampaign');
const { Op } = require('sequelize');

const generator = new AICharacterGenerator();

class CharacterGeneratorController {
  /**
   * Generate a new AI character image
   */
  async generateCharacterImage(req, res) {
    try {
      const {
        characterId,
        prompt,
        negativePrompts,
        seed,
        width,
        height,
        steps,
        cfgScale,
        useControlNet,
        controlNetType,
        referenceImage,
        useFaceSwap,
        masterFaceId,
        useLoRA,
        loraModelId
      } = req.body;
      
      // Validate character exists
      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }
      
      // Generate image
      const result = await generator.generateCharacterImage({
        prompt,
        characterId,
        negativePrompts,
        seed,
        width,
        height,
        steps,
        cfgScale,
        useControlNet,
        controlNetType,
        referenceImage,
        useFaceSwap,
        masterFaceId,
        useLoRA,
        loraModelId
      });
      
      // Save to database
      const characterImage = await CharacterImage.create({
        characterId: characterId,
        imageUrl: result.imageUrl,
        localPath: result.localPath,
        generationData: result.generationData,
        qualityMetrics: result.qualityMetrics,
        status: 'completed',
        generationTime: result.generationTime
      });
      
      // Update character stats
      await this.updateCharacterStats(characterId);
      
      res.json({
        success: true,
        data: {
          imageId: characterImage.id,
          imageUrl: result.imageUrl,
          seed: result.seed,
          qualityMetrics: result.qualityMetrics,
          generationTime: result.generationTime
        }
      });
      
    } catch (error) {
      console.error('Error generating character image:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Generate batch of images for character
   */
  async generateImageBatch(req, res) {
    try {
      const { characterId, params, count } = req.body;
      
      // Validate character exists
      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }
      
      // Generate batch
      const results = await generator.generateImageBatch(
        characterId,
        params,
        count || 5
      );
      
      // Save all images to database
      const savedImages = [];
      for (const result of results) {
        const characterImage = await CharacterImage.create({
          characterId: characterId,
          imageUrl: result.imageUrl,
          localPath: result.localPath,
          generationData: result.generationData,
          qualityMetrics: result.qualityMetrics,
          status: 'completed',
          generationTime: result.generationTime
        });
        savedImages.push({
          imageId: characterImage.id,
          imageUrl: result.imageUrl,
          qualityMetrics: result.qualityMetrics
        });
      }
      
      // Update character stats
      await this.updateCharacterStats(characterId);
      
      res.json({
        success: true,
        data: savedImages
      });
      
    } catch (error) {
      console.error('Error generating image batch:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Generate consistent character with fixed seed
   */
  async generateConsistentCharacter(req, res) {
    try {
      const { characterConfig } = req.body;
      
      const result = await generator.generateConsistentCharacter(characterConfig);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Error generating consistent character:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Upscale image
   */
  async upscaleImage(req, res) {
    try {
      const { imageId, scaleFactor } = req.body;
      
      const image = await CharacterImage.findByPk(imageId);
      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }
      
      const result = await generator.upscaleImage(
        image.localPath,
        scaleFactor || 2
      );
      
      // Update post-processing data
      await image.update({
        postProcessing: {
          ...image.postProcessing,
          upscaled: true,
          upscaleFactor: scaleFactor
        }
      });
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Error upscaling image:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Apply retouching to image
   */
  async applyRetouching(req, res) {
    try {
      const { imageId, retouchOptions } = req.body;
      
      const image = await CharacterImage.findByPk(imageId);
      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }
      
      const result = await generator.applyRetouching(
        image.localPath,
        retouchOptions
      );
      
      // Update post-processing data
      await image.update({
        postProcessing: {
          ...image.postProcessing,
          retouched: true,
          retouchDetails: result.retouchDetails
        }
      });
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Error applying retouching:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Get character images
   */
  async getCharacterImages(req, res) {
    try {
      const { characterId } = req.params;
      const { status, isFavorite, isApproved, limit, offset } = req.query;
      
      const where = { characterId };
      
      if (status) where.status = status;
      if (isFavorite !== undefined) where.isFavorite = isFavorite === 'true';
      if (isApproved !== undefined) where.isApproved = isApproved === 'true';
      
      const images = await CharacterImage.findAll({
        where,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        success: true,
        data: images
      });
      
    } catch (error) {
      console.error('Error getting character images:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Toggle image favorite status
   */
  async toggleFavorite(req, res) {
    try {
      const { imageId } = req.params;
      
      const image = await CharacterImage.findByPk(imageId);
      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }
      
      await image.update({
        isFavorite: !image.isFavorite
      });
      
      res.json({
        success: true,
        data: {
          imageId: imageId,
          isFavorite: image.isFavorite
        }
      });
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Approve image for campaign use
   */
  async approveImage(req, res) {
    try {
      const { imageId } = req.params;
      const { campaignId, adFormat, platform, copyText } = req.body;
      
      const image = await CharacterImage.findByPk(imageId);
      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }
      
      await image.update({
        isApproved: true,
        campaignData: {
          campaignId,
          adFormat,
          platform,
          copyText
        }
      });
      
      res.json({
        success: true,
        data: image
      });
      
    } catch (error) {
      console.error('Error approving image:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Create campaign
   */
  async createCampaign(req, res) {
    try {
      const campaignData = req.body;
      
      const campaign = await CharacterCampaign.create({
        ...campaignData,
        userId: req.user?.id || null
      });
      
      res.json({
        success: true,
        data: campaign
      });
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Get campaigns
   */
  async getCampaigns(req, res) {
    try {
      const { status, limit, offset } = req.query;
      
      const where = {};
      if (status) where.status = status;
      
      const campaigns = await CharacterCampaign.findAll({
        where,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        success: true,
        data: campaigns
      });
      
    } catch (error) {
      console.error('Error getting campaigns:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Update character generation stats
   */
  async updateCharacterStats(characterId) {
    try {
      const stats = await CharacterImage.findAll({
        where: { characterId },
        attributes: [
          [CharacterImage.sequelize.fn('COUNT', '*'), 'total'],
          [CharacterImage.sequelize.fn('SUM', CharacterImage.sequelize.col('generationTime')), 'totalTime']
        ]
      });
      
      const avgTime = stats[0].total > 0 
        ? Math.round(stats[0].totalTime / stats[0].total) 
        : 0;
      
      await Character.update(
        {
          generationStats: {
            totalImages: stats[0].total,
            avgGenerationTime: avgTime
          }
        },
        { where: { id: characterId } }
      );
    } catch (error) {
      console.error('Error updating character stats:', error);
    }
  }
}

module.exports = new CharacterGeneratorController();