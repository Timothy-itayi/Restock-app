/**
 * INFRASTRUCTURE LAYER - Main Index
 * 
 * Exports all infrastructure components for use by the application layer
 * This is the only file the application layer should import from infrastructure
 */

// Configuration
export { 
  supabaseClient, 
  SupabaseClientFactory, 
  TABLES, 
  SESSION_STATUS 
} from './config/SupabaseConfig';

// Dependency Injection
export { DIContainer } from './di/Container';
export { 
  registerServices, 
  initializeServices, 
  getRestockApplicationService 
} from './di/ServiceRegistry';

// Services
export { UserContextService } from './services/UserContextService';
export { ClerkAuthService } from './services/ClerkAuthService';
export { IdGeneratorService } from './services/IdGeneratorService';

// Repository Implementations
export { 
  SupabaseSessionRepository,
  SessionNotFoundError,
  SessionSaveError,
  SessionAccessError 
} from './repositories/SupabaseSessionRepository';

export { 
  SupabaseProductRepository,
  ProductNotFoundError,
  ProductSaveError,
  ProductAccessError 
} from './repositories/SupabaseProductRepository';

export { 
  SupabaseSupplierRepository,
  SupplierNotFoundError,
  SupplierSaveError,
  SupplierAccessError 
} from './repositories/SupabaseSupplierRepository';

// Data Mappers (exposed for testing/advanced use)
export { SessionMapper } from './repositories/mappers/SessionMapper';
export { ProductMapper } from './repositories/mappers/ProductMapper';
export { SupplierMapper } from './repositories/mappers/SupplierMapper';

// Email Adapter
export { 
  GroqEmailAdapter,
  createGroqEmailAdapter,
  EmailGenerationError
} from './adapters/GroqEmailAdapter';

// Monitoring and DevTools
export { ServiceHealthMonitor } from './monitoring/ServiceHealthMonitor';
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
