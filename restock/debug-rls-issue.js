/**
 * Debug script to investigate the RLS issue
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_USER_ID = 'user_31BVCcHMwHRsLbQWms89QGCWqkb'; // Current user from logs

async function debugRLS() {
  console.log('🔍 Debugging RLS Issue...\n');

  try {
    // Test 1: Check if RPC functions exist
    console.log('📋 Test 1: Checking if set_current_user_id RPC exists...');
    
    try {
      const { data, error } = await supabase.rpc('set_current_user_id', { 
        user_id: TEST_USER_ID 
      });
      
      if (error) {
        console.error('❌ set_current_user_id RPC failed:', error);
        console.log('This means the simplified security setup is NOT applied');
      } else {
        console.log('✅ set_current_user_id RPC works');
      }
    } catch (e) {
      console.error('❌ set_current_user_id RPC exception:', e.message);
    }

    // Test 2: Check current context view
    console.log('\n📋 Test 2: Checking current_user_context view...');
    
    try {
      const { data, error } = await supabase
        .from('current_user_context')
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ current_user_context view failed:', error);
        console.log('This means the simplified security setup is NOT applied');
      } else {
        console.log('✅ current_user_context view result:', data);
      }
    } catch (e) {
      console.error('❌ current_user_context view exception:', e.message);
    }

    // Test 3: Try to create session directly (this should fail with RLS)
    console.log('\n📋 Test 3: Attempting to create session without context...');
    
    try {
      const { data, error } = await supabase
        .from('restock_sessions')
        .insert({
          user_id: TEST_USER_ID,
          status: 'draft',
          name: 'Debug Test Session'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Session creation failed (expected):', error.message);
        if (error.code === '42501') {
          console.log('✅ RLS is active and blocking unauthorized access');
        }
      } else {
        console.log('⚠️ Session created without context (RLS might be disabled):', data.id);
      }
    } catch (e) {
      console.error('❌ Session creation exception:', e.message);
    }

    // Test 4: Try with context set
    console.log('\n📋 Test 4: Setting context and trying again...');
    
    try {
      // Set context first
      await supabase.rpc('set_current_user_id', { user_id: TEST_USER_ID });
      console.log('✅ User context set');
      
      // Now try to create session
      const { data, error } = await supabase
        .from('restock_sessions')
        .insert({
          user_id: TEST_USER_ID,
          status: 'draft',
          name: 'Debug Test Session With Context'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Session creation still failed:', error.message);
      } else {
        console.log('✅ Session created successfully with context:', data.id);
        
        // Clean up
        await supabase
          .from('restock_sessions')
          .delete()
          .eq('id', data.id);
        console.log('✅ Test session cleaned up');
      }
    } catch (e) {
      console.error('❌ Context test exception:', e.message);
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugRLS()
  .then(() => {
    console.log('\n🎯 RLS Debug Complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Debug script error:', error);
    process.exit(1);
  });
