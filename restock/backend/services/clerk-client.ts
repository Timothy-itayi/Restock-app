import AsyncStorage from '@react-native-async-storage/async-storage';

export class ClerkClientService {
  /**
   * Check if a session exists and is valid
   */
  static async hasValidSession(clerk: any): Promise<boolean> {
    try {
      const session = await clerk.getSession();
      return !!session && session.status === 'active';
    } catch (error) {
      console.error('ClerkClientService: Failed to check session validity:', error);
      return false;
    }
  }

  /**
   * Get the current session ID
   */
  static async getSessionId(clerk: any): Promise<string | null> {
    try {
      const session = await clerk.getSession();
      return session?.id || null;
    } catch (error) {
      console.error('ClerkClientService: Failed to get session ID:', error);
      return null;
    }
  }

  /**
   * Check if OAuth polling is needed based on current auth state
   */
  static async isOAuthPollingNeeded(
    authCheckFn: () => { isLoaded: boolean; isSignedIn: boolean }
  ): Promise<boolean> {
    const { isLoaded, isSignedIn } = authCheckFn();
    
    console.log('ClerkClientService: Checking if OAuth polling is needed:', { isLoaded, isSignedIn });
    
    // If user is already signed in and loaded, no polling needed
    if (isLoaded && isSignedIn) {
      console.log('ClerkClientService: User already signed in, OAuth polling not needed');
      // Clear any lingering OAuth flags since user is already authenticated
      await this.clearOAuthFlags();
      return false;
    }
    
    // Check if OAuth is actually being processed
    const isProcessing = await this.isOAuthProcessing();
    console.log('ClerkClientService: OAuth processing status:', isProcessing);
    
    if (!isProcessing) {
      console.log('ClerkClientService: OAuth not being processed, polling not needed');
      return false;
    }
    
    console.log('ClerkClientService: OAuth polling is needed');
    return true;
  }

  /**
   * Poll for auth state changes after OAuth completion
   * This is the recommended approach from Clerk documentation
   */
  static async pollForAuthState(
    authCheckFn: () => { isLoaded: boolean; isSignedIn: boolean },
    maxAttempts: number = 5,
    intervalMs: number = 1000
  ): Promise<boolean> {
    console.log('ClerkClientService: Starting auth state polling...');
    
    return new Promise((resolve) => {
      let attempts = 0;
      
      const checkAuthState = () => {
        attempts++;
        console.log(`ClerkClientService: Auth state check attempt ${attempts}/${maxAttempts}`);
        
        const { isLoaded, isSignedIn } = authCheckFn();
        
        if (isLoaded && isSignedIn) {
          console.log('ClerkClientService: Auth state polling successful - user is signed in');
          resolve(true);
          return;
        }
        
        if (isLoaded && !isSignedIn && attempts >= maxAttempts) {
          console.log('ClerkClientService: Auth state polling failed - user not signed in after all attempts');
          resolve(false);
          return;
        }
        
        // Continue polling if not loaded yet or not signed in
        if (attempts < maxAttempts) {
          setTimeout(checkAuthState, intervalMs);
        } else {
          console.log('ClerkClientService: Auth state polling timed out');
          resolve(false);
        }
      };
      
      // Start the polling
      checkAuthState();
    });
  }

  /**
   * Handle OAuth completion with proper auth state polling
   * This follows Clerk's recommended approach and handles timing issues after setActive()
   */
  static async handleOAuthCompletion(
    authCheckFn: () => { isLoaded: boolean; isSignedIn: boolean }
  ): Promise<boolean> {
    console.log('ClerkClientService: Handling OAuth completion...');
    
    try {
      // Initial check - if already authenticated, return immediately
      const { isLoaded, isSignedIn } = authCheckFn();
      console.log('ClerkClientService: Initial auth state check:', { isLoaded, isSignedIn });
      
      if (isLoaded && isSignedIn) {
        console.log('ClerkClientService: User already authenticated, OAuth completion successful');
        await this.clearOAuthFlags();
        return true;
      }
      
      // Use proper polling to wait for auth state updates after setActive()
      console.log('ClerkClientService: Starting auth state polling after OAuth...');
      const authSuccess = await this.pollForAuthState(authCheckFn, 8, 750); // 8 attempts, 750ms each = 6 seconds max
      
      if (authSuccess) {
        console.log('ClerkClientService: Auth state polling successful - user authenticated');
        await this.clearOAuthFlags();
        return true;
      } else {
        console.log('ClerkClientService: Auth state polling failed - user not authenticated after OAuth');
        await AsyncStorage.removeItem('oauthProcessing');
        return false;
      }
    } catch (error) {
      console.error('ClerkClientService: Error handling OAuth completion:', error);
      await AsyncStorage.removeItem('oauthProcessing');
      return false;
    }
  }

