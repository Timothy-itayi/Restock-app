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
}

/**
 * Simple dependency injection container
 * 
 * Supports both singleton and transient service registration
 * Lazy instantiation for better performance
 */
export class DIContainer {
  private static instance: DIContainer | null = null;
  private services = new Map<string, ServiceDefinition>();

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
    const serviceDefinition = this.services.get(key);
    
    if (!serviceDefinition) {
      throw new Error(`Service '${key}' not found in container. Available services: ${Array.from(this.services.keys()).join(', ')}`);
    }

    // Return existing instance for singletons
    if (serviceDefinition.singleton && serviceDefinition.instance) {
      return serviceDefinition.instance as T;
    }

    try {
      // Create new instance
      const instance = serviceDefinition.factory() as T;
      
      // Store instance for singletons
      if (serviceDefinition.singleton) {
        serviceDefinition.instance = instance;
      }
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to create service '${key}': ${error instanceof Error ? error.message : 'Unknown error'}`);
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
}
