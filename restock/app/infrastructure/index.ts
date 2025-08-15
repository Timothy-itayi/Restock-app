/**
 * INFRASTRUCTURE LAYER EXPORTS
 * 
 * This is the public API of the infrastructure layer
 * Only these exports should be used by other layers
 */

// Infrastructure Services
export { IdGeneratorService } from './services/IdGeneratorService';

// Convex Repository Implementations
export { ConvexUserRepository } from './convex/repositories/ConvexUserRepository';
export { ConvexSessionRepository } from './convex/repositories/ConvexSessionRepository';
export { ConvexProductRepository } from './convex/repositories/ConvexProductRepository';
export { ConvexSupplierRepository } from './convex/repositories/ConvexSupplierRepository';
export { ConvexEmailRepository } from './convex/repositories/ConvexEmailRepository';

// Convex Infrastructure Components
export { ConvexHooksProvider, useRepositories, useSessionRepository, useProductRepository, useSupplierRepository, useUserRepository, useEmailRepository } from './convex/ConvexHooksProvider';
export { useConvexAuthAdapter } from './convex/ConvexAuthAdapter';

// Test Components
export { ConvexTestComponent } from './convex/ConvexTestComponent';

// Data Mappers (exposed for testing/advanced use)
export { SessionMapper } from './repositories/mappers/SessionMapper';
export { ProductMapper } from './repositories/mappers/ProductMapper';
export { SupplierMapper } from './repositories/mappers/SupplierMapper';

// External Service Adapters
export { GroqEmailAdapter } from './adapters/GroqEmailAdapter';

// Dependency Injection
export { DIContainer, type ServiceDefinition, type ServiceFactory } from './di/Container';
export { registerServices } from './di/ServiceRegistry';

// Monitoring & Health
export { ServiceHealthMonitor } from './monitoring/ServiceHealthMonitor';

// Development Tools
export { DependencyGraphVisualizer } from './devtools/DependencyGraphVisualizer';
export { RuntimePerformanceDashboard } from './devtools/RuntimePerformanceDashboard';

// Testing Utilities (only export in development/testing)
export { 
  UserContextTestHelper,
  TestPatterns 
} from './testing';

// Type exports for infrastructure interfaces
export type { 
  AuthUser, 
  AuthState 
} from './services/ClerkAuthService';

export type { 
  EmailRequest, 
  EmailResult 
} from './adapters/GroqEmailAdapter';
