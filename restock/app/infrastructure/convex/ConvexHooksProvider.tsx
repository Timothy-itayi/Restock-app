import React, { createContext, useContext, useMemo, useEffect } from "react";
import { ConvexReactClient } from "convex/react";
import { registerServices } from "../di/ServiceRegistry";

// Repository imports
import { ConvexUserRepository } from "../../infrastructure/convex/repositories/ConvexUserRepository";
import { ConvexSessionRepository } from "../../infrastructure/convex/repositories/ConvexSessionRepository";
import { ConvexProductRepository } from "../../infrastructure/convex/repositories/ConvexProductRepository";
import { ConvexSupplierRepository } from "../../infrastructure/convex/repositories/ConvexSupplierRepository";
import { ConvexEmailRepository } from "../../infrastructure/convex/repositories/ConvexEmailRepository";

// Domain interfaces
import { 
  SessionRepository, 
  ProductRepository, 
  SupplierRepository,
  EmailRepository,
  UserRepository
} from "../../domain/interfaces";

// Note: Convex client is now created in ConvexProvider and passed via context
// This ensures we use the same authenticated client instance

/**
 * Repository Context Interface
 * 
 * This maintains the repository pattern while using Convex under the hood
 * UI components depend on these interfaces, not Convex directly
 */
interface RepositoryContextValue {
  userRepository: ConvexUserRepository;
  sessionRepository: SessionRepository;
  productRepository: ProductRepository;
  supplierRepository: SupplierRepository;
  emailRepository: EmailRepository;
  isConvexReady: boolean;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

/**
 * ConvexHooksProvider
 * 
 * Provides repository instances that implement domain interfaces
 * Convex is completely hidden in the infrastructure layer
 * UI components only see repository interfaces
 */
export const ConvexHooksProvider: React.FC<{ 
  children: React.ReactNode;
  convexClient: ConvexReactClient;
  isConvexReady: boolean;
}> = ({ children, convexClient, isConvexReady }) => {
  // Register services with the authenticated ConvexClient
  useEffect(() => {
    try {
      console.log('[ConvexHooksProvider] Registering services with authenticated ConvexClient');
      registerServices(convexClient);
      console.log('[ConvexHooksProvider] ✅ Services registered successfully');
    } catch (error) {
      console.error('[ConvexHooksProvider] ❌ Failed to register services:', error);
    }
  }, [convexClient]);

  const repositories = useMemo(
    (): RepositoryContextValue => {
      console.log('🔍 ConvexHooksProvider: Creating repositories', {
        hasConvexClient: !!convexClient,
        isConvexReady,
        convexClientType: typeof convexClient
      });
      
      const userRepo = new ConvexUserRepository(convexClient);
      console.log('🔍 ConvexHooksProvider: UserRepository created', {
        hasUserRepo: !!userRepo,
        userRepoKeys: userRepo ? Object.keys(userRepo) : 'null',
        hasCreateProfile: !!userRepo?.createProfile,
        createProfileType: typeof userRepo?.createProfile
      });
      
      return {
        userRepository: userRepo,
        sessionRepository: new ConvexSessionRepository(convexClient),
        productRepository: new ConvexProductRepository(convexClient),
        supplierRepository: new ConvexSupplierRepository(convexClient),
        emailRepository: new ConvexEmailRepository(convexClient),
        isConvexReady,
      };
    },
    [convexClient, isConvexReady]
  );

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
};

/**
 * useRepositories Hook
 * 
 * Provides access to repository instances that implement domain interfaces
 * Maintains clean architecture - UI depends on abstractions, not implementations
 */
export const useRepositories = (): RepositoryContextValue => {
  const ctx = useContext(RepositoryContext);
  if (!ctx) {
    throw new Error("useRepositories must be used within ConvexHooksProvider");
  }
  return ctx;
};

/**
 * Individual Repository Hooks
 * 
 * These provide type-safe access to specific repositories
 * They maintain the repository pattern while using Convex under the hood
 */
export const useSessionRepository = (): SessionRepository => {
  const { sessionRepository } = useRepositories();
  return sessionRepository;
};

export const useProductRepository = (): ProductRepository => {
  const { productRepository } = useRepositories();
  return productRepository;
};

export const useSupplierRepository = (): SupplierRepository => {
  const { supplierRepository } = useRepositories();
  return supplierRepository;
};

export const useUserRepository = (): UserRepository & { isReady: boolean } => {
  const context = useRepositories();
  
  if (!context?.userRepository) {
    throw new Error('UserRepository not available in context');
  }
  
  // Return repository with ready state
  return {
    ...context.userRepository,
    isReady: context.isConvexReady
  };
};

export const useEmailRepository = (): EmailRepository => {
  const { emailRepository } = useRepositories();
  return emailRepository;
};
