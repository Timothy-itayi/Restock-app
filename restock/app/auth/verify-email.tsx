import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { UserProfileService } from '../../backend/services/user-profile';
import { supabase } from '../../backend/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function VerifyEmailScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, setActive, isLoaded } = useSignUp();

  const handleVerifyEmail = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Attempting email verification with code:', code);
      
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log('SignUp attempt result:', JSON.stringify(signUpAttempt, null, 2));
      console.log('SignUp resource state:', JSON.stringify(signUp, null, 2));

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        // Get the user ID from the signUp resource
        const userId = signUp.createdUserId;
        
        console.log('Verification complete. User ID:', userId);
        console.log('Session ID:', signUpAttempt.createdSessionId);
        
        if (userId) {
          // Set the session as active
          if (signUpAttempt.createdSessionId) {
            await setActive({ session: signUpAttempt.createdSessionId });
          }
          
          // Save user data to Supabase
          try {
            // Simple connection test
            try {
              const { data: testData, error: testError } = await supabase
                .from('users')
                .select('count')
                .limit(1);
              
              if (testError) {
                console.error('Supabase connection test failed:', testError);
              } else {
                console.log('Supabase connection verified');
              }
            } catch (testError) {
              console.error('Supabase connection error:', testError);
            }
            
            const tempUserData = await AsyncStorage.getItem('tempUserData');
            if (tempUserData) {
              const { email, storeName } = JSON.parse(tempUserData);
              
              if (email && storeName) {
                console.log('Saving user profile to Supabase:', { userId, email, storeName });
                const saveResult = await UserProfileService.saveUserProfile(userId, email, storeName);
                
                if (saveResult.error) {
                  console.error('Failed to save user profile:', saveResult.error);
                } else {
                  console.log('User profile saved successfully');
                  
                  // Verify the user was actually saved
                  const verifyResult = await UserProfileService.verifyUserProfile(userId);
                  if (verifyResult.data) {
                    console.log('User profile verified in Supabase:', verifyResult.data);
                  } else {
                    console.error('Failed to verify user profile:', verifyResult.error);
                  }
                }
                
                // Clear temporary data
                await AsyncStorage.removeItem('tempUserData');
              }
            }
          } catch (error) {
            console.error('Error saving user profile:', error);
          }
          
          router.replace('/(tabs)/dashboard');
        } else {
          console.error('No user ID available after verification');
          Alert.alert('Error', 'Failed to get user ID. Please try again.');
        }
      } else {
        console.error('Verification status not complete:', signUpAttempt.status);
        console.error(JSON.stringify(signUpAttempt, null, 2));
        
        // Try alternative approach - check if we can get user info from signUp
        const userId = signUp.createdUserId;
        if (userId) {
          console.log('Found user ID from signUp resource:', userId);
          
          // Try to save user data even if session isn't ready
          try {
            const tempUserData = await AsyncStorage.getItem('tempUserData');
            if (tempUserData) {
              const { email, storeName } = JSON.parse(tempUserData);
              
              if (email && storeName) {
                console.log('Saving user profile with fallback approach');
                const saveResult = await UserProfileService.saveUserProfile(userId, email, storeName);
                
                if (saveResult.error) {
                  console.error('Failed to save user profile in fallback:', saveResult.error);
                } else {
                  console.log('User profile saved successfully in fallback');
                  
                  // Verify the user was actually saved
                  const verifyResult = await UserProfileService.verifyUserProfile(userId);
                  if (verifyResult.data) {
                    console.log('User profile verified in Supabase (fallback):', verifyResult.data);
                  } else {
                    console.error('Failed to verify user profile in fallback:', verifyResult.error);
                  }
                }
                
                await AsyncStorage.removeItem('tempUserData');
                
                // Try to redirect to dashboard
                router.replace('/(tabs)/dashboard');
                return;
              }
            }
          } catch (error) {
            console.error('Error in fallback approach:', error);
          }
        }
        
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to your email address
        </Text>
        
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6B7F6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#6B7F6B',
    fontSize: 16,
  },
}); 