#!/usr/bin/env node

/**
 * Test JWT Template Configuration
 * 
 * This script tests if your Clerk JWT template named "convex" is working correctly.
 * Run this after creating the JWT template in your Clerk dashboard.
 */

const { Clerk } = require('@clerk/clerk-sdk-node');

// You'll need to add your Clerk secret key to test this
// Add this to your .env file: CLERK_SECRET_KEY=sk_test_...
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.log('❌ CLERK_SECRET_KEY not found in environment variables');
  console.log('Add CLERK_SECRET_KEY=sk_test_... to your .env file');
  console.log('You can find this in your Clerk Dashboard > API Keys > Secret Key');
  process.exit(1);
}

const clerk = new Clerk({ secretKey: CLERK_SECRET_KEY });

async function testJWTTemplate() {
  try {
    console.log('🔍 Testing JWT template "convex"...');
    
    // Get JWT templates
    const templates = await clerk.jwtTemplates.getJwtTemplateList();
    
    console.log('📋 Available JWT templates:');
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.id})`);
    });
    
    // Check if "convex" template exists
    const convexTemplate = templates.find(t => t.name === 'convex');
    
    if (convexTemplate) {
      console.log('✅ JWT template "convex" found!');
      console.log(`   ID: ${convexTemplate.id}`);
      console.log(`   Name: ${convexTemplate.name}`);
      console.log(`   Created: ${convexTemplate.createdAt}`);
    } else {
      console.log('❌ JWT template "convex" NOT found!');
      console.log('Please create it in your Clerk Dashboard:');
      console.log('1. Go to JWT Templates');
      console.log('2. Click "New template"');
      console.log('3. Name it exactly "convex"');
      console.log('4. Select "Convex" as the template type');
      console.log('5. Save');
    }
    
  } catch (error) {
    console.error('❌ Error testing JWT template:', error.message);
  }
}

testJWTTemplate();
