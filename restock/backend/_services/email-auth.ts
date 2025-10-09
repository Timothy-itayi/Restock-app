import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager } from './session-manager';
import { UserProfileService } from './user-profile';

export interface SignInResult {
  status: 'complete' | 'needs_first_factor' | 'needs_second_factor' | 'needs_new_password' | 'missing_requirements' | 'needs_identifier' | null;
  createdSessionId?: string | null;
  firstFactorVerification?: {
    status: string | null;
    strategy: string;
  };
  secondFactorVerification?: {
    status: string | null;
    strategy: string;
  };
  [key: string]: any; // Allow for additional properties
}

export interface EmailAuthConfig {
  sessionHydrationDelay?: number; // Delay in milliseconds for session hydration
}

export class EmailAuthService {
  // Default configuration values
  private static readonly DEFAULT_CONFIG: Required<EmailAuthConfig> = {
    sessionHydrationDelay: 500, // Default 500ms delay
  };

  /**
   * Handle email/password sign-in without OAuth interference
   */
  static async handleEmailSignIn(
    signInResult: SignInResult,
    userEmail: string,
    triggerAuthCheck: () => void,
    setActive?: (params: { session: string }) => Promise<void>,
    config?: EmailAuthConfig
  ): Promise<void> {
    try {
      console.log('📧 EmailAuthService: Handling email sign-in');
      
      // Merge provided config with defaults
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      console.log('📧 EmailAuthService: Using session hydration delay:', finalConfig.sessionHydrationDelay, 'ms');
      
      if (signInResult.status === 'complete') {
        console.log('✅ EmailAuthService: Sign-in successful');
        
        // CRITICAL: Set the created session as active - this hydrates the session on the client
        if (signInResult.createdSessionId && setActive) {
          console.log('📧 EmailAuthService: Setting created session as active...');
          console.log('📧 EmailAuthService: Session ID:', signInResult.createdSessionId);
          await setActive({ session: signInResult.createdSessionId });
          console.log('📧 EmailAuthService: Session set as active successfully');
          
          // Add a configurable delay to allow Clerk to hydrate the session
          console.log('📧 EmailAuthService: Waiting for session hydration...');
          await new Promise(resolve => setTimeout(resolve, finalConfig.sessionHydrationDelay));
          console.log('📧 EmailAuthService: Session hydration delay completed');
        } else if (signInResult.createdSessionId) {
          console.log('⚠️ EmailAuthService: setActive function not provided, session may not hydrate properly');
          console.log('📧 EmailAuthService: Session ID available but not set:', signInResult.createdSessionId);
        } else {
          console.log('❌ EmailAuthService: No session ID available in sign-in result');
        }
        
        // Save session data for returning user detection
        await SessionManager.saveUserSession({
          userId: signInResult.createdSessionId || '',
          email: userEmail,
          wasSignedIn: true,
          lastSignIn: Date.now(),
          lastAuthMethod: 'email',
        });
        
        // Set a flag to indicate recent sign-in
        await AsyncStorage.setItem('recentSignIn', 'true');
        
        // Clear any lingering traditional auth flags for returning users
        await this.clearTraditionalAuthFlags();
        
        // Clear returning user data since sign-in was successful
        await SessionManager.clearReturningUserData();
        
        console.log('📧 EmailAuthService: Session saved, triggering auth check');
        
         // Trigger the UnifiedAuthProvider to check for recent sign-ins
        triggerAuthCheck();
        
        console.log('📧 EmailAuthService: Email sign-in flow completed successfully');
      } else {
        console.log('❌ EmailAuthService: Sign-in not complete, status:', signInResult.status);
        throw new Error('Sign-in failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('❌ EmailAuthService: Error handling email sign-in:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed profile setup (for email users)
   */
  static async checkUserProfileSetup(userId: string): Promise<{ hasCompletedSetup: boolean }> {
    try {
      console.log('📧 EmailAuthService: Checking user profile setup for:', userId);
      
      const profileSetupResult = await UserProfileService.hasCompletedProfileSetupByClerkId(userId);
      
      console.log('📧 EmailAuthService: Profile setup check result:', profileSetupResult);
      
      return profileSetupResult;
    } catch (error) {
      console.error('❌ EmailAuthService: Error checking user profile setup:', error);
      return { hasCompletedSetup: false };
    }
  }

  /**
   * Clear email-specific flags
   */
  static async clearEmailAuthFlags(): Promise<void> {
    try {
      console.log('📧 EmailAuthService: Clearing email auth flags');
      await AsyncStorage.removeItem('recentSignIn');
      console.log('📧 EmailAuthService: Email auth flags cleared successfully');
    } catch (error) {
      console.error('❌ EmailAuthService: Error clearing email auth flags:', error);
    }
  }

  /**
   * Initialize email auth flags on app startup
   */
  static async initializeEmailAuthFlags(): Promise<void> {
    try {
      console.log('📧 EmailAuthService: Initializing email auth flags on app startup');
      // ❌ REMOVED: Don't clear flags on every app startup
      // This was causing returning users to be treated as new users
      // await this.clearEmailAuthFlags();
      // await this.clearTraditionalAuthFlags();
      console.log('✅ EmailAuthService: Email auth flags initialized without clearing');
    } catch (error) {
      console.error('❌ EmailAuthService: Error initializing email auth flags:', error);
    }
  }

  /**
   * Check if this is a new traditional sign-up flow
   * This helps prevent UnifiedAuthProvider interference with traditional auth flows
   */
  static async isNewTraditionalSignUp(): Promise<boolean> {
    try {
      const newTraditionalSignUp = await AsyncStorage.getItem('newTraditionalSignUp');
      return newTraditionalSignUp === 'true';
    } catch (error) {
      console.error('📧 EmailAuthService: Error checking new traditional sign-up flag:', error);
      return false;
    }
  }

  /**
   * Set traditional auth flags for new sign-up
   */
  static async setTraditionalSignUpFlags(): Promise<void> {
    try {
      console.log('📧 EmailAuthService: Setting traditional sign-up flags');
      await AsyncStorage.setItem('newTraditionalSignUp', 'true');
      console.log('📧 EmailAuthService: Traditional sign-up flags set successfully');
    } catch (error) {
      console.error('📧 EmailAuthService: Error setting traditional sign-up flags:', error);
    }
  }

  /**
   * Clear traditional auth flags
   * This should be called when the traditional auth flow is complete
   */
  static async clearTraditionalAuthFlags(): Promise<void> {
    try {
      console.log('📧 EmailAuthService: Clearing traditional auth flags');
      await AsyncStorage.removeItem('newTraditionalSignUp');
      console.log('📧 EmailAuthService: Traditional auth flags cleared successfully');
    } catch (error) {
      console.error('📧 EmailAuthService: Error clearing traditional auth flags:', error);
    }
  }

  /**
   * Clear traditional auth flags when user signs out
   */
  static async onSignOut(): Promise<void> {
    console.log('📧 EmailAuthService: User signing out, clearing traditional auth flags');
    await this.clearTraditionalAuthFlags();
  }

  /**
   * Clear email auth flags when user signs out
   */
  static async clearEmailAuthFlagsOnSignOut(): Promise<void> {
    console.log('📧 EmailAuthService: Clearing email auth flags on sign out');
    await this.clearEmailAuthFlags();
  }
} 