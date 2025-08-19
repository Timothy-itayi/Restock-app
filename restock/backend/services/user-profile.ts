import { supabase } from '../config/supabase';
import type { User, InsertUser, UpdateUser } from '../types/database';

export class UserProfileService {
  /**
   * Check if an email already exists in our users table
   */
  static async emailExists(email: string): Promise<{ exists: boolean; ownerId?: string; error?: any }> {
    try {
      const normalized = email.toLowerCase();
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', normalized);

      if (error) throw error;
      const existingUser = users?.[0];
      return { exists: !!existingUser, ownerId: existingUser?.id };
    } catch (error) {
      console.error('Error checking email existence:', error);
      return { exists: false, error };
    }
  }

  /**
   * Test Supabase connection
   */
  static async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data: users, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      console.log('Supabase connection successful');
      return { success: true, error: null };
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      return { success: false, error };
    }
  }

  /**
   * Create user profile via RPC (RLS-safe)
   */
  static async createProfileViaBackend(
    email: string,
    storename: string,
    name?: string,
    clerk_id?: string
  ) {
    try {
      if (!clerk_id) throw new Error('clerk_id is required to create a user profile');

      const { data: newUser, error } = await supabase.rpc('create_user_profile', {
        p_email: email.toLowerCase().trim(),
        p_name: name?.trim(),
        p_storename: storename.trim(),
        p_clerk_id: clerk_id
      });

      if (error) throw error;

      // Supabase RPC returns an array even for a single inserted row
      return { data: newUser?.[0] || null, error: null };
    } catch (error) {
      console.error('Error creating profile via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Ensure user profile exists via RPC
   */
  static async ensureUserProfile(
    email: string,
    storename: string,
    name?: string,
    clerk_id?: string
  ) {
    try {
      // Try fetching the profile via RPC first
      const { data: profile, error: fetchError } = await supabase.rpc('get_current_user_profile');
      if (fetchError) throw fetchError;

      if (profile) return { data: profile, error: null };

      // Profile doesn't exist — create it via RPC
      return await this.createProfileViaBackend(email, storename, name, clerk_id);
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if the current session user has completed profile setup
   */
  static async hasCompletedProfileSetup() {
    try {
      const { data: profile, error } = await supabase.rpc('get_current_user_profile');
      if (error) throw error;

      const isComplete = profile && profile.store_name && profile.store_name.trim() !== '';
      return { hasCompletedSetup: isComplete, error: null };
    } catch (error) {
      console.error('Error checking profile setup via Supabase:', error);
      return { hasCompletedSetup: false, error };
    }
  }

  /**
   * Update store name for current session user
   */
  static async updateStorename(storename: string) {
    try {
      const { data: updatedUser, error } = await supabase.rpc('update_current_user_store_name', {
        p_storename: storename.trim()
      });
      if (error) throw error;

      console.log('Store name updated successfully');
      return { data: updatedUser, error: null };
    } catch (error) {
      console.error('Error updating store name:', error);
      return { data: null, error };
    }
  }

  /**
   * Get the profile for current session user
   */
  static async getUserProfile() {
    try {
      const { data: profile, error } = await supabase.rpc('get_current_user_profile');
      if (error) throw error;

      return { data: profile, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { data: null, error };
    }
  }
}
