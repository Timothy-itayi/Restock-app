import { DIContainer } from './Container';
import { 
  IdGeneratorService,
  GroqEmailAdapter
} from '../index';

// Supabase repository imports
import { SupabaseUserRepository } from '../../../backend/infrastructure/repositories/SupabaseUserRepository';
import { SupabaseSessionRepository } from '../../../backend/infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseProductRepository } from '../../../backend/infrastructure/repositories/SupabaseProductRepository';
import { SupabaseSupplierRepository } from '../../../backend/infrastructure/repositories/SupabaseSupplierRepository';
import { SupabaseEmailRepository } from '../../../backend/infrastructure/repositories/SupabaseEmailRepository';

export function registerServices(): void {
  const container = DIContainer.getInstance();

  console.log('[ServiceRegistry] Starting Supabase service registration...');

  try {
    // 1. Infrastructure Services (Lowest level)
    container.register('IdGeneratorService', () => {
      return new IdGeneratorService();
    });

    container.register('GroqEmailAdapter', () => {
      return new GroqEmailAdapter();
    });

    // 2. Supabase Repository Implementations (Infrastructure layer)
    // These implement domain interfaces but use Supabase under the hood
    container.register('SessionRepository', () => {
      return new SupabaseSessionRepository();
    });

    container.register('ProductRepository', () => {
      return new SupabaseProductRepository();
    });

    container.register('SupplierRepository', () => {
      return new SupabaseSupplierRepository();
    });

    container.register('UserRepository', () => {
      return new SupabaseUserRepository();
    });

    container.register('EmailRepository', () => {
      return new SupabaseEmailRepository();
    });

    // Note: RestockApplicationService removed - using Supabase repositories directly
    // The application layer now gets repositories from the container

    console.log('[ServiceRegistry] ✅ All Supabase services registered successfully');
    container.debugServices();

  } catch (error) {
    console.error('[ServiceRegistry] ❌ Failed to register services:', error);
    throw new Error(`Service registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}