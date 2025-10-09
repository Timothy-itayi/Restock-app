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

export class DIContainer {
  private static instance: DIContainer | null = null;

  // Map<scopeKey, Map<serviceName, ServiceDefinition>>
  private scopedServices: Map<string, Map<string, ServiceDefinition>> = new Map();

  private static performanceMetrics: Map<string, number[]> = new Map();
  private static readonly MAX_METRICS = 100;

  static getInstance(): DIContainer {
    if (!DIContainer.instance) DIContainer.instance = new DIContainer();
    return DIContainer.instance;
  }

  /**
   * Register a factory-based service (lazy instantiation)
   */
  register<T>(
    key: string,
    factory: ServiceFactory<T>,
    options: { singleton?: boolean; scope?: string } = { singleton: true }
  ) {
    const scope = options.scope || 'global';
    if (!this.scopedServices.has(scope)) this.scopedServices.set(scope, new Map());
    const map = this.scopedServices.get(scope)!;

    map.set(key, { factory, singleton: options.singleton ?? true });
    console.log(`[DIContainer] 🏗️ Registered factory service: ${key} (singleton: ${options.singleton}) in scope: ${scope}`);
  }

  /**
   * Register a pre-built instance (useful for repositories)
   */
  registerInstance<T>(key: string, instance: T, options: { scope?: string } = {}) {
    const scope = options.scope || 'global';
    if (!this.scopedServices.has(scope)) this.scopedServices.set(scope, new Map());
    const map = this.scopedServices.get(scope)!;

    map.set(key, {
      factory: () => instance,
      singleton: true,
      instance,
      instanceCreatedAt: Date.now(),
      accessCount: 0,
    });
    console.log(`[DIContainer] 📦 Registered instance: ${key} in scope: ${scope}`);
  }

  /**
   * Resolve a service from a specific scope
   */
  get<T>(key: string, scope: string = 'global'): T {
    const map = this.scopedServices.get(scope);
    if (!map || !map.has(key)) {
      throw new Error(`Service '${key}' not found in scope '${scope}'`);
    }

    const definition = map.get(key)!;
    const startTime = performance.now();

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

    definition.accessCount = (definition.accessCount || 0) + 1;

    const endTime = performance.now();
    DIContainer.recordMetric(`service_get_${key}`, endTime - startTime);

    return instance;
  }

  /**
   * Clear all services for a scope (useful for logout)
   */
  clearScope(scope: string) {
    if (this.scopedServices.has(scope)) {
      this.scopedServices.delete(scope);
      console.log(`[DIContainer] 🧹 Cleared all services for scope: ${scope}`);
    }
  }

  /**
   * Debug info for all scopes
   */
  debugServices() {
    console.log('[DIContainer] 🔍 Scoped services:');
    this.scopedServices.forEach((map, scope) => {
      console.log(` Scope: ${scope}`);
      map.forEach((def, key) => {
        console.log(
          `  - ${key}: singleton=${def.singleton}, hasInstance=${!!def.instance}, accessCount=${def.accessCount ?? 0}`
        );
      });
    });
  }

  private static recordMetric(operation: string, duration: number) {
    if (!this.performanceMetrics.has(operation)) this.performanceMetrics.set(operation, []);
    const arr = this.performanceMetrics.get(operation)!;
    arr.push(duration);
    if (arr.length > this.MAX_METRICS) arr.splice(0, arr.length - this.MAX_METRICS);
  }

  static resetPerformanceMetrics(): void {
    this.performanceMetrics.clear();
  }

  clearAll() {
    this.scopedServices.clear();
    console.log('[DIContainer] 🚨 Cleared ALL scopes and services');
  }
}
