/**
 * Test script to verify the RLS user context fix
 * This script tests that sessions can be created with proper user context
 */

import { SessionService, UserContextService } from './backend/services/index.js';

const TEST_USER_ID = 'user_31BTlQ4Ushga5lPZqmgEgBc6kBd'; // The user ID from your error logs

async function testUserContextFix() {
  console.log('🧪 Testing RLS User Context Fix...\n');

  try {
    // Test 1: Check database security setup
    console.log('📋 Test 1: Checking database security setup...');
    const securityTest = await UserContextService.testSecuritySetup();
    
    if (securityTest.issues.length > 0) {
      console.log('❌ Database security setup issues found:');
      securityTest.issues.forEach(issue => console.log(`  - ${issue}`));
      
      if (!securityTest.rpcFunctionExists) {
        console.log('\n🔧 SOLUTION: Run the security setup SQL in your Supabase dashboard:');
        console.log('   File: restock/supabase/simplified-security-setup.sql');
        return false;
      }
    } else {
      console.log('✅ Database security setup looks good');
    }
    
    // Test 2: Check current context state
    console.log('\n📋 Test 2: Checking current database context...');
    const debugContext = await UserContextService.debugContext();
    console.log('Current context:', debugContext);
    
    // Test 3: Set user context explicitly
    console.log('\n📋 Test 3: Setting user context...');
    await UserContextService.setUserContext(TEST_USER_ID);
    const contextAfterSet = await UserContextService.debugContext();
    console.log('Context after setting:', contextAfterSet);
    
    // Test 4: Create a session (this should now work!)
    console.log('\n📋 Test 4: Creating a session with user context...');
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
    
    // Test 5: Retrieve sessions for the user
    console.log('\n📋 Test 5: Retrieving user sessions...');
    const userSessions = await SessionService.getUserSessions(TEST_USER_ID);
    
    if (userSessions.error) {
      console.error('❌ Failed to retrieve sessions:', userSessions.error);
      return false;
    }
    
    console.log(`✅ Retrieved ${userSessions.data.length} sessions for user`);
    
    // Test 6: Clean up the test session
    if (sessionResult.data?.id) {
      console.log('\n📋 Test 6: Cleaning up test session...');
      try {
        await SessionService.deleteSession(sessionResult.data.id, TEST_USER_ID);
        console.log('✅ Test session cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up test session:', cleanupError);
      }
    }
    
    console.log('\n🎉 All tests passed! User context is working correctly.');
    return true;
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    
    if (error.message.includes('Database security setup incomplete')) {
      console.log('\n🔧 IMMEDIATE ACTION REQUIRED:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open the SQL Editor');
      console.log('3. Copy and paste the contents of: restock/supabase/simplified-security-setup.sql');
      console.log('4. Run the SQL script');
      console.log('5. Run this test again');
    }
    
    return false;
  }
}

// Run the test
testUserContextFix()
  .then((success) => {
    if (success) {
      console.log('\n✅ User context fix is working!');
      process.exit(0);
    } else {
      console.log('\n❌ User context fix failed. Check the issues above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Test script crashed:', error);
    process.exit(1);
  });
