// app/auth/UnifiedAuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager, UserSession } from '../../backend/_services/session-manager';
import { useAuth } from '@clerk/clerk-expo';
import { authStore } from './store';
import { RepositoryContext, RepositoryContextValue } from '../../lib/infrastructure/_di/RepositoryContext';
import { SupabaseUserRepository } from '../../backend/_infrastructure/repositories/SupabaseUserRepository';
import { SupabaseSessionRepository } from '../../backend/_infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseProductRepository } from '../../backend/_infrastructure/repositories/SupabaseProductRepository';
import { SupabaseSupplierRepository } from '../../backend/_infrastructure/repositories/SupabaseSupplierRepository';
import { SupabaseEmailRepository } from '../../backend/_infrastructure/repositories/SupabaseEmailRepository';
import { registerServices, clearUserScope } from '../../lib/infrastructure/_di/ServiceRegistry';
import { setClerkTokenGetter } from '../../backend/_config/supabase';

interface UnifiedAuthState {
  isReady: boolean;
  isAuthenticated: boolean;
  isProfileSetupComplete: boolean;
  isLoading: boolean;
  userId: string | null;
  authType: 'google' | 'email' | null;
  isOAuthInProgress: boolean;
  // Profile data
  userName: string;
  storeName: string;
  isProfileLoading: boolean;
  profileError: string | null;
  // Actions that components expect
  triggerAuthCheck: () => Promise<void>;
  markNewUserReady: (profileData: any) => Promise<void>;
  clearAuthFlags: () => Promise<void>;
  // Profile actions
  fetchProfile: (userId: string) => Promise<void>;
  retryProfileLoad: (userId: string) => Promise<void>;
  hasValidProfile: boolean;
  // Clerk token getter for Supabase authentication
  getClerkSupabaseToken: () => Promise<string | null>;
}

