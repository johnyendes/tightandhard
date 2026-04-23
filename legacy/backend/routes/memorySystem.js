const express = require('express');
const router = express.Router();
const MemoryController = require('../controllers/MemoryController');
const { validateMemoryCreation, validateMemoryUpdate } = require('../middleware/validation');

// Get all memories for character
router.get('/:characterId', MemoryController.getMemories);

// Create new memory
router.post('/:characterId', validateMemoryCreation, MemoryController.createMemory);

// Get specific memory
router.get('/:characterId/:memoryId', MemoryController.getMemory);

// Update memory
router.patch('/:characterId/:memoryId', validateMemoryUpdate, MemoryController.updateMemory);

// Delete memory
router.delete('/:characterId/:memoryId', MemoryController.deleteMemory);

// Search memories
router.get('/:characterId/search/:query', MemoryController.searchMemories);

// Get core memories
router.get('/:characterId/core', MemoryController.getCoreMemories);

// Get linked memories
router.get('/:characterId/:memoryId/linked', MemoryController.getLinkedMemories);

// Link memories
router.post('/:characterId/:memoryId/link', MemoryController.linkMemories);

// Unlink memories
router.delete('/:characterId/:memoryId/link/:linkedMemoryId', MemoryController.unlinkMemories);

// Update memory importance
router.patch('/:characterId/:memoryId/importance', MemoryController.updateImportance);

// Get memory statistics
router.get('/:characterId/stats', MemoryController.getMemoryStats);

module.exports = router;