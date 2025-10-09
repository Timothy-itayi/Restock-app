// SupabaseHooksProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';

import { SupabaseUserRepository } from '../../../backend/_infrastructure/repositories/SupabaseUserRepository';
import { SupabaseSessionRepository } from '../../../backend/_infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseProductRepository } from '../../../backend/_infrastructure/repositories/SupabaseProductRepository';
import { SupabaseSupplierRepository } from '../../../backend/_infrastructure/repositories/SupabaseSupplierRepository';
import { SupabaseEmailRepository } from '../../../backend/_infrastructure/repositories/SupabaseEmailRepository';
import { registerServices, clearUserScope } from '../_di/ServiceRegistry';

interface RepositoryContextType {
  userRepository: SupabaseUserRepository;
  sessionRepository: SupabaseSessionRepository;
  productRepository: SupabaseProductRepository;
  supplierRepository: SupabaseSupplierRepository;
  emailRepository: SupabaseEmailRepository;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export const useRepositories = (): RepositoryContextType & { isSupabaseReady: boolean } => {
  const context = useContext(RepositoryContext);
  console.log('[SupabaseHP] 🔍 useRepositories called, context exists:', !!context);

  if (!context) {
    console.log('[SupabaseHP] ⚠️ No context available, returning null repositories');
    return {
      userRepository: null as any,
      sessionRepository: null as any,
      productRepository: null as any,
      supplierRepository: null as any,
      emailRepository: null as any,
      isSupabaseReady: false
    };
  }

  console.log('[SupabaseHP] ✅ Returning repositories from context:', {
    hasSessionRepository: !!context.sessionRepository,
    sessionRepositoryType: context.sessionRepository?.constructor?.name
  });

  return { ...context, isSupabaseReady: true };
};

export const SupabaseHooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[SupabaseHP] 🔄 SupabaseHooksProvider rendered');
  const { userId, isAuthenticated, getClerkSupabaseToken } = useUnifiedAuth();
  const [repos, setRepos] = useState<RepositoryContextType | null>(null);
  console.log('[SupabaseHP] 📋 Auth state:', { userId, isAuthenticated });

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!userId || !isAuthenticated) {
        console.log('[SupabaseHP] No auth, skipping repo init');
        setRepos(null); // Clear repos when not authenticated
        return;
      }

      try {
        console.log('[SupabaseHP] 🔑 Getting token from unified auth...');
        const token = await getClerkSupabaseToken();

        if (!token) {
          console.warn('[SupabaseHP] ⚠️ No token from unified auth');
          setRepos(null);
          return;
        }

        if (!isMounted) return;

        console.log('[SupabaseHP] 🏗️ Creating repository instances...');
        const repositories: RepositoryContextType = {
          userRepository: new SupabaseUserRepository(),
          sessionRepository: new SupabaseSessionRepository(),
          productRepository: new SupabaseProductRepository(),
          supplierRepository: new SupabaseSupplierRepository(),
          emailRepository: new SupabaseEmailRepository(),
        };

        // Configure token getters for repositories that need them
        console.log('[SupabaseHP] 🔑 Configuring token getters...');
        Object.values(repositories).forEach((repo, index) => {
          const repoName = Object.keys(repositories)[index];
          if (repo) {
            console.log(`[SupabaseHP] 🔍 Checking repo ${repoName}:`, {
              hasSetClerkTokenGetter: typeof repo.setClerkTokenGetter === 'function',
              hasSetUserId: typeof repo.setUserId === 'function',
              hasGetAuthenticatedClient: typeof repo.getAuthenticatedClient === 'function',
              repoType: repo.constructor.name
            });

            if (typeof repo.setClerkTokenGetter === 'function') {
              repo.setClerkTokenGetter(getClerkSupabaseToken);
              console.log(`[SupabaseHP] ✅ Configured token getter for ${repoName}`);
            }
            if (typeof repo.setUserId === 'function') {
              repo.setUserId(userId);
              console.log(`[SupabaseHP] ✅ Configured userId for ${repoName}`);
            }
          }
        });
        console.log('[SupabaseHP] ✅ Token getters configured');

        // Save to state for Context consumers
        setRepos(repositories);
        console.log('[SupabaseHP] 💾 Repositories saved to context state');

        // Register in DI for service consumers
        try {
          registerServices(userId, repositories);
          console.log('[SupabaseHP] ✅ Services registered for DI');
        } catch (e) {
          console.error('[SupabaseHP] ❌ Failed to register services with DI', e);
        }
      } catch (error) {
        console.error('[SupabaseHP] ❌ Failed to initialize repositories', error);
        setRepos(null);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (userId) {
        clearUserScope(userId);
        console.log('[SupabaseHP] 🧹 Cleared DI scope on unmount');
      }
    };
  }, [userId, isAuthenticated, getClerkSupabaseToken]);

  // Always render children so unauthenticated flows (e.g., welcome/auth) work.
  // Provide repositories context only when ready.
  if (!repos) {
    return <>{children}</>;
  }

  return (
    <RepositoryContext.Provider value={repos}>
      {children}
    </RepositoryContext.Provider>
  );
};
