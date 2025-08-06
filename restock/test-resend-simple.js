#!/usr/bin/env node

/**
 * Simple test script for your Resend integration
 * Run this after deploying the send-email function
 */

require('dotenv').config();

// Configuration - UPDATE THESE!
const YOUR_EMAIL = 'your-email@example.com'; // Replace with your email for testing
const YOUR_STORE_NAME = 'Your Store Name'; // Replace with your actual store name

// Get configuration from .env
const FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL?.replace('generate-email', 'send-email');
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Resend Integration Test');
console.log('========================');

// Check configuration
if (YOUR_EMAIL === 'your-email@example.com' || YOUR_STORE_NAME === 'Your Store Name') {
  console.log('❌ Please update the configuration at the top of this file:');
  console.log('   - Change YOUR_EMAIL to your actual email');
  console.log('   - Change YOUR_STORE_NAME to your actual store name');
  process.exit(1);
}

if (!FUNCTION_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing environment variables!');
  console.log('Make sure your .env file has:');
  console.log('- EXPO_PUBLIC_SUPABASE_FUNCTION_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log(`📧 Test email: ${YOUR_EMAIL}`);
console.log(`🏪 Store name: ${YOUR_STORE_NAME}`);
console.log(`🔗 Function URL: ${FUNCTION_URL}`);
console.log('');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
};

async function testFunction() {
  console.log('1️⃣ Testing function availability...');
  
  try {
    const response = await fetch(`${FUNCTION_URL}/test`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Function is accessible');
      
      if (result.domain) {
        console.log(`   Domain: ${result.domain.name} (${result.domain.status})`);
      }
      return true;
    } else {
      console.log(`❌ Function not accessible (${response.status})`);
      const error = await response.text();
      console.log(`   Error: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    return false;
  }
}

async function sendTestEmail() {
  console.log('2️⃣ Sending test email...');
  
  try {
    const response = await fetch(`${FUNCTION_URL}/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        testEmail: YOUR_EMAIL,
        storeName: YOUR_STORE_NAME
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log('   📬 Check your inbox!');
      return true;
    } else {
      console.log(`❌ Test email failed (${response.status})`);
      const error = await response.json();
      console.log(`   Error: ${error.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Test email error: ${error.message}`);
    return false;
  }
}

async function sendProductionEmail() {
  console.log('3️⃣ Testing production email format...');
  
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: YOUR_EMAIL,
        replyTo: YOUR_EMAIL,
        subject: `Restock Order - ${YOUR_STORE_NAME}`,
        body: `Dear Supplier,

We would like to place a restock order for the following items:

• Widget A - Quantity: 50 units
• Widget B - Quantity: 25 units  
• Widget C - Quantity: 100 units

Please confirm availability and provide pricing information.

Thank you for your continued partnership.

Best regards,
${YOUR_STORE_NAME} Team`,
        storeName: YOUR_STORE_NAME,
        supplierName: 'Test Supplier',
        sessionId: `test-${Date.now()}`
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Production email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log('   📬 Check your inbox for the production-style email!');
      return true;
    } else {
      console.log(`❌ Production email failed (${response.status})`);
      const error = await response.json();
      console.log(`   Error: ${error.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Production email error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const results = {
    function: false,
    testEmail: false,
    productionEmail: false
  };
  
  results.function = await testFunction();
  console.log('');
  
  if (!results.function) {
    console.log('❌ Function test failed. Check deployment and API key configuration.');
    return;
  }
  
  results.testEmail = await sendTestEmail();
  console.log('');
  
  results.productionEmail = await sendProductionEmail();
  console.log('');
  
  console.log('📊 TEST RESULTS');
  console.log('===============');
  console.log(`Function Access: ${results.function ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test Email: ${results.testEmail ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Production Email: ${results.productionEmail ? '✅ PASS' : '❌ FAIL'}`);
  
  const passed = Object.values(results).filter(r => r).length;
  console.log(`\nOverall: ${passed}/3 tests passed`);
  
  if (passed === 3) {
    console.log('\n🎉 All tests passed! Your Resend integration is working!');
    console.log('\n📱 Now you can test in your React Native app:');
    console.log('1. Create a restock session');
    console.log('2. Generate emails');  
    console.log('3. Use "Send All Emails" button');
  } else {
    console.log('\n🔧 Some tests failed. Common solutions:');
    console.log('- Make sure RESEND_API_KEY is set in Supabase Edge Functions');
    console.log('- Verify your domain is verified in Resend dashboard');
    console.log('- Check the send-email function is deployed');
  }
}

runTests().catch(console.error);