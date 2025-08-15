/**
 * ServiceHealthMonitor Tests
 * 
 * Tests for the service health monitoring system
 */

import { ServiceHealthMonitor } from '../../../app/infrastructure/monitoring/ServiceHealthMonitor';
import { DIContainer } from '../../../app/infrastructure/di/Container';

// Mock services for testing
class MockHealthyService {
  async healthCheck() {
    return { healthy: true, issues: [] };
  }
}

class MockUnhealthyService {
  async healthCheck() {
    return { healthy: false, issues: ['Service is down'] };
  }
}

class MockServiceWithoutHealthCheck {
  // No healthCheck method
}

describe('ServiceHealthMonitor', () => {
  let monitor: ServiceHealthMonitor;
  let container: DIContainer;

  beforeEach(() => {
    DIContainer.reset();
    container = DIContainer.getInstance();
    monitor = ServiceHealthMonitor.getInstance();
    monitor.clearHealthHistory();
  });

  afterEach(() => {
    DIContainer.reset();
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = ServiceHealthMonitor.getInstance();
      const instance2 = ServiceHealthMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Health Check', () => {
    beforeEach(() => {
      // Register test services
      container.register('MockHealthyService', () => new MockHealthyService());
      container.register('MockUnhealthyService', () => new MockUnhealthyService());
      container.register('MockServiceWithoutHealthCheck', () => new MockServiceWithoutHealthCheck());
    });

    test('should perform health check on all services', async () => {
      const report = await monitor.performHealthCheck();
      
      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.services).toHaveLength(3);
      expect(report.overallStatus).toBeDefined();
      expect(report.performance).toBeDefined();
      expect(report.alerts).toBeDefined();
    });

    test('should detect healthy services', async () => {
      const report = await monitor.performHealthCheck();
      const healthyService = report.services.find(s => s.serviceName === 'MockHealthyService');
      
      expect(healthyService).toBeDefined();
      expect(healthyService?.status).toBe('healthy');
      expect(healthyService?.errorCount).toBe(0);
      expect(healthyService?.lastError).toBeUndefined();
    });

    test('should detect unhealthy services', async () => {
      const report = await monitor.performHealthCheck();
      const unhealthyService = report.services.find(s => s.serviceName === 'MockUnhealthyService');
      
      expect(unhealthyService).toBeDefined();
      expect(unhealthyService?.status).toBe('unhealthy');
      expect(unhealthyService?.errorCount).toBeGreaterThan(0);
      expect(unhealthyService?.lastError).toContain('Service is down');
    });

    test('should handle services without health check method', async () => {
      const report = await monitor.performHealthCheck();
      const basicService = report.services.find(s => s.serviceName === 'MockServiceWithoutHealthCheck');
      
      expect(basicService).toBeDefined();
      expect(basicService?.status).toBe('healthy'); // Should be healthy if accessible
      expect(basicService?.errorCount).toBe(0);
    });

    test('should calculate overall system status correctly', async () => {
      const report = await monitor.performHealthCheck();
      
      // With one unhealthy service, overall should be unhealthy
      expect(report.overallStatus).toBe('unhealthy');
      
      // Should have alerts for unhealthy services
      expect(report.alerts.length).toBeGreaterThan(0);
      expect(report.alerts.some(alert => alert.includes('MockUnhealthyService'))).toBe(true);
    });

    test('should include performance metrics when requested', async () => {
      const report = await monitor.performHealthCheck({ 
        includePerformance: true, 
        includeMemory: true 
      });
      
      expect(report.performance).toBeDefined();
      expect(report.performance.avgResponseTime).toBeGreaterThanOrEqual(0);
      expect(report.performance.totalMemoryUsage).toBeGreaterThanOrEqual(0);
      expect(report.performance.serviceCount).toBe(3);
    });

    test('should handle service access failures gracefully', async () => {
      // Register a service that throws when accessed
      container.register('FaultyService', () => {
        throw new Error('Service factory error');
      });
      
      const report = await monitor.performHealthCheck();
      const faultyService = report.services.find(s => s.serviceName === 'FaultyService');
      
      expect(faultyService).toBeDefined();
      expect(faultyService?.status).toBe('unhealthy');
      expect(faultyService?.errorCount).toBeGreaterThan(0);
      expect(faultyService?.lastError).toContain('Service factory error');
    });
  });

  describe('Health History', () => {
    test('should store health history for services', async () => {
      container.register('TestService', () => new MockHealthyService());
      
      // Perform multiple health checks
      await monitor.performHealthCheck();
      await monitor.performHealthCheck();
      
      const history = monitor.getServiceHealthHistory('TestService');
      expect(history).toHaveLength(2);
      expect(history[0].serviceName).toBe('TestService');
      expect(history[1].serviceName).toBe('TestService');
    });

    test('should limit history size', async () => {
      container.register('TestService', () => new MockHealthyService());
      
      // Perform many health checks to exceed limit
      for (let i = 0; i < 150; i++) {
        await monitor.performHealthCheck();
      }
      
      const history = monitor.getServiceHealthHistory('TestService');
      expect(history.length).toBeLessThanOrEqual(100); // MAX_HISTORY limit
    });

    test('should clear health history', () => {
      monitor.clearHealthHistory();
      const history = monitor.getServiceHealthHistory('TestService');
      expect(history).toHaveLength(0);
    });
  });

  describe('Health Trends', () => {
    test('should calculate health trends correctly', async () => {
      container.register('TestService', () => new MockHealthyService());
      
      // Perform health checks
      await monitor.performHealthCheck();
      await monitor.performHealthCheck();
      
      const trends = monitor.getHealthTrends('TestService', 1); // 1 hour
      expect(trends).toBeDefined();
      expect(trends.avgResponseTime).toBeGreaterThanOrEqual(0);
      expect(trends.errorRate).toBeGreaterThanOrEqual(0);
      expect(trends.uptimePercentage).toBeGreaterThanOrEqual(0);
      expect(trends.uptimePercentage).toBeLessThanOrEqual(1);
    });

    test('should handle empty history gracefully', () => {
      const trends = monitor.getHealthTrends('NonExistentService', 1);
      expect(trends.avgResponseTime).toBe(0);
      expect(trends.errorRate).toBe(0);
      expect(trends.uptimePercentage).toBe(0);
    });
  });

  describe('Performance Metrics', () => {
    test('should get performance metrics from DI container', () => {
      const metrics = monitor.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    test('should get memory statistics', () => {
      const stats = monitor.getMemoryStats();
      expect(stats).toBeDefined();
      expect(stats.serviceCount).toBeGreaterThanOrEqual(0);
      expect(stats.estimatedMemoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle health check timeouts', async () => {
      // Register a slow service
      container.register('SlowService', () => ({
        async healthCheck() {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
          return { healthy: true, issues: [] };
        }
      }));
      
      const report = await monitor.performHealthCheck({ timeout: 100 }); // 100ms timeout
      const slowService = report.services.find(s => s.serviceName === 'SlowService');
      
      expect(slowService?.status).toBe('unhealthy');
      expect(slowService?.lastError).toContain('timed out');
    }, 10000); // Increase test timeout to 10 seconds

    test('should retry failed health checks', async () => {
      let callCount = 0;
      container.register('RetryService', () => ({
        async healthCheck() {
          callCount++;
          if (callCount < 3) {
            throw new Error('Temporary failure');
          }
          return { healthy: true, issues: [] };
        }
      }));
      
      const report = await monitor.performHealthCheck({ maxRetries: 3 });
      const retryService = report.services.find(s => s.serviceName === 'RetryService');
      
      expect(callCount).toBe(3);
      expect(retryService?.status).toBe('healthy');
      expect(retryService?.errorCount).toBe(0); // Should succeed on final attempt
    });
  });

  describe('Configuration Options', () => {
    test('should respect timeout configuration', async () => {
      container.register('TimeoutService', () => ({
        async healthCheck() {
          await new Promise(resolve => setTimeout(resolve, 500));
          return { healthy: true, issues: [] };
        }
      }));
      
      const startTime = Date.now();
      await monitor.performHealthCheck({ timeout: 100 });
      const duration = Date.now() - startTime;
      
      // Should complete within reasonable time (the timeout is working, service is marked unhealthy)
      expect(duration).toBeLessThan(1000);
    });

    test('should respect retry configuration', async () => {
      let callCount = 0;
      container.register('RetryConfigService', () => ({
        async healthCheck() {
          callCount++;
          throw new Error('Always fails');
        }
      }));
      
      await monitor.performHealthCheck({ maxRetries: 1 });
      expect(callCount).toBe(1); // Should only try once
    });
  });
});
