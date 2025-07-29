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
   * This follows Clerk's recommended approach
   */
  static async handleOAuthCompletion(
    authCheckFn: () => { isLoaded: boolean; isSignedIn: boolean }
  ): Promise<boolean> {
    console.log('ClerkClientService: Handling OAuth completion with auth state polling...');
    
    try {
      // Check if polling is actually needed
      const pollingNeeded = await this.isOAuthPollingNeeded(authCheckFn);
      if (!pollingNeeded) {
        console.log('ClerkClientService: OAuth polling not needed, returning success');
        await AsyncStorage.setItem('justCompletedSSO', 'true');
        await AsyncStorage.removeItem('oauthProcessing');
        return true;
      }
      
      // Set a flag that OAuth is being processed
      await AsyncStorage.setItem('oauthProcessing', 'true');
      
      // Poll for auth state changes
      const authSuccess = await this.pollForAuthState(authCheckFn, 5, 1000);
      
      if (authSuccess) {
        console.log('ClerkClientService: OAuth completion handled successfully');
        await AsyncStorage.setItem('justCompletedSSO', 'true');
        await AsyncStorage.removeItem('oauthProcessing');
        return true;
      } else {
        console.log('ClerkClientService: OAuth completion failed - auth state polling unsuccessful');
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
} 