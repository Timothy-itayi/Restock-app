import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from "@clerk/clerk-expo";
import { SessionService } from "../../../../backend/services/sessions";
import { RestockSession, Product } from '../utils/types';
import { Logger } from '../utils/logger';

export const useRestockSessions = () => {
  const { userId } = useAuth();
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
      console.log('[RestockSessions] Loading unfinished sessions from database', { userId });
      Logger.info('Loading unfinished sessions', { userId });
      
      // Get unfinished sessions (draft status) with their items
      const sessionsResult = await SessionService.getUnfinishedSessions(userId);
      
      if (sessionsResult.error) {
        Logger.error('Failed to load unfinished sessions', sessionsResult.error, { userId });
        return;
      }
      
      const unfinishedSessions = sessionsResult.data || [];
      
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
        const sessionsWithProducts = unfinishedSessions.map((session) => {
          // Convert items to Product format
          const products: Product[] = session.items?.map((item: any) => {
            const products = Array.isArray(item.products) ? item.products[0] : item.products;
            const suppliers = Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers;
            
            // Debug supplier data
            console.log('[RestockSessions] Processing item supplier data', {
              itemId: item.id,
              productName: products?.name,
              supplierName: suppliers?.name,
              supplierEmail: suppliers?.email,
              hasSupplierEmail: !!suppliers?.email,
              supplierData: suppliers
            });
            
            return {
              id: item.id,
              name: products?.name || 'Unknown Product',
              quantity: item.quantity || 0,
              supplierName: suppliers?.name || 'Unknown Supplier',
              supplierEmail: suppliers?.email || '',
            };
          }) || [];
          
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
            products,
            createdAt: new Date(session.createdAt),
            status: session.status as 'draft' | 'sent'
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
      }
    } catch (error) {
      console.log('[RestockSessions] Error loading sessions', error);
      Logger.error('Unexpected error loading sessions', error, { userId });
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId]);

  const startNewSession = useCallback(async () => {
    console.log('[RestockSessions] startNewSession called', { userId, hasUserId: !!userId });
    Logger.info('Starting new restock session');
    
    if (!userId) {
      console.log('[RestockSessions] Cannot start session: no userId');
      Logger.error('Cannot start session: no userId');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      console.log('[RestockSessions] Creating session in database', { userId });
      // Create session in database first
      const sessionResult = await SessionService.createSession({
        user_id: userId,
        status: 'draft'
      });
      
      console.log('[RestockSessions] Session creation result', { 
        hasError: !!sessionResult.error, 
        error: sessionResult.error,
        data: sessionResult.data 
      });
      
      if (sessionResult.error) {
        console.log('[RestockSessions] Failed to create session in database', sessionResult.error);
        Logger.error('Failed to create session in database', sessionResult.error, { userId });
        return { success: false, error: 'Failed to start session' };
      }
      
      const newSession: RestockSession = {
        id: sessionResult.data.id,
        products: [],
        createdAt: new Date(sessionResult.data.created_at),
        status: sessionResult.data.status as 'draft' | 'sent'
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
      
      Logger.success('New session created in database', { 
        sessionId: newSession.id,
        databaseId: sessionResult.data.id 
      });

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
                const deleteResult = await SessionService.deleteSession(session.id);
                
                if (deleteResult.error) {
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
    showSessionSelectionModal,
    hideSessionSelectionModal,
    updateCurrentSession,
    
    // Setters for direct state updates
    setCurrentSession,
    setIsSessionActive,
    setAllSessions
  };
};