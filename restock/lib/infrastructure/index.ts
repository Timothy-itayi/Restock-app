/**
 * INFRASTRUCTURE LAYER EXPORTS
 * 
 * This is the public API of the infrastructure layer
 * Only these exports should be used by other layers
 */

// Infrastructure Services
export { IdGeneratorService } from './_services/IdGeneratorService';

// Supabase Repository Implementations
export { SupabaseUserRepository } from '../../backend/_infrastructure/repositories/SupabaseUserRepository';
export { SupabaseSessionRepository } from '../../backend/_infrastructure/repositories/SupabaseSessionRepository';
export { SupabaseProductRepository } from '../../backend/_infrastructure/repositories/SupabaseProductRepository';
export { SupabaseSupplierRepository } from '../../backend/_infrastructure/repositories/SupabaseSupplierRepository';
export { SupabaseEmailRepository } from '../../backend/_infrastructure/repositories/SupabaseEmailRepository';

// Supabase Infrastructure Components
export { SupabaseHooksProvider, useRepositories, useSessionRepository, useProductRepository, useSupplierRepository, useUserRepository, useEmailRepository } from './_supabase/SupabaseHooksProvider';

// Data Mappers (exposed for testing/advanced use)
export { SessionMapper } from './_repositories/_mappers/SessionMapper';
export { ProductMapper } from './_repositories/_mappers/ProductMapper';
export { SupplierMapper } from './_repositories/_mappers/SupplierMapper';

// External Service Adapters
export { GroqEmailAdapter } from './_adapters/GroqEmailAdapter';

// Dependency Injection
export { DIContainer, type ServiceDefinition, type ServiceFactory } from './_di/Container';
export { registerServices } from './_di/ServiceRegistry';

// Monitoring & Health
export { ServiceHealthMonitor } from './_monitoring/ServiceHealthMonitor';

// Development Tools
export { DependencyGraphVisualizer } from './_devtools/DependencyGraphVisualizer';
export { RuntimePerformanceDashboard } from './_devtools/RuntimePerformanceDashboard';

// Testing Utilities (only export in development/testing)
export { 
  UserContextTestHelper,
  TestPatterns 
} from './_testing/index';

// Type exports for infrastructure interfaces
export type { 
  AuthUser, 
  AuthState 
} from './_services/ClerkAuthService';

export type { 
  EmailRequest, 
  EmailResult 
} from './adapters/GroqEmailAdapter';
