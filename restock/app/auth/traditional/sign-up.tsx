import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Link } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import UnifiedAuthGuard from '../../components/UnifiedAuthGuard';
import { signUpStyles } from '../../../styles/components/sign-up';

export default function TraditionalSignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    const validation = validatePassword(newPassword);
    
    const newErrors: {[key: string]: string} = {};
    if (!validation.minLength) newErrors.length = 'Password must be at least 8 characters';
    if (!validation.hasUpperCase) newErrors.uppercase = 'Password must contain uppercase letter';
    if (!validation.hasLowerCase) newErrors.lowercase = 'Password must contain lowercase letter';
    if (!validation.hasNumbers) newErrors.numbers = 'Password must contain number';
    if (!validation.hasSpecialChar) newErrors.special = 'Password must contain special character';
    
    setErrors(newErrors);
  };

  const onSignUpPress = async () => {
    console.log('🔴 Traditional sign-up form submitted');
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      Alert.alert('Error', 'Please ensure your password meets all requirements');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Creating traditional email account for:', email);
      
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
              router.push('/auth/traditional/verify-email');
            }
          }
        ]
      );
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UnifiedAuthGuard requireNoAuth={true}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={signUpStyles.container}
        >
          <Text style={signUpStyles.title}>Create Account</Text>
          <Text style={signUpStyles.subtitle}>
            Sign up with email to start managing your restock operations
          </Text>

          <TouchableOpacity 
            style={signUpStyles.googleButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={signUpStyles.googleButtonText}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View style={signUpStyles.divider}>
            <View style={signUpStyles.dividerLine} />
            <Text style={signUpStyles.dividerText}>or</Text>
            <View style={signUpStyles.dividerLine} />
          </View>

          <TextInput
            style={signUpStyles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#666666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[signUpStyles.input, Object.keys(errors).length > 0 && signUpStyles.inputError]}
            placeholder="Create a password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={true}
            autoCapitalize="none"
          />

          {Object.keys(errors).length > 0 && (
            <View>
              {Object.entries(errors).map(([key, error]) => (
                <Text key={key} style={signUpStyles.errorText}>• {error}</Text>
              ))}
            </View>
          )}

          <TextInput
            style={signUpStyles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#666666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <Text style={signUpStyles.helpText}>
            Password must be at least 8 characters with uppercase, lowercase, number, and special character
          </Text>

          <TouchableOpacity 
            style={[signUpStyles.button, loading && signUpStyles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={loading}
          >
            <Text style={signUpStyles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={signUpStyles.linkContainer}>
            <Text style={signUpStyles.linkText}>Already have an account? </Text>
            <Link href="/auth/traditional/sign-in" asChild>
              <TouchableOpacity>
                <Text style={signUpStyles.linkTextBold}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </UnifiedAuthGuard>
  );
}