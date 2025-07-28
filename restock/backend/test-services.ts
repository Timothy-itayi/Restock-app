import dotenv from 'dotenv';
dotenv.config();

import { 
  AuthService, 
  ProductService, 
  SupplierService, 
  SessionService, 
  EmailService,
  getCurrentUserId,
  handleSupabaseError 
} from './index';

/**
 * Test all backend services
 */
export async function testBackendServices() {
  console.log('🧪 Testing Backend Services...\n');

  try {
    // Test 1: Check authentication
    console.log('1. Testing Authentication...');
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError) {
      console.log('❌ Auth Error:', handleSupabaseError(authError));
      console.log('⚠️  Please make sure you are logged in to test other services\n');
    } else {
      console.log('✅ Authentication working');
      console.log('👤 Current user:', user?.email || 'No user found\n');
    }

    // Test 2: Test Product Service
    console.log('2. Testing Product Service...');
    if (user?.id) {
      const { data: products, error: productError } = await ProductService.getUserProducts(user.id);
      if (productError) {
        console.log('❌ Product Service Error:', handleSupabaseError(productError));
      } else {
        console.log('✅ Product Service working');
        console.log(`📦 Found ${products?.length || 0} products\n`);
      }
    }

    // Test 3: Test Supplier Service
    console.log('3. Testing Supplier Service...');
    if (user?.id) {
      const { data: suppliers, error: supplierError } = await SupplierService.getUserSuppliers(user.id);
      if (supplierError) {
        console.log('❌ Supplier Service Error:', handleSupabaseError(supplierError));
      } else {
        console.log('✅ Supplier Service working');
        console.log(`🏢 Found ${suppliers?.length || 0} suppliers\n`);
      }
    }

    // Test 4: Test Session Service
    console.log('4. Testing Session Service...');
    if (user?.id) {
      const { data: sessions, error: sessionError } = await SessionService.getUserSessions(user.id);
      if (sessionError) {
        console.log('❌ Session Service Error:', handleSupabaseError(sessionError));
      } else {
        console.log('✅ Session Service working');
        console.log(`📋 Found ${sessions?.length || 0} sessions\n`);
      }
    }

    // Test 5: Test Email Service
    console.log('5. Testing Email Service...');
    if (user?.id) {
      const { data: emails, error: emailError } = await EmailService.getUserEmails(user.id);
      if (emailError) {
        console.log('❌ Email Service Error:', handleSupabaseError(emailError));
      } else {
        console.log('✅ Email Service working');
        console.log(`📧 Found ${emails?.length || 0} emails\n`);
      }
    }

    console.log('🎉 Backend service tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test creating sample data
 */
export async function testCreateSampleData() {
  console.log('🧪 Testing Sample Data Creation...\n');

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('❌ No authenticated user found');
      return;
    }

    // Test creating a supplier
    console.log('1. Creating sample supplier...');
    const { data: supplier, error: supplierError } = await SupplierService.createSupplier({
      user_id: userId,
      name: 'Test Supplier',
      email: 'test@supplier.com',
      phone: '555-1234',
      notes: 'Test supplier for development'
    });

    if (supplierError) {
      console.log('❌ Supplier creation failed:', handleSupabaseError(supplierError));
      return;
    }
    console.log('✅ Sample supplier created:', supplier.name);

    // Test creating a product
    console.log('2. Creating sample product...');
    const { data: product, error: productError } = await ProductService.createProduct({
      user_id: userId,
      name: 'Test Product',
      default_quantity: 10,
      default_supplier_id: supplier.id
    });

    if (productError) {
      console.log('❌ Product creation failed:', handleSupabaseError(productError));
      return;
    }
    console.log('✅ Sample product created:', product.name);

    // Test creating a session
    console.log('3. Creating sample session...');
    const { data: session, error: sessionError } = await SessionService.createSession({
      user_id: userId,
      status: 'draft'
    });

    if (sessionError) {
      console.log('❌ Session creation failed:', handleSupabaseError(sessionError));
      return;
    }
    console.log('✅ Sample session created:', session.id);

    // Test adding item to session
    console.log('4. Adding item to session...');
    const { data: item, error: itemError } = await SessionService.addSessionItem({
      session_id: session.id,
      product_id: product.id,
      supplier_id: supplier.id,
      quantity: 5,
      notes: 'Test item'
    });

    if (itemError) {
      console.log('❌ Item creation failed:', handleSupabaseError(itemError));
      return;
    }
    console.log('✅ Sample item added to session');

    console.log('\n🎉 Sample data creation completed!');
    console.log('📊 Created:');
    console.log(`   - Supplier: ${supplier.name}`);
    console.log(`   - Product: ${product.name}`);
    console.log(`   - Session: ${session.id}`);
    console.log(`   - Item: ${item.id}`);

  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
  }
}

/**
 * Test search functionality
 */
export async function testSearchFunctionality() {
  console.log('🧪 Testing Search Functionality...\n');

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('❌ No authenticated user found');
      return;
    }

    // Test product search
    console.log('1. Testing product search...');
    const { data: products, error: productError } = await ProductService.searchProducts(userId, 'test');
    if (productError) {
      console.log('❌ Product search failed:', handleSupabaseError(productError));
    } else {
      console.log('✅ Product search working');
      console.log(`📦 Found ${products?.length || 0} products matching "test"`);
    }

    // Test supplier search
    console.log('2. Testing supplier search...');
    const { data: suppliers, error: supplierError } = await SupplierService.searchSuppliers(userId, 'test');
    if (supplierError) {
      console.log('❌ Supplier search failed:', handleSupabaseError(supplierError));
    } else {
      console.log('✅ Supplier search working');
      console.log(`🏢 Found ${suppliers?.length || 0} suppliers matching "test"`);
    }

    console.log('\n🎉 Search functionality tests completed!');

  } catch (error) {
    console.error('❌ Search test failed:', error);
  }
}

// Export test functions
export const BackendTests = {
  testBackendServices,
  testCreateSampleData,
  testSearchFunctionality
}; 