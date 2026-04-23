import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Database, Server, HardDrive } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface SystemMetrics {
  memory: { usage: number; threshold: number };
  cpu: { usage: number; threshold: number };
  disk: { usage: number; threshold: number };
  database: { connected: boolean; responseTime: number };
  redis: { connected: boolean; responseTime: number };
  api: { responseTime: number; errorRate: number };
}

interface RepairRecord {
  id: string;
  type: string;
  error: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export const SystemHealthMonitor: React.FC = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [repairs, setRepairs] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSystemStatus();
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchSystemStatus, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchSystemStatus = async () => {
    try {
      const response = await api.get('/auto-repair/status');
      setMetrics(response.data.metrics);
      setRepairs(response.data.recentRepairs || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceRepair = async (type: string) => {
    try {
      setLoading(true);
      await api.post(`/auto-repair/force/${type}`);
      await fetchSystemStatus();
    } catch (error) {
      console.error(`Failed to force ${type} repair:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, threshold: number, inverted = false) => {
    const isHigh = inverted ? value < threshold : value > threshold;
    if (isHigh) return 'text-red-600 bg-red-100';
    if (value > threshold * 0.8) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getConnectivityStatus = (connected: boolean, responseTime: number) => {
    if (!connected) return { color: 'text-red-600 bg-red-100', status: 'Disconnected' };
    if (responseTime > 1000) return { color: 'text-yellow-600 bg-yellow-100', status: 'Slow' };
    return { color: 'text-green-600 bg-green-100', status: 'Connected' };
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Health Monitor</h2>
        <div className="flex items-center space-x-3">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={() => fetchSystemStatus()}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Memory Usage */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics.memory.usage * 100).toFixed(1)}%
                </p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(metrics.memory.usage, metrics.memory.threshold)}`}>
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.memory.usage > metrics.memory.threshold ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${metrics.memory.usage * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* CPU Usage */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics.cpu.usage * 100).toFixed(1)}%
                </p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(metrics.cpu.usage, metrics.cpu.threshold)}`}>
                <Server className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.cpu.usage > metrics.cpu.threshold ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${metrics.cpu.usage * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Disk Usage */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics.disk.usage * 100).toFixed(1)}%
                </p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(metrics.disk.usage, metrics.disk.threshold)}`}>
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.disk.usage > metrics.disk.threshold ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${metrics.disk.usage * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Database Connectivity */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database</p>
                <p className="text-lg font-bold text-gray-900">
                  {getConnectivityStatus(metrics.database.connected, metrics.database.responseTime).status}
                </p>
              </div>
              <div className={`p-2 rounded-full ${getConnectivityStatus(metrics.database.connected, metrics.database.responseTime).color}`}>
                <Database className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Response: {metrics.database.responseTime}ms
            </p>
          </Card>

          {/* Redis Connectivity */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Redis Cache</p>
                <p className="text-lg font-bold text-gray-900">
                  {getConnectivityStatus(metrics.redis.connected, metrics.redis.responseTime).status}
                </p>
              </div>
              <div className={`p-2 rounded-full ${getConnectivityStatus(metrics.redis.connected, metrics.redis.responseTime).color}`}>
                <Database className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Response: {metrics.redis.responseTime}ms
            </p>
          </Card>

          {/* API Response Time */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Response</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.api.responseTime}ms
                </p>
              </div>
              <div className={`p-2 rounded-full ${metrics.api.responseTime > 1000 ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100'}`}>
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Error Rate: {(metrics.api.errorRate * 100).toFixed(1)}%
            </p>
          </Card>
        </div>
      )}

      {/* Repair Controls */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Repair Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button onClick={() => forceRepair('database')} disabled={loading}>
            <Database className="w-4 h-4 mr-2" />
            Repair Database
          </Button>
          <Button onClick={() => forceRepair('health')} disabled={loading} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Full Health Check
          </Button>
          <Button onClick={() => fetchSystemStatus()} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </Card>

      {/* Recent Repairs */}
      {repairs.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Repairs</h3>
          <div className="space-y-3">
            {repairs.map((repair) => (
              <motion.div
                key={repair.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {repair.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {repair.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {repair.status === 'running' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{repair.type}</p>
                    <p className="text-xs text-gray-500">{new Date(repair.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <Badge variant={
                  repair.status === 'completed' ? 'success' :
                  repair.status === 'failed' ? 'danger' :
                  'warning'
                }>
                  {repair.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};