import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { SessionManager } from '../../backend/services/session-manager';
import { UserProfileService } from '../../backend/services/user-profile';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  user: any;
  userId: string | null;
  hasCompletedSetup: boolean;
  isGoogleUser: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isVerifying: false,
  user: null,
  userId: null,
  hasCompletedSetup: false,
  isGoogleUser: false,
});

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
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

  // Set navigation ready when router is mounted
  useEffect(() => {
    // Use a more reliable method to detect navigation readiness
    const checkNavigationReady = () => {
      if (typeof router !== 'undefined') {
        console.log('AuthContext: Navigation is ready');
        setIsNavigationReady(true);
      } else {
        // Fallback: check again after a short delay
        setTimeout(checkNavigationReady, 50);
      }
    };
    
    checkNavigationReady();
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
      const profileResult = await UserProfileService.verifyUserProfile(userId);
      
      if (profileResult.data) {
        // User has a profile in Supabase - they have completed setup
        console.log('User profile exists in Supabase, setup completed');
        
        // Cache the verification result
        setVerificationCache(prev => ({ ...prev, [userId]: true }));
        setLastVerifiedUserId(userId);
        
        // Update local session with Supabase data
        const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
        
        await SessionManager.saveUserSession({
          userId,
          email: userEmail || '',
          storeName: profileResult.data.store_name,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: isGoogle ? 'google' : 'email',
        });
        
        setHasCompletedSetup(true);
        return { success: true, needsSetup: false };
      } else {
        // User doesn't have a profile in Supabase - they need to complete setup
        console.log('User profile does not exist in Supabase, needs setup');
        setHasCompletedSetup(false);
        
        // Cache the verification result
        setVerificationCache(prev => ({ ...prev, [userId]: false }));
        setLastVerifiedUserId(userId);
        return { success: true, needsSetup: true };
      }
    } catch (error) {
      console.error('Error checking user profile in Supabase:', error);
      setHasCompletedSetup(false);
      return { success: false, needsSetup: true };
    }
  };

  const handleAuthenticatedUser = async (userId: string, user: any) => {
    const isGoogle = checkIfGoogleUser(user);
    setIsGoogleUser(isGoogle);
    
    // Check if we've already verified this user recently
    if (lastVerifiedUserId === userId && verificationCache[userId]) {
      console.log('User already verified recently, skipping verification');
      setHasCompletedSetup(true);
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }
    
    setIsVerifying(true);
    setLastVerificationTime(Date.now());
    
    const verificationResult = await verifyUserProfile(userId, user, isGoogle);
    
    if (verificationResult.success) {
      if (!verificationResult.needsSetup) {
        // User has completed setup, redirect to dashboard if on auth/welcome screen
        const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
        if (isOnAuthScreen && isNavigationReady) {
          console.log('User has completed setup, redirecting to dashboard');
          navigateToScreen('/(tabs)/dashboard');
        }
      } else {
        // User needs to complete setup
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        if (justCompletedSSO === 'true') {
          console.log('AuthContext: OAuth just completed, letting OAuth handler manage routing');
          return;
        }
        
        // Redirect to appropriate setup screen based on auth method
        const isOnSetupScreen = segments[0] === 'profile-setup' || segments[0] === 'sso-profile-setup';
        if (!isOnSetupScreen && isNavigationReady) {
          if (isGoogle) {
            console.log('Google user needs to complete setup, redirecting to sso-profile-setup');
            navigateToScreen('/sso-profile-setup');
          } else {
            console.log('Email user needs to complete setup, redirecting to profile-setup');
            navigateToScreen('/profile-setup');
          }
        }
      }
    } else {
      // Verification failed, assume user needs to complete setup
      const isOnSetupScreen = segments[0] === 'profile-setup' || segments[0] === 'sso-profile-setup';
      if (!isOnSetupScreen && isNavigationReady) {
        if (isGoogle) {
          navigateToScreen('/sso-profile-setup');
        } else {
          navigateToScreen('/profile-setup');
        }
      }
    }
    
    setIsVerifying(false);
  };

  const handleUnauthenticatedUser = async () => {
    const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
    
    // Only redirect if not already on an auth screen and this is the first initialization
    if (!isSignedIn && !isOnAuthScreen && isNavigationReady && !hasInitialized) {
      // Check if user was previously an SSO user
      const session = await SessionManager.getUserSession();
      const wasSSOUser = session?.lastAuthMethod === 'google';
      
      if (wasSSOUser) {
        console.log('Previous SSO user not authenticated, redirecting to welcome back screen');
        navigateToScreen('/auth/welcome-back');
      } else {
        console.log('User not authenticated and not on auth screen, redirecting to welcome');
        navigateToScreen('/welcome');
      }
    } else if (!isSignedIn && isOnAuthScreen) {
      console.log('User not authenticated but already on auth screen, allowing access');
    }
  };

  const navigateToScreen = (screen: string) => {
    if (isNavigationReady) {
      setTimeout(() => {
        router.replace(screen as any);
      }, 100);
    }
  };

  // Detect OAuth completion
  useEffect(() => {
    const handleAuthStateChange = async () => {
      const authStateChanged = previousAuthState.isSignedIn !== isSignedIn || previousAuthState.userId !== userId;
      
      if (authStateChanged && isLoaded) {
        console.log('AuthContext: Authentication state changed:', {
          previous: previousAuthState,
          current: { isSignedIn, userId },
          isLoaded
        });
        
        if (!previousAuthState.isSignedIn && isSignedIn && userId) {
          console.log('AuthContext: User just became authenticated (likely OAuth completion)');
          console.log('AuthContext: Forcing fresh authentication check');
          // Reset initialization to force a fresh check
          setHasInitialized(false);
          setLastVerifiedUserId(null);
          setVerificationCache({});
          setLastVerificationTime(0); // Reset verification time to allow immediate check
          
          // Check if this is a fresh OAuth completion
          const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
          if (justCompletedSSO === 'true') {
            console.log('AuthContext: OAuth just completed, letting OAuth handler manage routing');
          }
        }
        
        setPreviousAuthState({ isSignedIn, userId });
      }
    };
    
    handleAuthStateChange();
  }, [isSignedIn, userId, isLoaded, previousAuthState]);

  useEffect(() => {
    console.log('AuthContext effect triggered:', { isLoaded, isNavigationReady, isSignedIn, userId, hasInitialized });
    
    if (!isLoaded || !isNavigationReady) {
      console.log('AuthContext: Waiting for Clerk to load or navigation to be ready');
      return;
    }

    // Prevent multiple initializations for unauthenticated users
    if (hasInitialized && !isSignedIn && segments[0] === 'welcome') {
      console.log('AuthContext: Already initialized and user is on welcome screen, skipping');
      return;
    }

    // Clear cache if user signed out
    if (!isSignedIn && lastVerifiedUserId) {
      console.log('User signed out, clearing verification cache');
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
      console.log('User already verified, skipping re-verification');
      return;
    }

    // Prevent verification from running too frequently (within 5 seconds)
    const now = Date.now();
    if (isSignedIn && userId && (now - lastVerificationTime) < 5000) {
      console.log('Verification ran recently, skipping');
      return;
    }

    const checkAuthAndSetup = async () => {
      try {
        if (isSignedIn && userId && user) {
          console.log('AuthContext: User is authenticated:', userId);
          await handleAuthenticatedUser(userId, user);
        } else {
          console.log('AuthContext: User is not authenticated');
          await handleUnauthenticatedUser();
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setIsVerifying(false);
      } finally {
        console.log('AuthContext: Setting isLoading to false');
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    checkAuthAndSetup();
  }, [isLoaded, isSignedIn, userId, segments, hasInitialized]);

  const value = {
    isAuthenticated: isSignedIn || false,
    isLoading,
    isVerifying,
    user,
    userId: userId || null,
    hasCompletedSetup,
    isGoogleUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider; 