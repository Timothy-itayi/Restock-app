import React, { createContext, useContext, useMemo, useEffect } from "react";
import { registerServices } from "../di/ServiceRegistry";

// Supabase repository imports
import { SupabaseUserRepository } from "../../../infrastructure/repositories/SupabaseUserRepository";
import { SupabaseSessionRepository } from "../../../infrastructure/repositories/SupabaseSessionRepository";
import { SupabaseProductRepository } from "../../../infrastructure/repositories/SupabaseProductRepository";
import { SupabaseSupplierRepository } from "../../../infrastructure/repositories/SupabaseSupplierRepository";
import { SupabaseEmailRepository } from "../../../infrastructure/repositories/SupabaseEmailRepository";

// Domain interfaces
import { 
  SessionRepository, 
  ProductRepository, 
  SupplierRepository,
  EmailRepository,
  UserRepository
} from "../../domain/interfaces";

/**
 * Repository Context Interface
 * 
 * This maintains the repository pattern while using Supabase under the hood
 * UI components depend on these interfaces, not Supabase directly
 */
interface RepositoryContextValue {
  userRepository: SupabaseUserRepository;
  sessionRepository: SessionRepository;
  productRepository: ProductRepository;
  supplierRepository: SupplierRepository;
  emailRepository: EmailRepository;
  isSupabaseReady: boolean;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

/**
 * SupabaseHooksProvider
 * 
 * Provides repository instances that implement domain interfaces
 * Supabase is completely hidden in the infrastructure layer
 * UI components only see repository interfaces
 */
export const SupabaseHooksProvider: React.FC<{ 
  children: React.ReactNode;
  isSupabaseReady?: boolean;
}> = ({ children, isSupabaseReady = true }) => {
  // Register services with Supabase
  useEffect(() => {
    try {
      console.log('[SupabaseHooksProvider] Registering Supabase services');
      registerServices();
      console.log('[SupabaseHooksProvider] ✅ Services registered successfully');
    } catch (error) {
      console.error('[SupabaseHooksProvider] ❌ Failed to register services:', error);
    }
  }, []);

  const repositories = useMemo(
    (): RepositoryContextValue => {
      console.log('🔍 SupabaseHooksProvider: Creating repositories', {
        isSupabaseReady
      });
      
      const userRepo = new SupabaseUserRepository();
      console.log('🔍 SupabaseHooksProvider: UserRepository created', {
        hasUserRepo: !!userRepo,
        userRepoKeys: userRepo ? Object.keys(userRepo) : 'null',
        hasCreateProfile: !!userRepo?.createProfile,
        createProfileType: typeof userRepo?.createProfile
      });
      
      return {
        userRepository: userRepo,
        sessionRepository: new SupabaseSessionRepository(),
        productRepository: new SupabaseProductRepository(),
        supplierRepository: new SupabaseSupplierRepository(),
        emailRepository: new SupabaseEmailRepository(),
        isSupabaseReady,
      };
    },
    [isSupabaseReady]
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
    throw new Error("useRepositories must be used within SupabaseHooksProvider");
  }
  return ctx;
};

/**
 * Individual Repository Hooks
 * 
 * These provide type-safe access to specific repositories
 * They maintain the repository pattern while using Supabase under the hood
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
    isReady: context.isSupabaseReady
  } as UserRepository & { isReady: boolean };
};

export const useEmailRepository = (): EmailRepository => {
  const { emailRepository } = useRepositories();
  return emailRepository;
};
