import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SystemAlert {
  id: number;
  type: 'health' | 'repair' | 'performance' | 'security';
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export const useSystemMonitoring = () => {
  const [isSystemHealthy, setIsSystemHealthy] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Initial health check
    checkSystemHealth();

    // Set up polling for health status
    const healthInterval = setInterval(() => {
      checkSystemHealth();
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await api.get('/auto-repair/health');
      const healthData = response.data;

      setIsSystemHealthy(healthData.healthy);
      setLastCheck(new Date());

      // Process alerts if any
      if (healthData.alerts && healthData.alerts.length > 0) {
        const newAlerts: SystemAlert[] = healthData.alerts.map((alert: any) => ({
          id: Date.now() + Math.random(),
          type: alert.type || 'health',
          message: alert.message || alert.description || 'System alert',
          timestamp: new Date(alert.timestamp || Date.now()),
          severity: alert.severity || determineSeverity(alert)
        }));

        setSystemAlerts(prev => [...newAlerts, ...prev].slice(0, 20)); // Keep last 20 alerts
      }

    } catch (error) {
      console.error('Failed to check system health:', error);
      setIsSystemHealthy(false);
      
      // Add connection error alert
      const connectionAlert: SystemAlert = {
        id: Date.now(),
        type: 'health',
        message: 'Unable to connect to system monitoring service',
        timestamp: new Date(),
        severity: 'error'
      };
      
      setSystemAlerts(prev => [connectionAlert, ...prev].slice(0, 20));
    }
  };

  const determineSeverity = (alert: any): 'info' | 'warning' | 'error' | 'critical' => {
    const severity = alert.severity || alert.level;
    
    if (typeof severity === 'string') {
      if (severity.includes('crit')) return 'critical';
      if (severity.includes('err')) return 'error';
      if (severity.includes('warn')) return 'warning';
      return 'info';
    }

    // Determine severity based on alert type
    switch (alert.type) {
      case 'memory':
      case 'cpu':
        return alert.value > 0.95 ? 'critical' : 'warning';
      case 'disk':
        return alert.value > 0.98 ? 'critical' : 'warning';
      case 'database':
      case 'redis':
        return 'critical';
      case 'api':
        return alert.errorRate > 0.5 ? 'critical' : 'warning';
      default:
        return 'info';
    }
  };

  const dismissAlert = (alertId: number) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setSystemAlerts([]);
  };

  const triggerManualHealthCheck = async () => {
    try {
      await api.post('/auto-repair/force/health');
      await checkSystemHealth();
    } catch (error) {
      console.error('Failed to trigger health check:', error);
    }
  };

  return {
    isSystemHealthy,
    systemAlerts,
    lastCheck,
    dismissAlert,
    clearAllAlerts,
    triggerManualHealthCheck,
    refreshHealth: checkSystemHealth
  };
};