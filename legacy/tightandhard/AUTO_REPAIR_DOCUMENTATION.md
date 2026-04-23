# Auto-Repair System Documentation

## Overview

The Auto-Repair System is a comprehensive self-healing infrastructure for the TightandHard.com AI Companion Platform. It automatically detects, diagnoses, and fixes issues in real-time, ensuring maximum uptime and minimal manual intervention.

## Architecture

### Components

#### 1. Backend Auto-Repair System

**HealthMonitor** (`src/services/autoRepair/HealthMonitor.js`)
- Real-time system resource monitoring
- Automatic detection of performance issues
- Self-healing capabilities
- Event-driven repair scheduling

**DatabaseIntegrityChecker** (`src/services/autoRepair/DatabaseIntegrity.js`)
- Orphaned record detection and cleanup
- Data consistency validation
- Corrupted data repair
- Table optimization

**AutoRepairOrchestrator** (`src/services/AutoRepairOrchestrator.js`)
- Central coordination of all repair systems
- Event management and logging
- Maintenance scheduling
- Status reporting

#### 2. Frontend Error Recovery

**ErrorBoundary** (`frontend/src/components/ErrorBoundary.tsx`)
- React error boundary with auto-retry
- Automatic error logging
- User-friendly error UI
- Exponential backoff retry logic

**ApiErrorRecovery** (`frontend/src/services/ApiErrorRecovery.ts`)
- Automatic API request retry
- Token refresh handling
- Network error recovery
- Exponential backoff strategy

**useErrorRecovery** (`frontend/src/hooks/useErrorRecovery.ts`)
- Custom hook for error recovery
- Retry configuration
- Retry state management
- Automatic cleanup

**SystemHealthMonitor** (`frontend/src/components/SystemHealthMonitor.tsx`)
- Real-time system metrics display
- Admin dashboard interface
- Manual repair controls
- Repair history tracking

## Features

### System Resource Monitoring

**Metrics Tracked:**
- Memory usage (default threshold: 85%)
- CPU usage (default threshold: 90%)
- Disk usage (default threshold: 90%)
- Database connectivity and response time
- Redis connectivity and response time
- API response time and error rate

**Automatic Repairs:**
- Memory cleanup and garbage collection
- CPU load reduction (adjusts monitoring intervals)
- Disk space cleanup (logs, temp files)
- Database connection repair
- Redis connection repair
- API service repair

### Database Integrity Checks

**Checks Performed:**
- Orphaned record detection (emotion states, bonding tiers, memories, outfits, mirror learning)
- Data consistency validation (bonding levels, memory importance, emotion states)
- Corrupted JSON data repair
- Table optimization (ANALYZE)

**Repair Actions:**
- Automatic deletion of orphaned records
- Normalization of invalid values
- Repair of corrupted JSON fields
- Performance optimization

### API Error Recovery

**Retryable Errors:**
- Network errors (timeouts, connection failures)
- Server errors (5xx status codes)
- Rate limiting (429)
- Request timeouts (408)

**Non-Retryable Errors:**
- Authentication errors (401) - triggers token refresh
- Authorization errors (403)
- Not found errors (404)

**Retry Strategy:**
- Maximum 3 retries
- Exponential backoff (1s, 2s, 4s)
- Jitter addition for distributed systems
- Request ID tracking

## Configuration

### Environment Variables

```env
# Auto-Repair System Configuration
AUTO_REPAIR_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
MEMORY_THRESHOLD=0.85
CPU_THRESHOLD=0.90
DISK_THRESHOLD=0.90
MAX_RESTART_ATTEMPTS=3
RESTART_COOLDOWN=300000

# Database repair settings
DB_INTEGRITY_CHECK_ENABLED=true
DB_INTEGRITY_CHECK_INTERVAL=3600000

# Monitoring and alerting
SYSTEM_MONITORING_ENABLED=true
ALERT_WEBHOOK_URL=https://hooks.slack.com/your-webhook
ERROR_REPORTING_ENABLED=true

# Code quality settings
CODE_QUALITY_CHECK_ENABLED=true
ESLINT_AUTO_FIX=true
PRETTIER_AUTO_FORMAT=true
```

