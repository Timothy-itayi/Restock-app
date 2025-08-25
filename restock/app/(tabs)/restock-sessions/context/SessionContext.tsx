import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';
import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';

interface SessionContextState {
  currentSession: RestockSession | null;
  isSessionActive: boolean;
  isSessionLoading: boolean;
  isInitializing: boolean;

  isStartingNewSession: boolean;
  isAddingProducts: boolean;
  isFinishingSession: boolean;

  startNewSession: (name: string) => Promise<{ success: boolean; error?: string }>;
  loadExistingSession: (sessionId: string) => Promise<void>;
  clearCurrentSession: () => void;
  setSessionWorkflowState: (state: 'starting' | 'adding' | 'finishing') => void;

  sessionName: string;
  sessionId: string | null;
}

const SessionContext = createContext<SessionContextState | null>(null);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSessionContext must be used within SessionProvider');
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  console.log('🚀 SessionProvider: Initializing...');

  const { userId } = useUnifiedAuth();
  const { sessionRepository, isSupabaseReady } = useRepositories();

  const [currentSession, setCurrentSession] = useState<RestockSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [workflowState, setWorkflowState] = useState<'idle' | 'starting' | 'adding' | 'finishing'>('idle');

  // Computed states
  const isSessionActive = !!currentSession;
  const isStartingNewSession = workflowState === 'starting';
  const isAddingProducts = workflowState === 'adding';
  const isFinishingSession = workflowState === 'finishing';
  const sessionName = currentSession?.toValue().name || '';
  const sessionId = currentSession?.toValue().id || null;

  // Log context updates
  useEffect(() => {
    console.log('🔄 SessionContext State Update', {
      userId,
      isSupabaseReady,
      hasRepository: !!sessionRepository,
      currentSession: currentSession?.toValue(),
      workflowState,
      isSessionActive,
      isStartingNewSession,
      isAddingProducts,
      isFinishingSession,
      isSessionLoading,
      isInitializing,
    });
  }, [currentSession, workflowState, isSessionLoading, isInitializing, userId, isSupabaseReady, sessionRepository]);

  // Initialize: Load existing unfinished session if available
  useEffect(() => {
    const init = async () => {
      if (!userId || !isSupabaseReady || !sessionRepository) {
        console.log('🚫 SessionContext: Initialization skipped - missing dependencies', { userId, isSupabaseReady, hasRepository: !!sessionRepository });
        setIsInitializing(false);
        return;
      }

      try {
        console.log('🔄 SessionContext: Checking for unfinished sessions...');
        setIsSessionLoading(true);
        const unfinishedSessions = await sessionRepository.findUnfinishedByUserId();
        const activeSession = unfinishedSessions.find(
          s => s.toValue().status === SessionStatus.DRAFT || s.toValue().status === SessionStatus.EMAIL_GENERATED
        );

        if (activeSession) {
          setCurrentSession(activeSession);
          setWorkflowState('adding');
          console.log('✅ SessionContext: Loaded active session', activeSession.toValue());
        } else {
          console.log('ℹ️ SessionContext: No active session found, ready to start new.');
        }
      } catch (err) {
        console.error('❌ SessionContext: Failed to load existing sessions', err);
      } finally {
        setIsSessionLoading(false);
        setIsInitializing(false);
      }
    };

    init();
  }, [userId, isSupabaseReady, sessionRepository]);

  // Start a new session
  const startNewSession = useCallback(
    async (name: string) => {
      console.log('🔄 SessionContext: Starting new session with name:', name);
      if (!userId || !isSupabaseReady || !sessionRepository) {
        const errorMsg = 'System not ready to start session';
        console.warn('❌', errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        setWorkflowState('starting');
        setIsSessionLoading(true);

        const newSession = RestockSession.create({
          id: `temp_${Date.now()}`,
          userId,
          name: name.trim() || `Restock Session ${new Date().toLocaleDateString()}`,
        });

        const createdId = await sessionRepository.create(newSession);
        if (!createdId) throw new Error('Failed to create session');

        const finalSession = RestockSession.create({ ...newSession.toValue(), id: createdId });
        setCurrentSession(finalSession);
        setWorkflowState('adding');
        console.log('✅ SessionContext: New session started', finalSession.toValue());

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ SessionContext: Failed to start session', message);
        setWorkflowState('idle');
        return { success: false, error: message };
      } finally {
        setIsSessionLoading(false);
      }
    },
    [userId, isSupabaseReady, sessionRepository]
  );

  // Load existing session by ID
  const loadExistingSession = useCallback(
    async (sessionId: string) => {
      console.log('🔄 SessionContext: Loading session by ID:', sessionId);
      if (!isSupabaseReady || !sessionRepository) return;

      try {
        setIsSessionLoading(true);
        const session = await sessionRepository.findById(sessionId);
        if (session) {
          setCurrentSession(session);
          setWorkflowState('adding');
          console.log('✅ SessionContext: Loaded session by ID', session.toValue());
        } else {
          console.warn('⚠️ SessionContext: Session not found:', sessionId);
        }
      } catch (err) {
        console.error('❌ SessionContext: Error loading session by ID', err);
      } finally {
        setIsSessionLoading(false);
      }
    },
    [isSupabaseReady, sessionRepository]
  );

  // Clear session
  const clearCurrentSession = useCallback(() => {
    console.log('🔄 SessionContext: Clearing session');
    setCurrentSession(null);
    setWorkflowState('idle');
    console.log('✅ SessionContext: Session cleared');
  }, []);

  // Change workflow state manually
  const setSessionWorkflowState = useCallback((state: 'starting' | 'adding' | 'finishing') => {
    console.log('🔄 SessionContext: Workflow state changing →', state);
    setWorkflowState(state);
  }, []);

  const contextValue: SessionContextState = {
    currentSession,
    isSessionActive,
    isSessionLoading,
    isInitializing,
    isStartingNewSession,
    isAddingProducts,
    isFinishingSession,
    startNewSession,
    loadExistingSession,
    clearCurrentSession,
    setSessionWorkflowState,
    sessionName,
    sessionId,
  };

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};
