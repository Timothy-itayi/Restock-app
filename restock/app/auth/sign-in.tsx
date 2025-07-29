import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Link } from 'expo-router';
import { useSignIn, useAuth, useUser, useSSO, useClerk } from '@clerk/clerk-expo';
import { SessionManager } from '../../backend/services/session-manager';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { UserProfileService } from '../../backend/services/user-profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import AuthGuard from '../components/AuthGuard';
import { signInStyles } from '../../styles/components/sign-in';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReturningUserButton, setShowReturningUserButton] = useState(false);
  const [lastAuthMethod, setLastAuthMethod] = useState<'google' | 'email' | null>(null);

  // Check if user is a returning user on component mount
  useEffect(() => {
    checkReturningUser();
  }, []);

  const checkReturningUser = async () => {
    try {
      const returning = await SessionManager.isReturningUser();
      setShowReturningUserButton(returning);
      
      // Get the last authentication method
      const session = await SessionManager.getUserSession();
      if (session?.lastAuthMethod) {
        setLastAuthMethod(session.lastAuthMethod);
      }
    } catch (error) {
      console.error('Error checking returning user status:', error);
    }
  };

  const handleReturningUserSignIn = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      // Get cached session data
      const cachedSession = await SessionManager.getUserSession();
      
      if (cachedSession) {
        console.log('Found cached session for returning user:', cachedSession.email);
        
        // Try to authenticate with cached credentials
        // For now, we'll use Google OAuth for returning users
        await handleGoogleSignIn(true); // true indicates returning user flow
      } else {
        Alert.alert('Error', 'No cached session found. Please sign in normally.');
      }
    } catch (error) {
      console.error('Error with returning user sign-in:', error);
      Alert.alert('Error', 'Failed to sign in as returning user. Please try the normal sign-in process.');
    } finally {
      setLoading(false);
    }
  };

  const onSignInPress = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Attempting to sign in with email:', email);
      
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      console.log('SignIn result:', result);

      if (result.status === 'complete') {
        console.log('Sign in successful');
        
        // Save session data for returning user detection
        await SessionManager.saveUserSession({
          userId: result.createdSessionId || '',
          email,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'email',
        });
        
        // For email sign-in, we don't need OAuth completion handling
        // Just navigate directly to dashboard
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('Sign in not complete, status:', result.status);
        Alert.alert('Error', 'Sign in failed. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (isReturningUserFlow = false) => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Starting Google OAuth flow for sign in...');
      
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
          // Extract email from user object after OAuth completion
          const userEmail = result.createdSessionId ? 
            (await UserProfileService.getUserProfile(result.createdSessionId))?.data?.email || '' : '';
          
          await SessionManager.saveUserSession({
            userId: result.createdSessionId || '',
            email: userEmail,
            wasSignedIn: true,
            lastSignIn: Date.now(),
            lastAuthMethod: 'google',
          });
          
          // Navigate to dashboard
          router.replace('/(tabs)/dashboard');
        } else {
          console.log('OAuth completion failed - session refresh unsuccessful');
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

  return (
    <AuthGuard requireNoAuth={true}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={signInStyles.container}
        >
          <View style={signInStyles.titleContainer}>
            <Text style={signInStyles.title}>Welcome Back</Text>
            <Text style={signInStyles.subtitle}>
              Sign in to continue managing your restock operations
            </Text>
          </View>

          {showReturningUserButton && lastAuthMethod === 'google' && (
            <TouchableOpacity 
              style={signInStyles.returningUserButton}
              onPress={handleReturningUserSignIn}
              disabled={loading}
            >
              <Text style={signInStyles.returningUserButtonText}>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={signInStyles.googleButton}
            onPress={() => handleGoogleSignIn(false)}
            disabled={loading}
          >
            <Text style={signInStyles.googleButtonText}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={signInStyles.linkButton}
            onPress={() => router.push('/auth/welcome-back')}
            disabled={loading}
          >
            <Text style={signInStyles.linkButtonText}>
              Returning SSO user? Welcome back
            </Text>
          </TouchableOpacity>

          <View style={signInStyles.divider}>
            <View style={signInStyles.dividerLine} />
            <Text style={signInStyles.dividerText}>or</Text>
            <View style={signInStyles.dividerLine} />
          </View>

          <TextInput
            style={signInStyles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#666666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={signInStyles.input}
            placeholder="Enter your password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={[signInStyles.button, loading && signInStyles.buttonDisabled]}
            onPress={onSignInPress}
            disabled={loading}
          >
            <Text style={signInStyles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={signInStyles.linkContainer}>
            <Text style={signInStyles.linkText}>Don't have an account? </Text>
            <Link href="/auth/sign-up" asChild>
              <Text style={signInStyles.linkTextBold}>Sign up</Text>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </AuthGuard>
  );
} 