import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../_types/database';

// Supabase configuration (do NOT throw at import time)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => isConfigured;

// Create a safe proxy that throws only when used, not at import time
function createUnavailableSupabaseProxy(reason: string): SupabaseClient<Database> {
  const handler: ProxyHandler<any> = {
    get: (_target, prop) => {
      throw new Error(
        `Supabase is not configured (${reason}). Set SUPABASE_URL and SUPABASE_ANON_KEY.`
      );
    },
    apply: () => {
      throw new Error(
        `Supabase is not configured (${reason}). Set SUPABASE_URL and SUPABASE_ANON_KEY.`
      );
    },
  };
  return new Proxy({}, handler) as unknown as SupabaseClient<Database>;
}

// Create a function to get the current Clerk token
let getClerkTokenFn: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(fn: () => Promise<string | null>) {
  getClerkTokenFn = fn;
}

// Default Supabase client
export const supabase: SupabaseClient<Database> = isConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : createUnavailableSupabaseProxy('missing environment variables');

// Create authenticated client using Clerk's official Supabase integration
export async function supabaseWithAuth() {
  if (!isConfigured) {
    console.warn('[supabase] Called supabaseWithAuth without configuration');
    return createUnavailableSupabaseProxy('missing environment variables');
  }

  if (getClerkTokenFn) {
    try {
      const token = await getClerkTokenFn();
      if (token) {
        // Use the official integration method - inject token in headers
        return createClient<Database>(supabaseUrl, supabaseAnonKey, {
          global: {
            fetch: async (url, options = {}) => {
              // Insert the Clerk Supabase token into the headers
              const headers = new Headers(options?.headers);
              headers.set('Authorization', `Bearer ${token}`);
              
              // Call the default fetch
              return fetch(url, {
                ...options,
                headers,
              });
            },
          },
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        });
      }
    } catch (error) {
      console.warn('Failed to get Clerk token for Supabase request:', error);
    }
  }
  
  return supabase;
}

// Factory function to create authenticated Supabase client with Clerk session
export const createAuthenticatedSupabaseClient = async (
  getToken: () => Promise<string | null>
): Promise<SupabaseClient<Database>> => {
  if (!isConfigured) {
    console.warn('[supabase] Called createAuthenticatedSupabaseClient without configuration');
    return createUnavailableSupabaseProxy('missing environment variables');
  }

  const token = await getToken();
  
  if (!token) {
    console.warn('No Clerk session token available, using default client');
    return supabase;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

// User registration helper for Clerk integration
export const registerClerkUser = async (
  clerkId: string, 
  email: string, 
  name?: string, 
  storeName?: string
) => {
  try {
    const { data, error } = await supabase.rpc('handle_clerk_user', {
      p_clerk_id: clerkId,
      p_email: email,
      p_name: name || null,
      p_store_name: storeName || null
    } as any);

    if (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }

    return data; // Returns the Supabase UUID
  } catch (error) {
    console.error('Failed to register Clerk user with Supabase:', error);
    throw error;
  }
};

// Export types for use in other files
export type { AuditLog, Database, EmailSent, Product, RestockItem, RestockSession, Supplier, User } from '../_types/database';

