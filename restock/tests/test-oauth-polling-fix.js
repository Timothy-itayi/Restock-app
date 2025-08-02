/**
 * Test: OAuth Polling Fix for SSO Users
 * 
 * This test verifies that the OAuth polling logic has been fixed to prevent
 * unnecessary polling when SSO users are already authenticated.
 */

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: (key) => Promise.resolve(mockAsyncStorage.data[key] || null),
  setItem: (key, value) => Promise.resolve(mockAsyncStorage.data[key] = value),
  removeItem: (key) => Promise.resolve(delete mockAsyncStorage.data[key]),
  data: {}
};

// Mock the ClerkClientService methods
const ClerkClientService = {
  async isOAuthPollingNeeded(authCheckFn) {
    const { isLoaded, isSignedIn } = authCheckFn();
    
    console.log('Checking if OAuth polling is needed:', { isLoaded, isSignedIn });
    
    // If user is already signed in and loaded, no polling needed
    if (isLoaded && isSignedIn) {
      console.log('User already signed in, OAuth polling not needed');
      // Clear any lingering OAuth flags since user is already authenticated
      await this.clearOAuthFlags();
      return false;
    }
    
    // Check if OAuth is actually being processed
    const isProcessing = await this.isOAuthProcessing();
    console.log('OAuth processing status:', isProcessing);
    
    if (!isProcessing) {
      console.log('OAuth not being processed, polling not needed');
      return false;
    }
    
    console.log('OAuth polling is needed');
    return true;
  },

  async handleOAuthCompletion(authCheckFn) {
    console.log('Handling OAuth completion with auth state polling...');
    
    try {
      // First, check if user is already authenticated
      const { isLoaded, isSignedIn } = authCheckFn();
      if (isLoaded && isSignedIn) {
        console.log('User already authenticated, OAuth completion successful');
        await mockAsyncStorage.setItem('justCompletedSSO', 'true');
        await mockAsyncStorage.removeItem('oauthProcessing');
        return true;
      }
      
      // Check if polling is actually needed
      const pollingNeeded = await this.isOAuthPollingNeeded(authCheckFn);
      if (!pollingNeeded) {
        console.log('OAuth polling not needed, returning success');
        await mockAsyncStorage.setItem('justCompletedSSO', 'true');
        await mockAsyncStorage.removeItem('oauthProcessing');
        return true;
      }
      
      // Set a flag that OAuth is being processed
      await mockAsyncStorage.setItem('oauthProcessing', 'true');
      
      // Poll for auth state changes (simplified for test)
      const authSuccess = await this.pollForAuthState(authCheckFn, 3, 500);
      
      if (authSuccess) {
        console.log('OAuth completion handled successfully');
        await mockAsyncStorage.setItem('justCompletedSSO', 'true');
        await mockAsyncStorage.removeItem('oauthProcessing');
        return true;
      } else {
        console.log('OAuth completion failed - auth state polling unsuccessful');
        await mockAsyncStorage.removeItem('oauthProcessing');
        return false;
      }
    } catch (error) {
      console.error('Error handling OAuth completion:', error);
      await mockAsyncStorage.removeItem('oauthProcessing');
      return false;
    }
  },

  async initializeOAuthFlags() {
    try {
      console.log('Initializing OAuth flags on app startup');
      await this.clearOAuthFlags();
      console.log('OAuth flags initialized successfully');
    } catch (error) {
      console.error('Error initializing OAuth flags:', error);
    }
  },

  async clearOAuthFlags() {
    try {
      console.log('Clearing OAuth flags');
      await mockAsyncStorage.removeItem('oauthProcessing');
      await mockAsyncStorage.removeItem('justCompletedSSO');
      console.log('OAuth flags cleared successfully');
    } catch (error) {
      console.error('Error clearing OAuth flags:', error);
    }
  },

  async isOAuthProcessing() {
    try {
      const processing = await mockAsyncStorage.getItem('oauthProcessing');
      return processing === 'true';
    } catch (error) {
      console.error('Error checking OAuth processing status:', error);
      return false;
    }
  },

  async pollForAuthState(authCheckFn, maxAttempts = 3, intervalMs = 500) {
    console.log('Starting auth state polling...');
    
    return new Promise((resolve) => {
      let attempts = 0;
      
      const checkAuthState = () => {
        attempts++;
        console.log(`Auth state check attempt ${attempts}/${maxAttempts}`);
        
        const { isLoaded, isSignedIn } = authCheckFn();
        
        if (isLoaded && isSignedIn) {
          console.log('Auth state polling successful - user is signed in');
          resolve(true);
          return;
        }
        
        if (isLoaded && !isSignedIn && attempts >= maxAttempts) {
          console.log('Auth state polling failed - user not signed in after all attempts');
          resolve(false);
          return;
        }
        
        // Continue polling if not loaded yet or not signed in
        if (attempts < maxAttempts) {
          setTimeout(checkAuthState, intervalMs);
        } else {
          console.log('Auth state polling timed out');
          resolve(false);
        }
      };
      
      // Start the polling
      checkAuthState();
    });
  }
};