  /**
   * Check if OAuth is currently being processed
   */
  static async isOAuthProcessing(): Promise<boolean> {
    try {
      const processing = await AsyncStorage.getItem('oauthProcessing');
      return processing === 'true';
    } catch (error) {
      console.error('ClerkClientService: Error checking OAuth processing status:', error);
      return false;
    }
  }

  /**
   * Clear OAuth processing flags
   */
  static async clearOAuthFlags(): Promise<void> {
    try {
      console.log('ClerkClientService: Clearing OAuth flags');
      await AsyncStorage.removeItem('oauthProcessing');
      await AsyncStorage.removeItem('justCompletedSSO');
      console.log('ClerkClientService: OAuth flags cleared successfully');
    } catch (error) {
      console.error('ClerkClientService: Error clearing OAuth flags:', error);
    }
  }

  /**
   * Clear OAuth flags when user signs out
   */
  static async onSignOut(): Promise<void> {
    console.log('ClerkClientService: User signing out, clearing OAuth flags');
    await this.clearOAuthFlags();
  }

  /**
   * Initialize OAuth flags on app startup
   * This should be called when the app starts to clear any lingering flags
   */
  static async initializeOAuthFlags(): Promise<void> {
    try {
      console.log('ClerkClientService: Initializing OAuth flags on app startup');
      await this.clearOAuthFlags();
      console.log('ClerkClientService: OAuth flags initialized successfully');
    } catch (error) {
      console.error('ClerkClientService: Error initializing OAuth flags:', error);
    }
  }

  /**
   * Check if user is already authenticated and clear OAuth flags if so
   * This should be called when auth screens load to prevent unnecessary polling
   */
  static async checkAndClearOAuthFlagsIfAuthenticated(
    authCheckFn: () => { isLoaded: boolean; isSignedIn: boolean }
  ): Promise<void> {
    try {
      const { isLoaded, isSignedIn } = authCheckFn();
      console.log('ClerkClientService: Checking if user is already authenticated:', { isLoaded, isSignedIn });
      
      if (isLoaded && isSignedIn) {
        console.log('ClerkClientService: User is already authenticated, clearing OAuth flags');
        await this.clearOAuthFlags();
      } else {
        console.log('ClerkClientService: User not authenticated, keeping OAuth flags');
      }
    } catch (error) {
      console.error('ClerkClientService: Error checking auth state for OAuth flags:', error);
    }
  }

  /**
   * Check if this is a new SSO sign-up flow
   * This helps prevent UnifiedAuthProvider interference with SSO flows
   */
  static async isNewSSOSignUp(): Promise<boolean> {
    try {
      const newSSOSignUp = await AsyncStorage.getItem('newSSOSignUp');
      return newSSOSignUp === 'true';
    } catch (error) {
      console.error('ClerkClientService: Error checking new SSO sign-up flag:', error);
      return false;
    }
  }

  /**
   * Check if OAuth just completed
   * This helps determine if we should show loading states
   */
  static async isOAuthJustCompleted(): Promise<boolean> {
    try {
      const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
      return justCompletedSSO === 'true';
    } catch (error) {
      console.error('ClerkClientService: Error checking OAuth completion flag:', error);
      return false;
    }
  }

  /**
   * Set SSO flow flags for new sign-up
   */
  static async setSSOSignUpFlags(): Promise<void> {
    try {
      console.log('ClerkClientService: Setting SSO sign-up flags');
      await AsyncStorage.setItem('newSSOSignUp', 'true');
      await AsyncStorage.setItem('justCompletedSSO', 'true');
      console.log('ClerkClientService: SSO sign-up flags set successfully');
    } catch (error) {
      console.error('ClerkClientService: Error setting SSO sign-up flags:', error);
    }
  }

  /**
   * Clear SSO sign-up flags
   * This should be called when the SSO flow is complete
   */
  static async clearSSOSignUpFlags(): Promise<void> {
    try {
      console.log('ClerkClientService: Clearing SSO sign-up flags');
      await AsyncStorage.removeItem('newSSOSignUp');
      await AsyncStorage.removeItem('justCompletedSSO');
      console.log('ClerkClientService: SSO sign-up flags cleared successfully');
    } catch (error) {
      console.error('ClerkClientService: Error clearing SSO sign-up flags:', error);
    }
  }

} 