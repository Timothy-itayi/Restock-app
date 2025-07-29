import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { SessionManager } from '../../backend/services/session-manager';
import { UserProfileService } from '../../backend/services/user-profile';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  user: any;
  userId: string | null;
  hasCompletedSetup: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isVerifying: false,
  user: null,
  userId: null,
  hasCompletedSetup: false,
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
  const [lastVerifiedUserId, setLastVerifiedUserId] = useState<string | null>(null);
  const [verificationCache, setVerificationCache] = useState<{[key: string]: boolean}>({});
  const [lastVerificationTime, setLastVerificationTime] = useState<number>(0);

  useEffect(() => {
    if (!isLoaded) return;

    // Clear cache if user signed out
    if (!isSignedIn && lastVerifiedUserId) {
      console.log('User signed out, clearing verification cache');
      setLastVerifiedUserId(null);
      setVerificationCache({});
      setLastVerificationTime(0);
      setHasCompletedSetup(false);
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
        if (isSignedIn && userId) {
          console.log('User is authenticated:', userId);
          
          // Check if we've already verified this user recently
          if (lastVerifiedUserId === userId && verificationCache[userId]) {
            console.log('User already verified recently, skipping verification');
            setHasCompletedSetup(true);
            setIsLoading(false);
            return;
          }
          
          setIsVerifying(true);
          setLastVerificationTime(Date.now());
          
          // First, check if user has a profile in Supabase (this is the source of truth)
          try {
            const profileResult = await UserProfileService.verifyUserProfile(userId);
            
            if (profileResult.data) {
              // User has a profile in Supabase - they have completed setup
              console.log('User profile exists in Supabase, setup completed');
              
              // Cache the verification result
              setVerificationCache(prev => ({ ...prev, [userId]: true }));
              setLastVerifiedUserId(userId);
              
              // Update local session with Supabase data
              if (user) {
                const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
                await SessionManager.saveUserSession({
                  userId,
                  email: userEmail || '',
                  storeName: profileResult.data.store_name,
                  wasSignedIn: true,
                  lastSignIn: Date.now(),
                });
              }
              
              setHasCompletedSetup(true);
              
              // Redirect to dashboard if on auth/welcome screen
              const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
              if (isOnAuthScreen) {
                console.log('User has completed setup, redirecting to dashboard');
                router.replace('/(tabs)/dashboard');
              }
            } else {
              // User doesn't have a profile in Supabase - they need to complete setup
              console.log('User profile does not exist in Supabase, needs setup');
              setHasCompletedSetup(false);
              
              // Cache the verification result
              setVerificationCache(prev => ({ ...prev, [userId]: false }));
              setLastVerifiedUserId(userId);
              
              // Redirect to welcome if not already there
              const isOnSetupScreen = segments[0] === 'welcome';
              if (!isOnSetupScreen) {
                console.log('User needs to complete setup, redirecting to welcome');
                router.replace('/welcome');
              }
            }
          } catch (error) {
            console.error('Error checking user profile in Supabase:', error);
            // If verification fails, assume user needs to complete setup
            setHasCompletedSetup(false);
            const isOnSetupScreen = segments[0] === 'welcome';
            if (!isOnSetupScreen) {
              router.replace('/welcome');
            }
          } finally {
            setIsVerifying(false);
          }
        } else {
          // User is not authenticated
          const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'welcome';
          if (!isOnAuthScreen) {
            console.log('User not authenticated, redirecting to welcome');
            router.replace('/welcome');
          }
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setIsVerifying(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndSetup();
  }, [isLoaded, isSignedIn, userId, segments]);

  const value = {
    isAuthenticated: isSignedIn || false,
    isLoading,
    isVerifying,
    user,
    userId: userId || null,
    hasCompletedSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 