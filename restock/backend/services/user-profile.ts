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
  static async saveUserProfile(clerkUserId: string, email: string, storeName: string, name?: string) {
    try {
      console.log('saveUserProfile called with:', {
        clerkUserId,
        email,
        storeName,
        name,
        nameType: typeof name,
        nameLength: name?.length || 0,
        nameIsEmpty: !name || name.trim() === ''
      });
      
      // First, try to insert with updated_at
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: clerkUserId,
          email,
          name,
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
              name,
              store_name: storeName,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (retryError) throw retryError;
          console.log('Profile saved successfully (retry):', retryData);
          return { data: retryData, error: null };
        }
        throw error;
      }

      console.log('Profile saved successfully:', data);
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
        .maybeSingle(); // Use maybeSingle() instead of single()

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
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;

      return { exists: !!data, error: null };
    } catch (error) {
      console.error('Error checking user profile:', error);
      return { exists: false, error };
    }
  }

  /**
   * Check if user has completed profile setup (has store_name)
   */
  static async hasCompletedProfileSetup(clerkUserId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('store_name')
        .eq('id', clerkUserId)
        .maybeSingle();

      if (error) throw error;

      // User has completed setup if they have a store_name
      const hasCompletedSetup = !!(data && data.store_name && data.store_name.trim() !== '');
      
      console.log('Profile setup check:', {
        userId: clerkUserId,
        hasStoreName: !!(data && data.store_name),
        storeName: data?.store_name,
        hasCompletedSetup
      });

      return { hasCompletedSetup, error: null };
    } catch (error) {
      console.error('Error checking profile setup completion:', error);
      return { hasCompletedSetup: false, error };
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
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;

      if (!data) {
        // User doesn't exist yet
        console.log('User profile does not exist yet');
        return { data: null, error: null };
      }

      console.log('User profile verified:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error verifying user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Ensure user profile exists - creates if doesn't exist
   * This implements the recommended flow pattern
   */
  static async ensureUserProfile(clerkUserId: string, email: string, storeName: string, name?: string) {
    try {
      console.log('Ensuring user profile exists for:', { clerkUserId, email, storeName, name });
      console.log('Name details:', {
        name,
        nameType: typeof name,
        nameLength: name?.length || 0,
        nameIsEmpty: !name || name.trim() === '',
        nameTrimmed: name?.trim()
      });
      
      // First, check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUserId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing user:', checkError);
        throw checkError;
      }

      if (existingUser) {
        console.log('User profile already exists:', existingUser);
        return { data: existingUser, error: null };
      }

      // User doesn't exist, create profile
      console.log('User profile does not exist, creating new profile');
      console.log('Creating profile with data:', {
        id: clerkUserId,
        email,
        name,
        store_name: storeName,
        nameType: typeof name,
        nameLength: name?.length || 0
      });
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: clerkUserId,
          email,
          name,
          store_name: storeName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return { data: null, error: insertError };
      }

      console.log('User profile created successfully:', newUser);
      console.log('Created profile name field:', newUser.name);
      return { data: newUser, error: null };
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return { data: null, error };
    }
  }
} 