const EventEmitter = require('events');
const os = require('os');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class HealthMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = {
      checkInterval: options.checkInterval || 30000, // 30 seconds
      memoryThreshold: options.memoryThreshold || 0.85, // 85%
      cpuThreshold: options.cpuThreshold || 0.90, // 90%
      diskThreshold: options.diskThreshold || 0.90, // 90%
      maxRestarts: options.maxRestarts || 3,
      restartCooldown: options.restartCooldown || 300000, // 5 minutes
      ...options
    };
    
    this.metrics = {
      memory: { usage: 0, threshold: this.config.memoryThreshold },
      cpu: { usage: 0, threshold: this.config.cpuThreshold },
      disk: { usage: 0, threshold: this.config.diskThreshold },
      database: { connected: false, responseTime: 0 },
      redis: { connected: false, responseTime: 0 },
      api: { responseTime: 0, errorRate: 0 }
    };
    
    this.restartCounts = new Map();
    this.isMonitoring = false;
    this.repairs = [];
  }

  async start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔧 Health Monitor started - Auto-repair system active');
    
    // Start monitoring loop
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
        this.emit('error', error);
      }
    }, this.config.checkInterval);

    // Initial health check
    await this.performHealthCheck();
  }

  async stop() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('🔧 Health Monitor stopped');
  }

  async performHealthCheck() {
    const startTime = Date.now();
    
    // Check system resources
    await this.checkSystemResources();
    
    // Check database connectivity
    await this.checkDatabaseHealth();
    
    // Check Redis connectivity
    await this.checkRedisHealth();
    
    // Check API performance
    await this.checkAPIHealth();
    
    // Analyze metrics and trigger repairs if needed
    await this.analyzeAndRepair();
    
    const checkDuration = Date.now() - startTime;
    this.emit('healthCheck', {
      duration: checkDuration,
      metrics: this.metrics,
      timestamp: new Date()
    });
  }

  async checkSystemResources() {
    try {
      // Memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      this.metrics.memory.usage = usedMem / totalMem;

      // CPU usage (simplified calculation)
      const cpuUsage = await this.getCPUUsage();
      this.metrics.cpu.usage = cpuUsage;

      // Disk usage
      const diskUsage = await this.getDiskUsage();
      this.metrics.disk.usage = diskUsage;

    } catch (error) {
      console.error('System resource check failed:', error);
    }
  }

  async getCPUUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const usage = totalUsage / 1000000; // Convert to seconds
        resolve(Math.min(usage / 1, 1)); // Normalize to 0-1
      }, 100);
    });
  }

  async getDiskUsage() {
    try {
      const { stdout } = await execAsync("df -h / | awk 'NR==2 {print $5}' | sed 's/%//'");
      return parseFloat(stdout.trim()) / 100;
    } catch (error) {
      return 0;
    }
  }

  async checkDatabaseHealth() {
    const startTime = Date.now();
    try {
      // Test database connection
      const db = require('../../models');
      await db.sequelize.authenticate();
      
      this.metrics.database.connected = true;
      this.metrics.database.responseTime = Date.now() - startTime;
    } catch (error) {
      this.metrics.database.connected = false;
      this.metrics.database.responseTime = Date.now() - startTime;
      
      // Schedule database repair
      await this.scheduleRepair('database', error);
    }
  }

  async checkRedisHealth() {
    const startTime = Date.now();
    try {
      const redis = require('redis');
      const client = redis.createClient(process.env.REDIS_URL);
      
      await client.ping();
      await client.quit();
      
      this.metrics.redis.connected = true;
      this.metrics.redis.responseTime = Date.now() - startTime;
    } catch (error) {
      this.metrics.redis.connected = false;
      this.metrics.redis.responseTime = Date.now() - startTime;
      
      // Schedule Redis repair
      await this.scheduleRepair('redis', error);
    }
  }

  async checkAPIHealth() {
    const startTime = Date.now();
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:5001/api/health', {
        timeout: 5000
      });
      
      this.metrics.api.responseTime = Date.now() - startTime;
      this.metrics.api.errorRate = response.status === 200 ? 0 : 1;
    } catch (error) {
      this.metrics.api.responseTime = Date.now() - startTime;
      this.metrics.api.errorRate = 1;
      
      // Schedule API repair
      await this.scheduleRepair('api', error);
    }
  }

  async analyzeAndRepair() {
    // Check memory threshold
    if (this.metrics.memory.usage > this.metrics.memory.threshold) {
      await this.scheduleRepair('memory', 'High memory usage detected');
    }

    // Check CPU threshold
    if (this.metrics.cpu.usage > this.metrics.cpu.threshold) {
      await this.scheduleRepair('cpu', 'High CPU usage detected');
    }

    // Check disk threshold
    if (this.metrics.disk.usage > this.metrics.disk.threshold) {
      await this.scheduleRepair('disk', 'High disk usage detected');
    }
  }

  async scheduleRepair(type, error) {
    const repair = {
      id: Date.now() + Math.random(),
      type,
      error: error.toString(),
      timestamp: new Date(),
      status: 'pending'
    };

    this.repairs.push(repair);
    this.emit('repairScheduled', repair);

    // Execute repair immediately
    await this.executeRepair(repair);
  }

  async executeRepair(repair) {
    try {
      repair.status = 'running';
      this.emit('repairStarted', repair);

      switch (repair.type) {
        case 'database':
          await this.repairDatabase();
          break;
        case 'redis':
          await this.repairRedis();
          break;
        case 'api':
          await this.repairAPI();
          break;
        case 'memory':
          await this.repairMemory();
          break;
        case 'cpu':
          await this.repairCPU();
          break;
        case 'disk':
          await this.repairDisk();
          break;
        default:
          throw new Error(`Unknown repair type: ${repair.type}`);
      }

      repair.status = 'completed';
      repair.completedAt = new Date();
      this.emit('repairCompleted', repair);

    } catch (error) {
      repair.status = 'failed';
      repair.error = error.toString();
      repair.failedAt = new Date();
      this.emit('repairFailed', repair);
    }
  }

  async repairDatabase() {
    console.log('🔧 Repairing database connection...');
    
    try {
      // Restart database connection pool
      const db = require('../../models');
      await db.sequelize.close();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reinitialize connection
      await db.sequelize.authenticate();
      console.log('✅ Database connection repaired');
      
    } catch (error) {
      console.error('❌ Database repair failed:', error);
      throw error;
    }
  }

  async repairRedis() {
    console.log('🔧 Repairing Redis connection...');
    
    try {
      // Clear Redis connection cache
      delete require.cache[require.resolve('redis')];
      
      // Test new connection
      const redis = require('redis');
      const client = redis.createClient(process.env.REDIS_URL);
      await client.ping();
      await client.quit();
      
      console.log('✅ Redis connection repaired');
      
    } catch (error) {
      console.error('❌ Redis repair failed:', error);
      throw error;
    }
  }

  async repairAPI() {
    console.log('🔧 Repairing API service...');
    
    try {
      // Clear require cache for API modules
      Object.keys(require.cache).forEach(key => {
        if (key.includes('/controllers/') || key.includes('/routes/')) {
          delete require.cache[key];
        }
      });
      
      console.log('✅ API service repaired');
      
    } catch (error) {
      console.error('❌ API repair failed:', error);
      throw error;
    }
  }

  async repairMemory() {
    console.log('🔧 Performing memory cleanup...');
    
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Cleanup large objects from memory
      await this.cleanupMemoryLeaks();
      
      console.log('✅ Memory cleanup completed');
      
    } catch (error) {
      console.error('❌ Memory repair failed:', error);
      throw error;
    }
  }

  async repairCPU() {
    console.log('🔧 Reducing CPU load...');
    
    try {
      // Reduce polling intervals temporarily
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = setInterval(async () => {
          await this.performHealthCheck();
        }, this.config.checkInterval * 2); // Double the interval
      }
      
      console.log('✅ CPU load reduced');
      
    } catch (error) {
      console.error('❌ CPU repair failed:', error);
      throw error;
    }
  }

  async repairDisk() {
    console.log('🔧 Cleaning up disk space...');
    
    try {
      // Clean up log files
      await this.cleanupLogs();
      
      // Clean up temporary files
      await this.cleanupTempFiles();
      
      // Compress old files
      await this.compressOldFiles();
      
      console.log('✅ Disk cleanup completed');
      
    } catch (error) {
      console.error('❌ Disk repair failed:', error);
      throw error;
    }
  }

  async cleanupMemoryLeaks() {
    // Clear cached data that might be causing leaks
    try {
      const redis = require('redis');
      const client = redis.createClient(process.env.REDIS_URL);
      
      // Clear expired keys
      const keys = await client.keys('*:temp:*');
      if (keys.length > 0) {
        await client.del(keys);
      }
      
      await client.quit();
    } catch (error) {
      // Redis not available, skip
    }
  }

  async cleanupLogs() {
    try {
      const logDir = './logs';
      const files = await fs.readdir(logDir);
      
      for (const file of files) {
        const filePath = `${logDir}/${file}`;
        const stats = await fs.stat(filePath);
        const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        // Delete logs older than 7 days
        if (daysSinceModified > 7) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      // Log directory doesn't exist or other error
    }
  }

  async cleanupTempFiles() {
    try {
      const tmpDir = './tmp';
      const files = await fs.readdir(tmpDir);
      
      for (const file of files) {
        const filePath = `${tmpDir}/${file}`;
        await fs.unlink(filePath);
      }
    } catch (error) {
      // Temp directory doesn't exist or other error
    }
  }

  async compressOldFiles() {
    try {
      // Compress files older than 1 day
      await execAsync('find ./logs -name "*.log" -mtime +1 -exec gzip {} \\;');
    } catch (error) {
      // Compression failed or no files to compress
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getRepairs() {
    return [...this.repairs];
  }
}

module.exports = HealthMonitor;