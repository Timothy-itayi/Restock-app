/**
 * INFRASTRUCTURE SERVICE: UserContextService
 * 
 * Refactored version of the backend UserContextService for the infrastructure layer
 * Manages Row Level Security (RLS) context for database operations
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class UserContextService {
  private currentUserId: string | null = null;
  private contextVerificationEnabled: boolean = true;

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Set the current user context for all subsequent database operations
   * This must be called before any database operations that rely on RLS policies
   */
  async setUserContext(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to set user context');
    }

    try {
      console.log('[UserContext] Setting user context for:', userId);
      
      // Set the user context in the database session
      const { error: rpcError } = await this.supabase.rpc('set_current_user_id', { user_id: userId });
      
      if (rpcError) {
        console.error('[UserContext] RPC function failed:', rpcError);
        
        // Check if the RPC function exists
        if (rpcError.code === '42883') { // Function does not exist
          throw new Error('Database security setup incomplete. Please run the security setup SQL in Supabase.');
        }
        
        throw new Error(`Failed to set user context: ${rpcError.message}`);
      }

      this.currentUserId = userId;
      console.log('[UserContext] User context set successfully');
      
      // Only verify context if verification is enabled
      if (this.contextVerificationEnabled) {
        const verificationResult = await this.verifyContext(userId);
        if (!verificationResult.success) {
          console.warn('[UserContext] Context verification failed, but continuing:', verificationResult.reason);
        }
      }
      
    } catch (error) {
      console.error('[UserContext] Failed to set user context', { userId, error });
      
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Database security setup incomplete')) {
          throw error; // Re-throw specific error
        }
        if (error.message.includes('permission denied')) {
          throw new Error('Insufficient database permissions. Please check your Supabase configuration.');
        }
      }
      
      throw new Error(`Failed to set user context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify that the user context was set correctly
   */
  private async verifyContext(expectedUserId: string): Promise<{
    success: boolean;
    reason?: string;
    details?: any;
  }> {
    try {
      // Try to query the current_user_context view
      const { data, error } = await this.supabase
        .from('current_user_context')
        .select('*')
        .single();

      if (error) {
        // If the view doesn't exist, that's okay - just log it
        if (error.code === '42P01') { // Undefined table
          console.log('[UserContext] current_user_context view not found - skipping verification');
          return { success: true, reason: 'View not available' };
        }
        
        return { 
          success: false, 
          reason: `Failed to query context view: ${error.message}`,
          details: error
        };
      }

      if (data?.current_user_id === expectedUserId) {
        return { success: true };
      } else {
        return { 
          success: false, 
          reason: `Context mismatch: expected ${expectedUserId}, got ${data?.current_user_id}`,
          details: data
        };
      }
      
    } catch (error) {
      return { 
        success: false, 
        reason: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  }

  /**
   * Clear the current user context
   */
  async clearUserContext(): Promise<void> {
    try {
      if (this.currentUserId) {
        const { error } = await this.supabase.rpc('set_current_user_id', { user_id: null });
        if (error) {
          console.warn('[UserContext] Failed to clear user context via RPC:', error);
        }
      }
      
      this.currentUserId = null;
      console.log('[UserContext] User context cleared');
    } catch (error) {
      console.error('[UserContext] Failed to clear user context', error);
      // Don't throw here - clearing context is not critical
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
    } catch (error) {
      console.error('[UserContext] Operation failed with user context:', error);
      throw error;
    }
  }

  /**
   * Check if user context is currently set
   */
  isContextSet(): boolean {
    return this.currentUserId !== null;
  }

  /**
   * Enable or disable context verification (useful for testing or when verification fails)
   */
  setContextVerification(enabled: boolean): void {
    this.contextVerificationEnabled = enabled;
    console.log('[UserContext] Context verification:', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Debug method to check current database context
   */
  async debugContext(): Promise<{
    role: string;
    userId: string | null;
    timestamp: string;
    status: 'success' | 'error' | 'unavailable';
    error?: string;
  }> {
    try {
      // Add a small delay to ensure context propagation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const { data, error } = await this.supabase
        .from('current_user_context')
        .select('*')
        .single();

      if (error) {
        if (error.code === '42P01') { // Undefined table
          return {
            role: 'unknown',
            userId: null,
            timestamp: new Date().toISOString(),
            status: 'unavailable',
            error: 'current_user_context view not found'
          };
        }
        
        return {
          role: 'unknown',
          userId: null,
          timestamp: new Date().toISOString(),
          status: 'error',
          error: error.message
        };
      }

      return {
        role: data.current_role || 'unknown',
        userId: data.current_user_id,
        timestamp: data.checked_at || new Date().toISOString(),
        status: 'success'
      };
    } catch (error) {
      return {
        role: 'error',
        userId: null,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test if the database security setup is working
   */
  async testSecuritySetup(): Promise<{
    rpcFunctionExists: boolean;
    contextViewExists: boolean;
    canSetContext: boolean;
    canQueryContext: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let rpcFunctionExists = false;
    let contextViewExists = false;
    let canSetContext = false;
    let canQueryContext = false;

    try {
      // Test 1: Check if RPC function exists
      const { error: rpcError } = await this.supabase.rpc('set_current_user_id', { user_id: 'test' });
      if (rpcError && rpcError.code === '42883') {
        issues.push('set_current_user_id RPC function does not exist');
      } else {
        rpcFunctionExists = true;
        canSetContext = true;
      }
    } catch (error) {
      issues.push(`RPC function test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Test 2: Check if context view exists
      const { error: viewError } = await this.supabase
        .from('current_user_context')
        .select('*')
        .limit(1);
      
      if (viewError && viewError.code === '42P01') {
        issues.push('current_user_context view does not exist');
      } else {
        contextViewExists = true;
        canQueryContext = true;
      }
    } catch (error) {
      issues.push(`Context view test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      rpcFunctionExists,
      contextViewExists,
      canSetContext,
      canQueryContext,
      issues
    };
  }
}
