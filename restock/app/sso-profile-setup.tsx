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
import { DIContainer } from '../app/infrastructure/di/Container';
import { UserContextService } from '../backend/services/user-context';

export default function SSOProfileSetupScreen() {
  const { user } = useUser();
  const { isAuthenticated, userId, authType, triggerAuthCheck, markNewSSOUserReady } = useUnifiedAuth();
  
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
        // This ensures UnifiedAuthProvider knows this is a new sign-up throughout the entire setup process
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

    // Validate required fields
    if (!name.trim() || !storeName.trim() || !email.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!isAuthenticated || !userId) {
      Alert.alert('Authentication Error', 'Please sign in again.');
      return;
    }

    console.log('📊 SSOProfileSetup: Validation data:', {
      name,
      storeName,
      email,
      userId,
      isAuthenticated,
      authType
    });

    console.log('✅ SSOProfileSetup: All validations passed, proceeding with profile creation');

    setLoading(true);

    try {
      // CRITICAL: Ensure user context is properly set before profile creation
      console.log('🔧 SSOProfileSetup: Setting user context before profile creation');
      const container = DIContainer.getInstance();
      if (container.has('UserContextService')) {
        await UserContextService.setUserContext(userId);
        console.log('✅ SSOProfileSetup: User context set successfully');
        
        // Wait a moment for the context to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Log the profile creation attempt
      ErrorLogger.info('SSOProfileSetup: Creating profile for Google user', {
        userId,
        email,
        storeName,
        name,
        authType: authType?.type
      });

      console.log('Creating user profile via Convex:', {
        authMethod: 'google',
        clerkUserId: userId,
        email,
        name,
        storeName
      });

      // Create profile with retry mechanism
      let result;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`🔄 SSOProfileSetup: Profile creation attempt ${attempts}/${maxAttempts}`);
          
          result = await UserProfileService.createProfileViaBackend(
            userId,
            email,
            storeName,
            name,
            'google'
          );
          
          console.log('✅ SSOProfileSetup: Profile creation successful on attempt', attempts);
          break; // Success, exit retry loop
          
        } catch (error: any) {
          console.error(`❌ SSOProfileSetup: Profile creation attempt ${attempts} failed:`, error);
          
          if (attempts >= maxAttempts) {
            throw error; // Give up after max attempts
          }
          
          // Wait before retry with exponential backoff
          const waitTime = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
          console.log(`⏳ SSOProfileSetup: Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      if (result?.data && !result.error) {
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
        
        // CRITICAL: Mark the new SSO user as ready in UnifiedAuthProvider
        // This allows them to access the dashboard and completes the auth flow
        console.log('🔧 SSOProfileSetup: Marking new SSO user as ready in UnifiedAuthProvider');
        await markNewSSOUserReady();
        console.log('✅ SSOProfileSetup: New SSO user marked as ready');
        
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
      } else {
        const message = result?.error || 'Failed to create profile. Please try again.';
        console.error('❌ SSOProfileSetup: Profile creation failed:', message);
        Alert.alert('Setup Failed', message as string);
      }
    } catch (error: any) {
      console.error('❌ SSOProfileSetup: Profile creation failed:', error);
      
      // Enhanced error logging
      ErrorLogger.error('SSOProfileSetup: Profile creation failed', {
        component: 'SSOProfileSetup',
        action: 'handleCreateProfile',
        userId,
        email,
        error: error?.message || 'Unknown error',
        stack: error?.stack
      });
      
      let userMessage = 'Failed to create profile. Please try again.';
      
      // Provide more specific error messages
      if (error?.message?.includes('Not authenticated')) {
        userMessage = 'Authentication error. Please sign in again.';
      } else if (error?.message?.includes('already exists')) {
        userMessage = 'Profile already exists. Please contact support.';
      } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Setup Failed', userMessage);
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