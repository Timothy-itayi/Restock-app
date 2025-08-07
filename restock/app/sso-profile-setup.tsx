import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend/services/user-profile';
import { SessionManager } from '../backend/services/session-manager';
import { ClerkClientService } from '../backend/services/clerk-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnifiedAuth } from './_contexts/UnifiedAuthProvider';
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
  const [hasUserEditedName, setHasUserEditedName] = useState(false);
  

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
    // Return empty string to allow user to enter their own name
    return '';
  };

  // Debug: Log when component mounts
  useEffect(() => {
    ErrorLogger.info('SSOProfileSetup: Component mounted', { isAuthenticated, userId, authType }, { component: 'SSOProfileSetup' });
  }, []);

  // Check if user is authenticated and extract their information
  useEffect(() => {
    ErrorLogger.info('SSOProfileSetup: Auth state changed', { isAuthenticated, userId, authType }, { component: 'SSOProfileSetup' });
    
    // Add debug logging to understand the user object structure
    console.log('🔍 SSOProfileSetup: User object debug:', {
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
      ErrorLogger.info('SSOProfileSetup: Google user authenticated', null, { component: 'SSOProfileSetup' });
      const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
      if (userEmail) {
        ErrorLogger.info('SSOProfileSetup: Setting email from Google account', { userEmail }, { component: 'SSOProfileSetup' });
        setEmail(userEmail);
        
        // Extract name from user object - only set if user hasn't manually edited it
        const userName = extractUserName(user);
        
        if (!hasUserEditedName) {
          if (userName && userName.trim()) {
            ErrorLogger.info('SSOProfileSetup: Setting name from Google account', { userName }, { component: 'SSOProfileSetup' });
            setName(userName);
          } else {
            ErrorLogger.info('SSOProfileSetup: No name found in Google account, leaving empty for user input', null, { component: 'SSOProfileSetup' });
            setName('');
          }
        } else {
          ErrorLogger.info('SSOProfileSetup: User has manually edited name, not overriding with Google data', { currentName: name }, { component: 'SSOProfileSetup' });
        }
      }
    } else if (isAuthenticated && user && authType.type !== 'google') {
      ErrorLogger.info('SSOProfileSetup: Non-Google user, redirecting to traditional setup', null, { component: 'SSOProfileSetup' });
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        router.replace('/auth/traditional/profile-setup');
      }, 0);
    } else if (!isAuthenticated) {
      ErrorLogger.info('SSOProfileSetup: User not authenticated, redirecting to welcome', null, { component: 'SSOProfileSetup' });
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
          console.log('SSOProfileSetup: OAuth completion detected, removing flag');
          await AsyncStorage.removeItem('justCompletedSSO');
        }
        
        // Don't clear the newSSOSignUp flag here - keep it until profile is actually completed
        // This ensures AuthContext knows this is a new sign-up throughout the entire setup process
        console.log('SSOProfileSetup: Keeping newSSOSignUp flag until profile completion');
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
          console.log('SSOProfileSetup: User arrived via deep link, ensuring data is loaded');
          
          const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
          if (userEmail && !email) {
            console.log('SSOProfileSetup: Setting email from deep link user:', userEmail);
            setEmail(userEmail);
          }
          
          // Extract name from user object if not already set and user hasn't edited it
          if ((!name || name.trim() === '') && !hasUserEditedName) {
            const userName = extractUserName(user);
            
            if (userName && userName.trim()) {
              console.log('SSOProfileSetup: Setting name from deep link user:', userName);
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
      ErrorLogger.info('SSOProfileSetup: Creating profile for Google user', {
        userId,
        email,
        storeName: storeName.trim(),
        name: name.trim(),
        authType: authType.type
      }, { component: 'SSOProfileSetup', action: 'handleCreateProfile' });
      
      // Use the ensureUserProfile method specifically designed for SSO users
      const result = await UserProfileService.ensureUserProfile(userId, email, storeName.trim(), name.trim());
      
      if (result.error) {
        ErrorLogger.error('SSOProfileSetup: Profile creation failed', result.error, { 
          component: 'SSOProfileSetup', 
          action: 'handleCreateProfile',
          userId,
          email 
        });
        Alert.alert('Setup Failed', 'Failed to save your Google account profile. Please try again.');
      } else {
        ErrorLogger.info('SSOProfileSetup: Profile created successfully', result.data, { 
          component: 'SSOProfileSetup', 
          action: 'handleCreateProfile',
          userId,
          email 
        });
        
        // Save session data for returning user detection
        await SessionManager.saveUserSession({
          userId,
          email,
          storeName,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'google',
        });
        
        // Clear the SSO sign-up flags and navigate immediately
        await ClerkClientService.clearSSOSignUpFlags();
        console.log('SSOProfileSetup: Profile setup complete, navigating to dashboard');
        
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      ErrorLogger.error('SSOProfileSetup: Unexpected error during profile creation', error, { 
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


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={ssoProfileSetupStyles.container}
    >
      <ScrollView 
        contentContainerStyle={ssoProfileSetupStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={ssoProfileSetupStyles.content}>
          <Text style={ssoProfileSetupStyles.title}>Complete Your Google Account Setup</Text>
          <Text style={ssoProfileSetupStyles.subtitle}>
            You&apos;ve successfully signed up with Google! Let&apos;s set up your store information to get started.
          </Text>
          
          {/* Display user's email from Google */}
          {email && (
            <View style={ssoProfileSetupStyles.emailContainer}>
              <Text style={ssoProfileSetupStyles.emailText}>
                Google Account: {email}
              </Text>
            </View>
          )}
          
          <View style={ssoProfileSetupStyles.formSection}>
            <Text style={ssoProfileSetupStyles.sectionTitle}>Personal Information</Text>
            <Text style={ssoProfileSetupStyles.fieldDescription}>
              Your name from Google (you can edit this)
            </Text>
            
            <TextInput
              style={ssoProfileSetupStyles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setHasUserEditedName(true);
              }}
              autoCapitalize="words"
              selectTextOnFocus={true}
              editable={true}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 