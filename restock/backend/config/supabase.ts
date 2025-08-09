import { createClient } from '@supabase/supabase-js';

// Environment variables - these should be set in your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  SUPPLIERS: 'suppliers',
  RESTOCK_SESSIONS: 'restock_sessions',
  RESTOCK_SESSION_SUPPLIERS: 'restock_session_suppliers',
  RESTOCK_SESSION_PRODUCTS: 'restock_session_products',
  RESTOCK_ITEMS: 'restock_items',
  EMAILS_SENT: 'emails_sent',
} as const;

// Session statuses
export const SESSION_STATUS = {
  DRAFT: 'draft',
  EMAIL_GENERATED: 'email_generated',
  SENT: 'sent',
} as const;

// Email statuses
export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
} as const; 