import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../../../backend/services/user-profile';
import { SessionManager } from '../../../backend/services/session-manager';
import { EmailAuthService } from '../../../backend/services/email-auth';
import { useUnifiedAuth } from "../UnifiedAuthProvider";
import UnifiedAuthGuard from '../../components/UnifiedAuthGuard';
import { useThemedStyles } from '../../styles/useThemedStyles';
import { StyleSheet } from 'react-native';
import { ResponsiveContainer } from '../../components/responsive/ResponsiveLayouts';

export default function ProfileSetupScreen() {
  // CRITICAL: Always call useAuth unconditionally first
  const rawAuth = useAuth();
  const { user } = useUser();
  
  // Then safely extract values
  const isSignedIn = (rawAuth && typeof rawAuth === 'object' && typeof rawAuth.isLoaded === 'boolean') 
    ? Boolean(rawAuth.isSignedIn)
    : false;
  const userId = (rawAuth && typeof rawAuth === 'object') 
    ? rawAuth.userId 
    : null;
  const { triggerAuthCheck, markNewUserReady, authType } = useUnifiedAuth();
  
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authTypeDetermined, setAuthTypeDetermined] = useState(false);

  // 🔒 CRITICAL: Prevent SSO users from seeing traditional profile setup
  // This prevents the flash of the wrong setup screen
  useEffect(() => {
    if (isSignedIn && userId && authType?.type === 'google') {
      console.log('🚨 TraditionalProfileSetup: SSO user detected, redirecting to SSO setup');
      router.replace('/sso-profile-setup');
      return;
    }
    
    // Mark that we've determined the auth type and this user should see this screen
    if (isSignedIn && userId && authType?.type === 'email') {
      setAuthTypeDetermined(true);
    }
  }, [isSignedIn, userId, authType?.type]);

  // Check if user is already authenticated
  useEffect(() => {
    if (!(isSignedIn && userId)) {
      router.replace('/welcome');
    }
  }, [isSignedIn, userId]);

  // 🔒 CRITICAL: Don't render anything until we've determined the auth type
  // This prevents any flashing of the wrong setup screen
  if (!authTypeDetermined) {
    return null; // Return null to prevent any rendering
  }

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

      // Create user profile via backend Edge Function with proper error handling
      let result;
      try {
        result = await UserProfileService.createProfileViaBackend(
          userEmail, 
          storeName, 
          name,
          userId // ✅ Pass clerk_id in correct position
        );
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
        // Success path - profile created successfully!
        console.log('✅ ProfileSetup: Profile creation successful', result.data);
        
        // Save session data for returning user detection
        await SessionManager.saveUserSession({
          userId,
          email: userEmail,
          storeName,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'email',
        });
        
        // Clear traditional auth flags since profile setup is complete
        console.log('🔧 ProfileSetup: Clearing traditional auth flags since setup is complete');
        await EmailAuthService.clearTraditionalAuthFlags();
        console.log('✅ ProfileSetup: Traditional auth flags cleared');
        
        // CRITICAL: Mark the new email user as ready in UnifiedAuthProvider
        // This allows them to access the dashboard and completes the auth flow
        console.log('🔧 ProfileSetup: Marking new traditional user as ready in UnifiedAuthProvider');
        await markNewUserReady(result.data);
        console.log('✅ ProfileSetup: New traditional user marked as ready');
        
        // Trigger auth state refresh to update profile setup status
        console.log('🔄 Triggering auth state refresh...');
        triggerAuthCheck();
        
        // Navigate immediately to dashboard
        console.log('🚀 Navigating to dashboard...');
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      // Quiet; user will see alert
      Alert.alert('Error', 'Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = useThemedStyles((theme) => ({
    scrollViewContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.lighter,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      fontFamily: theme.typography.appTitle.fontFamily,
      fontSize: theme.typography.appTitle.fontSize,
      color: theme.colors.neutral.darkest,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      fontWeight: 'bold',
    },
    subtitle: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.neutral.medium,
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
      lineHeight: theme.typography.bodyMedium.lineHeight,
    },
    formSection: {
      width: '100%',
      maxWidth: theme.device.isTablet ? 500 : 350,
      alignItems: 'stretch',
    },
    sectionTitle: {
      fontFamily: theme.typography.subsectionHeader.fontFamily,
      fontSize: theme.typography.subsectionHeader.fontSize,
      color: theme.colors.neutral.darkest,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    input: {
      fontFamily: theme.typography.bodyMedium.fontFamily,
      fontSize: theme.typography.bodyMedium.fontSize,
      backgroundColor: theme.colors.neutral.lightest,
      borderWidth: 1,
      borderColor: theme.colors.neutral.light,
      borderRadius: 8,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      color: theme.colors.neutral.darkest,
      minHeight: theme.layout.touchTargetMin + 12,
    },
    button: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      marginTop: theme.spacing.xl,
      minHeight: theme.layout.touchTargetMin,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontFamily: theme.typography.buttonText.fontFamily,
      fontSize: theme.typography.buttonText.fontSize,
      color: theme.colors.neutral.lightest,
      fontWeight: '600',
    },
  }));

  return (
    <UnifiedAuthGuard requireAuth={true} requireProfileSetup={false}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ResponsiveContainer style={styles.content}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Tell us a bit about yourself and your store to get started
            </Text>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#666666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              
              <Text style={styles.sectionTitle}>Store Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Enter your store name"
                placeholderTextColor="#666666"
                value={storeName}
                onChangeText={setStoreName}
                autoCapitalize="words"
              />
              
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleCreateProfile}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </Text>
              </TouchableOpacity>
            </View>
          </ResponsiveContainer>
        </KeyboardAvoidingView>
      </ScrollView>
    </UnifiedAuthGuard>
  );
} 