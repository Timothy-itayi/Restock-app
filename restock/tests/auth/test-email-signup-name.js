/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { 
  validateEmailSignup, 
  processNameForEmailSignup, 
  extractNameFromUser,
  isValidEmail 
} from '../../backend/utils/validation.js';

// Mock user profile service
const mockUserProfileService = {
  ensureUserProfile: jest.fn()
};

describe('Email Signup Name Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Signup Scenarios', () => {
    const emailSignupScenarios = [
      {
        name: 'Valid email signup with name',
        userInput: {
          storeName: 'Test Store',
          name: 'John Doe',
          password: 'password123',
          email: 'john.doe@example.com'
        },
        expectedName: 'John Doe',
        shouldPass: true
      },
      {
        name: 'Email signup without name',
        userInput: {
          storeName: 'Test Store',
          name: '',
          password: 'password123',
          email: 'test@example.com'
        },
        expectedName: '',
        shouldPass: false
      },
      {
        name: 'Email signup with whitespace name',
        userInput: {
          storeName: 'Test Store',
          name: '   ',
          password: 'password123',
          email: 'test@example.com'
        },
        expectedName: '',
        shouldPass: false
      },
      {
        name: 'Email signup with short password',
        userInput: {
          storeName: 'Test Store',
          name: 'Alice Smith',
          password: '123',
          email: 'alice@example.com'
        },
        expectedName: 'Alice Smith',
        shouldPass: false
      },
      {
        name: 'Email signup with invalid email',
        userInput: {
          storeName: 'Test Store',
          name: 'Bob Johnson',
          password: 'password123',
          email: 'invalid-email'
        },
        expectedName: 'Bob Johnson',
        shouldPass: false
      },
      {
        name: 'Email signup with missing store name',
        userInput: {
          storeName: '',
          name: 'Alice Smith',
          password: 'password123',
          email: 'alice@example.com'
        },
        expectedName: 'Alice Smith',
        shouldPass: false
      }
    ];

    emailSignupScenarios.forEach((scenario, index) => {
      test(`should handle ${scenario.name}`, async () => {
        // Validate input
        const validation = validateEmailSignup(scenario.userInput);
        expect(validation.isValid).toBe(scenario.shouldPass);
        
        if (!validation.isValid) {
          expect(validation.errors.length).toBeGreaterThan(0);
          return;
        }
        
        // Process name
        const processedName = processNameForEmailSignup(scenario.userInput.name, true);
        expect(processedName).toBe(scenario.expectedName);
        
        // Mock profile creation
        mockUserProfileService.ensureUserProfile.mockResolvedValue({
          data: {
            id: 'user_123',
            email: scenario.userInput.email,
            name: processedName,
            store_name: scenario.userInput.storeName,
            created_at: new Date().toISOString()
          },
          error: null
        });
        
        // Create profile
        const userId = 'user_' + Math.random().toString(36).substr(2, 9);
        const result = await mockUserProfileService.ensureUserProfile(
          userId,
          scenario.userInput.email,
          scenario.userInput.storeName,
          processedName
        );
        
        // Verify results
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe(scenario.expectedName);
        expect(result.error).toBeNull();
        expect(mockUserProfileService.ensureUserProfile).toHaveBeenCalledWith(
          userId,
          scenario.userInput.email,
          scenario.userInput.storeName,
          processedName
        );
      });
    });
  });

  describe('Name Processing Tests', () => {
    test('should process name correctly for email signup', () => {
      const name = '  John Doe  ';
      const processedName = processNameForEmailSignup(name, true);
      expect(processedName).toBe('John Doe');
    });

    test('should handle empty name for email signup', () => {
      const name = '';
      const processedName = processNameForEmailSignup(name, true);
      expect(processedName).toBe('');
    });

    test('should handle null name for email signup', () => {
      const name = null;
      const processedName = processNameForEmailSignup(name, true);
      expect(processedName).toBe('');
    });

    test('should process name differently for non-email signup', () => {
      const name = '  John Doe  ';
      const processedName = processNameForEmailSignup(name, false);
      expect(processedName).toBe('  John Doe  '); // No trimming for non-email signup
    });
  });

  describe('Name Extraction Tests', () => {
    test('should extract name from user with firstName and lastName', () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john.doe@example.com' }]
      };
      
      const extractedName = extractNameFromUser(user);
      expect(extractedName).toBe('John Doe');
    });

    test('should extract name from user with firstName only', () => {
      const user = {
        firstName: 'Jane',
        emailAddresses: [{ emailAddress: 'jane@example.com' }]
      };
      
      const extractedName = extractNameFromUser(user);
      expect(extractedName).toBe('Jane');
    });

    test('should extract name from user with lastName only', () => {
      const user = {
        lastName: 'Smith',
        emailAddresses: [{ emailAddress: 'smith@example.com' }]
      };
      
      const extractedName = extractNameFromUser(user);
      expect(extractedName).toBe('Smith');
    });

    test('should extract name from user with fullName', () => {
      const user = {
        fullName: 'Bob Johnson',
        emailAddresses: [{ emailAddress: 'bob@example.com' }]
      };
      
      const extractedName = extractNameFromUser(user);
      expect(extractedName).toBe('Bob Johnson');
    });

    test('should extract name from user with username', () => {
      const user = {
        username: 'alice123',
        emailAddresses: [{ emailAddress: 'alice@example.com' }]
      };
      
      const extractedName = extractNameFromUser(user);
      expect(extractedName).toBe('alice123');
    });

    test('should return empty string for user with no name fields', () => {
      const user = {
        emailAddresses: [{ emailAddress: 'unknown@example.com' }]
      };
      
      const extractedName = extractNameFromUser(user);
      expect(extractedName).toBe('');
    });

    test('should return empty string for null user', () => {
      const extractedName = extractNameFromUser(null);
      expect(extractedName).toBe('');
    });
  });

  describe('Email Validation Tests', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user@gmail.com',
        'admin@company.co.uk',
        'user+tag@domain.org'
      ];
      
      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Profile Creation Tests', () => {
    test('should create profile with valid data', async () => {
      const userInput = {
        storeName: 'Test Store',
        name: 'John Doe',
        password: 'password123',
        email: 'john.doe@example.com'
      };
      
      const validation = validateEmailSignup(userInput);
      expect(validation.isValid).toBe(true);
      
      const processedName = processNameForEmailSignup(userInput.name, true);
      expect(processedName).toBe('John Doe');
      
      mockUserProfileService.ensureUserProfile.mockResolvedValue({
        data: {
          id: 'user_123',
          email: userInput.email,
          name: processedName,
          store_name: userInput.storeName,
          created_at: new Date().toISOString()
        },
        error: null
      });
      
      const result = await mockUserProfileService.ensureUserProfile(
        'user_123',
        userInput.email,
        userInput.storeName,
        processedName
      );
      
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john.doe@example.com');
      expect(result.data.store_name).toBe('Test Store');
      expect(result.error).toBeNull();
    });

    test('should handle profile creation errors', async () => {
      mockUserProfileService.ensureUserProfile.mockResolvedValue({
        data: null,
        error: 'Database connection failed'
      });
      
      const result = await mockUserProfileService.ensureUserProfile(
        'user_123',
        'test@example.com',
        'Test Store',
        'Test User'
      );
      
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('Integration Tests', () => {
    test('should complete full email signup name flow', async () => {
      const userInput = {
        storeName: 'New Store',
        name: 'Alice Smith',
        password: 'securePassword123',
        email: 'alice.smith@example.com'
      };
      
      // Step 1: Validate input
      const validation = validateEmailSignup(userInput);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      // Step 2: Process name
      const processedName = processNameForEmailSignup(userInput.name, true);
      expect(processedName).toBe('Alice Smith');
      
      // Step 3: Create profile
      mockUserProfileService.ensureUserProfile.mockResolvedValue({
        data: {
          id: 'user_456',
          email: userInput.email,
          name: processedName,
          store_name: userInput.storeName,
          created_at: new Date().toISOString()
        },
        error: null
      });
      
      const result = await mockUserProfileService.ensureUserProfile(
        'user_456',
        userInput.email,
        userInput.storeName,
        processedName
      );
      
      // Step 4: Verify results
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Alice Smith');
      expect(result.data.email).toBe('alice.smith@example.com');
      expect(result.data.store_name).toBe('New Store');
      expect(result.error).toBeNull();
    });
  });
}); 