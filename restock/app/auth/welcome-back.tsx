import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSignIn, useAuth, useSSO } from '@clerk/clerk-expo';
import { SessionManager } from '../../backend/services/session-manager';
import { EmailAuthService } from '../../backend/services/email-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import UnifiedAuthGuard from '../components/UnifiedAuthGuard';
import { useThemedStyles } from '../../styles/useThemedStyles';
import { StyleSheet } from 'react-native';
import { ResponsiveContainer } from '../components/responsive/ResponsiveLayouts';
import { useUnifiedAuth } from "./UnifiedAuthProvider";

export default function WelcomeBackScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  
  // CRITICAL: Always call useAuth unconditionally first
  const rawAuth = useAuth();
  
  // Then safely extract values
  const isSignedIn = (rawAuth && typeof rawAuth === 'object' && typeof rawAuth.isSignedIn === 'boolean') 
    ? rawAuth.isSignedIn 
    : false;
  
  const { startSSOFlow } = useSSO();
  const { triggerAuthCheck } = useUnifiedAuth();
  
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [lastAuthMethod, setLastAuthMethod] = useState<'google' | 'email' | null>(null);
  const [lastUserEmail, setLastUserEmail] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Check returning user data on component mount
  useEffect(() => {
    checkReturningUserData();
  }, []);

  // Check and clear OAuth flags if user is already authenticated
  useEffect(() => {
    const checkOAuthFlags = async () => {
      if (isLoaded) {
        // Only check OAuth flags for OAuth users, not email/password users
        // This prevents interference with email/password authentication flow
        console.log('Skipping OAuth flag check for welcome-back screen');
      }
    };
    
    checkOAuthFlags();
  }, [isLoaded, isSignedIn]);

  const checkReturningUserData = async () => {
    try {
      // Get the returning user data (email and auth method)
      const returningUserData = await SessionManager.getUserSession();
      
      if (returningUserData) {
        setLastAuthMethod(returningUserData.lastAuthMethod);
        setLastUserEmail(returningUserData.email);
        setEmail(returningUserData.email); // Pre-fill email for returning users
        console.log('Found returning user data:', { 
          method: returningUserData.lastAuthMethod, 
          email: returningUserData.email 
        });
      } else {
        // Fallback to old method for backward compatibility
        const session = await SessionManager.getUserSession();
        if (session?.lastAuthMethod) {
          setLastAuthMethod(session.lastAuthMethod);
          setLastUserEmail(session.email || '');
          setEmail(session.email || ''); // Pre-fill email for returning users
          console.log('Found returning user data (fallback):', { 
            method: session.lastAuthMethod, 
            email: session.email 
          });
        }
      }
    } catch (error) {
      console.error('Error checking returning user data:', error);
    }
  };

  const handleSignBackInWithGoogle = async () => {
    if (!isLoaded) return;

    setGoogleLoading(true);
    try {
      console.log('Starting Google OAuth flow for returning user...');
      
      // Set OAuth processing flag before starting the flow
      await AsyncStorage.setItem('oauthProcessing', 'true');
      
      // Use Clerk's useSSO hook for native OAuth flow
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        // Route exists at app root: app/sso-profile-setup.tsx
        redirectUrl: Linking.createURL('/sso-profile-setup', { scheme: 'restock' }),
      });
      
      console.log('Google OAuth sign in result:', result);
      
      if (result.authSessionResult?.type === 'success') {
        console.log('Google OAuth sign in successful');
        
        // Set the created session as active - this is crucial for OAuth completion
        if (result.createdSessionId) {
          console.log('🔧 Setting created session as active:', result.createdSessionId);
          await setActive({ session: result.createdSessionId });
          console.log('✅ Session set as active successfully');
          
          // Log auth state immediately after setActive to track timing
          console.log('📊 Auth state immediately after setActive:', { isLoaded, isSignedIn });
          
          // OAuth was successful and session is set - trust this result
          // The auth layout will handle automatic redirect when isSignedIn becomes true
          console.log('✅ OAuth completion successful - trusting setActive result');
          await AsyncStorage.setItem('justCompletedSSO', 'true');
          await AsyncStorage.removeItem('oauthProcessing');
          
          // Save session data for returning user detection
          await SessionManager.saveUserSession({
            userId: result.createdSessionId || '',
            email: lastUserEmail || '',
            wasSignedIn: true,
            lastSignIn: Date.now(),
            lastAuthMethod: 'google',
          });
          
          // Let the auth layout handle navigation automatically
          console.log('🔄 Waiting for auth layout to handle automatic redirect...');
        } else {
          console.log('❌ OAuth successful but no session ID created');
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

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!isLoaded) return;

    setEmailLoading(true);
    try {
      console.log('📧 Attempting to sign in with email:', email);
      
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      console.log('📧 SignIn result:', result);

      // Use the dedicated EmailAuthService to handle the authentication flow
      await EmailAuthService.handleEmailSignIn(result as any, email, triggerAuthCheck, setActive);
      
    } catch (err: any) {
      console.error('❌ Sign in error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSignUpWithDifferentEmail = () => {
    // Navigate to the main welcome screen for new signup
    router.replace('/welcome');
  };

  const handleBackToSignIn = () => {
    // Navigate back to the regular sign-in screen
    router.replace('/auth/traditional/sign-in');
  };

  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm);
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.lighter,
      justifyContent: 'center',
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      fontFamily: theme.typography.appTitle.fontFamily,
      fontSize: theme.typography.appTitle.fontSize,
      color: theme.colors.neutral.darkest,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      fontWeight: 'bold',
    },
    subtitle: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.neutral.medium,
      textAlign: 'center',
      lineHeight: theme.typography.bodyMedium.lineHeight,
    },
    methodContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    methodLabel: {
      fontFamily: theme.typography.bodySmall.fontFamily,
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.brand.primary,
      fontWeight: '500',
    },
    googleButton: {
      backgroundColor: theme.colors.neutral.lightest,
      borderWidth: 1,
      borderColor: theme.colors.neutral.light,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      minHeight: theme.layout.touchTargetMin,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      alignSelf: 'center',
    },
    googleButtonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.neutral.darkest,
      fontWeight: '600',
    },
    emailButton: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      minHeight: theme.layout.touchTargetMin,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      alignSelf: 'center',
    },
    emailButtonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.neutral.lightest,
      fontWeight: '600',
    },
    emailFormContainer: {
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      alignSelf: 'center',
    },
    input: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      backgroundColor: theme.colors.neutral.lightest,
      borderWidth: 1,
      borderColor: theme.colors.neutral.light,
      borderRadius: 8,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      color: theme.colors.neutral.darkest,
      minHeight: theme.layout.touchTargetMin + 12,
    },
    button: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      minHeight: theme.layout.touchTargetMin,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.neutral.lightest,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.neutral.light,
    },
    dividerText: {
      fontFamily: theme.typography.bodySmall.fontFamily,
      fontSize: theme.typography.bodySmall.fontSize,
      marginHorizontal: theme.spacing.lg,
      color: theme.colors.neutral.medium,
    },
    secondaryButton: {
      backgroundColor: theme.colors.neutral.lightest,
      borderWidth: 1,
      borderColor: theme.colors.brand.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      minHeight: theme.layout.touchTargetMin,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      alignSelf: 'center',
    },
    secondaryButtonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.brand.primary,
      fontWeight: '600',
    },
    linkButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    linkButtonText: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.brand.primary,
      fontWeight: '500',
    },
  }));

  return (
    <UnifiedAuthGuard requireNoAuth={true}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ResponsiveContainer>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                {lastUserEmail ? `Ready to continue with ${lastUserEmail}?` : 'Ready to continue managing your restock operations?'}
              </Text>
            </View>

            {lastAuthMethod && (
              <View style={styles.methodContainer}>
                <Text style={styles.methodLabel}>
                  You last signed in with {lastAuthMethod === 'google' ? 'Google' : 'email'}
                </Text>
              </View>
            )}

            {/* Show appropriate sign-in method based on last auth method */}
            {lastAuthMethod === 'google' ? (
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleSignBackInWithGoogle}
                disabled={googleLoading}
              >
                <Text style={styles.googleButtonText}>
                  {googleLoading ? 'Signing in...' : 'Sign Back In with Google'}
                </Text>
              </TouchableOpacity>
            ) : lastAuthMethod === 'email' ? (
              <View>
                {!showEmailForm ? (
                  <TouchableOpacity 
                    style={styles.emailButton}
                    onPress={toggleEmailForm}
                    disabled={googleLoading || emailLoading}
                  >
                    <Text style={styles.emailButtonText}>
                      Sign Back In with Email
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emailFormContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email address"
                      placeholderTextColor="#666666"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#666666"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={true}
                      autoCapitalize="none"
                    />

                    <TouchableOpacity 
                      style={[styles.button, emailLoading && styles.buttonDisabled]}
                      onPress={handleEmailSignIn}
                      disabled={emailLoading}
                    >
                      <Text style={styles.buttonText}>
                        {emailLoading ? 'Signing in...' : 'Sign In'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              // No previous auth method - show both options
              <View>
                <TouchableOpacity 
                  style={styles.googleButton}
                  onPress={handleSignBackInWithGoogle}
                  disabled={googleLoading}
                >
                  <Text style={styles.googleButtonText}>
                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.emailButton}
                  onPress={toggleEmailForm}
                  disabled={googleLoading || emailLoading}
                >
                  <Text style={styles.emailButtonText}>
                    Continue with Email
                  </Text>
                </TouchableOpacity>

                {showEmailForm && (
                  <View style={styles.emailFormContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email address"
                      placeholderTextColor="#666666"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#666666"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={true}
                      autoCapitalize="none"
                    />

                    <TouchableOpacity 
                      style={[styles.button, emailLoading && styles.buttonDisabled]}
                      onPress={handleEmailSignIn}
                      disabled={emailLoading}
                    >
                      <Text style={styles.buttonText}>
                        {emailLoading ? 'Signing in...' : 'Sign In'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleSignUpWithDifferentEmail}
              disabled={googleLoading || emailLoading}
            >
              <Text style={styles.secondaryButtonText}>
                Not signed up yet?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={handleBackToSignIn}
              disabled={googleLoading || emailLoading}
            >
              <Text style={styles.linkButtonText}>
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </ResponsiveContainer>
        </KeyboardAvoidingView>
      </ScrollView>
    </UnifiedAuthGuard>
  );
} 