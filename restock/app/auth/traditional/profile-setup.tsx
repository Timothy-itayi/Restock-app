import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../../../backend/services/user-profile';
import { SessionManager } from '../../../backend/services/session-manager';
import UnifiedAuthGuard from '../../components/UnifiedAuthGuard';
import { profileSetupStyles } from '../../../styles/components/auth/traditional/profile-setup';

export default function ProfileSetupScreen() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (!(isSignedIn && userId)) {
      router.replace('/welcome');
    }
  }, [isSignedIn, userId]);

  const handleCreateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }

    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    if (!isSignedIn || !userId) {
      Alert.alert('Error', 'You must be signed in to create a profile');
      return;
    }

    setLoading(true);
    try {
      // Quiet creation logs
      
      // Get user email from Clerk with robust validation
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || 
                       user?.primaryEmailAddress?.emailAddress ||
                       user?.emailAddresses?.[1]?.emailAddress;
      
      if (!userEmail || !userEmail.includes('@')) {
        // Quiet noisy email error; user will see alert
        Alert.alert('Error', 'Could not retrieve your email address. Please contact support.');
        return;
      }

      // Create user profile in Supabase with proper error handling
      let result;
      try {
        result = await UserProfileService.ensureUserProfile(userId, userEmail, storeName, name);
      } catch (error) {
        // Quiet network error; user will see alert
        Alert.alert('Error', 'Network error while creating your profile. Please check your connection and try again.');
        return;
      }
      
      if (!result) {
        // Quiet; user will see alert
        Alert.alert('Error', 'Failed to create your profile. Please try again.');
        return;
      }
      
      if (result.error) {
        const message = (result.error as any)?.code === 'EMAIL_TAKEN'
          ? 'An account already exists with this email. Please sign in or use a different email.'
          : 'Failed to create your profile. Please try again.';
        Alert.alert('Error', message);
        return;
      } else {
        // Success; no verbose logs
        
        // Save session data for returning user detection
        await SessionManager.saveUserSession({
          userId,
          email: userEmail,
          storeName,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'email',
        });
        
        // Navigate to dashboard
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      // Quiet; user will see alert
      Alert.alert('Error', 'Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UnifiedAuthGuard requireAuth={true}>
      <ScrollView contentContainerStyle={profileSetupStyles.scrollViewContent}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={profileSetupStyles.container}
        >
          <View style={profileSetupStyles.content}>
            <Text style={profileSetupStyles.title}>Complete Your Profile</Text>
            <Text style={profileSetupStyles.subtitle}>
              Tell us a bit about yourself and your store to get started
            </Text>
            
            <View style={profileSetupStyles.formSection}>
              <Text style={profileSetupStyles.sectionTitle}>Personal Information</Text>
              
              <TextInput
                style={profileSetupStyles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#666666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              
              <Text style={profileSetupStyles.sectionTitle}>Store Information</Text>
              
              <TextInput
                style={profileSetupStyles.input}
                placeholder="Enter your store name"
                placeholderTextColor="#666666"
                value={storeName}
                onChangeText={setStoreName}
                autoCapitalize="words"
              />
              
              <TouchableOpacity 
                style={[profileSetupStyles.button, loading && profileSetupStyles.buttonDisabled]}
                onPress={handleCreateProfile}
                disabled={loading}
              >
                <Text style={profileSetupStyles.buttonText}>
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </UnifiedAuthGuard>
  );
} 