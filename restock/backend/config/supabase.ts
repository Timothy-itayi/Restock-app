import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Default Supabase client (for unauthenticated requests)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

// Factory function to create authenticated Supabase client with Clerk session
export const createAuthenticatedSupabaseClient = async (getToken: () => Promise<string | null>): Promise<SupabaseClient<Database>> => {
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
    });

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
export type { Database } from '../types/database';
export type { User, Product, Supplier, RestockSession, RestockItem, EmailSent, AuditLog } from '../types/database';
