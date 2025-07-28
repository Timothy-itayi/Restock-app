import { supabase } from '../config/supabase';
import type { InsertUser, User } from '../types/database';

export class ClerkSyncService {
  /**
   * Sync Clerk user data to Supabase users table
   */
  static async syncUserToSupabase(clerkUserId: string, email: string, storeName?: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: clerkUserId,
          email,
          store_name: storeName,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user from Supabase by Clerk user ID
   */
  static async getUserFromSupabase(clerkUserId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUserId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update user store name in Supabase
   */
  static async updateStoreName(clerkUserId: string, storeName: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ store_name: storeName })
        .eq('id', clerkUserId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Check if user exists in Supabase
   */
  static async userExists(clerkUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', clerkUserId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create or update user in Supabase
   */
  static async createOrUpdateUser(userData: InsertUser) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
} 