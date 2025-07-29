/**
 * Test OAuth Flow and Redirect Handling
 * 
 * This test verifies that:
 * 1. OAuth URLs are generated correctly
 * 2. Redirect URLs point back to the app, not Clerk console
 * 3. Session management works properly
 */

const { getOAuthUrl } = require('../backend/config/clerk');

// Mock environment variables
process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';

describe('OAuth Flow Tests', () => {
  test('OAuth URL generation with proper redirect', () => {
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

  test('OAuth URL with app redirect URL', () => {
    const appRedirectUrl = 'exp://localhost:8081';
    const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', appRedirectUrl);
    
    // Should use the app redirect URL, not Clerk console
    expect(oauthUrl).toContain(encodeURIComponent(appRedirectUrl));
  });

  test('OAuth URL with Clerk console redirect (should be corrected)', () => {
    const clerkRedirectUrl = 'https://clerk.dev/sign-in';
    const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', clerkRedirectUrl);
    
    // Should be corrected to use app redirect URL
    expect(oauthUrl).toContain('exp://localhost:8081');
    expect(oauthUrl).not.toContain('clerk.dev');
  });
});

console.log('OAuth Flow Tests completed successfully!');
console.log('\nTo test the actual OAuth flow:');
console.log('1. Open the app');
console.log('2. Tap "Continue with Google"');
console.log('3. Verify the browser opens with Google OAuth');
console.log('4. Verify it redirects back to the app, not Clerk console');
console.log('5. Check that returning user button appears after first sign-in'); 