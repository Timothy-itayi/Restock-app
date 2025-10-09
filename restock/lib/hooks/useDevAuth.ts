import { useState, useEffect } from 'react';

/**
 * Development-only auth fallback when Clerk fails completely
 * Provides a mock authenticated user for development purposes
 */
export function useDevAuth() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Small delay to simulate auth loading
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return {
    userId: 'dev-user-123',
    isSignedIn: true,
    isLoaded: true,
    getToken: async () => 'dev-token',
    signOut: async () => {
      console.log('Dev auth: sign out called');
    },
    error: null,
    isReady,
    isMounted: true
  };
}