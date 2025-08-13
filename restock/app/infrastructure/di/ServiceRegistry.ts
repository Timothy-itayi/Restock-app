/**
 * SERVICE REGISTRY
 * 
 * Centralized service registration for dependency injection
 * Sets up all application services with proper dependencies
 */

import { DIContainer } from './Container';
import { supabaseClient } from '../config/SupabaseConfig';
import { 
  SupabaseSessionRepository,
  SupabaseProductRepository, 
  SupabaseSupplierRepository,
  UserContextService,
  IdGeneratorService,
  GroqEmailAdapter
} from '../index';
import { RestockApplicationServiceImpl } from '../../application/use-cases/RestockApplicationServiceImpl';
import type { 
  RestockApplicationService 
} from '../../application/interfaces/RestockApplicationService';

/**
 * Register all application services with the DI container
 * 
 * This function sets up the complete dependency graph:
 * UI Layer → Application Layer → Domain Layer → Infrastructure Layer
 */
export function registerServices(): void {
  const container = DIContainer.getInstance();

  console.log('[ServiceRegistry] Starting service registration...');

  try {
    // 1. Infrastructure Services (Lowest level)
    container.register('UserContextService', () => {
      return new UserContextService(supabaseClient);
    });

    container.register('IdGeneratorService', () => {
      return new IdGeneratorService();
    });

    container.register('GroqEmailAdapter', () => {
      return new GroqEmailAdapter();
    });

    // 2. Repository Implementations
    container.register('SupabaseSessionRepository', () => {
      const userContextService = container.get<UserContextService>('UserContextService');
      return new SupabaseSessionRepository(supabaseClient, userContextService);
    });

    container.register('SupabaseProductRepository', () => {
      const userContextService = container.get<UserContextService>('UserContextService');
      return new SupabaseProductRepository(supabaseClient, userContextService);
    });

    container.register('SupabaseSupplierRepository', () => {
      const userContextService = container.get<UserContextService>('UserContextService');
      return new SupabaseSupplierRepository(supabaseClient, userContextService);
    });

    // 3. Application Service (Highest level - orchestrates everything)
    container.register('RestockApplicationService', () => {
      const sessionRepository = container.get<SupabaseSessionRepository>('SupabaseSessionRepository');
      const productRepository = container.get<SupabaseProductRepository>('SupabaseProductRepository');
      const supplierRepository = container.get<SupabaseSupplierRepository>('SupabaseSupplierRepository');
      const idGen = container.get<IdGeneratorService>('IdGeneratorService');

      return new RestockApplicationServiceImpl(
        sessionRepository,
        productRepository,
        supplierRepository,
        () => idGen.generateId()
      );
    });

    // Email adapter no longer required for application service construction

    console.log('[ServiceRegistry] ✅ All services registered successfully');
    
    // Debug log all registered services
    container.debugServices();

  } catch (error) {
    console.error('[ServiceRegistry] ❌ Failed to register services:', error);
    throw new Error(`Service registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize all critical services
 * 
 * Some services need async initialization (like email adapter)
 * This function handles that initialization
 */
export async function initializeServices(): Promise<void> {
  const container = DIContainer.getInstance();

  console.log('[ServiceRegistry] Starting service initialization...');

  try {
    // Initialize email adapter
    const emailAdapter = container.get<GroqEmailAdapter>('GroqEmailAdapter');
    await emailAdapter.initialize();

    console.log('[ServiceRegistry] ✅ All services initialized successfully');
  } catch (error) {
    console.warn('[ServiceRegistry] ⚠️ Service initialization completed with warnings:', error);
    // Don't throw - the app can work without email generation
  }
}

/**
 * Get the application service (main entry point for UI)
 */
export function getRestockApplicationService(): RestockApplicationService {
  const container = DIContainer.getInstance();
  return container.get<RestockApplicationService>('RestockApplicationService');
}

/**
 * Health check - verify all services are properly registered
 */
export function healthCheck(): { healthy: boolean; issues: string[] } {
  const container = DIContainer.getInstance();
  const requiredServices = [
    'UserContextService',
    'IdGeneratorService', 
    'SupabaseSessionRepository',
    'SupabaseProductRepository',
    'SupabaseSupplierRepository',
    'RestockApplicationService'
  ];

  const issues: string[] = [];

  for (const serviceName of requiredServices) {
    if (!container.has(serviceName)) {
      issues.push(`Missing required service: ${serviceName}`);
    }
  }

  // Test service creation
  try {
    container.get('RestockApplicationService');
  } catch (error) {
    issues.push(`Failed to create RestockApplicationService: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const healthy = issues.length === 0;
  
  console.log('[ServiceRegistry] Health check:', { healthy, issues });
  
  return { healthy, issues };
}
