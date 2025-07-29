import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSignUp, useSignIn, useAuth, useUser, useSSO, useClerk } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend/services/user-profile';
import { SessionManager } from '../backend/services/session-manager';
import { ClerkClientService } from '../backend/services/clerk-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import AuthGuard from './components/AuthGuard';
import { useAuthContext } from './_contexts/AuthContext';
import { welcomeStyles } from '../styles/components/welcome';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [showStoreNameInput, setShowStoreNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleSSO, setIsGoogleSSO] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [showReturningUserButton, setShowReturningUserButton] = useState(false);
  const [lastAuthMethod, setLastAuthMethod] = useState<'google' | 'email' | null>(null);
  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);
  const [oauthStartTime, setOauthStartTime] = useState<number | null>(null);
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signIn } = useSignIn();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const { isGoogleUser } = useAuthContext();

  // Check if user is a returning user on component mount
  useEffect(() => {
    checkReturningUser();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    console.log('Welcome screen auth state changed:', { isLoaded, isSignedIn, userId });
    
    if (isLoaded && isSignedIn && userId) {
      console.log('User is already authenticated on welcome screen:', userId);
      console.log('User object:', user);
      
      // Check if this is a fresh OAuth completion
      const checkOAuthCompletion = async () => {
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        console.log('Checking OAuth completion flag:', justCompletedSSO);
        
        if (justCompletedSSO === 'true') {
          console.log('OAuth just completed, routing to sso-profile-setup');
          await AsyncStorage.removeItem('justCompletedSSO');
          
          // Check if user is a Google user
          if (user) {
            const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
            const isGoogleUser = userEmail?.includes('@gmail.com') || userEmail?.includes('@googlemail.com') || userEmail?.includes('@google.com');
            
            if (isGoogleUser) {
              console.log('OAuth user is Google user, immediately routing to sso-profile-setup');
              router.replace('/sso-profile-setup');
            } else {
              console.log('OAuth user is not Google user, routing to profile-setup');
              router.replace('/profile-setup');
            }
          }
        } else {
          console.log('Not a fresh OAuth completion, letting AuthContext handle routing');
        }
      };
      
      checkOAuthCompletion();
    } else if (isLoaded && !isSignedIn) {
      console.log('User not authenticated, welcome screen is appropriate');
    }
  }, [isLoaded, isSignedIn, userId, user]);

  // Enhanced OAuth completion detection with session refresh
  useEffect(() => {
    const detectOAuthCompletion = async () => {
      if (!isOAuthInProgress || !oauthStartTime) return;
      
      const elapsed = Date.now() - oauthStartTime;
      console.log('OAuth progress check:', { elapsed, isSignedIn, userId, isLoaded });
      
      // If OAuth has been in progress for more than 5 seconds and user is authenticated
      if (elapsed > 5000 && isSignedIn && userId) {
        console.log('OAuth completion detected - user authenticated after OAuth');
        setIsOAuthInProgress(false);
        setOauthStartTime(null);
        
        // Use the new auth state polling service
        const authSuccess = await ClerkClientService.handleOAuthCompletion(() => ({
          isLoaded,
          isSignedIn
        }));
        
        if (authSuccess) {
          console.log('OAuth completion handled successfully with auth state polling');
          
          // Check if user is a Google user and route immediately
          if (user) {
            const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
            const isGoogleUser = userEmail?.includes('@gmail.com') || userEmail?.includes('@googlemail.com') || userEmail?.includes('@google.com');
            
            if (isGoogleUser) {
              console.log('OAuth user is Google user, immediately routing to sso-profile-setup');
              router.replace('/sso-profile-setup');
            } else {
              console.log('OAuth user is not Google user, immediately routing to profile-setup');
              router.replace('/profile-setup');
            }
          }
        } else {
          console.log('OAuth completion failed - session refresh unsuccessful');
          Alert.alert('Authentication Error', 'Failed to complete authentication. Please try again.');
        }
      }
    };
    
    if (isOAuthInProgress) {
      const interval = setInterval(detectOAuthCompletion, 1000);
      return () => clearInterval(interval);
    }
  }, [isOAuthInProgress, oauthStartTime, isSignedIn, userId, user, clerk]);

  // Force session refresh after OAuth completion with retry logic
  useEffect(() => {
    const forceSessionRefresh = async () => {
      if (!isOAuthInProgress || !oauthStartTime) return;
      
      const elapsed = Date.now() - oauthStartTime;
      
      // If OAuth has been in progress for more than 10 seconds but user is not authenticated
      if (elapsed > 10000 && !isSignedIn) {
        console.log('OAuth in progress but user not authenticated, attempting session refresh');
        
        try {
                            // Use the new auth state polling service
          const authSuccess = await ClerkClientService.pollForAuthState(() => ({
            isLoaded: Boolean(isLoaded),
            isSignedIn: Boolean(isSignedIn)
          }), 3, 1000);
          
          if (authSuccess) {
            console.log('Auth state polling successful, user now authenticated');
            setIsOAuthInProgress(false);
            setOauthStartTime(null);
            
            // Handle OAuth completion
            const oauthSuccess = await ClerkClientService.handleOAuthCompletion(() => ({
          isLoaded: Boolean(isLoaded),
          isSignedIn: Boolean(isSignedIn)
        }));
            
            if (oauthSuccess && user) {
              const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
              const isGoogleUser = userEmail?.includes('@gmail.com') || userEmail?.includes('@googlemail.com') || userEmail?.includes('@google.com');
              
              if (isGoogleUser) {
                console.log('Session refresh: Google user authenticated, routing to sso-profile-setup');
                router.replace('/sso-profile-setup');
              } else {
                console.log('Session refresh: Non-Google user authenticated, routing to profile-setup');
                router.replace('/profile-setup');
              }
            }
          } else {
            console.log('Session refresh failed after retries');
          }
        } catch (error) {
          console.error('Error during session refresh:', error);
        }
      }
    };
    
    if (isOAuthInProgress) {
      const interval = setInterval(forceSessionRefresh, 2000);
      return () => clearInterval(interval);
    }
  }, [isOAuthInProgress, oauthStartTime, isSignedIn, userId, user, clerk]);

  // Session restoration mechanism for OAuth completion
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        console.log('Session restoration check:', { isSignedIn, userId, justCompletedSSO });
        
        if (justCompletedSSO === 'true' && !isSignedIn) {
          console.log('OAuth completed but session not restored, attempting manual restoration');
          
          // Use the new auth state polling service
          const authSuccess = await ClerkClientService.pollForAuthState(() => ({
            isLoaded: isLoaded || false,
            isSignedIn: isSignedIn || false
          }), 3, 2000);
          
          if (authSuccess) {
            console.log('Session restoration successful');
            await AsyncStorage.removeItem('justCompletedSSO');
            
            if (user) {
              const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
              const isGoogleUser = userEmail?.includes('@gmail.com') || userEmail?.includes('@googlemail.com') || userEmail?.includes('@google.com');
              
              if (isGoogleUser) {
                console.log('Session restored: Google user, routing to sso-profile-setup');
                router.replace('/sso-profile-setup');
              } else {
                console.log('Session restored: Non-Google user, routing to profile-setup');
                router.replace('/profile-setup');
              }
            }
          } else {
            console.log('Session restoration failed, user still not authenticated');
          }
        }
      } catch (error) {
        console.error('Error in session restoration:', error);
      }
    };
    
    restoreSession();
  }, [isSignedIn, userId, isLoaded, user, clerk]);

  // Monitor OAuth flow state with improved timeout
  useEffect(() => {
    const checkOAuthState = () => {
      console.log('OAuth state check:', {
        isOAuthInProgress,
        isSignedIn,
        userId,
        isLoaded,
        loading,
        oauthStartTime: oauthStartTime ? Date.now() - oauthStartTime : null
      });
    };

    if (isOAuthInProgress) {
      // Check OAuth state every 2 seconds while in progress
      const interval = setInterval(checkOAuthState, 2000);
      return () => clearInterval(interval);
    }
  }, [isOAuthInProgress, isSignedIn, userId, isLoaded, loading, oauthStartTime]);

  // Enhanced timeout mechanism for OAuth
  useEffect(() => {
    if (!isOAuthInProgress || !oauthStartTime) return;
    
    const timeout = setTimeout(async () => {
      const elapsed = Date.now() - oauthStartTime;
      console.log('OAuth timeout check - elapsed time:', elapsed);
      
      if (!isSignedIn && elapsed > 60000) { // 60 second timeout
        console.log('OAuth timeout: User still not authenticated after 60 seconds');
        setIsOAuthInProgress(false);
        setOauthStartTime(null);
        
        // Clear OAuth flags
        await ClerkClientService.clearOAuthFlags();
        
        Alert.alert(
          'OAuth Timeout', 
          'The OAuth flow did not complete. This might be due to network issues or the OAuth provider taking too long to respond. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                // Allow user to try again
                setIsOAuthInProgress(false);
                setOauthStartTime(null);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    }, 60000); // 60 second timeout
    
    return () => clearTimeout(timeout);
  }, [isOAuthInProgress, oauthStartTime, isSignedIn]);

  // Handle deep link returns from OAuth with improved detection
  useEffect(() => {
    const handleDeepLink = async () => {
      try {
        // Check if we have a pending OAuth session
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        if (justCompletedSSO === 'true' && isSignedIn && userId) {
          console.log('Deep link detected with OAuth completion, user is authenticated');
          await AsyncStorage.removeItem('justCompletedSSO');
          
          // Check if user is a Google user
          if (user) {
            const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
            const isGoogleUser = userEmail?.includes('@gmail.com') || userEmail?.includes('@googlemail.com') || userEmail?.includes('@google.com');
            
            if (isGoogleUser) {
              console.log('Deep link: Google user authenticated, routing to sso-profile-setup');
              router.replace('/sso-profile-setup');
            } else {
              console.log('Deep link: Non-Google user authenticated, routing to profile-setup');
              router.replace('/profile-setup');
            }
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Check for deep link on mount and when auth state changes
    handleDeepLink();
  }, [isSignedIn, userId, user]);

  // Force refresh mechanism for OAuth completion
  useEffect(() => {
    const checkOAuthRefresh = async () => {
      try {
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        if (justCompletedSSO === 'true' && !isSignedIn) {
          console.log('OAuth completion detected but user not authenticated, forcing refresh');
          // Force a small delay and then check again
          setTimeout(async () => {
            const refreshedJustCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
            if (refreshedJustCompletedSSO === 'true' && isSignedIn && userId) {
              console.log('OAuth refresh successful, user now authenticated');
              await AsyncStorage.removeItem('justCompletedSSO');
              
              if (user) {
                const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
                const isGoogleUser = userEmail?.includes('@gmail.com') || userEmail?.includes('@googlemail.com') || userEmail?.includes('@google.com');
                
                if (isGoogleUser) {
                  console.log('OAuth refresh: Google user authenticated, routing to sso-profile-setup');
                  router.replace('/sso-profile-setup');
                } else {
                  console.log('OAuth refresh: Non-Google user authenticated, routing to profile-setup');
                  router.replace('/profile-setup');
                }
              }
            }
          }, 2000); // 2 second delay for refresh
        }
      } catch (error) {
        console.error('Error checking OAuth refresh:', error);
      }
    };
    
    checkOAuthRefresh();
  }, [isSignedIn, userId, user]);

  const checkReturningUser = async () => {
    try {
      const returning = await SessionManager.isReturningUser();
      setShowReturningUserButton(returning);
      
      // Get the last authentication method
      const session = await SessionManager.getUserSession();
      if (session?.lastAuthMethod) {
        setLastAuthMethod(session.lastAuthMethod);
        console.log('Last auth method:', session.lastAuthMethod);
      }
    } catch (error) {
      console.error('Error checking returning user status:', error);
    }
  };

  // Handle returning user sign-in
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
        await handleGoogleSignup(true); // true indicates returning user flow
      } else {
        Alert.alert('Error', 'No cached session found. Please sign up normally.');
      }
    } catch (error) {
      console.error('Error with returning user sign-in:', error);
      Alert.alert('Error', 'Failed to sign in as returning user. Please try the normal sign-up process.');
    } finally {
      setLoading(false);
    }
  };

  // Store the email, name, and store name for use after verification
  const saveUserData = async (email: string, name: string, storeName: string) => {
    try {
      await AsyncStorage.setItem('tempUserData', JSON.stringify({ email, name, storeName }));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleEmailSignup = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setShowEmailSignup(true);
  };

  const { startSSOFlow } = useSSO();

  const handleGoogleSignup = async (isReturningUserFlow = false) => {
    if (!isLoaded) return;

    // Check if user is already authenticated
    if (isSignedIn && userId) {
      console.log('User is already authenticated, AuthContext will handle routing');
      return;
    }

    setLoading(true);
    setIsOAuthInProgress(true);
    setOauthStartTime(Date.now());
    
    try {
      console.log('Starting Google OAuth flow...');
      console.log('Current auth state:', { isSignedIn, userId, isLoaded });
      console.log('Clerk isLoaded:', isLoaded);
      
      // Set a flag that OAuth is starting
      await AsyncStorage.setItem('justCompletedSSO', 'false');
      
      // Test if startSSOFlow is available
      if (!startSSOFlow) {
        console.error('startSSOFlow is not available');
        Alert.alert('Error', 'OAuth flow is not available. Please try again.');
        return;
      }
      
      // Use Clerk's useSSO hook for native OAuth flow
      console.log('Calling startSSOFlow with strategy: oauth_google');
      console.log('Redirect URL:', Linking.createURL('/sso-profile-setup', { scheme: 'restock' }));
      
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/sso-profile-setup', { scheme: 'restock' }),
      });
      
      console.log('startSSOFlow result:', result);
      console.log('OAuth flow initiated - user will be redirected to Google');
      console.log('OAuth flow started - waiting for completion...');
      
      // Check if the OAuth flow created a session
      if (result.authSessionResult?.type === 'success') {
        console.log('OAuth flow successful, session created');
        console.log('Session ID:', result.createdSessionId);
        
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
        } else {
          console.log('OAuth completion failed - auth state polling unsuccessful');
        }
      }
      
      // The timeout is now handled by the useEffect above
      console.log('OAuth flow initiated successfully, monitoring for completion...');
      
    } catch (err: any) {
      console.error('Google OAuth error:', JSON.stringify(err, null, 2));
      console.error('OAuth error details:', {
        message: err.message,
        code: err.code,
        status: err.status,
        errors: err.errors
      });
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      setIsOAuthInProgress(false);
      setOauthStartTime(null);
      // Clear OAuth flags on error
      await ClerkClientService.clearOAuthFlags();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    // For email signup users, require name
    if (showEmailSignup && !name.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }

    if (showEmailSignup && !password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (showEmailSignup && password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Creating account for email:', email);
      console.log('User name for account:', name);
      
      // Save user data for use after verification
      await saveUserData(email, name, storeName);

      if (showEmailSignup && !isSignedIn) {
        // Email signup flow - user not yet authenticated
        await signUp.create({
          emailAddress: email,
          password: password,
        });

        console.log('SignUp state after create:', JSON.stringify(signUp, null, 2));

        // Send verification email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        
        console.log('Verification email prepared');
        
        Alert.alert(
          'Verification Email Sent!',
          'Please check your email and enter the verification code.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/auth/verify-email');
              }
            }
          ]
        );
      } else if ((isGoogleSSO || isSignedIn) && userId) {
        // Google SSO flow or authenticated user - user is already authenticated
        console.log('Google SSO flow or authenticated user - user already authenticated');
        console.log('Saving user profile with data:', {
          userId,
          email,
          storeName,
          name,
          nameLength: name?.length || 0,
          nameIsEmpty: !name || name.trim() === ''
        });
        
        // Use the new ensureUserProfile method
        try {
          const result = await UserProfileService.ensureUserProfile(userId, email, storeName, name);
          
          if (result.error) {
            console.error('Failed to ensure user profile:', result.error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
          } else {
            console.log('User profile ensured successfully');
            console.log('Profile data:', result.data);
            
            // Save session data for returning user detection
            await SessionManager.saveUserSession({
              userId,
              email,
              storeName,
              wasSignedIn: true,
              lastSignIn: Date.now(),
              lastAuthMethod: isGoogleSSO ? 'google' : 'email',
            });
            
            // Navigate to dashboard
            router.replace('/(tabs)/dashboard');
          }
        } catch (error) {
          console.error('Error ensuring user profile:', error);
          Alert.alert('Error', 'Failed to save your profile. Please try again.');
        }
      } else if (isSignedIn && userId && !isGoogleSSO) {
        // Email signup user who is already authenticated (from sign-up screen)
        console.log('Email signup user already authenticated, completing setup');
        console.log('Saving user profile with data:', {
          userId,
          email,
          storeName,
          name,
          nameLength: name?.length || 0,
          nameIsEmpty: !name || name.trim() === '',
          isEmailSignup: showEmailSignup
        });
        
        // For email signup users, use the manually entered name
        const finalName = showEmailSignup ? name : (name || '');
        console.log('Final name to be saved:', finalName);
        
        // Use the new ensureUserProfile method
        try {
          const result = await UserProfileService.ensureUserProfile(userId, email, storeName, finalName);
          
          if (result.error) {
            console.error('Failed to ensure user profile:', result.error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
          } else {
            console.log('User profile ensured successfully');
            console.log('Profile data:', result.data);
            
            // Save session data for returning user detection
            await SessionManager.saveUserSession({
              userId,
              email,
              storeName,
              wasSignedIn: true,
              lastSignIn: Date.now(),
            });
            
            // Navigate to dashboard
            router.replace('/(tabs)/dashboard');
          }
        } catch (error) {
          console.error('Error ensuring user profile:', error);
          Alert.alert('Error', 'Failed to save your profile. Please try again.');
        }
      } else {
        console.log('Google SSO - proceeding to store name input');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOptions = () => {
    setShowEmailSignup(false);
    setShowStoreNameInput(false);
    setEmail('');
    setName('');
    setPassword('');
    setStoreName('');
    setIsGoogleSSO(false);
    setGoogleUserData(null);
  };

  return (
    <AuthGuard requireNoAuth={true}>
      <ScrollView contentContainerStyle={welcomeStyles.scrollViewContent}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={welcomeStyles.container}
        >
          <View style={welcomeStyles.content}>
                      {lastAuthMethod === 'google' ? (
            <>
              <Text style={welcomeStyles.title}>Welcome back!</Text>
              <Text style={welcomeStyles.subtitle}>
                Sign in with Google to continue
              </Text>
              <Text style={welcomeStyles.description}>
                We'll get you back to managing your restock operations in no time.
              </Text>
            </>
          ) : lastAuthMethod === 'email' ? (
            <>
              <Text style={welcomeStyles.title}>Welcome back!</Text>
              <Text style={welcomeStyles.subtitle}>
                Sign in with your email
              </Text>
              <Text style={welcomeStyles.description}>
                Enter your credentials to continue managing your restock operations.
              </Text>
            </>
          ) : (
            <>
              <Text style={welcomeStyles.title}>Welcome to Restock</Text>
              <Text style={welcomeStyles.subtitle}>
                Streamline your store's restocking process
              </Text>
              <Text style={welcomeStyles.description}>
                Create restock sessions, manage suppliers, and generate professional emails automatically.
              </Text>
            </>
          )}

          {!showEmailSignup && !showStoreNameInput ? (
            <View style={welcomeStyles.optionsSection}>
              {lastAuthMethod === 'google' ? (
                // Google-focused UI for returning Google users
                <>
                  <Text style={welcomeStyles.sectionTitle}>Sign In</Text>
                  
                  <TouchableOpacity 
                    style={[welcomeStyles.googleButton, welcomeStyles.primaryButton]}
                    onPress={() => handleGoogleSignup(false)}
                    disabled={loading}
                  >
                    <Text style={[welcomeStyles.googleButtonText, welcomeStyles.primaryButtonText]}>
                      {loading ? 'Signing in...' : 'Continue with Google'}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={welcomeStyles.divider}>
                    <View style={welcomeStyles.dividerLine} />
                    <Text style={welcomeStyles.dividerText}>or</Text>
                    <View style={welcomeStyles.dividerLine} />
                  </View>
                  
                  <TouchableOpacity 
                    style={welcomeStyles.secondaryButton}
                    onPress={() => router.push('/auth/sign-in')}
                  >
                    <Text style={welcomeStyles.secondaryButtonText}>Sign in with Email</Text>
                  </TouchableOpacity>
                </>
              ) : lastAuthMethod === 'email' ? (
                // Email-focused UI for returning email users
                <>
                  <Text style={welcomeStyles.sectionTitle}>Sign In</Text>
                  
                  <TouchableOpacity 
                    style={[welcomeStyles.button, welcomeStyles.primaryButton]}
                    onPress={() => router.push('/auth/sign-in')}
                  >
                    <Text style={[welcomeStyles.buttonText, welcomeStyles.primaryButtonText]}>
                      Sign in with Email
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={welcomeStyles.divider}>
                    <View style={welcomeStyles.dividerLine} />
                    <Text style={welcomeStyles.dividerText}>or</Text>
                    <View style={welcomeStyles.dividerLine} />
                  </View>
                  
                  <TouchableOpacity 
                    style={welcomeStyles.googleButton}
                    onPress={() => handleGoogleSignup(false)}
                    disabled={loading}
                  >
                    <Text style={welcomeStyles.googleButtonText}>
                      {loading ? 'Signing in...' : 'Continue with Google'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Default UI for new users
                <>
                  <Text style={welcomeStyles.sectionTitle}>Get Started</Text>
                  
                  <TouchableOpacity 
                    style={welcomeStyles.googleButton}
                    onPress={() => handleGoogleSignup(false)}
                    disabled={loading}
                  >
                    <Text style={welcomeStyles.googleButtonText}>
                      {loading ? 'Signing in...' : 'Continue with Google'}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={welcomeStyles.divider}>
                    <View style={welcomeStyles.dividerLine} />
                    <Text style={welcomeStyles.dividerText}>or</Text>
                    <View style={welcomeStyles.dividerLine} />
                  </View>
                  
                  <View style={welcomeStyles.emailSection}>
                    <TextInput
                      style={welcomeStyles.input}
                      placeholder="Enter your email address" 
                      placeholderTextColor="#6B7F6B"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      style={welcomeStyles.button}
                      onPress={handleEmailSignup}
                    >
                      <Text style={welcomeStyles.buttonText}>Continue with Email</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : showEmailSignup && !showStoreNameInput ? (
            <View style={welcomeStyles.passwordSection}>
              <Text style={welcomeStyles.sectionTitle}>Create your password</Text>
              <TextInput
                style={welcomeStyles.input}
                placeholder="Create a password"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={welcomeStyles.button}
                onPress={() => setShowStoreNameInput(true)}
              >
                <Text style={welcomeStyles.buttonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={welcomeStyles.backButton}
                onPress={handleBackToOptions}
              >
                <Text style={welcomeStyles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={welcomeStyles.storeSection}>
              <Text style={welcomeStyles.sectionTitle}>Tell us about your store</Text>
              {(!isGoogleSSO || (isSignedIn && !name) || showEmailSignup) && (
                <TextInput
                  style={welcomeStyles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#666666"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              )}
              <TextInput
                style={welcomeStyles.input}
                placeholder="Enter your store name"
                placeholderTextColor="#666666"
                value={storeName}
                onChangeText={setStoreName}
                autoCapitalize="words"
              />
              <TouchableOpacity 
                style={[welcomeStyles.button, loading && welcomeStyles.buttonDisabled]}
                onPress={handleCreateAccount}
                disabled={loading}
              >
                <Text style={welcomeStyles.buttonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={welcomeStyles.backButton}
                onPress={() => setShowStoreNameInput(false)}
              >
                <Text style={welcomeStyles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
    </AuthGuard>
  );
} 