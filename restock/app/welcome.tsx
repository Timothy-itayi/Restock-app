import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSignUp, useAuth, useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../backend/services/user-profile';
import { SessionManager } from '../backend/services/session-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getOAuthUrl } from '../backend/config/clerk';

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
  const [showReturningUserButton, setShowReturningUserButton] = useState(false);
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  // Check if user is already authenticated and check returning user status
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      console.log('User is already authenticated:', userId);
      // Check if user profile exists in Supabase
      checkUserProfile(userId);
    }
    
    // Check if user is a returning user
    checkReturningUser();
  }, [isLoaded, isSignedIn, userId]);

  const checkReturningUser = async () => {
    try {
      const returning = await SessionManager.isReturningUser();
      setShowReturningUserButton(returning);
    } catch (error) {
      console.error('Error checking returning user status:', error);
    }
  };

  const checkUserProfile = async (userId: string) => {
    try {
      const verifyResult = await UserProfileService.verifyUserProfile(userId);
      if (verifyResult.data) {
        console.log('User profile exists, redirecting to dashboard');
        console.log('Profile data:', verifyResult.data);
        
        // Save session data for returning user detection
        if (user) {
          const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
          await SessionManager.saveUserSession({
            userId,
            email: userEmail || '',
            storeName: verifyResult.data.store_name,
            wasSignedIn: true,
            lastSignIn: Date.now(),
          });
        }
        
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('User profile does not exist, need to complete setup');
        
        // User is authenticated but no profile, capture their email and show setup
        if (user) {
          const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
          if (userEmail) {
            console.log('Captured email from authenticated user:', userEmail);
            setEmail(userEmail);
            
            // Debug: Log the entire user object to see what's available
            console.log('Full user object:', JSON.stringify(user, null, 2));
            console.log('User firstName:', user?.firstName);
            console.log('User lastName:', user?.lastName);
            console.log('User fullName:', user?.fullName);
            console.log('User username:', user?.username);
            console.log('User emailAddresses:', user?.emailAddresses);
            console.log('User primaryEmailAddress:', user?.primaryEmailAddress);
            
            // Try to extract name from user object
            let userName = '';
            if (user?.firstName && user?.lastName) {
              userName = `${user.firstName} ${user.lastName}`;
              console.log('Using firstName + lastName:', userName);
            } else if (user?.firstName) {
              userName = user.firstName;
              console.log('Using firstName only:', userName);
            } else if (user?.lastName) {
              userName = user.lastName;
              console.log('Using lastName only:', userName);
            } else if (user?.fullName) {
              userName = user.fullName;
              console.log('Using fullName:', userName);
            } else if (user?.username) {
              userName = user.username;
              console.log('Using username:', userName);
            } else {
              console.log('No name found in user object');
            }
            
            if (userName) {
              console.log('Captured name from authenticated user:', userName);
              setName(userName);
            } else {
              console.log('No name could be extracted from user object');
            }
            
            // Show store name input for setup completion
            setShowStoreNameInput(true);
          } else {
            console.error('No email found from authenticated user');
            Alert.alert('Error', 'Could not retrieve your email. Please try signing in again.');
          }
        } else {
          console.error('No user object available');
          Alert.alert('Error', 'Could not retrieve your information. Please try signing in again.');
        }
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // If verification fails, assume profile doesn't exist and show setup
      setShowStoreNameInput(true);
    }
  };

  // Handle returning user sign-in
  const handleReturningUserSignIn = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      // Get cached session data
      const cachedSession = await SessionManager.getUserSession();
      
      if (cachedSession) {
        console.log('Found cached session for returning user:', cachedSession.email);
        
        // Try to authenticate with cached credentials
        // For now, we'll use Google OAuth for returning users
        await handleGoogleSignup(true); // true indicates returning user flow
      } else {
        Alert.alert('Error', 'No cached session found. Please sign up normally.');
      }
    } catch (error) {
      console.error('Error with returning user sign-in:', error);
      Alert.alert('Error', 'Failed to sign in as returning user. Please try the normal sign-up process.');
    } finally {
      setLoading(false);
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

  const handleGoogleSignup = async (isReturningUserFlow = false) => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      console.log('Starting Google OAuth flow...');
      
      // Construct the OAuth URL for Google
      const redirectUrl = Linking.createURL('/');
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
      
      console.log('Opening OAuth URL:', oauthUrl);
      
      // Open the OAuth URL in a web browser
      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);
      
      console.log('OAuth result:', result);
      
      if (result.type === 'success') {
        // OAuth was successful, check if user is now authenticated
        console.log('OAuth successful, checking authentication...');
        
        // Wait a moment for Clerk to process the authentication
        setTimeout(async () => {
          try {
            // Check if user is now authenticated
            if (isSignedIn && userId) {
              console.log('User authenticated after OAuth:', userId);
              
              // Check if this user already exists in Supabase
              const profileResult = await UserProfileService.verifyUserProfile(userId);
              
              if (profileResult.data) {
                console.log('Existing user found, redirecting to dashboard');
                
                // Save session data for returning user detection
                if (user) {
                  const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
                  await SessionManager.saveUserSession({
                    userId,
                    email: userEmail || '',
                    storeName: profileResult.data.store_name,
                    wasSignedIn: true,
                    lastSignIn: Date.now(),
                  });
                }
                
                router.replace('/(tabs)/dashboard');
                return;
              } else {
                console.log('New user, need to complete setup');
                
                // For new users, try to extract email from current user
                let userEmail = null;
                
                if (user?.emailAddresses?.[0]?.emailAddress) {
                  userEmail = user.emailAddresses[0].emailAddress;
                } else if (user?.primaryEmailAddress?.emailAddress) {
                  userEmail = user.primaryEmailAddress.emailAddress;
                }
                
                if (userEmail) {
                  console.log('User email from Google:', userEmail);
                  
                  // Extract name from current user - try multiple sources
                  let userName = '';
                  if (user?.firstName && user?.lastName) {
                    userName = `${user.firstName} ${user.lastName}`;
                  } else if (user?.firstName) {
                    userName = user.firstName;
                  } else if (user?.lastName) {
                    userName = user.lastName;
                  } else if (user?.fullName) {
                    userName = user.fullName;
                  } else if (user?.username) {
                    userName = user.username;
                  }
                  
                  console.log('User name from Google:', userName);
                  console.log('User object for debugging:', {
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    fullName: user?.fullName,
                    username: user?.username
                  });
                  
                  setEmail(userEmail);
                  setName(userName);
                  setIsGoogleSSO(true);
                  setShowStoreNameInput(true);
                } else {
                  console.error('No email found from Google OAuth');
                  Alert.alert('Error', 'Could not retrieve email from Google. Please try again.');
                }
              }
            } else {
              console.log('User not authenticated after OAuth');
              Alert.alert('Authentication Failed', 'Please try signing in with Google again.');
            }
          } catch (error) {
            console.error('Error checking user after OAuth:', error);
            Alert.alert('Error', 'Could not verify your account. Please try again.');
          }
        }, 2000); // Wait 2 seconds for Clerk to process
      } else if (result.type === 'cancel') {
        console.log('OAuth cancelled by user');
      } else {
        console.log('OAuth failed:', result);
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter your store name');
      return;
    }

    // For email signup users, require name
    if (showEmailSignup && !name.trim()) {
      Alert.alert('Error', 'Please enter your first name');
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
      console.log('User name for account:', name);
      
      // Save user data for use after verification
      await saveUserData(email, name, storeName);

      if (showEmailSignup && !isSignedIn) {
        // Email signup flow - user not yet authenticated
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
      } else if (isGoogleSSO && userId) {
        // Google SSO flow - user is already authenticated
        console.log('Google SSO flow - user already authenticated');
        console.log('Saving user profile with data:', {
          userId,
          email,
          storeName,
          name,
          nameLength: name?.length || 0,
          nameIsEmpty: !name || name.trim() === ''
        });
        
        // Use the new ensureUserProfile method
        try {
          const result = await UserProfileService.ensureUserProfile(userId, email, storeName, name);
          
          if (result.error) {
            console.error('Failed to ensure user profile:', result.error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
          } else {
            console.log('User profile ensured successfully');
            console.log('Profile data:', result.data);
            
            // Save session data for returning user detection
            await SessionManager.saveUserSession({
              userId,
              email,
              storeName,
              wasSignedIn: true,
              lastSignIn: Date.now(),
            });
            
            // Navigate to dashboard
            router.replace('/(tabs)/dashboard');
          }
        } catch (error) {
          console.error('Error ensuring user profile:', error);
          Alert.alert('Error', 'Failed to save your profile. Please try again.');
        }
      } else if (isSignedIn && userId) {
        // Email signup user who is already authenticated (from sign-up screen)
        console.log('Email signup user already authenticated, completing setup');
        console.log('Saving user profile with data:', {
          userId,
          email,
          storeName,
          name,
          nameLength: name?.length || 0,
          nameIsEmpty: !name || name.trim() === '',
          isEmailSignup: showEmailSignup
        });
        
        // For email signup users, use the manually entered name
        const finalName = showEmailSignup ? name : (name || '');
        console.log('Final name to be saved:', finalName);
        
        // Use the new ensureUserProfile method
        try {
          const result = await UserProfileService.ensureUserProfile(userId, email, storeName, finalName);
          
          if (result.error) {
            console.error('Failed to ensure user profile:', result.error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
          } else {
            console.log('User profile ensured successfully');
            console.log('Profile data:', result.data);
            
            // Save session data for returning user detection
            await SessionManager.saveUserSession({
              userId,
              email,
              storeName,
              wasSignedIn: true,
              lastSignIn: Date.now(),
            });
            
            // Navigate to dashboard
            router.replace('/(tabs)/dashboard');
          }
        } catch (error) {
          console.error('Error ensuring user profile:', error);
          Alert.alert('Error', 'Failed to save your profile. Please try again.');
        }
      } else {
        console.log('Google SSO - proceeding to store name input');
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
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
              
              {showReturningUserButton && (
                <TouchableOpacity 
                  style={styles.returningUserButton}
                  onPress={handleReturningUserSignIn}
                  disabled={loading}
                >
                  <Text style={styles.returningUserButtonText}>
                    {loading ? 'Signing in...' : 'Returning User? Sign In'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={() => handleGoogleSignup(false)}
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
                  placeholderTextColor="#6B7F6B"
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
              {(!isGoogleSSO || (isSignedIn && !name) || showEmailSignup) && (
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
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7F6B',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
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
    color: '#000000',
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
  returningUserButton: {
    backgroundColor: '#A7B9A7',
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
  returningUserButtonText: {
    color: '#ffffff',
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