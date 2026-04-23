const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const MemoryController = require('../controllers/MemoryController');

// Validation middleware
const validateMemoryCreate = [
  param('characterId').isUUID().withMessage('Valid character ID required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').optional().isIn(['conversation', 'event', 'preference', 'fact', 'emotional', 'milestone', 'gift', 'activity', 'secret', 'achievement']).withMessage('Invalid memory type'),
  body('importance').optional().isInt({ min: 1, max: 10 }).withMessage('Importance must be between 1 and 10'),
  body('emotionalWeight').optional().isFloat({ min: 0, max: 1 }).withMessage('Emotional weight must be between 0 and 1'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

const validateMemoryUpdate = [
  param('characterId').isUUID().withMessage('Valid character ID required'),
  param('memoryId').isUUID().withMessage('Valid memory ID required'),
  body('content').optional().notEmpty(),
  body('importance').optional().isInt({ min: 1, max: 10 }),
  body('emotionalWeight').optional().isFloat({ min: 0, max: 1 }),
  body('tags').optional().isArray()
];

const validateMemoryAccess = [
  param('characterId').isUUID().withMessage('Valid character ID required'),
  param('memoryId').isUUID().withMessage('Valid memory ID required')
];

// Get all memories for a character
router.get('/:characterId', MemoryController.getMemories);

// Get specific memory
router.get('/:characterId/:memoryId', MemoryController.getMemory);

// Create new memory
router.post('/:characterId', validateMemoryCreate, MemoryController.createMemory);

// Update memory
router.put('/:characterId/:memoryId', validateMemoryUpdate, MemoryController.updateMemory);

// Delete memory
router.delete('/:characterId/:memoryId', validateMemoryAccess, MemoryController.deleteMemory);

// Search memories
router.get('/:characterId/search/:query', MemoryController.searchMemories);

// Get core memories
router.get('/:characterId/core', MemoryController.getCoreMemories);

// Get memories by type
router.get('/:characterId/type/:type', MemoryController.getMemoriesByType);

// Get memory timeline
router.get('/:characterId/timeline', MemoryController.getMemoryTimeline);

// Get memory insights/analytics
router.get('/:characterId/insights', MemoryController.getMemoryInsights);

// Link memories together
router.post('/:characterId/:memoryId/link', validateMemoryAccess, MemoryController.linkMemories);

// Get related memories
router.get('/:characterId/:memoryId/related', validateMemoryAccess, MemoryController.getRelatedMemories);

// Archive/unarchive memory
router.post('/:characterId/:memoryId/archive', validateMemoryAccess, MemoryController.archiveMemory);

// Mark memory as favorite
router.post('/:characterId/:memoryId/favorite', validateMemoryAccess, MemoryController.toggleFavorite);

module.exports = router;