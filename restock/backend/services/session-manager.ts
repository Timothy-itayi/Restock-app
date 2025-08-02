import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSession {
  userId: string;
  email: string;
  storeName?: string;
  wasSignedIn: boolean;
  lastSignIn: number;
  lastAuthMethod?: 'google' | 'email';
}

export class SessionManager {
  private static readonly SESSION_KEY = 'user_session';
  private static readonly RETURNING_USER_KEY = 'returning_user_flag';
  private static readonly RETURNING_USER_DATA_KEY = 'returning_user_data';

  /**
   * Save user session data
   */
  static async saveUserSession(session: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      await AsyncStorage.setItem(this.RETURNING_USER_KEY, 'true');
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  }

  /**
   * Get current user session
   */
  static async getUserSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  /**
   * Check if user is a returning user
   */
  static async isReturningUser(): Promise<boolean> {
    try {
      const returningUserFlag = await AsyncStorage.getItem(this.RETURNING_USER_KEY);
      return returningUserFlag === 'true';
    } catch (error) {
      console.error('Error checking returning user status:', error);
      return false;
    }
  }

  /**
   * Clear user session data but preserve returning user info
   */
  static async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      // Don't remove returning user flag on logout - keep it for future sessions
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }

  /**
   * Sign out while preserving returning user data
   */
  static async signOutPreservingUserData(): Promise<void> {
    try {
      // Get current session data before clearing
      const currentSession = await this.getUserSession();
      
      if (currentSession) {
        // Save essential data for returning user (email and auth method only)
        const returningUserData = {
          email: currentSession.email,
          lastAuthMethod: currentSession.lastAuthMethod,
        };
        
        // Save the returning user data using the class constant
        await AsyncStorage.setItem(this.RETURNING_USER_DATA_KEY, JSON.stringify(returningUserData));
        console.log('Saved returning user data:', returningUserData);
      }
      
      // Clear the main session but keep returning user flag
      await AsyncStorage.removeItem(this.SESSION_KEY);
      await AsyncStorage.setItem(this.RETURNING_USER_KEY, 'true');
    } catch (error) {
      console.error('Error preserving user data on sign out:', error);
    }
  }

  /**
   * Get returning user data (for welcome-back screen)
   */
  static async getReturningUserData(): Promise<{ email: string; lastAuthMethod: 'google' | 'email' } | null> {
    try {
      const returningUserData = await AsyncStorage.getItem(this.RETURNING_USER_DATA_KEY);
      return returningUserData ? JSON.parse(returningUserData) : null;
    } catch (error) {
      console.error('Error getting returning user data:', error);
      return null;
    }
  }

  /**
   * Clear returning user data (called after successful sign-in)
   */
  static async clearReturningUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.RETURNING_USER_DATA_KEY);
      console.log('Cleared returning user data after successful sign-in');
    } catch (error) {
      console.error('Error clearing returning user data:', error);
    }
  }

  /**
   * Update session with new data
   */
  static async updateUserSession(updates: Partial<UserSession>): Promise<void> {
    try {
      const currentSession = await this.getUserSession();
      if (currentSession) {
        const updatedSession = { ...currentSession, ...updates };
        await this.saveUserSession(updatedSession);
      }
    } catch (error) {
      console.error('Error updating user session:', error);
    }
  }

  /**
   * Check if user has completed store setup
   */
  static async hasCompletedSetup(): Promise<boolean> {
    try {
      const session = await this.getUserSession();
      return session?.storeName ? true : false;
    } catch (error) {
      console.error('Error checking setup completion:', error);
      return false;
    }
  }

  /**
   * Get user's store name
   */
  static async getStoreName(): Promise<string | null> {
    try {
      const session = await this.getUserSession();
      return session?.storeName || null;
    } catch (error) {
      console.error('Error getting store name:', error);
      return null;
    }
  }
} 