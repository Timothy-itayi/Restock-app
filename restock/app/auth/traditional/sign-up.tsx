import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { signUpStyles } from '../../../styles/components/sign-up';

export default function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      console.log('📡 SSO FLOW: Initiating Clerk SSO flow');
      await AsyncStorage.setItem('oauthProcessing', 'true');

      const redirectUrl = Linking.createURL('/sso-profile-setup' as any, { scheme: 'restock' });
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

  return (
    <View style={signUpStyles.container}>
      <View style={signUpStyles.titleContainer}>
        <Text style={signUpStyles.title}>Create your account</Text>
      </View>

      <TouchableOpacity
        style={signUpStyles.googleButton}
        onPress={handleGoogleSignUp}
      >
        <Text style={signUpStyles.googleButtonText}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={signUpStyles.button}
        onPress={() => router.push('/auth/email-signup' as any)}
      >
        <Text style={signUpStyles.buttonText}>
          Sign up with Email
        </Text>
      </TouchableOpacity>

      <View style={signUpStyles.linkContainer}>
        <TouchableOpacity
          onPress={() => router.push('/auth/traditional/sign-in' as any)}
        >
          <Text style={signUpStyles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
