#!/usr/bin/env node

/**
 * Setup script for Groq Email Generation
 * This script helps configure the AI email generation feature
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Groq Email Generation for Restock App\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  fs.writeFileSync(envPath, '# Environment variables for Restock App\n\n');
}

// Read existing .env content
let envContent = '';
if (envExists) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check for required environment variables
const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_FUNCTION_URL',
  'GROQ_API_KEY'
];

const missingVars = [];

requiredVars.forEach(varName => {
  if (!envContent.includes(varName)) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('⚠️  Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('');
  
  console.log('📋 Setup Instructions:');
  console.log('');
  console.log('1. Get your Groq API key:');
  console.log('   - Go to: https://console.groq.com/keys');
  console.log('   - Sign up/login to Groq');
  console.log('   - Create a new API key');
  console.log('   - Copy the API key');
  console.log('');
  console.log('2. Add GROQ_API_KEY to Supabase Environment Variables:');
  console.log('   - Go to your Supabase dashboard');
  console.log('   - Navigate to Settings > API');
  console.log('   - Scroll down to "Environment Variables"');
  console.log('   - Add: GROQ_API_KEY = your_groq_api_key_here');
  console.log('   - Click "Save"');
  console.log('');
  console.log('3. Deploy the Supabase Edge Function:');
  console.log('   cd supabase/functions/generate-email');
  console.log('   supabase functions deploy generate-email');
  console.log('');
  console.log('4. Get your Supabase project URL from the dashboard');
  console.log('   https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]');
  console.log('');
  console.log('5. Add the following to your .env file:');
  console.log('   EXPO_PUBLIC_SUPABASE_FUNCTION_URL=https://[YOUR-PROJECT-ID].supabase.co/functions/v1/generate-email');
  console.log('   GROQ_API_KEY=your_groq_api_key_here');
  console.log('');
  console.log('6. Restart your development server after adding the environment variables');
  console.log('');
  console.log('🔧 Alternative: Use Supabase CLI to set environment variable:');
  console.log('   supabase secrets set GROQ_API_KEY=your_groq_api_key_here');
  console.log('');
} else {
  console.log('✅ All required environment variables are configured!');
  console.log('');
  console.log('🎉 Groq Email Generation is ready to use!');
  console.log('');
  console.log('To test the setup:');
  console.log('1. Create a restock session with products');
  console.log('2. Navigate to the Emails tab');
  console.log('3. The AI will generate professional emails for each supplier');
  console.log('');
}

console.log('📚 For more information, see:');
console.log('   - GROQ_EMAIL_IMPLEMENTATION.md');
console.log('   - AI_IMPLEMENTATION_SUMMARY.md');
console.log('');

// Check if Supabase function exists
const functionPath = path.join(__dirname, '..', 'supabase', 'functions', 'generate-email', 'index.ts');
if (fs.existsSync(functionPath)) {
  console.log('✅ Supabase Edge Function found');
} else {
  console.log('❌ Supabase Edge Function not found');
  console.log('   Make sure the function is deployed:');
  console.log('   supabase functions deploy generate-email');
}

console.log('\n🎯 Setup complete!'); 