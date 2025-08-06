#!/usr/bin/env node

/**
 * Comprehensive test script for email functions
 * Tests all endpoints: setup, testing, sending, and analytics
 */

require('dotenv').config();

const BASE_URL = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL?.replace('generate-email', 'send-email') || 
                 'https://your-project-ref.functions.supabase.co/send-email';

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
  'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Test data
const TEST_EMAIL = 'test@example.com';
const TEST_STORE = 'Test Store';

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: HEADERS,
      ...options
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ ${name} - SUCCESS`);
      if (result.message) console.log(`   📝 ${result.message}`);
      return result;
    } else {
      console.log(`   ❌ ${name} - FAILED (${response.status})`);
      console.log(`   📝 ${result.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ ${name} - ERROR: ${error.message}`);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive email function tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test email: ${TEST_EMAIL}\n`);

  const results = {};

  // 1. Test status endpoint
  results.status = await testEndpoint(
    'Status Check',
    `${BASE_URL}/status`,
    { method: 'GET' }
  );

  // 2. Test setup validation
  results.setupTest = await testEndpoint(
    'Setup Test',
    `${BASE_URL}/setup-test`,
    {
      method: 'POST',
      body: JSON.stringify({
        domain: 'emails.restockapp.email',
        testEmail: TEST_EMAIL
      })
    }
  );

  // 3. Test email sending
  results.testEmail = await testEndpoint(
    'Test Email',
    `${BASE_URL}/test`,
    {
      method: 'POST',
      body: JSON.stringify({
        testEmail: TEST_EMAIL,
        storeName: TEST_STORE
      })
    }
  );

  // 4. Test single email sending
  results.singleEmail = await testEndpoint(
    'Single Email Send',
    BASE_URL,
    {
      method: 'POST',
      body: JSON.stringify({
        to: TEST_EMAIL,
        replyTo: TEST_EMAIL,
        subject: 'Test Single Email',
        body: 'This is a test single email from the API test.',
        storeName: TEST_STORE,
        supplierName: 'Test Supplier'
      })
    }
  );

  // 5. Test bulk email sending
  results.bulkEmail = await testEndpoint(
    'Bulk Email Send',
    `${BASE_URL}/bulk`,
    {
      method: 'POST',
      body: JSON.stringify({
        emails: [
          {
            to: TEST_EMAIL,
            replyTo: TEST_EMAIL,
            subject: 'Bulk Test Email 1',
            body: 'First bulk test email.',
            storeName: TEST_STORE,
            supplierName: 'Supplier 1',
            emailId: 'bulk-test-1'
          },
          {
            to: TEST_EMAIL,
            replyTo: TEST_EMAIL,
            subject: 'Bulk Test Email 2',
            body: 'Second bulk test email.',
            storeName: TEST_STORE,
            supplierName: 'Supplier 2',
            emailId: 'bulk-test-2'
          }
        ],
        sessionId: 'test-session-' + Date.now()
      })
    }
  );

  // 6. Test analytics endpoint (if deployed)
  const analyticsUrl = BASE_URL.replace('send-email', 'email-analytics');
  results.analytics = await testEndpoint(
    'Email Analytics',
    `${analyticsUrl}/summary`,
    { method: 'GET' }
  );

  // Generate test report
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));

  const passed = Object.values(results).filter(r => r !== null).length;
  const total = Object.keys(results).length;

  console.log(`\n✅ Passed: ${passed}/${total} tests`);
  console.log(`❌ Failed: ${total - passed}/${total} tests\n`);

  // Detailed results
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test}`);
  });

  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  
  if (!results.status) {
    console.log('❗ Fix API key configuration in Supabase');
  }
  
  if (!results.setupTest) {
    console.log('❗ Check domain and DNS configuration');
  }
  
  if (results.testEmail) {
    console.log('✅ Check your inbox for test emails');
  }
  
  if (results.status && results.setupTest && results.testEmail) {
    console.log('🎉 Email system is ready for production!');
  }

  console.log('\n🏁 Test completed!');
}

// Helper function to test webhook (if needed)
async function testWebhook() {
  console.log('\n🔗 Testing webhook endpoint...');
  
  const webhookUrl = BASE_URL.replace('send-email', 'resend-webhook');
  const mockWebhookData = {
    type: 'email.delivered',
    data: {
      created_at: new Date().toISOString(),
      data: {
        email_id: 'test-webhook-' + Date.now(),
        from: 'noreply@emails.restockapp.email',
        to: [TEST_EMAIL],
        subject: 'Test Webhook Event'
      }
    }
  };

  await testEndpoint(
    'Webhook Handler',
    webhookUrl,
    {
      method: 'POST',
      body: JSON.stringify(mockWebhookData)
    }
  );
}

// Run tests
if (require.main === module) {
  runAllTests()
    .then(() => {
      // Optionally test webhook
      if (process.argv.includes('--webhook')) {
        return testWebhook();
      }
    })
    .catch(console.error);
}

module.exports = { runAllTests, testWebhook };