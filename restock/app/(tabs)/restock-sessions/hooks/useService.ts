/**
 * HOOK: useService
 * 
 * This hook now uses the repository pattern through SupabaseHooksProvider.
 * The repositories handle all Supabase interactions internally.
 * 
 * Provides a clean interface for session management operations
 * while maintaining separation of concerns
 */

import { 
  useSessionRepository,
  useProductRepository,
  useSupplierRepository,
  useEmailRepository
} from '../../../infrastructure/repositories/SupabaseHooksProvider';

/**
 * Hook for getting all restock sessions
 */
export function useSessions() {
  const { findByUserId } = useSessionRepository();
  // Note: This will need userId from auth context
  // For now, returning empty array - will be updated when auth is integrated
  return [];
}

/**
 * Hook for getting sessions by status
 */
export function useSessionsByStatus(status: 'draft' | 'email_generated' | 'sent') {
  const { findByUserId } = useSessionRepository();
  // Will filter by status when auth is integrated
  return [];
}

/**
 * Hook for getting a specific session
 */
export function useSession(sessionId: string) {
  const { findById } = useSessionRepository();
  // This will be async - need to handle loading state
  return { findById, sessionId };
}

/**
 * Hook for getting session items
 */
export function useSessionItems(sessionId: string) {
  const { findById } = useSessionRepository();
  // Will get session and return its items
  return { findById, sessionId };
}

/**
 * Hook for getting session summary
 */
export function useSessionSummary(sessionId: string) {
  const { findById } = useSessionRepository();
  // Will calculate summary from session items
  return { findById, sessionId };
}

/**
 * Hook for getting products
 */
export function useProducts() {
  const { findByUserId } = useProductRepository();
  return { findByUserId };
}

/**
 * Hook for getting suppliers
 */
export function useSuppliers() {
  const { findByUserId } = useSupplierRepository();
  return { findByUserId };
}

/**
 * Hook for getting emails by session
 */
export function useSessionEmails(sessionId: string) {
  const { findBySessionId } = useEmailRepository();
  return { findBySessionId, sessionId };
}

/**
 * Mutations using repository pattern
 */
export function useCreateSession() {
  const { create } = useSessionRepository();
  return { create };
}

export function useUpdateSessionName() {
  const { updateName } = useSessionRepository();
  return { updateName };
}

export function useUpdateSessionStatus() {
  const { updateStatus } = useSessionRepository();
  return { updateStatus };
}

export function useAddItemToSession() {
  const { addItem } = useSessionRepository();
  return { addItem };
}

export function useRemoveItemFromSession() {
  const { removeItem } = useSessionRepository();
  return { removeItem };
}

export function useCreateEmail() {
  const { create } = useEmailRepository();
  return { create };
}

export function useUpdateEmailStatus() {
  const { updateStatus } = useEmailRepository();
  return { updateStatus };
}

/**
 * Hook for checking if repositories are properly connected
 */
export function useRepositoryHealth(): { 
  isHealthy: boolean; 
  issues: string[];
} {
  // ALWAYS call hooks before any conditional logic or try/catch
  const sessionRepo = useSessionRepository();
  console.log('SessionRepo:', sessionRepo); // What does this actually return?
console.log('Methods:', Object.keys(sessionRepo || {}));
  const productRepo = useProductRepository();
  const supplierRepo = useSupplierRepository();
  
  // Process repository health after hooks are called
  try {
    const issues: string[] = [];
    
    // Check if repositories are properly initialized
    if (!sessionRepo || !productRepo || !supplierRepo) {
      issues.push('Repository instances not properly initialized');
    }
    
    // Check if repositories have required methods
    if (!sessionRepo?.findByUserId || !productRepo?.findByUserId || !supplierRepo?.findByUserId) {
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
