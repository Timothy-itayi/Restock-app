import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Link } from 'expo-router';
import { useSignIn, useAuth, useUser, useSSO, useClerk } from '@clerk/clerk-expo';
import { SessionManager } from '../../backend/services/session-manager';
import { ClerkClientService } from '../../backend/services/clerk-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import AuthGuard from '../components/AuthGuard';
import { welcomeBackStyles } from '../../styles/components/welcome-back';

export default function WelcomeBackScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  
  const [loading, setLoading] = useState(false);
  const [lastAuthMethod, setLastAuthMethod] = useState<'google' | 'email' | null>(null);
  const [lastUserEmail, setLastUserEmail] = useState<string>('');

  // Check returning user data on component mount
  useEffect(() => {
    checkReturningUserData();
  }, []);

  const checkReturningUserData = async () => {
    try {
      // Get the last authentication method and user data
      const session = await SessionManager.getUserSession();
      if (session?.lastAuthMethod) {
        setLastAuthMethod(session.lastAuthMethod);
        setLastUserEmail(session.email || '');
        console.log('Found returning user data:', { 
          method: session.lastAuthMethod, 
          email: session.email 
        });
      }
    } catch (error) {
      console.error('Error checking returning user data:', error);
    }
  };

  const handleSignBackInWithGoogle = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Starting Google OAuth flow for returning user...');
      
      // Set OAuth processing flag before starting the flow
      await AsyncStorage.setItem('oauthProcessing', 'true');
      
      // Use Clerk's useSSO hook for native OAuth flow
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/sso-profile-setup', { scheme: 'restock' }),
      });
      
      console.log('Google OAuth sign in result:', result);
      
      if (result.authSessionResult?.type === 'success') {
        console.log('Google OAuth sign in successful');
        
        // Set the created session as active - this is crucial for OAuth completion
        if (result.createdSessionId) {
          console.log('Setting created session as active...');
          await setActive({ session: result.createdSessionId });
          console.log('Session set as active successfully');
        }
        
        // Use the new auth state polling service to handle OAuth completion
        const oauthSuccess = await ClerkClientService.handleOAuthCompletion(() => ({
          isLoaded: Boolean(isLoaded),
          isSignedIn: Boolean(isSignedIn)
        }));
        
        if (oauthSuccess) {
          console.log('OAuth completion handled successfully with auth state polling');
          
          // Save session data for returning user detection
          await SessionManager.saveUserSession({
            userId: result.createdSessionId || '',
            email: lastUserEmail || '',
            wasSignedIn: true,
            lastSignIn: Date.now(),
            lastAuthMethod: 'google',
          });
          
          // Navigate to dashboard
          router.replace('/(tabs)/dashboard');
        } else {
          console.log('OAuth completion failed - auth state polling unsuccessful');
          Alert.alert('Authentication Error', 'Failed to complete authentication. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Google OAuth sign in error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithDifferentEmail = () => {
    // Navigate to the main welcome screen for new signup
    router.replace('/welcome');
  };

  const handleBackToSignIn = () => {
    // Navigate back to the regular sign-in screen
    router.replace('/auth/sign-in');
  };

  return (
    <AuthGuard requireNoAuth={true}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={welcomeBackStyles.container}
        >
          <View style={welcomeBackStyles.titleContainer}>
            <Text style={welcomeBackStyles.title}>Welcome Back!</Text>
            <Text style={welcomeBackStyles.subtitle}>
              {lastUserEmail ? `Ready to continue with ${lastUserEmail}?` : 'Ready to continue managing your restock operations?'}
            </Text>
          </View>

          {lastAuthMethod === 'google' && (
            <View style={welcomeBackStyles.methodContainer}>
              <Text style={welcomeBackStyles.methodLabel}>
                You last signed in with Google
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={welcomeBackStyles.googleButton}
            onPress={handleSignBackInWithGoogle}
            disabled={loading}
          >
            <Text style={welcomeBackStyles.googleButtonText}>
              {loading ? 'Signing in...' : 'Sign Back In with Google'}
            </Text>
          </TouchableOpacity>

          <View style={welcomeBackStyles.divider}>
            <View style={welcomeBackStyles.dividerLine} />
            <Text style={welcomeBackStyles.dividerText}>or</Text>
            <View style={welcomeBackStyles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={welcomeBackStyles.secondaryButton}
            onPress={handleSignUpWithDifferentEmail}
            disabled={loading}
          >
            <Text style={welcomeBackStyles.secondaryButtonText}>
              Not signed up yet?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={welcomeBackStyles.linkButton}
            onPress={handleBackToSignIn}
            disabled={loading}
          >
            <Text style={welcomeBackStyles.linkButtonText}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </AuthGuard>
  );
} 