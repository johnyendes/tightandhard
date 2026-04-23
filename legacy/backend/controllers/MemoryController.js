const { Memory, Character } = require('../models');
const { Op } = require('sequelize');

class MemoryController {
  // Get all memories for character
  static async getMemories(req, res) {
    try {
      const { characterId } = req.params;
      const { type, limit = 50, offset = 0 } = req.query;

      const where = { characterId };
      if (type) {
        where.type = type;
      }

      const memories = await Memory.findAll({
        where,
        order: [
          ['isCore', 'DESC'],
          ['importance', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: memories,
        count: memories.length
      });
    } catch (error) {
      console.error('Error fetching memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch memories'
      });
    }
  }

  // Create new memory
  static async createMemory(req, res) {
    try {
      const { characterId } = req.params;
      const { content, type, importance, tags, linkedMemoryIds } = req.body;

      const character = await Character.findByPk(characterId);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      const memory = await Memory.create({
        characterId,
        content,
        type: type || 'conversation',
        importance: importance || 5,
        tags: tags || [],
        isCore: (importance || 5) >= 8
      });

      // Link memories if provided
      if (linkedMemoryIds && linkedMemoryIds.length > 0) {
        await memory.setLinkedMemories(linkedMemoryIds);
      }

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
          model: Memory,
          as: 'linkedMemories',
          through: { attributes: [] }
        }]
      });

      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }

      // Update access tracking
      await memory.update({
        lastAccessedAt: new Date(),
        accessCount: memory.accessCount + 1
      });

      res.json({
        success: true,
        data: memory
      });
    } catch (error) {
      console.error('Error fetching memory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch memory'
      });
    }
  }

  // Update memory
  static async updateMemory(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      const { content, type, importance, tags, isCore } = req.body;

      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });

      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }

      const updates = {};
      if (content !== undefined) updates.content = content;
      if (type !== undefined) updates.type = type;
      if (importance !== undefined) {
        updates.importance = importance;
        updates.isCore = importance >= 8;
      }
      if (tags !== undefined) updates.tags = tags;
      if (isCore !== undefined) updates.isCore = isCore;

      await memory.update(updates);

      res.json({
        success: true,
        data: memory,
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

      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });

      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }

      await memory.destroy();

      res.json({
        success: true,
        message: 'Memory deleted successfully'
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
      const { type, limit = 20 } = req.query;

      const searchConditions = {
        characterId,
        [Op.or]: [
          { content: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ]
      };

      if (type) {
        searchConditions.type = type;
      }

      const memories = await Memory.findAll({
        where: searchConditions,
        order: [
          ['importance', 'DESC'],
          ['lastAccessedAt', 'DESC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: memories,
        count: memories.length,
        query
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

      const memories = await Memory.findAll({
        where: {
          characterId,
          isCore: true
        },
        order: [
          ['importance', 'DESC'],
          ['lastAccessedAt', 'DESC']
        ]
      });

      res.json({
        success: true,
        data: memories,
        count: memories.length
      });
    } catch (error) {
      console.error('Error fetching core memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch core memories'
      });
    }
  }

  // Get linked memories
  static async getLinkedMemories(req, res) {
    try {
      const { characterId, memoryId } = req.params;

      const memory = await Memory.findOne({
        where: { id: memoryId, characterId },
        include: [{
          model: Memory,
          as: 'linkedMemories',
          through: { attributes: [] }
        }]
      });

      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }

      res.json({
        success: true,
        data: memory.linkedMemories
      });
    } catch (error) {
      console.error('Error fetching linked memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch linked memories'
      });
    }
  }

  // Link memories
  static async linkMemories(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      const { linkedMemoryId } = req.body;

      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });

      const linkedMemory = await Memory.findOne({
        where: { id: linkedMemoryId, characterId }
      });

      if (!memory || !linkedMemory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }

      await memory.addLinkedMemory(linkedMemory);

      res.json({
        success: true,
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

  // Unlink memories
  static async unlinkMemories(req, res) {
    try {
      const { characterId, memoryId, linkedMemoryId } = req.params;

      const memory = await Memory.findOne({
        where: { id: memoryId, characterId }
      });

      if (!memory) {
        return res.status(404).json({
          success: false,
          error: 'Memory not found'
        });
      }

      await memory.removeLinkedMemory(linkedMemoryId);

      res.json({
        success: true,
        message: 'Memories unlinked successfully'
      });
    } catch (error) {
      console.error('Error unlinking memories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unlink memories'
      });
    }
  }

  // Update memory importance
  static async updateImportance(req, res) {
    try {
      const { characterId, memoryId } = req.params;
      const { importance } = req.body;

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
        importance: Math.max(1, Math.min(10, importance)),
        isCore: importance >= 8
      });

      res.json({
        success: true,
        data: memory,
        message: 'Memory importance updated successfully'
      });
    } catch (error) {
      console.error('Error updating memory importance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update memory importance'
      });
    }
  }

  // Get memory statistics
  static async getMemoryStats(req, res) {
    try {
      const { characterId } = req.params;

      const totalMemories = await Memory.count({ where: { characterId } });
      const coreMemories = await Memory.count({ 
        where: { characterId, isCore: true } 
      });

      const memoriesByType = await Memory.findAll({
        where: { characterId },
        attributes: ['type'],
        group: ['type'],
        raw: true
      });

      const avgImportance = await Memory.findOne({
        where: { characterId },
        attributes: [
          [Memory.sequelize.fn('AVG', Memory.sequelize.col('importance')), 'avgImportance']
        ],
        raw: true
      });

      const mostAccessed = await Memory.findAll({
        where: { characterId },
        order: [['accessCount', 'DESC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          totalMemories,
          coreMemories,
          memoriesByType: memoriesByType.map(m => ({
            type: m.type,
            count: parseInt(m.count)
          })),
          averageImportance: parseFloat(avgImportance?.avgImportance || 0).toFixed(2),
          mostAccessedMemories: mostAccessed.map(m => ({
            id: m.id,
            content: m.content.substring(0, 100),
            accessCount: m.accessCount
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching memory statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch memory statistics'
      });
    }
  }
}

module.exports = MemoryController;