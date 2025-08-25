/**
 * HOOK: useService
 * 
 * This hook now uses the repository pattern through SupabaseHooksProvider.
 * The repositories handle all Supabase interactions internally.
 * 
 * Provides a clean interface for session management operations
 * while maintaining separation of concerns
 */

import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';

/**
 * Hook for getting all restock sessions
 */
export function useSessions() {
  const { sessionRepository } = useRepositories();
  // Note: This will need userId from auth context
  // For now, returning empty array - will be updated when auth is integrated
  return [];
}

/**
 * Hook for getting sessions by status
 */
export function useSessionsByStatus(status: 'draft' | 'email_generated' | 'sent') {
  const { sessionRepository } = useRepositories();
  // Will filter by status when auth is integrated
  return [];
}

/**
 * Hook for getting a specific session
 */
export function useSession(sessionId: string) {
  const { sessionRepository } = useRepositories();
  // This will be async - need to handle loading state
  return { findById: sessionRepository?.findById, sessionId };
}

/**
 * Hook for getting session items
 */
export function useSessionItems(sessionId: string) {
  const { sessionRepository } = useRepositories();
  // Will get session and return its items
  return { findById: sessionRepository?.findById, sessionId };
}

/**
 * Hook for getting session summary
 */
export function useSessionSummary(sessionId: string) {
  const { sessionRepository } = useRepositories();
  // Will calculate summary from session items
  return { findById: sessionRepository?.findById, sessionId };
}

/**
 * Hook for getting products
 */
export function useProducts() {
  const { productRepository } = useRepositories();
  return { findByUserId: productRepository?.findByUserId };
}

/**
 * Hook for getting suppliers
 */
export function useSuppliers() {
  const { supplierRepository } = useRepositories();
  return { findByUserId: supplierRepository?.findByUserId };
}

/**
 * Hook for getting emails by session
 */
export function useSessionEmails(sessionId: string) {
  const { emailRepository } = useRepositories();
  return { findBySessionId: emailRepository?.findBySessionId, sessionId };
}

/**
 * Mutations using repository pattern
 */
export function useCreateSession() {
  const { sessionRepository } = useRepositories();
  return { create: sessionRepository?.create };
}

export function useUpdateSessionName() {
  const { sessionRepository } = useRepositories();
  return { updateName: sessionRepository?.updateName };
}

export function useUpdateSessionStatus() {
  const { sessionRepository } = useRepositories();
  return { updateStatus: sessionRepository?.updateStatus };
}

export function useAddItemToSession() {
  const { sessionRepository } = useRepositories();
  return { addItem: sessionRepository?.addItem };
}

export function useRemoveItemFromSession() {
  const { sessionRepository } = useRepositories();
  return { removeItem: sessionRepository?.removeItem };
}

export function useCreateEmail() {
  const { emailRepository } = useRepositories();
  return { create: emailRepository?.create };
}

export function useUpdateEmailStatus() {
  const { emailRepository } = useRepositories();
  return { updateStatus: emailRepository?.updateStatus };
}

/**
 * Hook for checking if repositories are properly connected
 */
export function useRepositoryHealth(): { 
  isHealthy: boolean; 
  issues: string[];
} {
  // ALWAYS call hooks before any conditional logic or try/catch
  const { sessionRepository, productRepository, supplierRepository } = useRepositories();
  console.log('SessionRepo:', sessionRepository); // What does this actually return?
  console.log('Methods:', Object.keys(sessionRepository || {}));
  
  // Process repository health after hooks are called
  try {
    const issues: string[] = [];
    
    // Check if repositories are properly initialized
    if (!sessionRepository || !productRepository || !supplierRepository) {
      issues.push('Repository instances not properly initialized');
    }
    
    // Check if repositories have required methods
    if (!sessionRepository?.findByUserId || !productRepository?.findByUserId || !supplierRepository?.findByUserId) {
      issues.push('Repository methods not properly implemented');
    }

    return {
      isHealthy: Array.isArray(issues) ? issues.length === 0 : false,
      issues: Array.isArray(issues) ? issues : []
    };
  } catch (error) {
    console.warn('Repository health check error:', error);
    return {
      isHealthy: false,
      issues: ['Repository health check failed']
    };
  }
}

// Legacy exports for backward compatibility (will be removed)
export const useService = useSessions;
export const useServiceHealth = useRepositoryHealth;
