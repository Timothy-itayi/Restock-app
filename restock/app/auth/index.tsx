import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnifiedAuth } from '../_contexts/UnifiedAuthProvider';

import { ClerkClientService } from '../../backend/services/clerk-client';
import { authIndexStyles } from '../../styles/components/auth-index';

export default function AuthIndexScreen() {
  const { startSSOFlow } = useSSO();
  const { authType } = useUnifiedAuth();
  
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Loading state management for OAuth flow
  type AuthFlowState = 'form' | 'authenticating' | 'welcome' | 'complete';
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>('form');

  // Check for existing OAuth completion on component mount
  useEffect(() => {
    const checkExistingOAuthCompletion = async () => {
      try {
        const justCompletedSSO = await ClerkClientService.isOAuthJustCompleted();
        const newSSOSignUp = await ClerkClientService.isNewSSOSignUp();
        
        console.log('🔍 Auth Index: Checking existing OAuth completion:', { justCompletedSSO, newSSOSignUp });
        
        if (justCompletedSSO && newSSOSignUp) {
          console.log('🔍 Auth Index: Found existing OAuth completion, transitioning to authenticating state');
          setAuthFlowState('authenticating');
          
          // Clear the justCompletedSSO flag to prevent infinite loop
          await AsyncStorage.removeItem('justCompletedSSO');
          console.log('🔍 Auth Index: Cleared justCompletedSSO flag to prevent loop');
        }
      } catch (error) {
        console.error('Error checking existing OAuth completion:', error);
      }
    };
    
    checkExistingOAuthCompletion();
  }, []);

  const handleGoogleSignUp = async () => {
    console.log('🔵 handleGoogleSignUp called - Google button pressed');
    
    // Prevent Google OAuth if not in form state
    if (authFlowState !== 'form') {
      console.log('❌ Blocking Google OAuth - Not in form state, current state:', authFlowState);
      return;
    }

    setGoogleLoading(true);
    try {
      console.log('Starting Google OAuth flow for sign up...');
      
      console.log('✅ Starting Google OAuth flow');
      
      // Set OAuth processing flag before starting
      await AsyncStorage.setItem('oauthProcessing', 'true');
      
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/sso-profile-setup', { scheme: 'restock' }),
      });
      
      console.log('Google OAuth sign up result:', result);
      
      if (result.authSessionResult?.type === 'success') {
        console.log('Google OAuth sign up successful');
        
        // Transition to authenticating state
        setAuthFlowState('authenticating');
        
        // Set SSO flow flags using the service
        await ClerkClientService.setSSOSignUpFlags();
        console.log('✅ Set SSO flow flags using service');
        
        // Activate the session if we have a created session ID
        if (result.createdSessionId && result.setActive) {
          console.log('🔧 Activating OAuth session:', result.createdSessionId);
          await result.setActive({ session: result.createdSessionId });
          console.log('✅ OAuth session activated');
        }
        
        // Don't set recentSignIn flag for new SSO sign-ups to avoid AuthContext interference
        // The profile setup will handle authentication state appropriately
        console.log('⏳ Skipping recentSignIn flag for new SSO sign-up to prevent AuthContext interference');
        
      } else {
        console.log('OAuth result was not successful:', result.authSessionResult);
        setAuthFlowState('form');
        // Clear OAuth processing flag on failure
        await AsyncStorage.removeItem('oauthProcessing');
      }
    } catch (err: any) {
      console.error('Google OAuth sign up error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
      setAuthFlowState('form');
      // Clear OAuth processing flag on error
      await AsyncStorage.removeItem('oauthProcessing');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle loading state transitions
  const handleAuthenticatingComplete = () => {
    console.log('🔍 Auth Index: Authenticating complete, transitioning to welcome');
    setAuthFlowState('welcome');
  };

  const handleWelcomeComplete = async () => {
    console.log('🔍 Auth Index: Welcome complete, transitioning to complete');
    setAuthFlowState('complete');
    // Don't clear the newSSOSignUp flag here - let the profile setup screen clear it
    // This ensures AuthContext knows this is a new sign-up during any timing conflicts
    
    // Navigate to SSO profile setup with a small delay to ensure navigation is ready
    console.log('🚀 Navigating to SSO profile setup');
    setTimeout(() => {
      try {
        router.replace('/sso-profile-setup');
      } catch (error) {
        console.error('❌ Auth Index: Navigation error to sso-profile-setup:', error);
        // Fallback to welcome screen
        router.replace('/welcome');
      }
    }, 50);
    
    // Don't trigger auth check - let the profile setup handle its own auth state
    console.log('⏳ Skipping auth check to prevent verification skeleton interference');
  };

  // Add timeout to prevent getting stuck in loading states
  useEffect(() => {
    if (authFlowState === 'authenticating' || authFlowState === 'welcome') {
      const timeout = setTimeout(() => {
        console.log('⚠️ Auth Index: Timeout reached, forcing progression to next state');
        if (authFlowState === 'authenticating') {
          handleAuthenticatingComplete();
        } else if (authFlowState === 'welcome') {
          handleWelcomeComplete();
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [authFlowState]);



  return (
    <View style={authIndexStyles.container}>
        <Text style={authIndexStyles.title}>Welcome to Restock</Text>
        <Text style={authIndexStyles.subtitle}>Choose how you'd like to get started</Text>
        
        <TouchableOpacity 
          style={authIndexStyles.primaryButton}
          onPress={handleGoogleSignUp}
          disabled={googleLoading}
        >
          <Text style={authIndexStyles.primaryButtonText}>
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={authIndexStyles.secondaryButton}
          onPress={() => router.push('/auth/traditional/sign-up')}
        >
          <Text style={authIndexStyles.secondaryButtonText}>Create account with email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={authIndexStyles.linkButton}
          onPress={() => router.push('/auth/traditional/sign-in')}
        >
          <Text style={authIndexStyles.linkButtonText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    );
}