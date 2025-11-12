import { useSignUp, useSSO } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EmailAuthService } from '../../../backend/_services/email-auth';
import { signUpStyles } from '../../../styles/components/sign-up';
import { ClerkClientService } from '../../../backend/_services/clerk-client';

export default function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    if (!isLoaded || googleLoading || emailLoading) return;
    setGoogleLoading(true);
    try {
      console.log('📡 SSO FLOW: Initiating Clerk SSO flow');
      await AsyncStorage.setItem('oauthProcessing', 'true');

      const redirectUrl = Linking.createURL('/oauth-native-callback' as any, { scheme: 'restock' });
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        console.log('✅ SSO FLOW: Session activated');
        await ClerkClientService.setSSOSignUpFlags();
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
      Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async () => {
    if (!isLoaded) return;
    if (!validate()) return;

    setEmailLoading(true);
    try {
      // Mark this as a new traditional sign-up to isolate from SSO routing
      await EmailAuthService.setTraditionalSignUpFlags();

      console.log('🚀 TRADITIONAL SIGN-UP: Creating Clerk user');
      await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
      });

      console.log('📧 TRADITIONAL SIGN-UP: Preparing email verification');
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      Alert.alert(
        'Check your email',
        'We sent you a 6-digit code. Enter it on the next screen to verify your email.',
        [{ text: 'OK', onPress: () => router.push('/auth/traditional/verify-email' as any) }],
      );
    } catch (err: any) {
      console.error('❌ TRADITIONAL SIGN-UP ERROR:', err);
      const message = err?.errors?.[0]?.message || err?.message || 'Failed to create account. Please try again.';
      Alert.alert('Sign up failed', message);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={signUpStyles.container}
      >
        <View style={signUpStyles.titleContainer}>
          <Text style={signUpStyles.title}>Create your account</Text>
          <Text style={signUpStyles.subtitle}>Use Google or sign up with your email</Text>
        </View>

        <TouchableOpacity
          style={signUpStyles.googleButton}
          onPress={handleGoogleSignUp}
          disabled={googleLoading || emailLoading}
        >
          <Text style={signUpStyles.googleButtonText}>
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        <View style={signUpStyles.divider}>
          <View style={signUpStyles.dividerLine} />
          <Text style={signUpStyles.dividerText}>or</Text>
          <View style={signUpStyles.dividerLine} />
        </View>

        <TextInput
          style={signUpStyles.input}
          placeholder="Email address"
          placeholderTextColor="#666666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={signUpStyles.input}
          placeholder="Create a password (min 8 chars)"
          placeholderTextColor="#666666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={signUpStyles.input}
          placeholder="Confirm password"
          placeholderTextColor="#666666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[signUpStyles.button, emailLoading && signUpStyles.buttonDisabled]}
          onPress={handleEmailSignUp}
          disabled={googleLoading || emailLoading}
        >
          <Text style={signUpStyles.buttonText}>
            {emailLoading ? 'Creating account...' : 'Create account'}
          </Text>
        </TouchableOpacity>

        <View style={signUpStyles.linkContainer}>
          <TouchableOpacity onPress={() => router.push('/auth/traditional/sign-in' as any)}>
            <Text style={signUpStyles.linkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}