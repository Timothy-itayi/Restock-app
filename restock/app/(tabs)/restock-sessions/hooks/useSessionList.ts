/**
 * SESSION LIST HOOK
 * 
 * Clean hook for managing session lists and selection
 * Focused only on session list UI concerns
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRestockApplicationService } from './useService';
import type { RestockSession } from '../../../domain/entities/RestockSession';

export interface SessionListState {
  sessions: RestockSession[];
  isLoading: boolean;
  error: string | null;
  showSelectionModal: boolean;
}

export interface SessionListActions {
  loadSessions: () => Promise<void>;
  createNewSession: (name?: string) => Promise<{ success: boolean; session?: RestockSession; error?: string }>;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  openSelectionModal: () => void;
  hideSelectionModal: () => void;
  refreshSessions: () => Promise<void>;
}

/**
 * Hook for managing session lists
 * 
 * Handles loading, creating, and deleting sessions
 * Provides clean interface for session list UI components
 */
export function useSessionList(): SessionListState & SessionListActions {
  const { userId } = useAuth();
  const restockService = useRestockApplicationService();

  // State
  const [sessions, setSessions] = useState<RestockSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  /**
   * Load all sessions for the current user
   */
  const loadSessions = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    // Check if service is ready
    if (!restockService || typeof restockService.getSessions !== 'function') {
      console.log('[useSessionList] Service not ready yet, skipping load');
      setError('Service not ready yet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSessionList] Loading sessions for user:', userId);
      
      const result = await restockService.getSessions({ userId });
      
      if (result.success && result.sessions) {
        // Flatten the sessions from the grouped structure
        const allSessions = [
          ...(result.sessions.draft || []),
          ...(result.sessions.emailGenerated || []),
          ...(result.sessions.sent || []),
          ...(result.sessions.all || [])
        ];
        
        // Remove duplicates by ID
        const uniqueSessions = allSessions.filter((session, index, self) => 
          index === self.findIndex(s => s.toValue().id === session.toValue().id)
        );
        
        setSessions(uniqueSessions);
        console.log('[useSessionList] Loaded sessions:', uniqueSessions.length);
      } else {
        setError(result.error || 'Failed to load sessions');
        setSessions([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useSessionList] Error loading sessions:', err);
      setError(errorMessage);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, restockService]);

  /**
   * Create a new session
   */
  const createNewSession = useCallback(async (name?: string) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!restockService || typeof restockService.createSession !== 'function') {
      return { success: false, error: 'Service not ready yet' };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSessionList] Creating new session:', { userId, name });
      
      const result = await restockService.createSession({ userId, name });
      
      if (result.success && result.session) {
        // Add new session to the list
        setSessions(prev => [result.session!, ...prev]);
        console.log('[useSessionList] Session created successfully:', result.session.toValue().id);
        
        return { 
          success: true, 
          session: result.session 
        };
      } else {
        const errorMessage = result.error || 'Failed to create session';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useSessionList] Error creating session:', err);
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [userId, restockService]);

  /**
   * Delete a session
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!restockService || typeof restockService.deleteSession !== 'function') {
      return { success: false, error: 'Service not ready yet' };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSessionList] Deleting session:', sessionId);
      
      const result = await restockService.deleteSession(sessionId);
      
      if (result.success) {
        // Remove session from the list
        setSessions(prev => prev.filter(session => session.toValue().id !== sessionId));
        console.log('[useSessionList] Session deleted successfully:', sessionId);
        
        return { success: true };
      } else {
        const errorMessage = result.error || 'Failed to delete session';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useSessionList] Error deleting session:', err);
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [restockService]);

  /**
   * Show session selection modal
   */
  const showSelectionModalAction = useCallback(() => {
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
    await loadSessions();
  }, [loadSessions]);

  // Load sessions on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadSessions();
    }
  }, [userId, loadSessions]);

  return {
    // State
    sessions,
    isLoading,
    error,
    showSelectionModal,
    
    // Actions
    loadSessions,
    createNewSession,
    deleteSession,
    openSelectionModal: showSelectionModalAction,
    hideSelectionModal,
    refreshSessions
  };
}
