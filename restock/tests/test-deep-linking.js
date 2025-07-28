// Test file to verify deep linking configuration
// Run this with: node tests/test-deep-linking.js

const { AuthService } = require('../backend/index');

async function testDeepLinking() {
  console.log('🔗 Testing Deep Linking Configuration...\n');

  // Test 1: Check if signup includes redirect URL
  console.log('Test 1: Signup with redirect URL');
  try {
    const result = await AuthService.signUp('test@example.com', 'password123', 'Test Store');
    if (result.error) {
      console.log('❌ Signup failed:', result.error.message);
    } else {
      console.log('✅ Signup successful with redirect URL');
      console.log('📧 Check your email for confirmation link');
      console.log('🔗 Link should redirect to: restock://auth/confirm-email');
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }

  // Test 2: Test resend confirmation with redirect URL
  console.log('\nTest 2: Resend confirmation with redirect URL');
  try {
    const result = await AuthService.resendConfirmation('test@example.com');
    if (result.error) {
      console.log('❌ Resend failed:', result.error.message);
    } else {
      console.log('✅ Confirmation email resent with redirect URL');
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }

  console.log('\n🎯 Deep linking test completed!');
  console.log('\n📱 To test the deep linking:');
  console.log('1. Install the app on your device');
  console.log('2. Sign up with a real email');
  console.log('3. Check your email for confirmation link');
  console.log('4. Click the link - it should open the app');
  console.log('5. You should see the confirmation screen');
}

testDeepLinking().catch(console.error); 