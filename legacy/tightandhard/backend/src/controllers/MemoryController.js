const { Memory, Character, EmotionState } = require('../models');
const MemoryService = require('../services/MemoryService');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class MemoryController {
  // Get all memories for character
  static async getMemories(req, res) {
    try {
      const { characterId } = req.params;
      const { 
        type, 
        tag, 
        importance, 
        limit = 50, 
        offset = 0, 
        sortBy = 'importance',
        sortOrder = 'DESC',
        includeArchived = false
      } = req.query;
      
      const filters = { characterId };
      
      if (type) filters.type = type;
      if (tag) filters.tags = { [Op.contains]: [tag] };
      if (importance) filters.importance = { [Op.gte]: parseInt(importance) };
      if (!includeArchived) filters.isArchived = { [Op.or]: [false, null] };
      
      const memories = await Memory.findAll({
        where: filters,
        order: [[sortBy, sortOrder], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{ 
          model: Character, 
          as: 'character',
          attributes: ['id', 'name'] 
        }]
      });
      
      // Update access tracking for viewed memories
      const memoryIds = memories.map(m => m.id);
      if (memoryIds.length > 0) {
        await MemoryService.updateAccessTracking(memoryIds);
      }
      
      const total = await Memory.count({ where: filters });
      const summary = await MemoryService.getMemorySummary(characterId);
      
      res.json({
        success: true,
        data: memories,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + memories.length < total
        },
        summary
      });
      
    } catch (error) {
      console.error('Error getting memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve memories'
      });
    }
  }

  // Create new memory
  static async createMemory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { characterId } = req.params;
      const memoryData = req.body;
      
      // Verify character exists
      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }
      
      // Get current emotional context
      const emotionState = await EmotionState.findOne({
        where: { characterId }
      });
      
      // Create memory with enhanced data
      const memory = await MemoryService.createMemory(characterId, {
        ...memoryData,
        emotionalContext: emotionState ? {
          happiness: emotionState.happiness,
          trust: emotionState.trust,
          affection: emotionState.affection,
          mood: emotionState.mood
        } : {}
      });
      
      res.status(201).json({
        success: true,
        data: memory,
        message: 'Memory created successfully'
      });
      
    } catch (error) {
      console.error('Error creating memory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create memory'
      });
    }
  }

  // Get specific memory
  static async getMemory(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      
      const memory = await Memory.findOne({
        where: { id: memoryId, characterId },
        include: [{ 
          model: Character, 
          as: 'character',
          attributes: ['id', 'name'] 
        }]
      });
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }
      
      // Update access tracking
      await MemoryService.updateAccessTracking([memoryId]);
      
      // Get related memories
      const relatedMemories = await MemoryService.getRelatedMemories(memory);
      
      res.json({
        success: true,
        data: memory,
        related: relatedMemories
      });
      
    } catch (error) {
      console.error('Error getting memory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve memory'
      });
    }
  }

  // Update memory
  static async updateMemory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { characterId, memoryId } = req.params;
      const updates = req.body;
      
      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }
      
      const updatedMemory = await MemoryService.updateMemory(memory, updates);
      
      res.json({
        success: true,
        data: updatedMemory,
        message: 'Memory updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating memory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update memory'
      });
    }
  }

  // Delete memory
  static async deleteMemory(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      const { softDelete = true } = req.body;
      
      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }
      
      if (softDelete) {
        await memory.update({ 
          isArchived: true,
          archivedAt: new Date()
        });
      } else {
        await memory.destroy();
      }
      
      res.json({
        success: true,
        message: softDelete ? 'Memory archived' : 'Memory deleted permanently'
      });
      
    } catch (error) {
      console.error('Error deleting memory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete memory'
      });
    }
  }

  // Search memories
  static async searchMemories(req, res) {
    try {
      const { characterId, query } = req.params;
      const { 
        minImportance = 1, 
        type,
        tags,
        limit = 20,
        fuzzy = true 
      } = req.query;
      
      const results = await MemoryService.searchMemories(characterId, query, {
        minImportance: parseInt(minImportance),
        type,
        tags: tags ? tags.split(',') : undefined,
        limit: parseInt(limit),
        fuzzy: fuzzy === 'true'
      });
      
      // Update access tracking for search results
      const memoryIds = results.map(m => m.id);
      if (memoryIds.length > 0) {
        await MemoryService.updateAccessTracking(memoryIds);
      }
      
      res.json({
        success: true,
        query,
        results,
        count: results.length
      });
      
    } catch (error) {
      console.error('Error searching memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search memories'
      });
    }
  }

  // Get core memories
  static async getCoreMemories(req, res) {
    try {
      const { characterId } = req.params;
      
      const coreMemories = await Memory.findAll({
        where: {
          characterId,
          isCore: true,
          isArchived: { [Op.or]: [false, null] }
        },
        order: [['importance', 'DESC'], ['createdAt', 'DESC']]
      });
      
      const insights = await MemoryService.analyzeCoreMemories(coreMemories);
      
      res.json({
        success: true,
        data: coreMemories,
        insights,
        count: coreMemories.length
      });
      
    } catch (error) {
      console.error('Error getting core memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve core memories'
      });
    }
  }

  // Get memories by type
  static async getMemoriesByType(req, res) {
    try {
      const { characterId, type } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      
      const memories = await Memory.findAll({
        where: {
          characterId,
          type,
          isArchived: { [Op.or]: [false, null] }
        },
        order: [['importance', 'DESC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      const typeStats = await MemoryService.getTypeStatistics(characterId, type);
      
      res.json({
        success: true,
        type,
        data: memories,
        stats: typeStats
      });
      
    } catch (error) {
      console.error('Error getting memories by type:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve memories by type'
      });
    }
  }

  // Get memory timeline
  static async getMemoryTimeline(req, res) {
    try {
      const { characterId } = req.params;
      const { 
        period = '30d',
        groupBy = 'day',
        includeEmotions = true 
      } = req.query;
      
      const timeline = await MemoryService.generateMemoryTimeline(
        characterId, 
        period, 
        groupBy,
        includeEmotions === 'true'
      );
      
      res.json({
        success: true,
        timeline,
        period,
        groupBy
      });
      
    } catch (error) {
      console.error('Error getting memory timeline:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate memory timeline'
      });
    }
  }

  // Get memory insights
  static async getMemoryInsights(req, res) {
    try {
      const { characterId } = req.params;
      
      const insights = await MemoryService.generateMemoryInsights(characterId);
      
      res.json({
        success: true,
        insights
      });
      
    } catch (error) {
      console.error('Error getting memory insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate memory insights'
      });
    }
  }

  // Link memories together
  static async linkMemories(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      const { linkedMemoryIds, relationship } = req.body;
      
      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }
      
      const result = await MemoryService.linkMemories(
        memory, 
        linkedMemoryIds, 
        relationship
      );
      
      res.json({
        success: true,
        data: result,
        message: 'Memories linked successfully'
      });
      
    } catch (error) {
      console.error('Error linking memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to link memories'
      });
    }
  }

  // Get related memories
  static async getRelatedMemories(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      const { limit = 5 } = req.query;
      
      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }
      
      const relatedMemories = await MemoryService.getRelatedMemories(
        memory, 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: relatedMemories
      });
      
    } catch (error) {
      console.error('Error getting related memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve related memories'
      });
    }
  }

  // Archive/unarchive memory
  static async archiveMemory(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      const { archive = true } = req.body;
      
      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }
      
      await memory.update({
        isArchived: archive,
        archivedAt: archive ? new Date() : null
      });
      
      res.json({
        success: true,
        data: memory,
        message: archive ? 'Memory archived' : 'Memory restored'
      });
      
    } catch (error) {
      console.error('Error archiving memory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to archive memory'
      });
    }
  }

  // Toggle favorite status
  static async toggleFavorite(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      
      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }
      
      await memory.update({
        isFavorite: !memory.isFavorite
      });
      
      res.json({
        success: true,
        data: memory,
        message: memory.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      });
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle favorite status'
      });
    }
  }
}

module.exports = MemoryController;