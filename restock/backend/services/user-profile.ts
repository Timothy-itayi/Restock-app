import { supabase } from '../config/supabase';
import type { InsertUser } from '../types/database';

export class UserProfileService {
  /**
   * Test Supabase connection and verify users table exists
   */
  static async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      
      // Try to query the users table
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Supabase connection test failed:', error);
        return { success: false, error };
      }

      console.log('Supabase connection successful');
      return { success: true, error: null };
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      return { success: false, error };
    }
  }

  /**
   * Save user profile data after Clerk authentication
   */
  static async saveUserProfile(clerkUserId: string, email: string, storeName: string) {
    try {
      // First, try to insert with updated_at
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

      if (error) {
        // If the error is about missing updated_at column, try without it
        if (error.code === 'PGRST204' && error.message?.includes('updated_at')) {
          console.log('Retrying without updated_at column');
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .upsert({
              id: clerkUserId,
              email,
              store_name: storeName,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (retryError) throw retryError;
          return { data: retryData, error: null };
        }
        throw error;
      }

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
      // Try with updated_at first
      const { data, error } = await supabase
        .from('users')
        .update({
          store_name: storeName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clerkUserId)
        .select()
        .single();

      if (error) {
        // If the error is about missing updated_at column, try without it
        if (error.code === 'PGRST204' && error.message?.includes('updated_at')) {
          console.log('Retrying update without updated_at column');
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .update({
              store_name: storeName,
            })
            .eq('id', clerkUserId)
            .select()
            .single();

          if (retryError) throw retryError;
          return { data: retryData, error: null };
        }
        throw error;
      }

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

  /**
   * Verify user profile was saved successfully
   */
  static async verifyUserProfile(clerkUserId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUserId)
        .single();

      if (error) throw error;

      console.log('User profile verified:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error verifying user profile:', error);
      return { data: null, error };
    }
  }
} 