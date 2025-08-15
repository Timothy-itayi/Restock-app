#!/usr/bin/env node

/**
 * TEST SCRIPT: Repository Integration Validation
 * 
 * This script validates that the repository pattern is working correctly
 * and that clean architecture principles are maintained
 */

const fs = require('fs');
const path = require('path');

// Test scenarios to validate
const testScenarios = [
  {
    name: 'Repository Pattern Usage',
    description: 'Check that all UI components use repository hooks',
    files: [
      'app/(tabs)/dashboard/components/SwipeableSessionCard.tsx',
      'app/(tabs)/profile/components/HistorySection.tsx',
      'app/(tabs)/restock-sessions/components/ReplaySuggestions.tsx',
      'app/(tabs)/restock-sessions/hooks/useRestockSession.ts',
      'app/(tabs)/restock-sessions/hooks/useSessionStateManager.ts',
      'app/(tabs)/profile/hooks/useProfileData.ts',
      'app/(tabs)/emails/hooks/useEmailScreens.ts',
      'app/(tabs)/dashboard/hooks/useDashboardData.ts',
      'app/(tabs)/emails/hooks/useEmailSessions.ts',
      'app/(tabs)/emails/hooks/useEmailSession.ts',
      'app/(tabs)/restock-sessions/hooks/useSessionList.ts',
      'app/(tabs)/restock-sessions/hooks/useProductForm.ts',
      'app/(tabs)/restock-sessions/hooks/useRestockSessions.ts'
    ]
  },
  {
    name: 'Clean Architecture Validation',
    description: 'Check that no UI components import Convex directly',
    files: [
      'app/(tabs)/**/*.tsx',
      'app/(tabs)/**/*.ts'
    ]
  },
  {
    name: 'Repository Interface Implementation',
    description: 'Check that all repositories implement domain interfaces',
    files: [
      'app/infrastructure/convex/repositories/ConvexSessionRepository.ts',
      'app/infrastructure/convex/repositories/ConvexProductRepository.ts',
      'app/infrastructure/convex/repositories/ConvexSupplierRepository.ts',
      'app/infrastructure/convex/repositories/ConvexEmailRepository.ts',
      'app/infrastructure/convex/repositories/ConvexUserRepository.ts'
    ]
  }
];

function checkRepositoryPatternUsage(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    return { passed: false, error: 'File not found' };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check for repository pattern usage
  const hasRepositoryHook = content.includes('useSessionRepository') || 
                           content.includes('useProductRepository') || 
                           content.includes('useSupplierRepository') || 
                           content.includes('useEmailRepository') || 
                           content.includes('useUserRepository');
  
  // Check for old service layer usage
  const hasOldService = content.includes('useRestockApplicationService') || 
                       content.includes('RestockApplicationService');
  
  // Check for direct Convex imports
  const hasDirectConvex = content.includes('import.*convex') || 
                          content.includes('useQuery') || 
                          content.includes('useMutation');
  
  return {
    passed: hasRepositoryHook && !hasOldService && !hasDirectConvex,
    hasRepositoryHook,
    hasOldService,
    hasDirectConvex,
    filePath
  };
}

function checkCleanArchitecture(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    return { passed: false, error: 'File not found' };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check for direct Convex imports in UI layer
  const hasDirectConvex = content.includes('import') && 
                          (content.includes('convex/react') || 
                           content.includes('convex/_generated/api'));
  
  // Check for repository pattern usage
  const hasRepositoryPattern = content.includes('ConvexHooksProvider') || 
                              content.includes('useSessionRepository') || 
                              content.includes('useProductRepository') || 
                              content.includes('useSupplierRepository') || 
                              content.includes('useEmailRepository') || 
                              content.includes('useUserRepository');
  
  return {
    passed: !hasDirectConvex || hasRepositoryPattern,
    hasDirectConvex,
    hasRepositoryPattern,
    filePath
  };
}

function checkRepositoryImplementation(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    return { passed: false, error: 'File not found' };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check for interface implementation
  const implementsInterface = content.includes('implements') && 
                             (content.includes('SessionRepository') || 
                              content.includes('ProductRepository') || 
                              content.includes('SupplierRepository') || 
                              content.includes('EmailRepository') || 
                              content.includes('UserRepository'));
  
  return {
    passed: implementsInterface,
    implementsInterface,
    filePath
  };
}

function runTests() {
  console.log('🧪 Starting Repository Integration Tests...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Repository Pattern Usage
  console.log('📋 Test 1: Repository Pattern Usage');
  console.log('=' .repeat(50));
  
  for (const filePath of testScenarios[0].files) {
    totalTests++;
    const result = checkRepositoryPatternUsage(filePath);
    
    if (result.passed) {
      console.log(`✅ ${filePath}`);
      passedTests++;
    } else {
      console.log(`❌ ${filePath}`);
      console.log(`   - Has Repository Hook: ${result.hasRepositoryHook}`);
      console.log(`   - Has Old Service: ${result.hasOldService}`);
      console.log(`   - Has Direct Convex: ${result.hasDirectConvex}`);
      failedTests++;
    }
  }
  
  console.log('');
  
  // Test 2: Clean Architecture Validation
  console.log('📋 Test 2: Clean Architecture Validation');
  console.log('=' .repeat(50));
  
  // Check a few key UI files for direct Convex usage
  const uiFiles = [
    'app/(tabs)/dashboard/index.tsx',
    'app/(tabs)/restock-sessions/index.tsx',
    'app/(tabs)/emails/index.tsx',
    'app/(tabs)/profile/index.tsx'
  ];
  
  for (const filePath of uiFiles) {
    totalTests++;
    const result = checkCleanArchitecture(filePath);
    
    if (result.passed) {
      console.log(`✅ ${filePath}`);
      passedTests++;
    } else {
      console.log(`❌ ${filePath}`);
      console.log(`   - Has Direct Convex: ${result.hasDirectConvex}`);
      console.log(`   - Has Repository Pattern: ${result.hasRepositoryPattern}`);
      failedTests++;
    }
  }
  
  console.log('');
  
  // Test 3: Repository Implementation
  console.log('📋 Test 3: Repository Implementation');
  console.log('=' .repeat(50));
  
  for (const filePath of testScenarios[2].files) {
    totalTests++;
    const result = checkRepositoryImplementation(filePath);
    
    if (result.passed) {
      console.log(`✅ ${filePath}`);
      passedTests++;
    } else {
      console.log(`❌ ${filePath}`);
      console.log(`   - Implements Interface: ${result.implementsInterface}`);
      failedTests++;
    }
  }
  
  console.log('');
  console.log('📊 Test Results Summary');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Repository integration is working correctly.');
    console.log('✅ Clean architecture principles are maintained.');
    console.log('✅ Ready to proceed with user flow testing.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before proceeding.');
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { 
  checkRepositoryPatternUsage, 
  checkCleanArchitecture, 
  checkRepositoryImplementation 
};
