/**
 * Test Name Extraction from Google OAuth
 * 
 * This test simulates the user object from Clerk after Google OAuth
 * to verify our name extraction logic works correctly.
 */

// Simulate different user object scenarios
const testCases = [
  {
    name: 'Full name with first and last',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      fullName: null,
      username: null
    },
    expected: 'John Doe'
  },
  {
    name: 'Only first name',
    user: {
      firstName: 'John',
      lastName: null,
      fullName: null,
      username: null
    },
    expected: 'John'
  },
  {
    name: 'Only last name',
    user: {
      firstName: null,
      lastName: 'Doe',
      fullName: null,
      username: null
    },
    expected: 'Doe'
  },
  {
    name: 'Full name available',
    user: {
      firstName: null,
      lastName: null,
      fullName: 'John Doe',
      username: null
    },
    expected: 'John Doe'
  },
  {
    name: 'Only username',
    user: {
      firstName: null,
      lastName: null,
      fullName: null,
      username: 'johndoe'
    },
    expected: 'johndoe'
  },
  {
    name: 'No name data',
    user: {
      firstName: null,
      lastName: null,
      fullName: null,
      username: null
    },
    expected: ''
  }
];

// Name extraction function (same logic as in welcome.tsx)
function extractUserName(user) {
  let userName = '';
  if (user?.firstName && user?.lastName) {
    userName = `${user.firstName} ${user.lastName}`;
  } else if (user?.firstName) {
    userName = user.firstName;
  } else if (user?.lastName) {
    userName = user.lastName;
  } else if (user?.fullName) {
    userName = user.fullName;
  } else if (user?.username) {
    userName = user.username;
  }
  return userName;
}

// Run tests
console.log('🧪 Testing Name Extraction Logic\n');

testCases.forEach((testCase, index) => {
  const result = extractUserName(testCase.user);
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input:`, testCase.user);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Result: "${result}"`);
  console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('📝 Notes:');
console.log('- This test simulates the name extraction logic used in welcome.tsx');
console.log('- The actual user object from Clerk may have different properties');
console.log('- Check the console logs in the app to see the actual user object structure'); 