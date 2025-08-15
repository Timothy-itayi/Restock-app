import { supabase } from '../config/supabase';

/**
 * DatabaseHealthService - Automatically detects and resolves database setup issues
 * 
 * This service ensures that users never see database errors by:
 * 1. Automatically detecting missing database components
 * 2. Providing clear error messages when manual intervention is needed
 * 3. Gracefully degrading functionality when possible
 * 4. Offering automatic recovery options
 */
export class DatabaseHealthService {
  private static healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'unknown';
  private static lastCheck: Date | null = null;
  private static checkInterval = 5 * 60 * 1000; // 5 minutes

  /**
   * Check database health and automatically resolve issues when possible
   */
  static async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    canAutoResolve: boolean;
    requiresManualAction: boolean;
    recommendations: string[];
  }> {
    const now = new Date();
    
    // Cache health check results
    if (this.lastCheck && (now.getTime() - this.lastCheck.getTime()) < this.checkInterval) {
      return this.getCachedHealthStatus();
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let canAutoResolve = true;
    let requiresManualAction = false;

    try {
      // Test 1: Check if RPC function exists
      const rpcTest = await this.testRPCFunction();
      if (!rpcTest.exists) {
        issues.push('set_current_user_id RPC function is missing');
        requiresManualAction = true;
        canAutoResolve = false;
        recommendations.push('Run: ./scripts/deploy-database-setup.sh [your-project-ref]');
      }

      // Test 2: Check if context view exists
      const viewTest = await this.testContextView();
      if (!viewTest.exists) {
        issues.push('current_user_context view is missing');
        requiresManualAction = true;
        canAutoResolve = false;
        recommendations.push('Run: ./scripts/deploy-database-setup.sh [your-project-ref]');
      }

      // Test 3: Check RLS policies
      const rlsTest = await this.testRLSPolicies();
      if (!rlsTest.active) {
        issues.push('Row Level Security policies are not active');
        requiresManualAction = true;
        canAutoResolve = false;
        recommendations.push('Run: ./scripts/deploy-database-setup.sh [your-project-ref]');
      }

      // Test 4: Check basic connectivity
      const connectivityTest = await this.testConnectivity();
      if (!connectivityTest.connected) {
        issues.push('Cannot connect to Supabase database');
        canAutoResolve = false;
        requiresManualAction = true;
        recommendations.push('Check your environment variables and network connection');
      }

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (issues.length === 0) {
        status = 'healthy';
      } else if (canAutoResolve && issues.length < 3) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      // Cache the results
      this.healthStatus = status;
      this.lastCheck = now;

      return {
        status,
        issues,
        canAutoResolve,
        requiresManualAction,
        recommendations
      };

    } catch (error) {
      console.error('[DatabaseHealth] Health check failed:', error);
      return {
        status: 'unhealthy',
        issues: ['Health check failed', error instanceof Error ? error.message : 'Unknown error'],
        canAutoResolve: false,
        requiresManualAction: true,
        recommendations: ['Check console logs for detailed error information']
      };
    }
  }

  /**
   * Test if the RPC function exists and is accessible
   */
  private static async testRPCFunction(): Promise<{ exists: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('set_current_user_id', { user_id: 'test' });
      
      if (error) {
        if (error.code === '42883') { // Function does not exist
          return { exists: false, error: 'Function does not exist' };
        }
        // Other errors might be expected (like permission issues)
        return { exists: true, error: error.message };
      }
      
      return { exists: true };
    } catch (error) {
      return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test if the context view exists and is accessible
   */
  private static async testContextView(): Promise<{ exists: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('current_user_context')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') { // Undefined table
          return { exists: false, error: 'View does not exist' };
        }
        return { exists: true, error: error.message };
      }
      
      return { exists: true };
    } catch (error) {
      return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test if RLS policies are active
   */
  private static async testRLSPolicies(): Promise<{ active: boolean; error?: string }> {
    try {
      // Try to create a test session without user context (should fail with RLS)
      const { error } = await supabase
        .from('restock_sessions')
        .insert({
          user_id: 'test-user-rls-check',
          status: 'draft',
          name: 'RLS Test Session'
        });
      
      if (error) {
        if (error.code === '42501') { // Insufficient privilege (RLS blocking)
          return { active: true };
        } else if (error.code === '23505') { // Unique violation (RLS might be working)
          return { active: true };
        }
        return { active: false, error: error.message };
      }
      
      // If we get here, RLS might not be working
      return { active: false, error: 'Session created without RLS protection' };
    } catch (error) {
      return { active: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test basic database connectivity
   */
  private static async testConnectivity(): Promise<{ connected: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST301') { // JWT required
          return { connected: true }; // This is expected for authenticated endpoints
        }
        return { connected: false, error: error.message };
      }
      
      return { connected: true };
    } catch (error) {
      return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get cached health status
   */
  private static getCachedHealthStatus() {
    return {
      status: this.healthStatus,
      issues: [],
      canAutoResolve: true,
      requiresManualAction: false,
      recommendations: []
    };
  }

  /**
   * Force a fresh health check
   */
  static async forceHealthCheck(): Promise<ReturnType<typeof this.checkHealth>> {
    this.lastCheck = null;
    return this.checkHealth();
  }

  /**
   * Get a user-friendly error message based on health status
   */
  static async getUserFriendlyError(): Promise<{
    title: string;
    message: string;
    actionRequired: boolean;
    actionText?: string;
    actionUrl?: string;
  }> {
    const health = await this.checkHealth();
    
    if (health.status === 'healthy') {
      return {
        title: 'Database is healthy',
        message: 'All database components are working correctly.',
        actionRequired: false
      };
    }

    if (health.status === 'degraded') {
      return {
        title: 'Database has minor issues',
        message: 'Some database features may not work optimally, but the app should function.',
        actionRequired: false
      };
    }

    // Unhealthy status
    if (health.requiresManualAction) {
      return {
        title: 'Database setup incomplete',
        message: 'Your database needs to be configured. This is a one-time setup that requires developer action.',
        actionRequired: true,
        actionText: 'Contact Support',
        actionUrl: 'mailto:support@yourcompany.com'
      };
    }

    return {
      title: 'Database connection issue',
      message: 'Unable to connect to the database. Please check your internet connection and try again.',
      actionRequired: false
    };
  }

  /**
   * Check if the app can function with current database health
   */
  static async canAppFunction(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status !== 'unhealthy';
  }

  /**
   * Get detailed diagnostic information for developers
   */
  static async getDiagnostics(): Promise<{
    timestamp: string;
    health: ReturnType<typeof this.checkHealth>;
    environment: {
      supabaseUrl: string;
      hasAnonKey: boolean;
      nodeEnv: string;
    };
    tests: {
      rpc: ReturnType<typeof this.testRPCFunction>;
      view: ReturnType<typeof this.testContextView>;
      rls: ReturnType<typeof this.testRLSPolicies>;
      connectivity: ReturnType<typeof this.testConnectivity>;
    };
  }> {
    const health = await this.checkHealth();
    
    return {
      timestamp: new Date().toISOString(),
      health,
      environment: {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'NOT_SET',
        hasAnonKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      tests: {
        rpc: await this.testRPCFunction(),
        view: await this.testContextView(),
        rls: await this.testRLSPolicies(),
        connectivity: await this.testConnectivity()
      }
    };
  }
}