### HealthMonitor Configuration

```javascript
const healthMonitor = new HealthMonitor({
  checkInterval: 30000,        // 30 seconds
  memoryThreshold: 0.85,       // 85% memory usage
  cpuThreshold: 0.90,          // 90% CPU usage
  diskThreshold: 0.90,         // 90% disk usage
  maxRestarts: 3,              // Maximum restart attempts
  restartCooldown: 300000      // 5 minutes cooldown
});
```

## API Endpoints

### Get System Status

```
GET /api/auto-repair/status
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "metrics": {
      "memory": { "usage": 0.75, "threshold": 0.85 },
      "cpu": { "usage": 0.45, "threshold": 0.90 },
      "disk": { "usage": 0.60, "threshold": 0.90 },
      "database": { "connected": true, "responseTime": 50 },
      "redis": { "connected": true, "responseTime": 5 },
      "api": { "responseTime": 120, "errorRate": 0 }
    },
    "recentRepairs": [],
    "lastDatabaseCheck": "2024-01-11T06:00:00.000Z"
  }
}
```

### Force Repair

```
POST /api/auto-repair/force/:type
Authorization: Bearer <token>
```

Valid types: `database`, `health`

Response:
```json
{
  "success": true,
  "data": { ...repair results },
  "message": "Repair 'database' completed successfully"
}
```

### Get Repair History

```
GET /api/auto-repair/history?limit=50&type=database
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890.123",
      "type": "database",
      "error": "Connection lost",
      "timestamp": "2024-01-11T06:00:00.000Z",
      "status": "completed"
    }
  ],
  "count": 1
}
```

### Get System Metrics

```
GET /api/auto-repair/metrics
Authorization: Bearer <token>
```

### Get System Alerts

```
GET /api/auto-repair/alerts
Authorization: Bearer <token>
```

### Toggle Auto-Repair

```
POST /api/auto-repair/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true
}
```

## Usage

### Starting the Server with Auto-Repair

```bash
# Using npm scripts
npm run start:with-repair

# Or set environment variable
AUTO_REPAIR_ENABLED=true npm start
```

### Monitoring System Health

1. **Admin Dashboard**: Navigate to `/admin` and access the "System Health" tab
2. **API**: Call `GET /api/auto-repair/status` for current metrics
3. **CLI**: Check server logs for repair notifications

### Manual Repair

```bash
# Force database integrity check
curl -X POST http://localhost:5001/api/auto-repair/force/database \
  -H "Authorization: Bearer <token>"

# Force full health check
curl -X POST http://localhost:5001/api/auto-repair/force/health \
  -H "Authorization: Bearer <token>"

# Refresh system status
curl http://localhost:5001/api/auto-repair/status \
  -H "Authorization: Bearer <token>"
```

## Frontend Integration

### Error Boundary Setup

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      // Custom error handling
      console.error('App error:', error);
    }}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### API Error Recovery Setup

```tsx
import { apiErrorRecovery } from '@/services/ApiErrorRecovery';
import api from '@/lib/api';

// Setup interceptors
apiErrorRecovery.setupInterceptors(api);
```

### Using useErrorRecovery Hook

```tsx
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

function MyComponent() {
  const { executeWithRetry, isRetrying, retryCount } = useErrorRecovery({
    maxRetries: 3,
    baseDelay: 1000
  });

  const fetchData = async () => {
    return executeWithRetry(async () => {
      const response = await api.get('/data');
      return response.data;
    });
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isRetrying}>
        {isRetrying ? `Retrying (${retryCount}/3)...` : 'Fetch Data'}
      </button>
    </div>
  );
}
```

## Monitoring and Alerts

### Event Types

**Health Check Events:**
- `healthCheck` - Regular health check completed
- `repairScheduled` - Repair task scheduled
- `repairStarted` - Repair task started
- `repairCompleted` - Repair task completed successfully
- `repairFailed` - Repair task failed

### Logging Format

