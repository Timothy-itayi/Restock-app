import { DIContainer } from './Container';
import { IdGeneratorService, GroqEmailAdapter } from '../index';
import { SupabaseUserRepository } from '../../../backend/infrastructure/repositories/SupabaseUserRepository';
import { SupabaseSessionRepository } from '../../../backend/infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseProductRepository } from '../../../backend/infrastructure/repositories/SupabaseProductRepository';
import { SupabaseSupplierRepository } from '../../../backend/infrastructure/repositories/SupabaseSupplierRepository';
import { SupabaseEmailRepository } from '../../../backend/infrastructure/repositories/SupabaseEmailRepository';

/**
 * Register services for a specific user/session scope
 */
export function registerServices(userId: string): void {
  const container = DIContainer.getInstance();
  const scope = `session:${userId}`;

  console.log(`[ServiceRegistry] Registering services for scope: ${scope}`);

  try {
    // 1. Infrastructure
    container.register('IdGeneratorService', () => new IdGeneratorService(), { scope });
    container.register('GroqEmailAdapter', () => new GroqEmailAdapter(), { scope });

    // 2. Supabase Repositories
    container.register('UserRepository', () => new SupabaseUserRepository(), { scope });
    container.register('SessionRepository', () => new SupabaseSessionRepository(), { scope });
    container.register('ProductRepository', () => new SupabaseProductRepository(), { scope });
    container.register('SupplierRepository', () => new SupabaseSupplierRepository(), { scope });
    container.register('EmailRepository', () => new SupabaseEmailRepository(), { scope });

    console.log(`[ServiceRegistry] ✅ All services registered for scope: ${scope}`);
    container.debugServices();
  } catch (error) {
    console.error(`[ServiceRegistry] ❌ Failed to register services for scope: ${scope}`, error);
    throw new Error(`Service registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clear all services for a user/session
 */
export function clearUserScope(userId: string) {
  const container = DIContainer.getInstance();
  container.clearScope(`session:${userId}`);
}
