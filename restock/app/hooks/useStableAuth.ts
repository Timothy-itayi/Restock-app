import { useState, useEffect } from 'react';
import { useClientSideAuth } from './useClientSideAuth';
import { useDevAuth } from './useDevAuth';

interface StableAuthState {
  userId: string | undefined;
  isSignedIn: boolean;
  isLoaded: boolean;
  getToken: (() => Promise<string | null>) | undefined;
  signOut: () => Promise<void>;
  error: string | null;
  isReady: boolean;
}

/**
 * Simplified stable auth that uses useClientSideAuth to avoid Clerk hook issues
 * Maintains consistent hook call order and provides safe fallbacks
 */
export function useStableAuth(): StableAuthState {
  const [authState, setAuthState] = useState<StableAuthState>({
    userId: undefined,
    isSignedIn: false,
    isLoaded: false,
    getToken: undefined,
    signOut: async () => {},
    error: null,
    isReady: false
  });
  
  const [useDevFallback, setUseDevFallback] = useState(false);
  
  // Use the safer client-side auth hook
  const clientAuth = useClientSideAuth();
  
  // Development fallback when Clerk completely fails
  const devAuth = useDevAuth();
  
  useEffect(() => {
    // Only process when client is mounted to avoid hydration issues
    if (!clientAuth.isMounted) {
      setAuthState(prev => ({
        ...prev,
        isReady: false,
        error: null
      }));
      return;
    }
    
    // Check if we should use dev fallback (when Clerk persistently fails)
    if (!clientAuth.userId && !clientAuth.isLoaded && process.env.NODE_ENV === 'development') {
      // If Clerk hasn't loaded after mount, use dev fallback
      const timer = setTimeout(() => {
        console.warn('🔧 Using development auth fallback due to Clerk issues');
        setUseDevFallback(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    // Use development auth if fallback is enabled
    if (useDevFallback && process.env.NODE_ENV === 'development') {
      setAuthState({
        userId: devAuth.userId,
        isSignedIn: devAuth.isSignedIn,
        isLoaded: devAuth.isLoaded,
        getToken: devAuth.getToken,
        signOut: devAuth.signOut,
        error: null,
        isReady: devAuth.isReady
      });
      return;
    }
    
    // Process the client auth state
    setAuthState({
      userId: clientAuth.userId,
      isSignedIn: clientAuth.isSignedIn,
      isLoaded: clientAuth.isLoaded,
      getToken: clientAuth.getToken,
      signOut: clientAuth.signOut,
      error: null,
      isReady: true
    });
    
  }, [clientAuth.isMounted, clientAuth.userId, clientAuth.isSignedIn, clientAuth.isLoaded, useDevFallback, devAuth]);
  
  return authState;
}