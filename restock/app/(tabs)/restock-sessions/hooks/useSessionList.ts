import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSessionRepository } from '../../../infrastructure/repositories/SupabaseHooksProvider';
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

export function useSessionList(): SessionListState & SessionListActions {
  const { userId } = useAuth();
  const { create, findByUserId } = useSessionRepository();

  const [sessions, setSessions] = useState<RestockSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const fetchedSessions = await findByUserId();
      setSessions(fetchedSessions ? [...fetchedSessions] : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useSessionList] loadSessions error:', err);
      setError(message);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, findByUserId]);

  const createNewSession = useCallback(async (name?: string) => {
    if (!userId) return { success: false, error: 'User not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      const sessionName = name || `Restock Session ${new Date().toLocaleDateString()}`;
      
      // Create RestockSession instance first
      const tempSession = RestockSession.create({ 
        id: 'temp', // Will be replaced by repository
        userId, 
        name: sessionName 
      });
      
      const sessionId = await create(tempSession);

      if (!sessionId) throw new Error('Failed to create session');

      const newSession = RestockSession.create({ id: sessionId, userId, name: sessionName });
      setSessions(prev => [newSession, ...prev]);

      return { success: true, session: newSession };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useSessionList] createNewSession error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [userId, create]);

  const deleteSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useSessionList] deleteSession error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showSelectionModalAction = useCallback(() => setShowSelectionModal(true), []);
  const hideSelectionModal = useCallback(() => setShowSelectionModal(false), []);
  const refreshSessions = useCallback(async () => loadSessions(), [loadSessions]);

  useEffect(() => {
    if (userId) loadSessions();
  }, [userId, loadSessions]);

  return {
    sessions,
    isLoading,
    error,
    showSelectionModal,
    loadSessions,
    createNewSession,
    deleteSession,
    openSelectionModal: showSelectionModalAction,
    hideSelectionModal,
    refreshSessions,
  };
}
