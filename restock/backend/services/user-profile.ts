import { supabase } from '../config/supabase';
import type { InsertUser } from '../types/database';

export class UserProfileService {
  /**
   * Check if an email already exists in our users table
   */
  static async emailExists(email: string): Promise<{ exists: boolean; ownerId?: string; error?: any }> {
    try {
      const normalized = email.toLowerCase();
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .ilike('email', normalized)
        .maybeSingle();

      if (error) {
        return { exists: false, error };
      }

      return { exists: !!data, ownerId: data?.id };
    } catch (error) {
      return { exists: false, error };
    }
  }
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
      // Import UserContextService to set context for RLS
      const { UserContextService } = await import('./user-context');
      
      // Set user context before querying to satisfy RLS policies
      try {
        await UserContextService.setUserContext(clerkUserId);
        console.log('👤 UserProfileService: User context set for profile fetch');
      } catch (contextError) {
        console.warn('👤 UserProfileService: Could not set user context, trying without:', contextError);
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUserId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;
      
      if (data) {
        console.log('👤 UserProfileService: Profile fetched successfully', { 
          id: data.id, 
          name: data.name, 
          storeName: data.store_name 
        });
      } else {
        console.log('👤 UserProfileService: No profile data found for user');
      }

      return { data, error: null };
    } catch (error) {
      console.error('👤 UserProfileService: Error getting user profile:', error);
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
   * Uses admin privileges via backend to bypass RLS issues
   */
  static async hasCompletedProfileSetup(clerkUserId: string) {
    try {
      console.log('🔍 Checking profile setup via backend for:', clerkUserId);
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Call a simplified endpoint to check profile completion
      const response = await fetch(`${supabaseUrl}/functions/v1/check-profile-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ clerkUserId })
      });

      if (!response.ok) {
        console.log('⚠️ Backend check failed, falling back to regular client');
        // Fallback to regular client if backend fails
        return await this.hasCompletedProfileSetupFallback(clerkUserId);
      }

      const result = await response.json();
      console.log('📊 Backend profile check result:', result);
      
      return { 
        hasCompletedSetup: result.hasCompletedSetup || false, 
        error: result.error || null 
      };

    } catch (error) {
      console.error('Error checking profile setup via backend:', error);
      // Fallback to regular client
      return await this.hasCompletedProfileSetupFallback(clerkUserId);
    }
  }

  /**
   * Fallback method using regular Supabase client (may have RLS issues)
   */
  static async hasCompletedProfileSetupFallback(clerkUserId: string) {
    try {
      console.log('🔄 Using fallback profile check for:', clerkUserId);
      
      const { data, error } = await supabase
        .from('users')
        .select('store_name')
        .eq('id', clerkUserId)
        .maybeSingle();

      if (error) throw error;

      // User has completed setup if they have a store_name
      const hasCompletedSetup = !!(data && data.store_name && data.store_name.trim() !== '');
      
      console.log('Profile setup check (fallback):', {
        userId: clerkUserId,
        hasStoreName: !!(data && data.store_name),
        storeName: data?.store_name,
        hasCompletedSetup
      });

      return { hasCompletedSetup, error: null };
    } catch (error) {
      console.error('Error checking profile setup completion (fallback):', error);
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
   * Create user profile via backend Edge Function with service role privileges
   * This bypasses RLS policies and handles both email and SSO users
   */
  static async createProfileViaBackend(clerkUserId: string, email: string, storeName: string, name?: string, authMethod: 'email' | 'google' | 'sso' = 'email') {
    try {
      console.log('Creating user profile via backend:', { clerkUserId, email, storeName, name, authMethod });
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-user-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          clerkUserId,
          email: email.toLowerCase().trim(),
          storeName: storeName.trim(),
          name: name?.trim(),
          authMethod
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Backend profile creation failed:', result);
        return { data: null, error: result };
      }

      if (!result.success) {
        console.error('Profile creation error:', result.error);
        const error = new Error(result.details || result.error);
        // @ts-ignore add code for upstream handlers
        (error as any).code = result.error;
        return { data: null, error };
      }

      console.log('✅ User profile created successfully via backend:', result.data.id);
      console.log('📊 Returning success result to frontend:', { data: result.data, error: null });
      return { data: result.data, error: null };

    } catch (error) {
      console.error('Error calling backend profile creation:', error);
      return { data: null, error };
    }
  }

  /**
   * Ensure user profile exists - creates if doesn't exist
   * Uses backend Edge Function for secure profile creation
   */
  static async ensureUserProfile(clerkUserId: string, email: string, storeName: string, name?: string) {
    try {
      console.log('Ensuring user profile exists for:', { clerkUserId, email, storeName, name });
      
      // First check if user already exists (read-only operation)
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUserId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing user:', checkError);
        // If we can't check, try creating via backend anyway
      }

      if (existingUser) {
        console.log('User profile already exists:', existingUser);
        return { data: existingUser, error: null };
      }

      // User doesn't exist, create via backend Edge Function
      console.log('User profile does not exist, creating via backend...');
      
      // Determine auth method based on context or default to email
      const authMethod = 'email'; // You can enhance this logic based on your needs
      
      return await this.createProfileViaBackend(clerkUserId, email, storeName, name, authMethod);

    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return { data: null, error };
    }
  }
} 