/**
 * INFRASTRUCTURE SERVICE: UserContextService
 * 
 * Bridges Clerk authentication with Supabase RLS context
 * Solves the chicken-and-egg problem when creating user profiles
 */

import { supabaseWithAuth } from '../../../backend/_config/supabase';

export interface UserContextService {
  getCurrentUserId(): Promise<string | null>;
  setUserContext(userId: string): Promise<void>;
  clearUserContext(): Promise<void>;
}

/**
 * ClerkUserContextService
 * 
 * Manages user context for Supabase RLS policies using Clerk user IDs
 * Handles the bootstrap problem where we need to set context before profile exists
 */
export class ClerkUserContextService implements UserContextService {
  private currentUserId: string | null = null;

  /**
   * Get current user ID from Clerk auth
   */
  async getCurrentUserId(): Promise<string | null> {
    if (this.currentUserId) {
      return this.currentUserId;
    }

    try {
      const supabase = await supabaseWithAuth();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.id) {
        this.currentUserId = user.id;
        return user.id;
      }
      
      return null;
    } catch (error) {
      console.error('[UserContextService] Error getting current user:', error);
      return null;
    }
  }

  /**
   * Set Supabase RLS context for the given user
   * Critical for chicken-and-egg problem during profile creation
   */
  async setUserContext(userId: string): Promise<void> {
    try {
      const supabase = await supabaseWithAuth();
      
      // Set the user context in Supabase session
      // This allows RLS policies to work even before user profile is fully created
      await supabase.rpc('set_user_context', { user_id: userId });
      
      this.currentUserId = userId;
      
      console.log('[UserContextService] User context set for:', userId);
    } catch (error) {
      console.error('[UserContextService] Error setting user context:', error);
      throw new Error(`Failed to set user context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear user context (e.g., on logout)
   */
  async clearUserContext(): Promise<void> {
    try {
      const supabase = await supabaseWithAuth();
      
      // Clear the RLS context
      await supabase.rpc('clear_user_context');
      
      this.currentUserId = null;
      
      console.log('[UserContextService] User context cleared');
    } catch (error) {
      console.error('[UserContextService] Error clearing user context:', error);
      // Don't throw - clearing context is best-effort
    }
  }
}

