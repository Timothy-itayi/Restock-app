/**
 * INFRASTRUCTURE CONFIG: SupabaseConfig
 * 
 * Configuration and setup for Supabase client in the infrastructure layer
 * Provides clean abstraction over Supabase configuration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Re-export table names for infrastructure use
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

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
      flowType?: 'implicit' | 'pkce';
    };
  };
}

/**
 * Supabase configuration and client factory
 */
export class SupabaseClientFactory {
  private static instance: SupabaseClient | null = null;

  /**
   * Create or get singleton Supabase client
   */
  static createClient(): SupabaseClient {
    if (!this.instance) {
      const config = this.getConfig();
      
      this.instance = createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
        ...config.options
      });
    }

    return this.instance;
  }

  /**
   * Get Supabase configuration from environment
   */
  private static getConfig(): SupabaseConfig {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please check your .env file for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    return {
      url,
      anonKey
    };
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Check if the client is configured properly
   */
  static isConfigured(): boolean {
    try {
      this.getConfig();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Default Supabase client instance
 * Use this throughout the infrastructure layer
 */
export const supabaseClient = SupabaseClientFactory.createClient();
