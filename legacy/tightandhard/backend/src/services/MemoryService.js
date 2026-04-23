const { Memory, Character, sequelize } = require('../models');
const { Op } = require('sequelize');

class MemoryService {
  // Memory importance levels
  static IMPORTANCE_LEVELS = {
    TRIVIAL: 1,
    LOW: 2,
    MINOR: 3,
    NORMAL: 4,
    MODERATE: 5,
    IMPORTANT: 6,
    SIGNIFICANT: 7,
    MAJOR: 8,
    CRITICAL: 9,
    CORE: 10
  };

  // Memory type configurations
  static TYPE_CONFIG = {
    conversation: { baseImportance: 4, emotionalWeight: 0.5 },
    event: { baseImportance: 6, emotionalWeight: 0.7 },
    preference: { baseImportance: 5, emotionalWeight: 0.3 },
    fact: { baseImportance: 3, emotionalWeight: 0.2 },
    emotional: { baseImportance: 7, emotionalWeight: 0.9 },
    milestone: { baseImportance: 9, emotionalWeight: 0.8 },
    gift: { baseImportance: 8, emotionalWeight: 0.8 },
    activity: { baseImportance: 5, emotionalWeight: 0.6 },
    secret: { baseImportance: 8, emotionalWeight: 0.7 },
    achievement: { baseImportance: 7, emotionalWeight: 0.6 }
  };

  // Create memory with enhanced processing
  static async createMemory(characterId, memoryData) {
    const {
      type,
      content,
      summary,
      importance,
      emotionalWeight,
      tags = [],
      context = {},
      emotionalContext = {},
      isCore = false
    } = memoryData;

    // Auto-generate summary if not provided
    const finalSummary = summary || this.generateSummary(content);
    
    // Auto-calculate importance if not provided
    const finalImportance = importance || this.calculateImportance(type, content, emotionalWeight);
    
    // Auto-calculate emotional weight if not provided
    const finalEmotionalWeight = emotionalWeight !== undefined ? 
      emotionalWeight : this.calculateEmotionalWeight(type, content);
    
    // Auto-generate tags
    const autoTags = this.generateTags(content, type);
    const finalTags = [...new Set([...tags, ...autoTags])];
    
    const memory = await Memory.create({
      characterId,
      type,
      content,
      summary: finalSummary,
      importance: finalImportance,
      emotionalWeight: finalEmotionalWeight,
      tags: finalTags,
      context,
      emotionalContext,
      isCore: isCore || finalImportance >= 9
    });

    // Auto-link to related memories
    await this.autoLinkMemories(memory);
    
    return memory;
  }

  // Update memory with validation
  static async updateMemory(memory, updates) {
    const validatedUpdates = {};
    
    if (updates.content !== undefined) {
      validatedUpdates.content = updates.content;
      // Regenerate summary if content changed
      validatedUpdates.summary = updates.summary || this.generateSummary(updates.content);
    }
    
    if (updates.summary !== undefined) {
      validatedUpdates.summary = updates.summary;
    }
    
    if (updates.importance !== undefined) {
      validatedUpdates.importance = Math.max(1, Math.min(10, parseInt(updates.importance)));
    }
    
    if (updates.emotionalWeight !== undefined) {
      validatedUpdates.emotionalWeight = Math.max(0, Math.min(1, parseFloat(updates.emotionalWeight)));
    }
    
    if (updates.tags !== undefined) {
      validatedUpdates.tags = Array.isArray(updates.tags) ? updates.tags : [];
    }
    
    if (updates.context !== undefined) {
      validatedUpdates.context = updates.context;
    }
    
    if (updates.isCore !== undefined) {
      validatedUpdates.isCore = Boolean(updates.isCore);
    }
    
    if (updates.isFavorite !== undefined) {
      validatedUpdates.isFavorite = Boolean(updates.isFavorite);
    }
    
    validatedUpdates.lastAccessed = new Date();
    
    await memory.update(validatedUpdates);
    return memory;
  }

  // Generate automatic summary
  static generateSummary(content) {
    if (content.length <= 100) return content;
    
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 20) {
      return firstSentence.length > 100 ? 
        firstSentence.substring(0, 97) + '...' : 
        firstSentence;
    }
    
