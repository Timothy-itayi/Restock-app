import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager } from '../../backend/services/session-manager';
import { UserProfileService } from '../../backend/services/user-profile';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { EmailAuthService } from '../../backend/services/email-auth';
import { registerClerkUser } from '../../backend/config/supabase';
import useProfileStore from '../stores/useProfileStore';



interface AuthType {
  type: 'google' | 'email' | null;
  isNewSignUp: boolean;
  needsProfileSetup: boolean;
  isBlocked: boolean; // 🔒 NEW: Explicit blocked state for unauthorized users
}

interface UnifiedAuthContextType {
  isReady: boolean;
  isProfileSetupComplete: boolean; // 🔒 NEW: Explicit profile setup completion state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  userId: string | null;
  authType: AuthType;
  triggerAuthCheck: () => void;
  clearAuthFlags: () => Promise<void>;
  markNewSSOUserReady: (profileData?: any) => Promise<void>;
  markNewUserReady: (profileData?: any) => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

interface UnifiedAuthProviderProps {
  children: React.ReactNode;
}

export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Zustand store
  const { clearProfile, setProfileFromData } = useProfileStore();
  
  const [isReady, setIsReady] = useState(false);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false); // 🔒 NEW: Explicit profile setup completion state
  const [isLoading, setIsLoading] = useState(true);
  const [authType, setAuthType] = useState<AuthType>({
    type: null,
    isNewSignUp: false,
    needsProfileSetup: false,
    isBlocked: false
  });
  const [hasInitialized, setHasInitialized] = useState(false);
  const [forceCheck, setForceCheck] = useState(0);
  const [loadingStartTime] = useState<number>(Date.now());
  const [minimumLoadingMet, setMinimumLoadingMet] = useState(false);
  
  // Minimum loading time: 1.5 seconds for smooth UX
  const MIN_LOADING_TIME = 1500;

  // Get userId from user object
  const userId = user?.id || null;

  // Initialize auth flags on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔧 UnifiedAuth: Initializing app - NOT clearing auth flags on startup');
        // ❌ REMOVED: Don't clear auth flags on every app startup
        // This was causing returning users to be treated as new users
        // await ClerkClientService.initializeOAuthFlags();
        // await EmailAuthService.initializeEmailAuthFlags();
        console.log('✅ UnifiedAuth: App initialized without clearing auth flags');
      } catch (error) {
        console.error('❌ UnifiedAuth: Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  // Manage minimum loading time
  useEffect(() => {
    console.log('⏰ UnifiedAuth: Starting minimum loading timer', { 
      startTime: loadingStartTime, 
      minTime: MIN_LOADING_TIME 
    });
    
    const timer = setTimeout(() => {
      console.log('⏰ UnifiedAuth: Minimum loading time met', { 
        elapsed: Date.now() - loadingStartTime 
      });
      setMinimumLoadingMet(true);
    }, MIN_LOADING_TIME);

    return () => clearTimeout(timer);
  }, [loadingStartTime, MIN_LOADING_TIME]);

  // Complete loading when both auth is ready and minimum time is met
  useEffect(() => {
    if (isReady && minimumLoadingMet) {
      console.log('⏰ UnifiedAuth: Both ready state and minimum time met, completing loading');
      setIsLoading(false);
    } else if (isReady && !minimumLoadingMet) {
      console.log('⏰ UnifiedAuth: Ready state met but waiting for minimum time', {
        isReady,
        minimumLoadingMet,
        timeRemaining: MIN_LOADING_TIME - (Date.now() - loadingStartTime)
      });
    } else if (!isReady && minimumLoadingMet) {
      console.log('⏰ UnifiedAuth: Minimum time met but not ready yet', {
        isReady,
        minimumLoadingMet,
        authType
      });
    }
  }, [isReady, minimumLoadingMet, loadingStartTime, MIN_LOADING_TIME, authType]);

  // Add debug logging for auth state changes
  useEffect(() => {
    console.log('🔍 UnifiedAuth: Auth state changed:', {
      isReady,
      isLoading,
      authType,
      minimumLoadingMet,
      hasInitialized
    });
  }, [isReady, isLoading, authType, minimumLoadingMet, hasInitialized]);

  // Check if user is a Google user
  const checkIfGoogleUser = (user: any): boolean => {
    if (!user) return false;
    
    console.log('🔍 UnifiedAuth: Checking if Google user:', {
      hasUser: !!user,
      emailAddresses: user?.emailAddresses,
      primaryEmailAddress: user?.primaryEmailAddress,
      externalAccounts: user?.externalAccounts
    });
    
    // First, check if user has OAuth accounts (most reliable method)
    if (user.externalAccounts && Array.isArray(user.externalAccounts)) {
      console.log('🔍 UnifiedAuth: Checking external accounts:', user.externalAccounts);
      const hasGoogleOAuth = user.externalAccounts.some((account: any) => 
        account.provider === 'oauth_google' || account.provider === 'google'
      );
      if (hasGoogleOAuth) {
        console.log('🔍 UnifiedAuth: Detected Google OAuth account');
        return true;
      }
    }
    
    // Fallback: Check if user has Google email domain
    const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
    console.log('🔍 UnifiedAuth: Checking email domain for:', userEmail);
    
    if (!userEmail) {
      console.log('🔍 UnifiedAuth: No email found, returning false');
      return false;
    }
    
    const hasGoogleEmail = user.emailAddresses?.some((email: any) => 
      email.emailAddress?.includes('@gmail.com') || 
      email.emailAddress?.includes('@googlemail.com') ||
      email.emailAddress?.includes('@google.com')
    ) || userEmail.includes('@gmail.com') || userEmail.includes('@googlemail.com') || userEmail.includes('@google.com');
    
    if (hasGoogleEmail) {
      console.log('🔍 UnifiedAuth: Detected Google email domain');
    } else {
      console.log('🔍 UnifiedAuth: No Google email domain detected');
    }
    
    return hasGoogleEmail;
  };

  // Verify user profile setup
  const verifyUserProfile = async (userId: string, user: any, isGoogle: boolean) => {
    try {
      // Use Clerk ID-based verification instead of session-dependent verification
      const profileSetupResult = await UserProfileService.hasCompletedProfileSetupByClerkId(userId);
      
      if (profileSetupResult.hasCompletedSetup) {
        console.log('✅ UnifiedAuth: User has completed profile setup');
        
        // Get the full user profile to update local session
        const profileResult = await UserProfileService.getUserProfileByClerkId(userId);
        const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
        
        await SessionManager.saveUserSession({
          userId,
          email: userEmail || '',
          storeName: profileResult.data?.store_name || '',
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: isGoogle ? 'google' : 'email',
        });
        
        // Profile store will be initialized when screens need the data
        console.log('📊 UnifiedAuth: Profile store will be initialized by screens when needed');
        
        return { success: true, needsSetup: false };
      } else {
        console.log('⚠️ UnifiedAuth: User has not completed profile setup');
        return { success: true, needsSetup: true };
      }
    } catch (error) {
      console.error('❌ UnifiedAuth: Error checking user profile setup:', error);
      return { success: false, needsSetup: true };
    }
  };

  // Handle authenticated user - SIMPLIFIED APPROACH
  const handleAuthenticatedUser = useCallback(async (userId: string, user: any) => {
    console.log('🔍 UnifiedAuth: Handling authenticated user:', { 
      userId, 
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      hasUser: !!user
    });
    
    // 🚀 STEP 1: Register user with Supabase (creates or updates user record)
    try {
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;
      const userName = user?.fullName || user?.firstName || null;
      
      console.log('🔧 UnifiedAuth: Registering user with Supabase:', { userId, userEmail, userName });
      
      const supabaseUserId = await registerClerkUser(
        userId,
        userEmail,
        userName,
        '' // store_name will be set during profile setup
      );
      
      console.log('✅ UnifiedAuth: User registered with Supabase, UUID:', supabaseUserId);
    } catch (error) {
      console.error('❌ UnifiedAuth: Failed to register user with Supabase:', error);
      // Continue with auth flow even if Supabase registration fails
      // This ensures users aren't blocked from accessing the app
    }
    
    const isGoogle = checkIfGoogleUser(user);
    console.log('🔍 UnifiedAuth: User type detected:', { isGoogle, userId });
    
    // Check if user just completed profile setup (to avoid re-verification)
    const justCompletedSetup = await AsyncStorage.getItem('profileSetupJustCompleted');
    if (justCompletedSetup === 'true') {
      console.log('✅ UnifiedAuth: User just completed profile setup, skipping verification');
      
      // Clear the flag
      await AsyncStorage.removeItem('profileSetupJustCompleted');
      
      // 🔧 IMPROVED: Get the stored auth type from when profile setup was completed
      // This is more reliable than trying to detect it again
      const storedAuthType = await AsyncStorage.getItem('completedProfileAuthType');
      const completedAuthType: AuthType = {
        type: storedAuthType === 'google' ? 'google' : 'email',
        isNewSignUp: false,
        needsProfileSetup: false,
        isBlocked: false
      };
      setAuthType(completedAuthType);
      setIsProfileSetupComplete(true); // 🔒 Profile setup is now complete
      setIsReady(true);
      return;
    }
    
        // 🔧 FIXED: Get full profile data during auth verification to prevent skeleton flicker
    console.log('🔍 UnifiedAuth: Getting user profile data via database...');
    try {
      // Get the full profile data to avoid screens needing to fetch it again
      // Get user profile using new Supabase integration
      // The JWT token already provides the user context, so no need to set it manually
      const profileResult = await UserProfileService.getUserProfileByClerkId(userId);
      
      console.log('🔍 UnifiedAuth: Profile result:', {
        hasData: !!profileResult.data,
        data: profileResult.data,
        hasStoreName: !!profileResult.data?.store_name,
        storeName: profileResult.data?.store_name,
        hasName: !!profileResult.data?.name,
        name: profileResult.data?.name
      });
      
      if (profileResult.data && profileResult.data.store_name) {
        console.log('✅ UnifiedAuth: User has completed profile setup - loading data into store');
        
        // Clear any lingering sign-up flags using respective services
        await ClerkClientService.clearSSOSignUpFlags();
        await EmailAuthService.clearTraditionalAuthFlags();
        
        // Load profile data into store to prevent skeleton flicker
        const { setProfileFromData } = useProfileStore.getState();
        setProfileFromData(profileResult.data);
        
        // Update session data for returning user
        const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
        await SessionManager.saveUserSession({
          userId,
          email: userEmail || '',
          storeName: profileResult.data.store_name,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: isGoogle ? 'google' : 'email',
        });
        
        console.log('📊 UnifiedAuth: Profile data loaded and session updated for returning user');
        
        // Set as authenticated user with no setup needed
        const authType: AuthType = {
          type: isGoogle ? 'google' : 'email',
          isNewSignUp: false,
          needsProfileSetup: false,
          isBlocked: false
        };
        setAuthType(authType);
        setIsProfileSetupComplete(true); // 🔒 Profile setup is complete for returning users
        setIsReady(true);
        console.log('✅ UnifiedAuth: Returning user ready for dashboard access');
        return;
        
      } else {
        console.log('⚠️ UnifiedAuth: User profile not found or incomplete - checking for new sign-up flags');
        
        // Fallback: Check which type of setup flow to use using respective services
        const newSSOSignUp = await ClerkClientService.isNewSSOSignUp();
        const newTraditionalSignUp = await EmailAuthService.isNewTraditionalSignUp();
        const isSSO = newSSOSignUp;
        
        // 🔒 CRITICAL SECURITY FIX: Only allow profile setup for confirmed new sign-ups
        if (!newSSOSignUp && !newTraditionalSignUp) {
          console.log('🚨 UnifiedAuth: No profile in DB, not a new sign-up, denying access');
          
          // Set blocked state to prevent app access
          const blockedAuthType: AuthType = {
            type: newSSOSignUp ? 'google' : 'email', // Use sign-up flags for consistency
            isNewSignUp: false,
            needsProfileSetup: false,
            isBlocked: true
          };
          setAuthType(blockedAuthType);
          setIsProfileSetupComplete(false); // 🔒 Blocked users cannot access protected routes
          setIsReady(true);
          
          // Force sign out for unauthorized users
          console.log('🚨 UnifiedAuth: Forcing sign out for unauthorized user');
          await handleUnauthenticatedUser();
          return;
        }
        
        // 🔧 IMPROVED: Use sign-up flags to determine auth type instead of relying on Google detection
        // This is more reliable since the flags are set during the actual sign-up process
        const authTypeForNewUser: AuthType = {
          type: newSSOSignUp ? 'google' : 'email', // Use sign-up flags to determine type
          isNewSignUp: true,
          needsProfileSetup: true,
          isBlocked: false
        };
        setAuthType(authTypeForNewUser);
        
        // 🔒 CRITICAL: Profile setup is NOT complete for new users
        setIsProfileSetupComplete(false);
        
        // Redirect to appropriate profile setup
        const profileSetupRoute = isSSO ? '/sso-profile-setup' : '/auth/traditional/profile-setup';
        console.log(`🚨 UnifiedAuth: Redirecting to ${profileSetupRoute}`);
        
        try {
          const { router } = require('expo-router');
          router.replace(profileSetupRoute);
          setIsReady(true);
          console.log('✅ UnifiedAuth: Redirected to profile setup');
        } catch (error) {
          console.error('❌ UnifiedAuth: Redirect failed:', error);
          setIsReady(true); // Set ready anyway to avoid infinite loading
        }
        return;
      }
    } catch (error) {
      console.error('❌ UnifiedAuth: Error checking profile status:', error);
      
      // 🔒 CRITICAL SECURITY FIX: Don't allow ghost users in if DB check fails
      console.log('🚨 UnifiedAuth: Database check failed, denying access to prevent unauthorized entry');
      
      // Set blocked state to prevent app access
      const blockedAuthType: AuthType = {
        type: isGoogle ? 'google' : 'email',
        isNewSignUp: false,
        needsProfileSetup: false,
        isBlocked: true
      };
      setAuthType(blockedAuthType);
      setIsProfileSetupComplete(false); // 🔒 Blocked users cannot access protected routes
      setIsReady(true);
      
      // Force sign out for unauthorized users
      console.log('🚨 UnifiedAuth: Forcing sign out for unauthorized user due to DB error');
      await handleUnauthenticatedUser();
      return;
    }
  }, []);

  // Handle unauthenticated user
  const handleUnauthenticatedUser = async () => {
    console.log('❌ UnifiedAuth: User is not authenticated');
    
    // Clear user context in database
    // TODO: Implement user context clearing for Supabase RLS policies
    console.log('🔧 UnifiedAuth: User context clearing not yet implemented for Supabase');
    
    // Clear profile store
    clearProfile();
    
    setAuthType({
      type: null,
      isNewSignUp: false,
      needsProfileSetup: false,
      isBlocked: false
    });
    setIsProfileSetupComplete(false); // 🔒 Unauthenticated users cannot access protected routes
    setIsReady(true);
    // Loading will be set to false by the minimum loading time effect
  };

  // Main auth effect
  useEffect(() => {
    console.log('🚨 UnifiedAuth: Main effect triggered!', { 
      isLoaded, 
      isSignedIn, 
      userId, 
      hasInitialized,
      forceCheck,
      user: user ? 'present' : 'null'
    });
    
    // Wait for Clerk to be fully loaded
    if (!isLoaded) {
      console.log('⏳ UnifiedAuth: Waiting for Clerk to load completely');
      return;
    }
    
    // Prevent multiple initializations
    if (hasInitialized && !isSignedIn) {
      console.log('⏳ UnifiedAuth: Already initialized and user is not signed in, skipping');
      return;
    }

    console.log('🚀 UnifiedAuth: Running auth check with delay to prevent race conditions');
    const checkAuth = async () => {
      try {
        // Add a small delay to ensure all Clerk state is settled
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isSignedIn && userId && user) {
          console.log('✅ UnifiedAuth: User is authenticated:', { userId, userEmail: user?.emailAddresses?.[0]?.emailAddress });
          await handleAuthenticatedUser(userId, user);
        } else {
          console.log('❌ UnifiedAuth: User is not authenticated', { isSignedIn, userId: !!userId, user: !!user });
          await handleUnauthenticatedUser();
        }
      } catch (error) {
        console.error('❌ UnifiedAuth: Error in auth check:', error);
        // Set error state but still mark as ready
        setIsReady(true);
        setIsProfileSetupComplete(false); // 🔒 Error state means no access to protected routes
        setAuthType({
          type: null,
          isNewSignUp: false,
          needsProfileSetup: false,
          isBlocked: false
        });
        // Loading will be set to false by the minimum loading time effect
      } finally {
        setHasInitialized(true);
      }
    };

    checkAuth();
  }, [isLoaded, isSignedIn, userId, hasInitialized, forceCheck, user, handleAuthenticatedUser]);

  // Function to manually trigger auth check
  const triggerAuthCheck = () => {
    console.log('🔧 UnifiedAuth: Manually triggering auth check');
    setForceCheck(prev => prev + 1);
  };

  // Function to clear auth flags when user signs out
  const clearAuthFlags = async () => {
    try {
      console.log('🔧 UnifiedAuth: Clearing auth flags on sign out');
      await ClerkClientService.clearSSOSignUpFlags();
      await EmailAuthService.clearTraditionalAuthFlags();
      console.log('✅ UnifiedAuth: Auth flags cleared successfully');
    } catch (error) {
      console.error('❌ UnifiedAuth: Failed to clear auth flags:', error);
    }
  };

  // Function to mark new user as ready after profile setup completion (works for both SSO and traditional)
  const markNewUserReady = useCallback(async (profileData?: any) => {
    console.log('🔧 UnifiedAuth: Marking new user as ready after profile setup completion');
    
    // Clear both sign-up flags (whichever is set) using respective services
    try {
      await ClerkClientService.clearSSOSignUpFlags();
      await EmailAuthService.clearTraditionalAuthFlags();
      console.log('✅ UnifiedAuth: All sign-up flags cleared via respective services');
    } catch (error) {
      console.error('❌ UnifiedAuth: Failed to clear sign-up flags:', error);
    }
    
    // Set flag to indicate profile setup was just completed
    try {
      await AsyncStorage.setItem('profileSetupJustCompleted', 'true');
      console.log('✅ UnifiedAuth: profileSetupJustCompleted flag set');
      
      // 🔧 IMPROVED: Store the current auth type for future reference
      // Use the current authType from component state
      await AsyncStorage.setItem('completedProfileAuthType', authType.type || 'email');
      console.log('✅ UnifiedAuth: completedProfileAuthType stored:', authType.type || 'email');
    } catch (error) {
      console.error('❌ UnifiedAuth: Failed to set profile setup completion flags:', error);
    }
    
    // Update auth type to reflect profile setup completion
    setAuthType(prev => ({
      ...prev,
      isNewSignUp: false,
      needsProfileSetup: false,
      isBlocked: false // 🔒 Clear blocked state when profile setup is complete
    }));
    
    // 🔒 CRITICAL: Profile setup is now complete
    setIsProfileSetupComplete(true);
    
    // 🔧 FIXED: Don't load profile data into store here to avoid skeleton flicker
    // Let the actual screens handle profile data loading when needed
    console.log('📊 UnifiedAuth: Profile data will be loaded by screens when needed');
    
    // Mark as ready
    setIsReady(true);
    
    // Small delay to ensure state is properly set
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('✅ UnifiedAuth: New user marked as ready');
  }, [userId]);

  // Keep the old function for backward compatibility
  const markNewSSOUserReady = markNewUserReady;

  const value: UnifiedAuthContextType = {
    isReady,
    isProfileSetupComplete, // 🔒 Use the actual state variable
    isAuthenticated: isSignedIn || false,
    isLoading,
    user,
    userId: userId || null,
    authType,
    triggerAuthCheck,
    clearAuthFlags,
    markNewSSOUserReady, // Backward compatibility
    markNewUserReady, // New generic function
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export default UnifiedAuthProvider; 