/**
 * Check what RLS policies are currently active
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function checkCurrentPolicies() {
  console.log('🔍 Checking current RLS policies...\n');

  try {
    // Query current policies
    const { data, error } = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename IN ('restock_sessions', 'users', 'products', 'suppliers')
          ORDER BY tablename, policyname;
        `
      });

    if (error) {
      console.error('❌ Could not query policies:', error.message);
      
      // Try alternative approach - check if we can determine the policy type
      console.log('\n🔄 Trying alternative: checking available RPC functions...');
      
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('sql', { 
          query: `
            SELECT routine_name, routine_type 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name LIKE '%user%'
            ORDER BY routine_name;
          `
        });
      
      if (rpcError) {
        console.error('❌ Could not query RPC functions either:', rpcError.message);
        console.log('\nThis suggests we need to apply a security setup via Supabase dashboard');
      } else {
        console.log('✅ Available user-related RPC functions:');
        rpcData?.forEach(func => {
          console.log(`  - ${func.routine_name} (${func.routine_type})`);
        });
      }
    } else {
      console.log('✅ Current RLS policies:');
      if (data && data.length > 0) {
        data.forEach(policy => {
          console.log(`  Table: ${policy.tablename}`);
          console.log(`  Policy: ${policy.policyname}`);
          console.log(`  Command: ${policy.cmd}`);
          console.log(`  Condition: ${policy.qual}`);
          console.log('  ---');
        });
      } else {
        console.log('  No policies found (this is strange!)');
      }
    }

  } catch (error) {
    console.error('💥 Error checking policies:', error);
  }
}

checkCurrentPolicies()
  .then(() => {
    console.log('\n🎯 Policy Check Complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Policy check error:', error);
    process.exit(1);
  });
