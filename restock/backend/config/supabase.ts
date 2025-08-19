import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
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

// Helper function to set current user context for RLS policies
export const setCurrentUserContext = async (clerkUserId: string) => {
  try {
    await supabase.rpc('set_current_user_context', { user_id: clerkUserId });
  } catch (error) {
    console.warn('Failed to set current user context:', error);
  }
};

// Helper function to clear current user context
export const clearCurrentUserContext = async () => {
  try {
    await supabase.rpc('clear_current_user_context');
  } catch (error) {
    console.warn('Failed to clear current user context:', error);
  }
};

// Export types for use in other files
export type { Database } from '../types/database';
export type { User, Product, Supplier, RestockSession, RestockItem, EmailSent, AuditLog } from '../types/database';
