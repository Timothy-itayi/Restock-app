import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Client-side safe auth hook that prevents hydration mismatches
 * Returns safe defaults until mounted and handles auth errors gracefully
 */
export function useClientSideAuth() {
  const [isMounted, setIsMounted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // ALWAYS call useAuth - never in try/catch to avoid hooks order violations
  const rawAuth = useAuth();
  
  // Validate auth in useEffect after hooks are called
  useEffect(() => {
    if (typeof rawAuth !== 'object' || rawAuth === null) {
      const error = `useAuth returned unexpected type: ${typeof rawAuth}`;
      console.warn(error);
      setAuthError(error);
    } else if (typeof rawAuth === 'number') {
      const error = 'useAuth returned a number instead of object - Clerk configuration issue';
      console.error(error);
      setAuthError(error);
    } else {
      setAuthError(null);
    }
  }, [rawAuth]);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Process auth data safely
  const safeAuth = useMemo(() => {
    // If not mounted or has auth error, return safe defaults
    if (!isMounted || authError) {
      return {
        userId: undefined,
        isSignedIn: false,
        isLoaded: false,
        getToken: undefined,
        signOut: () => Promise.resolve()
      };
    }
    
    // If rawAuth is not a valid object, return safe defaults
    if (!rawAuth || typeof rawAuth !== 'object') {
      return {
        userId: undefined,
        isSignedIn: false,
        isLoaded: false,
        getToken: undefined,
        signOut: () => Promise.resolve()
      };
    }
    
    // Process valid auth object
    return {
      userId: typeof rawAuth.userId === 'string' ? rawAuth.userId : undefined,
      isSignedIn: typeof rawAuth.isSignedIn === 'boolean' ? rawAuth.isSignedIn : false,
      isLoaded: typeof rawAuth.isLoaded === 'boolean' ? rawAuth.isLoaded : false,
      getToken: typeof rawAuth.getToken === 'function' ? rawAuth.getToken : undefined,
      signOut: typeof rawAuth.signOut === 'function' ? rawAuth.signOut : () => Promise.resolve()
    };
  }, [isMounted, rawAuth, authError]);
  
  return {
    ...safeAuth,
    isMounted,
  };
}