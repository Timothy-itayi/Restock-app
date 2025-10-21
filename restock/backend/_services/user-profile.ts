import { supabase, supabaseWithAuth } from '../_config/supabase';


export class UserProfileService {
  /**
   * Check if an email already exists in our users table
   */
  static async emailExists(email: string): Promise<{ exists: boolean; ownerId?: string; error?: any }> {
    try {
      const client = await supabaseWithAuth();
      const normalized = email.toLowerCase();
      const { data: users, error } = await client
        .from('users')
        .select('id, email')
        .eq('email', normalized);

      if (error) throw error;
      const existingUser = (users as Array<{ id: string; email: string }> | null)?.[0] as
        | { id: string; email: string }
        | undefined;
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
      const client = await supabaseWithAuth();
      console.log('Testing Supabase connection...');
      // Test RPC connection by calling a simple function
      const { data, error } = await client.rpc('get_current_user_profile');
      if (error && (error as any).code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" which is fine for testing
      console.log('Supabase RPC connection successful');
      return { success: true, error: null };
    } catch (error) {
      console.error('Error testing Supabase RPC connection:', error);
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

      const client = await supabaseWithAuth();
      const { data: newUser, error } = await client.rpc('create_user_profile', {
        p_email: email.toLowerCase().trim(),
        p_clerk_id: clerk_id,
        p_name: name?.trim(),
        p_storename: storename.trim()
      } as any);

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
      const client = await supabaseWithAuth();
      // Try fetching the profile via RPC first
      const { data: profile, error: fetchError } = await client.rpc('get_current_user_profile');
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
      const client = await supabaseWithAuth();
      const { data: profile, error } = await client.rpc('get_current_user_profile');
      if (error) throw error;

      const user = profile as any;
      const isComplete = user && user.store_name && String(user.store_name).trim() !== '';
      return { hasCompletedSetup: isComplete, error: null };
    } catch (error) {
      console.error('Error checking profile setup via Supabase:', error);
      return { hasCompletedSetup: false, error };
    }
  }

  /**
   * Check if a user has completed profile setup by Clerk ID
   * Uses the new dedicated RPC function for reliability
   */
  static async hasCompletedProfileSetupByClerkId(clerkId: string) {
    try {
      if (!clerkId) {
        console.error('clerk_id is required to check profile setup');
        return { hasCompletedSetup: false, error: 'clerk_id is required' };
      }

      console.log('🔍 UserProfileService: Checking profile setup for Clerk ID:', clerkId);
      const client = await supabaseWithAuth();
      // Use the new dedicated RPC function
      const { data: profile, error } = await client.rpc('get_user_profile_by_clerk_id', {
        p_clerk_id: clerkId
      } as any);

      if (error) {
        console.error('❌ UserProfileService: RPC error checking profile setup:', error);
        return { hasCompletedSetup: false, error };
      }

      // The function returns a table, so we get an array - take the first result
      const userProfile: any = Array.isArray(profile) ? profile[0] : profile;
      
      if (!userProfile) {
        console.log('🔍 UserProfileService: No profile found for Clerk ID:', clerkId);
        return { hasCompletedSetup: false, error: null };
      }

      const isComplete = userProfile.store_name && String(userProfile.store_name).trim() !== '';
      console.log('🔍 UserProfileService: Profile setup check result:', { 
        isComplete, 
        storeName: userProfile.store_name,
        profile: userProfile
      });
      return { hasCompletedSetup: isComplete, error: null };
    } catch (error) {
      console.error('❌ UserProfileService: Error checking profile setup by Clerk ID:', error);
      return { hasCompletedSetup: false, error };
    }
  }

  /**
   * Update store name for current session user
   */
  static async updateStorename(storename: string) {
    try {
      const client = await supabaseWithAuth();
      const { data: updatedUser, error } = await client.rpc('update_current_user_store_name', {
        p_storename: storename.trim()
      } as any);
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
      const client = await supabaseWithAuth();
      const { data: profile, error } = await client.rpc('get_current_user_profile');
      if (error) throw error;

      return { data: profile, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user profile by Clerk ID - uses the new dedicated RPC function
   * This function bypasses RLS issues by using SECURITY DEFINER
   */
  static async getUserProfileByClerkId(clerkId: string) {
    try {
      if (!clerkId) {
        console.error('clerk_id is required to get user profile');
        return { data: null, error: 'clerk_id is required' };
      }

      console.log('🔍 UserProfileService: Fetching profile for Clerk ID:', clerkId);
      const client = await supabaseWithAuth();
      // Use the new dedicated RPC function that takes clerk_id as parameter
      const { data: profile, error } = await client.rpc('get_user_profile_by_clerk_id', {
        p_clerk_id: clerkId
      } as any);

      if (error) {
        console.error('❌ UserProfileService: RPC error getting user profile by clerk ID:', error);
        return { data: null, error };
      }

      // The function returns a table, so we get an array - take the first (and should be only) result
      const userProfile = Array.isArray(profile) ? profile[0] : profile;
      
      if (!userProfile) {
        console.log('🔍 UserProfileService: No profile found for Clerk ID:', clerkId);
        return { data: null, error: null };
      }

      console.log('✅ UserProfileService: Profile found via RPC:', userProfile);
      return { data: userProfile, error: null };
    } catch (error) {
      console.error('❌ UserProfileService: Error getting user profile by Clerk ID:', error);
      return { data: null, error };
    }
  }
}
