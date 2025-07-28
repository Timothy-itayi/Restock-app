import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSession {
  userId: string;
  email: string;
  storeName?: string;
  wasSignedIn: boolean;
  lastSignIn: number;
}

export class SessionManager {
  private static readonly SESSION_KEY = 'user_session';
  private static readonly RETURNING_USER_KEY = 'returning_user_flag';

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
   * Clear user session data
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