import { supabase } from '../config/supabase';
import type { InsertUser } from '../types/database';

export class UserProfileService {
  /**
   * Save user profile data after Clerk authentication
   */
  static async saveUserProfile(clerkUserId: string, email: string, storeName: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: clerkUserId,
          email,
          store_name: storeName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error saving user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Update user store name
   */
  static async updateStoreName(clerkUserId: string, storeName: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          store_name: storeName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clerkUserId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating store name:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user profile by Clerk user ID
   */
  static async getUserProfile(clerkUserId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUserId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user profile exists
   */
  static async userProfileExists(clerkUserId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', clerkUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      return { exists: !!data, error: null };
    } catch (error) {
      console.error('Error checking user profile:', error);
      return { exists: false, error };
    }
  }
} 