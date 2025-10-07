import React, { useState } from 'react';
import {  Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { UnifiedAuthGuard } from '../../components/UnifiedAuthGuard';
import { useThemedStyles } from '../../styles/useThemedStyles';
import { StyleSheet } from 'react-native';
import { ResponsiveContainer } from '../../components/responsive/ResponsiveLayouts';

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

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.lighter,
      justifyContent: 'center',
      alignItems: 'center',
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
      marginBottom: theme.spacing.xxl,
      lineHeight: theme.typography.bodyMedium.lineHeight,
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
      marginBottom: theme.spacing.xl,
      color: theme.colors.neutral.darkest,
      minHeight: theme.layout.touchTargetMin + 12,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
      textAlign: 'center',
    },
    button: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      minHeight: theme.layout.touchTargetMin,
      width: '100%',
      maxWidth: theme.device.isTablet ? 400 : 300,
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
    backButton: {
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
    },
    backButtonText: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.brand.primary,
      fontWeight: '500',
    },
  }));

  return (
    <UnifiedAuthGuard >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ResponsiveContainer style={styles.container}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to your email address
            </Text>
            
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Enter your verification code"
              placeholderTextColor="#666666"
              onChangeText={(code) => setCode(code)}
              keyboardType="number-pad"
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyEmail}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </UnifiedAuthGuard>
  );
} 