// Simple test script for authentication
// Run with: node test-auth.js

import dotenv from 'dotenv';
dotenv.config();

import { AuthService, isAuthenticated, getCurrentUserId } from '../backend/index.js';

async function testAuthentication() {
  console.log('🔐 Testing Authentication...\n');
  
  try {
    // Test 1: Check if user is authenticated
    console.log('1. Checking authentication status...');
    const authenticated = await isAuthenticated();
    console.log('✅ Authentication check:', authenticated ? 'User is authenticated' : 'User is not authenticated');
    
    if (authenticated) {
      // Test 2: Get current user
      console.log('\n2. Getting current user...');
      const userId = await getCurrentUserId();
      console.log('✅ Current user ID:', userId);
      
      // Test 3: Get user profile
      console.log('\n3. Getting user profile...');
      const { data: user, error } = await AuthService.getUserProfile(userId);
      if (error) {
        console.log('❌ Error getting user profile:', error.message);
      } else {
        console.log('✅ User profile:', {
          email: user.email,
          store_name: user.store_name,
          created_at: user.created_at
        });
      }
    } else {
      console.log('\n💡 User is not authenticated. Please sign in through the app first.');
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Run test
testAuthentication(); 