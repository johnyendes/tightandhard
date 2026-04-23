const { HealthMonitor } = require('./autoRepair/HealthMonitor');
const { DatabaseIntegrityChecker } = require('./autoRepair/DatabaseIntegrity');

class AutoRepairOrchestrator {
  constructor(app, sequelize) {
    this.app = app;
    this.sequelize = sequelize;
    this.healthMonitor = new HealthMonitor();
    this.dbIntegrityChecker = new DatabaseIntegrityChecker(sequelize);
    
    this.lastDatabaseCheck = null;
    this.lastCodeQualityCheck = null;
    
    this.setupEventHandlers();
  }

  async start() {
    console.log('🚀 Starting Auto-Repair System...');
    
    try {
      // Start health monitoring
      await this.healthMonitor.start();
      
      // Run initial database integrity check
      await this.runDatabaseIntegrityCheck();
      
      // Schedule regular maintenance
      this.scheduleMaintenanceTasks();
      
      console.log('✅ Auto-Repair System started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start Auto-Repair System:', error);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping Auto-Repair System...');
    
    await this.healthMonitor.stop();
    
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }
    
    console.log('✅ Auto-Repair System stopped');
  }

  setupEventHandlers() {
    this.healthMonitor.on('repairScheduled', (repair) => {
      console.log(`🔧 Repair scheduled: ${repair.type}`);
      this.logRepair('scheduled', repair);
    });

    this.healthMonitor.on('repairCompleted', (repair) => {
      console.log(`✅ Repair completed: ${repair.type}`);
      this.logRepair('completed', repair);
    });

    this.healthMonitor.on('repairFailed', (repair) => {
      console.error(`❌ Repair failed: ${repair.type} - ${repair.error}`);
      this.logRepair('failed', repair);
    });
  }

  logRepair(status, repair) {
    // Log to file or external monitoring service
    const logEntry = {
      timestamp: new Date().toISOString(),
      status,
      ...repair
    };
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(logEntry);
    }
  }

  sendToMonitoringService(logEntry) {
    // Implement monitoring service integration
    // e.g., send to Sentry, DataDog, New Relic, etc.
    console.log('📊 Monitoring:', JSON.stringify(logEntry));
  }

  async runDatabaseIntegrityCheck() {
    try {
      console.log('🔧 Running database integrity check...');
      const repairs = await this.dbIntegrityChecker.checkAndRepair();
      
      this.lastDatabaseCheck = new Date();
      
      if (repairs.length > 0) {
        console.log(`✅ Database integrity check completed with ${repairs.length} repairs`);
      } else {
        console.log('✅ Database integrity check passed - no repairs needed');
      }
      
      return repairs;
    } catch (error) {
      console.error('❌ Database integrity check failed:', error);
      throw error;
    }
  }

  scheduleMaintenanceTasks() {
    // Run maintenance every hour
    this.maintenanceInterval = setInterval(async () => {
      try {
        await this.runDatabaseIntegrityCheck();
      } catch (error) {
        console.error('Scheduled maintenance failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  // API endpoints for manual control
  getStatus() {
    return {
      isRunning: this.healthMonitor.isMonitoring,
      metrics: this.healthMonitor.getMetrics(),
      recentRepairs: this.healthMonitor.getRepairs().slice(-10),
      lastDatabaseCheck: this.lastDatabaseCheck,
      lastCodeQualityCheck: this.lastCodeQualityCheck
    };
  }

  async forceRepair(type) {
    switch (type) {
      case 'database':
        return await this.runDatabaseIntegrityCheck();
      case 'health':
        return await this.healthMonitor.performHealthCheck();
      default:
        throw new Error(`Unknown repair type: ${type}`);
    }
  }
}

// Export singleton instance
let orchestratorInstance = null;

const getAutoRepairOrchestrator = (app, sequelize) => {
  if (!orchestratorInstance) {
    orchestratorInstance = new AutoRepairOrchestrator(app, sequelize);
  }
  return orchestratorInstance;
};

module.exports = {
  AutoRepairOrchestrator,
  getAutoRepairOrchestrator,
  autoRepairOrchestrator: orchestratorInstance
};