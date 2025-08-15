import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

// Initialize Convex client for backend usage
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export class AuthService {
  /**
   * Sign up a new user (passwordless)
   * Note: Since we're using Clerk for auth, this is mainly for profile creation
   */
  static async signUp(email: string, storeName?: string) {
    try {
      // Create user profile in Convex
      const userId = await convex.mutation(api.users.create, {
        email: email.toLowerCase().trim(),
        storeName: storeName?.trim() || '',
      });

      return { data: { user: { id: userId } }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sign in existing user (passwordless)
   * Note: Since we're using Clerk for auth, this is mainly for profile verification
   */
  static async signIn(email: string) {
    try {
      // Check if user profile exists in Convex
      const profile = await convex.query(api.users.get);
      
      if (profile) {
        return { data: { user: profile }, error: null };
      } else {
        return { data: null, error: new Error('User profile not found') };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sign out current user
   * Note: Since we're using Clerk for auth, this is handled by Clerk
   */
  static async signOut() {
    try {
      // Clerk handles sign out, just return success
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get current user
   * Note: Since we're using Clerk for auth, this gets the profile from Convex
   */
  static async getCurrentUser() {
    try {
      const profile = await convex.query(api.users.get);
      
      if (profile) {
        return { user: profile, error: null };
      } else {
        return { user: null, error: null };
      }
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * Get user session
   * Note: Since we're using Clerk for auth, this gets the profile from Convex
   */
  static async getSession() {
    try {
      const profile = await convex.query(api.users.get);
      
      if (profile) {
        return { session: { user: profile }, error: null };
      } else {
        return { session: null, error: null };
      }
    } catch (error) {
      return { session: null, error };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: any) {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.storeName !== undefined) updateData.storeName = updates.storeName;
      if (updates.email !== undefined) updateData.email = updates.email;

      const updatedId = await convex.mutation(api.users.update, updateData);

      return { data: { id: updatedId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    try {
      const profile = await convex.query(api.users.get);
      
      if (profile) {
        return { data: profile, error: null };
      } else {
        return { data: null, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Resend email confirmation
   * Note: Since we're using Clerk for auth, this is handled by Clerk
   */
  static async resendConfirmation(email: string) {
    try {
      // Clerk handles email confirmation, just return success
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
} 