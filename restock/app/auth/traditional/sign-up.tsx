import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useThemedStyles } from '../../styles/useThemedStyles';
import { StyleSheet } from 'react-native';
import { ResponsiveContainer } from '../../components/responsive/ResponsiveLayouts';

export default function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      console.log('📡 SSO FLOW: Initiating Clerk SSO flow');
      await AsyncStorage.setItem('oauthProcessing', 'true');

      const redirectUrl = Linking.createURL('/sso-profile-setup', { scheme: 'restock' });
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        console.log('✅ SSO FLOW: Session activated');
        await AsyncStorage.removeItem('oauthProcessing');
        router.replace('/sso-profile-setup' as any);
      } else {
        console.log('❌ SSO FLOW: No session created', result);
        await AsyncStorage.removeItem('oauthProcessing');
        Alert.alert('Sign in failed', 'No session created. Please try again.');
      }
    } catch (err) {
      console.error('❌ SSO FLOW ERROR:', err);
      await AsyncStorage.removeItem('oauthProcessing');
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    }
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.lighter,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },
    title: {
      fontFamily: theme.typography.appTitle.fontFamily,
      fontSize: theme.typography.appTitle.fontSize,
      color: theme.colors.neutral.darkest,
      textAlign: 'center',
      fontWeight: 'bold',
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
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      minHeight: theme.layout.touchTargetMin,
    },
    googleButtonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.neutral.darkest,
      fontWeight: '600',
    },
    button: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      minHeight: theme.layout.touchTargetMin,
    },
    buttonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.neutral.lightest,
      fontWeight: '600',
    },
    linkContainer: {
      alignItems: 'center',
    },
    linkText: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.brand.primary,
      textAlign: 'center',
      fontWeight: '500',
    },
  }));

  return (
    <ResponsiveContainer>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Create your account</Text>
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignUp}
      >
        <Text style={styles.googleButtonText}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/auth/email-signup' as any)}
      >
        <Text style={styles.buttonText}>
          Sign up with Email
        </Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <TouchableOpacity
          onPress={() => router.push('/auth/traditional/sign-in' as any)}
        >
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </ResponsiveContainer>
  );
}
