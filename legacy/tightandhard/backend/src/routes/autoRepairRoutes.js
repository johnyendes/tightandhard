const express = require('express');
const router = express.Router();
const { autoRepairOrchestrator } = require('../services/AutoRepairOrchestrator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get system health status
router.get('/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = autoRepairOrchestrator.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system status'
    });
  }
});

// Force specific repair type
router.post('/force/:type', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['database', 'code', 'health'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid repair type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const result = await autoRepairOrchestrator.forceRepair(type);
    
    res.json({
      success: true,
      data: result,
      message: `Repair '${type}' completed successfully`
    });
  } catch (error) {
    console.error(`Error forcing ${req.params.type} repair:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to execute ${req.params.type} repair`
    });
  }
});

// Get repair history
router.get('/history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    
    let repairs = autoRepairOrchestrator.healthMonitor.getRepairs();
    
    // Filter by type if specified
    if (type) {
      repairs = repairs.filter(r => r.type === type);
    }
    
    // Limit results
    repairs = repairs.slice(-parseInt(limit)).reverse();
    
    res.json({
      success: true,
      data: repairs,
      count: repairs.length
    });
  } catch (error) {
    console.error('Error getting repair history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve repair history'
    });
  }
});

// Get system metrics
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const metrics = autoRepairOrchestrator.healthMonitor.getMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system metrics'
    });
  }
});

// Enable/disable auto-repair system
router.post('/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean'
      });
    }
    
    if (enabled) {
      await autoRepairOrchestrator.start();
    } else {
      await autoRepairOrchestrator.stop();
    }
    
    res.json({
      success: true,
      message: `Auto-repair system ${enabled ? 'enabled' : 'disabled'}`,
      enabled
    });
  } catch (error) {
    console.error('Error toggling auto-repair system:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle auto-repair system'
    });
  }
});

// Get system alerts
router.get('/alerts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const metrics = autoRepairOrchestrator.healthMonitor.getMetrics();
    const alerts = [];
    
    // Check for memory alerts
    if (metrics.memory.usage > metrics.memory.threshold) {
      alerts.push({
        type: 'memory',
        severity: metrics.memory.usage > 0.95 ? 'critical' : 'warning',
        message: `High memory usage: ${(metrics.memory.usage * 100).toFixed(1)}%`,
        value: metrics.memory.usage,
        threshold: metrics.memory.threshold
      });
    }
    
    // Check for CPU alerts
    if (metrics.cpu.usage > metrics.cpu.threshold) {
      alerts.push({
        type: 'cpu',
        severity: metrics.cpu.usage > 0.95 ? 'critical' : 'warning',
        message: `High CPU usage: ${(metrics.cpu.usage * 100).toFixed(1)}%`,
        value: metrics.cpu.usage,
        threshold: metrics.cpu.threshold
      });
    }
    
    // Check for disk alerts
    if (metrics.disk.usage > metrics.disk.threshold) {
      alerts.push({
        type: 'disk',
        severity: metrics.disk.usage > 0.95 ? 'critical' : 'warning',
        message: `High disk usage: ${(metrics.disk.usage * 100).toFixed(1)}%`,
        value: metrics.disk.usage,
        threshold: metrics.disk.threshold
      });
    }
    
    // Check database connectivity
    if (!metrics.database.connected) {
      alerts.push({
        type: 'database',
        severity: 'critical',
        message: 'Database connection lost',
        value: false,
        threshold: true
      });
    }
    
    // Check Redis connectivity
    if (!metrics.redis.connected) {
      alerts.push({
        type: 'redis',
        severity: 'critical',
        message: 'Redis connection lost',
        value: false,
        threshold: true
      });
    }
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error getting system alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system alerts'
    });
  }
});

module.exports = router;