import { useUnifiedAuth } from '../../lib/auth/UnifiedAuthProvider';
import { useState, useEffect, useMemo } from 'react';

/**
 * Client-side safe auth hook that prevents hydration mismatches
 * Returns safe defaults until mounted and handles auth errors gracefully
 */
export function useClientSideAuth() {
  // Use the new unified auth state instead of direct useAuth
  const { userId, isAuthenticated, isReady } = useUnifiedAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Process auth data safely
  const { getToken, isSignedIn, isLoaded } = useMemo(() => {
    if (!userId || !isAuthenticated || !isReady) {
      return { getToken: null, isSignedIn: false, isLoaded: false };
    }
    
    // For now, return null since we don't have direct access to Clerk token
    return { 
      getToken: null, 
      isSignedIn: isAuthenticated, 
      isLoaded: isReady 
    };
  }, [userId, isAuthenticated, isReady]);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
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
    if (!userId || !isAuthenticated || !isReady) {
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
      userId: typeof userId === 'string' ? userId : undefined,
      isSignedIn: isAuthenticated,
      isLoaded: isReady,
      getToken: getToken,
      signOut: () => Promise.resolve()
    };
  }, [isMounted, authError, userId, isAuthenticated, isReady, getToken]);
  
  return {
    ...safeAuth,
    isMounted,
  };
}