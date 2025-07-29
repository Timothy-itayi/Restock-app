// Test file to verify authentication without email confirmation
// Run this with: node tests/test-auth-no-confirmation.js

const { AuthService } = require('../backend/index');

async function testAuthNoConfirmation() {
  console.log('🔐 Testing Authentication Without Email Confirmation...\n');

  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  // Test 1: Sign up without email confirmation
  console.log('Test 1: Sign up without email confirmation');
  try {
    const signUpResult = await AuthService.signUp(testEmail, testPassword, 'Test Store');
    if (signUpResult.error) {
      console.log('❌ Sign up failed:', signUpResult.error.message);
    } else {
      console.log('✅ Sign up successful - no email confirmation required');
    }
  } catch (error) {
    console.log('❌ Unexpected sign up error:', error.message);
  }

  // Test 2: Sign in immediately after signup
  console.log('\nTest 2: Sign in immediately after signup');
  try {
    const signInResult = await AuthService.signIn(testEmail, testPassword);
    if (signInResult.error) {
      console.log('❌ Sign in failed:', signInResult.error.message);
    } else {
      console.log('✅ Sign in successful - no email confirmation needed');
      console.log('User session:', signInResult.data.session ? 'Active' : 'None');
    }
  } catch (error) {
    console.log('❌ Unexpected sign in error:', error.message);
  }

  // Test 3: Test with a different email
  console.log('\nTest 3: Test with different email (test2@example.com)');
  try {
    const signUpResult2 = await AuthService.signUp('test2@example.com', 'password123', 'Test Store 2');
    if (signUpResult2.error) {
      console.log('❌ Second sign up failed:', signUpResult2.error.message);
    } else {
      console.log('✅ Second sign up successful');
      
      // Try to sign in immediately
      const signInResult2 = await AuthService.signIn('test2@example.com', 'password123');
      if (signInResult2.error) {
        console.log('❌ Second sign in failed:', signInResult2.error.message);
      } else {
        console.log('✅ Second sign in successful');
      }
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }

  console.log('\n🎯 Authentication without email confirmation test completed!');
  console.log('\n📱 You can now:');
  console.log('1. Sign up with any email');
  console.log('2. Sign in immediately without email confirmation');
  console.log('3. Use the app normally');
}

testAuthNoConfirmation().catch(console.error); 