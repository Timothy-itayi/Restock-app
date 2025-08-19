/**
 * RESTOCK SESSION HOOK - CLEAN VERSION
 * 
 * Focused hook for managing a single restock session
 * Uses repository pattern for all data operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSessionRepository } from '../../../infrastructure/repositories/SupabaseHooksProvider';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';

export interface RestockSessionState {
  session: RestockSession | null;
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
}

export interface RestockSessionActions {
  createSession: (name?: string) => Promise<{ success: boolean; session?: RestockSession; error?: string }>;
  loadSession: (sessionId: string) => Promise<void>;
  addProduct: (params: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  removeProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  updateSessionName: (sessionId: string, name: string) => Promise<{ success: boolean; error?: string }>;
  clearSession: () => void;
  setError: (error: string | null) => void;
}

export interface SessionProduct {
  id: string;
  name: string;
  quantity: number;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  notes?: string;
}

/**
 * Hook for managing a single restock session
 */
export function useRestockSession(sessionId?: string): RestockSessionState & RestockSessionActions {
  const { userId } = useAuth();
  const sessionRepository = useSessionRepository();

  // State
  const [session, setSession] = useState<RestockSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new session
   */
  const createSession = useCallback(async (name?: string) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useRestockSession] Creating session:', { userId, name });
      
      const sessionName = name || `Restock Session ${new Date().toLocaleDateString()}`;
      const sessionId = await sessionRepository.create({
        userId,
        name: sessionName,
        status: SessionStatus.DRAFT,
        items: [],
        createdAt: new Date(),
      } as any);
      
      // Load the created session
      const newSession = await sessionRepository.findById(sessionId);
      if (newSession) {
        setSession(newSession);
        console.log('[useRestockSession] Session created:', sessionId);
        return { success: true, session: newSession };
      } else {
        throw new Error('Failed to load created session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useRestockSession] Error creating session:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [userId, sessionRepository]);

  /**
   * Load an existing session
   */
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useRestockSession] Loading session:', sessionId);
      
      const session = await sessionRepository.findById(sessionId);
      
      if (session) {
        setSession(session);
        console.log('[useRestockSession] Session loaded:', sessionId);
      } else {
        setError('Session not found');
        setSession(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
      console.error('[useRestockSession] Error loading session:', err);
      setError(errorMessage);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [sessionRepository]);

  /**
   * Add a product to the current session
   */
  const addProduct = useCallback(async (params: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => {
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useRestockSession] Adding product to session:', {
        sessionId: session.id,
        productName: params.productName,
      });
      
      const item = {
        productName: params.productName,
        quantity: params.quantity,
        supplierName: params.supplierName,
        supplierEmail: params.supplierEmail,
        notes: params.notes,
      };
      
      await sessionRepository.addItem(session.id, item);
      
      // Reload session to get updated data
      const updatedSession = await sessionRepository.findById(session.id);
      if (updatedSession) {
        setSession(updatedSession);
        console.log('[useRestockSession] Product added successfully');
        return { success: true };
      } else {
        throw new Error('Failed to reload session after adding product');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useRestockSession] Error adding product:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionRepository]);

  /**
   * Remove a product from the current session
   */
  const removeProduct = useCallback(async (productId: string) => {
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useRestockSession] Removing product:', { productId, sessionId: session.id });
      
      await sessionRepository.removeItem(session.id, productId);
      
      // Reload session to get updated data
      const updatedSession = await sessionRepository.findById(session.id);
      if (updatedSession) {
        setSession(updatedSession);
        console.log('[useRestockSession] Product removed successfully');
        return { success: true };
      } else {
        throw new Error('Failed to reload session after removing product');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useRestockSession] Error removing product:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionRepository]);

  /**
   * Update session name
   */
  const updateSessionName = useCallback(async (sessionId: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useRestockSession] Updating session name:', { sessionId, name });
      
      await sessionRepository.updateName(sessionId, name);
      
      // Update local session state
      if (session && session.id === sessionId) {
        const updatedSession = await sessionRepository.findById(sessionId);
        if (updatedSession) {
          setSession(updatedSession);
          console.log('[useRestockSession] Session name updated successfully:', name);
          return { success: true };
        }
      }
      
      return { success: false, error: 'Session not found' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session name';
      console.error('[useRestockSession] Error updating session name:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionRepository]);

  /**
   * Clear the current session
   */
  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  /**
   * Set error message
   */
  const setErrorMessage = useCallback((error: string | null) => {
    setError(error);
  }, []);

  // Load session on mount if sessionId provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Calculate derived state
  const isActive = session !== null;

  return {
    // State
    session,
    isLoading,
    error,
    isActive,
    
    // Actions
    createSession,
    loadSession,
    addProduct,
    removeProduct,
    updateSessionName,
    clearSession,
    setError: setErrorMessage
  };
}

/**
 * Helper function to extract session products in a UI-friendly format
 */
export function getSessionProducts(session: RestockSession | null): SessionProduct[] {
  if (!session) return [];
  
  return session.items.map((item: any) => ({
    id: item.productId,
    name: item.productName,
    quantity: item.quantity,
    supplierId: item.supplierId,
    supplierName: item.supplierName,
    supplierEmail: item.supplierEmail,
    notes: item.notes
  }));
}

/**
 * Helper function to get session summary information
 */
export function getSessionSummary(session: RestockSession | null): {
  totalProducts: number;
  totalQuantity: number;
  supplierCount: number;
  sessionName: string;
  sessionId: string;
} {
  if (!session) {
    return {
      totalProducts: 0,
      totalQuantity: 0,
      supplierCount: 0,
      sessionName: '',
      sessionId: ''
    };
  }
  
  const products = session.items;
  const uniqueSuppliers = new Set(products.map((item: any) => item.supplierId));
  const totalQuantity = products.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  return {
    totalProducts: products.length,
    totalQuantity,
    supplierCount: uniqueSuppliers.size,
    sessionName: session.name || 'Unnamed Session',
    sessionId: session.id
  };
}