const UnifiedAuthContext = createContext<UnifiedAuthState | null>(null);

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  return context;
};

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ CORRECT: Call useAuth at component level
  const { isLoaded, isSignedIn, userId: clerkUserId, getToken } = useAuth();
  
  // Get store reference (but don't subscribe to it) - use getState and setState
  const store = authStore;
  
  // Local state for context value (prevents re-render loops)
  const [contextState, setContextState] = useState<Omit<UnifiedAuthState, 'triggerAuthCheck' | 'markNewUserReady' | 'clearAuthFlags' | 'fetchProfile' | 'retryProfileLoad'>>({
    isReady: false,
    isAuthenticated: false,
    isProfileSetupComplete: false,
    isLoading: true,
    userId: null,
    authType: null,
    isOAuthInProgress: false,
    userName: '',
    storeName: '',
    isProfileLoading: false,
    profileError: null,
    hasValidProfile: false,
    getClerkSupabaseToken: async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        return token;
      } catch (error) {
        console.warn('Failed to get Clerk Supabase token:', error);
        return null;
      }
    },
  });

  // Add this state after your existing contextState
  const [repositories, setRepositories] = useState<RepositoryContextValue | null>(null);

  // Add state to track if repositories are already set up
  const [repositoriesSetup, setRepositoriesSetup] = useState(false);

  // Function to update both local state and store imperatively
  const updateAuthState = useCallback(async () => {
    console.log('🔍 AUTH FLOW: Starting auth state update');
    console.log('📋 CLERK STATE:', { isLoaded, isSignedIn, clerkUserId, userIdType: typeof clerkUserId });
    
    if (!isLoaded) {
      console.log('⏳ AUTH FLOW: Clerk not loaded yet, skipping update');
      return;
    }

    try {
      // Step 1: Get SessionManager data
      const session: UserSession | null = await SessionManager.getUserSession();
      console.log('📋 SESSION MANAGER:', { 
        hasSession: !!session,
        userId: session?.userId,
        email: session?.email,
        storeName: session?.storeName,
        lastAuthMethod: session?.lastAuthMethod,
        wasSignedIn: session?.wasSignedIn
      });

      // Step 2: Check OAuth flags
      const oauthProcessing = await AsyncStorage.getItem('oauthProcessing');
      const isOAuthInProgress = oauthProcessing === 'true';
      console.log('📋 OAUTH FLAGS:', { oauthProcessing, isOAuthInProgress });

      // Step 3: Detect OAuth completion and clear flags if needed
      let shouldClearOAuthFlags = false;
      if (isSignedIn && isOAuthInProgress) {
        console.log('🔍 OAUTH COMPLETION: Clerk signed in while OAuth in progress - clearing flags');
        shouldClearOAuthFlags = true;
      }

      // Clear OAuth flags if OAuth completed
      if (shouldClearOAuthFlags) {
        console.log('🧹 OAUTH CLEANUP: Clearing OAuth processing flags');
        await AsyncStorage.removeItem('oauthProcessing');
        await AsyncStorage.removeItem('justCompletedSSO');
        // Re-read the flags after clearing
        const updatedOauthProcessing = await AsyncStorage.getItem('oauthProcessing');
        const updatedIsOAuthInProgress = updatedOauthProcessing === 'true';
        console.log('✅ OAUTH CLEANUP: Flags cleared', { 
          before: isOAuthInProgress, 
          after: updatedIsOAuthInProgress 
        });
      }

      // Step 4: Calculate final auth state (after potential flag clearing)
      const finalIsOAuthInProgress = shouldClearOAuthFlags ? false : isOAuthInProgress;
      const isAuthenticated = isSignedIn && !finalIsOAuthInProgress;
      const userId = clerkUserId || null;
      const authType = session?.lastAuthMethod || null;
      
      // 🔒 CRITICAL: Profile setup completion requires BOTH authentication AND valid database profile
      // Profile completion should only be determined AFTER database profile fetch completes
      const currentStoreState = store.getState();
      const isProfileCurrentlyLoading = currentStoreState.isProfileLoading;
      
      // Profile setup completion requires: authenticated + has userId + valid database profile + not loading
      const hasValidDatabaseProfile = currentStoreState.hasValidProfile();
      const isProfileSetupComplete = isAuthenticated && userId && !isProfileCurrentlyLoading && hasValidDatabaseProfile;

      console.log('✅ AUTH FLOW: Final calculated state', {
        isAuthenticated,
        userId,
        isProfileSetupComplete,
        authType,
        oauthFlagsCleared: shouldClearOAuthFlags,
        reasoning: {
          clerkSignedIn: isSignedIn,
          oauthInProgress: finalIsOAuthInProgress,
          notInOAuthFlow: !finalIsOAuthInProgress,
          // Show profile completion logic requirements
          isProfileCurrentlyLoading: isProfileCurrentlyLoading,
          hasValidDatabaseProfile: hasValidDatabaseProfile,
          profileSetupRequirements: {
            isAuthenticated: isAuthenticated,
            hasUserId: !!userId,
            notLoading: !isProfileCurrentlyLoading,
            hasValidDbProfile: hasValidDatabaseProfile,
            allRequirementsMet: isAuthenticated && !!userId && !isProfileCurrentlyLoading && hasValidDatabaseProfile
          },
          profileSetupDecision: isProfileSetupComplete ? 'complete' : 'needs_setup_or_auth',
          // Show data sources  
          sessionStoreName: session?.storeName || 'none',
          databaseStoreName: currentStoreState.storeName || 'none',
          databaseUserName: currentStoreState.userName || 'none',
          sessionAuthMethod: session?.lastAuthMethod
        }
      });

      // Update store imperatively (no hooks, no re-renders)
      store.getState().setReady(true);
      store.getState().setAuthenticated(isAuthenticated);
      store.getState().setProfileSetupComplete(isProfileSetupComplete as boolean);
      store.getState().setLoading(false);
      store.getState().setUserId(userId);
      store.getState().setAuthType({
        type: authType,
        isNewSignUp: false,
        needsProfileSetup: !isProfileSetupComplete,
        isBlocked: false,
      });

      // Get current store state for profile data
      const currentState = store.getState();

      // 🔒 CRITICAL: Get the most current profile setup completion status from store
      // This ensures we have the latest value after any store updates
      const currentProfileSetupComplete = currentState.isProfileSetupComplete;

      // Update local context state
      setContextState({
        isReady: true,
        isAuthenticated,
        isProfileSetupComplete: currentProfileSetupComplete,
        isLoading: false,
        userId,
        authType,
        isOAuthInProgress: finalIsOAuthInProgress,
        userName: currentState.userName,
        storeName: currentState.storeName,
        isProfileLoading: currentState.isProfileLoading,
        profileError: currentState.profileError,
        hasValidProfile: currentState.hasValidProfile(),
        getClerkSupabaseToken: async () => {
          try {
            const token = await getToken({ template: 'supabase' });
            return token;
          } catch (error) {
            console.warn('Failed to get Clerk Supabase token:', error);
            return null;
          }
        },
      });

      // Step 5: Handle unauthenticated users with stale cache data
      if (!isAuthenticated && session?.storeName) {
        console.log('⚠️  STALE CACHE: Unauthenticated user has cached session data - clearing stale cache');
        console.log('📋 STALE CACHE DATA:', {
          sessionStoreName: session.storeName,
          sessionEmail: session.email,
          sessionUserId: session.userId,
          isAuthenticated: isAuthenticated,
          clerkUserId: userId
        });
        
        const SessionManager = await import('../../backend/_services/session-manager');
        await SessionManager.SessionManager.clearUserSession();
        console.log('✅ STALE CACHE: Cleared stale session cache for unauthenticated user');
        
        // Note: Don't redirect here, let the normal auth flow handle routing
      }

      // Step 6: Handle profile fetching for authenticated users
      if (isAuthenticated && userId && !currentState.userName && !currentState.storeName && !currentState.isProfileLoading) {
        console.log('🔍 PROFILE FETCH: User authenticated but no profile data, initiating fetch');
        
        // If we have cached session data but no database profile, this indicates stale cache
        if (session?.storeName) {
          console.log('⚠️  CACHE CLEANUP: Detected stale session cache (has storeName but no DB profile)');
          console.log('📋 STALE CACHE DATA:', {
            sessionStoreName: session.storeName,
            sessionEmail: session.email,
            sessionUserId: session.userId
          });
        }
        console.log('📋 PROFILE STATE BEFORE:', {
          userName: currentState.userName,
          storeName: currentState.storeName,
          isProfileLoading: currentState.isProfileLoading,
          hasValidProfile: currentState.hasValidProfile()
        });
        
        // Trigger profile fetch imperatively
        await store.getState().fetchProfile(userId);
        
        // Update context state with new profile data after fetch
        const updatedState = store.getState();
        console.log('📋 PROFILE STATE AFTER:', {
          userName: updatedState.userName,
          storeName: updatedState.storeName,
          isProfileLoading: updatedState.isProfileLoading,
          profileError: updatedState.profileError,
          hasValidProfile: updatedState.hasValidProfile()
        });
        
        // If profile fetch resulted in no valid profile but we had cached session data, clear the stale cache
        if (!updatedState.hasValidProfile() && session?.storeName) {
          console.log('🧹 CACHE CLEANUP: Profile fetch confirms no database profile, clearing stale session cache');
          const SessionManager = await import('../../backend/_services/session-manager');
          await SessionManager.SessionManager.clearReturningUserData();
          console.log('✅ CACHE CLEANUP: Stale session cache cleared');
        }
        
        // Profile fetch complete - AuthRouter will handle routing based on updated state
        if (shouldClearOAuthFlags && isAuthenticated && userId) {
          const hasValidProfile = updatedState.hasValidProfile();
          console.log('✅ PROFILE FETCH COMPLETE: Auth state updated, AuthRouter will handle routing', {
            hasValidProfile,
            userName: updatedState.userName,
            storeName: updatedState.storeName
          });
        }
        
        setContextState(prev => ({
          ...prev,
          userName: updatedState.userName,
          storeName: updatedState.storeName,
          isProfileLoading: updatedState.isProfileLoading,
          profileError: updatedState.profileError,
          hasValidProfile: updatedState.hasValidProfile(),
        }));
      } else {
        console.log('🔍 PROFILE FETCH: Skipping profile fetch', {
          isAuthenticated,
          hasUserId: !!userId,
          hasUserName: !!currentState.userName,
          hasStoreName: !!currentState.storeName,
          isProfileLoading: currentState.isProfileLoading
        });
      }

      // Step 7: Handle post-authentication redirects
      if (shouldClearOAuthFlags && isAuthenticated && userId) {
        console.log('🔍 REDIRECT LOGIC: OAuth completed, checking redirect needs');
        
        // 🔒 CRITICAL: Only redirect if profile loading is complete and we have definitive data
        const finalStoreState = store.getState();
        const hasValidProfile = finalStoreState.hasValidProfile();
        const isProfileLoading = finalStoreState.isProfileLoading;
        
        console.log('📋 REDIRECT DATA:', {
          hasValidProfile,
          isProfileLoading,
          userName: finalStoreState.userName,
          storeName: finalStoreState.storeName,
          canMakeRedirectDecision: !isProfileLoading,
          redirectDecision: isProfileLoading ? 'deferred' : (hasValidProfile ? 'dashboard' : 'profile-setup')
        });
        
        // Log OAuth completion - AuthRouter will handle the actual routing
        if (!isProfileLoading) {
          if (!hasValidProfile) {
            console.log('✅ OAUTH COMPLETE: Database confirms no profile, AuthRouter will handle redirect to setup');
          } else {
            console.log('✅ OAUTH COMPLETE: Database confirms valid profile, AuthRouter will handle redirect to dashboard');
          }
        } else {
          console.log('⏳ OAUTH COMPLETE: Profile still loading, AuthRouter will handle routing after fetch completes');
        }
      } else if (shouldClearOAuthFlags) {
        console.log('🔍 REDIRECT LOGIC: OAuth completed but user not authenticated', {
          isAuthenticated,
          hasUserId: !!userId,
          reason: 'Will retry on next auth state update'
        });
      }

      // Auth context state is ready - AuthRouter will handle all routing decisions
      console.log('✅ AUTH CONTEXT: Auth state ready for routing decisions', {
        isAuthenticated,
        userId: !!userId,
        hasValidProfile: store.getState().hasValidProfile(),
        userName: store.getState().userName,
        storeName: store.getState().storeName
      });

      console.log('✅ AUTH FLOW: Auth state update completed successfully');
    } catch (error) {
      console.error('❌ AUTH FLOW: Error updating auth state:', error);
      setContextState(prev => ({
        ...prev,
        isLoading: false,
        isReady: true,
      }));
    }
  }, [isLoaded, isSignedIn, clerkUserId, store]);

  // Initialize and update auth state when Clerk changes
  useEffect(() => {
    if (isLoaded) {
      console.log('🔧 UnifiedAuthProvider: Clerk state changed, updating auth', {
        isSignedIn,
        hasUserId: !!clerkUserId,
        userIdType: typeof clerkUserId
      });
      updateAuthState();
    }
  }, [isLoaded, isSignedIn, clerkUserId, updateAuthState]);

  // Add this useEffect after your existing useEffect hooks
  useEffect(() => {
    if (contextState.isAuthenticated && contextState.userId && contextState.hasValidProfile && !repositoriesSetup) {
      console.log("[UnifiedAuth] 🔑 Setting up repositories for user", contextState.userId);
      
      try {
        // Use Clerk's official Supabase JWT template
        setClerkTokenGetter(async () => {
          try {
            // Try different token approaches
            console.log('[UnifiedAuth] 🔑 Attempting to get Clerk token...');
            
            // First try: Supabase template
            let token = await getToken({ template: 'supabase' });
            console.log('[UnifiedAuth] 🔑 Supabase template result:', token ? 'Token received' : 'No token');
            
            if (!token) {
              // Second try: No template (default JWT)
              console.log('[UnifiedAuth] 🔑 Trying default JWT...');
              token = await getToken();
              console.log('[UnifiedAuth] 🔑 Default JWT result:', token ? 'Token received' : 'No token');
            }
            
            if (!token) {
              // Third try: Custom claims
              console.log('[UnifiedAuth] 🔑 Trying custom claims...');
              token = await getToken({ 
                template: 'supabase',
                skipCache: true 
              });
              console.log('[UnifiedAuth] 🔑 Custom claims result:', token ? 'Token received' : 'No token');
            }
            
            if (token) {
              // Log token details safely
              console.log('[UnifiedAuth] 🔑 Token details:', {
                length: token.length,
                startsWith: token.substring(0, 20) + '...',
                endsWith: '...' + token.substring(token.length - 20),
                hasThreeParts: token.split('.').length === 3
              });
            }
            
            return token;
          } catch (error) {
            console.error('[UnifiedAuth] 🔑 Error getting token:', error);
            return null;
          }
        });
        
        // Register services first
        registerServices(contextState.userId);
        
        // Then create repository instances
        const repos: RepositoryContextValue = {
          userRepository: new SupabaseUserRepository(),
          sessionRepository: new SupabaseSessionRepository(contextState.userId),
          productRepository: new SupabaseProductRepository(contextState.userId),
          supplierRepository: new SupabaseSupplierRepository(contextState.userId),
          emailRepository: new SupabaseEmailRepository(contextState.userId),
          isSupabaseReady: true,
          isUserContextSet: true,
        };

        // Configure token getters and userId
        console.log('[UnifiedAuth] 🔑 Configuring token getters for repositories...');
        if (repos.sessionRepository && typeof repos.sessionRepository.setClerkTokenGetter === 'function') {
          repos.sessionRepository.setClerkTokenGetter(contextState.getClerkSupabaseToken);
          repos.sessionRepository.setUserId(contextState.userId);
          console.log('[UnifiedAuth] ✅ Configured sessionRepository');
        }
        if (repos.productRepository && typeof repos.productRepository.setClerkTokenGetter === 'function') {
          repos.productRepository.setClerkTokenGetter(contextState.getClerkSupabaseToken);
          repos.productRepository.setUserId(contextState.userId);
          console.log('[UnifiedAuth] ✅ Configured productRepository');
        }
        if (repos.supplierRepository && typeof repos.supplierRepository.setClerkTokenGetter === 'function') {
          repos.supplierRepository.setClerkTokenGetter(contextState.getClerkSupabaseToken);
          repos.supplierRepository.setUserId(contextState.userId);
          console.log('[UnifiedAuth] ✅ Configured supplierRepository');
        }
        if (repos.emailRepository && typeof repos.emailRepository.setClerkTokenGetter === 'function') {
          repos.emailRepository.setClerkTokenGetter(contextState.getClerkSupabaseToken);
          repos.emailRepository.setUserId(contextState.userId);
          console.log('[UnifiedAuth] ✅ Configured emailRepository');
        }

        setRepositories(repos);
        setRepositoriesSetup(true); // Mark as setup to prevent re-running
        console.log("[UnifiedAuth] ✅ Repositories ready for user", contextState.userId);
      } catch (e) {
        console.error("[UnifiedAuth] ❌ Failed to setup repositories", e);
      }
    } else if (!contextState.isAuthenticated || !contextState.userId || !contextState.hasValidProfile) {
      // Clear repositories when auth ends
      if (repositories && contextState.userId) {
        try {
          clearUserScope(contextState.userId);
        } catch (e) {
          console.warn("[UnifiedAuth] ⚠️ Failed to clear services", e);
        }
      }
      setRepositories(null);
      setRepositoriesSetup(false); // Reset setup flag
    }
  }, [contextState.isAuthenticated, contextState.userId, contextState.hasValidProfile, getToken, repositoriesSetup]);

  // Actions for context
  const triggerAuthCheck = useCallback(async () => {
    console.log('🔧 triggerAuthCheck: Refreshing auth state');
    await updateAuthState();
  }, [updateAuthState]);

  const markNewUserReady = useCallback(async (profileData: any) => {
    console.log('🔧 markNewUserReady: Setting profile data', profileData);
    if (profileData) {
      const userName = profileData.name || 'there';
      const storeName = profileData.store_name || '';
      
      // Update store imperatively
      store.getState().setProfileData(userName, storeName);
      
      // Check if profile is now valid and update completion status
      const hasValidProfile = userName && userName !== '' && userName !== 'there' && storeName && storeName !== '';
      if (hasValidProfile) {
        console.log('🔧 markNewUserReady: Profile is now valid, marking as complete');
        store.getState().setProfileSetupComplete(true);
      }
      
      // Update local state
      setContextState(prev => ({
        ...prev,
        userName,
        storeName,
        isProfileSetupComplete: hasValidProfile,
        hasValidProfile,
      }));
      
      console.log('✅ markNewUserReady: Profile data updated', {
        userName,
        storeName,
        hasValidProfile,
        isProfileSetupComplete: hasValidProfile
      });
    }
  }, [store]);

  const clearAuthFlags = useCallback(async () => {
    console.log('🔧 clearAuthFlags: Clearing auth flags');
    await AsyncStorage.removeItem('oauthProcessing');
    await AsyncStorage.removeItem('justCompletedSSO');
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    console.log('🔧 fetchProfile: Fetching profile for user', userId);
    await store.getState().fetchProfile(userId);
    
    // Update local state after fetch
    const updatedState = store.getState();
    setContextState(prev => ({
      ...prev,
      userName: updatedState.userName,
      storeName: updatedState.storeName,
      isProfileLoading: updatedState.isProfileLoading,
      profileError: updatedState.profileError,
      hasValidProfile: updatedState.hasValidProfile(),
    }));
  }, [store]);

  // Context value
  const contextValue: UnifiedAuthState = {
    ...contextState,
    triggerAuthCheck,
    markNewUserReady,
    clearAuthFlags,
    fetchProfile,
    retryProfileLoad: fetchProfile, // Same function
  };

  // 🔍 DEBUG: Log context value to see if getClerkSupabaseToken is included
  console.log('🔑 [UnifiedAuth] Context value check:', {
    hasGetClerkSupabaseToken: !!contextValue.getClerkSupabaseToken,
    getClerkSupabaseTokenType: typeof contextValue.getClerkSupabaseToken,
    contextStateKeys: Object.keys(contextState),
    contextValueKeys: Object.keys(contextValue)
  });

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      <RepositoryContext.Provider value={repositories ?? {
        userRepository: null,
        sessionRepository: null,
        productRepository: null,
        supplierRepository: null,
        emailRepository: null,
        isSupabaseReady: false,
        isUserContextSet: false,
      }}>
        {children}
      </RepositoryContext.Provider>
    </UnifiedAuthContext.Provider>
  );
};