import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [showStoreNameInput, setShowStoreNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, setActive, isLoaded } = useSignUp();

  // Store the email and store name for use after verification
  const saveUserData = async (email: string, storeName: string) => {
    try {
      await AsyncStorage.setItem('tempUserData', JSON.stringify({ email, storeName }));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleContinueWithEmail = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setShowStoreNameInput(true);
  };

  const handleCreateAccount = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Creating account for email:', email);
      
      // Save user data for use after verification
      await saveUserData(email, storeName);

      // Create account with Clerk
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
              // Navigate to verification screen or handle verification
              router.push('/auth/verify-email');
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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Restock</Text>
        <Text style={styles.subtitle}>
          Streamline your store's restocking process
        </Text>
        <Text style={styles.description}>
          Create restock sessions, manage suppliers, and generate professional emails automatically.
        </Text>

        {!showStoreNameInput ? (
          <View style={styles.emailSection}>
            <Text style={styles.sectionTitle}>Get Started</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={handleContinueWithEmail}
            >
              <Text style={styles.buttonText}>Continue with Email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.storeSection}>
            <Text style={styles.sectionTitle}>Tell us about your store</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your store name"
              value={storeName}
              onChangeText={setStoreName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowStoreNameInput(false)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7F6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailSection: {
    marginBottom: 20,
  },
  storeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
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
    padding: 12,
  },
  backButtonText: {
    color: '#6B7F6B',
    fontSize: 16,
  },
}); 