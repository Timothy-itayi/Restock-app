import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend/services/user-profile';
import { SessionManager } from '../backend/services/session-manager';
import AuthGuard from './components/AuthGuard';
import { profileSetupStyles } from '../styles/components/profile-setup';

export default function ProfileSetupScreen() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (isSignedIn && userId) {
      console.log('User is authenticated:', userId);
    } else {
      console.log('User not authenticated, redirecting to welcome');
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
      console.log('Creating user profile for:', userId);
      console.log('Profile data:', { name, storeName });
      
      // Get user email from Clerk
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;
      
      if (!userEmail) {
        Alert.alert('Error', 'Could not get user email. Please try again.');
        return;
      }

      // Create user profile in Supabase
      const result = await UserProfileService.ensureUserProfile(userId, userEmail, storeName, name);
      
      if (result.error) {
        console.error('Failed to create user profile:', result.error);
        Alert.alert('Error', 'Failed to create your profile. Please try again.');
      } else {
        console.log('User profile created successfully');
        console.log('Profile data:', result.data);
        
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
      console.error('Error creating user profile:', error);
      Alert.alert('Error', 'Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
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
    </AuthGuard>
  );
} 