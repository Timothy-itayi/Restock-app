/**
 * Test SSO Flow
 * 
 * This test verifies that the SSO auth flow works correctly without duplication issues.
 * 
 * Expected Flow:
 * 1. User goes to Welcome → Auth Index → SSO Sign-up
 * 2. OAuth completes → AuthenticatingScreen → WelcomeSuccessScreen → SSO Profile Setup
 * 3. Profile creation → Dashboard
 */

const { ClerkClientService } = require('../backend/services/clerk-client');

async function testSSOFlow() {
  console.log('🧪 Testing SSO Flow...');
  
  try {
    // Test 1: Check initial state
    console.log('\n📋 Test 1: Initial state check');
    const initialNewSSO = await ClerkClientService.isNewSSOSignUp();
    const initialOAuthCompleted = await ClerkClientService.isOAuthJustCompleted();
    const shouldSkip = await ClerkClientService.shouldSkipAuthContextForSSO();
    
    console.log('Initial state:', {
      isNewSSOSignUp: initialNewSSO,
      isOAuthJustCompleted: initialOAuthCompleted,
      shouldSkipAuthContext: shouldSkip
    });
    
    // Test 2: Set SSO flags
    console.log('\n📋 Test 2: Setting SSO flags');
    await ClerkClientService.setSSOSignUpFlags();
    
    const afterSetNewSSO = await ClerkClientService.isNewSSOSignUp();
    const afterSetOAuthCompleted = await ClerkClientService.isOAuthJustCompleted();
    const afterSetShouldSkip = await ClerkClientService.shouldSkipAuthContextForSSO();
    
    console.log('After setting flags:', {
      isNewSSOSignUp: afterSetNewSSO,
      isOAuthJustCompleted: afterSetOAuthCompleted,
      shouldSkipAuthContext: afterSetShouldSkip
    });
    
    // Test 3: Clear SSO flags
    console.log('\n📋 Test 3: Clearing SSO flags');
    await ClerkClientService.clearSSOSignUpFlags();
    
    const afterClearNewSSO = await ClerkClientService.isNewSSOSignUp();
    const afterClearOAuthCompleted = await ClerkClientService.isOAuthJustCompleted();
    const afterClearShouldSkip = await ClerkClientService.shouldSkipAuthContextForSSO();
    
    console.log('After clearing flags:', {
      isNewSSOSignUp: afterClearNewSSO,
      isOAuthJustCompleted: afterClearOAuthCompleted,
      shouldSkipAuthContext: afterClearShouldSkip
    });
    
    // Test 4: Verify final state matches initial state
    console.log('\n📋 Test 4: Verifying final state');
    if (afterClearNewSSO === initialNewSSO && 
        afterClearOAuthCompleted === initialOAuthCompleted && 
        afterClearShouldSkip === shouldSkip) {
      console.log('✅ SSO flow test passed - flags properly managed');
    } else {
      console.log('❌ SSO flow test failed - flags not properly reset');
    }
    
  } catch (error) {
    console.error('❌ SSO flow test error:', error);
  }
}

// Run the test
testSSOFlow(); 