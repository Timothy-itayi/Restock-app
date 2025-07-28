// Simple test script for backend services
// Run with: node test-backend.js

import dotenv from 'dotenv';
dotenv.config();

import { BackendTests } from '../backend/test-services.ts';

async function runTests() {
  console.log('🚀 Starting Backend Service Tests...\n');
  
  try {
    // Test 1: Basic service functionality
    await BackendTests.testBackendServices();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Search functionality
    await BackendTests.testSearchFunctionality();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Create sample data (optional)
    console.log('💡 To test sample data creation, uncomment the next line in the script');
    // await BackendTests.testCreateSampleData();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests
runTests(); 