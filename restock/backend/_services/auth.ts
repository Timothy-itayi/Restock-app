import { supabase } from '../_config/supabase';
import type { User, UpdateUser } from '../_types/database';

export class AuthService {
  /**
   * Sign up a new user (passwordless)
   * Note: Since we're using Clerk for auth, this is mainly for profile creation
   */
  static async signUp(email: string, storeName?: string) {
    try {
      // Create user profile in Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase().trim(),
          store_name: storeName?.trim() || '',
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { user: { id: newUser.id } }, error: null };
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
      // Check if user profile exists in Supabase
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
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
   * Note: Since we're using Clerk for auth, this gets the profile from Supabase
   */
  static async getCurrentUser() {
    try {
      // This would need to be called with a specific user ID
      // For now, return null as this method needs context
      return { user: null, error: new Error('getCurrentUser requires user context') };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * Get user session
   * Note: Since we're using Clerk for auth, this gets the profile from Supabase
   */
  static async getSession() {
    try {
      // This would need to be called with a specific user ID
      // For now, return null as this method needs context
      return { session: null, error: new Error('getSession requires user context') };
    } catch (error) {
      return { session: null, error };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: any) {
    try {
      const updateData: UpdateUser = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.storeName !== undefined) updateData.store_name = updates.storeName;
      // Note: email updates are not allowed in the current schema

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: updatedUser.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
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