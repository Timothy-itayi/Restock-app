import { supabase } from '../config/supabase';
import type { InsertUser } from '../types/database';

export class AuthService {
  /**
   * Sign up a new user (passwordless)
   */
  static async signUp(email: string, storeName?: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            store_name: storeName,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sign in existing user (passwordless)
   */
  static async signIn(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * Get user session
   */
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      return { session: null, error };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<InsertUser>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Resend email confirmation
   */
  static async resendConfirmation(email: string) {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
} 