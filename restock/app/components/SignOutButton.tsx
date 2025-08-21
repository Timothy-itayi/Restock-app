import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { SessionManager } from '../../backend/services/session-manager';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { useUnifiedAuth } from '../_contexts/UnifiedAuthProvider';
import { signOutButtonStyles } from '../../styles/components/sign-out-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignOutButton() {
  const { signOut } = useAuth();
  const { clearAuthFlags } = useUnifiedAuth();

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
              // Sign out while preserving returning user data (email and auth method)
              await SessionManager.signOutPreservingUserData();
              
              // Clear OAuth flags to ensure clean state
              await ClerkClientService.onSignOut();
              
              // Clear all auth flags using UnifiedAuthProvider
              await clearAuthFlags();
              
              // Clear verification cache by reloading the app
              // This ensures fresh verification on next sign-in
              
              // Set a transient flag so the loader can show a friendly sign-out message
              await AsyncStorage.setItem('justSignedOut', 'true');

              // Sign out from Clerk
              await signOut();
              
              // Wait a moment for Clerk to process the sign out
              setTimeout(() => {
                // Always redirect to welcome-back screen for consistent flow
                console.log('User signing out, redirecting to welcome back screen');
                router.replace('/auth/welcome-back');
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