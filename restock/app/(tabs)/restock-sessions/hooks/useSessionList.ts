import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';
import { useSupabaseRepository } from '../../../hooks/useSupabaseRepository';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';

export function useSessionList(): SessionListState & SessionListActions {
  // Safe auth handling to prevent hydration errors
  const { userId } = useUnifiedAuth();
  try {
    if (!userId) {
      // Handle unauthenticated state
    }
  } catch (error) {
    console.warn('useSessionList: Auth error, using fallback');
  }
  
  const { sessions: sessionRepo, isLoading: repoLoading, isAuthenticated } = useSupabaseRepository();
  
  // Stable references to prevent callback recreation
  const authRef = useRef(userId);
  const createRef = useRef(sessionRepo.create);
  const getAllRef = useRef(sessionRepo.getAll);
  
  // Update refs when dependencies change
  useEffect(() => {
    authRef.current = userId;
    createRef.current = sessionRepo.create;
    getAllRef.current = sessionRepo.getAll;
  }, [userId, sessionRepo.create, sessionRepo.getAll]);

  const [sessions, setSessions] = useState<RestockSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!authRef.current) {
      setError('User not authenticated');
      setSessions([]); // Ensure sessions is always an array
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionData = await getAllRef.current();
      
      if (Array.isArray(sessionData)) {
        const mappedSessions = sessionData.map((data: any) => 
          RestockSession.fromValue({
            id: data.id,
            userId: authRef.current || '',
            name: data.name,
            status: data.status as SessionStatus,
            items: [], // Initialize with empty items array
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
          })
        );
        setSessions(mappedSessions);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSession = useCallback(async (name?: string) => {
    if (!authRef.current) return { success: false, error: 'User not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      const sessionName = name || `Restock Session ${new Date().toLocaleDateString()}`;

      // Create temporary session for immediate UI feedback
      const tempSession = RestockSession.create({ 
        id: 'temp', // Will be replaced by repository
        userId: authRef.current, 
        name: sessionName 
      });
      setSessions(prev => [tempSession, ...(Array.isArray(prev) ? prev : [])]);

      // Create session in repository
      const created = await createRef.current(sessionName, 'draft');
      if (!created) throw new Error('Failed to create session');

      const newSession = RestockSession.create({ id: created.id, userId: authRef.current, name: sessionName });
      setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);

      return { success: true, session: newSession };
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create session');
      
      // Remove temporary session on error
      setSessions(prev => prev.filter(s => s.id !== 'temp'));
      
      return { success: false, error: 'Failed to create session' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await sessionRepo.delete(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete session');
      return { success: false, error: 'Failed to delete session' };
    } finally {
      setIsLoading(false);
    }
  }, [sessionRepo.delete]);

  const updateSession = useCallback(async (id: string, updates: { name?: string; status?: SessionStatus }) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await sessionRepo.update(id, updates.name, updates.status);
      if (updated) {
        setSessions(prev => prev.map(s => 
          s.id === id 
            ? RestockSession.fromValue({
                ...s.toValue(),
                name: updates.name || s.name,
                status: updates.status || s.status,
                updatedAt: new Date()
              })
            : s
        ));
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to update session:', err);
      setError('Failed to update session');
      return { success: false, error: 'Failed to update session' };
    } finally {
      setIsLoading(false);
    }
  }, [sessionRepo.update]);

  // Modal control methods
  const openSelectionModal = useCallback(() => setShowSelectionModal(true), []);
  const hideSelectionModal = useCallback(() => setShowSelectionModal(false), []);

  // Load sessions when auth is ready
  useEffect(() => {
    if (authRef.current && userId) {
      loadSessions();
    }
  }, [userId, loadSessions]);

  return {
    // State
    sessions,
    isLoading: isLoading || repoLoading,
    error,
    isAuthenticated,
    showSelectionModal,
    
    // Actions
    loadSessions,
    createNewSession,
    deleteSession,
    updateSession,
    openSelectionModal,
    hideSelectionModal
  };
}

// Types
interface SessionListState {
  sessions: RestockSession[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  showSelectionModal: boolean;
}

interface SessionListActions {
  loadSessions: () => Promise<void>;
  createNewSession: (name?: string) => Promise<{ success: boolean; session?: RestockSession; error?: string }>;
  deleteSession: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateSession: (id: string, updates: { name?: string; status?: SessionStatus }) => Promise<{ success: boolean; error?: string }>;
  openSelectionModal: () => void;
  hideSelectionModal: () => void;
}
