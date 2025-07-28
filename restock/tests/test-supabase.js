// Test Supabase connection
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../backend/config/supabase.ts';

async function testSupabaseConnection() {
  console.log('🔧 Testing Supabase Connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Connection error:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Session:', data.session ? 'Active' : 'None');
    }
    
    // Test auth methods
    console.log('\n2. Testing auth methods...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User check error:', userError.message);
    } else {
      console.log('✅ Auth methods working');
      console.log('User:', userData.user ? 'Logged in' : 'Not logged in');
    }
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
  }
}

// Run test
testSupabaseConnection(); 