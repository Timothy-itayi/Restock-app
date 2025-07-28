import { useSignIn, useAuth, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { UserProfileService } from '../../backend/services/user-profile';
import { SessionManager } from '../../backend/services/session-manager';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getOAuthUrl } from '../../backend/config/clerk';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [isReturningUser, setIsReturningUser] = React.useState(false);
  const [showReturningUserButton, setShowReturningUserButton] = React.useState(false);

  // Check if user is a returning user on component mount
  React.useEffect(() => {
    checkReturningUser();
  }, []);

  const checkReturningUser = async () => {
    try {
      const returning = await SessionManager.isReturningUser();
      setShowReturningUserButton(returning);
    } catch (error) {
      console.error('Error checking returning user status:', error);
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
        await handleGoogleSignIn(true); // true indicates returning user flow
      } else {
        Alert.alert('Error', 'No cached session found. Please sign in normally.');
      }
    } catch (error) {
      console.error('Error with returning user sign-in:', error);
      Alert.alert('Error', 'Failed to sign in as returning user. Please try the normal sign-in process.');
    } finally {
      setLoading(false);
    }
  };

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Start the sign-in process using email and password
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password: password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        
        // Save session data for future returning user detection
        if (userId && user) {
          const userEmail = user.emailAddresses?.[0]?.emailAddress || emailAddress;
          await SessionManager.saveUserSession({
            userId,
            email: userEmail,
            wasSignedIn: true,
            lastSignIn: Date.now(),
          });
        }
        
        router.replace('/(tabs)/dashboard');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert('Error', 'Sign in failed. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google SSO for existing users
  const handleGoogleSignIn = async (isReturningUserFlow = false) => {
    if (!isLoaded) return;

    setGoogleLoading(true);
    try {
      console.log('Starting Google OAuth flow for sign in...');
      
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
                  const storeName = profileResult.data.store_name;
                  
                  await SessionManager.saveUserSession({
                    userId,
                    email: userEmail || '',
                    storeName,
                    wasSignedIn: true,
                    lastSignIn: Date.now(),
                  });
                }
                
                router.replace('/(tabs)/dashboard');
                return;
              } else {
                console.log('User authenticated but no profile found');
                // This shouldn't happen for existing users, but handle gracefully
                Alert.alert('Account Setup Required', 'Please complete your account setup first.');
                router.replace('/welcome');
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
      setGoogleLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>
        
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
          onPress={() => handleGoogleSignIn(false)}
          disabled={googleLoading}
        >
          <Text style={styles.googleButtonText}>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter your email address"
          placeholderTextColor="#666666"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Enter your password"
          placeholderTextColor="#666666"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSignInPress}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <Link href="/auth/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkTextBold}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
    textAlign: 'center',
  },
  returningUserButton: {
    backgroundColor: '#A7B9A7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  returningUserButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#6B7F6B',
    fontSize: 16,
  },
  linkTextBold: {
    color: '#6B7F6B',
    fontSize: 16,
    fontWeight: '600',
  },
}); 