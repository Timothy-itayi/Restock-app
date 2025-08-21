/**
 * INFRASTRUCTURE LAYER EXPORTS
 * 
 * This is the public API of the infrastructure layer
 * Only these exports should be used by other layers
 */

// Infrastructure Services
export { IdGeneratorService } from './services/IdGeneratorService';

// Supabase Repository Implementations
export { SupabaseUserRepository } from '../../backend/infrastructure/repositories/SupabaseUserRepository';
export { SupabaseSessionRepository } from '../../backend/infrastructure/repositories/SupabaseSessionRepository';
export { SupabaseProductRepository } from '../../backend/infrastructure/repositories/SupabaseProductRepository';
export { SupabaseSupplierRepository } from '../../backend/infrastructure/repositories/SupabaseSupplierRepository';
export { SupabaseEmailRepository } from '../../backend/infrastructure/repositories/SupabaseEmailRepository';

// Supabase Infrastructure Components
export { SupabaseHooksProvider, useRepositories, useSessionRepository, useProductRepository, useSupplierRepository, useUserRepository, useEmailRepository } from './supabase/SupabaseHooksProvider';

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
