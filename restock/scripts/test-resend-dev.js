#!/usr/bin/env node

/**
 * Simple Resend development test script
 * Tests your Resend integration before deploying to production
 */

require('dotenv').config();

// Configuration - Update these with your details
const TEST_EMAIL = 'your-email@example.com'; // Replace with your email for testing
const STORE_NAME = 'Your Store Name'; // Replace with your store name

// Get function URL from environment
const FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL?.replace('generate-email', 'send-email');
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!FUNCTION_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('Make sure you have in your .env file:');
  console.log('- EXPO_PUBLIC_SUPABASE_FUNCTION_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
};

async function testConnection() {
  console.log('🔍 Testing Resend API connection...');
  
  try {
    const response = await fetch(`${FUNCTION_URL}/test`, {
      method: 'GET',
      headers
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Connection successful!');
      console.log(`   API Key: ${result.apiKey}`);
      console.log(`   Domain: ${result.domain?.name} (${result.domain?.status})`);
      return true;
    } else {
      console.log('❌ Connection failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function sendTestEmail() {
  console.log('📧 Sending test email...');
  
  try {
    const response = await fetch(`${FUNCTION_URL}/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        testEmail: TEST_EMAIL,
        storeName: STORE_NAME
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   To: ${result.to}`);
      console.log(`   From: ${result.from}`);
      console.log('   📬 Check your inbox!');
      return true;
    } else {
      console.log('❌ Test email failed:', result.error);
      if (result.details) console.log('   Details:', result.details);
      return false;
    }
  } catch (error) {
    console.log('❌ Test email error:', error.message);
    return false;
  }
}

async function testSingleEmailSend() {
  console.log('📮 Testing single email send (production format)...');
  
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: TEST_EMAIL,
        replyTo: TEST_EMAIL,
        subject: 'Test Restock Order',
        body: `Dear Supplier,\n\nWe would like to place a restock order for the following items:\n\n• Product 1 - Quantity: 50\n• Product 2 - Quantity: 25\n• Product 3 - Quantity: 100\n\nPlease confirm availability and provide pricing.\n\nThank you for your continued partnership.\n\nBest regards,\n${STORE_NAME}`,
        storeName: STORE_NAME,
        supplierName: 'Test Supplier',
        sessionId: `test-session-${Date.now()}`
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Production email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   To: ${result.to}`);
      console.log('   📬 Check your inbox for the production-style email!');
      return true;
    } else {
      console.log('❌ Production email failed:', result.error);
      if (result.details) console.log('   Details:', result.details);
      return false;
    }
  } catch (error) {
    console.log('❌ Production email error:', error.message);
    return false;
  }
}

async function testBulkEmailSend() {
  console.log('📦 Testing bulk email send...');
  
  try {
    const response = await fetch(`${FUNCTION_URL}/bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        emails: [
          {
            to: TEST_EMAIL,
            replyTo: TEST_EMAIL,
            subject: 'Bulk Test Email 1 - Supplier A',
            body: 'This is the first bulk test email for Supplier A.',
            storeName: STORE_NAME,
            supplierName: 'Supplier A',
            emailId: 'bulk-test-1'
          },
          {
            to: TEST_EMAIL,
            replyTo: TEST_EMAIL,
            subject: 'Bulk Test Email 2 - Supplier B',
            body: 'This is the second bulk test email for Supplier B.',
            storeName: STORE_NAME,
            supplierName: 'Supplier B',
            emailId: 'bulk-test-2'
          }
        ],
        sessionId: `bulk-test-${Date.now()}`
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Bulk emails sent successfully!');
      console.log(`   Total sent: ${result.totalSent}`);
      console.log(`   Total failed: ${result.totalFailed}`);
      console.log('   📬 Check your inbox for both emails!');
      return true;
    } else {
      console.log('❌ Bulk emails failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Bulk email error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Resend Development Tests');
  console.log('=====================================');
  console.log(`Function URL: ${FUNCTION_URL}`);
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log(`Store Name: ${STORE_NAME}\n`);

  const results = {
    connection: false,
    testEmail: false,
    singleEmail: false,
    bulkEmail: false
  };

  // Test 1: Connection
  results.connection = await testConnection();
  console.log('');

  if (!results.connection) {
    console.log('❌ Cannot continue - connection failed');
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your Resend API key in Supabase Edge Functions');
    console.log('2. Make sure your domain is verified in Resend');
    console.log('3. Deploy the send-email function to Supabase');
    return;
  }

  // Test 2: Test Email
  results.testEmail = await testTestEmail();
  console.log('');

  // Test 3: Single Email (Production Format)
  results.singleEmail = await testSingleEmailSend();
  console.log('');

  // Test 4: Bulk Email
  results.bulkEmail = await testBulkEmailSend();
  console.log('');

  // Summary
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Connection Test: ${results.connection ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Test Email: ${results.testEmail ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Single Email: ${results.singleEmail ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Bulk Email: ${results.bulkEmail ? 'PASS' : 'FAIL'}`);

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Your Resend integration is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Test sending emails from your React Native app');
    console.log('2. Try the "Send All Emails" button in the emails tab');
    console.log('3. Monitor delivery in your Resend dashboard');
  } else {
    console.log('\n🔧 Some tests failed. Please check the errors above.');
  }
}

// Helper function wrapper
async function testTestEmail() {
  return await sendTestEmail();
}

// Run tests
if (require.main === module) {
  // Check if user has updated the configuration
  if (TEST_EMAIL === 'your-email@example.com' || STORE_NAME === 'Your Store Name') {
    console.log('⚠️  Please update the configuration at the top of this script:');
    console.log('   - Change TEST_EMAIL to your email address');
    console.log('   - Change STORE_NAME to your store name');
    console.log('   - Then run the script again');
    process.exit(1);
  }

  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testConnection, sendTestEmail };