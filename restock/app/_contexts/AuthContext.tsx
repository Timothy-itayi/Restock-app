import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router, useSegments } from 'expo-router';
import { SessionManager } from '../../backend/services/session-manager';
import { UserProfileService } from '../../backend/services/user-profile';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { EmailAuthService } from '../../backend/services/email-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  user: any;
  userId: string | null;
  hasCompletedSetup: boolean;
  isGoogleUser: boolean;
  triggerAuthCheck: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isVerifying: false,
  user: null,
  userId: null,
  hasCompletedSetup: false,
  isGoogleUser: false,
  triggerAuthCheck: () => {}, // Provide a default empty function
});

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [lastVerifiedUserId, setLastVerifiedUserId] = useState<string | null>(null);
  const [verificationCache, setVerificationCache] = useState<{[key: string]: boolean}>({});
  const [lastVerificationTime, setLastVerificationTime] = useState<number>(0);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [previousAuthState, setPreviousAuthState] = useState<{isSignedIn: boolean, userId: string | null}>({isSignedIn: false, userId: null});
  const [lastSignInTime, setLastSignInTime] = useState(0);
  const [forceCheck, setForceCheck] = useState(0); // Add force check trigger

  // Set navigation ready when router is mounted
  useEffect(() => {
    // Use a more reliable method to detect navigation readiness
    const checkNavigationReady = () => {
      console.log('🔍 Checking navigation readiness...');
      if (typeof router !== 'undefined') {
        console.log('✅ Navigation is ready');
        setIsNavigationReady(true);
      } else {
        // Fallback: check again after a short delay
        console.log('⏳ Navigation not ready, retrying...');
        setTimeout(checkNavigationReady, 50);
      }
    };
    
    checkNavigationReady();
  }, []);

  // Initialize OAuth flags on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔧 AuthContext: Initializing app and clearing OAuth flags');
        await ClerkClientService.initializeOAuthFlags();
        console.log('✅ AuthContext: OAuth flags initialized successfully');
        
        console.log('📧 AuthContext: Initializing email auth flags');
        await EmailAuthService.initializeEmailAuthFlags();
        console.log('✅ AuthContext: Email auth flags initialized successfully');
      } catch (error) {
        console.error('❌ AuthContext: Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('AuthContext: Fallback timeout - setting isLoading to false');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Helper functions for authentication flow
  const checkIfGoogleUser = (user: any): boolean => {
    if (!user) return false;
    
    const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
    if (!userEmail) return false;
    
    // Check if this is a Google user by looking at email providers
    const hasGoogleEmail = user.emailAddresses?.some((email: any) => 
      email.emailAddress?.includes('@gmail.com') || 
      email.emailAddress?.includes('@googlemail.com') ||
      email.emailAddress?.includes('@google.com')
    ) || userEmail.includes('@gmail.com') || userEmail.includes('@googlemail.com') || userEmail.includes('@google.com');
    
    return hasGoogleEmail;
  };

  const verifyUserProfile = async (userId: string, user: any, isGoogle: boolean) => {
    try {
      const profileSetupResult = await UserProfileService.hasCompletedProfileSetup(userId);
      
      if (profileSetupResult.hasCompletedSetup) {
        // User has completed profile setup (has store_name)
        console.log('User has completed profile setup');
        
        // Cache the verification result
        setVerificationCache(prev => ({ ...prev, [userId]: true }));
        setLastVerifiedUserId(userId);
        
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
        
        setHasCompletedSetup(true);
        return { success: true, needsSetup: false };
      } else {
        // User hasn't completed profile setup (no store_name)
        console.log('User has not completed profile setup');
        setHasCompletedSetup(false);
        
        // Cache the verification result
        setVerificationCache(prev => ({ ...prev, [userId]: false }));
        setLastVerifiedUserId(userId);
        return { success: true, needsSetup: true };
      }
    } catch (error) {
      console.error('Error checking user profile setup:', error);
      setHasCompletedSetup(false);
      return { success: false, needsSetup: true };
    }
  };

  const handleAuthenticatedUser = async (userId: string, user: any) => {
    console.log('🔍 handleAuthenticatedUser called:', { userId, userEmail: user?.emailAddresses?.[0]?.emailAddress });
    
    const isGoogle = checkIfGoogleUser(user);
    setIsGoogleUser(isGoogle);
    console.log('🔍 User type detected:', { isGoogle, userId });
    
    // Check if we've already verified this user recently
    if (lastVerifiedUserId === userId && verificationCache[userId]) {
      console.log('⏳ User already verified recently, skipping verification');
      setHasCompletedSetup(true);
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }
    
    setIsVerifying(true);
    setLastVerificationTime(Date.now());
    
    console.log('🔍 Starting profile verification...');
    const verificationResult = await verifyUserProfile(userId, user, isGoogle);
    console.log('🔍 Profile verification result:', verificationResult);
    
    if (verificationResult.success) {
      if (!verificationResult.needsSetup) {
        // User has completed setup, redirect to dashboard if on auth/welcome screen
        const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
        const isOnTabs = segments[0] === '(tabs)';
        console.log('🔍 AuthContext: Checking navigation - segments:', segments, 'isOnAuthScreen:', isOnAuthScreen, 'isOnTabs:', isOnTabs);
        
        // Only redirect if on auth/welcome screen and NOT on tabs
        if (isOnAuthScreen && !isOnTabs && isNavigationReady) {
          console.log('🚀 User has completed setup, redirecting to dashboard');
          navigateToScreen('/(tabs)/dashboard');
        } else {
          console.log('⏳ Not redirecting - isOnAuthScreen:', isOnAuthScreen, 'isOnTabs:', isOnTabs, 'isNavigationReady:', isNavigationReady);
        }
      } else {
        // User needs to complete setup
        console.log('⚠️ User needs to complete setup');
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        if (justCompletedSSO === 'true') {
          console.log('⏳ AuthContext: OAuth just completed, letting OAuth handler manage routing');
          return;
        }
        
        // For traditional auth users, be more lenient - only redirect to setup if on auth screen
        const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
        const isOnSetupScreen = segments[0] === 'profile-setup' || segments[0] === 'sso-profile-setup';
        const isOnTabs = segments[0] === '(tabs)';
        
        console.log('🔍 Setup navigation check:', { isOnAuthScreen, isOnSetupScreen, isOnTabs, isNavigationReady });
        
        if (isOnAuthScreen && !isOnSetupScreen && isNavigationReady) {
          // Only redirect to setup if user is on auth screen
          if (isGoogle) {
            console.log('🚀 Google user needs to complete setup, redirecting to sso-profile-setup');
            navigateToScreen('/sso-profile-setup');
          } else {
            console.log('🚀 Email user needs to complete setup, redirecting to profile-setup');
            navigateToScreen('/profile-setup');
          }
        } else if (isOnTabs) {
          // User is already on tabs, let them stay there even without profile
          console.log('⏳ User is on tabs, allowing access even without profile setup');
          setHasCompletedSetup(true);
        } else {
          console.log('❌ Not redirecting to setup - conditions not met');
        }
      }
    } else {
      // Verification failed, be more lenient for traditional auth users
      console.log('❌ Profile verification failed');
      const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
      const isOnSetupScreen = segments[0] === 'profile-setup' || segments[0] === 'sso-profile-setup';
      const isOnTabs = segments[0] === '(tabs)';
      
      if (isOnAuthScreen && !isOnSetupScreen && isNavigationReady) {
        // Only redirect to setup if user is on auth screen
        if (isGoogle) {
          console.log('🚀 Google user verification failed, redirecting to sso-profile-setup');
          navigateToScreen('/sso-profile-setup');
        } else {
          console.log('🚀 Email user verification failed, redirecting to profile-setup');
          navigateToScreen('/profile-setup');
        }
      } else if (isOnTabs) {
        // User is already on tabs, let them stay there
        console.log('⏳ User is on tabs, allowing access even with verification failure');
        setHasCompletedSetup(true);
      } else {
        console.log('❌ Not redirecting after verification failure - conditions not met');
      }
    }
    
    setIsVerifying(false);
  };

  const handleUnauthenticatedUser = async () => {
    const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
    
    // Check if this might be a recent sign-in that hasn't been processed yet
    const recentSignIn = await AsyncStorage.getItem('recentSignIn');
    if (recentSignIn === 'true') {
      console.log('Recent sign-in detected in handleUnauthenticatedUser, skipping unauthenticated user logic');
      return;
    }
    
    // Only redirect if not already on an auth screen and this is the first initialization
    if (!isSignedIn && !isOnAuthScreen && isNavigationReady && !hasInitialized) {
      // Check if user has previous session data to determine if they should go to welcome-back
      const session = await SessionManager.getUserSession();
      
      if (session?.lastAuthMethod) {
        console.log('Previous user not authenticated, redirecting to welcome back screen');
        navigateToScreen('/auth/welcome-back');
      } else {
        console.log('New user not authenticated, redirecting to welcome screen');
        navigateToScreen('/welcome');
      }
    } else if (!isSignedIn && isOnAuthScreen) {
      console.log('User not authenticated but already on auth screen, allowing access');
    }
  };

  const navigateToScreen = (screen: string) => {
    console.log('🔍 navigateToScreen called:', { screen, isNavigationReady });
    if (isNavigationReady) {
      console.log('🚀 AuthContext: Navigating to screen:', screen);
      setTimeout(() => {
        console.log('🚀 AuthContext: Executing navigation to:', screen);
        router.replace(screen as any);
      }, 100);
    } else {
      console.log('❌ AuthContext: Navigation not ready, cannot navigate to:', screen);
    }
  };

  // Detect OAuth completion
  useEffect(() => {
    console.log('🔍 Auth state change effect triggered:', { isSignedIn, userId, isLoaded });
    
    const handleAuthStateChange = async () => {
      const authStateChanged = previousAuthState.isSignedIn !== isSignedIn || previousAuthState.userId !== userId;
      
      console.log('🔍 Auth state change check:', {
        previousAuthState,
        currentState: { isSignedIn, userId },
        authStateChanged,
        isLoaded
      });
      
      if (authStateChanged && isLoaded) {
        console.log('🔄 AuthContext: Authentication state changed:', {
          previous: previousAuthState,
          current: { isSignedIn, userId },
          isLoaded
        });
        
        if (!previousAuthState.isSignedIn && isSignedIn && userId) {
          console.log('✅ AuthContext: User just became authenticated');
          setLastSignInTime(Date.now());
          
          // Check if this is a fresh OAuth completion
          const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
          if (justCompletedSSO === 'true') {
            console.log('⏳ AuthContext: OAuth just completed, letting OAuth handler manage routing');
          }
        }
        
        setPreviousAuthState({ isSignedIn, userId });
      }
    };
    
    handleAuthStateChange();
  }, [isSignedIn, userId, isLoaded, previousAuthState]);

  useEffect(() => {
    console.log('🚨 AuthContext main effect triggered!', { 
      isLoaded, 
      isNavigationReady, 
      isSignedIn, 
      userId, 
      hasInitialized,
      segments: segments[0],
      lastSignInTime,
      lastVerificationTime,
      hasCompletedSetup
    });
    
    // Add debugging for why effect might not run
    if (!isLoaded) {
      console.log('❌ AuthContext blocked: Clerk not loaded');
      return;
    }
    
    if (!isNavigationReady) {
      console.log('❌ AuthContext blocked: Navigation not ready');
      return;
    }

    // Wait a bit for Clerk to fully update the authentication state
    if (isSignedIn && (!userId || !user)) {
      console.log('⏳ AuthContext: Waiting for Clerk to provide user data');
      return;
    }

    // Prevent multiple initializations for unauthenticated users
    if (hasInitialized && !isSignedIn && segments[0] === 'welcome') {
      console.log('⏳ AuthContext: Already initialized and user is on welcome screen, skipping');
      return;
    }

    // For authenticated users, allow the logic to run even if initialized
    // This ensures recent sign-ins are handled properly
    if (hasInitialized && isSignedIn && userId) {
      console.log('✅ AuthContext: User is authenticated, allowing logic to run even if initialized');
    }

    // Clear cache if user signed out
    if (!isSignedIn && lastVerifiedUserId) {
      console.log('🔄 User signed out, clearing verification cache');
      setLastVerifiedUserId(null);
      setVerificationCache({});
      setLastVerificationTime(0);
      setHasCompletedSetup(false);
      setIsGoogleUser(false);
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    // Don't re-verify if user is already authenticated and verified
    if (isSignedIn && userId && lastVerifiedUserId === userId && verificationCache[userId]) {
      console.log('⏳ User already verified, skipping re-verification');
      return;
    }

    // Prevent verification from running too frequently (within 1 second)
    const now = Date.now();
    if (isSignedIn && userId && (now - lastVerificationTime) < 1000) {
      console.log('⏳ Verification ran recently, skipping');
      return;
    }

    // Don't run verification if user is already on tabs (to prevent unwanted redirects)
    const isOnTabs = segments[0] === '(tabs)';
    if (isSignedIn && userId && isOnTabs) {
      console.log('⏳ User is already on tabs, skipping verification to prevent unwanted redirects');
      // Set as initialized to prevent future interference
      setHasInitialized(true);
      return;
    }

    console.log('🚀 AuthContext: Running checkAuthAndSetup');
    const checkAuthAndSetup = async () => {
      try {
        // Check for recent sign-in flag first, before other checks
        const recentSignIn = await AsyncStorage.getItem('recentSignIn');
        console.log('🔍 AuthContext: Checking recent sign-in flag:', {
          recentSignIn,
          isSignedIn,
          userId,
          segments: segments[0]
        });
        
        if (recentSignIn === 'true' && isSignedIn && userId) {
          console.log('✅ Recent sign-in detected, navigating to dashboard');
          await AsyncStorage.removeItem('recentSignIn');
          setLastSignInTime(Date.now()); // Update lastSignInTime for timing checks
          setHasInitialized(true);
          setIsLoading(false);
          
          // Navigate to dashboard for traditional auth users
          const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
          console.log('🔍 AuthContext: Navigation check - segments:', segments, 'isOnAuthScreen:', isOnAuthScreen, 'isNavigationReady:', isNavigationReady);
          
          if (isOnAuthScreen && isNavigationReady) {
            console.log('🚀 Navigating traditional auth user to dashboard');
            navigateToScreen('/(tabs)/dashboard');
          } else {
            console.log('❌ Not navigating - isOnAuthScreen:', isOnAuthScreen, 'isNavigationReady:', isNavigationReady);
          }
          return;
        } else if (recentSignIn === 'true' && !isSignedIn) {
          // Recent sign-in flag is set but user is not authenticated yet
          // Since we've fixed the session hydration issue with setActive, 
          // this should rarely happen. If it does, clear the flag and let normal flow continue.
          console.log('⚠️ Recent sign-in flag detected but user not authenticated - clearing flag');
          await AsyncStorage.removeItem('recentSignIn');
          // Continue with normal authentication flow
        }

        if (isSignedIn && userId && user) {
          console.log('✅ AuthContext: User is authenticated:', userId);
          await handleAuthenticatedUser(userId, user);
        } else {
          console.log('❌ AuthContext: User is not authenticated - isSignedIn:', isSignedIn, 'userId:', userId, 'user:', !!user);
          await handleUnauthenticatedUser();
        }
      } catch (error) {
        console.error('❌ Error in auth check:', error);
        setIsVerifying(false);
      } finally {
        console.log('🏁 AuthContext: Setting isLoading to false');
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    checkAuthAndSetup();
  }, [isLoaded, isSignedIn, userId, segments, hasInitialized, forceCheck]);

  // Function to manually trigger auth check
  const triggerAuthCheck = () => {
    console.log('🔧 Manually triggering auth check');
    setForceCheck(prev => prev + 1);
  };



  const value = {
    isAuthenticated: isSignedIn || false,
    isLoading,
    isVerifying,
    user,
    userId: userId || null,
    hasCompletedSetup,
    isGoogleUser,
    triggerAuthCheck, // Expose the trigger function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider; 