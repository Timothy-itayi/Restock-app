import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
  useRef,
} from 'react';
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
 
  isLoadingSpecificSession: boolean;
  pendingSessionId: string | null;
  isSupabaseReady: boolean;

  availableSessions: RestockSession[];
  isLoadingSessions: boolean;
  loadAvailableSessions: () => Promise<void>;
  switchToSession: (sessionId: string) => Promise<void>;

  deleteSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  
  // 🔍 NEW: Add product functionality
  addProduct: (params: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
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
  const [isLoadingSpecificSession, setIsLoadingSpecificSession] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [availableSessions, setAvailableSessions] = useState<RestockSession[]>([]);
  const [isLoadingSessions] = useState(false);

  const isSessionActive = !!currentSession;
  const isStartingNewSession = workflowState === 'starting';
  const isAddingProducts = workflowState === 'adding';
  const isFinishingSession = workflowState === 'finishing';
  const sessionName = currentSession?.toValue().name || '';
  const sessionId = currentSession?.toValue().id || null;

  // --- Callbacks ---
  const startNewSession = useCallback(async (name: string) => {
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
  }, [userId, isSupabaseReady, sessionRepository]);

  const loadExistingSession = useCallback(async (sessionId: string) => {
    console.log('🔄 SessionContext: Loading session by ID:', sessionId);
    if (!isSupabaseReady || !sessionRepository) {
      throw new Error('System not ready to load session');
    }

    try {
      setPendingSessionId(sessionId);
      setIsLoadingSpecificSession(true);
      setIsSessionLoading(true);

      console.log('🔍 SessionContext: Calling sessionRepository.findById with:', sessionId);
      const session = await sessionRepository.findById(sessionId);
      console.log('🔍 SessionContext: Repository returned:', session ? 'Session found' : 'Session not found');
      
      if (session) {
        setCurrentSession(session);
        setWorkflowState('adding');
        console.log('✅ SessionContext: Loaded specific session by ID', session.toValue());
      } else {
        const error = `Session not found: ${sessionId}`;
        console.warn('⚠️ SessionContext:', error);
        throw new Error(error);
      }
    } catch (err) {
      console.error('❌ SessionContext: Error loading session by ID', err);
      // Re-throw the error so the calling component can handle it
      throw err;
    } finally {
      setIsSessionLoading(false);
      setIsLoadingSpecificSession(false);
    }
  }, [isSupabaseReady, sessionRepository]);

  const clearCurrentSession = useCallback(() => {
    console.log('🔄 SessionContext: Clearing session');
    setCurrentSession(null);
    setWorkflowState('idle');
    setPendingSessionId(null);
    setIsLoadingSpecificSession(false);
    console.log('✅ SessionContext: Session cleared');
  }, []);

  const setSessionWorkflowState = useCallback((state: 'starting' | 'adding' | 'finishing') => {
    console.log('🔄 SessionContext: Workflow state changing →', state);
    setWorkflowState(state);
  }, []);

  const loadAvailableSessions = useCallback(async () => {
    console.log('🔄 SessionContext: Loading available sessions...');
    if (!isSupabaseReady || !sessionRepository) return;
    try {
      const sessions = await sessionRepository.findByUserId();
      setAvailableSessions([...sessions]);
      console.log('✅ SessionContext: Available sessions loaded', sessions.length);
    } catch (err) {
      console.error('❌ SessionContext: Failed to load available sessions', err);
    }
  }, [isSupabaseReady, sessionRepository]);

  const switchToSession = useCallback(async (sessionId: string) => {
    console.log('🔄 SessionContext: Switching to session:', sessionId);
    if (!isSupabaseReady || !sessionRepository) return;
    try {
      setPendingSessionId(null);
      setIsLoadingSpecificSession(false);

      const session = await sessionRepository.findById(sessionId);
      if (session) {
        setCurrentSession(session);
        setWorkflowState('adding');
        console.log('✅ SessionContext: Switched to session', session.toValue());
      } else {
        console.warn('⚠️ SessionContext: Session not found for switching:', sessionId);
      }
    } catch (err) {
      console.error('❌ SessionContext: Error switching session', err);
    }
  }, [isSupabaseReady, sessionRepository]);

  const deleteSession = useCallback(async (sessionId: string) => {
    console.log('🔄 SessionContext: Deleting session:', sessionId);
    if (!isSupabaseReady || !sessionRepository) {
      return { success: false, error: 'System not ready to delete session' };
    }
    try {
      setIsSessionLoading(true);
      await sessionRepository.delete(sessionId);
      console.log('✅ SessionContext: Session deleted', sessionId);
      setAvailableSessions(prev => prev.filter(s => s.toValue().id !== sessionId));
      if (currentSession?.toValue().id === sessionId) {
        setCurrentSession(null);
        setWorkflowState('idle');
        console.log('✅ SessionContext: Current session deleted, clearing state');
      }
      return { success: true };
    } catch (err) {
      console.error('❌ SessionContext: Error deleting session', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsSessionLoading(false);
    }
  }, [isSupabaseReady, sessionRepository, currentSession]);

  // 🔍 NEW: Add product functionality
  const addProduct = useCallback(async (params: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => {
    console.log('🔄 SessionContext: Adding product to session:', params);
    if (!isSupabaseReady || !sessionRepository) {
      return { success: false, error: 'System not ready to add product' };
    }
    if (!currentSession) {
      return { success: false, error: 'No active session' };
    }
    
    try {
      setIsSessionLoading(true);
      
      // Add the product to the session
      await sessionRepository.addItem(currentSession.toValue().id, {
        productId: `temp_${Date.now()}`,
        productName: params.productName,
        quantity: params.quantity,
        supplierId: `temp_${Date.now()}`,
        supplierName: params.supplierName,
        supplierEmail: params.supplierEmail,
        notes: params.notes
      });
      
      console.log('✅ SessionContext: Product added successfully');
      return { success: true };
    } catch (err) {
      console.error('❌ SessionContext: Error adding product', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsSessionLoading(false);
    }
  }, [isSupabaseReady, sessionRepository, currentSession]);

  // --- Initialization ---
  useEffect(() => {
    const init = async () => {
      if (!userId || !isSupabaseReady || !sessionRepository) {
        setIsInitializing(false);
        return;
      }
      if (pendingSessionId || currentSession || !isInitializing) return;

      try {
        setIsSessionLoading(true);
        const unfinishedSessions = await sessionRepository.findUnfinishedByUserId();
        const activeSession = unfinishedSessions.find(
          s => s.toValue().status === SessionStatus.DRAFT || s.toValue().status === SessionStatus.EMAIL_GENERATED
        );
        if (activeSession) {
          setCurrentSession(activeSession);
          setWorkflowState('adding');
          console.log('✅ SessionContext: Auto-loaded active session', activeSession.toValue());
        }
      } catch (err) {
        console.error('❌ SessionContext: Failed to load existing sessions', err);
      } finally {
        setIsSessionLoading(false);
        setIsInitializing(false);
      }
    };
    init();
  }, [userId, isSupabaseReady, sessionRepository, pendingSessionId, currentSession, isInitializing]);

  // --- Context Value ---
  const contextValue = useMemo<SessionContextState>(() => ({
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
    isLoadingSpecificSession,
    pendingSessionId,
    isSupabaseReady,
    availableSessions,
    isLoadingSessions,
    loadAvailableSessions,
    switchToSession,
    deleteSession,
    addProduct,
  }), [
    currentSession,
    isSessionActive,
    isSessionLoading,
    isInitializing,
    isStartingNewSession,
    isAddingProducts,
    isFinishingSession,
    sessionName,
    sessionId,
    isLoadingSpecificSession,
    pendingSessionId,
    isSupabaseReady,
    availableSessions,
    isLoadingSessions,
    startNewSession,
    loadExistingSession,
    clearCurrentSession,
    setSessionWorkflowState,
    loadAvailableSessions,
    switchToSession,
    deleteSession,
    addProduct,
  ]);

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};
