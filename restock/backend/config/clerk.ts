import { ClerkProvider } from '@clerk/clerk-expo';

// Clerk configuration
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing Clerk publishable key. Please check your .env file.');
}

// Extract Clerk domain from publishable key
export const getClerkDomain = () => {
  if (!CLERK_PUBLISHABLE_KEY) return null;
  
  // Clerk publishable key format: pk_test_xxxxx or pk_live_xxxxx
  // We need to extract the domain from the key or use a default
  const isTest = CLERK_PUBLISHABLE_KEY.includes('pk_test_');
  return isTest ? 'clerk.dev' : 'clerk.com';
};

// Generate OAuth URLs with proper redirect handling
export const getOAuthUrl = (strategy: 'oauth_google', action: 'sign-in' | 'sign-up', redirectUrl: string) => {
  const domain = getClerkDomain();
  if (!domain) {
    throw new Error('Clerk domain not found');
  }
  
  // Ensure the redirect URL points back to the app, not Clerk console
  const appRedirectUrl = redirectUrl.includes('clerk.dev') || redirectUrl.includes('clerk.com') 
    ? 'exp://localhost:8081' // Default Expo development URL
    : redirectUrl;
  
  return `https://${domain}/${action}?strategy=${strategy}&redirect_url=${encodeURIComponent(appRedirectUrl)}`;
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