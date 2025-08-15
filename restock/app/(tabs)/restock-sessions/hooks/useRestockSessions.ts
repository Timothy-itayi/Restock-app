import { useState, useCallback, useEffect } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "@clerk/clerk-expo";
import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from '../../../infrastructure/convex/ConvexHooksProvider';
import { RestockSession, Product } from '../utils/types';
import { Logger } from '../utils/logger';




export const useRestockSessions = () => {
  const { userId } = useAuth();
  const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus } = useSessionRepository();
  const [allSessions, setAllSessions] = useState<RestockSession[]>([]);
  const [currentSession, setCurrentSession] = useState<RestockSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showSessionSelection, setShowSessionSelection] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);


  
  const loadAllSessions = useCallback(async () => {
    console.log('[RestockSessions] loadAllSessions called', { userId, hasUserId: !!userId });
    if (!userId) return;
    
    setIsLoadingSessions(true);
    try {
      Logger.info('Loading unfinished sessions via application service', { userId });
      const sessionsResult = await findByUserId({ userId, includeCompleted: true });
      let unfinishedSessions: any[] = [];
      if (sessionsResult.success && sessionsResult.sessions) {
        const { draft, emailGenerated } = sessionsResult.sessions;
        unfinishedSessions = [...draft, ...emailGenerated];
      }
      
      console.log('[RestockSessions] Unfinished sessions found', { 
        totalSessions: unfinishedSessions.length,
        sessions: unfinishedSessions.map(s => ({ 
          id: s.id, 
          status: s.status,
          totalItems: s.totalItems,
          totalQuantity: s.totalQuantity,
          uniqueSuppliers: s.uniqueSuppliers,
          uniqueProducts: s.uniqueProducts
        }))
      });
      
      if (unfinishedSessions.length > 0) {
        console.log('[RestockSessions] Processing unfinished sessions', { sessionCount: unfinishedSessions.length });
        Logger.info('Found unfinished sessions', { sessionCount: unfinishedSessions.length });
        
        // Convert the processed sessions to our local format
        const sessionsWithProducts: RestockSession[] = unfinishedSessions.map((session: any) => {
          // Convert items to Product format
          const products: Product[] = (session.items || []).map((item: any) => ({
            id: item.productId,
            name: item.productName || 'Unknown Product',
            quantity: item.quantity || 0,
            supplierName: item.supplierName || 'Unknown Supplier',
            supplierEmail: item.supplierEmail || '',
          }));
          
          // Log products with supplier emails for debugging
          const productsWithoutEmails = products.filter(p => !p.supplierEmail || p.supplierEmail.trim() === '');
          if (productsWithoutEmails.length > 0) {
            console.log('[RestockSessions] Found products without supplier emails', {
              sessionId: session.id,
              count: productsWithoutEmails.length,
              products: productsWithoutEmails.map(p => ({ name: p.name, supplierName: p.supplierName }))
            });
          }
          
          return {
            id: session.id,
            name: session.name || undefined,
            products,
            createdAt: new Date(session.createdAt),
            status: (session.status === 'sent' ? 'sent' : 'draft') as 'draft' | 'sent',
          };
        });
        
        console.log('[RestockSessions] Sessions with products processed', { 
          validSessions: sessionsWithProducts.length,
          sessions: sessionsWithProducts.map(s => ({ 
            id: s.id, 
            productCount: s.products.length,
            createdAt: s.createdAt 
          }))
        });
        
       setAllSessions(sessionsWithProducts);

       // If the current session is no longer in unfinished (moved to sent), clear it
       setCurrentSession(prev => {
         if (prev && !sessionsWithProducts.find(s => s.id === prev.id)) {
           setIsSessionActive(false);
           return null;
         }
         return prev;
       });
        
        // If there's only one session, automatically select it
        if (sessionsWithProducts.length === 1) {
          console.log('[RestockSessions] Auto-selecting single session', { sessionId: sessionsWithProducts[0].id });
          setCurrentSession(sessionsWithProducts[0]);
          setIsSessionActive(true);
          Logger.success('Single session auto-selected', { 
            sessionId: sessionsWithProducts[0].id, 
            productCount: sessionsWithProducts[0].products.length 
          });
        } else if (sessionsWithProducts.length > 1) {
          // Show session selection if multiple sessions exist
          console.log('[RestockSessions] Multiple sessions found, showing selection', { sessionCount: sessionsWithProducts.length });
          setShowSessionSelection(true);
          Logger.info('Multiple sessions found, showing selection', { sessionCount: sessionsWithProducts.length });
        }
        
        console.log('[RestockSessions] All sessions loaded successfully', { totalSessions: sessionsWithProducts.length });
        Logger.success('All sessions loaded', { 
          totalSessions: sessionsWithProducts.length 
        });
      } else {
        console.log('[RestockSessions] No unfinished sessions found', { userId });
        Logger.info('No unfinished sessions found', { userId });
       setAllSessions([]);
       // No unfinished sessions; clear any active session
       setCurrentSession(null);
       setIsSessionActive(false);
      }
    } catch (error) {
      console.log('[RestockSessions] Error loading sessions', error);
      Logger.error('Unexpected error loading sessions', error, { userId });
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId]);

  // Listen for session completion events triggered by Emails tab
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('restock:sessionSent', () => {
      // Reload sessions from DB; this will also clear current session if needed
      loadAllSessions();
    });
    return () => sub.remove();
  }, [loadAllSessions]);

  const startNewSession = useCallback(async () => {
    console.log('[RestockSessions] startNewSession called', { userId, hasUserId: !!userId });
      Logger.info('Starting new restock session');
    
    if (!userId) {
      console.log('[RestockSessions] Cannot start session: no userId');
      Logger.error('Cannot start session: no userId');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      console.log('[RestockSessions] Creating session via application service', { userId });
      const sessionResult = await create({ userId });
      
      console.log('[RestockSessions] Session creation result', { 
        hasError: !!sessionResult.error, 
        error: sessionResult.error,
        data: sessionResult.session 
      });
      
      if (!sessionResult.success || !sessionResult.session) {
        console.log('[RestockSessions] Failed to create session in database', sessionResult.error);
        Logger.error('Failed to create session in database', sessionResult.error, { userId });
        return { success: false, error: 'Failed to start session' };
      }
      
      const newSession: RestockSession = {
        id: sessionResult.session.id,
        products: [],
        createdAt: new Date(sessionResult.session.createdAt),
        status: 'draft',
        name: sessionResult.session.name || undefined,
      };
      
      console.log('[RestockSessions] New session created', { 
        sessionId: newSession.id,
        createdAt: newSession.createdAt,
        status: newSession.status 
      });
      
      // Add to all sessions list
      setAllSessions(prev => {
        console.log('[RestockSessions] Updating allSessions', { 
          previousCount: prev.length,
          newCount: prev.length + 1 
        });
        return [newSession, ...prev];
      });
      setCurrentSession(newSession);
      setIsSessionActive(true);
      setShowSessionSelection(false);
      
      console.log('[RestockSessions] Session state updated', { 
        sessionId: newSession.id,
        isSessionActive: true,
        showSessionSelection: false 
      });
      
      Logger.success('New session created', { sessionId: newSession.id });

      return { success: true, session: newSession };
    } catch (error) {
      console.log('[RestockSessions] Unexpected error starting session', error);
      Logger.error('Unexpected error starting session', error, { userId });
      return { success: false, error: 'Failed to start session' };
    }
  }, [userId]);

  const selectSession = useCallback((session: RestockSession) => {
    Logger.info('Selecting session', { sessionId: session.id, productCount: session.products.length });
    
    setCurrentSession(session);
    setIsSessionActive(true);
    setShowSessionSelection(false);
    
    return { success: true, message: `Switched to session with ${session.products.length} products` };
  }, []);

  const setSessionName = useCallback(async (sessionId: string, name: string) => {
    try {
      Logger.info('Setting session name', { sessionId, name });
      const updateResult = await updateName(sessionId, name);
      if (!updateResult.success) throw new Error(updateResult.error || 'Failed to save session name');
      
      // Update local state
      setAllSessions(prev => prev.map(s => s.id === sessionId ? { ...s, name } : s));
      setCurrentSession(prev => prev && prev.id === sessionId ? { ...prev, name } as RestockSession : prev);
      
      // Persist locally for offline access
      const storageKey = `sessionName:${sessionId}`;
      await AsyncStorage.setItem(storageKey, name);
      
      Logger.success('Session name updated successfully', { sessionId, name });
    } catch (error) {
      Logger.error('Failed to set session name', error, { sessionId, name });
      // Don't update local state if database update failed
      throw error;
    }
  }, []);

  const deleteSession = useCallback(async (session: RestockSession) => {
    Logger.info('Deleting session', { sessionId: session.id });
    
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      Alert.alert(
        "Delete Session",
        `Are you sure you want to delete this session? This will remove all ${session.products.length} products.`,
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve({ success: false }) },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const deleteResult = await app.deleteSession(session.id);
                if (!deleteResult.success) {
                  Logger.error('Failed to delete session', deleteResult.error, { sessionId: session.id });
                  resolve({ success: false, error: 'Failed to delete session' });
                  return;
                }
                
                // Remove from all sessions list
                setAllSessions(prev => prev.filter(s => s.id !== session.id));
                
                // If this was the current session, clear it
                if (currentSession?.id === session.id) {
                  setCurrentSession(null);
                  setIsSessionActive(false);
                }
                
                Logger.success('Session deleted successfully', { sessionId: session.id });
                resolve({ success: true });
              } catch (error) {
                Logger.error('Unexpected error deleting session', error, { sessionId: session.id });
                resolve({ success: false, error: 'Failed to delete session' });
              }
            }
          }
        ]
      );
    });
  }, [currentSession]);

  const showSessionSelectionModal = useCallback(() => {
    Logger.info('Showing session selection modal');
    setShowSessionSelection(true);
  }, []);

  const hideSessionSelectionModal = useCallback(() => {
    Logger.info('Hiding session selection modal');
    setShowSessionSelection(false);
  }, []);

  const updateCurrentSession = useCallback((session: RestockSession | null) => {
    setCurrentSession(session);
    if (session === null) {
      setIsSessionActive(false);
    }
  }, []);

  return {
    // State
    allSessions,
    currentSession,
    isSessionActive,
    showSessionSelection,
    isLoadingSessions,
    
    // Actions
    loadAllSessions,
    startNewSession,
    selectSession,
    deleteSession,
    setSessionName,
    showSessionSelectionModal,
    hideSessionSelectionModal,
    updateCurrentSession,
    
    // Setters for direct state updates
    setCurrentSession,
    setIsSessionActive,
    setAllSessions
  };
};