/**
 * SERVICE HEALTH MONITOR
 * 
 * Real-time monitoring and health checking for all application services
 * Provides structured logging, performance metrics, and alerting capabilities
 */

import { DIContainer } from '../di/Container';

export interface ServiceHealthStatus {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  lastError?: string;
  uptime: number;
  memoryUsage: number;
}

export interface SystemHealthReport {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: ServiceHealthStatus[];
  performance: {
    avgResponseTime: number;
    totalMemoryUsage: number;
    serviceCount: number;
  };
  alerts: string[];
}

export interface HealthCheckOptions {
  timeout?: number;
  includePerformance?: boolean;
  includeMemory?: boolean;
  maxRetries?: number;
}

export class ServiceHealthMonitor {
  private static instance: ServiceHealthMonitor | null = null;
  private healthHistory: Map<string, ServiceHealthStatus[]> = new Map();
  private readonly MAX_HISTORY = 100;
  private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds
  private readonly DEFAULT_MAX_RETRIES = 3;

  private constructor() {}

  static getInstance(): ServiceHealthMonitor {
    if (!ServiceHealthMonitor.instance) {
      ServiceHealthMonitor.instance = new ServiceHealthMonitor();
    }
    return ServiceHealthMonitor.instance;
  }

  /**
   * Perform comprehensive health check on all services
   */
  async performHealthCheck(options: HealthCheckOptions = {}): Promise<SystemHealthReport> {
    const startTime = Date.now();
    const container = DIContainer.getInstance();
    const services = container.getRegisteredServices();
    
    const healthResults: ServiceHealthStatus[] = [];
    const alerts: string[] = [];
    
    console.log(`[HealthMonitor] Starting health check for ${services.length} services...`);
    
    // Check each service health
    for (const serviceName of services) {
      try {
        const health = await this.checkServiceHealth(serviceName, options);
        healthResults.push(health);
        
        // Store in history
        this.storeHealthHistory(serviceName, health);
        
        // Generate alerts for unhealthy services
        if (health.status === 'unhealthy') {
          alerts.push(`Service ${serviceName} is unhealthy: ${health.lastError}`);
        } else if (health.status === 'degraded') {
          alerts.push(`Service ${serviceName} is degraded: response time ${health.responseTime}ms`);
        }
        
      } catch (error) {
        const failedHealth: ServiceHealthStatus = {
          serviceName,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: -1,
          errorCount: 1,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          uptime: 0,
          memoryUsage: 0
        };
        
        healthResults.push(failedHealth);
        alerts.push(`Failed to check service ${serviceName}: ${failedHealth.lastError}`);
      }
    }
    
    // Calculate overall system health
    const overallStatus = this.calculateOverallStatus(healthResults);
    
    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(healthResults);
    
    const report: SystemHealthReport = {
      overallStatus,
      timestamp: new Date(),
      services: healthResults,
      performance,
      alerts
    };
    
    const totalTime = Date.now() - startTime;
    console.log(`[HealthMonitor] Health check completed in ${totalTime}ms. Status: ${overallStatus}`);
    
    return report;
  }

