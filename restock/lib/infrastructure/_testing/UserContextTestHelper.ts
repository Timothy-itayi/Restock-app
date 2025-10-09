/**
 * USER CONTEXT TEST HELPER
 * 
 * Provides utilities for testing UX flows that require user context
 * Bridges the gap between testing environment and production DI container
 */

import { DIContainer } from '../_di/Container';
import { registerServices, initializeServices } from '../_di/ServiceRegistry';
import type { UserContextService } from '../_services/ClerkAuthService';
import type { RestockApplicationService } from '../../lib/application/interfaces/RestockApplicationService';

export class UserContextTestHelper {
  private static isInitialized = false;
  private static userContextService: UserContextService;
  private static applicationService: RestockApplicationService;

  /**
   * Initialize services for testing (call this before any tests)
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[UserContextTestHelper] Initializing services for testing...');
      
      // Register all services
      registerServices();
      
      // Initialize async services
      await initializeServices();
      
      // Get service references
      const container = DIContainer.getInstance();
      this.userContextService = container.get<UserContextService>('UserContextService');
      this.applicationService = container.get<RestockApplicationService>('RestockApplicationService');
      
      this.isInitialized = true;
      console.log('[UserContextTestHelper] ✅ Services initialized for testing');
      
    } catch (error) {
      console.error('[UserContextTestHelper] ❌ Failed to initialize services:', error);
      throw new Error(`Test initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set user context for testing (ensures services are initialized)
   */
  static async setUserContextForTest(userId: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      console.log('[UserContextTestHelper] Setting user context for test:', userId);
      await this.userContextService.setUserContext(userId);
      console.log('[UserContextTestHelper] ✅ User context set successfully');
    } catch (error) {
      console.error('[UserContextTestHelper] ❌ Failed to set user context:', error);
      throw error;
    }
  }

  /**
   * Get the application service with user context pre-configured
   */
  static async getApplicationServiceForTest(userId: string): Promise<RestockApplicationService> {
    await this.setUserContextForTest(userId);
    return this.applicationService;
  }

  /**
   * Clear user context (useful between tests)
   */
  static async clearUserContext(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await this.userContextService.clearUserContext();
      console.log('[UserContextTestHelper] User context cleared');
    } catch (error) {
      console.warn('[UserContextTestHelper] Failed to clear user context:', error);
      // Don't throw - clearing is not critical
    }
  }

  /**
   * Check if user context is properly set
   */
  static async verifyUserContext(expectedUserId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      const currentUserId = this.userContextService.getCurrentUserId();
      return currentUserId === expectedUserId;
    } catch (error) {
      console.error('[UserContextTestHelper] Failed to verify user context:', error);
      return false;
    }
  }

  /**
   * Test database connectivity and setup
   */
  static async testDatabaseSetup(): Promise<{
    isHealthy: boolean;
    issues: string[];
    details?: any;
  }> {
    await this.ensureInitialized();
    
    try {
      const setupTest = await this.userContextService.testSecuritySetup();
      const debugInfo = await this.userContextService.debugContext();
      
      return {
        isHealthy: setupTest.issues.length === 0,
        issues: setupTest.issues,
        details: {
          rpcFunctionExists: setupTest.rpcFunctionExists,
          contextViewExists: setupTest.contextViewExists,
          currentContext: debugInfo
        }
      };
    } catch (error) {
      return {
        isHealthy: false,
        issues: [`Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        details: { error }
      };
    }
  }

  /**
   * Perform a complete UX flow test simulation
   */
  static async simulateUserFlow(userId: string, flowName: string): Promise<{
    success: boolean;
    steps: Array<{ step: string; success: boolean; error?: string; duration?: number }>;
  }> {
    const steps: Array<{ step: string; success: boolean; error?: string; duration?: number }> = [];
    
    const addStep = (step: string, success: boolean, error?: string, startTime?: number) => {
      const duration = startTime ? Date.now() - startTime : undefined;
      steps.push({ step, success, error, duration });
    };

    try {
      console.log(`[UserContextTestHelper] Simulating user flow: ${flowName} for user: ${userId}`);
      
      // Step 1: Initialize services
      let startTime = Date.now();
      await this.initialize();
      addStep('Initialize services', true, undefined, startTime);
      
      // Step 2: Set user context
      startTime = Date.now();
      await this.setUserContextForTest(userId);
      addStep('Set user context', true, undefined, startTime);
      
      // Step 3: Verify context
      startTime = Date.now();
      const contextValid = await this.verifyUserContext(userId);
      addStep('Verify user context', contextValid, contextValid ? undefined : 'Context verification failed', startTime);
      
      // Step 4: Test application service access
      startTime = Date.now();
      const appService = await this.getApplicationServiceForTest(userId);
      const hasService = !!appService;
      addStep('Get application service', hasService, hasService ? undefined : 'Failed to get application service', startTime);
      
      const allStepsSucceeded = steps.every(step => step.success);
      
      console.log(`[UserContextTestHelper] Flow simulation ${allStepsSucceeded ? '✅ PASSED' : '❌ FAILED'}: ${flowName}`);
      
      return {
        success: allStepsSucceeded,
        steps
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addStep('Flow execution', false, errorMessage);
      
      console.error(`[UserContextTestHelper] ❌ Flow simulation failed: ${flowName}`, error);
      
      return {
        success: false,
        steps
      };
    }
  }

  /**
   * Reset all state (useful for clean test environment)
   */
  static async reset(): Promise<void> {
    try {
      await this.clearUserContext();
      
      // Reset initialization flag to force re-initialization
      this.isInitialized = false;
      
      console.log('[UserContextTestHelper] Test environment reset');
    } catch (error) {
      console.warn('[UserContextTestHelper] Failed to reset test environment:', error);
    }
  }

  /**
   * Ensure services are initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get service health status
   */
  static getServiceHealth(): {
    isInitialized: boolean;
    hasUserContext: boolean;
    currentUserId: string | null;
  } {
    return {
      isInitialized: this.isInitialized,
      hasUserContext: this.isInitialized && this.userContextService?.isContextSet() || false,
      currentUserId: this.isInitialized ? this.userContextService?.getCurrentUserId() || null : null
    };
  }
}