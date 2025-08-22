import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { SupabaseClient } from '@supabase/supabase-js';
import { createAuthenticatedSupabaseClient, supabase } from '../../backend/config/supabase';
import { Database } from '../../backend/types/database';

/**
 * Hook that provides a Supabase client authenticated with Clerk session token
 * 
 * @returns Object containing the authenticated Supabase client and loading state
 */
export function useAuthenticatedSupabase() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database>>(supabase);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createClient = async () => {
      setIsLoading(true);
      
      try {
        if (isSignedIn && getToken) {
          // Create authenticated client with Clerk token
          const authenticatedClient = await createAuthenticatedSupabaseClient(
            () => getToken({ template: 'supabase' }) // Use the Supabase JWT template
          );
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
  }, [isSignedIn, getToken]);

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
