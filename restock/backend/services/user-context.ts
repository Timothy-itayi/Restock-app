import { supabase } from '../config/supabase';

/**
 * UserContextService - Centralized service for managing user context in database operations
 * 
 * This service ensures that the current user ID is properly set before database operations
 * to satisfy Row Level Security (RLS) policies.
 */
export class UserContextService {
  private static currentUserId: string | null = null;

  /**
   * Set the current user context for all subsequent database operations
   * This must be called before any database operations that rely on RLS policies
   */
  static async setUserContext(userId: string): Promise<void> {
    try {
      // Set the user context in the database session
      await supabase.rpc('set_current_user_id', { user_id: userId });
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
            await supabase.rpc('set_current_user_id', { user_id: userId });
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
  static async clearUserContext(): Promise<void> {
    try {
      await supabase.rpc('set_current_user_id', { user_id: null });
      this.currentUserId = null;
      console.log('[UserContext] User context cleared');
    } catch (error) {
      console.error('[UserContext] Failed to clear user context', error);
    }
  }

  /**
   * Get the currently set user ID
   */
  static getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Execute a database operation with user context automatically set
   * This is a utility method that ensures user context is set before the operation
   */
  static async withUserContext<T>(
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
  static isContextSet(): boolean {
    return this.currentUserId !== null;
  }

  /**
   * Debug method to check current database context
   */
  static async debugContext(): Promise<{
    role: string;
    userId: string | null;
    timestamp: string;
  }> {
    try {
      // Add a small delay to ensure context propagation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const { data, error } = await supabase
        .from('current_user_context')
        .select('*')
        .single();

      if (error) {
        console.error('[UserContext] Failed to get debug context', error);
        return {
          role: 'unknown',
          userId: null,
          timestamp: new Date().toISOString()
        };
      }

      return {
        role: data.current_role,
        userId: data.current_user_id,
        timestamp: data.checked_at
      };
    } catch (error) {
      console.error('[UserContext] Debug context error', error);
      return {
        role: 'error',
        userId: null,
        timestamp: new Date().toISOString()
      };
    }
  }
}
