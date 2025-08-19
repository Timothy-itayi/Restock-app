import { supabase } from '../../backend/config/supabase';
import { UserRepository, UserProfile, CreateUserProfileRequest, UpdateUserProfileRequest } from '../../app/domain/interfaces/UserRepository';

export class SupabaseUserRepository implements UserRepository {
  async createProfile(request: CreateUserProfileRequest): Promise<string> {
    // This would need the current user's Clerk ID from context
    // For now, we'll need to pass it in the request or get it from auth context
    const { data, error } = await supabase
      .from('users')
      .insert({
        clerk_id: request.clerk_id, // This needs to be added to the request
        email: request.email,
        name: request.name,
        store_name: request.storeName
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data.id;
  }

  async getCurrentProfile(): Promise<UserProfile | null> {
    // This would need to get the current user's Clerk ID from auth context
    // For now, we'll need to implement this differently
    throw new Error('getCurrentProfile not implemented - needs auth context');
  }

  async updateProfile(request: UpdateUserProfileRequest): Promise<string> {
    // This would need the current user's Clerk ID from context
    // For now, we'll need to implement this differently
    throw new Error('updateProfile not implemented - needs auth context');
  }

  async checkProfileCompletion(): Promise<{ isComplete: boolean; missingFields: string[] }> {
    // This would need the current user's Clerk ID from context
    // For now, we'll need to implement this differently
    throw new Error('checkProfileCompletion not implemented - needs auth context');
  }

  // Helper method to get profile by Clerk user ID
  async getProfileByClerkId(clerk_id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('clerk_id', clerk_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return this.mapToUserProfile(data);
  }

  // Helper method to update profile by Clerk user ID
  async updateProfileByClerkId(clerk_id: string, request: UpdateUserProfileRequest): Promise<string> {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: request.name,
        store_name: request.storeName
      })
      .eq('clerk_id', clerk_id)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data.id;
  }

  // Helper method to check profile completion by Clerk user ID
  async checkProfileCompletionByClerkId(clerk_id: string): Promise<{ isComplete: boolean; missingFields: string[] }> {
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
  }

  private mapToUserProfile(dbUser: any): UserProfile {
    return {
      id: dbUser.id,
      clerk_id: dbUser.clerk_id,
      email: dbUser.email,
      name: dbUser.name,
      storeName: dbUser.store_name,
      createdAt: new Date(dbUser.created_at).getTime(),
      updatedAt: new Date(dbUser.updated_at).getTime(),
      userName: dbUser.name // Backward compatibility alias
    };
  }
}
