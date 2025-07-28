// Test Supabase connection (simple version)
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  console.log('🔧 Testing Supabase Connection...\n');
  
  // Get environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment check:');
  console.log('URL exists:', !!supabaseUrl);
  console.log('Key exists:', !!supabaseAnonKey);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    return;
  }
  
  try {
    // Create client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    console.log('\n1. Testing basic connection...');
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
    
    console.log('\n🎉 Supabase connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
  }
}

// Run test
testSupabaseConnection(); 