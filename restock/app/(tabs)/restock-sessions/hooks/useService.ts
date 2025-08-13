/**
 * SERVICE HOOK
 * 
 * React hook for accessing services from the DI container
 * Provides clean interface between React components and business logic
 */

import { DIContainer } from '../../../infrastructure/di/Container';
import type { RestockApplicationService } from '../../../application/interfaces/RestockApplicationService';

/**
 * Generic hook for accessing any service from the DI container
 */
export function useService<T>(serviceKey: string): T {
  const container = DIContainer.getInstance();
  
  try {
    return container.get<T>(serviceKey);
  } catch (error) {
    console.error(`[useService] Failed to get service '${serviceKey}':`, error);
    throw error;
  }
}

/**
 * Typed hook for accessing the main application service
 * This is the primary interface between UI and business logic
 */
export function useRestockApplicationService(): RestockApplicationService {
  return useService<RestockApplicationService>('RestockApplicationService');
}

/**
 * Hook for checking if services are properly initialized
 */
export function useServiceHealth(): { 
  isHealthy: boolean; 
  issues: string[];
  checkHealth: () => void;
} {
  const container = DIContainer.getInstance();
  
  const checkHealth = () => {
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

    return {
      isHealthy: issues.length === 0,
      issues
    };
  };

  const health = checkHealth();

  return {
    ...health,
    checkHealth: () => checkHealth()
  };
}
