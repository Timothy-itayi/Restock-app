import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSignUp, useOAuth, useAuth } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [showStoreNameInput, setShowStoreNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleSSO, setIsGoogleSSO] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { isSignedIn, userId } = useAuth();

  // Check if user is already authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      console.log('User is already authenticated:', userId);
      // Check if user profile exists in Supabase
      checkUserProfile(userId);
    }
  }, [isLoaded, isSignedIn, userId]);

  const checkUserProfile = async (userId: string) => {
    try {
      const verifyResult = await UserProfileService.verifyUserProfile(userId);
      if (verifyResult.data) {
        console.log('User profile exists, redirecting to dashboard');
        console.log('Profile data:', verifyResult.data);
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('User profile does not exist, need to complete setup');
        // User is authenticated but no profile, show store name input
        // We'll need to get the email from the session or redirect to profile setup
        setShowStoreNameInput(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // If verification fails, assume profile doesn't exist and show setup
      setShowStoreNameInput(true);
    }
  };

  // Store the email, name, and store name for use after verification
  const saveUserData = async (email: string, name: string, storeName: string) => {
    try {
      await AsyncStorage.setItem('tempUserData', JSON.stringify({ email, name, storeName }));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleEmailSignup = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setShowEmailSignup(true);
  };

  const handleGoogleSignup = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Starting Google OAuth flow...');
      
      const { createdSessionId, signUp, signIn } = await startOAuthFlow();

      if (createdSessionId) {
        console.log('Google OAuth successful, session created:', createdSessionId);
        
        // Get user info from the session
        const user = signUp?.createdUserId ? signUp : signIn;
        
        // Debug: Log the full user object to see its structure
        console.log('Full user object from OAuth:', JSON.stringify(user, null, 2));
        
        // Try different ways to access the email
        let userEmail = null;
        
        // Method 1: Try to access emailAddresses directly
        if ((user as any)?.emailAddresses?.[0]?.emailAddress) {
          userEmail = (user as any).emailAddresses[0].emailAddress;
        }
        // Method 2: Try to access email directly
        else if ((user as any)?.emailAddress) {
          userEmail = (user as any).emailAddress;
        }
        // Method 3: Try to access email from primaryEmailAddress
        else if ((user as any)?.primaryEmailAddress?.emailAddress) {
          userEmail = (user as any).primaryEmailAddress.emailAddress;
        }
        // Method 4: Try to access from user data
        else if ((user as any)?.user?.emailAddresses?.[0]?.emailAddress) {
          userEmail = (user as any).user.emailAddresses[0].emailAddress;
        }
        
        if (userEmail) {
          console.log('User email from Google:', userEmail);
          
          // Extract name from Google OAuth data
          const userName = (user as any)?.firstName || '';
          console.log('User name from Google:', userName);
          
          setEmail(userEmail);
          setName(userName);
          setIsGoogleSSO(true);
          setGoogleUserData({ signUp, signIn, createdSessionId });
          setShowStoreNameInput(true);
        } else {
          console.error('No email found from Google OAuth');
          console.log('Available user data:', Object.keys(user || {}));
          Alert.alert('Error', 'Could not retrieve email from Google. Please try again.');
        }
      } else {
        console.log('Google OAuth cancelled or failed');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', JSON.stringify(err, null, 2));
      
      // Handle session_exists error
      if (err.errors?.[0]?.code === 'session_exists') {
        console.log('User is already signed in, checking profile...');
        // User is already authenticated, check if they have a profile
        if (isSignedIn && userId) {
          checkUserProfile(userId);
        } else {
          Alert.alert('Already Signed In', 'You are already signed in. Please continue with your account setup.');
        }
      } else {
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    if (showEmailSignup && !password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (showEmailSignup && password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Creating account for email:', email);
      
      // Save user data for use after verification
      await saveUserData(email, name, storeName);

      if (showEmailSignup) {
        // Email signup flow
        await signUp.create({
          emailAddress: email,
          password: password,
        });

        console.log('SignUp state after create:', JSON.stringify(signUp, null, 2));

        // Send verification email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        
        console.log('Verification email prepared');
        
        Alert.alert(
          'Verification Email Sent!',
          'Please check your email and enter the verification code.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/auth/verify-email');
              }
            }
          ]
        );
      } else {
        // Google SSO flow - user is already authenticated
        console.log('Google SSO flow - user already authenticated');
        
        if (isGoogleSSO && googleUserData) {
          // Get the current user from the session
          await setActive({ session: googleUserData.createdSessionId });
          
          // For Google SSO, we need to get the user ID from the OAuth result
          const userId = googleUserData.signUp?.createdUserId || (googleUserData.signIn as any)?.createdUserId;
          
          if (userId) {
            console.log('Google user authenticated:', userId);
            
            // Save user profile to Supabase
            try {
              const saveResult = await UserProfileService.saveUserProfile(userId, email, storeName, name);
              
              if (saveResult.error) {
                console.error('Failed to save user profile:', saveResult.error);
              } else {
                console.log('User profile saved successfully');
                
                // Verify the user was actually saved
                const verifyResult = await UserProfileService.verifyUserProfile(userId);
                if (verifyResult.data) {
                  console.log('User profile verified in Supabase:', verifyResult.data);
                } else {
                  console.error('Failed to verify user profile:', verifyResult.error);
                }
              }
            } catch (error) {
              console.error('Error saving user profile:', error);
            }
            
            // Navigate to dashboard
            router.replace('/(tabs)/dashboard');
          } else {
            console.error('No user ID found after Google authentication');
            Alert.alert('Error', 'Authentication failed. Please try again.');
          }
        } else {
          console.log('Google SSO - proceeding to store name input');
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOptions = () => {
    setShowEmailSignup(false);
    setShowStoreNameInput(false);
    setEmail('');
    setName('');
    setPassword('');
    setStoreName('');
    setIsGoogleSSO(false);
    setGoogleUserData(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Restock</Text>
        <Text style={styles.subtitle}>
          Streamline your store's restocking process
        </Text>
        <Text style={styles.description}>
          Create restock sessions, manage suppliers, and generate professional emails automatically.
        </Text>

        {!showEmailSignup && !showStoreNameInput ? (
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Get Started</Text>
            
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleSignup}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.emailSection}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.button}
                onPress={handleEmailSignup}
              >
                <Text style={styles.buttonText}>Continue with Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : showEmailSignup && !showStoreNameInput ? (
          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>Create your password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setShowStoreNameInput(true)}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToOptions}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.storeSection}>
            <Text style={styles.sectionTitle}>Tell us about your store</Text>
            {!isGoogleSSO && (
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Enter your store name"
              value={storeName}
              onChangeText={setStoreName}
              autoCapitalize="words"
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowStoreNameInput(false)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7F6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsSection: {
    marginBottom: 20,
  },
  emailSection: {
    marginBottom: 20,
  },
  passwordSection: {
    marginBottom: 20,
  },
  storeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6B7F6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e8ed',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#7f8c8d',
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#6B7F6B',
    fontSize: 16,
  },
}); 