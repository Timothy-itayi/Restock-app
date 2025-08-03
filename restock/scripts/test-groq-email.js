#!/usr/bin/env node

/**
 * Test script for Groq Email Generation
 * This script tests the Supabase Edge Function for email generation
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.log('No .env file found, using defaults');
  }
}

async function testGroqEmail() {
  console.log('🤖 Testing Groq Email Generation with Gemma2-9b-it...\n');

  // Load environment variables
  loadEnv();

  // Get function URL from environment or use default
  const functionUrl = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL || 
                     'https://dxnjzeefmqwhfmpknbjh.functions.supabase.co/generate-email';

  console.log(`📡 Function URL: ${functionUrl}\n`);

  // Test payload
  const testPayload = {
    supplier: "Fresh Farms Co.",
    email: "orders@freshfarms.com",
    products: [
      { name: "Organic Bananas", quantity: 4 },
      { name: "Organic Eggs", quantity: 6 },
      { name: "Greek Yogurt", quantity: 3 }
    ],
    user: "Tim from Restock",
    storeName: "Greenfields Grocery",
    urgency: "normal",
    tone: "professional"
  };

  console.log('📝 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n🔄 Sending request to Edge Function...');

  try {
    // For testing, we'll use a simple approach without authentication
    // In production, you'd include the Supabase anon key
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Supabase anon key if available
        ...(process.env.SUPABASE_ANON_KEY && {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        })
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`📊 Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      if (response.status === 401) {
        console.log('\n💡 Authentication required. You need to:');
        console.log('1. Get your Supabase anon key from the dashboard');
        console.log('2. Add SUPABASE_ANON_KEY to your .env file');
        console.log('3. Or configure the function for anonymous access');
      }
      return;
    }

    const data = await response.json();
    
    console.log('\n✅ Generated Email:');
    console.log('\n🤖 Model:', data.model || 'gemma2-9b-it');
    console.log('\n📧 Subject:', data.subject);
    console.log('\n📄 Body:');
    console.log(data.body || data.emailText);
    console.log('\n📊 Confidence:', data.confidence);
    console.log('⏱️  Generation time:', data.generationTime ? `${Date.now() - data.generationTime}ms` : 'N/A');

    console.log('\n🎉 Groq email generation test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Groq email generation:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. The Supabase Edge Function is deployed');
    console.log('2. Your Groq API key is set correctly');
    console.log('3. The function URL is correct');
  }
}

// Run the test
testGroqEmail(); 