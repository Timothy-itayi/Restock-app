import { useState, useCallback, useMemo } from 'react';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';
import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';
import { RestockSession } from '../../../domain/entities/RestockSession';

export const useRestockSession = () => {
  const { userId } = useUnifiedAuth();
  const { sessionRepository, isSupabaseReady } = useRepositories();
  
  const [session, setSession] = useState<RestockSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findSessionById = useCallback(async (id: string) => {
    if (!userId || !sessionRepository || !isSupabaseReady) return null;

    try {
      const sessionData = await sessionRepository.findById(id);
      return sessionData;
    } catch (err) {
      console.error('[useRestockSession] findSessionById error:', err);
      return null;
    }
  }, [userId, sessionRepository, isSupabaseReady]);

  const createSession = useCallback(async (name?: string) => {
    if (!userId || !sessionRepository || !isSupabaseReady) {
      return { success: false, error: 'User not authenticated or repository not ready' };
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const sessionName = name || `Restock Session ${new Date().toLocaleDateString()}`;
      
      // Create a temporary session entity to pass to the repository
      const tempSession = RestockSession.create({
        id: 'temp', // Will be replaced by the repository
        userId,
        name: sessionName
      });

      const sessionId = await sessionRepository.create(tempSession);

      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      // Create the final session entity with the real ID
      const newSession = RestockSession.create({
        id: sessionId,
        userId,
        name: sessionName
      });

      setSession(newSession);
      return { success: true, session: newSession };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] createSession error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [userId, sessionRepository, isSupabaseReady]);

  const loadSession = useCallback(async (id: string) => {
    if (!userId || !sessionRepository || !isSupabaseReady) {
      setError('User not authenticated or repository not ready');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const sessionData = await findSessionById(id);
      if (!sessionData) {
        setError('Session not found');
        setSession(null);
      } else {
        setSession(sessionData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] loadSession error:', err);
      setError(message);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, sessionRepository, isSupabaseReady, findSessionById]);

  const addProduct = useCallback(async (params: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => {
    if (!userId || !session || !sessionRepository || !isSupabaseReady) {
      return { success: false, error: 'No active session or user not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      await sessionRepository.addItem(session.id, {
        productName: params.productName,
        quantity: params.quantity,
        supplierName: params.supplierName,
        supplierEmail: params.supplierEmail,
        notes: params.notes
      });

      // Reload the session to get updated data
      const updatedSession = await findSessionById(session.id);
      if (updatedSession) {
        setSession(updatedSession);
        return { success: true };
      } else {
        throw new Error('Failed to reload session after adding product');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] addProduct error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [userId, session, sessionRepository, isSupabaseReady, findSessionById]);

  const removeProduct = useCallback(async (itemId: string) => {
    if (!userId || !session || !sessionRepository || !isSupabaseReady) {
      return { success: false, error: 'No active session or user not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      await sessionRepository.removeItem(itemId);
      
      // Reload the session to get updated data
      const updatedSession = await findSessionById(session.id);
      if (updatedSession) {
        setSession(updatedSession);
        return { success: true };
      } else {
        throw new Error('Failed to reload session after removing product');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] removeProduct error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [userId, session, sessionRepository, isSupabaseReady, findSessionById]);

  const updateSessionName = useCallback(async (id: string, name: string) => {
    if (!userId || !sessionRepository || !isSupabaseReady) {
      return { success: false, error: 'User not authenticated or repository not ready' };
    }

    setIsLoading(true);
    setError(null);

    try {
      await sessionRepository.updateName(id, name);
      
      // Reload the session to get updated data
      const updatedSession = await findSessionById(id);
      if (updatedSession) {
        setSession(updatedSession);
        return { success: true };
      } else {
        throw new Error('Failed to reload session after updating name');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] updateSessionName error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [userId, sessionRepository, isSupabaseReady, findSessionById]);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  // Memoize the returned object to prevent recreation on every render
  return useMemo(() => ({
    session,
    isLoading,
    error,
    isActive: session !== null,
    createSession,
    loadSession,
    addProduct,
    removeProduct,
    updateSessionName,
    clearSession,
    setError
  }), [
    session,
    isLoading,
    error,
    createSession,
    loadSession,
    addProduct,
    removeProduct,
    updateSessionName,
    clearSession,
    setError
  ]);
};
