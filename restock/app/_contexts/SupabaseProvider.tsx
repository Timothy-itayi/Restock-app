import React from "react";
import { SupabaseHooksProvider } from "../infrastructure/supabase/SupabaseHooksProvider";

/**
 * Supabase Provider
 * 
 * Provides Supabase repositories and services to the app
 * This maintains the repository pattern while using Supabase under the hood
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  console.log('✅ SupabaseProvider: Using Supabase repositories with clean architecture');
  
  return (
    <SupabaseHooksProvider isSupabaseReady={true}>
      {children}
    </SupabaseHooksProvider>
  );
}
