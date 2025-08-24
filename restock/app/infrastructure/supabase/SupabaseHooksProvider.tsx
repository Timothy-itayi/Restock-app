import React, { createContext, useContext, useMemo, useEffect, useState, useRef } from "react";
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';
import { registerServices } from "../di/ServiceRegistry";


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
  // 🔒 CRITICAL: Add guard to prevent auth hook usage before provider is ready
  let authState;
  try {
    authState = useUnifiedAuth();
  } catch (error) {
    // Auth provider not ready yet, use fallback values
    console.log('[SupabaseHooksProvider] Auth not ready yet, using fallback values');
    authState = {
      userId: null,
      isAuthenticated: false,
      isReady: false
    };
  }
  
  const { userId, isAuthenticated, isReady } = authState;
  
  const [isUserContextSet, setIsUserContextSet] = useState(false);

  // ✅ CRITICAL: Simplify user context setup
  useEffect(() => {
    if (userId && isSupabaseReady) {
      console.log('[SupabaseHooksProvider] User context ready for:', userId);
      setIsUserContextSet(true);
    } else {
      setIsUserContextSet(false);
    }
  }, [userId, isSupabaseReady]);

  // ✅ CRITICAL: Register services only once
  useEffect(() => {
    try {
      console.log('[SupabaseHooksProvider] Registering Supabase services');
      registerServices();
      console.log('[SupabaseHooksProvider] ✅ Services registered successfully');
    } catch (error) {
      console.error('[SupabaseHooksProvider] ❌ Failed to register services:', error);
    }
  }, []); // Empty dependency array - only run once

  // ✅ CRITICAL: Create repositories only once and stabilize them
  const repositories = useMemo(
    (): RepositoryContextValue => {
      console.log('🔍 SupabaseHooksProvider: Creating repositories for userId:', userId);
      
      const userRepo = new SupabaseUserRepository();
      const sessionRepo = new SupabaseSessionRepository(userId || undefined);
      const productRepo = new SupabaseProductRepository(userId || undefined);
      const supplierRepo = new SupabaseSupplierRepository(userId || undefined);
      const emailRepo = new SupabaseEmailRepository(userId || undefined);
      
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
    [userId, isSupabaseReady, isUserContextSet] // Only recreate when these actually change
  );

  // ✅ CRITICAL: Remove the complex repository userId update effect
  // This was causing repositories to be recreated on every render

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
  
  // CRITICAL: Use useMemo to create stable object without mutating original
  return useMemo(() => {
    // Create new object without mutating the original repository
    const stableRepo = {
      ...context.sessionRepository,
      isReady: context.isSupabaseReady,
      isUserContextSet: context.isUserContextSet
    } as SessionRepository & { isReady: boolean; isUserContextSet: boolean };
    
    return stableRepo;
  }, [context.sessionRepository, context.isSupabaseReady, context.isUserContextSet]);
};

export const useProductRepository = (): ProductRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.productRepository) {
    throw new Error('ProductRepository not available in context');
  }
  
  // CRITICAL: Use useMemo to create stable object without mutating original
  return useMemo(() => {
    const stableRepo = {
      ...context.productRepository,
      isReady: context.isSupabaseReady,
      isUserContextSet: context.isUserContextSet
    } as ProductRepository & { isReady: boolean; isUserContextSet: boolean };
    
    return stableRepo;
  }, [context.productRepository, context.isSupabaseReady, context.isUserContextSet]);
};

export const useSupplierRepository = (): SupplierRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.supplierRepository) {
    throw new Error('SupplierRepository not available in context');
  }
  
  // CRITICAL: Use useMemo to create stable object without mutating original
  return useMemo(() => {
    const stableRepo = {
      ...context.supplierRepository,
      isReady: context.isSupabaseReady,
      isUserContextSet: context.isUserContextSet
    } as SupplierRepository & { isReady: boolean; isUserContextSet: boolean };
    
    return stableRepo;
  }, [context.supplierRepository, context.isSupabaseReady, context.isUserContextSet]);
};

export const useUserRepository = (): UserRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.userRepository) {
    throw new Error('UserRepository not available in context');
  }
  
  // CRITICAL: Use useMemo to create stable object without mutating original
  return useMemo(() => {
    const stableRepo = {
      ...context.userRepository,
      isReady: context.isSupabaseReady,
      isUserContextSet: context.isUserContextSet
    } as UserRepository & { isReady: boolean; isUserContextSet: boolean };
    
    return stableRepo;
  }, [context.userRepository, context.isSupabaseReady, context.isUserContextSet]);
};

export const useEmailRepository = (): EmailRepository & { isReady: boolean; isUserContextSet: boolean } => {
  const context = useRepositories();
  
  if (!context?.emailRepository) {
    throw new Error('EmailRepository not available in context');
  }
  
  // CRITICAL: Use useMemo to create stable object without mutating original
  return useMemo(() => {
    const stableRepo = {
      ...context.emailRepository,
      isReady: context.isSupabaseReady,
      isUserContextSet: context.isUserContextSet
    } as EmailRepository & { isReady: boolean; isUserContextSet: boolean };
    
    return stableRepo;
  }, [context.emailRepository, context.isSupabaseReady, context.isUserContextSet]);
};