```javascript
{
  timestamp: "2024-01-11T06:00:00.000Z",
  status: "completed",
  type: "database",
  error: "Connection lost",
  id: "1234567890.123"
}
```

### Alert Integration

The system can be integrated with external monitoring services:

1. **Slack Webhook**: Configure `ALERT_WEBHOOK_URL`
2. **Email**: Implement custom notification service
3. **Sentry**: Use Sentry SDK for error tracking
4. **DataDog**: Send metrics to DataDog

## Best Practices

### 1. Threshold Configuration

Set thresholds based on your system capacity:

- **Development**: Higher thresholds (90-95%) to avoid false positives
- **Production**: Lower thresholds (80-85%) for proactive maintenance
- **Testing**: Very high thresholds (95-100%) to avoid interruptions

### 2. Repair Scheduling

- Run database integrity checks during low-traffic periods
- Schedule regular maintenance windows
- Monitor repair logs for patterns

### 3. Monitoring

- Check the admin dashboard regularly
- Set up alerts for critical issues
- Review repair history weekly
- Analyze patterns to prevent recurring issues

### 4. Testing

- Test error recovery scenarios in staging
- Verify auto-repair mechanisms work correctly
- Monitor performance during repair operations
- Document and track issues

## Troubleshooting

### Common Issues

**1. High Memory Usage**
```
Symptom: Memory usage consistently above threshold
Auto-Repair: Triggers garbage collection
Manual Fix: 
- Check for memory leaks in code
- Review Redis cache size
- Monitor node process memory
```

**2. Database Connection Issues**
```
Symptom: Database connectivity lost
Auto-Repair: Attempts reconnection
Manual Fix:
- Check database server status
- Verify connection credentials
- Review connection pool settings
```

**3. API Timeouts**
```
Symptom: API requests timing out
Auto-Retry: Retries with exponential backoff
Manual Fix:
- Check server resources
- Review slow queries
- Optimize database queries
```

**4. Disk Space Full**
```
Symptom: Disk usage at 100%
Auto-Repair: Cleans up logs and temp files
Manual Fix:
- Manually clean up old logs
- Compress or archive old data
- Expand disk capacity
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run start:with-repair
```

### Repair Logs

View repair logs:

```bash
# View all logs
tail -f logs/auto-repair.log

# View specific repair type
grep "database" logs/auto-repair.log

# View failed repairs
grep "failed" logs/auto-repair.log
```

## Performance Impact

### Resource Usage

**HealthMonitor:**
- CPU: ~0.1% during checks
- Memory: ~10MB overhead
- Disk: Minimal (log files only)

**DatabaseIntegrityChecker:**
- CPU: ~5-10% during checks
- Memory: ~50MB during checks
- Database: Temporary load during ANALYZE

**Frontend Error Recovery:**
- CPU: Negligible
- Memory: ~1MB per component
- Network: Additional retry requests

### Optimization Tips

1. Adjust `HEALTH_CHECK_INTERVAL` based on needs
2. Disable unnecessary repair types
3. Use compression for log files
4. Archive old repair history
5. Monitor and tune thresholds

## Security Considerations

### Access Control

- Auto-repair endpoints require admin role
- JWT authentication required
- Rate limiting enforced
- Input validation on all endpoints

### Data Protection

- No sensitive data in logs
- Secure error messages in production
- Proper error handling
- Regular security audits

## Maintenance

### Regular Tasks

**Daily:**
- Check system health dashboard
- Review repair alerts
- Monitor resource usage

**Weekly:**
- Review repair history
- Analyze error patterns
- Update thresholds if needed

**Monthly:**
- Archive old logs
- Review system performance
- Update dependencies

### Updates

When updating the auto-repair system:

1. Test in staging environment
2. Review changelog for breaking changes
3. Backup configuration
4. Monitor after deployment
5. Roll back if issues arise

## Support

For issues or questions:

1. Check documentation
2. Review logs
3. Check GitHub issues
4. Contact support team

## License

Proprietary - TightandHard.com

## Version

Current Version: 1.0.0
Last Updated: January 11, 2024