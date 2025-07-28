import { ClerkProvider } from '@clerk/clerk-expo';

// Clerk configuration
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing Clerk publishable key. Please check your .env file.');
}

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