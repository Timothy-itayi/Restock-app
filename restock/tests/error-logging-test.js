/**
 * Error Logging System Test
 * Demonstrates how to use the comprehensive error logging system
 */

// Import the error logging utilities
const { log, perf, userAction, handleError } = require('../backend/utils/error-logger');

/**
 * Test the error logging system
 */
async function testErrorLogging() {
  console.log('🧪 Testing Error Logging System...\n');

  // Test 1: Basic logging
  console.log('1. Testing basic logging...');
  log.info('Component mounted', { userId: 'user123' }, { component: 'RestockSessions' });
  log.success('Data loaded successfully', { count: 5 }, { component: 'RestockSessions' });
  log.warning('Network connection slow', { latency: 2000 }, { component: 'RestockSessions' });
  log.debug('Form validation passed', { fields: ['name', 'email'] }, { component: 'RestockSessions' });
  console.log('✅ Basic logging working\n');

  // Test 2: Error logging
  console.log('2. Testing error logging...');
  try {
    throw new Error('Database connection failed');
  } catch (error) {
    log.error('Database operation failed', error, { 
      component: 'RestockSessions',
      operation: 'loadProducts',
      userId: 'user123'
    });
  }
  console.log('✅ Error logging working\n');

  // Test 3: Performance logging
  console.log('3. Testing performance logging...');
  perf.startTimer('dataLoad');
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  perf.endTimer('dataLoad', { component: 'RestockSessions' });
  console.log('✅ Performance logging working\n');

  // Test 4: User action logging
  console.log('4. Testing user action logging...');
  userAction.logButtonClick('Add Product', { component: 'RestockSessions' });
  userAction.logNavigation('Dashboard', 'RestockSessions', { component: 'App' });
  userAction.logFormSubmission('AddProductForm', { productName: 'Apple' }, { component: 'RestockSessions' });
  console.log('✅ User action logging working\n');

  // Test 5: Error handling utilities
  console.log('5. Testing error handling utilities...');
  
  // Simulate database error
  const dbError = new Error('Connection timeout');
  const dbResult = handleError.handleDatabaseError(dbError, 'loadProducts', { 
    component: 'RestockSessions',
    userId: 'user123'
  });
  console.log('Database error result:', dbResult);
  
  // Simulate validation error
  const validationError = handleError.handleValidationError('email', 'invalid-email', 'must be valid email', {
    component: 'RestockSessions'
  });
  console.log('Validation error result:', validationError);
  
  console.log('✅ Error handling utilities working\n');

  // Test 6: Performance measurement
  console.log('6. Testing performance measurement...');
  const result = await perf.measureAsync('asyncOperation', async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, data: 'test' };
  }, { component: 'RestockSessions' });
  
  console.log('Async operation result:', result);
  console.log('✅ Performance measurement working\n');

  // Test 7: Log retrieval
  console.log('7. Testing log retrieval...');
  const allLogs = log.getLogs();
  const errorLogs = log.getLogsByLevel('error');
  const recentLogs = log.getRecentLogs(5);
  
  console.log(`Total logs: ${allLogs.length}`);
  console.log(`Error logs: ${errorLogs.length}`);
  console.log(`Recent logs: ${recentLogs.length}`);
  console.log('✅ Log retrieval working\n');

  // Test 8: Log export
  console.log('8. Testing log export...');
  const exportedLogs = log.exportLogs();
  console.log('Logs exported successfully (length:', exportedLogs.length, 'characters)');
  console.log('✅ Log export working\n');

  console.log('🎉 All error logging tests passed!');
}

/**
 * Test error scenarios
 */
async function testErrorScenarios() {
  console.log('\n🔍 Testing Error Scenarios...\n');

  // Scenario 1: Network error
  console.log('Scenario 1: Network error');
  try {
    throw new Error('Network timeout');
  } catch (error) {
    const result = handleError.handleNetworkError(error, 'fetchProducts', {
      component: 'RestockSessions',
      userId: 'user123'
    });
    console.log('Network error handled:', result);
  }

  // Scenario 2: Authentication error
  console.log('\nScenario 2: Authentication error');
  try {
    throw new Error('Invalid token');
  } catch (error) {
    const result = handleError.handleAuthError(error, 'verifyUser', {
      component: 'AuthGuard',
      userId: 'user123'
    });
    console.log('Auth error handled:', result);
  }

  // Scenario 3: API error
  console.log('\nScenario 3: API error');
  try {
    throw new Error('500 Internal Server Error');
  } catch (error) {
    const result = handleError.handleApiError(error, '/api/products', {
      component: 'RestockSessions',
      userId: 'user123'
    });
    console.log('API error handled:', result);
  }

  // Scenario 4: AsyncStorage error
  console.log('\nScenario 4: AsyncStorage error');
  try {
    throw new Error('Storage quota exceeded');
  } catch (error) {
    const result = handleError.handleAsyncStorageError(error, 'saveSession', {
      component: 'RestockSessions',
      userId: 'user123'
    });
    console.log('AsyncStorage error handled:', result);
  }

  console.log('\n✅ All error scenarios tested!');
}

/**
 * Test user interaction tracking
 */
function testUserInteractionTracking() {
  console.log('\n👤 Testing User Interaction Tracking...\n');

  // Simulate user session
  const context = { 
    component: 'RestockSessions',
    userId: 'user123',
    sessionId: 'session456'
  };

  // User opens the app
  userAction.logNavigation('Splash', 'Dashboard', context);
  
  // User navigates to restock sessions
  userAction.logNavigation('Dashboard', 'RestockSessions', context);
  
  // User starts a new session
  userAction.logButtonClick('Start New Restock', context);
  
  // User adds a product
  userAction.logFormSubmission('AddProductForm', {
    productName: 'Organic Apples',
    quantity: 10,
    supplierName: 'Fresh Farms',
    supplierEmail: 'orders@freshfarms.com'
  }, context);
  
  // User finishes the session
  userAction.logButtonClick('Finish Session', context);
  
  // User generates emails
  userAction.logButtonClick('Generate Emails', context);

  console.log('✅ User interaction tracking working!');
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    await testErrorLogging();
    await testErrorScenarios();
    testUserInteractionTracking();
    
    console.log('\n🎯 All tests completed successfully!');
    console.log('\n📊 Final Log Summary:');
    console.log(`Total logs: ${log.getLogs().length}`);
    console.log(`Info logs: ${log.getLogsByLevel('info').length}`);
    console.log(`Success logs: ${log.getLogsByLevel('success').length}`);
    console.log(`Warning logs: ${log.getLogsByLevel('warning').length}`);
    console.log(`Error logs: ${log.getLogsByLevel('error').length}`);
    console.log(`Debug logs: ${log.getLogsByLevel('debug').length}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    log.error('Test suite failed', error, { component: 'TestSuite' });
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testErrorLogging,
  testErrorScenarios,
  testUserInteractionTracking,
  runAllTests
}; 