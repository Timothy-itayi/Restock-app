import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

import { ClerkClientService } from '../backend/services/clerk-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnifiedAuth } from './_contexts/UnifiedAuthProvider';
import { ssoProfileSetupStyles } from '../styles/components/auth/sso/profile-setup';
import { ErrorLogger } from '../backend/utils/error-logger';
import { UserProfileService } from '../backend/services/user-profile';
import { setCurrentUserContext } from '../backend/config/supabase';


export default function SSOProfileSetupScreen() {
  const { user } = useUser();
  const { isAuthenticated, userId, authType, triggerAuthCheck, markNewSSOUserReady } = useUnifiedAuth();

  const [name, setName] = useState('');
  const [store_name, setStore_name] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [hasUserEditedName, setHasUserEditedName] = useState(false);
  const [authTypeDetermined, setAuthTypeDetermined] = useState(false);

  // 🔒 CRITICAL: Prevent traditional auth users from seeing SSO profile setup
  // This prevents the flash of the wrong setup screen
  useEffect(() => {
    if (isAuthenticated && userId && authType?.type === 'email') {
      console.log('🚨 SSOProfileSetup: Traditional auth user detected, redirecting to traditional setup');
      router.replace('/auth/traditional/profile-setup');
      return;
    }
    
    // Mark that we've determined the auth type and this user should see this screen
    if (isAuthenticated && userId && authType?.type === 'google') {
      setAuthTypeDetermined(true);
    }
  }, [isAuthenticated, userId, authType?.type]);

  const extractUserName = (user: any): string => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.lastName) return user.lastName;
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    return '';
  };

  useEffect(() => {
    if (isAuthenticated && user && authType.type === 'google') {
      const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
      if (userEmail) setEmail(userEmail);

      const userName = extractUserName(user);
      if (!hasUserEditedName) setName(userName || '');
    } else if (!isAuthenticated) {
      setTimeout(() => router.replace('/welcome'), 0);
    }
  }, [isAuthenticated, user, authType]);

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
  }, [isAuthenticated, userId, user, email, name]);

  // 🔒 CRITICAL: Don't render anything until we've determined the auth type
  // This prevents any flashing of the wrong setup screen
  if (!authTypeDetermined) {
    return null; // Return null to prevent any rendering
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
      // Set Supabase RLS context
      await setCurrentUserContext(userId);
  
      ErrorLogger.info('SSOProfileSetup: Creating profile via RPC', {
        email,
        store_name,
        name,
        authType: authType?.type,
        clerk_id: userId
      });
  
      const result = await UserProfileService.createProfileViaBackend(
        email.toLowerCase().trim(),
        store_name.trim(),
        name.trim(),
        userId // ✅ Pass clerk_id here
      );
  
      if (result.data) {
        await ClerkClientService.clearSSOSignUpFlags();
        
        // Profile creation successful, mark user as ready with profile data
        await markNewSSOUserReady(result.data);
        
        // Don't trigger auth check here - let the navigation handle it
        // triggerAuthCheck(); // Removed to avoid race condition
        router.replace('/(tabs)/dashboard');
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
