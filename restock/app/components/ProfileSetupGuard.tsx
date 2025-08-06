import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthContext } from '../_contexts/AuthContext';
import { useClerkAuth } from '../_contexts/ClerkAuthContext';
import { UserProfileService } from '../../backend/services/user-profile';

interface ProfileSetupGuardProps {
  children: React.ReactNode;
}

export default function ProfileSetupGuard({ children }: ProfileSetupGuardProps) {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { isGoogleUser } = useAuthContext();
  const { isSSOFlowActive } = useClerkAuth();
  
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfileSetup = async () => {
      if (!isSignedIn || !userId) {
        setIsCheckingProfile(false);
        return;
      }

      // If SSO flow is active, don't check profile - let the flow handle it
      if (isSSOFlowActive) {
        console.log('ProfileSetupGuard: SSO flow is active, skipping profile check');
        setIsCheckingProfile(false);
        return;
      }

      try {
        console.log('ProfileSetupGuard: Checking profile setup for user:', userId);
        const profileResult = await UserProfileService.hasCompletedProfileSetup(userId);
        
        if (profileResult.hasCompletedSetup) {
          console.log('ProfileSetupGuard: User has completed profile setup');
          setHasProfile(true);
        } else {
          console.log('ProfileSetupGuard: User has not completed profile setup');
          setHasProfile(false);
          
          // Redirect to appropriate profile setup screen
          if (isGoogleUser) {
            console.log('ProfileSetupGuard: Redirecting Google user to SSO profile setup');
            router.replace('/sso-profile-setup');
          } else {
            console.log('ProfileSetupGuard: Redirecting email user to traditional profile setup');
            router.replace('/auth/traditional/profile-setup');
          }
        }
      } catch (error) {
        console.error('ProfileSetupGuard: Error checking profile setup:', error);
        // On error, assume profile is not complete and redirect
        setHasProfile(false);
        if (isGoogleUser) {
          router.replace('/sso-profile-setup');
        } else {
          router.replace('/auth/traditional/profile-setup');
        }
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileSetup();
  }, [isSignedIn, userId, isGoogleUser, isSSOFlowActive]);

  // Show loading while checking profile
  if (isCheckingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#6B7F6B" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7F6B', fontFamily: 'Satoshi-Regular' }}>
          Checking your profile...
        </Text>
      </View>
    );
  }

  // If user is not signed in, show children (let AuthGuard handle auth)
  if (!isSignedIn) {
    return <>{children}</>;
  }

  // If SSO flow is active, show children (let SSO flow handle profile setup)
  if (isSSOFlowActive) {
    return <>{children}</>;
  }

  // If user has completed profile setup, show children
  if (hasProfile) {
    return <>{children}</>;
  }

  // If user hasn't completed profile setup, show loading (redirect should happen)
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <ActivityIndicator size="large" color="#6B7F6B" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7F6B', fontFamily: 'Satoshi-Regular' }}>
        Setting up your profile...
      </Text>
    </View>
  );
} 