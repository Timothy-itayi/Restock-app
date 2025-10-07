// app/auth/AuthIndexScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnifiedAuth } from './UnifiedAuthProvider';
import { ClerkClientService } from '../../backend/services/clerk-client';
import { useThemedStyles } from '../../styles/useThemedStyles';
import { StyleSheet } from 'react-native';
import { ResponsiveContainer } from '../components/responsive/ResponsiveLayouts';

export default function AuthIndexScreen() {
  const { startSSOFlow } = useSSO();
  const auth = useUnifiedAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  type AuthFlowState = 'form' | 'authenticating' | 'welcome' | 'complete';
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>('form');

  // Check existing OAuth completion
  useEffect(() => {
    const checkExistingOAuthCompletion = async () => {
      const justCompletedSSO = await ClerkClientService.isOAuthJustCompleted();
      const newSSOSignUp = await ClerkClientService.isNewSSOSignUp();

      if (justCompletedSSO && newSSOSignUp) {
        setAuthFlowState('authenticating');
        await AsyncStorage.removeItem('justCompletedSSO');
      }
    };
    checkExistingOAuthCompletion();
  }, []);

  const handleGoogleSignUp = async () => {
    console.log('👤 USER ACTION: Google Sign Up button clicked');
    
    if (authFlowState !== 'form') {
      console.log('⚠️  USER ACTION: Google Sign Up blocked - form not in correct state:', authFlowState);
      return;
    }

    console.log('🚀 SSO FLOW: Starting Google OAuth process');
    setGoogleLoading(true);
    
    // Clear any stale session cache before starting OAuth to prevent false profile completion detection
    console.log('🧹 SSO FLOW: Clearing stale session cache before OAuth');
    const { SessionManager } = await import('../../backend/services/session-manager');
    await SessionManager.clearUserSession();
    
    await AsyncStorage.setItem('oauthProcessing', 'true');

    try {
      console.log('📡 SSO FLOW: Initiating Clerk SSO flow');
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/sso-profile-setup', { scheme: 'restock' }),
      });

      console.log('📋 SSO FLOW: Clerk SSO result:', {
        success: result.authSessionResult?.type === 'success',
        hasSessionId: !!result.createdSessionId,
        hasSetActive: !!result.setActive
      });

      if (result.authSessionResult?.type === 'success') {
        console.log('✅ SSO FLOW: OAuth successful, setting up session');
        setAuthFlowState('authenticating');
        await ClerkClientService.setSSOSignUpFlags();
        if (result.createdSessionId && result.setActive) {
          console.log('🔧 SSO FLOW: Activating Clerk session');
          await result.setActive({ session: result.createdSessionId });
          console.log('✅ SSO FLOW: Session activated, OAuth should complete in UnifiedAuthProvider');
        }
      } else {
        console.log('❌ SSO FLOW: OAuth failed, cleaning up');
        setAuthFlowState('form');
        await AsyncStorage.removeItem('oauthProcessing');
      }
    } catch (err) {
      console.error('❌ SSO FLOW: Google OAuth error:', err);
      Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
      setAuthFlowState('form');
      await AsyncStorage.removeItem('oauthProcessing');
      console.log('🧹 SSO FLOW: Cleaned up OAuth flags after error');
    } finally {
      setGoogleLoading(false);
      console.log('🔄 SSO FLOW: Google sign up flow completed');
    }
  };

  // Timeout progression
  useEffect(() => {
    if (authFlowState === 'authenticating' || authFlowState === 'welcome') {
      const timeout = setTimeout(() => {
        if (authFlowState === 'authenticating') setAuthFlowState('welcome');
        else if (authFlowState === 'welcome') router.replace('/sso-profile-setup');
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [authFlowState]);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.lighter,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: theme.typography.appTitle.fontFamily,
      fontSize: theme.typography.appTitle.fontSize,
      fontWeight: 'bold',
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
      color: theme.colors.neutral.darkest,
    },
    subtitle: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.brand.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
      fontWeight: '600',
    },
    primaryButton: {
      backgroundColor: theme.colors.brand.primary,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      borderRadius: 8,
      marginBottom: theme.spacing.lg,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      color: theme.colors.neutral.lightest,
      fontSize: theme.typography.buttonText.fontSize,
      fontWeight: '600',
      textAlign: 'center',
    },
    secondaryButton: {
      backgroundColor: theme.colors.neutral.lightest,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      borderRadius: 8,
      marginBottom: theme.spacing.xl,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      borderWidth: 1,
      borderColor: theme.colors.brand.primary,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      color: theme.colors.brand.primary,
      fontSize: theme.typography.buttonText.fontSize,
      fontWeight: '600',
      textAlign: 'center',
    },
    linkButton: {
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
    },
    linkButtonText: {
      fontFamily: theme.typography.bodySmall.fontFamily,
      color: theme.colors.brand.primary,
      fontSize: theme.typography.bodySmall.fontSize,
      fontWeight: '500',
      textAlign: 'center',
    },
  }));

  return (
    <ResponsiveContainer>
      <Text style={styles.title}>Welcome to Restock</Text>
      <Text style={styles.subtitle}>Choose how you'd like to get started</Text>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleGoogleSignUp}
        disabled={googleLoading}
      >
        <Text style={styles.primaryButtonText}>
          {googleLoading ? 'Signing up...' : 'Continue with Google'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => router.push('/auth/traditional/sign-up')}
      >
        <Text style={styles.secondaryButtonText}>Create account with email</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => router.push('/auth/traditional/sign-in')}
      >
        <Text style={styles.linkButtonText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ResponsiveContainer>
  );
}
