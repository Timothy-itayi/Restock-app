#!/usr/bin/env node

/**
 * Test script for EmailService integration 
 */

// Mock fetch for testing EmailService without actual HTTP calls
global.fetch = async (url, options) => {
  console.log('🌐 Mock HTTP Request:', {
    url,
    method: options.method,
    headers: options.headers,
    body: options.body ? JSON.parse(options.body) : null
  });

  // Simulate successful response
  return {
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      messageId: 'mock-message-id-' + Date.now(),
      to: 'test@example.com',
      results: [
        { emailId: 'test-1', success: true, messageId: 'mock-msg-1' },
        { emailId: 'test-2', success: true, messageId: 'mock-msg-2' }
      ],
      totalSent: 2,
      totalFailed: 0
    }),
    text: async () => 'Mock response'
  };
};

// Load environment variables
require('dotenv').config();

async function testEmailServiceIntegration() {
  console.log('🧪 Testing EmailService integration...\n');

  try {
    // Import EmailService after setting up mock
    const { EmailService } = require('../backend/services/emails');

    console.log('1. Testing single email...');
    const singleEmailResult = await EmailService.sendEmail({
      to: 'supplier@example.com',
      replyTo: 'store@example.com',
      subject: 'Test Restock Order',
      body: 'This is a test email',
      storeName: 'Test Store',
      supplierName: 'Test Supplier',
      sessionId: 'test-session',
      emailId: 'test-email-1'
    });

    console.log('✅ Single email result:', singleEmailResult);
    console.log('');

    console.log('2. Testing bulk emails...');
    const bulkEmailsResult = await EmailService.sendBulkEmails([
      {
        to: 'supplier1@example.com',
        replyTo: 'store@example.com',
        subject: 'Bulk Test 1',
        body: 'First bulk email',
        storeName: 'Test Store',
        supplierName: 'Supplier 1',
        emailId: 'bulk-1'
      },
      {
        to: 'supplier2@example.com',
        replyTo: 'store@example.com',
        subject: 'Bulk Test 2',
        body: 'Second bulk email',
        storeName: 'Test Store',
        supplierName: 'Supplier 2',
        emailId: 'bulk-2'
      }
    ], 'bulk-test-session');

    console.log('✅ Bulk emails result:', bulkEmailsResult);
    console.log('');

    console.log('🎉 All EmailService tests completed successfully!');

  } catch (error) {
    console.error('❌ EmailService test failed:', error.message);
    console.error(error.stack);
  }
}

async function main() {
  console.log('🚀 Starting EmailService integration tests...\n');
  await testEmailServiceIntegration();
  console.log('🏁 Tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEmailServiceIntegration };