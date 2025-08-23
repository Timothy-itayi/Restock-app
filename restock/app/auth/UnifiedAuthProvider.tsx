// app/auth/UnifiedAuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager, UserSession } from '../../backend/services/session-manager';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { authStore } from './store';

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
}

const UnifiedAuthContext = createContext<UnifiedAuthState | null>(null);

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  return context;
};

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use Clerk's useAuth hook instead of useClerk
  const { isLoaded, isSignedIn, userId: clerkUserId } = useAuth();
  
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
  });

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
      store.getState().setProfileSetupComplete(isProfileSetupComplete);
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

      // Update local context state
      setContextState({
        isReady: true,
        isAuthenticated,
        isProfileSetupComplete,
        isLoading: false,
        userId,
        authType,
        isOAuthInProgress: finalIsOAuthInProgress,
        userName: currentState.userName,
        storeName: currentState.storeName,
        isProfileLoading: currentState.isProfileLoading,
        profileError: currentState.profileError,
        hasValidProfile: currentState.hasValidProfile(),
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
        
        const SessionManager = await import('../../backend/services/session-manager');
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
          const SessionManager = await import('../../backend/services/session-manager');
          await SessionManager.SessionManager.clearReturningUserData();
          console.log('✅ CACHE CLEANUP: Stale session cache cleared');
        }
        
        // After profile fetch completes, check if we need to redirect (handles deferred redirects)
        if (shouldClearOAuthFlags && isAuthenticated && userId) {
          const hasValidProfile = updatedState.hasValidProfile();
          console.log('🔄 REDIRECT RETRY: Profile fetch complete, checking for deferred redirect', {
            hasValidProfile,
            shouldRedirect: true
          });
          
          if (!hasValidProfile) {
            console.log('🚀 REDIRECT RETRY: Redirecting to profile setup after profile fetch completion');
            setTimeout(() => {
              router.replace('/sso-profile-setup');
            }, 200);
          } else {
            console.log('🚀 REDIRECT RETRY: Redirecting to dashboard after profile fetch completion');
            setTimeout(() => {
              router.replace('/(tabs)/dashboard');
            }, 200);
          }
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
        
        // Only make redirect decision if profile loading is complete - NO EARLY REDIRECTS
        if (!isProfileLoading) {
          if (!hasValidProfile) {
            console.log('🚀 REDIRECT: Database confirms no profile, redirecting to SSO profile setup');
            setTimeout(() => {
              router.replace('/sso-profile-setup');
            }, 100);
          } else {
            console.log('🚀 REDIRECT: Database confirms valid profile, redirecting to dashboard');
            setTimeout(() => {
              router.replace('/(tabs)/dashboard');
            }, 100);
          }
        } else {
          console.log('⏳ REDIRECT: Profile still loading, no redirect decision made - will retry after fetch');
        }
      } else if (shouldClearOAuthFlags) {
        console.log('🔍 REDIRECT LOGIC: OAuth completed but user not authenticated', {
          isAuthenticated,
          hasUserId: !!userId,
          reason: 'Will retry on next auth state update'
        });
      }

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

  // Actions for context
  const triggerAuthCheck = useCallback(async () => {
    console.log('🔧 triggerAuthCheck: Refreshing auth state');
    await updateAuthState();
  }, [updateAuthState]);

  const markNewUserReady = useCallback(async (profileData: any) => {
    console.log('🔧 markNewUserReady: Setting profile data', profileData);
    if (profileData) {
      // Update store imperatively
      store.getState().setProfileData(
        profileData.name || 'there',
        profileData.store_name || ''
      );
      
      // Update local state
      setContextState(prev => ({
        ...prev,
        userName: profileData.name || 'there',
        storeName: profileData.store_name || '',
      }));
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

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};