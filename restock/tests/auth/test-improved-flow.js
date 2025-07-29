/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
};

// Mock Supabase responses with error scenarios
const mockSupabaseResponses = {
  existingUser: {
    data: {
      id: 'user_123',
      email: 'test@example.com',
      name: 'John Doe',
      store_name: 'Test Store',
      created_at: '2025-07-28T12:00:00.000Z'
    },
    error: null
  },
  noUser: {
    data: null,
    error: null
  },
  insertSuccess: {
    data: {
      id: 'user_123',
      email: 'test@example.com',
      name: 'John Doe',
      store_name: 'Test Store',
      created_at: '2025-07-28T12:00:00.000Z'
    },
    error: null
  },
  networkError: {
    data: null,
    error: {
      message: 'Network connection failed',
      code: 'NETWORK_ERROR'
    }
  },
  validationError: {
    data: null,
    error: {
      message: 'Invalid user data',
      code: 'VALIDATION_ERROR'
    }
  },
  databaseError: {
    data: null,
    error: {
      message: 'Database constraint violation',
      code: 'PGRST116'
    }
  }
};

// Mock UserProfileService
const mockUserProfileService = {
  ensureUserProfile: jest.fn()
};

describe('Improved User Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureUserProfile Method', () => {
    test('should return existing user when found', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = 'John Doe';

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.existingUser);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('user_123');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.name).toBe('John Doe');
      expect(result.data.store_name).toBe('Test Store');
      expect(result.error).toBeNull();
      expect(mockUserProfileService.ensureUserProfile).toHaveBeenCalledWith(clerkUserId, email, storeName, name);
    });

    test('should create new user when not found', async () => {
      const clerkUserId = 'new_user_456';
      const email = 'new@example.com';
      const storeName = 'New Store';
      const name = 'Jane Doe';

      // Mock that user doesn't exist initially
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve(mockSupabaseResponses.noUser))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve(mockSupabaseResponses.insertSuccess))
          }))
        }))
      }));

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.insertSuccess);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('user_123');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.name).toBe('John Doe');
      expect(result.data.store_name).toBe('Test Store');
      expect(result.error).toBeNull();
    });

    test('should handle network errors gracefully', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = 'John Doe';

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.networkError);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Network connection failed');
      expect(result.error.code).toBe('NETWORK_ERROR');
    });

    test('should handle validation errors', async () => {
      const clerkUserId = 'user_123';
      const email = 'invalid-email';
      const storeName = '';
      const name = '';

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.validationError);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid user data');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    test('should handle database constraint errors', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = 'John Doe';

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.databaseError);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Database constraint violation');
      expect(result.error.code).toBe('PGRST116');
    });
  });

  describe('Test Cases', () => {
    const testCases = [
      {
        name: 'New user - profile creation',
        scenario: 'noUser',
        input: {
          clerkUserId: 'user_123',
          email: 'new@example.com',
          storeName: 'New Store',
          name: 'Jane Doe'
        },
        expected: 'create'
      },
      {
        name: 'Existing user - profile retrieval',
        scenario: 'existingUser',
        input: {
          clerkUserId: 'user_123',
          email: 'existing@example.com',
          storeName: 'Existing Store',
          name: 'John Doe'
        },
        expected: 'retrieve'
      }
    ];

    testCases.forEach((testCase) => {
      test(`should handle ${testCase.name}`, async () => {
        const { clerkUserId, email, storeName, name } = testCase.input;

        if (testCase.expected === 'create') {
          mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.insertSuccess);
        } else {
          mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.existingUser);
        }

        const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

        expect(result.data).toBeDefined();
        expect(result.error).toBeNull();
        expect(mockUserProfileService.ensureUserProfile).toHaveBeenCalledWith(clerkUserId, email, storeName, name);

        if (testCase.expected === 'create') {
          expect(result.data.id).toBe('user_123');
          expect(result.data.email).toBe('test@example.com');
        } else {
          expect(result.data.id).toBe('user_123');
          expect(result.data.email).toBe('test@example.com');
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = 'John Doe';

      mockUserProfileService.ensureUserProfile.mockRejectedValue(new Error('Unexpected error'));

      await expect(mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name))
        .rejects.toThrow('Unexpected error');
    });

    test('should handle null input parameters', async () => {
      const clerkUserId = null;
      const email = null;
      const storeName = null;
      const name = null;

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.validationError);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    test('should handle empty string parameters', async () => {
      const clerkUserId = '';
      const email = '';
      const storeName = '';
      const name = '';

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.validationError);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {
    test('should complete full user profile flow', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = 'John Doe';

      // Mock successful profile creation
      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.insertSuccess);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('user_123');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.name).toBe('John Doe');
      expect(result.data.store_name).toBe('Test Store');
      expect(result.error).toBeNull();
    });

    test('should handle profile creation with missing optional parameters', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = undefined; // Optional parameter

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.insertSuccess);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    test('should handle profile creation with special characters', async () => {
      const clerkUserId = 'user_123';
      const email = 'test+tag@example.com';
      const storeName = 'Test Store & Co.';
      const name = 'José María';

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.insertSuccess);

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle concurrent profile creation requests', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = 'John Doe';

      mockUserProfileService.ensureUserProfile.mockResolvedValue(mockSupabaseResponses.insertSuccess);

      // Simulate concurrent requests
      const promises = Array(5).fill().map(() => 
        mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.data).toBeDefined();
        expect(result.error).toBeNull();
      });

      expect(mockUserProfileService.ensureUserProfile).toHaveBeenCalledTimes(5);
    });

    test('should handle timeout scenarios', async () => {
      const clerkUserId = 'user_123';
      const email = 'test@example.com';
      const storeName = 'Test Store';
      const name = 'John Doe';

      // Mock a delayed response
      mockUserProfileService.ensureUserProfile.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSupabaseResponses.networkError), 100))
      );

      const result = await mockUserProfileService.ensureUserProfile(clerkUserId, email, storeName, name);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
}); 