import { supabase } from '../../_config/supabase';
import { UserRepository, UserProfile, CreateUserProfileRequest, UpdateUserProfileRequest } from '../../../lib/domain/_interfaces/UserRepository';

export class SupabaseUserRepository implements UserRepository {
  async createProfile(request: CreateUserProfileRequest): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_user_profile', {
        p_email: request.email,
        p_name: request.name,
        p_storename: request.storeName,
        p_clerk_id: request.clerk_id
      });

      if (error) {
        throw new Error(`Failed to create user profile: ${error.message}`);
      }

      // RPC returns array, get first item
      const createdProfile = Array.isArray(data) ? data[0] : data;
      return createdProfile?.id || '';
    } catch (error) {
      throw new Error(`Failed to create user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase.rpc('get_current_user_profile');
      
      if (error) {
        throw new Error(`Failed to get current user profile: ${error.message}`);
      }

      return profile ? this.mapToUserProfile(profile) : null;
    } catch (error) {
      console.error('[SupabaseUserRepository] Error getting current profile:', error);
      return null;
    }
  }

  async updateProfile(request: UpdateUserProfileRequest): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('update_current_user_profile', {
        p_name: request.name,
        p_storename: request.storeName
      });

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      // RPC returns array, get first item
      const updatedProfile = Array.isArray(data) ? data[0] : data;
      return updatedProfile?.id || '';
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkProfileCompletion(): Promise<{ isComplete: boolean; missingFields: string[] }> {
    try {
      const profile = await this.getCurrentProfile();
      
      if (!profile) {
        return { isComplete: false, missingFields: ['profile'] };
      }

      const missingFields: string[] = [];
      
      if (!profile.name || profile.name.trim() === '') {
        missingFields.push('name');
      }
      
      if (!profile.storeName || profile.storeName.trim() === '') {
        missingFields.push('storeName');
      }

      return {
        isComplete: missingFields.length === 0,
        missingFields
      };
    } catch (error) {
      console.error('[SupabaseUserRepository] Error checking profile completion:', error);
      return { isComplete: false, missingFields: ['error'] };
    }
  }

  // Helper method to get profile by Clerk user ID
  async getProfileByClerkId(clerk_id: string): Promise<UserProfile | null> {
    try {
      // Use the RPC function that gets current user profile
      // This assumes the Clerk ID is properly set in the auth context
      const { data: profile, error } = await supabase.rpc('get_current_user_profile');
      
      if (error) {
        throw new Error(`Failed to get user profile: ${error.message}`);
      }

      return profile ? this.mapToUserProfile(profile) : null;
    } catch (error) {
      console.error('[SupabaseUserRepository] Error getting profile by Clerk ID:', error);
      return null;
    }
  }

  // Helper method to update profile by Clerk user ID
  async updateProfileByClerkId(clerk_id: string, request: UpdateUserProfileRequest): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('update_current_user_profile', {
        p_name: request.name,
        p_storename: request.storeName
      });

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      // RPC returns array, get first item
      const updatedProfile = Array.isArray(data) ? data[0] : data;
      return updatedProfile?.id || '';
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to check profile completion by Clerk user ID
  async checkProfileCompletionByClerkId(clerk_id: string): Promise<{ isComplete: boolean; missingFields: string[] }> {
    try {
      const profile = await this.getProfileByClerkId(clerk_id);
      
      if (!profile) {
        return { isComplete: false, missingFields: ['profile'] };
      }

      const missingFields: string[] = [];
      
      if (!profile.name || profile.name.trim() === '') {
        missingFields.push('name');
      }
      
      if (!profile.storeName || profile.storeName.trim() === '') {
        missingFields.push('storeName');
      }

      return {
        isComplete: missingFields.length === 0,
        missingFields
      };
    } catch (error) {
      console.error('[SupabaseUserRepository] Error checking profile completion by Clerk ID:', error);
      return { isComplete: false, missingFields: ['error'] };
    }
  }

  private mapToUserProfile(data: any): UserProfile {
    return {
      id: data.id,
      clerk_id: data.clerk_id,
      email: data.email,
      name: data.name || '',
      storeName: data.store_name || '',
      createdAt: data.created_at ? new Date(data.created_at).getTime() : new Date().getTime(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : new Date().getTime()
    };
  }
}
