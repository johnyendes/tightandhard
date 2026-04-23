class DatabaseIntegrityChecker {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.repairs = [];
  }

  async checkAndRepair() {
    console.log('🔧 Starting database integrity check...');
    
    this.repairs = []; // Reset repairs for this run
    
    const checks = [
      this.checkOrphanedRecords(),
      this.checkDataConsistency(),
      this.repairCorruptedData(),
      this.optimizeTables()
    ];

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Database check ${index} failed:`, result.reason);
      }
    });

    return this.repairs;
  }

  async checkOrphanedRecords() {
    try {
      // Check for orphaned emotion states
      const orphanedEmotions = await this.sequelize.query(
        `SELECT es.id FROM "EmotionStates" es
         LEFT JOIN "Characters" c ON es."characterId" = c.id
         WHERE c.id IS NULL`,
        { type: this.sequelize.QueryTypes.SELECT }
      );

      if (orphanedEmotions.length > 0) {
        await this.sequelize.query(
          `DELETE FROM "EmotionStates" 
           WHERE id IN (${orphanedEmotions.map(r => `'${r.id}'`).join(',')})`
        );
        
        this.repairs.push({
          type: 'orphaned_records',
          description: `Removed ${orphanedEmotions.length} orphaned emotion state records`,
          count: orphanedEmotions.length
        });
      }

      // Check for orphaned bonding tiers
      const orphanedBonding = await this.sequelize.query(
        `SELECT bt.id FROM "BondingTiers" bt
         LEFT JOIN "Characters" c ON bt."characterId" = c.id
         WHERE c.id IS NULL`,
        { type: this.sequelize.QueryTypes.SELECT }
      );

      if (orphanedBonding.length > 0) {
        await this.sequelize.query(
          `DELETE FROM "BondingTiers" 
           WHERE id IN (${orphanedBonding.map(r => `'${r.id}'`).join(',')})`
        );
        
        this.repairs.push({
          type: 'orphaned_records',
          description: `Removed ${orphanedBonding.length} orphaned bonding tier records`,
          count: orphanedBonding.length
        });
      }

      // Check for orphaned memories
      const orphanedMemories = await this.sequelize.query(
        `SELECT ms.id FROM "Memories" ms
         LEFT JOIN "Characters" c ON ms."characterId" = c.id
         WHERE c.id IS NULL`,
        { type: this.sequelize.QueryTypes.SELECT }
      );

      if (orphanedMemories.length > 0) {
        await this.sequelize.query(
          `DELETE FROM "Memories" 
           WHERE id IN (${orphanedMemories.map(r => `'${r.id}'`).join(',')})`
        );
        
        this.repairs.push({
          type: 'orphaned_records',
          description: `Removed ${orphanedMemories.length} orphaned memory records`,
          count: orphanedMemories.length
        });
      }

      // Check for orphaned outfits
      const orphanedOutfits = await this.sequelize.query(
        `SELECT o.id FROM "Outfits" o
         LEFT JOIN "Characters" c ON o."characterId" = c.id
         WHERE c.id IS NULL`,
        { type: this.sequelize.QueryTypes.SELECT }
      );

      if (orphanedOutfits.length > 0) {
        await this.sequelize.query(
          `DELETE FROM "Outfits" 
           WHERE id IN (${orphanedOutfits.map(r => `'${r.id}'`).join(',')})`
        );
        
        this.repairs.push({
          type: 'orphaned_records',
          description: `Removed ${orphanedOutfits.length} orphaned outfit records`,
          count: orphanedOutfits.length
        });
      }

      // Check for orphaned mirror learning patterns
      const orphanedPatterns = await this.sequelize.query(
        `SELECT ml.id FROM "MirrorLearnings" ml
         LEFT JOIN "Characters" c ON ml."characterId" = c.id
         WHERE c.id IS NULL`,
        { type: this.sequelize.QueryTypes.SELECT }
      );

      if (orphanedPatterns.length > 0) {
        await this.sequelize.query(
          `DELETE FROM "MirrorLearnings" 
           WHERE id IN (${orphanedPatterns.map(r => `'${r.id}'`).join(',')})`
        );
        
        this.repairs.push({
          type: 'orphaned_records',
          description: `Removed ${orphanedPatterns.length} orphaned mirror learning records`,
          count: orphanedPatterns.length
        });
      }

    } catch (error) {
      console.error('Orphaned records check failed:', error);
      throw error;
    }
  }

  async checkDataConsistency() {
    try {
      // Check bonding tier consistency
      const inconsistentBonding = await this.sequelize.query(
        `UPDATE "BondingTiers" 
         SET "bondLevel" = CASE 
           WHEN "bondLevel" < 0 THEN 0
           WHEN "bondLevel" > 100 THEN 100
           ELSE "bondLevel"
         END
         WHERE "bondLevel" < 0 OR "bondLevel" > 100`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (inconsistentBonding[1] > 0) {
        this.repairs.push({
          type: 'data_consistency',
          description: `Fixed ${inconsistentBonding[1]} bonding tier records with invalid bond levels`,
          count: inconsistentBonding[1]
        });
      }

      // Check memory importance consistency
      const inconsistentMemories = await this.sequelize.query(
        `UPDATE "Memories" 
         SET importance = CASE 
           WHEN importance < 1 THEN 1
           WHEN importance > 10 THEN 10
           ELSE importance
         END,
         "emotionalWeight" = CASE 
           WHEN "emotionalWeight" < 0 THEN 0
           WHEN "emotionalWeight" > 1 THEN 1
           ELSE "emotionalWeight"
         END
         WHERE importance < 1 OR importance > 10 OR "emotionalWeight" < 0 OR "emotionalWeight" > 1`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (inconsistentMemories[1] > 0) {
        this.repairs.push({
          type: 'data_consistency',
          description: `Fixed ${inconsistentMemories[1]} memory records with invalid values`,
          count: inconsistentMemories[1]
        });
      }

      // Check emotion state consistency
      const inconsistentEmotions = await this.sequelize.query(
        `UPDATE "EmotionStates" 
         SET happiness = CASE 
           WHEN happiness < 0 THEN 0
           WHEN happiness > 1 THEN 1
           ELSE happiness
         END,
         excitement = CASE 
           WHEN excitement < 0 THEN 0
           WHEN excitement > 1 THEN 1
           ELSE excitement
         END,
         trust = CASE 
           WHEN trust < 0 THEN 0
           WHEN trust > 1 THEN 1
           ELSE trust
         END,
         affection = CASE 
           WHEN affection < 0 THEN 0
           WHEN affection > 1 THEN 1
           ELSE affection
         END,
         energy = CASE 
           WHEN energy < 0 THEN 0
           WHEN energy > 1 THEN 1
           ELSE energy
         END,
         confidence = CASE 
           WHEN confidence < 0 THEN 0
           WHEN confidence > 1 THEN 1
           ELSE confidence
         END,
         curiosity = CASE 
           WHEN curiosity < 0 THEN 0
           WHEN curiosity > 1 THEN 1
           ELSE curiosity
         END
         WHERE happiness < 0 OR happiness > 1 
           OR excitement < 0 OR excitement > 1
           OR trust < 0 OR trust > 1
           OR affection < 0 OR affection > 1
           OR energy < 0 OR energy > 1
           OR confidence < 0 OR confidence > 1
           OR curiosity < 0 OR curiosity > 1`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (inconsistentEmotions[1] > 0) {
        this.repairs.push({
          type: 'data_consistency',
          description: `Fixed ${inconsistentEmotions[1]} emotion state records with invalid values`,
          count: inconsistentEmotions[1]
        });
      }

    } catch (error) {
      console.error('Data consistency check failed:', error);
      throw error;
    }
  }

  async repairCorruptedData() {
    try {
      // Fix corrupted JSON fields in characters
      const corruptedCompanions = await this.sequelize.query(
        `UPDATE "Characters" 
         SET personality = '{}' 
         WHERE personality IS NULL OR personality = '' OR personality = 'null' OR personality = 'undefined'`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (corruptedCompanions[1] > 0) {
        this.repairs.push({
          type: 'corrupted_data',
          description: `Fixed ${corruptedCompanions[1]} companions with corrupted personality data`,
          count: corruptedCompanions[1]
        });
      }

      // Fix corrupted appearance data
      const corruptedAppearance = await this.sequelize.query(
        `UPDATE "Characters" 
         SET appearance = '{}' 
         WHERE appearance IS NULL OR appearance = '' OR appearance = 'null' OR appearance = 'undefined'`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (corruptedAppearance[1] > 0) {
        this.repairs.push({
          type: 'corrupted_data',
          description: `Fixed ${corruptedAppearance[1]} companions with corrupted appearance data`,
          count: corruptedAppearance[1]
        });
      }

      // Fix corrupted memory tags
      const corruptedTags = await this.sequelize.query(
        `UPDATE "Memories" 
         SET tags = '[]' 
         WHERE tags IS NULL OR tags = '' OR tags = 'null' OR tags = 'undefined' OR tags::text = ''`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (corruptedTags[1] > 0) {
        this.repairs.push({
          type: 'corrupted_data',
          description: `Fixed ${corruptedTags[1]} memories with corrupted tags`,
          count: corruptedTags[1]
        });
      }

      // Fix corrupted emotionalRange in voice presets
      const corruptedVoiceRange = await this.sequelize.query(
        `UPDATE "VoicePresets" 
         SET "emotionalRange" = '{}' 
         WHERE "emotionalRange" IS NULL OR "emotionalRange" = '' OR "emotionalRange" = 'null'`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (corruptedVoiceRange[1] > 0) {
        this.repairs.push({
          type: 'corrupted_data',
          description: `Fixed ${corruptedVoiceRange[1]} voice presets with corrupted emotional range`,
          count: corruptedVoiceRange[1]
        });
      }

      // Fix corrupted ambiance and soundscape in scenes
      const corruptedScenes = await this.sequelize.query(
        `UPDATE "Scenes" 
         SET ambiance = '{}', soundscape = '[]', "interactiveElements" = '[]' 
         WHERE ambiance IS NULL OR ambiance = '' OR ambiance = 'null'
           OR soundscape IS NULL OR soundscape = '' OR soundscape = 'null'
           OR "interactiveElements" IS NULL OR "interactiveElements" = '' OR "interactiveElements" = 'null'`,
        { type: this.sequelize.QueryTypes.UPDATE }
      );

      if (corruptedScenes[1] > 0) {
        this.repairs.push({
          type: 'corrupted_data',
          description: `Fixed ${corruptedScenes[1]} scenes with corrupted data`,
          count: corruptedScenes[1]
        });
      }

    } catch (error) {
      console.error('Corrupted data repair failed:', error);
      throw error;
    }
  }

  async optimizeTables() {
    try {
      // Get table names
      const tables = await this.sequelize.getQueryInterface().showAllTables();
      let analyzedCount = 0;
      
      for (const table of tables) {
        try {
          // PostgreSQL uses ANALYZE, MySQL uses ANALYZE TABLE
          if (this.sequelize.getDialect() === 'postgres') {
            await this.sequelize.query(`ANALYZE "${table}"`);
            analyzedCount++;
          } else if (this.sequelize.getDialect() === 'mysql') {
            await this.sequelize.query(`ANALYZE TABLE \`${table}\``);
            analyzedCount++;
          }
        } catch (error) {
          // ANALYZE might not be available on all databases
          console.warn(`Could not analyze table ${table}:`, error.message);
        }
      }

      if (analyzedCount > 0) {
        this.repairs.push({
          type: 'optimization',
          description: `Analyzed ${analyzedCount} tables for query optimization`,
          count: analyzedCount
        });
      }

    } catch (error) {
      console.error('Table optimization failed:', error);
      throw error;
    }
  }
}

module.exports = DatabaseIntegrityChecker;