import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SessionManager } from '../../backend/services/session-manager';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { signOutButtonStyles } from '../../styles/components/sign-out-button';

export default function SignOutButton() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear the user session data but keep the returning user flag
              await SessionManager.clearUserSession();
              
              // Clear OAuth flags to ensure clean state
              await ClerkClientService.onSignOut();
              
              // Clear verification cache by reloading the app
              // This ensures fresh verification on next sign-in
              
              // Sign out from Clerk
              await signOut();
              
              // Check if user is an SSO user to determine redirect destination
              const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;
              const isGoogleUser = userEmail?.includes('@gmail.com') || userEmail?.includes('@googlemail.com') || userEmail?.includes('@google.com');
              
              // Wait a moment for Clerk to process the sign out
              setTimeout(() => {
                // Navigate to appropriate screen based on user type
                if (isGoogleUser) {
                  console.log('SSO user signing out, redirecting to welcome back screen');
                  router.replace('/auth/welcome-back');
                } else {
                  console.log('Email user signing out, redirecting to sign-in screen');
                  router.replace('/auth/sign-in');
                }
              }, 500);
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={signOutButtonStyles.button} onPress={handleSignOut}>
      <Text style={signOutButtonStyles.buttonText}>Sign Out</Text>
    </TouchableOpacity>
  );
} 