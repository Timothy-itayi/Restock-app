/**
 * SESSION LIST HOOK
 * 
 * Clean hook for managing session lists and selection
 * Focused only on session list UI concerns
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from '../../../infrastructure/repositories/SupabaseHooksProvider';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';

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
  const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus } = useSessionRepository();

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

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSessionList] Loading sessions for user:', userId);
      
      const sessions = await findByUserId(userId);
      
      if (sessions && sessions.length > 0) {
        setSessions([...sessions]); // Convert readonly to mutable
        console.log('[useSessionList] Loaded sessions:', sessions.length);
      } else {
        setSessions([]);
        console.log('[useSessionList] No sessions found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useSessionList] Error loading sessions:', err);
      setError(errorMessage);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, findByUserId]);

  /**
   * Create a new session
   */
  const createNewSession = useCallback(async (name?: string) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSessionList] Creating new session:', { userId, name });
      
      const sessionId = await create({ 
        userId, 
        name: name || `Restock Session ${new Date().toLocaleDateString()}`,
        status: SessionStatus.DRAFT,
        items: []
      });
      
      if (sessionId) {
        // Create a new session object
        const newSession = RestockSession.create({
          id: sessionId,
          userId,
          name: name || `Restock Session ${new Date().toLocaleDateString()}`,
        });
        
        // Add new session to the list
        setSessions(prev => [newSession, ...prev]);
        console.log('[useSessionList] Session created successfully:', sessionId);
        
        return { 
          success: true, 
          session: newSession 
        };
      } else {
        const errorMessage = 'Failed to create session';
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
  }, [userId, create]);

  /**
   * Delete a session
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSessionList] Deleting session:', sessionId);
      
      // For now, just remove from local state since we don't have a delete method
      // TODO: Implement delete method in repository
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      console.log('[useSessionList] Session removed from list:', sessionId);
      
      return { success: true };
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
  }, []);

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
