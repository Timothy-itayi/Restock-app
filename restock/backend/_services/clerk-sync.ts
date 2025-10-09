import { supabase } from '../config/supabase';
import type { User, InsertUser, UpdateUser } from '../types/database';

export class ClerkSyncService {
  /**
   * Sync Clerk user data to Supabase users table
   */
  static async syncUserToSupabase(clerk_id: string, email: string, storeName?: string) {
    try {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerk_id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            store_name: storeName || existingUser.store_name
          })
          .eq('clerk_id', clerk_id)
          .select('id')
          .single();
        
        if (updateError) {
          throw updateError;
        }
        
        return { data: { id: updatedUser.id }, error: null };
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            clerk_id: clerk_id,
            email: email.toLowerCase().trim(),
            store_name: storeName?.trim() || ''
          })
          .select('id')
          .single();
        
        if (createError) {
          throw createError;
        }
        
        return { data: { id: newUser.id }, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user from Supabase by Clerk user ID
   */
  static async getUserFromSupabase(clerk_id: string) {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerk_id)
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
   * Update user store name in Supabase
   */
  static async updateStoreName(clerk_id: string, storeName: string) {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          store_name: storeName.trim()
        })
        .eq('clerk_id', clerk_id)
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
   * Check if user exists in Supabase
   */
  static async userExists(clerk_id: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerk_id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return !!profile;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create or update user in Supabase
   */
  static async createOrUpdateUser(userData: any) {
    try {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', userData.clerk_id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingUser) {
        // Update existing user
        const updateData: UpdateUser = {};
        if (userData.name !== undefined) updateData.name = userData.name;
        if (userData.storeName !== undefined) updateData.store_name = userData.storeName;
        // Note: email updates are not allowed in the current schema
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('clerk_id', userData.clerk_id)
          .select('id')
          .single();
        
        if (updateError) {
          throw updateError;
        }
        
        return { data: { id: updatedUser.id }, error: null };
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            clerk_id: userData.clerk_id,
            email: userData.email?.toLowerCase().trim() || '',
            name: userData.name?.trim(),
            store_name: userData.storeName?.trim() || ''
          })
          .select('id')
          .single();
        
        if (createError) {
          throw createError;
        }
        
        return { data: { id: newUser.id }, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }
} 