  /**
   * Check health of a specific service
   */
  private async checkServiceHealth(
    serviceName: string, 
    options: HealthCheckOptions
  ): Promise<ServiceHealthStatus> {
    const startTime = Date.now();
    const container = DIContainer.getInstance();
    const timeout = options.timeout || this.DEFAULT_TIMEOUT;
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES;
    
    let lastError: string | undefined;
    let errorCount = 0;
    
    // Try to access the service with retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const service = container.get(serviceName);
        
        // Basic health check - service should be accessible
        if (!service) {
          throw new Error('Service returned null/undefined');
        }
        
        // If service has a health check method, use it
        if (typeof (service as any).healthCheck === 'function') {
          // Create a timeout promise for the health check
          const healthCheckPromise = (service as any).healthCheck();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), timeout);
          });
          
          try {
            const healthResult = await Promise.race([healthCheckPromise, timeoutPromise]);
            if (!healthResult.healthy) {
              throw new Error(`Service health check failed: ${healthResult.issues?.join(', ')}`);
            }
          } catch (timeoutError) {
            if (timeoutError instanceof Error && timeoutError.message === 'Health check timeout') {
              throw new Error(`Health check timed out after ${timeout}ms`);
            }
            throw timeoutError;
          }
        }
        
        // Service check succeeded - reset error count for successful attempts
        const finalErrorCount = 0; // Reset to 0 since this attempt succeeded
        const responseTime = Date.now() - startTime;
        const status = this.determineServiceStatus(responseTime, finalErrorCount);
        
        return {
          serviceName,
          status,
          lastCheck: new Date(),
          responseTime,
          errorCount: finalErrorCount,
          lastError,
          uptime: this.getServiceUptime(serviceName),
          memoryUsage: options.includeMemory ? this.getServiceMemoryUsage(serviceName) : 0
        };
        
      } catch (error) {
        errorCount++;
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }
        
        // Final attempt failed
        const responseTime = Date.now() - startTime;
        return {
          serviceName,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime,
          errorCount,
          lastError,
          uptime: 0,
          memoryUsage: 0
        };
      }
    }
    
    throw new Error('Health check failed after all retries');
  }

  /**
   * Determine service status based on response time and error count
   */
  private determineServiceStatus(responseTime: number, errorCount: number): 'healthy' | 'degraded' | 'unhealthy' {
    // If there were errors but the final attempt succeeded, errorCount should be 0
    // errorCount > 0 means the final attempt also failed
    if (errorCount > 0) {
      return 'unhealthy';
    }
    
    if (responseTime > 1000) { // > 1 second
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Calculate overall system health status
   */
  private calculateOverallStatus(services: ServiceHealthStatus[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    
    if (unhealthyCount > 0) {
      return 'unhealthy';
    }
    
    if (degradedCount > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Calculate performance metrics across all services
   */
  private calculatePerformanceMetrics(services: ServiceHealthStatus[]) {
    const healthyServices = services.filter(s => s.status !== 'unhealthy');
    const avgResponseTime = healthyServices.length > 0 
      ? healthyServices.reduce((sum, s) => sum + s.responseTime, 0) / healthyServices.length
      : 0;
    
    const totalMemoryUsage = services.reduce((sum, s) => sum + s.memoryUsage, 0);
    
    return {
      avgResponseTime: Math.round(avgResponseTime),
      totalMemoryUsage,
      serviceCount: services.length
    };
  }

  /**
   * Get service uptime (simplified - could be enhanced with actual uptime tracking)
   */
  private getServiceUptime(serviceName: string): number {
    // For now, return a placeholder. In production, this could track actual service start times
    return Date.now() - (Date.now() - 60000); // 1 minute placeholder
  }

  /**
   * Get estimated memory usage for a service
   */
  private getServiceMemoryUsage(serviceName: string): number {
    const container = DIContainer.getInstance();
    const memoryStats = container.getMemoryStats();
    
    // Rough estimate per service
    return Math.round(memoryStats.estimatedMemoryUsage / memoryStats.serviceCount);
  }

  /**
   * Store health history for trending analysis
   */
  private storeHealthHistory(serviceName: string, health: ServiceHealthStatus): void {
    if (!this.healthHistory.has(serviceName)) {
      this.healthHistory.set(serviceName, []);
    }
    
    const history = this.healthHistory.get(serviceName)!;
    history.push(health);
    
    // Keep only recent history
    if (history.length > this.MAX_HISTORY) {
      history.splice(0, history.length - this.MAX_HISTORY);
    }
  }

  /**
   * Get health history for a specific service
   */
  getServiceHealthHistory(serviceName: string): ServiceHealthStatus[] {
    return this.healthHistory.get(serviceName) || [];
  }

  /**
   * Get trending health data
   */
  getHealthTrends(serviceName: string, hours: number = 24): {
    avgResponseTime: number;
    errorRate: number;
    uptimePercentage: number;
  } {
    const history = this.getServiceHealthHistory(serviceName);
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const recentHistory = history.filter(h => h.lastCheck.getTime() > cutoff);
    
    if (recentHistory.length === 0) {
      return { avgResponseTime: 0, errorRate: 0, uptimePercentage: 0 };
    }
    
    const avgResponseTime = recentHistory.reduce((sum, h) => sum + h.responseTime, 0) / recentHistory.length;
    const errorRate = recentHistory.filter(h => h.status === 'unhealthy').length / recentHistory.length;
    const uptimePercentage = 1 - errorRate;
    
    return {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100
    };
  }

  /**
   * Clear health history (useful for testing)
   */
  clearHealthHistory(): void {
    this.healthHistory.clear();
  }

  /**
   * Get performance metrics from DI container
   */
  getPerformanceMetrics() {
    return DIContainer.getPerformanceMetrics();
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    const container = DIContainer.getInstance();
    return container.getMemoryStats();
  }
}
