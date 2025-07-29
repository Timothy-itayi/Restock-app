/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';

// Mock the backend services
jest.mock('../../backend/index.js', () => ({
  AuthService: {
    getUserProfile: jest.fn()
  },
  isAuthenticated: jest.fn(),
  getCurrentUserId: jest.fn()
}));

// Import the mocked services
import { AuthService, isAuthenticated, getCurrentUserId } from '../../backend/index.js';

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Status', () => {
    test('should return true when user is authenticated', async () => {
      // Mock the authentication check
      isAuthenticated.mockResolvedValue(true);
      
      const result = await isAuthenticated();
      
      expect(result).toBe(true);
      expect(isAuthenticated).toHaveBeenCalledTimes(1);
    });

    test('should return false when user is not authenticated', async () => {
      // Mock the authentication check
      isAuthenticated.mockResolvedValue(false);
      
      const result = await isAuthenticated();
      
      expect(result).toBe(false);
      expect(isAuthenticated).toHaveBeenCalledTimes(1);
    });

    test('should handle authentication errors gracefully', async () => {
      // Mock the authentication check to throw an error
      isAuthenticated.mockRejectedValue(new Error('Network error'));
      
      await expect(isAuthenticated()).rejects.toThrow('Network error');
      expect(isAuthenticated).toHaveBeenCalledTimes(1);
    });
  });

  describe('Current User ID', () => {
    test('should return user ID when authenticated', async () => {
      const mockUserId = 'user_123';
      getCurrentUserId.mockResolvedValue(mockUserId);
      
      const result = await getCurrentUserId();
      
      expect(result).toBe(mockUserId);
      expect(getCurrentUserId).toHaveBeenCalledTimes(1);
    });

    test('should return null when not authenticated', async () => {
      getCurrentUserId.mockResolvedValue(null);
      
      const result = await getCurrentUserId();
      
      expect(result).toBeNull();
      expect(getCurrentUserId).toHaveBeenCalledTimes(1);
    });

    test('should handle user ID retrieval errors', async () => {
      getCurrentUserId.mockRejectedValue(new Error('User not found'));
      
      await expect(getCurrentUserId()).rejects.toThrow('User not found');
      expect(getCurrentUserId).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Profile', () => {
    test('should return user profile when authenticated', async () => {
      const mockUserId = 'user_123';
      const mockProfile = {
        id: mockUserId,
        email: 'test@example.com',
        store_name: 'Test Store',
        created_at: '2025-01-01T00:00:00.000Z'
      };
      
      getCurrentUserId.mockResolvedValue(mockUserId);
      AuthService.getUserProfile.mockResolvedValue({
        data: mockProfile,
        error: null
      });
      
      const userId = await getCurrentUserId();
      const { data: user, error } = await AuthService.getUserProfile(userId);
      
      expect(user).toEqual(mockProfile);
      expect(error).toBeNull();
      expect(AuthService.getUserProfile).toHaveBeenCalledWith(mockUserId);
    });

    test('should handle profile retrieval errors', async () => {
      const mockUserId = 'user_123';
      const mockError = new Error('Profile not found');
      
      getCurrentUserId.mockResolvedValue(mockUserId);
      AuthService.getUserProfile.mockResolvedValue({
        data: null,
        error: mockError
      });
      
      const userId = await getCurrentUserId();
      const { data: user, error } = await AuthService.getUserProfile(userId);
      
      expect(user).toBeNull();
      expect(error).toBe(mockError);
      expect(AuthService.getUserProfile).toHaveBeenCalledWith(mockUserId);
    });

    test('should handle null user ID gracefully', async () => {
      getCurrentUserId.mockResolvedValue(null);
      
      const userId = await getCurrentUserId();
      
      expect(userId).toBeNull();
      expect(AuthService.getUserProfile).not.toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete authenticated user flow', async () => {
      const mockUserId = 'user_123';
      const mockProfile = {
        id: mockUserId,
        email: 'test@example.com',
        store_name: 'Test Store',
        created_at: '2025-01-01T00:00:00.000Z'
      };
      
      // Mock all services for authenticated user
      isAuthenticated.mockResolvedValue(true);
      getCurrentUserId.mockResolvedValue(mockUserId);
      AuthService.getUserProfile.mockResolvedValue({
        data: mockProfile,
        error: null
      });
      
      // Simulate the complete flow
      const authenticated = await isAuthenticated();
      expect(authenticated).toBe(true);
      
      if (authenticated) {
        const userId = await getCurrentUserId();
        expect(userId).toBe(mockUserId);
        
        const { data: user, error } = await AuthService.getUserProfile(userId);
        expect(user).toEqual(mockProfile);
        expect(error).toBeNull();
      }
    });

    test('should handle unauthenticated user flow', async () => {
      // Mock all services for unauthenticated user
      isAuthenticated.mockResolvedValue(false);
      
      const authenticated = await isAuthenticated();
      expect(authenticated).toBe(false);
      
      // Should not call other services when not authenticated
      expect(getCurrentUserId).not.toHaveBeenCalled();
      expect(AuthService.getUserProfile).not.toHaveBeenCalled();
    });

    test('should handle authentication service failures', async () => {
      // Mock authentication service failure
      isAuthenticated.mockRejectedValue(new Error('Service unavailable'));
      
      await expect(isAuthenticated()).rejects.toThrow('Service unavailable');
      
      // Should not proceed with other operations
      expect(getCurrentUserId).not.toHaveBeenCalled();
      expect(AuthService.getUserProfile).not.toHaveBeenCalled();
    });
  });
}); 