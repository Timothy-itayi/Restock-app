/**
 * DEPENDENCY INJECTION CONTAINER
 * 
 * Simple DI container for managing service dependencies
 * Provides service registration and resolution for the application
 */

export interface ServiceFactory<T = any> {
  (): T;
}

export interface ServiceDefinition<T = any> {
  factory: ServiceFactory<T>;
  singleton: boolean;
  instance?: T;
  instanceCreatedAt?: number;
  accessCount?: number;
}

/**
 * Simple dependency injection container
 * 
 * Supports both singleton and transient service registration
 * Lazy instantiation for better performance
 */
export class DIContainer {
  private static instance: DIContainer | null = null;
  private services: Map<string, ServiceDefinition> = new Map();
  
  // Performance monitoring
  private static performanceMetrics: Map<string, number[]> = new Map();
  private static readonly MAX_METRICS = 100;

  /**
   * Get the singleton container instance
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Register a service with the container
   */
  register<T>(
    key: string, 
    factory: ServiceFactory<T>, 
    options: { singleton?: boolean } = { singleton: true }
  ): void {
    this.services.set(key, {
      factory,
      singleton: options.singleton ?? true
    });
    
    console.log(`[DIContainer] Registered service: ${key} (singleton: ${options.singleton})`);
  }

  /**
   * Register a service instance directly (always singleton)
   */
  registerInstance<T>(key: string, instance: T): void {
    this.services.set(key, {
      factory: () => instance,
      singleton: true,
      instance
    });
    
    console.log(`[DIContainer] Registered service instance: ${key}`);
  }

  /**
   * Get a service from the container
   */
  get<T>(key: string): T {
    const definition = this.services.get(key);
    if (!definition) {
      const availableServices = Array.from(this.services.keys()).join(', ');
      throw new Error(
        `Service '${key}' not found in container. Available services: ${availableServices}`
      );
    }

    const startTime = performance.now();
    
    try {
      let instance: T;
      
      if (definition.singleton && definition.instance) {
        instance = definition.instance as T;
      } else {
        instance = definition.factory();
        
        if (definition.singleton) {
          definition.instance = instance;
          definition.instanceCreatedAt = Date.now();
        }
      }
      
      // Record access count
      definition.accessCount = (definition.accessCount || 0) + 1;
      
      const endTime = performance.now();
      DIContainer.recordMetric(`service_get_${key}`, endTime - startTime);
      
      return instance;
    } catch (error) {
      const endTime = performance.now();
      DIContainer.recordMetric(`service_get_${key}_error`, endTime - startTime);
      
      throw new Error(
        `Failed to create service '${key}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a service is registered
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Get all registered service keys
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    console.log('[DIContainer] All services cleared');
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    if (DIContainer.instance) {
      DIContainer.instance.clear();
      DIContainer.instance = null;
    }
  }

  /**
   * Get service registration info (for debugging)
   */
  getServiceInfo(key: string): { registered: boolean; singleton: boolean; hasInstance: boolean } | null {
    const serviceDefinition = this.services.get(key);
    
    if (!serviceDefinition) {
      return null;
    }

    return {
      registered: true,
      singleton: serviceDefinition.singleton,
      hasInstance: !!serviceDefinition.instance
    };
  }

  /**
   * Log all registered services (for debugging)
   */
  debugServices(): void {
    console.log('[DIContainer] Registered services:');
    this.services.forEach((definition, key) => {
      console.log(`  - ${key}: singleton=${definition.singleton}, hasInstance=${!!definition.instance}`);
    });
  }

  /**
   * Get performance metrics for service operations
   */
  static getPerformanceMetrics(): { [key: string]: { avg: number; min: number; max: number; count: number } } {
    const metrics: { [key: string]: { avg: number; min: number; max: number; count: number } } = {};
    
    this.performanceMetrics.forEach((times, operation) => {
      if (times.length === 0) return;
      
      const sum = times.reduce((a, b) => a + b, 0);
      const avg = sum / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      metrics[operation] = { avg, min, max, count: times.length };
    });
    
    return metrics;
  }

  /**
   * Record performance metric for an operation
   */
  private static recordMetric(operation: string, duration: number): void {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    
    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only the most recent metrics
    if (metrics.length > this.MAX_METRICS) {
      metrics.splice(0, metrics.length - this.MAX_METRICS);
    }
  }

  /**
   * Benchmark service creation performance
   */
  async benchmarkServiceCreation(serviceName: string, iterations: number = 10): Promise<{
    serviceName: string;
    avgTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  }> {
    if (!this.has(serviceName)) {
      throw new Error(`Service '${serviceName}' not found for benchmarking`);
    }

    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      // Create service instance
      await this.get(serviceName);
      
      const end = performance.now();
      times.push(end - start);
      
      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const totalTime = times.reduce((a, b) => a + b, 0);
    
    return {
      serviceName,
      avgTime,
      minTime,
      maxTime,
      totalTime
    };
  }

  /**
   * Get service lifecycle information for optimization
   */
  getServiceLifecycleInfo(): Array<{
    name: string;
    singleton: boolean;
    hasInstance: boolean;
    instanceAge: number | null;
    accessCount: number;
  }> {
    const now = Date.now();
    return Array.from(this.services.entries()).map(([name, definition]) => ({
      name,
      singleton: definition.singleton,
      hasInstance: !!definition.instance,
      instanceAge: definition.instance ? now - (definition.instanceCreatedAt || 0) : null,
      accessCount: definition.accessCount || 0
    }));
  }

  /**
   * Reset performance metrics (useful for testing)
   */
  static resetPerformanceMetrics(): void {
    this.performanceMetrics.clear();
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    serviceCount: number;
    singletonInstances: number;
    totalServices: number;
    estimatedMemoryUsage: number;
  } {
    const serviceCount = this.services.size;
    const singletonInstances = Array.from(this.services.values())
      .filter(def => def.singleton && def.instance).length;
    
    // Rough estimate: each service definition ~100 bytes, each instance ~500 bytes
    const estimatedMemoryUsage = (serviceCount * 100) + (singletonInstances * 500);
    
    return {
      serviceCount,
      singletonInstances,
      totalServices: serviceCount,
      estimatedMemoryUsage
    };
  }
}
