const express = require('express');
const router = express.Router();
const CharacterGeneratorController = require('../controllers/CharacterGeneratorController');
const { body } = require('express-validator');

/**
 * @route   POST /api/character-generator/generate
 * @desc    Generate a new AI character image
 * @access  Private
 */
router.post('/generate', [
  body('characterId').notEmpty().withMessage('Character ID is required'),
  body('prompt').notEmpty().withMessage('Prompt is required'),
  body('width').optional().isInt({ min: 512, max: 2048 }),
  body('height').optional().isInt({ min: 512, max: 2048 }),
  body('steps').optional().isInt({ min: 10, max: 100 }),
  body('cfgScale').optional().isFloat({ min: 1, max: 20 })
], CharacterGeneratorController.generateCharacterImage);

/**
 * @route   POST /api/character-generator/batch
 * @desc    Generate batch of images for character
 * @access  Private
 */
router.post('/batch', [
  body('characterId').notEmpty().withMessage('Character ID is required'),
  body('params').notEmpty().withMessage('Generation params are required'),
  body('count').optional().isInt({ min: 1, max: 20 })
], CharacterGeneratorController.generateImageBatch);

/**
 * @route   POST /api/character-generator/consistent
 * @desc    Generate consistent character with fixed seed
 * @access  Private
 */
router.post('/consistent', [
  body('characterConfig').notEmpty().withMessage('Character config is required')
], CharacterGeneratorController.generateConsistentCharacter);

/**
 * @route   POST /api/character-generator/upscale
 * @desc    Upscale generated image
 * @access  Private
 */
router.post('/upscale', [
  body('imageId').notEmpty().withMessage('Image ID is required'),
  body('scaleFactor').optional().isFloat({ min: 1, max: 4 })
], CharacterGeneratorController.upscaleImage);

/**
 * @route   POST /api/character-generator/retouch
 * @desc    Apply post-processing retouching
 * @access  Private
 */
router.post('/retouch', [
  body('imageId').notEmpty().withMessage('Image ID is required'),
  body('retouchOptions').optional()
], CharacterGeneratorController.applyRetouching);

/**
 * @route   GET /api/character-generator/images/:characterId
 * @desc    Get all images for a character
 * @access  Private
 */
router.get('/images/:characterId', CharacterGeneratorController.getCharacterImages);

/**
 * @route   PUT /api/character-generator/images/:imageId/favorite
 * @desc    Toggle image favorite status
 * @access  Private
 */
router.put('/images/:imageId/favorite', CharacterGeneratorController.toggleFavorite);

/**
 * @route   PUT /api/character-generator/images/:imageId/approve
 * @desc    Approve image for campaign use
 * @access  Private
 */
router.put('/images/:imageId/approve', [
  body('campaignId').optional().isUUID(),
  body('adFormat').optional(),
  body('platform').optional(),
  body('copyText').optional()
], CharacterGeneratorController.approveImage);

/**
 * @route   POST /api/character-generator/campaigns
 * @desc    Create new campaign
 * @access  Private
 */
router.post('/campaigns', [
  body('name').notEmpty().withMessage('Campaign name is required')
], CharacterGeneratorController.createCampaign);

/**
 * @route   GET /api/character-generator/campaigns
 * @desc    Get all campaigns
 * @access  Private
 */
router.get('/campaigns', CharacterGeneratorController.getCampaigns);

module.exports = router;