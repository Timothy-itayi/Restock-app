import React, { useState } from 'react';
import {  Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import UnifiedAuthGuard from '../../components/UnifiedAuthGuard';
import { verifyEmailStyles } from '../../../styles/components/verify-email';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Attempting to verify email with code:', code);
      
      const result = await signUp.attemptEmailAddressVerification({
        code: code,
      });

      console.log('Email verification result:', result);

      if (result.status === 'complete') {
        console.log('Email verification successful');
        await setActive({ session: result.createdSessionId });
        
        Alert.alert(
          'Email Verified!',
          'Your email has been verified successfully. You can now complete your profile setup.',
          [
            {
              text: 'Continue',
              onPress: () => {
                router.replace('/auth/traditional/profile-setup');
              }
            }
          ]
        );
      } else {
        console.log('Email verification not complete, status:', result.status);
        Alert.alert('Error', 'Email verification failed. Please check the code and try again.');
      }
    } catch (err: any) {
      console.error('Email verification error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Email verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UnifiedAuthGuard requireNoAuth={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={verifyEmailStyles.container}>
          <Text style={verifyEmailStyles.title}>Verify your email</Text>
          <Text style={verifyEmailStyles.subtitle}>
            We&apos;ve sent a verification code to your email address
          </Text>
          
          <TextInput
            style={verifyEmailStyles.input}
            value={code}
            placeholder="Enter your verification code"
            placeholderTextColor="#666666"
            onChangeText={(code) => setCode(code)}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          
          <TouchableOpacity 
            style={[verifyEmailStyles.button, loading && verifyEmailStyles.buttonDisabled]}
            onPress={handleVerifyEmail}
            disabled={loading}
          >
            <Text style={verifyEmailStyles.buttonText}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={verifyEmailStyles.backButton}
            onPress={() => router.back()}
          >
            <Text style={verifyEmailStyles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </UnifiedAuthGuard>
  );
} 