import { SupabaseClient } from '@supabase/supabase-js';
import { createAuthenticatedSupabaseClient, supabase } from '../../backend/config/supabase';
import { Database } from '../../backend/types/database';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';
import { useState, useEffect, useMemo } from 'react';

/**
 * Hook that provides a Supabase client authenticated with Clerk session token
 * 
 * @returns Object containing the authenticated Supabase client and loading state
 */
export function useAuthenticatedSupabase() {
  // Use the new unified auth state instead of direct useAuth  
  const { userId, isAuthenticated, isReady } = useUnifiedAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Process auth data safely
  const { getToken, isSignedIn, isLoaded } = useMemo(() => {
    if (!userId || !isAuthenticated || !isReady) {
      return { getToken: null, isSignedIn: false, isLoaded: false };
    }
    
    // Create a token getter function that returns a Promise
    const tokenGetter = async (): Promise<string | null> => {
      try {
        // For now, return null since we don't have direct access to Clerk token
        // This will use the default unauthenticated client
        return null;
      } catch (error) {
        console.warn('Failed to get token:', error);
        return null;
      }
    };
    
    return { 
      getToken: tokenGetter, 
      isSignedIn: isAuthenticated, 
      isLoaded: isReady 
    };
  }, [userId, isAuthenticated, isReady]);
  const [client, setClient] = useState<SupabaseClient<Database>>(supabase);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createClient = async () => {
      setIsLoading(true);
      
      try {
        if (isLoaded && isSignedIn && getToken) {
          // Create authenticated client with Clerk token
          const authenticatedClient = await createAuthenticatedSupabaseClient(getToken);
          setClient(authenticatedClient);
        } else {
          // Use default client for unauthenticated requests
          setClient(supabase);
        }
      } catch (error) {
        console.error('Failed to create authenticated Supabase client:', error);
        // Fallback to default client on error
        setClient(supabase);
      } finally {
        setIsLoading(false);
      }
    };

    createClient();
  }, [isSignedIn, getToken, isLoaded]);

  return {
    supabase: client,
    isLoading,
    isAuthenticated: isSignedIn
  };
}

/**
 * Hook that provides an authenticated Supabase client that refreshes automatically
 * This is useful for components that make multiple requests
 */
export function useSupabaseWithAuth() {
  const { supabase: client, isLoading, isAuthenticated } = useAuthenticatedSupabase();
  
  return {
    client,
    isLoading,
    isAuthenticated,
    // Helper method to make authenticated RPC calls
    rpc: async (fn: string, args?: any) => {
      if (isLoading) {
        throw new Error('Supabase client is still loading');
      }
      
      return client.rpc(fn, args);
    }
  };
}
