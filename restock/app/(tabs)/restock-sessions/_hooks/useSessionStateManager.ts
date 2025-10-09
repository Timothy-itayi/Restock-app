import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnifiedAuth } from '../../../../lib/auth/UnifiedAuthProvider';

import { RestockSession, SessionStatus } from '../../../../lib/domain/_entities/RestockSession';

import { RestockSessionDomainService } from '../../../../lib/domain/_services/RestockSessionDomainService';
import { useRepositories } from '../../../../lib/infrastructure/_supabase/SupabaseHooksProvider';
import { Logger } from '../_utils/logger';

interface SessionState {
  currentSession: RestockSession | null;
  allSessions: RestockSession[];
  isLoading: boolean;
  error: string | null;
}

interface SessionStateManager {
  state: SessionState;
  startNewSession: () => Promise<{ success: boolean; session?: RestockSession; error?: string }>;
  addItemToSession: (item: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  removeItemFromSession: (productId: string) => Promise<{ success: boolean; error?: string }>;
  updateItemInSession: (productId: string, updates: { quantity?: number; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  markSessionReadyForEmails: () => Promise<{ success: boolean; error?: string }>;
  markSessionCompleted: () => Promise<{ success: boolean; error?: string }>;
  loadSessions: () => Promise<void>;
  saveSessionLocally: () => Promise<void>;
  restoreSessionFromLocal: () => Promise<boolean>;
}

const SESSION_STORAGE_KEY = 'current_restock_session';
const SESSIONS_HISTORY_KEY = 'restock_sessions_history';

export function useSessionStateManager(): SessionStateManager {
  const { userId } = useUnifiedAuth();
  const { sessionRepository } = useRepositories();
  const [state, setState] = useState<SessionState>({
    currentSession: null,
    allSessions: [],
    isLoading: false,
    error: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Load sessions from both local storage and server
  const loadSessions = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First, try to restore from local storage
      const restored = await restoreSessionFromLocal();
      
      // Then load from server
      if (sessionRepository) {
        const sessions = await sessionRepository.findByUserId();
        
        if (sessions && sessions.length > 0) {
          setState(prev => ({
            ...prev,
            allSessions: [...sessions], // Convert readonly to mutable
            isLoading: false,
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

      // If we restored a local session, make sure it's current
      if (restored && stateRef.current.currentSession) {
        Logger.info('Restored local session', { 
          sessionId: stateRef.current.currentSession.id,
          productCount: stateRef.current.currentSession.items.length 
        });
      }

    } catch (error) {
      Logger.error('Failed to load sessions', error, { userId });
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load sessions' 
      }));
    }
  }, [userId, sessionRepository]);

  // Start a new session
  const startNewSession = useCallback(async () => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const newSession = RestockSessionDomainService.createSession({
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
      });

      setState(prev => ({ ...prev, currentSession: newSession }));
      
      // Save locally immediately
      await saveSessionLocally();
      
      Logger.info('Started new session', { 
        sessionId: newSession.id,
        userId 
      });

      return { success: true, session: newSession };
    } catch (error) {
      Logger.error('Failed to start new session', error, { userId });
      return { success: false, error: 'Failed to start new session' };
    }
  }, [userId]);

  // Add item to current session
  const addItemToSession = useCallback(async (item: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => {
    if (!state.currentSession) {
      return { success: false, error: 'No active session' };
    }

    try {
      // Use domain service to add item (this ensures products/suppliers exist)
      const result = RestockSessionDomainService.addItemToSession(
        state.currentSession,
        item,
        [], // We'll load existing products/suppliers when persisting
        []
      );

      // Update local state
      setState(prev => ({ 
        ...prev, 
        currentSession: result.session,
        error: null 
      }));

      // Save locally
      await saveSessionLocally();

      Logger.info('Added item to session', { 
        sessionId: result.session.id,
        productName: item.productName,
        quantity: item.quantity 
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      Logger.error('Failed to add item to session', error, { 
        sessionId: state.currentSession.id,
        item 
      });
      
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [state.currentSession]);

  // Remove item from current session
  const removeItemFromSession = useCallback(async (productId: string) => {
    if (!state.currentSession) {
      return { success: false, error: 'No active session' };
    }

    try {
      const updatedSession = RestockSessionDomainService.removeItemFromSession(
        state.currentSession,
        productId
      );

      setState(prev => ({ 
        ...prev, 
        currentSession: updatedSession,
        error: null 
      }));

      await saveSessionLocally();

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [state.currentSession]);

  // Update item in current session
  const updateItemInSession = useCallback(async (productId: string, updates: { quantity?: number; notes?: string }) => {
    if (!state.currentSession) {
      return { success: false, error: 'No active session' };
    }

    try {
      const updatedSession = RestockSessionDomainService.updateItemInSession(
        state.currentSession,
        productId,
        updates
      );

      setState(prev => ({ 
        ...prev, 
        currentSession: updatedSession,
        error: null 
      }));

      await saveSessionLocally();

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [state.currentSession]);

  // Mark session ready for emails
  const markSessionReadyForEmails = useCallback(async () => {
    if (!state.currentSession) {
      return { success: false, error: 'No active session' };
    }

    try {
      const updatedSession = RestockSessionDomainService.markSessionReadyForEmails(
        state.currentSession
      );

      setState(prev => ({ 
        ...prev, 
        currentSession: updatedSession,
        error: null 
      }));

      await saveSessionLocally();

      Logger.info('Session marked ready for emails', { 
        sessionId: updatedSession.id 
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark session ready';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [state.currentSession]);

  // Mark session completed
  const markSessionCompleted = useCallback(async () => {
    if (!state.currentSession) {
      return { success: false, error: 'No active session' };
    }

    try {
      const updatedSession = RestockSessionDomainService.markSessionCompleted(
        state.currentSession
      );

      // Move to history and clear current
      setState(prev => ({ 
        ...prev, 
        currentSession: null,
        allSessions: [...prev.allSessions, updatedSession],
        error: null 
      }));

      // Clear local storage
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);

      Logger.info('Session marked as completed', { 
        sessionId: updatedSession.id 
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark session completed';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [state.currentSession]);

  // Save current session to local storage
  const saveSessionLocally = useCallback(async () => {
    if (!state.currentSession) return;

    try {
      const sessionData = {
        session: state.currentSession.toValue(),
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      
      Logger.debug('Session saved locally', { 
        sessionId: state.currentSession.id 
      });
    } catch (error) {
      Logger.error('Failed to save session locally', error, { 
        sessionId: state.currentSession.id 
      });
    }
  }, [state.currentSession]);

  // Restore session from local storage
  const restoreSessionFromLocal = useCallback(async (): Promise<boolean> => {
    try {
      const sessionDataString = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionDataString) return false;

      const sessionData = JSON.parse(sessionDataString);
      const session = RestockSession.fromValue(sessionData.session);

      // Only restore if session is still editable
      if (session.canAddItems()) {
        setState(prev => ({ ...prev, currentSession: session }));
        Logger.info('Restored session from local storage', { 
          sessionId: session.id,
          productCount: session.items.length 
        });
        return true;
      } else {
        // Session is completed, remove from local storage
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        Logger.info('Removed completed session from local storage', { 
          sessionId: session.id 
        });
        return false;
      }
    } catch (error) {
      Logger.error('Failed to restore session from local storage', error);
      // Clear corrupted data
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      return false;
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    state,
    startNewSession,
    addItemToSession,
    removeItemFromSession,
    updateItemInSession,
    markSessionReadyForEmails,
    markSessionCompleted,
    loadSessions,
    saveSessionLocally,
    restoreSessionFromLocal,
  };
}
