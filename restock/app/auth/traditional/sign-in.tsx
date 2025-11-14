import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useSignIn, useAuth, useSSO, useClerk } from '@clerk/clerk-expo';
import { SessionManager } from '../../../backend/_services/session-manager';

import { EmailAuthService } from '../../../backend/_services/email-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

import { signInStyles } from '../../../styles/components/sign-in';
import useThemeStore from '../../../lib/stores/useThemeStore';
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
    // CRITICAL: Always call useAuth unconditionally first
    const rawAuth = useAuth();
    console.warn('[RESTOCK_PAGE] SignInScreen rendered');
  
    // Then safely extract values
    const isSignedIn = (rawAuth && typeof rawAuth === 'object' && typeof rawAuth.isSignedIn === 'boolean') 
      ? rawAuth.isSignedIn 
      : false;
    
    const { theme } = useThemeStore();
    const { startSSOFlow } = useSSO();
    const { isAuthenticated: unifiedIsAuthenticated, userId: unifiedUserId, isProfileSetupComplete, hasValidProfile, isProfileLoading } = useUnifiedAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [showReturningUserButton, setShowReturningUserButton] = useState(false);
    const [lastAuthMethod, setLastAuthMethod] = useState<'google' | 'email' | null>(null);
    
    // OAuth loading state
    const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { user } = useClerk();

  // Debug navigation arrival and check for existing authentication
  useEffect(() => {
    console.warn('[RESTOCK_PAGE] SignInScreen mounted');
    
    console.warn('[RESTOCK_ROUTE] SignInScreen auth state check', {
      isAuthenticated: unifiedIsAuthenticated,
      userId: unifiedUserId,
      isProfileSetupComplete,
      hasValidProfile,
      isProfileLoading
    });
    
    // If user is already authenticated and has complete profile, redirect to dashboard
    if (unifiedIsAuthenticated && unifiedUserId && !isProfileLoading && isProfileSetupComplete && hasValidProfile) {
      console.warn('[RESTOCK_ROUTE] Redirecting authenticated user with profile to dashboard');
      router.replace('/(tabs)/dashboard' as any);
      return;
    }
    
    // If user is authenticated but profile incomplete, redirect to profile setup
    if (unifiedIsAuthenticated && unifiedUserId && !isProfileLoading && !hasValidProfile) {
      console.warn('[RESTOCK_ROUTE] Redirecting authenticated user to traditional setup');
      router.replace('/auth/traditional/profile-setup' as any);
      return;
    }
    
    console.warn('[RESTOCK_ROUTE] Staying on sign-in page');
    
    return () => {
      console.log('🔘 SignInScreen: Component unmounting');
    };
  }, [unifiedIsAuthenticated, unifiedUserId, isProfileSetupComplete, hasValidProfile, isProfileLoading]);
  

  // Check if user is a returning user on component mount
  useEffect(() => {
    checkReturningUser();
  }, []);

  // Check and clear OAuth flags if user is already authenticated
  useEffect(() => {
    const checkOAuthFlags = async () => {
      if (isLoaded) {
        // Only check OAuth flags for OAuth users, not email/password users
        // This prevents interference with email/password authentication flow
        console.log('Skipping OAuth flag check for sign-in screen');
      }
    };
    
    checkOAuthFlags();
  }, [isLoaded, isSignedIn]);

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

    setGoogleLoading(true);
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
      console.error('[RESTOCK_AUTH] Returning user sign-in error:', error);
      Alert.alert('Error', 'Failed to sign in as returning user. Please try the normal sign-in process.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSignInPress = async () => {
      console.warn('[RESTOCK_AUTH] Email sign-in button pressed', { email: email.slice(0, 3) + '***' });

    if (!email.trim()) {
      console.warn('[RESTOCK_AUTH] Email validation failed - empty');
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      console.warn('[RESTOCK_AUTH] Password validation failed - empty');
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!isLoaded) {
      const now = Date.now();
      console.warn('[RESTOCK_AUTH] ❌ Email sign-in BLOCKED - Clerk not loaded yet', {
        timestamp: now,
        isLoaded: false,
        message: 'This is likely causing the auth flow issue in TestFlight'
      });
      Alert.alert(
        'Please Wait',
        'Authentication system is still initializing. Please wait a moment and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.warn('[RESTOCK_AUTH] Starting traditional email/password sign in');
    setEmailLoading(true);
    try {
      console.warn('[RESTOCK_AUTH] Creating Clerk sign-in session');
      
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      console.warn('[RESTOCK_AUTH] Clerk sign-in result', {
        status: result.status,
        hasSession: !!result.createdSessionId,
        factors: result.supportedFirstFactors?.map(f => f.strategy) || []
      });

      // Use the dedicated EmailAuthService to handle the authentication flow
      console.warn('[RESTOCK_AUTH] Delegating to EmailAuthService for completion');
      await EmailAuthService.handleEmailSignIn(result as any, email, () => {
        console.warn('[RESTOCK_AUTH] Auth check triggered by EmailAuthService');
      }, setActive);
      
      console.warn('[RESTOCK_AUTH] Email sign-in completed');
      
    } catch (err: any) {
      console.error('[RESTOCK_AUTH] Email sign-in error:', {
        message: err.message,
        errors: err.errors?.map((e: any) => ({ code: e.code, message: e.message })) || [],
        fullError: err
      });
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setEmailLoading(false);
      console.warn('[RESTOCK_AUTH] Email sign-in process completed');
    }
  };

  const handleGoogleSignIn = async (isReturningUserFlow = false) => {
    console.warn('[RESTOCK_AUTH] Google sign-in button clicked (traditional auth screen)', { 
      isReturningUserFlow 
    });
    
    // 🔒 CRITICAL: Check if user is already authenticated before attempting OAuth
    if (unifiedIsAuthenticated && unifiedUserId) {
      console.warn('[RESTOCK_AUTH] User already authenticated; skipping OAuth attempt');
      
      if (!isProfileLoading && hasValidProfile && isProfileSetupComplete) {
        console.warn('[RESTOCK_ROUTE] Redirecting authenticated user with complete profile to dashboard');
        router.replace('/(tabs)/dashboard' as any);
      } else if (!isProfileLoading && !hasValidProfile) {
        console.warn('[RESTOCK_ROUTE] Redirecting authenticated user without profile to setup');
        router.replace('/sso-profile-setup' as any);
      } else {
        console.warn('[RESTOCK_ROUTE] Authenticated user but profile loading; staying on sign-in page');
      }
      return;
    }
    
    if (!isLoaded) {
      const now = Date.now();
      console.warn('[RESTOCK_AUTH] ❌ Google sign-in BLOCKED - Clerk not loaded yet', {
        timestamp: now,
        isLoaded: false,
        message: 'This is likely causing the auth flow issue in TestFlight'
      });
      Alert.alert(
        'Please Wait',
        'Authentication system is still initializing. Please wait a moment and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.warn('[RESTOCK_AUTH] Starting Google OAuth for sign in');
    setGoogleLoading(true);
    try {
      console.warn('[RESTOCK_AUTH] Initiating Google SSO flow from sign-in screen');
      console.warn('[RESTOCK_AUTH] Clearing stale session cache before OAuth');
      await SessionManager.clearUserSession();
      
      // Set OAuth processing flag before starting the flow
      await AsyncStorage.setItem('oauthProcessing', 'true');
      
      // Use Clerk's useSSO hook for native OAuth flow
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        // Use native OAuth callback to avoid restock:/// unmatched route
        redirectUrl: Linking.createURL('/oauth-native-callback', { scheme: 'restock' }),
      });
      
      console.warn('[RESTOCK_AUTH] Google OAuth sign-in result', result);
      
      if (result.authSessionResult?.type === 'success') {
        console.warn('[RESTOCK_AUTH] Google OAuth sign-in successful');
        
        // Transition to authenticating state
        setIsAuthenticating(true);
        setGoogleLoading(false); // Stop the button loading state
        
        // Set the created session as active - this is crucial for OAuth completion
        if (result.createdSessionId) {
          console.warn('[RESTOCK_AUTH] Setting created session as active', result.createdSessionId);
          await setActive({ session: result.createdSessionId });
          console.warn('[RESTOCK_AUTH] Session set as active successfully');
          
          // Log auth state immediately after setActive to track timing
          console.warn('[RESTOCK_AUTH] Auth state immediately after setActive', { isLoaded, isSignedIn });
          console.warn('[RESTOCK_AUTH] OAuth completion successful - session active');
          await AsyncStorage.setItem('justCompletedSSO', 'true');
          await AsyncStorage.removeItem('oauthProcessing');
          
          // Set recent sign-in flag and trigger auth check
          await AsyncStorage.setItem('recentSignIn', 'true');
          // triggerAuthCheck(); // This line was removed as per the edit hint
          
          // Let UnifiedAuthProvider handle the navigation - the loading screen will auto-complete
          
          // NOTE: Session data will be saved only AFTER successful profile setup completion
          // This prevents stale cache with incomplete profile data
          console.warn('[RESTOCK_AUTH] Session data will be saved after profile setup completes');
          console.warn('[RESTOCK_AUTH] Waiting for auth layout redirect');
        } else {
          console.warn('[RESTOCK_AUTH] OAuth successful but no session ID created');
          Alert.alert('Authentication Error', 'Failed to complete authentication. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Google OAuth sign in error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show authenticating screen during OAuth completion
  if (isAuthenticating) {
      return (
        <View>
          <Text>Authenticating...</Text>
        </View>
        
        );
  }

  return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={signInStyles.container}
        >
          <View style={signInStyles.titleContainer}>
            <Text style={signInStyles.title}>Sign In</Text>
            <Text style={signInStyles.subtitle}>
              Sign in to continue managing your restock operations
            </Text>
          </View>


          <TouchableOpacity
            style={[
              signInStyles.googleButton,
              (!isLoaded || googleLoading || emailLoading) && { opacity: 0.5 }
            ]}
            onPress={() => handleGoogleSignIn(false)}
            disabled={!isLoaded || googleLoading || emailLoading}
          >
            <Text style={signInStyles.googleButtonText}>
              {!isLoaded ? 'Initializing...' : googleLoading ? 'Signing in...' : 'Continue with Google'}
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
            placeholderTextColor={theme.neutral.medium}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={signInStyles.input}
            placeholder="Enter your password"
            placeholderTextColor={theme.neutral.medium}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[
              signInStyles.button,
              (!isLoaded || emailLoading || googleLoading) && signInStyles.buttonDisabled
            ]}
            onPress={onSignInPress}
            disabled={!isLoaded || googleLoading || emailLoading}
          >
            <Text style={signInStyles.buttonText}>
              {!isLoaded ? 'Initializing...' : emailLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={signInStyles.linkContainer}>
            <Text style={signInStyles.linkText}>Don't have an account? </Text>
            <Link href="/auth/traditional/sign-up" asChild={true as any}>
              <Text style={signInStyles.linkTextBold}>Sign up</Text>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
  );
} 