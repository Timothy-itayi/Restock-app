import React from 'react';
import { SupabaseHooksProvider } from '../../infrastructure/_supabase/SupabaseHooksProvider';

/**
 * Supabase Provider
 * 
 * Provides Supabase repositories and services to the app
 * This maintains the repository pattern while using Supabase under the hood
 */
export const  SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
   
      <SupabaseHooksProvider>
        {children}
      </SupabaseHooksProvider>

  );
};
