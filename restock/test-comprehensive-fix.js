/**
 * Comprehensive test for both SSO and Traditional Auth RLS fixes
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// Test users from your logs
const SSO_USER = 'user_31BXYvx4B3BYKNEjEzHq5lg01eW'; // Google SSO user
const TRAD_USER = 'user_31BXusjxaqdcBbMMlJcKE3tNoB9'; // Traditional auth user

async function testUserType(userId, userType) {
  console.log(`\n🧪 Testing ${userType} User: ${userId}`);
  console.log('='.repeat(60));

  try {
    // Test 1: Set user context
    console.log(`📋 Test 1: Setting user context for ${userType}...`);
    await supabase.rpc('set_current_user_id', { user_id: userId });
    
    // Verify context
    const { data: contextData } = await supabase.from('current_user_context').select('*').single();
    if (contextData?.current_user_id === userId) {
      console.log('✅ User context set and verified');
    } else {
      console.log('❌ User context verification failed:', contextData);
      return false;
    }

    // Test 2: Profile data access
    console.log(`📋 Test 2: Testing profile data access for ${userType}...`);
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.log('❌ Profile access failed:', profileError.message);
      return false;
    } else if (profileData) {
      console.log('✅ Profile data accessible:', { 
        name: profileData.name, 
        storeName: profileData.store_name 
      });
    } else {
      console.log('⚠️ No profile data found');
    }

    // Test 3: Session creation
    console.log(`📋 Test 3: Testing session creation for ${userType}...`);
    const { data: sessionData, error: sessionError } = await supabase
      .from('restock_sessions')
      .insert({
        user_id: userId,
        status: 'draft',
        name: `Test Session - ${userType}`
      })
      .select()
      .single();
      
    if (sessionError) {
      console.log('❌ Session creation failed:', sessionError.message);
      return false;
    } else {
      console.log('✅ Session created successfully:', sessionData.id);
    }

    // Test 4: Supplier creation
    console.log(`📋 Test 4: Testing supplier creation for ${userType}...`);
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        name: `Test Supplier - ${userType}`,
        email: `test-${userType.toLowerCase()}@example.com`
      })
      .select()
      .single();
      
    if (supplierError) {
      console.log('❌ Supplier creation failed:', supplierError.message);
      return false;
    } else {
      console.log('✅ Supplier created successfully:', supplierData.id);
    }

    // Test 5: Product creation
    console.log(`📋 Test 5: Testing product creation for ${userType}...`);
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name: `Test Product - ${userType}`,
        default_quantity: 10,
        default_supplier_id: supplierData.id
      })
      .select()
      .single();
      
    if (productError) {
      console.log('❌ Product creation failed:', productError.message);
      return false;
    } else {
      console.log('✅ Product created successfully:', productData.id);
    }

    // Test 6: Session item creation (restock_items)
    console.log(`📋 Test 6: Testing session item creation for ${userType}...`);
    const { data: itemData, error: itemError } = await supabase
      .from('restock_items')
      .insert({
        session_id: sessionData.id,
        product_id: productData.id,
        supplier_id: supplierData.id,
        quantity: 5
      })
      .select()
      .single();
      
    if (itemError) {
      console.log('❌ Session item creation failed:', itemError.message);
      return false;
    } else {
      console.log('✅ Session item created successfully:', itemData.id);
    }

    // Cleanup: Delete test data
    console.log(`📋 Cleanup: Removing test data for ${userType}...`);
    await supabase.from('restock_items').delete().eq('id', itemData.id);
    await supabase.from('products').delete().eq('id', productData.id);
    await supabase.from('suppliers').delete().eq('id', supplierData.id);
    await supabase.from('restock_sessions').delete().eq('id', sessionData.id);
    console.log('✅ Cleanup completed');

    console.log(`\n🎉 All tests passed for ${userType} user!`);
    return true;

  } catch (error) {
    console.error(`💥 Test failed for ${userType}:`, error);
    return false;
  }
}

async function runComprehensiveTest() {
  console.log('🔍 COMPREHENSIVE RLS FIX VERIFICATION');
  console.log('Testing both SSO and Traditional Auth users');
  console.log('='.repeat(80));

  try {
    // Test SSO user
    const ssoSuccess = await testUserType(SSO_USER, 'SSO');
    
    // Test Traditional Auth user  
    const tradSuccess = await testUserType(TRAD_USER, 'Traditional Auth');

    console.log('\n📊 FINAL RESULTS');
    console.log('='.repeat(50));
    console.log(`SSO User (Google): ${ssoSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Traditional Auth: ${tradSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    if (ssoSuccess && tradSuccess) {
      console.log('\n🎉 SUCCESS: Both user types can now:');
      console.log('   ✅ Create restock sessions');
      console.log('   ✅ Create suppliers');
      console.log('   ✅ Create products');
      console.log('   ✅ Add items to sessions');
      console.log('\n🚀 Your comprehensive RLS fix is working perfectly!');
    } else {
      console.log('\n❌ Some tests failed. Check the SQL fix application.');
    }

    return ssoSuccess && tradSuccess;

  } catch (error) {
    console.error('💥 Comprehensive test failed:', error);
    return false;
  }
}

runComprehensiveTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test script error:', error);
    process.exit(1);
  });
