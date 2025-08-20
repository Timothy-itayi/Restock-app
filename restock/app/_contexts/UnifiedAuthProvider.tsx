import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager } from '../../backend/services/session-manager';
import { UserProfileService } from '../../backend/services/user-profile';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { EmailAuthService } from '../../backend/services/email-auth';
import useProfileStore from '../stores/useProfileStore';



interface AuthType {
  type: 'google' | 'email' | null;
  isNewSignUp: boolean;
  needsProfileSetup: boolean;
}

interface UnifiedAuthContextType {
  isReady: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  userId: string | null;
  authType: AuthType;
  triggerAuthCheck: () => void;
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
  const { fetchProfile, setProfileFromData, clearProfile } = useProfileStore();
  
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authType, setAuthType] = useState<AuthType>({
    type: null,
    isNewSignUp: false,
    needsProfileSetup: false
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
        console.log('🔧 UnifiedAuth: Initializing app and clearing auth flags');
        await ClerkClientService.initializeOAuthFlags();
        await EmailAuthService.initializeEmailAuthFlags();
        console.log('✅ UnifiedAuth: Auth flags initialized successfully');
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
        
        // Initialize profile store with user data
        console.log('📊 UnifiedAuth: Initializing profile store');
        await fetchProfile(userId);
        
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
    
    const isGoogle = checkIfGoogleUser(user);
    console.log('🔍 UnifiedAuth: User type detected:', { isGoogle, userId });
    
    // Check if user just completed profile setup (to avoid re-verification)
    const justCompletedSetup = await AsyncStorage.getItem('profileSetupJustCompleted');
    if (justCompletedSetup === 'true') {
      console.log('✅ UnifiedAuth: User just completed profile setup, skipping verification');
      
      // Clear the flag
      await AsyncStorage.removeItem('profileSetupJustCompleted');
      
      // Set auth type for completed setup
      const completedAuthType: AuthType = {
        type: isGoogle ? 'google' : 'email',
        isNewSignUp: false,
        needsProfileSetup: false
      };
      setAuthType(completedAuthType);
      setIsReady(true);
      return;
    }
    
    // SIMPLIFIED: Check if user has a profile - if yes, let them in; if no, send to setup
    console.log('🔍 UnifiedAuth: Checking if user has existing profile...');
    try {
      const profileVerification = await UserProfileService.hasCompletedProfileSetupByClerkId(userId);
      
      if (profileVerification.hasCompletedSetup) {
        console.log('✅ UnifiedAuth: User has existing profile - allowing access to dashboard');
        
        // Clear any lingering sign-up flags
        await AsyncStorage.removeItem('newSSOSignUp');
        await AsyncStorage.removeItem('newTraditionalSignUp');
        
        // Get and set the user profile data
        const profileResult = await UserProfileService.getUserProfileByClerkId(userId);
        if (profileResult.data) {
          setProfileFromData(profileResult.data);
          console.log('📊 UnifiedAuth: Profile data loaded for returning user');
        }
        
        // Set as authenticated user with no setup needed
        const authType: AuthType = {
          type: isGoogle ? 'google' : 'email',
          isNewSignUp: false,
          needsProfileSetup: false
        };
        setAuthType(authType);
        setIsReady(true);
        console.log('✅ UnifiedAuth: Returning user ready for dashboard access');
        return;
        
      } else {
        console.log('⚠️ UnifiedAuth: User has no profile - redirecting to profile setup');
        
        // Check which type of setup flow to use
        const newSSOSignUp = await AsyncStorage.getItem('newSSOSignUp');
        const newTraditionalSignUp = await AsyncStorage.getItem('newTraditionalSignUp');
        const isSSO = newSSOSignUp === 'true';
        const isTraditional = newTraditionalSignUp === 'true';
        
        // Set auth type for new users
        const authType: AuthType = {
          type: isGoogle ? 'google' : 'email',
          isNewSignUp: true,
          needsProfileSetup: true
        };
        setAuthType(authType);
        
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
      
      // If we can't verify, assume they need setup to be safe
      const authType: AuthType = {
        type: isGoogle ? 'google' : 'email',
        isNewSignUp: false,
        needsProfileSetup: true
      };
      setAuthType(authType);
      setIsReady(true);
      return;
    }
  }, [setProfileFromData]);

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
      needsProfileSetup: false
    });
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
        setAuthType({
          type: null,
          isNewSignUp: false,
          needsProfileSetup: false
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

  // Function to mark new user as ready after profile setup completion (works for both SSO and traditional)
  const markNewUserReady = useCallback(async (profileData?: any) => {
    console.log('🔧 UnifiedAuth: Marking new user as ready after profile setup completion');
    
    // Clear both sign-up flags (whichever is set)
    try {
      await AsyncStorage.removeItem('newSSOSignUp');
      await AsyncStorage.removeItem('newTraditionalSignUp');
      console.log('✅ UnifiedAuth: All sign-up flags cleared');
    } catch (error) {
      console.error('❌ UnifiedAuth: Failed to clear sign-up flags:', error);
    }
    
    // Set flag to indicate profile setup was just completed
    try {
      await AsyncStorage.setItem('profileSetupJustCompleted', 'true');
      console.log('✅ UnifiedAuth: profileSetupJustCompleted flag set');
    } catch (error) {
      console.error('❌ UnifiedAuth: Failed to set profileSetupJustCompleted flag:', error);
    }
    
    // Update auth type to reflect profile setup completion
    setAuthType(prev => ({
      ...prev,
      isNewSignUp: false,
      needsProfileSetup: false
    }));
    
    // CRITICAL: Use provided profile data or fetch from database
    try {
      if (profileData) {
        console.log('📊 UnifiedAuth: Using provided profile data for new SSO user');
        setProfileFromData(profileData);
        console.log('✅ UnifiedAuth: Profile data set from RPC response');
      } else if (userId) {
        console.log('📊 UnifiedAuth: No profile data provided, fetching from database');
        await fetchProfile(userId);
        console.log('✅ UnifiedAuth: Profile data loaded from database');
      }
    } catch (profileError) {
      console.warn('⚠️ UnifiedAuth: Failed to load profile data:', profileError);
      // Continue anyway - profile exists in database
    }
    
    // Mark as ready
    setIsReady(true);
    
    // Small delay to ensure state is properly set
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('✅ UnifiedAuth: New user marked as ready');
  }, [userId, fetchProfile, setProfileFromData]);

  // Keep the old function for backward compatibility
  const markNewSSOUserReady = markNewUserReady;

  const value: UnifiedAuthContextType = {
    isReady,
    isAuthenticated: isSignedIn || false,
    isLoading,
    user,
    userId: userId || null,
    authType,
    triggerAuthCheck,
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