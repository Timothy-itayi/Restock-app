import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend/services/user-profile';
import { SessionManager } from '../backend/services/session-manager';
import { ClerkClientService } from '../backend/services/clerk-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnifiedAuth } from './_contexts/UnifiedAuthProvider';
import { SettingUpProfileScreen } from './components/loading';
import { ssoProfileSetupStyles } from '../styles/components/auth/sso/profile-setup';
import { ErrorLogger } from '../backend/utils/error-logger';

export default function SSOProfileSetupScreen() {
  const { user } = useUser();
  const { isAuthenticated, userId, authType } = useUnifiedAuth();
  
  // Debug logging for component mount
  console.log('🔵 SSO Profile Setup: Component rendered', { isAuthenticated, userId, authType });
  
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  // Profile setup loading state
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);

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
    ErrorLogger.info('SSO Profile Setup: Component mounted', { isAuthenticated, userId, authType }, { component: 'SSOProfileSetup' });
  }, []);

  // Check if user is authenticated and extract their information
  useEffect(() => {
    ErrorLogger.info('SSO Profile Setup: Auth state changed', { isAuthenticated, userId, authType }, { component: 'SSOProfileSetup' });
    
    // Add debug logging to understand the user object structure
    console.log('🔍 SSO Profile Setup: User object debug:', {
      hasUser: !!user,
      emailAddresses: user?.emailAddresses,
      primaryEmailAddress: user?.primaryEmailAddress,
      externalAccounts: user?.externalAccounts,
      firstName: user?.firstName,
      lastName: user?.lastName,
      fullName: user?.fullName,
      username: user?.username
    });
    
    if (isAuthenticated && user && authType.type === 'google') {
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
    } else if (isAuthenticated && user && authType.type !== 'google') {
      ErrorLogger.info('SSO Profile Setup: User is authenticated but not Google user, redirecting to traditional profile-setup', null, { component: 'SSOProfileSetup' });
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        router.replace('/auth/traditional/profile-setup');
      }, 0);
    } else if (!isAuthenticated) {
      ErrorLogger.info('SSO Profile Setup: User is not authenticated, redirecting to welcome', null, { component: 'SSOProfileSetup' });
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        router.replace('/welcome');
      }, 0);
    }
  }, [isAuthenticated, user, authType]);

  // Check for OAuth completion flag and clear new sign-up flag
  useEffect(() => {
    const checkOAuthCompletion = async () => {
      try {
        const justCompletedSSO = await ClerkClientService.isOAuthJustCompleted();
        if (justCompletedSSO) {
          console.log('SSO Profile Setup: OAuth completion detected, removing flag');
          await AsyncStorage.removeItem('justCompletedSSO');
        }
        
        // Don't clear the newSSOSignUp flag here - keep it until profile is actually completed
        // This ensures AuthContext knows this is a new sign-up throughout the entire setup process
        console.log('SSO Profile Setup: Keeping newSSOSignUp flag until profile completion');
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
        if (isAuthenticated && userId && user) {
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
  }, [isAuthenticated, userId, user, email, name]);

  const handleCreateProfile = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!isAuthenticated || !userId) {
      Alert.alert('Authentication Error', 'You must be signed in to complete your profile setup');
      return;
    }

    if (authType.type !== 'google') {
      Alert.alert('Access Error', 'This screen is for Google OAuth users only. If you signed up with email/password, please use the regular profile setup.');
      // Redirect to appropriate screen
      router.replace('/auth/traditional/profile-setup');
      return;
    }

    if (!email) {
      Alert.alert('Email Error', 'Unable to retrieve your email from Google. Please try signing in again.');
      return;
    }

    setLoading(true);
    try {
      ErrorLogger.info('SSO Profile Setup: Starting profile creation for Google OAuth user', {
        userId,
        email,
        storeName: storeName.trim(),
        name: name.trim(),
        authType: authType.type
      }, { component: 'SSOProfileSetup', action: 'handleCreateProfile' });
      
      // Use the ensureUserProfile method specifically designed for SSO users
      const result = await UserProfileService.ensureUserProfile(userId, email, storeName.trim(), name.trim());
      
      if (result.error) {
        ErrorLogger.error('SSO Profile Setup: Failed to ensure user profile', result.error, { 
          component: 'SSOProfileSetup', 
          action: 'handleCreateProfile',
          userId,
          email 
        });
        Alert.alert('Setup Failed', 'Failed to save your Google account profile. Please try again.');
      } else {
        ErrorLogger.info('SSO Profile Setup: Profile creation successful', result.data, { 
          component: 'SSOProfileSetup', 
          action: 'handleCreateProfile',
          userId,
          email 
        });
        
        // Transition to setting up profile loading screen
        setIsSettingUpProfile(true);
        
        // Save session data for returning user detection
        await SessionManager.saveUserSession({
          userId,
          email,
          storeName,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'google',
        });
        
        // Small delay to show the loading screen, then navigate
        setTimeout(async () => {
          // Clear the SSO sign-up flags now that profile setup is complete
          await ClerkClientService.clearSSOSignUpFlags();
          console.log('SSO Profile Setup: Cleared SSO sign-up flags after successful profile creation');
          
          router.replace('/(tabs)/dashboard');
        }, 2500);
      }
    } catch (error) {
      ErrorLogger.error('SSO Profile Setup: Unexpected error during profile creation', error, { 
        component: 'SSOProfileSetup', 
        action: 'handleCreateProfile',
        userId,
        email,
        authType: authType.type
      });
      Alert.alert('Setup Error', 'An unexpected error occurred while setting up your Google account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show profile setup loading screen
  if (isSettingUpProfile) {
    return (
      <SettingUpProfileScreen 
        userName={name}
        onComplete={async () => {
          // Clear the SSO sign-up flags now that profile setup is complete
          await ClerkClientService.clearSSOSignUpFlags();
          console.log('SSO Profile Setup: Cleared SSO sign-up flags after profile setup completion');
          
          router.replace('/(tabs)/dashboard');
        }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={ssoProfileSetupStyles.scrollViewContent}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={ssoProfileSetupStyles.container}
        >
          <View style={ssoProfileSetupStyles.content}>
            <Text style={ssoProfileSetupStyles.title}>Complete Your Google Account Setup</Text>
            <Text style={ssoProfileSetupStyles.subtitle}>
              You&apos;ve successfully signed up with Google! Let&apos;s set up your store information to get started.
            </Text>
            
            {/* Display user's email from Google */}
            {email && (
              <View style={{ backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: '#1E40AF', fontWeight: '600' }}>
                  Google Account: {email}
                </Text>
              </View>
            )}
            
            <View style={ssoProfileSetupStyles.formSection}>
              <Text style={ssoProfileSetupStyles.sectionTitle}>Personal Information</Text>
              <Text style={{ fontSize: 14, color: '#666666', marginBottom: 8, fontFamily: 'Satoshi-Regular' }}>
                Your name from Google (you can edit this)
              </Text>
              
              <TextInput
                style={ssoProfileSetupStyles.input}
                placeholder="Enter your full name"
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
                  {loading ? 'Setting up your account...' : 'Complete Google Account Setup'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
} 