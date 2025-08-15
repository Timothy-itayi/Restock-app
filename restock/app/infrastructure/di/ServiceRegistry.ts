import { DIContainer } from './Container';
import { 
  IdGeneratorService,
  GroqEmailAdapter
} from '../index';

// Convex repository imports
import { ConvexUserRepository } from '../convex/repositories/ConvexUserRepository';
import { ConvexSessionRepository } from '../convex/repositories/ConvexSessionRepository';
import { ConvexProductRepository } from '../convex/repositories/ConvexProductRepository';
import { ConvexSupplierRepository } from '../convex/repositories/ConvexSupplierRepository';
import { ConvexEmailRepository } from '../convex/repositories/ConvexEmailRepository';

// Convex client (will be injected)
import { ConvexReactClient } from 'convex/react';

export function registerServices(convexClient: ConvexReactClient): void {
  const container = DIContainer.getInstance();

  console.log('[ServiceRegistry] Starting service registration...');

  try {
    // 1. Infrastructure Services (Lowest level)
    container.register('IdGeneratorService', () => {
      return new IdGeneratorService();
    });

    container.register('GroqEmailAdapter', () => {
      return new GroqEmailAdapter();
    });

    // 2. Convex Repository Implementations (Infrastructure layer)
    // These implement domain interfaces but use Convex under the hood
    container.register('SessionRepository', () => {
      return new ConvexSessionRepository(convexClient);
    });

    container.register('ProductRepository', () => {
      return new ConvexProductRepository(convexClient);
    });

    container.register('SupplierRepository', () => {
      return new ConvexSupplierRepository(convexClient);
    });

    container.register('UserRepository', () => {
      return new ConvexUserRepository(convexClient);
    });

    container.register('EmailRepository', () => {
      return new ConvexEmailRepository(convexClient);
    });

    // Note: RestockApplicationService removed - using Convex repositories directly
    // The application layer now gets repositories from the container

    console.log('[ServiceRegistry] ✅ All services registered successfully');
    container.debugServices();

  } catch (error) {
    console.error('[ServiceRegistry] ❌ Failed to register services:', error);
    throw new Error(`Service registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}