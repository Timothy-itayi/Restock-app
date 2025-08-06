#!/usr/bin/env node

/**
 * Test script for Resend email integration
 */

const testEmailData = {
  to: "test-supplier@example.com",
  replyTo: "store-owner@example.com", 
  subject: "Test Restock Order",
  body: "Hello,\n\nThis is a test email from our restock system.\n\nBest regards,\nTest Store",
  storeName: "Test Store",
  supplierName: "Test Supplier",
  sessionId: "test-session-123",
  emailId: "test-email-456"
};

const testBulkEmails = [
  {
    to: "supplier1@example.com",
    replyTo: "store-owner@example.com",
    subject: "Restock Order #1",
    body: "Test bulk email 1",
    storeName: "Test Store",
    supplierName: "Supplier 1",
    emailId: "bulk-test-1"
  },
  {
    to: "supplier2@example.com", 
    replyTo: "store-owner@example.com",
    subject: "Restock Order #2",
    body: "Test bulk email 2",
    storeName: "Test Store",
    supplierName: "Supplier 2",
    emailId: "bulk-test-2"
  }
];

async function testSingleEmail() {
  console.log('🧪 Testing single email sending...');
  
  try {
    // Get the Supabase function URL from environment
    const functionUrl = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL?.replace('generate-email', 'send-email');
    
    if (!functionUrl) {
      throw new Error('EXPO_PUBLIC_SUPABASE_FUNCTION_URL not found in environment');
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify(testEmailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Single email test successful:', result);
    return result;

  } catch (error) {
    console.error('❌ Single email test failed:', error.message);
    return null;
  }
}

async function testBulkEmailSending() {
  console.log('🧪 Testing bulk email sending...');
  
  try {
    // Get the Supabase function URL from environment
    const functionUrl = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL?.replace('generate-email', 'send-email/bulk');
    
    if (!functionUrl) {
      throw new Error('EXPO_PUBLIC_SUPABASE_FUNCTION_URL not found in environment');
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        emails: testBulkEmails,
        sessionId: "bulk-test-session-789"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Bulk email test successful:', result);
    return result;

  } catch (error) {
    console.error('❌ Bulk email test failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Resend integration tests...\n');
  
  // Load environment variables
  require('dotenv').config();
  
  // Test single email
  await testSingleEmail();
  console.log('');
  
  // Test bulk emails
  await testBulkEmailSending();
  console.log('');
  
  console.log('🏁 Test completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testSingleEmail,
  testBulkEmailSending
};