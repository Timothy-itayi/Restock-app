/**
 * SERVICE HOOK
 * 
 * React hook for accessing services from the DI container
 * Provides clean interface between React components and business logic
 */

import { DIContainer } from '../../../infrastructure/di/Container';
import type { RestockApplicationService } from '../../../application/interfaces/RestockApplicationService';
import { UserContextService } from '../../../infrastructure/services/UserContextService';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

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
  const { userId } = useAuth();
  const [isContextReady, setIsContextReady] = useState(false);
  const [service, setService] = useState<RestockApplicationService | null>(null);
  
  // Ensure user context is set before returning the service
  useEffect(() => {
    const ensureUserContext = async () => {
      if (!userId) return;
      
      try {
        const container = DIContainer.getInstance();
        if (container.has('UserContextService')) {
          const userContextService = container.get<UserContextService>('UserContextService');
          // Check if context is already set
          if (!userContextService.isContextSet()) {
            console.log('[useService] Setting user context for service access');
            await userContextService.setUserContext(userId);
          }
          setIsContextReady(true);
          
          // Now get the actual service
          if (container.has('RestockApplicationService')) {
            const appService = container.get<RestockApplicationService>('RestockApplicationService');
            setService(appService);
          } else {
            console.error('[useService] RestockApplicationService not found in container');
          }
        } else {
          console.warn('[useService] UserContextService not available');
          setIsContextReady(true); // Continue anyway
          
          // Try to get service anyway
          if (container.has('RestockApplicationService')) {
            const appService = container.get<RestockApplicationService>('RestockApplicationService');
            setService(appService);
          }
        }
      } catch (error) {
        console.error('[useService] Failed to set user context:', error);
        setIsContextReady(true); // Continue anyway
        
        // Try to get service anyway
        try {
          const container = DIContainer.getInstance();
          if (container.has('RestockApplicationService')) {
            const appService = container.get<RestockApplicationService>('RestockApplicationService');
            setService(appService);
          }
        } catch (serviceError) {
          console.error('[useService] Failed to get service after context error:', serviceError);
        }
      }
    };
    
    ensureUserContext();
  }, [userId]);
  
  // Return the actual service once it's available
  if (!service) {
    // Return a mock service that will be replaced once the real service is ready
    // This prevents the component from crashing during initialization
    return {
      getSessions: async () => ({ success: false, error: 'Service not ready yet' }),
      createSession: async () => ({ success: false, error: 'Service not ready yet' }),
      deleteSession: async () => ({ success: false, error: 'Service not ready yet' }),
      addItem: async () => ({ success: false, error: 'Service not ready yet' }),
      removeProduct: async () => ({ success: false, error: 'Service not ready yet' }),
      updateSessionName: async () => ({ success: false, error: 'Service not ready yet' }),
      getSession: async () => ({ success: false, error: 'Service not ready yet' }),
      addProduct: async () => ({ success: false, error: 'Service not ready yet' }),
      updateProduct: async () => ({ success: false, error: 'Service not ready yet' }),
      setSessionName: async () => ({ success: false, error: 'Service not ready yet' }),
      generateEmails: async () => ({ success: false, error: 'Service not ready yet' }),
      markAsSent: async () => ({ success: false, error: 'Service not ready yet' }),
      getSessionSummary: async () => ({ success: false, error: 'Service not ready yet' })
    } as RestockApplicationService;
  }
  
  return service;
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
