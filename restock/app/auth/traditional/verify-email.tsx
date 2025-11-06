import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { EmailAuthService } from '../../../backend/_services/email-auth';
import { SessionManager } from '../../../backend/_services/session-manager';
import { UnifiedAuthGuard } from '../../../lib/components/UnifiedAuthGuard';
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
        await SessionManager.saveUserSession({
          userId: result.createdSessionId || '',
          email: '', // optional: fill if you captured it in state/params
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'email',
        });
        await EmailAuthService.clearTraditionalAuthFlags();
        // Let UnifiedAuthProvider handle the navigation based on the newTraditionalSignUp flag
        console.log('✅ VerifyEmail: Session activated, letting UnifiedAuthProvider handle navigation');
        Alert.alert(
          'Email Verified!',
          'Your email has been verified successfully. You will be redirected to complete your profile setup.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Don't manually navigate - let UnifiedAuthProvider handle it
                console.log('✅ VerifyEmail: User confirmed, UnifiedAuthProvider will redirect');
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
    <UnifiedAuthGuard >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={verifyEmailStyles.container}>
          <Text style={verifyEmailStyles.title}>Verify your email</Text>
          <Text style={verifyEmailStyles.subtitle}>
            We've sent a verification code to your email address
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