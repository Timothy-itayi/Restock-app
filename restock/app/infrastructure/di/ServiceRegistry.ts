// ServiceRegistry.ts
import { DIContainer } from './Container';
import { IdGeneratorService, GroqEmailAdapter } from '../index';
import type {
  SupabaseUserRepository,
  SupabaseSessionRepository,
  SupabaseProductRepository,
  SupabaseSupplierRepository,
  SupabaseEmailRepository,
} from '../../../backend/infrastructure/repositories';

// Explicit interface so we can pass in the fully-configured repos
export interface ConfiguredRepositories {
  userRepository: SupabaseUserRepository;
  sessionRepository: SupabaseSessionRepository;
  productRepository: SupabaseProductRepository;
  supplierRepository: SupabaseSupplierRepository;
  emailRepository: SupabaseEmailRepository;
}

/**
 * Register services for a specific user/session scope
 * This version reuses the *already configured* repository instances
 */
export function registerServices(
  userId: string,
  repos?: ConfiguredRepositories
): void {
  const container = DIContainer.getInstance();
  const scope = `session:${userId}`;

  console.log(`[ServiceRegistry] Registering services for scope: ${scope}`);

  try {
    // 1. Core services
    container.register('IdGeneratorService', () => new IdGeneratorService(), {
      scope,
    });
    container.register('GroqEmailAdapter', () => new GroqEmailAdapter(), {
      scope,
    });

    // 2. Preconfigured Supabase repositories
    container.registerInstance('UserRepository', repos?.userRepository, {
      scope,
    });
    container.registerInstance('SessionRepository', repos?.sessionRepository, {
      scope,
    });
    container.registerInstance('ProductRepository', repos?.productRepository, {
      scope,
    });
    container.registerInstance('SupplierRepository', repos?.supplierRepository, {
      scope,
    });
    container.registerInstance('EmailRepository', repos?.emailRepository, {
      scope,
    });

    console.log(`[ServiceRegistry] ✅ All services registered for scope: ${scope}`);
    container.debugServices();
  } catch (error) {
    console.error(
      `[ServiceRegistry] ❌ Failed to register services for scope: ${scope}`,
      error
    );
    throw new Error(
      `Service registration failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Clear all services for a user/session
 */
export function clearUserScope(userId: string) {
  const container = DIContainer.getInstance();
  container.clearScope(`session:${userId}`);
}
