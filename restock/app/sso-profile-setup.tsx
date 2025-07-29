import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend/services/user-profile';
import { SessionManager } from '../backend/services/session-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthGuard from './components/AuthGuard';
import { useAuthContext } from './_contexts/AuthContext';
import { ssoProfileSetupStyles } from '../styles/components/sso-profile-setup';
import { ErrorLogger } from '../backend/utils/error-logger';

export default function SSOProfileSetupScreen() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { isGoogleUser } = useAuthContext();
  
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  // Utility function to extract user name from user object
  const extractUserName = (user: any): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    } else if (user?.fullName) {
      return user.fullName;
    } else if (user?.username) {
      return user.username;
    }
    return '';
  };

  // Debug: Log when component mounts
  useEffect(() => {
    ErrorLogger.info('SSO Profile Setup: Component mounted', { isSignedIn, userId, isGoogleUser }, { component: 'SSOProfileSetup' });
  }, []);

  // Check if user is authenticated and extract their information
  useEffect(() => {
    ErrorLogger.info('SSO Profile Setup: Auth state changed', { isSignedIn, userId, isGoogleUser }, { component: 'SSOProfileSetup' });
    
    if (isSignedIn && user && isGoogleUser) {
      ErrorLogger.info('SSO Profile Setup: User is authenticated and is Google user', null, { component: 'SSOProfileSetup' });
      const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
      if (userEmail) {
        ErrorLogger.info('SSO Profile Setup: Setting email from user', { userEmail }, { component: 'SSOProfileSetup' });
        setEmail(userEmail);
        
        // Extract name from user object
        const userName = extractUserName(user);
        
        if (userName) {
          ErrorLogger.info('SSO Profile Setup: Setting name from user', { userName }, { component: 'SSOProfileSetup' });
          setName(userName);
        }
      }
    } else if (isSignedIn && user && !isGoogleUser) {
      ErrorLogger.info('SSO Profile Setup: User is authenticated but not Google user, redirecting to profile-setup', null, { component: 'SSOProfileSetup' });
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        router.replace('/profile-setup');
      }, 0);
    } else if (!isSignedIn) {
      ErrorLogger.info('SSO Profile Setup: User is not authenticated, redirecting to welcome', null, { component: 'SSOProfileSetup' });
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        router.replace('/welcome');
      }, 0);
    }
  }, [isSignedIn, user, isGoogleUser]);

  // Check for OAuth completion flag
  useEffect(() => {
    const checkOAuthCompletion = async () => {
      try {
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        if (justCompletedSSO === 'true') {
          console.log('SSO Profile Setup: OAuth completion detected, removing flag');
          await AsyncStorage.removeItem('justCompletedSSO');
        }
      } catch (error) {
        console.error('Error checking OAuth completion flag:', error);
      }
    };
    
    checkOAuthCompletion();
  }, []);

  // Handle deep link arrival
  useEffect(() => {
    const handleDeepLinkArrival = async () => {
      try {
        // If user arrives via deep link and is authenticated, ensure we have their data
        if (isSignedIn && userId && user) {
          console.log('SSO Profile Setup: User arrived via deep link, ensuring data is loaded');
          
          const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
          if (userEmail && !email) {
            console.log('SSO Profile Setup: Setting email from deep link user:', userEmail);
            setEmail(userEmail);
          }
          
          // Extract name from user object if not already set
          if (!name) {
            const userName = extractUserName(user);
            
            if (userName) {
              console.log('SSO Profile Setup: Setting name from deep link user:', userName);
              setName(userName);
            }
          }
        }
      } catch (error) {
        console.error('Error handling deep link arrival:', error);
      }
    };
    
    handleDeepLinkArrival();
  }, [isSignedIn, userId, user, email, name]);

  const handleCreateProfile = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!isSignedIn || !userId) {
      Alert.alert('Error', 'You must be signed in to create a profile');
      return;
    }

    if (!isGoogleUser) {
      Alert.alert('Error', 'This screen is for Google SSO users only');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating SSO user profile with data:', {
        userId,
        email,
        storeName,
        name,
      });
      
      // Use the ensureUserProfile method
      const result = await UserProfileService.ensureUserProfile(userId, email, storeName, name);
      
      if (result.error) {
        console.error('Failed to ensure SSO user profile:', result.error);
        Alert.alert('Error', 'Failed to save your profile. Please try again.');
      } else {
        console.log('SSO user profile ensured successfully');
        console.log('Profile data:', result.data);
        
        // Save session data for returning user detection
        await SessionManager.saveUserSession({
          userId,
          email,
          storeName,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'google',
        });
        
        // Navigate to dashboard
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      console.error('Error ensuring SSO user profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <AuthGuard requireAuth={true}>
      <ScrollView contentContainerStyle={ssoProfileSetupStyles.scrollViewContent}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={ssoProfileSetupStyles.container}
        >
          <View style={ssoProfileSetupStyles.content}>
            <Text style={ssoProfileSetupStyles.title}>Complete Your Profile</Text>
            <Text style={ssoProfileSetupStyles.subtitle}>
              Let's set up your store information to get started
            </Text>
            
            <View style={ssoProfileSetupStyles.formSection}>
              <Text style={ssoProfileSetupStyles.sectionTitle}>Personal Information</Text>
              
              <TextInput
                style={ssoProfileSetupStyles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#666666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              
              <Text style={ssoProfileSetupStyles.sectionTitle}>Store Information</Text>
              
              <TextInput
                style={ssoProfileSetupStyles.input}
                placeholder="Enter your store name"
                placeholderTextColor="#666666"
                value={storeName}
                onChangeText={setStoreName}
                autoCapitalize="words"
              />
              
              <TouchableOpacity 
                style={[ssoProfileSetupStyles.button, loading && ssoProfileSetupStyles.buttonDisabled]}
                onPress={handleCreateProfile}
                disabled={loading}
              >
                <Text style={ssoProfileSetupStyles.buttonText}>
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </AuthGuard>
  );
} 