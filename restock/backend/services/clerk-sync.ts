import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

// Initialize Convex client for backend usage
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export class ClerkSyncService {
  /**
   * Sync Clerk user data to Convex users table
   */
  static async syncUserToConvex(clerkUserId: string, email: string, storeName?: string) {
    try {
      // Check if user already exists
      const existingUser = await convex.query(api.users.get);
      
      if (existingUser) {
        // Update existing user
        const userId = await convex.mutation(api.users.update, {
          storeName: storeName || existingUser.storeName
        });
        return { data: { id: userId }, error: null };
      } else {
        // Create new user
        const userId = await convex.mutation(api.users.create, {
          email: email.toLowerCase().trim(),
          storeName: storeName?.trim() || ''
        });
        return { data: { id: userId }, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user from Convex by Clerk user ID
   */
  static async getUserFromConvex(clerkUserId: string) {
    try {
      const profile = await convex.query(api.users.get);
      
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
   * Update user store name in Convex
   */
  static async updateStoreName(clerkUserId: string, storeName: string) {
    try {
      const userId = await convex.mutation(api.users.update, {
        storeName: storeName.trim()
      });
      
      return { data: { id: userId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Check if user exists in Convex
   */
  static async userExists(clerkUserId: string): Promise<boolean> {
    try {
      const profile = await convex.query(api.users.get);
      return !!profile;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create or update user in Convex
   */
  static async createOrUpdateUser(userData: any) {
    try {
      // Check if user already exists
      const existingUser = await convex.query(api.users.get);
      
      if (existingUser) {
        // Update existing user
        const updateData: any = {};
        if (userData.name !== undefined) updateData.name = userData.name;
        if (userData.storeName !== undefined) updateData.storeName = userData.storeName;
        if (userData.email !== undefined) updateData.email = userData.email;
        
        const userId = await convex.mutation(api.users.update, updateData);
        return { data: { id: userId }, error: null };
      } else {
        // Create new user
        const userId = await convex.mutation(api.users.create, {
          email: userData.email?.toLowerCase().trim() || '',
          name: userData.name?.trim(),
          storeName: userData.storeName?.trim() || ''
        });
        return { data: { id: userId }, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }
} 