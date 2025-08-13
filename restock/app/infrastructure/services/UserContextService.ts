/**
 * INFRASTRUCTURE SERVICE: UserContextService
 * 
 * Refactored version of the backend UserContextService for the infrastructure layer
 * Manages Row Level Security (RLS) context for database operations
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class UserContextService {
  private currentUserId: string | null = null;

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Set the current user context for all subsequent database operations
   * This must be called before any database operations that rely on RLS policies
   */
  async setUserContext(userId: string): Promise<void> {
    try {
      // Set the user context in the database session
      await this.supabase.rpc('set_current_user_id', { user_id: userId });
      this.currentUserId = userId;
      console.log('[UserContext] User context set', { userId });
      
      // Verify the context was set correctly with retry logic
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        const verification = await this.debugContext();
        if (verification.userId === userId) {
          console.log('[UserContext] Context verified successfully');
          return;
        } else {
          retries++;
          console.warn(`[UserContext] Context verification attempt ${retries} failed`, { 
            expected: userId, 
            actual: verification.userId 
          });
          
          if (retries < maxRetries) {
            // Wait a bit and try setting context again
            await new Promise(resolve => setTimeout(resolve, 50));
            await this.supabase.rpc('set_current_user_id', { user_id: userId });
          }
        }
      }
      
      console.error('[UserContext] Context verification failed after all retries');
    } catch (error) {
      console.error('[UserContext] Failed to set user context', { userId, error });
      throw new Error(`Failed to set user context: ${error}`);
    }
  }

  /**
   * Clear the current user context
   */
  async clearUserContext(): Promise<void> {
    try {
      await this.supabase.rpc('clear_current_user_id');
      this.currentUserId = null;
      console.log('[UserContext] User context cleared');
    } catch (error) {
      console.error('[UserContext] Failed to clear user context', { error });
    }
  }

  /**
   * Get the currently set user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Execute a database operation with user context automatically set
   * This is a utility method that ensures user context is set before the operation
   */
  async withUserContext<T>(
    userId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    await this.setUserContext(userId);
    try {
      return await operation();
    } finally {
      // Note: We don't clear context here as it may be needed for subsequent operations
      // in the same session. Context will be cleared when the session ends or
      // when explicitly cleared.
    }
  }

  /**
   * Check if user context is currently set
   */
  isContextSet(): boolean {
    return this.currentUserId !== null;
  }

  /**
   * Debug method to check current context state
   */
  async debugContext(): Promise<{
    userId: string | null;
    isSet: boolean;
    database: any;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('get_current_user_id');
      
      if (error) {
        console.error('[UserContext] Debug context error:', error);
        return {
          userId: this.currentUserId,
          isSet: this.isContextSet(),
          database: { error: error.message }
        };
      }

      return {
        userId: this.currentUserId,
        isSet: this.isContextSet(),
        database: data
      };
    } catch (error) {
      console.error('[UserContext] Debug context exception:', error);
      return {
        userId: this.currentUserId,
        isSet: this.isContextSet(),
        database: { exception: error }
      };
    }
  }

  /**
   * Check if the user context is properly synchronized with the database
   */
  async verifyUserContext(expectedUserId: string): Promise<boolean> {
    try {
      const debug = await this.debugContext();
      return debug.database === expectedUserId;
    } catch (error) {
      console.error('[UserContext] Error verifying user context:', error);
      return false;
    }
  }
}
