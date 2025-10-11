import { useState, useEffect, useCallback, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';
import { useRepositories } from '../../infrastructure/_supabase/SupabaseHooksProvider';
import { RestockSession, SessionStatus } from '../../domain/_entities/RestockSession';

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
  
  const { sessionRepository: sessionRepo, isSupabaseReady } = useRepositories();

  // Stable references to prevent callback recreation
  const authRef = useRef(userId);
  const repoRef = useRef(sessionRepo);

  // Update refs when dependencies change
  useEffect(() => {
    authRef.current = userId;
    repoRef.current = sessionRepo;
  }, [userId, sessionRepo]);

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
      console.log('[useSessionList] 🔍 Loading sessions:', {
        hasSessionRepo: !!sessionRepo,
        hasRepoRef: !!repoRef.current,
        sessionRepoType: sessionRepo?.constructor?.name,
        repoRefType: typeof repoRef.current,
        isSupabaseReady
      });

      if (!sessionRepo) {
        console.warn('[useSessionList] ⚠️ sessionRepo is null, repositories not ready');
        setSessions([]);
        return;
      }

      if (!repoRef.current) {
        console.warn('[useSessionList] ⚠️ repoRef.current is null, repositories not ready');
        setSessions([]);
        return;
      }

      const sessionData = await repoRef.current.findByUserId();

      console.log('[useSessionList] 📋 Session data received:', sessionData);

      if (Array.isArray(sessionData)) {
        const mappedSessions = sessionData.map((data: any) =>
          RestockSession.fromValue({
            id: data.id,
            userId: authRef.current || '',
            name: data.name,
            status: data.status as SessionStatus,
            items: [], // Initialize with empty items array
            createdAt: new Date(data.created_at)
          })
        );
        
        // 🔧 FIXED: Only show unfinished sessions (DRAFT or EMAIL_GENERATED)
        const unfinishedSessions = mappedSessions.filter((session: RestockSession) => {
          const status = session.toValue().status;
          return status === SessionStatus.DRAFT || status === SessionStatus.EMAIL_GENERATED;
        });
        
        setSessions(unfinishedSessions);
        console.log('✅ useSessionList: Loaded', unfinishedSessions.length, 'unfinished sessions');
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

      // Create session in repository - need to provide all required properties for the interface
      // The repository expects a data object, not a domain entity
      const sessionData = {
        userId: authRef.current,
        name: sessionName,
        status: SessionStatus.DRAFT,
        items: [],
        createdAt: new Date()
      } as any; // Type assertion to bypass the complex interface mismatch
      const created = await repoRef.current?.create(sessionData);
      if (!created) throw new Error('Failed to create session');

      const newSession = RestockSession.create({ id: created, userId: authRef.current, name: sessionName });
      setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);

      return { success: true, session: newSession };
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create session');
      
      // Remove temporary session on error
      setSessions(prev => prev.filter((s: RestockSession) => s.id !== 'temp'));
      
      return { success: false, error: 'Failed to create session' };
    } finally {
      setIsLoading(false);
    }
  }, []);



  const updateSession = useCallback(async (id: string, updates: { name?: string; status?: SessionStatus }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the correct methods from the new system
      if (updates.name) {
        await repoRef.current?.updateName(id, updates.name);
      }
      if (updates.status) {
        await repoRef.current?.updateStatus(id, updates.status);
      }
      
      // Update local state
      setSessions(prev => prev.map((s: RestockSession) => 
        s.id === id 
                      ? RestockSession.fromValue({
              ...s.toValue(),
              name: updates.name || s.name,
              status: updates.status || s.status
            })
          : s
      ));
      
      return { success: true };
    } catch (err) {
      console.error('Failed to update session:', err);
      setError('Failed to update session');
      return { success: false, error: 'Failed to update session' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Modal control methods
  const openSelectionModal = useCallback(() => setShowSelectionModal(true), []);
  const hideSelectionModal = useCallback(() => setShowSelectionModal(false), []);

  // Load sessions when auth is ready
  useEffect(() => {
    if (authRef.current && userId) {
      loadSessions();
    }
  }, [userId]);

    // 🔧 NEW: Listen for session events to keep state synchronized
  useEffect(() => {
    const handleSessionSent = (event: { sessionId: string }) => {
      console.log('🔄 useSessionList: Received session sent event for:', event.sessionId);
      // Remove the sent session from the local state immediately
      setSessions(prev => prev.filter((s: RestockSession) => s.toValue().id !== event.sessionId));
      // Reload sessions to ensure consistency
      setTimeout(() => loadSessions(), 100);
    };

    const handleSessionDeleted = (event: { sessionId: string }) => {
      console.log('🔄 useSessionList: Received session deleted event for:', event.sessionId);
      // Remove the deleted session from the local state immediately
      setSessions(prev => prev.filter((s: RestockSession) => s.toValue().id !== event.sessionId));
      console.log('✅ useSessionList: Session removed from local state');
    };

    const sentSubscription = DeviceEventEmitter.addListener('restock:sessionSent', handleSessionSent);
    const deletedSubscription = DeviceEventEmitter.addListener('restock:sessionDeleted', handleSessionDeleted);

    return () => {
      sentSubscription.remove();
      deletedSubscription.remove();
    };
  }, []);

  return {
    // State
    sessions,
    isLoading: isLoading || isSupabaseReady,
    error,
    isAuthenticated: !!userId, // Assuming isAuthenticated is derived from userId
    showSelectionModal,

    // Actions
    loadSessions,
    createNewSession,
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
  updateSession: (id: string, updates: { name?: string; status?: SessionStatus }) => Promise<{ success: boolean; error?: string }>;
  openSelectionModal: () => void;
  hideSelectionModal: () => void;
}
