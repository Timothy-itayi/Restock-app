import React, { createContext, useContext, useMemo, useEffect, useState } from "react";
import { registerServices } from "../di/ServiceRegistry";
import { useAuth } from '@clerk/clerk-expo';

// Supabase repository imports - FIXED: using correct backend path
import { SupabaseUserRepository } from "../../../backend/infrastructure/repositories/SupabaseUserRepository";
import { SupabaseSessionRepository } from "../../../backend/infrastructure/repositories/SupabaseSessionRepository";
import { SupabaseProductRepository } from "../../../backend/infrastructure/repositories/SupabaseProductRepository";
import { SupabaseSupplierRepository } from "../../../backend/infrastructure/repositories/SupabaseSupplierRepository";
import { SupabaseEmailRepository } from "../../../backend/infrastructure/repositories/SupabaseEmailRepository";

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
  isUserContextSet: boolean;
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
  const { userId } = useAuth();
  const [isUserContextSet, setIsUserContextSet] = useState(false);

  // Set user context in Supabase when userId changes
  useEffect(() => {
    const setUserContext = async () => {
      if (userId && isSupabaseReady) {
        try {
          console.log('[SupabaseHooksProvider] Setting user context for:', userId);
          const { setCurrentUserContext } = await import('../../../backend/config/supabase');
          await setCurrentUserContext(userId);
          setIsUserContextSet(true);
          console.log('[SupabaseHooksProvider] ✅ User context set successfully');
        } catch (error) {
          console.error('[SupabaseHooksProvider] ❌ Failed to set user context:', error);
          setIsUserContextSet(false);
        }
      } else {
        setIsUserContextSet(false);
      }
    };

    setUserContext();
  }, [userId, isSupabaseReady]);

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
        isSupabaseReady,
        isUserContextSet,
        userId
      });
      
      const userRepo = new SupabaseUserRepository();
      const sessionRepo = new SupabaseSessionRepository(userId || undefined);
      const productRepo = new SupabaseProductRepository(userId || undefined);
      const supplierRepo = new SupabaseSupplierRepository(userId || undefined);
      const emailRepo = new SupabaseEmailRepository(userId || undefined);
      
      console.log('🔍 SupabaseHooksProvider: UserRepository created', {
        hasUserRepo: !!userRepo,
        userRepoKeys: userRepo ? Object.keys(userRepo) : 'null',
        hasCreateProfile: !!userRepo?.createProfile,
        createProfileType: typeof userRepo?.createProfile
      });
      
      return {
        userRepository: userRepo,
        sessionRepository: sessionRepo,
        productRepository: productRepo,
        supplierRepository: supplierRepo,
        emailRepository: emailRepo,
        isSupabaseReady,
        isUserContextSet,
      };
    },
    [isSupabaseReady, isUserContextSet, userId]
  );

  // Update repository userId when it changes
  useEffect(() => {
    if (repositories.sessionRepository && userId) {
      (repositories.sessionRepository as any).setUserId?.(userId);
    }
    if (repositories.productRepository && userId) {
      (repositories.productRepository as any).setUserId?.(userId);
    }
    if (repositories.supplierRepository && userId) {
      (repositories.supplierRepository as any).setUserId?.(userId);
    }
    if (repositories.emailRepository && userId) {
      (repositories.emailRepository as any).setUserId?.(userId);
    }
  }, [repositories.sessionRepository, repositories.productRepository, repositories.supplierRepository, repositories.emailRepository, userId]);

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
export const useSessionRepository = (): SessionRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.sessionRepository) {
    throw new Error('SessionRepository not available in context');
  }
  
  // Return repository with ready state and user context status
  // Don't spread the object to preserve method bindings
  return Object.assign(context.sessionRepository, {
    isReady: context.isSupabaseReady,
    isUserContextSet: context.isUserContextSet
  }) as SessionRepository & { isReady: boolean; isUserContextSet: boolean };
};

export const useProductRepository = (): ProductRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.productRepository) {
    throw new Error('ProductRepository not available in context');
  }
  
  // Return repository with ready state and user context status
  // Don't spread the object to preserve method bindings
  return Object.assign(context.productRepository, {
    isReady: context.isSupabaseReady,
    isUserContextSet: context.isUserContextSet
  }) as ProductRepository & { isReady: boolean; isUserContextSet: boolean };
};

export const useSupplierRepository = (): SupplierRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.supplierRepository) {
    throw new Error('SupplierRepository not available in context');
  }
  
  // Return repository with ready state and user context status
  // Don't spread the object to preserve method bindings
  return Object.assign(context.supplierRepository, {
    isReady: context.isSupabaseReady,
    isUserContextSet: context.isUserContextSet
  }) as SupplierRepository & { isReady: boolean; isUserContextSet: boolean };
};

export const useUserRepository = (): UserRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.userRepository) {
    throw new Error('UserRepository not available in context');
  }
  
  // Return repository with ready state and user context status
  // Don't spread the object to preserve method bindings
  return Object.assign(context.userRepository, {
    isReady: context.isSupabaseReady,
    isUserContextSet: context.isUserContextSet
  }) as UserRepository & { isReady: boolean; isUserContextSet: boolean };
};

export const useEmailRepository = (): EmailRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.emailRepository) {
    throw new Error('EmailRepository not available in context');
  }
  
  // Return repository with ready state and user context status
  // Don't spread the object to preserve method bindings
  return Object.assign(context.emailRepository, {
    isReady: context.isSupabaseReady,
    isUserContextSet: context.isUserContextSet
  }) as EmailRepository & { isReady: boolean; isUserContextSet: boolean };
};
