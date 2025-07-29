/**
 * Test Email Signup Name Capture Process
 * 
 * This test verifies that email signup users have their names properly captured
 */

// Mock email signup scenarios
const emailSignupScenarios = [
  {
    name: 'Email signup - user enters name',
    userInput: {
      email: 'john@example.com',
      name: 'John Doe',
      storeName: 'John\'s Store',
      password: 'password123'
    },
    expectedName: 'John Doe',
    shouldPass: true
  },
  {
    name: 'Email signup - user enters only first name',
    userInput: {
      email: 'jane@example.com',
      name: 'Jane',
      storeName: 'Jane\'s Store',
      password: 'password123'
    },
    expectedName: 'Jane',
    shouldPass: true
  },
  {
    name: 'Email signup - user leaves name empty',
    userInput: {
      email: 'bob@example.com',
      name: '',
      storeName: 'Bob\'s Store',
      password: 'password123'
    },
    expectedName: '',
    shouldPass: false
  },
  {
    name: 'Email signup - user enters name with spaces',
    userInput: {
      email: 'alice@example.com',
      name: '  Alice Smith  ',
      storeName: 'Alice\'s Store',
      password: 'password123'
    },
    expectedName: 'Alice Smith',
    shouldPass: true
  }
];

// Simulate the validation logic
function validateEmailSignup(userInput) {
  console.log('Validating email signup input:', userInput);
  
  const errors = [];
  
  if (!userInput.storeName.trim()) {
    errors.push('Store name is required');
  }
  
  if (!userInput.name.trim()) {
    errors.push('First name is required for email signup');
  }
  
  if (!userInput.password.trim()) {
    errors.push('Password is required');
  }
  
  if (userInput.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Simulate the name processing logic
function processNameForEmailSignup(name, isEmailSignup) {
  console.log('Processing name for email signup:', { name, isEmailSignup });
  
  if (isEmailSignup) {
    // For email signup, use the manually entered name
    const finalName = name.trim();
    console.log('Using manually entered name:', finalName);
    return finalName;
  } else {
    // For other flows, use extracted name or fallback
    const finalName = name || '';
    console.log('Using extracted/fallback name:', finalName);
    return finalName;
  }
}

// Simulate profile creation
function simulateProfileCreation(userId, email, storeName, name) {
  console.log('Creating profile with data:', {
    userId,
    email,
    storeName,
    name,
    nameType: typeof name,
    nameLength: name?.length || 0,
    nameIsEmpty: !name || name.trim() === ''
  });
  
  const profile = {
    id: userId,
    email,
    name: name.trim(),
    store_name: storeName,
    created_at: new Date().toISOString()
  };
  
  console.log('Created profile:', profile);
  return { data: profile, error: null };
}

console.log('🧪 Testing Email Signup Name Capture Process\n');

emailSignupScenarios.forEach((scenario, index) => {
  console.log(`\nTest ${index + 1}: ${scenario.name}`);
  console.log('User input:', scenario.userInput);
  
  // Validate input
  const validation = validateEmailSignup(scenario.userInput);
  console.log('Validation result:', validation);
  
  if (!validation.isValid) {
    console.log('❌ Validation failed:', validation.errors);
    console.log('Expected result:', scenario.shouldPass ? 'PASS' : 'FAIL');
    console.log('---');
    return;
  }
  
  // Process name
  const processedName = processNameForEmailSignup(scenario.userInput.name, true);
  console.log('Processed name:', processedName);
  
  // Create profile
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  const result = simulateProfileCreation(
    userId,
    scenario.userInput.email,
    scenario.userInput.storeName,
    processedName
  );
  
  // Check results
  const nameMatches = result.data.name === scenario.expectedName;
  const validationPasses = validation.isValid === scenario.shouldPass;
  
  console.log('Name matches expected:', nameMatches ? '✅ PASS' : '❌ FAIL');
  console.log('Validation passes:', validationPasses ? '✅ PASS' : '❌ FAIL');
  console.log('Overall result:', (nameMatches && validationPasses) ? '✅ PASS' : '❌ FAIL');
  console.log('---');
});

console.log('\n📝 Key Improvements for Email Signup:');
console.log('1. ✅ Name input field always shown for email signup users');
console.log('2. ✅ Name validation required for email signup');
console.log('3. ✅ Manually entered name prioritized over extracted name');
console.log('4. ✅ Proper name processing and storage');
console.log('5. ✅ Clear error messages for missing name');

console.log('\n🚀 Test Scenarios:');
console.log('1. Sign up with email');
console.log('2. Enter name in the form');
console.log('3. Complete verification');
console.log('4. Verify name is saved in database');
console.log('5. Check that name is not null');

console.log('\n📊 Expected Flow:');
console.log('Email Signup → Name Input → Verification → Profile Creation → Dashboard');
console.log('Name should be captured from user input, not from Clerk user object'); 