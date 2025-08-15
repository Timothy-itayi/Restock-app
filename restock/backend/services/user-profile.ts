import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

// Initialize Convex client for backend usage
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export class UserProfileService {
  /**
   * Check if an email already exists in our users table
   */
  static async emailExists(email: string): Promise<{ exists: boolean; ownerId?: string; error?: any }> {
    try {
      const normalized = email.toLowerCase();
      
      // Use Convex to check if user exists by email
      const users = await convex.query(api.users.list);
      const existingUser = users.find(user => user.email.toLowerCase() === normalized);
      
      return { 
        exists: !!existingUser, 
        ownerId: existingUser?._id 
      };
    } catch (error) {
      console.error('Error checking email existence:', error);
      return { exists: false, error };
    }
  }

  /**
   * Test Convex connection and verify users table exists
   */
  static async testConnection() {
    try {
      console.log('Testing Convex connection...');
      
      // Try to query the users table
      const users = await convex.query(api.users.list);
      
      console.log('Convex connection successful, users count:', users.length);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error testing Convex connection:', error);
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
      
      // Check if user already exists
      const existingUser = await convex.query(api.users.get);
      
      if (existingUser) {
        // Update existing user
        const userId = await convex.mutation(api.users.update, {
          name: name || existingUser.name,
          storeName: storeName || existingUser.storeName
        });
        console.log('Profile updated successfully:', userId);
        return { data: { id: userId }, error: null };
      } else {
        // Create new user
        const userId = await convex.mutation(api.users.create, {
          email: email.toLowerCase().trim(),
          name: name?.trim(),
          storeName: storeName.trim()
        });
        console.log('Profile saved successfully:', userId);
        return { data: { id: userId }, error: null };
      }
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
      const userId = await convex.mutation(api.users.update, {
        storeName: storeName.trim()
      });
      
      console.log('Store name updated successfully:', userId);
      return { data: { id: userId }, error: null };
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
      const profile = await convex.query(api.users.get);
      
      if (profile) {
        console.log('👤 UserProfileService: Profile fetched successfully', { 
          id: profile._id, 
          name: profile.name, 
          storeName: profile.storeName 
        });
        return { data: profile, error: null };
      } else {
        console.log('👤 UserProfileService: No profile data found for user');
        return { data: null, error: null };
      }
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
      const profile = await convex.query(api.users.get);
      return { exists: !!profile, error: null };
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
      console.log('🔍 Checking profile setup via Convex for:', clerkUserId);
      
      const profileCompletion = await convex.query(api.users.checkProfileCompletion);
      
      console.log('📊 Convex profile check result:', profileCompletion);
      
      return { 
        hasCompletedSetup: profileCompletion?.isComplete || false, 
        error: profileCompletion?.message || null 
      };

    } catch (error) {
      console.error('Error checking profile setup via Convex:', error);
      return { hasCompletedSetup: false, error };
    }
  }

  /**
   * Verify user profile was saved successfully
   */
  static async verifyUserProfile(clerkUserId: string) {
    try {
      const profile = await convex.query(api.users.get);

      if (!profile) {
        // User doesn't exist yet
        console.log('User profile does not exist yet');
        return { data: null, error: null };
      }

      console.log('User profile verified:', profile);
      return { data: profile, error: null };
    } catch (error) {
      console.error('Error verifying user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Create user profile via Convex
   */
  static async createProfileViaBackend(clerkUserId: string, email: string, storeName: string, name?: string, authMethod: 'email' | 'google' | 'sso' = 'email') {
    try {
      console.log('Creating user profile via Convex:', { clerkUserId, email, storeName, name, authMethod });
      
      const userId = await convex.mutation(api.users.create, {
        email: email.toLowerCase().trim(),
        name: name?.trim(),
        storeName: storeName.trim()
      });

      console.log('✅ User profile created successfully via Convex:', userId);
      return { data: { id: userId }, error: null };

    } catch (error) {
      console.error('Error creating profile via Convex:', error);
      return { data: null, error };
    }
  }

  /**
   * Ensure user profile exists - creates if doesn't exist
   */
  static async ensureUserProfile(clerkUserId: string, email: string, storeName: string, name?: string) {
    try {
      console.log('Ensuring user profile exists for:', { clerkUserId, email, storeName, name });
      
      // First check if user already exists
      const existingUser = await convex.query(api.users.get);

      if (existingUser) {
        console.log('User profile already exists:', existingUser);
        return { data: existingUser, error: null };
      }

      // User doesn't exist, create via Convex
      console.log('User profile does not exist, creating via Convex...');
      
      return await this.createProfileViaBackend(clerkUserId, email, storeName, name, 'email');

    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return { data: null, error };
    }
  }
} 