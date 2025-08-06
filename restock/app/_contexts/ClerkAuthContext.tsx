import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClerkClientService } from '../../backend/services/clerk-client';

interface ClerkAuthContextType {
  isSignedIn: boolean;
  user: ReturnType<typeof useUser>['user'];
  isLoading: boolean;
  isSSOFlowActive: boolean;
  isSSOAuthenticating: boolean;
  setSSOFlowActive: (active: boolean) => void;
  handleSSOCompletion: () => Promise<void>;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (!context) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
};

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  const [isSSOFlowActive, setIsSSOFlowActive] = useState(false);
  const [isSSOAuthenticating, setIsSSOAuthenticating] = useState(false);

  // Handle SSO flow activation
  const setSSOFlowActive = (active: boolean) => {
    console.log('🔧 ClerkAuthContext: Setting SSO flow active:', active);
    setIsSSOFlowActive(active);
  };

  // Handle SSO completion
  const handleSSOCompletion = async () => {
    console.log('🔧 ClerkAuthContext: Handling SSO completion');
    
    try {
      // Check if this is a new SSO sign-up
      const newSSOSignUp = await ClerkClientService.isNewSSOSignUp();
      
      if (newSSOSignUp) {
        console.log('🔧 ClerkAuthContext: New SSO sign-up detected, navigating to profile setup');
        // Navigate to SSO profile setup
        router.replace('/sso-profile-setup');
      } else {
        console.log('🔧 ClerkAuthContext: Returning SSO user, navigating to dashboard');
        // Navigate to dashboard for returning users
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      console.error('🔧 ClerkAuthContext: Error handling SSO completion:', error);
      // Fallback to dashboard
      router.replace('/(tabs)/dashboard');
    }
  };

  // Monitor OAuth completion
  useEffect(() => {
    const checkOAuthCompletion = async () => {
      if (!isSignedIn || !user) return;

      try {
        const justCompletedSSO = await ClerkClientService.isOAuthJustCompleted();
        
        if (justCompletedSSO && isSSOFlowActive) {
          console.log('🔧 ClerkAuthContext: OAuth completion detected, handling completion');
          
          // Clear the flag
          await AsyncStorage.removeItem('justCompletedSSO');
          
          // Show authenticating state
          setIsSSOAuthenticating(true);
          
          // Wait a moment for UI, then handle completion
          setTimeout(async () => {
            setIsSSOAuthenticating(false);
            await handleSSOCompletion();
          }, 2000);
        }
      } catch (error) {
        console.error('🔧 ClerkAuthContext: Error checking OAuth completion:', error);
      }
    };

    checkOAuthCompletion();
  }, [isSignedIn, user, isSSOFlowActive]);

  const value: ClerkAuthContextType = {
    isSignedIn: isSignedIn || false,
    user,
    isLoading: !isLoaded,
    isSSOFlowActive,
    isSSOAuthenticating,
    setSSOFlowActive,
    handleSSOCompletion,
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
};

export default ClerkAuthProvider; 