/**
 * Test script to verify the RLS user context fix
 * This script tests that sessions can be created with proper user context
 */

import { SessionService, UserContextService } from './backend/services/index.js';

const TEST_USER_ID = 'user_31BTlQ4Ushga5lPZqmgEgBc6kBd'; // The user ID from your error logs

async function testUserContextFix() {
  console.log('🧪 Testing RLS User Context Fix...\n');

  try {
    // Test 1: Check current context state
    console.log('📋 Test 1: Checking current database context...');
    const debugContext = await UserContextService.debugContext();
    console.log('Current context:', debugContext);
    
    // Test 2: Set user context explicitly
    console.log('\n📋 Test 2: Setting user context...');
    await UserContextService.setUserContext(TEST_USER_ID);
    const contextAfterSet = await UserContextService.debugContext();
    console.log('Context after setting:', contextAfterSet);
    
    // Test 3: Create a session (this should now work!)
    console.log('\n📋 Test 3: Creating a session with user context...');
    const sessionResult = await SessionService.createSession({
      user_id: TEST_USER_ID,
      status: 'draft',
      name: 'Test Session from RLS Fix'
    });
    
    if (sessionResult.error) {
      console.error('❌ Session creation failed:', sessionResult.error);
      return false;
    }
    
    console.log('✅ Session created successfully:', {
      id: sessionResult.data.id,
      user_id: sessionResult.data.user_id,
      status: sessionResult.data.status,
      name: sessionResult.data.name
    });
    
    // Test 4: Retrieve sessions for the user
    console.log('\n📋 Test 4: Retrieving user sessions...');
    const userSessions = await SessionService.getUserSessions(TEST_USER_ID);
    
    if (userSessions.error) {
      console.error('❌ Failed to retrieve sessions:', userSessions.error);
      return false;
    }
    
    console.log(`✅ Retrieved ${userSessions.data.length} sessions for user`);
    
    // Test 5: Clean up the test session
    if (sessionResult.data && sessionResult.data.id) {
      console.log('\n📋 Test 5: Cleaning up test session...');
      const deleteResult = await SessionService.deleteSession(sessionResult.data.id);
      if (deleteResult.error) {
        console.warn('⚠️ Warning: Could not delete test session:', deleteResult.error);
      } else {
        console.log('✅ Test session cleaned up successfully');
      }
    }
    
    console.log('\n🎉 All tests passed! RLS user context fix is working correctly.');
    return true;
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    return false;
  }
}

// Run the test
testUserContextFix()
  .then(success => {
    if (success) {
      console.log('\n✅ RLS fix verification completed successfully!');
      console.log('Your app should now be able to create sessions without RLS policy violations.');
    } else {
      console.log('\n❌ RLS fix verification failed!');
      console.log('There may still be issues with the user context setup.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test script error:', error);
    process.exit(1);
  });
