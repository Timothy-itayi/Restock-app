import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager } from '../../backend/services/session-manager';
import { UserProfileService } from '../../backend/services/user-profile';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { EmailAuthService } from '../../backend/services/email-auth';

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
    if (minimumLoadingMet && isReady && isLoading) {
      console.log('⏰ UnifiedAuth: Both conditions met, completing loading', {
        minimumLoadingMet,
        isReady,
        isLoading
      });
      setIsLoading(false);
    }
  }, [minimumLoadingMet, isReady, isLoading]);

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
      const profileSetupResult = await UserProfileService.hasCompletedProfileSetup(userId);
      
      if (profileSetupResult.hasCompletedSetup) {
        console.log('✅ UnifiedAuth: User has completed profile setup');
        
        // Get the full user profile to update local session
        const profileResult = await UserProfileService.getUserProfile(userId);
        const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
        
        await SessionManager.saveUserSession({
          userId,
          email: userEmail || '',
          storeName: profileResult.data?.store_name || '',
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: isGoogle ? 'google' : 'email',
        });
        
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

  // Handle authenticated user
  const handleAuthenticatedUser = useCallback(async (userId: string, user: any) => {
    console.log('🔍 UnifiedAuth: Handling authenticated user:', { 
      userId, 
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      hasUser: !!user,
      userKeys: user ? Object.keys(user) : []
    });
    
    const isGoogle = checkIfGoogleUser(user);
    console.log('🔍 UnifiedAuth: User type detected:', { isGoogle, userId });
    
    // Check if this is a new SSO sign-up
    const newSSOSignUp = await AsyncStorage.getItem('newSSOSignUp');
    const isNewSignUp = newSSOSignUp === 'true';
    
    console.log('🔍 UnifiedAuth: Sign-up status:', { isNewSignUp, newSSOSignUp });
    
    // If this is a new SSO sign-up, skip profile verification and let the SSO flow handle it
    if (isNewSignUp) {
      console.log('⏳ UnifiedAuth: New SSO sign-up detected, skipping profile verification');
      const newAuthType: AuthType = {
        type: isGoogle ? 'google' : 'email',
        isNewSignUp: true,
        needsProfileSetup: true // New SSO users always need profile setup
      };
      console.log('🔍 UnifiedAuth: Setting auth type for new SSO user:', newAuthType);
      setAuthType(newAuthType);
      setIsReady(true);
      console.log('✅ UnifiedAuth: New SSO sign-up flow complete');
      // Set loading to false only if minimum time has passed
      if (minimumLoadingMet) {
        console.log('⏰ UnifiedAuth: Minimum time met, setting loading to false');
        setIsLoading(false);
      } else {
        console.log('⏰ UnifiedAuth: Waiting for minimum loading time before completing');
      }
      return;
    }
    
    // Create base auth type for returning users
    const baseAuthType: AuthType = {
      type: isGoogle ? 'google' : 'email',
      isNewSignUp: false,
      needsProfileSetup: false // Will be updated after verification
    };
    
    // Verify user profile for returning users
    console.log('🔍 UnifiedAuth: Starting profile verification for returning user...');
    const verificationResult = await verifyUserProfile(userId, user, isGoogle);
    console.log('🔍 UnifiedAuth: Profile verification result:', verificationResult);
    
    if (verificationResult.success) {
      const finalAuthType: AuthType = { ...baseAuthType, needsProfileSetup: verificationResult.needsSetup };
      console.log('🔍 UnifiedAuth: Setting final auth type:', finalAuthType);
      setAuthType(finalAuthType);
    } else {
      // If verification failed, assume setup is needed
      const finalAuthType: AuthType = { ...baseAuthType, needsProfileSetup: true };
      console.log('🔍 UnifiedAuth: Verification failed, setting auth type with setup needed:', finalAuthType);
      setAuthType(finalAuthType);
    }
    
    console.log('✅ UnifiedAuth: Auth flow complete, setting ready state');
    setIsReady(true);
    // Loading will be set to false by the minimum loading time effect
  }, [minimumLoadingMet]);

  // Handle unauthenticated user
  const handleUnauthenticatedUser = async () => {
    console.log('❌ UnifiedAuth: User is not authenticated');
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

  const value: UnifiedAuthContextType = {
    isReady,
    isAuthenticated: isSignedIn || false,
    isLoading,
    user,
    userId: userId || null,
    authType,
    triggerAuthCheck,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export default UnifiedAuthProvider; 