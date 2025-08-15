/**
 * CONVEX SESSION LIST HOOK
 * 
 * Direct integration with Convex for session management
 * No more service layer complexity - just clean Convex functions
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useConvexSessions } from '../../../infrastructure/repositories/ConvexSessionRepository';

export interface ConvexSessionListState {
  sessions: any[]; // Will be properly typed once Convex types are generated
  isLoading: boolean;
  error: string | null;
  showSelectionModal: boolean;
}

export interface ConvexSessionListActions {
  loadSessions: () => Promise<void>;
  createNewSession: (name?: string) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  openSelectionModal: () => void;
  hideSelectionModal: () => void;
  refreshSessions: () => Promise<void>;
}

/**
 * Hook for managing session lists using Convex
 * 
 * Much simpler than the service-based approach
 * Clerk auth context is handled automatically
 */
export function useConvexSessionList(): ConvexSessionListState & ConvexSessionListActions {
  const { userId } = useAuth();
  const convexSessions = useConvexSessions();

  // Local UI state
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all sessions for the current user
   */
  const loadSessions = useCallback(async () => {
    // Convex handles this automatically - no need to manually load
    // The sessions will be reactive and update automatically
  }, []);

  /**
   * Create a new session
   */
  const createNewSession = useCallback(async (name?: string) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log('[useConvexSessionList] Creating new session:', { userId, name });
      
      const sessionId = await convexSessions.createSession({ name });
      
      if (sessionId) {
        console.log('[useConvexSessionList] Session created successfully:', sessionId);
        return { 
          success: true, 
          sessionId 
        };
      } else {
        return { 
          success: false, 
          error: 'Failed to create session' 
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useConvexSessionList] Error creating session:', err);
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [userId, convexSessions.createSession]);

  /**
   * Delete a session
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      console.log('[useConvexSessionList] Deleting session:', sessionId);
      
      // Convert string ID to Convex ID type
      const convexId = sessionId as any; // Temporary fix until we have proper types
      await convexSessions.deleteSession({ id: convexId });
      
      console.log('[useConvexSessionList] Session deleted successfully:', sessionId);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useConvexSessionList] Error deleting session:', err);
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [convexSessions.deleteSession]);

  /**
   * Show session selection modal
   */
  const openSelectionModal = useCallback(() => {
    setShowSelectionModal(true);
  }, []);

  /**
   * Hide session selection modal
   */
  const hideSelectionModal = useCallback(() => {
    setShowSelectionModal(false);
  }, []);

  /**
   * Refresh sessions (reload from server)
   */
  const refreshSessions = useCallback(async () => {
    // Convex handles this automatically - no need to manually refresh
  }, []);

  // Clear error when sessions change
  if (error && convexSessions.sessions) {
    setError(null);
  }

  return {
    // State
    sessions: convexSessions.sessions || [],
    isLoading: convexSessions.isLoading,
    error,
    showSelectionModal,
    
    // Actions
    loadSessions,
    createNewSession,
    deleteSession,
    openSelectionModal,
    hideSelectionModal,
    refreshSessions
  };
}
