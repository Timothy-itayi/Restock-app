// Test file to verify email confirmation flow
// Run this with: node test-email-confirmation.js

const { AuthService } = require('../backend/index');

async function testEmailConfirmation() {
  console.log('🧪 Testing Email Confirmation Flow...\n');

  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  // Test 1: Sign up with email confirmation
  console.log('Test 1: Sign up with email confirmation');
  try {
    const signUpResult = await AuthService.signUp(testEmail, testPassword, 'Test Store');
    if (signUpResult.error) {
      console.log('❌ Sign up failed:', signUpResult.error.message);
    } else {
      console.log('✅ Sign up successful - email confirmation sent');
    }
  } catch (error) {
    console.log('❌ Unexpected sign up error:', error.message);
  }

  // Test 2: Try to sign in without confirming email
  console.log('\nTest 2: Try to sign in without confirming email');
  try {
    const signInResult = await AuthService.signIn(testEmail, testPassword);
    if (signInResult.error) {
      console.log('✅ Correctly blocked sign in:', signInResult.error.message);
    } else {
      console.log('❌ Unexpectedly allowed sign in without confirmation');
    }
  } catch (error) {
    console.log('❌ Unexpected sign in error:', error.message);
  }

  // Test 3: Resend confirmation email
  console.log('\nTest 3: Resend confirmation email');
  try {
    const resendResult = await AuthService.resendConfirmation(testEmail);
    if (resendResult.error) {
      console.log('❌ Resend failed:', resendResult.error.message);
    } else {
      console.log('✅ Confirmation email resent successfully');
    }
  } catch (error) {
    console.log('❌ Unexpected resend error:', error.message);
  }

  console.log('\n🎯 Email confirmation test completed!');
  console.log('\n📧 To complete the test:');
  console.log('1. Check your email for confirmation links');
  console.log('2. Click the confirmation link');
  console.log('3. Try signing in again');
}

testEmailConfirmation().catch(console.error); 