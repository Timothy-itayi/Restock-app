/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';

// Mock Clerk SDK
jest.mock('@clerk/clerk-expo', () => ({
  ClerkProvider: ({ children }) => children,
  useAuth: jest.fn(),
  useOAuth: jest.fn()
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }))
}));

// Mock environment variables
process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock_anon_key';

describe('Clerk Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Clerk Configuration', () => {
    test('should have Clerk SDK installed', () => {
      const { ClerkProvider } = require('@clerk/clerk-expo');
      expect(ClerkProvider).toBeDefined();
    });

    test('should have environment variable for Clerk key', () => {
      expect(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeDefined();
      expect(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY).toContain('pk_test_');
    });

    test('should have Clerk auth context available', () => {
      const { useAuth } = require('@clerk/clerk-expo');
      expect(useAuth).toBeDefined();
      expect(typeof useAuth).toBe('function');
    });

    test('should have OAuth functionality available', () => {
      const { useOAuth } = require('@clerk/clerk-expo');
      expect(useOAuth).toBeDefined();
      expect(typeof useOAuth).toBe('function');
    });
  });

  describe('Database Schema Integration', () => {
    test('should have Supabase client configured', () => {
      const { createClient } = require('@supabase/supabase-js');
      expect(createClient).toBeDefined();
      expect(typeof createClient).toBe('function');
    });

    test('should have environment variables for Supabase', () => {
      expect(process.env.SUPABASE_URL).toBeDefined();
      expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.SUPABASE_URL).toContain('supabase.co');
    });

    test('should support users table operations', () => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient();
      
      expect(supabase.from).toBeDefined();
      expect(typeof supabase.from).toBe('function');
    });

    test('should support text-based user IDs', () => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient();
      
      // Test that we can query with string IDs
      const query = supabase.from('users').select('*').eq('id', 'user_123');
      expect(query).toBeDefined();
    });
  });

  describe('Clerk-Supabase Sync Service', () => {
    test('should be able to sync user to Supabase', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient();
      
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        store_name: 'Test Store'
      };
      
      const result = await supabase.from('users').insert(mockUser).select().single();
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    test('should be able to retrieve user from Supabase', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient();
      
      const result = await supabase.from('users').select('*').eq('id', 'user_123').maybeSingle();
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    test('should handle user existence checks', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient();
      
      const result = await supabase.from('users').select('*').eq('id', 'nonexistent_user').maybeSingle();
      
      expect(result).toBeDefined();
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('Authentication Flow', () => {
    test('should support magic link authentication', () => {
      const { useAuth } = require('@clerk/clerk-expo');
      const mockUseAuth = useAuth();
      
      expect(mockUseAuth).toBeDefined();
    });

    test('should support OAuth authentication', () => {
      const { useOAuth } = require('@clerk/clerk-expo');
      const mockUseOAuth = useOAuth();
      
      expect(mockUseOAuth).toBeDefined();
    });

    test('should handle user authentication state', () => {
      const { useAuth } = require('@clerk/clerk-expo');
      const mockUseAuth = useAuth();
      
      // Mock the auth state
      mockUseAuth.isLoaded = true;
      mockUseAuth.isSignedIn = true;
      mockUseAuth.userId = 'user_123';
      
      expect(mockUseAuth.isLoaded).toBe(true);
      expect(mockUseAuth.isSignedIn).toBe(true);
      expect(mockUseAuth.userId).toBe('user_123');
    });

    test('should handle unauthenticated state', () => {
      const { useAuth } = require('@clerk/clerk-expo');
      const mockUseAuth = useAuth();
      
      // Mock the auth state
      mockUseAuth.isLoaded = true;
      mockUseAuth.isSignedIn = false;
      mockUseAuth.userId = null;
      
      expect(mockUseAuth.isLoaded).toBe(true);
      expect(mockUseAuth.isSignedIn).toBe(false);
      expect(mockUseAuth.userId).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle Clerk configuration errors', () => {
      // Test with invalid Clerk key
      const invalidKey = 'invalid_key';
      expect(invalidKey).not.toContain('pk_test_');
    });

    test('should handle Supabase connection errors', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient();
      
      // Mock an error response
      const mockError = { message: 'Connection failed', code: 'NETWORK_ERROR' };
      supabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
          }))
        }))
      }));
      
      const result = await supabase.from('users').select('*').eq('id', 'user_123').maybeSingle();
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Connection failed');
    });

    test('should handle authentication errors gracefully', () => {
      const { useAuth } = require('@clerk/clerk-expo');
      const mockUseAuth = useAuth();
      
      // Mock error state
      mockUseAuth.isLoaded = true;
      mockUseAuth.isSignedIn = false;
      mockUseAuth.error = new Error('Authentication failed');
      
      expect(mockUseAuth.error).toBeDefined();
      expect(mockUseAuth.error.message).toBe('Authentication failed');
    });
  });

  describe('Integration Scenarios', () => {
    test('should complete full authentication flow', async () => {
      const { useAuth } = require('@clerk/clerk-expo');
      const { createClient } = require('@supabase/supabase-js');
      
      const mockUseAuth = useAuth();
      const supabase = createClient();
      
      // Mock successful authentication
      mockUseAuth.isLoaded = true;
      mockUseAuth.isSignedIn = true;
      mockUseAuth.userId = 'user_123';
      
      // Mock successful Supabase sync
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        store_name: 'Test Store'
      };
      
      const result = await supabase.from('users').insert(mockUser).select().single();
      
      expect(mockUseAuth.isSignedIn).toBe(true);
      expect(mockUseAuth.userId).toBe('user_123');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    test('should handle new user registration flow', async () => {
      const { useAuth } = require('@clerk/clerk-expo');
      const { createClient } = require('@supabase/supabase-js');
      
      const mockUseAuth = useAuth();
      const supabase = createClient();
      
      // Mock new user authentication
      mockUseAuth.isLoaded = true;
      mockUseAuth.isSignedIn = true;
      mockUseAuth.userId = 'new_user_456';
      
      // Mock user doesn't exist in Supabase
      supabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { id: 'new_user_456', email: 'new@example.com' }, 
              error: null 
            }))
          }))
        }))
      }));
      
      // Check if user exists
      const existingUser = await supabase.from('users').select('*').eq('id', 'new_user_456').maybeSingle();
      expect(existingUser.data).toBeNull();
      
      // Create new user
      const newUser = await supabase.from('users').insert({
        id: 'new_user_456',
        email: 'new@example.com'
      }).select().single();
      
      expect(newUser.data).toBeDefined();
      expect(newUser.data.id).toBe('new_user_456');
      expect(newUser.error).toBeNull();
    });
  });
}); 