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
  const { isAuthenticated, userId, authType, triggerAuthCheck } = useUnifiedAuth();
  
  // Quiet verbose render log
  
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

  // Reduce mount noise; keep only critical error logs elsewhere
  useEffect(() => {
    // no-op
  }, []);

  // Check if user is authenticated and extract their information
  useEffect(() => {
    // Quiet frequent auth state/user structure logs
    
    if (isAuthenticated && user && authType.type === 'google') {
      // Keep flow minimal; rely on UI state
      const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
      if (userEmail) {
        ErrorLogger.info('SSOProfileSetup: Setting email from Google account', { userEmail }, { component: 'SSOProfileSetup' });
        setEmail(userEmail);
        
        // Extract name from user object - only set if user hasn't manually edited it
        const userName = extractUserName(user);
        
        if (!hasUserEditedName) {
          if (userName && userName.trim()) {
            setName(userName);
          } else {
            setName('');
          }
        } else {
          // Respect manual edits without logging
        }
      }
    } else if (isAuthenticated && user && authType.type !== 'google') {
      // Redirect silently
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        router.replace('/auth/traditional/profile-setup');
      }, 0);
    } else if (!isAuthenticated) {
      // Redirect silently
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
          // Quiet flag removal
          await AsyncStorage.removeItem('justCompletedSSO');
        }
        
        // Don't clear the newSSOSignUp flag here - keep it until profile is actually completed
        // This ensures AuthContext knows this is a new sign-up throughout the entire setup process
        // Quiet flag retention
      } catch (error) {
        // Keep errors in ErrorLogger elsewhere if needed
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
          // Quiet deep link arrival log
          
          const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
          if (userEmail && !email) {
            setEmail(userEmail);
          }
          
          // Extract name from user object if not already set and user hasn't edited it
          if ((!name || name.trim() === '') && !hasUserEditedName) {
            const userName = extractUserName(user);
            
            if (userName && userName.trim()) {
              setName(userName);
            }
          }
        }
      } catch (error) {
        // Quiet; non-critical
      }
    };
    
    handleDeepLinkArrival();
  }, [isAuthenticated, userId, user, email, name]);

  const handleCreateProfile = async () => {
    console.log('🚀 SSOProfileSetup: handleCreateProfile called');
    console.log('📊 SSOProfileSetup: Validation data:', {
      storeName: storeName.trim(),
      name: name.trim(),
      isAuthenticated,
      userId,
      authType,
      email
    });

    if (!storeName.trim()) {
      console.log('❌ SSOProfileSetup: Store name validation failed');
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    if (!name.trim()) {
      console.log('❌ SSOProfileSetup: Name validation failed');
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!isAuthenticated || !userId) {
      console.log('❌ SSOProfileSetup: Authentication validation failed', { isAuthenticated, userId });
      Alert.alert('Authentication Error', 'You must be signed in to complete your profile setup');
      return;
    }

    if (authType.type !== 'google') {
      console.log('❌ SSOProfileSetup: Auth type validation failed', { authType });
      Alert.alert('Access Error', 'This screen is for Google OAuth users only. If you signed up with email/password, please use the regular profile setup.');
      // Redirect to appropriate screen
      router.replace('/auth/traditional/profile-setup');
      return;
    }

    if (!email) {
      console.log('❌ SSOProfileSetup: Email validation failed', { email });
      Alert.alert('Email Error', 'Unable to retrieve your email from Google. Please try signing in again.');
      return;
    }

    console.log('✅ SSOProfileSetup: All validations passed, proceeding with profile creation');
    setLoading(true);
    try {
      ErrorLogger.info('SSOProfileSetup: Creating profile for Google user', {
        userId,
        email,
        storeName: storeName.trim(),
        name: name.trim(),
        authType: authType.type
      }, { component: 'SSOProfileSetup', action: 'handleCreateProfile' });
      
      // Use the backend Edge Function for secure profile creation
      const result = await UserProfileService.createProfileViaBackend(
        userId, 
        email, 
        storeName.trim(), 
        name.trim(), 
        'google' // Specify Google OAuth as auth method
      );
      
      if (result.error) {
        const message = (result.error as any)?.code === 'EMAIL_TAKEN'
          ? 'An account already exists with this email. Please sign in with your email/password or contact support.'
          : 'Failed to save your Google account profile. Please try again.';
        ErrorLogger.error('SSOProfileSetup: Profile creation failed', result.error, { 
          component: 'SSOProfileSetup', 
          action: 'handleCreateProfile',
          userId,
          email 
        });
        Alert.alert('Setup Failed', message);
      } else {
         // Success path - profile created successfully!
         console.log('✅ SSOProfileSetup: Profile creation successful', result.data);
         ErrorLogger.info('SSOProfileSetup: Profile creation successful', {
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
        
        // Clear the SSO sign-up flags
        await ClerkClientService.clearSSOSignUpFlags();
        
        // Wait a moment for database consistency before triggering auth check
        console.log('⏳ Waiting for database consistency...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify profile was actually created before triggering auth check
        console.log('🔍 Verifying profile creation...');
        const verificationResult = await UserProfileService.hasCompletedProfileSetup(userId);
        console.log('📊 Profile verification result:', verificationResult);
        
        if (!verificationResult.hasCompletedSetup) {
          console.log('⚠️ Profile verification failed, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const secondVerification = await UserProfileService.hasCompletedProfileSetup(userId);
          console.log('📊 Second verification result:', secondVerification);
        }
        
        // Trigger auth state refresh to update profile setup status
        console.log('🔄 Triggering auth state refresh...');
        triggerAuthCheck();
        
        // Navigate immediately to dashboard
        console.log('🚀 Navigating to dashboard...');
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
            You've successfully signed up with Google! Let's set up your store information to get started.
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
              onPress={() => {
                console.log('🎯 SSOProfileSetup: Button pressed!');
                handleCreateProfile();
              }}
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