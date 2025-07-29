/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { getOAuthUrl } from '../../backend/config/clerk.js';

// Mock environment variables
process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';

describe('OAuth Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OAuth URL Generation', () => {
    test('should generate OAuth URL with proper redirect', () => {
      const redirectUrl = 'exp://localhost:8081';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
      
      // Should contain the strategy
      expect(oauthUrl).toContain('strategy=oauth_google');
      
      // Should contain the action
      expect(oauthUrl).toContain('sign-in');
      
      // Should contain the redirect URL
      expect(oauthUrl).toContain(encodeURIComponent(redirectUrl));
      
      // Should not redirect to Clerk console
      expect(oauthUrl).not.toContain('clerk.dev/sign-in');
      expect(oauthUrl).not.toContain('clerk.com/sign-in');
    });

    test('should generate OAuth URL with app redirect URL', () => {
      const appRedirectUrl = 'exp://localhost:8081';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', appRedirectUrl);
      
      // Should use the app redirect URL, not Clerk console
      expect(oauthUrl).toContain(encodeURIComponent(appRedirectUrl));
    });

    test('should correct Clerk console redirect URLs', () => {
      const clerkRedirectUrl = 'https://clerk.dev/sign-in';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', clerkRedirectUrl);
      
      // Should be corrected to use app redirect URL
      expect(oauthUrl).toContain('exp://localhost:8081');
      expect(oauthUrl).not.toContain('clerk.dev');
    });

    test('should handle different OAuth strategies', () => {
      const strategies = ['oauth_google', 'oauth_github', 'oauth_apple'];
      const redirectUrl = 'exp://localhost:8081';
      
      strategies.forEach(strategy => {
        const oauthUrl = getOAuthUrl(strategy, 'sign-in', redirectUrl);
        expect(oauthUrl).toContain(`strategy=${strategy}`);
      });
    });

    test('should handle different actions', () => {
      const actions = ['sign-in', 'sign-up'];
      const redirectUrl = 'exp://localhost:8081';
      
      actions.forEach(action => {
        const oauthUrl = getOAuthUrl('oauth_google', action, redirectUrl);
        expect(oauthUrl).toContain(action);
      });
    });
  });

  describe('URL Encoding', () => {
    test('should properly encode redirect URLs', () => {
      const redirectUrl = 'exp://localhost:8081/--/auth/callback';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
      
      expect(oauthUrl).toContain(encodeURIComponent(redirectUrl));
    });

    test('should handle URLs with special characters', () => {
      const redirectUrl = 'exp://localhost:8081/--/auth/callback?param=value&other=123';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
      
      expect(oauthUrl).toContain(encodeURIComponent(redirectUrl));
    });
  });

  describe('Error Handling', () => {
    test('should handle null redirect URL', () => {
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', null);
      
      // Should use default redirect URL
      expect(oauthUrl).toContain('exp://localhost:8081');
    });

    test('should handle undefined redirect URL', () => {
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', undefined);
      
      // Should use default redirect URL
      expect(oauthUrl).toContain('exp://localhost:8081');
    });

    test('should handle empty redirect URL', () => {
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', '');
      
      // Should use default redirect URL
      expect(oauthUrl).toContain('exp://localhost:8081');
    });
  });

  describe('Integration Scenarios', () => {
    test('should generate complete OAuth flow URL', () => {
      const redirectUrl = 'exp://localhost:8081/--/auth/callback';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
      
      // Verify all required components are present
      expect(oauthUrl).toContain('strategy=oauth_google');
      expect(oauthUrl).toContain('sign-in');
      expect(oauthUrl).toContain(encodeURIComponent(redirectUrl));
      expect(oauthUrl).toContain('pk_test_mock_key_for_testing');
    });

    test('should handle development vs production URLs', () => {
      const devRedirectUrl = 'exp://localhost:8081';
      const prodRedirectUrl = 'exp://myapp.com';
      
      const devOAuthUrl = getOAuthUrl('oauth_google', 'sign-in', devRedirectUrl);
      const prodOAuthUrl = getOAuthUrl('oauth_google', 'sign-in', prodRedirectUrl);
      
      expect(devOAuthUrl).toContain(encodeURIComponent(devRedirectUrl));
      expect(prodOAuthUrl).toContain(encodeURIComponent(prodRedirectUrl));
    });
  });

  describe('Security Considerations', () => {
    test('should not expose sensitive information in URL', () => {
      const redirectUrl = 'exp://localhost:8081';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
      
      // Should not contain secret keys
      expect(oauthUrl).not.toContain('sk_');
      expect(oauthUrl).not.toContain('secret');
    });

    test('should use HTTPS for production URLs', () => {
      const prodRedirectUrl = 'exp://myapp.com';
      const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', prodRedirectUrl);
      
      // Should use secure protocol
      expect(oauthUrl).toContain('https://');
    });
  });
}); 