    return content.substring(0, 97) + '...';
  }

  // Calculate importance based on content analysis
  static calculateImportance(type, content, emotionalWeight = 0.5) {
    const config = this.TYPE_CONFIG[type] || { baseImportance: 4 };
    let importance = config.baseImportance;
    
    // Adjust based on emotional weight
    importance += Math.round(emotionalWeight * 3);
    
    // Adjust based on content keywords
    const importantKeywords = [
      'love', 'hate', 'first', 'never', 'always', 'forever',
      'important', 'special', 'remember', 'forget', 'promise',
      'secret', 'birthday', 'anniversary', 'gift', 'surprise'
    ];
    
    const keywordMatches = importantKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length;
    
    importance += keywordMatches;
    
    // Adjust based on content length (longer content might be more important)
    if (content.length > 500) importance += 1;
    if (content.length > 1000) importance += 1;
    
    return Math.max(1, Math.min(10, importance));
  }

  // Calculate emotional weight
  static calculateEmotionalWeight(type, content) {
    const config = this.TYPE_CONFIG[type] || { emotionalWeight: 0.5 };
    let weight = config.emotionalWeight;
    
    // Analyze emotional content
    const positiveWords = ['love', 'happy', 'joy', 'wonderful', 'amazing', 'beautiful', 'perfect'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'disappointed'];
    const intensifierWords = ['very', 'extremely', 'incredibly', 'absolutely', 'totally'];
    
    const contentLower = content.toLowerCase();
    
    let positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
    let negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;
    const intensifierCount = intensifierWords.filter(word => contentLower.includes(word)).length;
    
    // Increase weight based on emotional words
    const emotionalWords = positiveCount + negativeCount;
    weight += emotionalWords * 0.1;
    
    // Increase weight based on intensifiers
    weight += intensifierCount * 0.05;
    
    return Math.max(0, Math.min(1, weight));
  }

  // Generate tags automatically
  static generateTags(content, type) {
    const tags = [];
    const contentLower = content.toLowerCase();
    
    // Type-based tags
    tags.push(type);
    
    // Emotion-based tags
    if (contentLower.includes('happy') || contentLower.includes('joy')) tags.push('happy');
    if (contentLower.includes('sad') || contentLower.includes('cry')) tags.push('sad');
    if (contentLower.includes('love') || contentLower.includes('romantic')) tags.push('romantic');
    if (contentLower.includes('funny') || contentLower.includes('laugh')) tags.push('funny');
    if (contentLower.includes('surprise') || contentLower.includes('unexpected')) tags.push('surprise');
    
    // Activity-based tags
    if (contentLower.includes('gift') || contentLower.includes('present')) tags.push('gift');
    if (contentLower.includes('date') || contentLower.includes('together')) tags.push('date');
    if (contentLower.includes('talk') || contentLower.includes('conversation')) tags.push('conversation');
    if (contentLower.includes('play') || contentLower.includes('game')) tags.push('play');
    if (contentLower.includes('food') || contentLower.includes('eat')) tags.push('food');
    
    // Time-based tags
    const now = new Date();
    const timeOfDay = now.getHours();
    if (timeOfDay >= 6 && timeOfDay < 12) tags.push('morning');
    else if (timeOfDay >= 12 && timeOfDay < 17) tags.push('afternoon');
    else if (timeOfDay >= 17 && timeOfDay < 21) tags.push('evening');
    else tags.push('night');
    
    return tags;
  }

  // Auto-link memories based on content similarity
  static async autoLinkMemories(memory) {
    try {
      // Find memories with similar tags or content
      const similarMemories = await Memory.findAll({
        where: {
          characterId: memory.characterId,
          id: { [Op.ne]: memory.id },
          [Op.or]: [
            { tags: { [Op.overlap]: memory.tags } },
            { type: memory.type }
          ]
        },
        limit: 3
      });
      
      const linkedIds = memory.linkedMemories || [];
      
      for (const similar of similarMemories) {
        // Only link if not already linked
        if (!linkedIds.includes(similar.id)) {
          linkedIds.push(similar.id);
          
          // Add reverse link
          const similarLinkedIds = similar.linkedMemories || [];
          if (!similarLinkedIds.includes(memory.id)) {
            similarLinkedIds.push(memory.id);
            await similar.update({ linkedMemories: similarLinkedIds });
          }
        }
      }
      
      await memory.update({ linkedMemories: linkedIds });
    } catch (error) {
      console.error('Error auto-linking memories:', error);
    }
  }

  // Update access tracking for memories
  static async updateAccessTracking(memoryIds) {
    try {
      await Memory.update(
        {
          lastAccessed: new Date(),
          accessCount: sequelize.literal('COALESCE(access_count, 0) + 1')
        },
        {
          where: { id: { [Op.in]: memoryIds } }
        }
      );
    } catch (error) {
      console.error('Error updating access tracking:', error);
    }
  }

  // Search memories with fuzzy matching
  static async searchMemories(characterId, query, options = {}) {
    const {
      minImportance = 1,
      type,
      tags,
      limit = 20,
      fuzzy = true
    } = options;
    
    const whereClause = {
      characterId,
      importance: { [Op.gte]: minImportance }
    };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (tags && tags.length > 0) {
      whereClause.tags = { [Op.overlap]: tags };
    }
    
    const searchCondition = fuzzy
      ? { [Op.iLike]: `%${query}%` }
      : query;
    
    whereClause[Op.or] = [
      { content: searchCondition },
      { summary: searchCondition },
      { tags: { [Op.contains]: [query] } }
    ];
    
    const results = await Memory.findAll({
      where: whereClause,
      order: [
        ['importance', 'DESC'],
        ['lastAccessed', 'DESC']
      ],
      limit
    });
    
    return results;
  }

  // Get related memories
  static async getRelatedMemories(memory, limit = 5) {
    try {
      const linkedIds = memory.linkedMemories || [];
      
      if (linkedIds.length === 0) {
        return [];
      }
      
      const related = await Memory.findAll({
        where: {
          id: { [Op.in]: linkedIds }
        },
        order: [['importance', 'DESC']],
        limit
      });
      
      return related;
    } catch (error) {
      console.error('Error getting related memories:', error);
      return [];
    }
  }

  // Link memories together
  static async linkMemories(memory, linkedMemoryIds, relationship = 'related') {
    try {
      const linkedIds = memory.linkedMemories || [];
      
      for (const targetId of linkedMemoryIds) {
        if (!linkedIds.includes(targetId)) {
          linkedIds.push(targetId);
          
          // Create reverse link
          const targetMemory = await Memory.findByPk(targetId);
          if (targetMemory) {
            const targetLinkedIds = targetMemory.linkedMemories || [];
            if (!targetLinkedIds.includes(memory.id)) {
              targetLinkedIds.push(memory.id);
              await targetMemory.update({ linkedMemories: targetLinkedIds });
            }
          }
        }
      }
      
      await memory.update({ linkedMemories: linkedIds });
      
      return memory;
    } catch (error) {
      console.error('Error linking memories:', error);
      throw error;
    }
  }

  // Get memory summary
  static async getMemorySummary(characterId) {
    try {
      const memories = await Memory.findAll({
        where: { characterId }
      });
      
      const summary = {
        total: memories.length,
        core: memories.filter(m => m.isCore).length,
        favorites: memories.filter(m => m.isFavorite).length,
        archived: memories.filter(m => m.isArchived).length,
        byType: {},
        averageImportance: 0,
        averageEmotionalWeight: 0
      };
      
      memories.forEach(memory => {
        summary.byType[memory.type] = (summary.byType[memory.type] || 0) + 1;
        summary.averageImportance += memory.importance;
        summary.averageEmotionalWeight += memory.emotionalWeight;
      });
      
      if (memories.length > 0) {
        summary.averageImportance /= memories.length;
        summary.averageEmotionalWeight /= memories.length;
      }
      
      return summary;
    } catch (error) {
      console.error('Error getting memory summary:', error);
      return {};
    }
  }

  // Analyze core memories
  static async analyzeCoreMemories(coreMemories) {
    try {
      const analysis = {
        themes: [],
        emotionalTrends: [],
        patterns: []
      };
      
      // Extract themes from tags
      const allTags = coreMemories.flatMap(m => m.tags || []);
      const tagCounts = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      analysis.themes = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));
      
      // Emotional trends
      analysis.emotionalTrends = coreMemories.map(m => ({
        id: m.id,
        emotionalWeight: m.emotionalWeight,
        importance: m.importance,
        date: m.createdAt
      }));
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing core memories:', error);
      return { themes: [], emotionalTrends: [], patterns: [] };
    }
  }

  // Get type statistics
  static async getTypeStatistics(characterId, type) {
    try {
      const memories = await Memory.findAll({
        where: { characterId, type }
      });
      
      const stats = {
        count: memories.length,
        averageImportance: 0,
        averageEmotionalWeight: 0,
        commonTags: {}
      };
      
      memories.forEach(memory => {
        stats.averageImportance += memory.importance;
        stats.averageEmotionalWeight += memory.emotionalWeight;
        
        (memory.tags || []).forEach(tag => {
          stats.commonTags[tag] = (stats.commonTags[tag] || 0) + 1;
        });
      });
      
      if (memories.length > 0) {
        stats.averageImportance /= memories.length;
        stats.averageEmotionalWeight /= memories.length;
      }
      
      stats.commonTags = Object.entries(stats.commonTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));
      
      return stats;
    } catch (error) {
      console.error('Error getting type statistics:', error);
      return { count: 0, averageImportance: 0, averageEmotionalWeight: 0, commonTags: [] };
    }
  }

  // Generate memory timeline
  static async generateMemoryTimeline(characterId, period = '30d', groupBy = 'day', includeEmotions = true) {
    try {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      const memories = await Memory.findAll({
        where: {
          characterId,
          createdAt: { [Op.gte]: startDate }
        },
        order: [['createdAt', 'ASC']]
      });
      
      const timeline = {};
      
      memories.forEach(memory => {
        const date = new Date(memory.createdAt);
        let key;
        
        switch (groupBy) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }
        
        if (!timeline[key]) {
          timeline[key] = {
            count: 0,
            memories: [],
            averageImportance: 0,
            averageEmotionalWeight: 0
          };
        }
        
        timeline[key].count++;
        timeline[key].memories.push({
          id: memory.id,
          type: memory.type,
          importance: memory.importance,
          emotionalWeight: memory.emotionalWeight,
          summary: memory.summary
        });
        
        timeline[key].averageImportance += memory.importance;
        timeline[key].averageEmotionalWeight += memory.emotionalWeight;
      });
      
      // Calculate averages
      Object.keys(timeline).forEach(key => {
        const entry = timeline[key];
        if (entry.count > 0) {
          entry.averageImportance /= entry.count;
          entry.averageEmotionalWeight /= entry.count;
        }
      });
      
      return timeline;
    } catch (error) {
      console.error('Error generating memory timeline:', error);
      return {};
    }
  }

  // Generate memory insights
  static async generateMemoryInsights(characterId) {
    try {
      const memories = await Memory.findAll({
        where: { characterId },
        order: [['createdAt', 'DESC']]
      });
      
      const insights = {
        totalMemories: memories.length,
        memoryGrowth: {
          last7Days: 0,
          last30Days: 0,
          last90Days: 0
        },
        topMemories: [],
        emotionalPatterns: [],
        recentActivity: []
      };
      
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      memories.forEach(memory => {
        const createdAt = new Date(memory.createdAt);
        
        if (createdAt >= last7Days) insights.memoryGrowth.last7Days++;
        if (createdAt >= last30Days) insights.memoryGrowth.last30Days++;
        if (createdAt >= last90Days) insights.memoryGrowth.last90Days++;
      });
      
      // Top memories by importance
      insights.topMemories = memories
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10)
        .map(m => ({
          id: m.id,
          type: m.type,
          importance: m.importance,
          summary: m.summary,
          createdAt: m.createdAt
        }));
      
      // Recent activity
      insights.recentActivity = memories.slice(0, 10).map(m => ({
        id: m.id,
        type: m.type,
        summary: m.summary,
        createdAt: m.createdAt
      }));
      
      // Emotional patterns
      const emotionalByType = {};
      memories.forEach(memory => {
        if (!emotionalByType[memory.type]) {
          emotionalByType[memory.type] = {
            count: 0,
            totalEmotionalWeight: 0,
            totalImportance: 0
          };
        }
        emotionalByType[memory.type].count++;
        emotionalByType[memory.type].totalEmotionalWeight += memory.emotionalWeight;
        emotionalByType[memory.type].totalImportance += memory.importance;
      });
      
      insights.emotionalPatterns = Object.entries(emotionalByType).map(([type, data]) => ({
        type,
        count: data.count,
        averageEmotionalWeight: data.totalEmotionalWeight / data.count,
        averageImportance: data.totalImportance / data.count
      }));
      
      return insights;
    } catch (error) {
      console.error('Error generating memory insights:', error);
      return {};
    }
  }
}

module.exports = MemoryService;