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
import { DeviceEventEmitter } from 'react-native';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';
import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  // 🔧 NEW: Refresh sessions after email sent
  refreshSessionsAfterEmailSent: (sentSessionId: string) => Promise<void>;
  
  // 🔍 NEW: Add product functionality
  addProduct: (params: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  // 🔍 NEW: Edit and delete product functionality
  editProduct: (productId: string, updates: {
    productName?: string;
    quantity?: number;
    supplierName?: string;
    supplierEmail?: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  
  // 🔧 NEW: Email generation functionality
  generateEmails: (options?: {
    userStoreName?: string;
    userName?: string;
    userEmail?: string;
  }) => Promise<{ success: boolean; error?: string; emailDrafts?: any[] }>;
  
  // 🔧 NEW: Email data access
  generatedEmails: any[] | null;
  hasGeneratedEmails: boolean;
  
  // 🔧 NEW: Clear generated emails
  clearGeneratedEmails: () => void;
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
  const [generatedEmails, setGeneratedEmails] = useState<any[] | null>(null);

  const isSessionActive = !!currentSession;
  const isStartingNewSession = workflowState === 'starting';
  const isAddingProducts = workflowState === 'adding';
  const isFinishingSession = workflowState === 'finishing';
  const sessionName = currentSession?.toValue().name || '';
  const sessionId = currentSession?.toValue().id || null;
  const hasGeneratedEmails = !!generatedEmails && generatedEmails.length > 0;

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
        console.log('🔍 SessionContext: Session object type before setState:', typeof session);
        console.log('🔍 SessionContext: Session constructor:', session.constructor?.name);
        console.log('🔍 SessionContext: Session has findItemById:', typeof session.findItemById);
        console.log('🔍 SessionContext: Session methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(session)));
        
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
    setCurrentSession(null);
    setWorkflowState('idle');
    setPendingSessionId(null);
    // 🔧 FIXED: Clear generated emails when clearing session
    setGeneratedEmails(null);
    console.log('✅ SessionContext: Current session cleared');
  }, []);

  // 🔧 NEW: Clear generated emails method
  const clearGeneratedEmails = useCallback(() => {
    setGeneratedEmails(null);
    console.log('✅ SessionContext: Generated emails cleared');
  }, []);

  const setSessionWorkflowState = useCallback((state: 'starting' | 'adding' | 'finishing') => {
    console.log('🔄 SessionContext: Workflow state changing →', state);
    setWorkflowState(state);
  }, []);

  const loadAvailableSessions = useCallback(async () => {
    console.log('🔄 SessionContext: Loading available sessions...');
    if (!isSupabaseReady || !sessionRepository) {
      console.log('❌ SessionContext: Cannot load - not ready or no repository');
      return;
    }
    try {
      // 🔧 FIXED: Only load unfinished sessions (DRAFT or EMAIL_GENERATED)
      const allSessions = await sessionRepository.findByUserId();
      console.log('🔍 SessionContext: Found sessions from DB:', allSessions.length);
      allSessions.forEach(session => {
        console.log('🔍 SessionContext: Session', session.toValue().id, 'status:', session.toValue().status);
      });

      const unfinishedSessions = allSessions.filter(session => {
        const status = session.toValue().status;
        const isUnfinished = status === SessionStatus.DRAFT || status === SessionStatus.EMAIL_GENERATED;
        console.log('🔍 SessionContext: Session', session.toValue().id, 'status check:', status, 'is unfinished:', isUnfinished);
        return isUnfinished;
      });

      console.log('✅ SessionContext: Available unfinished sessions loaded', unfinishedSessions.length);
      setAvailableSessions([...unfinishedSessions]);
    } catch (err) {
      console.error('❌ SessionContext: Failed to load available sessions', err);
    }
  }, [isSupabaseReady, sessionRepository]);

  // 🔧 NEW: Method to refresh sessions when one is marked as sent
  const refreshSessionsAfterEmailSent = useCallback(async (sentSessionId: string) => {
    console.log('🔄 SessionContext: Refreshing sessions after email sent for:', sentSessionId);
    
    // Remove the sent session from available sessions
    setAvailableSessions(prev => prev.filter(s => s.toValue().id !== sentSessionId));
    
    // If this was the current session, clear it
    if (currentSession?.toValue().id === sentSessionId) {
      setCurrentSession(null);
      setWorkflowState('idle');
      console.log('✅ SessionContext: Current session cleared after email sent');
    }
    
    // Reload available sessions to ensure consistency
    await loadAvailableSessions();
  }, [currentSession, loadAvailableSessions]);

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

      // Capture current session state to avoid dependency issues
      const currentSessionId = currentSession?.toValue().id;
      const wasCurrentSession = currentSessionId === sessionId;

      console.log('🔍 SessionContext: Deleting session', sessionId, 'was current:', wasCurrentSession);

      await sessionRepository.delete(sessionId);
      console.log('✅ SessionContext: Session deleted from database', sessionId);

      // Update available sessions first
      setAvailableSessions(prev => {
        const filtered = prev.filter(s => s.toValue().id !== sessionId);
        console.log('✅ SessionContext: Available sessions updated, count:', filtered.length);
        return filtered;
      });

      // Clear current session if it was the deleted one
      if (wasCurrentSession) {
        console.log('🔄 SessionContext: Clearing current session (was deleted)');
        setCurrentSession(null);
        setWorkflowState('idle');
        setPendingSessionId(null);
        setGeneratedEmails(null); // Clear any generated emails too
      }

      // Emit event to notify other components about session deletion
      console.log('📢 SessionContext: Emitting session deleted event for:', sessionId);
      DeviceEventEmitter.emit('restock:sessionDeleted', { sessionId });

      return { success: true };
    } catch (err) {
      console.error('❌ SessionContext: Error deleting session', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsSessionLoading(false);
    }
  }, [isSupabaseReady, sessionRepository]);

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
      // Add the product to the session - remove loading state to speed up
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
    }
  }, [isSupabaseReady, sessionRepository, currentSession]);

  // 🔍 NEW: Edit product functionality
  const editProduct = useCallback(async (productId: string, updates: {
    productName?: string;
    quantity?: number;
    supplierName?: string;
    supplierEmail?: string;
    notes?: string;
  }) => {
    console.log('🔄 SessionContext: Editing product in session:', productId, updates);
    if (!isSupabaseReady || !sessionRepository) {
      return { success: false, error: 'System not ready to edit product' };
    }
    if (!currentSession) {
      return { success: false, error: 'No active session' };
    }
    
    try {
      setIsSessionLoading(true);
      
      // Update the restock item directly in the database
      await sessionRepository.updateRestockItem(productId, updates);
      
      // Update the product in the domain entity for local state only
      const updatedSession = currentSession.updateItem(productId, updates);
      
      // Update the current session state (no need to save to DB)
      setCurrentSession(updatedSession);
      
      console.log('✅ SessionContext: Product edited successfully');
      return { success: true };
    } catch (err) {
      console.error('❌ SessionContext: Error editing product', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsSessionLoading(false);
    }
  }, [isSupabaseReady, sessionRepository, currentSession]);
  // 🔍 NEW: Delete product functionality
  const deleteProduct = useCallback(async (productId: string) => {
    console.log('🗑️ SessionContext: Deleting product from session:', productId);
    if (!isSupabaseReady || !sessionRepository) {
      return { success: false, error: 'System not ready to delete product' };
    }
    if (!currentSession) {
      return { success: false, error: 'No active session' };
    }
    
    try {
      setIsSessionLoading(true);
      
      // Remove the item from the database
      await sessionRepository.removeItem(productId);
      
      // Update the domain entity
      const updatedSession = currentSession.removeItem(productId);
      
      // Update the current session state
      setCurrentSession(updatedSession);
      
      console.log('✅ SessionContext: Product deleted successfully');
      return { success: true };
    } catch (err) {
      console.error('❌ SessionContext: Error deleting product', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsSessionLoading(false);
    }
  }, [isSupabaseReady, sessionRepository, currentSession]);

  // 🔧 NEW: Email generation functionality
  const generateEmails = useCallback(async (options?: {
    userStoreName?: string;
    userName?: string;
    userEmail?: string;
  }) => {
    console.log('🔄 SessionContext: Generating emails...');
    if (!isSupabaseReady || !sessionRepository) {
      return { success: false, error: 'System not ready to generate emails' };
    }
    if (!currentSession) {
      return { success: false, error: 'No active session' };
    }

    try {
      setIsSessionLoading(true);
      
      // 🔧 FIXED: Generate actual email content from session data
      const sessionData = currentSession.toValue();
      const products = sessionData.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        supplierName: item.supplierName,
        supplierEmail: item.supplierEmail,
        notes: item.notes
      }));

      // Generate email drafts grouped by supplier
      const supplierGroups: { [key: string]: any[] } = {};
      products.forEach(product => {
        const supplierName = product.supplierName || 'Unknown Supplier';
        if (!supplierGroups[supplierName]) {
          supplierGroups[supplierName] = [];
        }
        supplierGroups[supplierName].push(product);
      });

      const emailDrafts = Object.entries(supplierGroups).map(([supplierName, supplierProducts], index) => {
        const productList = supplierProducts.map(p => `• ${p.quantity}x ${p.name}`).join('\n');
        const storeName = options?.userStoreName || 'Your Store';
        const userName = options?.userName || 'Store Manager';
        const userEmail = options?.userEmail || 'manager@store.com';
        
        return {
          id: `email-${index}`,
          supplierName,
          supplierEmail: supplierProducts[0].supplierEmail || 'supplier@example.com',
          subject: `Restock Order from ${storeName}`,
          body: `Hi ${supplierName} team,\n\nWe hope you're doing well! We'd like to place a restock order for the following items:\n\n${productList}\n\nPlease confirm availability at your earliest convenience.\n\nThank you as always for your continued support.\n\nBest regards,\n${userName}\n${storeName}\n${userEmail}`,
          status: 'draft' as const,
          products: supplierProducts.map(p => `${p.quantity}x ${p.name}`),
        };
      });

      // Save email data to AsyncStorage for the email screen
      const emailSessionData = {
        sessionId: sessionData.id,
        products,
        emails: emailDrafts,
        createdAt: sessionData.createdAt,
        editedEmails: emailDrafts // Start with generated emails as edited versions
      };

      await AsyncStorage.setItem('currentEmailSession', JSON.stringify(emailSessionData));
      console.log('✅ SessionContext: Email content generated and saved to AsyncStorage:', emailDrafts.length, 'emails');
      
      // 🔧 FIXED: Set generated emails in context state for other components to access
      setGeneratedEmails(emailDrafts);
      
      // Update session status in database
      await sessionRepository.updateStatus(sessionData.id, 'email_generated');
      
      // Create the updated session locally for context state
      const updatedSession = currentSession.generateEmails();
      
      // Update the current session in context
      setCurrentSession(updatedSession);
      
      console.log('✅ SessionContext: Emails generated successfully, session status updated to:', updatedSession.toValue().status);
      return { success: true, emailDrafts };
    } catch (err) {
      console.error('❌ SessionContext: Error generating emails', err);
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

  // 🔧 NEW: Listen for session sent events to update context state
  useEffect(() => {
    const handleSessionSent = (event: { sessionId: string }) => {
      console.log('🔄 SessionContext: Received session sent event for:', event.sessionId);
      refreshSessionsAfterEmailSent(event.sessionId);
    };

    const subscription = DeviceEventEmitter.addListener('restock:sessionSent', handleSessionSent);
    
    return () => subscription.remove();
  }, [refreshSessionsAfterEmailSent]);

  // --- Context Value ---
  const contextValue = useMemo<SessionContextState>(() => {
    // Debug: Check session object type when creating context value
    if (currentSession) {
      console.log('🔍 SessionContext: Context value - Session object type:', typeof currentSession);
      console.log('🔍 SessionContext: Context value - Session constructor:', currentSession.constructor?.name);
      console.log('🔍 SessionContext: Context value - Session has findItemById:', typeof currentSession.findItemById);
    }
    
    return {
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
      refreshSessionsAfterEmailSent,
      addProduct,
      editProduct,
      deleteProduct,
      generateEmails,
      generatedEmails,
      hasGeneratedEmails,
      clearGeneratedEmails,
    };
  }, [
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
    refreshSessionsAfterEmailSent,
    addProduct,
    editProduct,
    deleteProduct,
    generateEmails,
    generatedEmails,
    hasGeneratedEmails,
    clearGeneratedEmails,
  ]);

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};