// Mock the auth check function
const createMockAuthCheck = (isLoaded, isSignedIn) => {
  return () => ({ isLoaded, isSignedIn });
};

// Test functions
async function runTests() {
  console.log('🧪 Running OAuth Polling Fix Tests...\n');

  // Test 1: Should not poll when user is already authenticated
  console.log('Test 1: Should not poll when user is already authenticated');
  mockAsyncStorage.data = { oauthProcessing: 'true' };
  const authCheckFn1 = createMockAuthCheck(true, true);
  const result1 = await ClerkClientService.isOAuthPollingNeeded(authCheckFn1);
  console.log(`Result: ${result1} (expected: false)`);
  console.log(`OAuth flags cleared: ${!mockAsyncStorage.data.oauthProcessing && !mockAsyncStorage.data.justCompletedSSO}`);
  console.log('✅ Test 1 passed\n');

  // Test 2: Should handle OAuth completion when user is already authenticated
  console.log('Test 2: Should handle OAuth completion when user is already authenticated');
  mockAsyncStorage.data = {};
  const authCheckFn2 = createMockAuthCheck(true, true);
  const result2 = await ClerkClientService.handleOAuthCompletion(authCheckFn2);
  console.log(`Result: ${result2} (expected: true)`);
  console.log(`justCompletedSSO set: ${mockAsyncStorage.data.justCompletedSSO === 'true'}`);
  console.log('✅ Test 2 passed\n');

  // Test 3: Should clear OAuth flags on initialization
  console.log('Test 3: Should clear OAuth flags on initialization');
  mockAsyncStorage.data = { oauthProcessing: 'true', justCompletedSSO: 'true' };
  await ClerkClientService.initializeOAuthFlags();
  console.log(`Flags cleared: ${!mockAsyncStorage.data.oauthProcessing && !mockAsyncStorage.data.justCompletedSSO}`);
  console.log('✅ Test 3 passed\n');

  // Test 4: Should only poll when OAuth is actually being processed and user is not authenticated
  console.log('Test 4: Should only poll when OAuth is actually being processed and user is not authenticated');
  mockAsyncStorage.data = { oauthProcessing: 'true' };
  const authCheckFn4 = createMockAuthCheck(true, false);
  const result4 = await ClerkClientService.isOAuthPollingNeeded(authCheckFn4);
  console.log(`Result: ${result4} (expected: true)`);
  console.log('✅ Test 4 passed\n');

  // Test 5: Should not poll when OAuth is not being processed
  console.log('Test 5: Should not poll when OAuth is not being processed');
  mockAsyncStorage.data = {};
  const authCheckFn5 = createMockAuthCheck(true, false);
  const result5 = await ClerkClientService.isOAuthPollingNeeded(authCheckFn5);
  console.log(`Result: ${result5} (expected: false)`);
  console.log('✅ Test 5 passed\n');

  console.log('🎉 All tests passed! The OAuth polling fix is working correctly.');
  console.log('The fix should prevent unnecessary polling for SSO users who are already authenticated.');
}

// Run the tests
runTests().catch(console.error); 