import { useSignUp, useAuth, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { UserProfileService } from '../../backend/services/user-profile';
import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getOAuthUrl } from '../../backend/config/clerk';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');

  // Password validation function
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return '';
  };

  // Handle password change
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  // Handle Google SSO for new users
  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    setGoogleLoading(true);
    try {
      console.log('Starting Google OAuth flow for sign up...');
      
      // Construct the OAuth URL for Google
      const redirectUrl = Linking.createURL('/');
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-up', redirectUrl);
      
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
                  
                  // Extract name from current user
                  const userName = user?.firstName || '';
                  console.log('User name from Google:', userName);
                  
                  // Set the email for the form
                  setEmailAddress(userEmail);
                  
                  // For Google SSO, redirect to welcome screen to complete setup
                  Alert.alert(
                    'Account Setup Required',
                    'Please complete your account setup by providing your store information.',
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          router.replace('/welcome');
                        }
                      }
                    ]
                  );
                } else {
                  console.error('No email found from Google OAuth');
                  Alert.alert('Error', 'Could not retrieve email from Google. Please try again.');
                }
              }
            } else {
              console.log('User not authenticated after OAuth');
              Alert.alert('Authentication Failed', 'Please try signing up with Google again.');
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
        Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    setLoading(true);
    try {
      // Start sign-up process using email and password
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      
      // Handle specific password breach error
      if (err.errors?.[0]?.code === 'form_password_pwned') {
        Alert.alert(
          'Password Security Issue',
          'This password has been found in a data breach. Please choose a different, unique password that you haven\'t used elsewhere.',
          [
            {
              text: 'OK',
              onPress: () => setPassword('')
            }
          ]
        );
      } else {
        Alert.alert('Error', err.errors?.[0]?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/(tabs)/dashboard');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>Enter the verification code sent to your email</Text>
        
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter verification code"
          onChangeText={(code) => setCode(code)}
          keyboardType="number-pad"
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onVerifyPress}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Sign up to start managing your restock operations</Text>
      
      <TouchableOpacity 
        style={styles.googleButton}
        onPress={handleGoogleSignUp}
        disabled={googleLoading}
      >
        <Text style={styles.googleButtonText}>
          {googleLoading ? 'Signing up...' : 'Continue with Google'}
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
        onChangeText={(email) => setEmailAddress(email)}
        keyboardType="email-address"
      />
      
      <TextInput
        style={[styles.input, passwordError && styles.inputError]}
        value={password}
        placeholder="Create a strong password"
        secureTextEntry={true}
        onChangeText={handlePasswordChange}
        autoCapitalize="none"
      />
      
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : (
        <Text style={styles.helpText}>
          Password must be at least 8 characters with uppercase, lowercase, number, and special character
        </Text>
      )}
      
      <TouchableOpacity 
        style={[styles.button, (loading || passwordError) && styles.buttonDisabled]}
        onPress={onSignUpPress}
        disabled={loading || !!passwordError}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Already have an account? </Text>
        <Link href="/auth/sign-in" asChild>
          <TouchableOpacity>
            <Text style={styles.linkTextBold}>Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
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
  },
  inputError: {
    borderColor: '#e74c3c',
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
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 16,
  },
  helpText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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