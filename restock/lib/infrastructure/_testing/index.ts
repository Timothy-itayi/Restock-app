/**
 * TESTING UTILITIES EXPORT
 * 
 * Centralized exports for all testing utilities
 */

export { UserContextTestHelper } from './UserContextTestHelper';

// Re-export common testing patterns
export const TestPatterns = {
  /**
   * Standard test user ID for consistent testing
   */
  TEST_USER_ID: 'user_31BTlQ4Ushga5lPZqmgEgBc6kBd',
  
  /**
   * Quick setup for UX flow testing
   */
  async setupForUXTesting(userId?: string): Promise<{ 
    userContextHelper: typeof UserContextTestHelper;
    testUserId: string;
    applicationService: any;
  }> {
    const testUserId = userId || TestPatterns.TEST_USER_ID;
    
    // Initialize and set user context
    await UserContextTestHelper.initialize();
    const applicationService = await UserContextTestHelper.getApplicationServiceForTest(testUserId);
    
    return {
      userContextHelper: UserContextTestHelper,
      testUserId,
      applicationService
    };
  },
  
  /**
   * Clean teardown after testing
   */
  async teardownAfterTesting(): Promise<void> {
    await UserContextTestHelper.reset();
  }
};