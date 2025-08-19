import { ClerkProvider } from '@clerk/clerk-expo';

// Clerk configuration
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing Clerk publishable key. Please check your .env file.');
}

// Extract Clerk domain from publishable key
export const getClerkDomain = () => {
  if (!CLERK_PUBLISHABLE_KEY) return null;
  
  // Use the environment variable for JWT issuer domain
  const domain = process.env.EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN;
  if (!domain) {
    console.warn('EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN not set');
    return null;
  }
  return domain;
};

// Generate OAuth URLs with proper redirect handling
export const getOAuthUrl = (strategy: 'oauth_google', action: 'sign-in' | 'sign-up', redirectUrl: string) => {
  const domain = getClerkDomain();
  if (!domain) {
    throw new Error('Clerk domain not found');
  }
  
  // Use the app's redirect URL directly
  // This should match what's configured in your Clerk dashboard OAuth settings
  if (process.env.NODE_ENV === 'development') {
    console.log('OAuth Configuration:', {
      domain,
      action,
      strategy,
      redirectUrl,
    });
  }
  
  return `https://${domain}/${action}?strategy=${strategy}&redirect_url=${encodeURIComponent(redirectUrl)}`;
};

// Clerk configuration options
export const clerkConfig = {
  publishableKey: CLERK_PUBLISHABLE_KEY,
  // Enable magic link authentication
  signInUrl: '/auth/sign-in',
  signUpUrl: '/auth/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
};

// Clerk authentication hooks and utilities
export const useClerkAuth = () => {
  // This will be implemented with actual Clerk hooks
  return {
    isSignedIn: false,
    user: null,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
  };
}; 