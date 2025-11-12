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

  static async saveUserSession(session: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      await AsyncStorage.setItem(this.RETURNING_USER_KEY, 'true');
    } catch (e) {
      console.error('Error saving user session:', e);
    }
  }

  static async getUserSession(): Promise<UserSession | null> {
    try {
      const data = await AsyncStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading user session:', e);
      return null;
    }
  }

  static async isReturningUser(): Promise<boolean> {
    try {
      const flag = await AsyncStorage.getItem(this.RETURNING_USER_KEY);
      return flag === 'true';
    } catch (e) {
      console.error('Error checking returning user:', e);
      return false;
    }
  }

  static async clearUserSession(): Promise<void> {
    try {
      console.log('🧹 SessionManager: Clearing user session and returning user flags');
      await AsyncStorage.removeItem(this.SESSION_KEY);
      await AsyncStorage.removeItem(this.RETURNING_USER_KEY);
      await AsyncStorage.removeItem(this.RETURNING_USER_DATA_KEY);
      console.log('✅ SessionManager: Session data cleared successfully');
    } catch (e) {
      console.error('❌ SessionManager: Error clearing user session:', e);
    }
  }

  static async clearReturningUserData(): Promise<void> {
    try {
      console.log('🧹 SessionManager: Clearing returning user data only');
      await AsyncStorage.removeItem(this.RETURNING_USER_KEY);
      await AsyncStorage.removeItem(this.RETURNING_USER_DATA_KEY);
      console.log('✅ SessionManager: Returning user data cleared');
    } catch (e) {
      console.error('❌ SessionManager: Error clearing returning user data:', e);
    }
  }

  static async initializeStartupCleanup(): Promise<void> {
    try {
      const session = await this.getUserSession();
      const returningFlag = await AsyncStorage.getItem(this.RETURNING_USER_KEY);
      if (!session && returningFlag === 'true') {
        console.warn('[RESTOCK_START] Clearing stale returning-user flags');
        await this.clearReturningUserData();
      }
    } catch (e) {
      console.error('[RESTOCK_START] Failed to initialize session cleanup:', e);
    }
  }
}
