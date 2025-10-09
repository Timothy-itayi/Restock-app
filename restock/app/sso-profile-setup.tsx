import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

import { ClerkClientService } from '../backend/_services/clerk-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnifiedAuth } from '../lib/auth/UnifiedAuthProvider';
import { ssoProfileSetupStyles } from '../styles/components/auth/sso/profile-setup';
import { ErrorLogger } from '../backend/_utils/error-logger';
import { UserProfileService } from '../backend/_services/user-profile';

export default function SSOProfileSetupScreen() {
  const { user } = useUser();
  const { isAuthenticated, userId, isProfileSetupComplete, userName, storeName, isProfileLoading, markNewUserReady, triggerAuthCheck } = useUnifiedAuth();

  const [name, setName] = useState('');
  const [store_name, setStore_name] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [hasUserEditedName, setHasUserEditedName] = useState(false);

  // 🔒 CRITICAL: Prevent users who already have complete profiles from seeing setup
  useEffect(() => {
    // Only redirect if we have definitive profile data (not loading) and it's actually complete
    const hasValidProfileData = userName && userName !== '' && userName !== 'there' && storeName && storeName !== '';
    
    if (isAuthenticated && !isProfileLoading && isProfileSetupComplete && hasValidProfileData) {
      console.log('🚨 SSOProfileSetup: Profile already complete, redirecting to dashboard', {
        userName,
        storeName,
        isProfileSetupComplete,
        hasValidProfileData
      });
      router.push('/(tabs)/dashboard' as any);
      return;
    } else if (isAuthenticated && !isProfileLoading && !hasValidProfileData) {
      console.log('📝 SSOProfileSetup: User authenticated but no valid profile, staying on setup screen', {
        userName,
        storeName,
        isProfileSetupComplete,
        hasValidProfileData
      });
    }
  }, [isAuthenticated, isProfileSetupComplete, isProfileLoading, userName, storeName]);

  // 🔒 CRITICAL: Profile update synchronization - watch for profile completion changes
  useEffect(() => {
    if (isAuthenticated && !isProfileLoading && isProfileSetupComplete && !loading) {
      const hasValidProfileData = userName && userName !== '' && userName !== 'there' && storeName && storeName !== '';
      if (hasValidProfileData) {
        console.log('🔄 SSOProfileSetup: Profile completion detected during session, navigating to dashboard');
        // Small delay to ensure all state updates have propagated
        setTimeout(() => {
          router.replace('/(tabs)/dashboard' as any);
        }, 100);
      }
    }
  }, [isProfileSetupComplete, userName, storeName, isAuthenticated, isProfileLoading, loading]);

  // 🔒 CRITICAL: Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚨 SSOProfileSetup: User not authenticated, redirecting to welcome');
      router.push('/welcome' as any);
      return;
    }
  }, [isAuthenticated]);

  const extractUserName = (user: any): string => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.lastName) return user.lastName;
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    return '';
  };

  // Initialize user data from Clerk
  useEffect(() => {
    if (isAuthenticated && user) {
      const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
      if (userEmail) setEmail(userEmail);

      const userName = extractUserName(user);
      if (!hasUserEditedName) setName(userName || '');
    }
  }, [isAuthenticated, user, hasUserEditedName]);

  // Clear OAuth completion flags
  useEffect(() => {
    const checkOAuthCompletion = async () => {
      try {
        const justCompletedSSO = await ClerkClientService.isOAuthJustCompleted();
        if (justCompletedSSO) await AsyncStorage.removeItem('justCompletedSSO');
      } catch {
        // silently fail
      }
    };
    checkOAuthCompletion();
  }, []);

  // Handle deep link data
  useEffect(() => {
    const handleDeepLinkArrival = async () => {
      if (isAuthenticated && userId && user) {
        const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
        if (userEmail && !email) setEmail(userEmail);

        if ((!name || name.trim() === '') && !hasUserEditedName) {
          const userName = extractUserName(user);
          if (userName && userName.trim()) setName(userName);
        }
      }
    };
    handleDeepLinkArrival();
  }, [isAuthenticated, userId, user, email, name, hasUserEditedName]);

  // Don't render until we have the necessary data
  if (!isAuthenticated || !userId || !user) {
    return null;
  }

  const handleCreateProfile = async () => {
    if (!name.trim() || !store_name.trim() || !email.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
  
    if (!isAuthenticated || !userId) {
      Alert.alert('Authentication Error', 'Please sign in again.');
      return;
    }
  
    setLoading(true);
  
    try {
      ErrorLogger.info('SSOProfileSetup: Creating profile via RPC', {
        email,
        store_name,
        name,
        clerk_id: userId
      });
  
      const result = await UserProfileService.createProfileViaBackend(
        email.toLowerCase().trim(),
        store_name.trim(),
        name.trim(),
        userId
      );
  
      if (result.data) {
        console.log('✅ SSO Profile Setup: Profile creation successful');
        
        // Save session data for returning user detection - ONLY after successful profile completion
        const { SessionManager } = await import('../backend/_services/session-manager');
        await SessionManager.saveUserSession({
          userId: userId || '',
          email: email.toLowerCase().trim(),
          storeName: store_name.trim(),
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'google',
        });
        console.log('📝 SSO Profile Setup: Session data saved after successful profile completion');
        
        // 🔒 CRITICAL: Refresh auth state with new profile data before navigation
        console.log('🔄 SSO Profile Setup: Refreshing auth state with new profile data');
        
        // Update auth context with new profile data immediately
        await markNewUserReady({
          name: name.trim(),
          store_name: store_name.trim()
        });
        
        // Trigger auth state refresh to sync with database
        await triggerAuthCheck();
        console.log('✅ SSO Profile Setup: Auth state refreshed with new profile data');
        
        await ClerkClientService.clearSSOSignUpFlags();
        
        // Profile creation successful - navigate to dashboard
        console.log('🚀 SSO Profile Setup: Navigating to dashboard with complete profile');
        router.replace('/(tabs)/dashboard' as any);
      } else {
        const message = (result.error as any)?.message || 'Failed to create profile. Please try again.';
        Alert.alert('Setup Failed', message);
      }
    } catch (error: any) {
      let userMessage = 'Failed to create profile. Please try again.';
      if (error?.message?.includes('Not authenticated')) userMessage = 'Authentication error. Please sign in again.';
      else if (error?.message?.includes('already exists')) userMessage = 'Profile already exists. Please contact support.';
      Alert.alert('Setup Failed', userMessage);
  
      ErrorLogger.error('SSOProfileSetup: Profile creation failed', {
        component: 'SSOProfileSetup',
        action: 'handleCreateProfile',
        email,
        error: error?.message || 'Unknown error',
        stack: error?.stack
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={ssoProfileSetupStyles.container}>
      <ScrollView contentContainerStyle={ssoProfileSetupStyles.scrollViewContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={ssoProfileSetupStyles.content}>
          <Text style={ssoProfileSetupStyles.title}>Complete Your Google Account Setup</Text>
          <Text style={ssoProfileSetupStyles.subtitle}>
            You've successfully signed up with Google! Let's set up your store information to get started.
          </Text>

          {email && (
            <View style={ssoProfileSetupStyles.emailContainer}>
              <Text style={ssoProfileSetupStyles.emailText}>Google Account: {email}</Text>
            </View>
          )}

          <View style={ssoProfileSetupStyles.formSection}>
            <Text style={ssoProfileSetupStyles.sectionTitle}>Personal Information</Text>
            <Text style={ssoProfileSetupStyles.fieldDescription}>Your name from Google (you can edit this)</Text>
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
            />

            <Text style={ssoProfileSetupStyles.sectionTitle}>Store Information</Text>
            <TextInput
              style={ssoProfileSetupStyles.input}
              placeholder="Enter your store name"
              placeholderTextColor="#666666"
              value={store_name}
              onChangeText={setStore_name}
              autoCapitalize="words"
            />

            <TouchableOpacity style={[ssoProfileSetupStyles.button, loading && ssoProfileSetupStyles.buttonDisabled]} onPress={handleCreateProfile} disabled={loading}>
              <Text style={ssoProfileSetupStyles.buttonText}>{loading ? 'Setting up your account...' : 'Complete Google Account Setup'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
