import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabaseRepository } from '../../../hooks/useSupabaseRepository';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';

export function useRestockSession(sessionId?: string) {
  const auth = useAuth();
  const userId = typeof auth.userId === 'string' ? auth.userId : undefined;

  const { sessions, items, isLoading: repoLoading, isAuthenticated } = useSupabaseRepository();

  const [session, setSession] = useState<RestockSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findSessionById = useCallback(async (id: string) => {
    if (!userId) return null;

    try {
      const allSessions = await sessions.getAll();
      const sessionData = allSessions?.find((s: any) => s.id === id);
      if (!sessionData) return null;

      const allItems = await items.getAll();
      const sessionItems = allItems?.filter((i: any) => i.session_id === id) || [];

      return RestockSession.fromValue({
        id: sessionData.id,
        userId,
        name: sessionData.name,
        status: sessionData.status as SessionStatus,
        createdAt: new Date(sessionData.created_at),
        items: sessionItems.map((item: any) => ({
          id: item.id,
          productName: item.product_name,
          supplierName: item.supplier_name,
          supplierEmail: item.supplier_email,
          quantity: item.quantity,
          notes: item.notes || ''
        }))
      });
    } catch (err) {
      console.error('[useRestockSession] findSessionById error:', err);
      return null;
    }
  }, [sessions, items, userId]);

  const createSession = useCallback(async (name?: string) => {
    if (!userId || repoLoading || !isAuthenticated) return { success: false, error: 'User not authenticated or repo loading' };
    setIsLoading(true);
    setError(null);

    try {
      const sessionName = name || `Restock Session ${new Date().toLocaleDateString()}`;
      const created = await sessions.create(sessionName, SessionStatus.DRAFT);
      if (!created) throw new Error('Failed to create session');

      const newSession = RestockSession.fromValue({
        id: created.id,
        userId,
        name: created.name,
        status: created.status as SessionStatus,
        createdAt: new Date(created.created_at),
        items: []
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
  }, [userId, sessions, repoLoading, isAuthenticated]);

  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const s = await findSessionById(id);
      if (!s) {
        setError('Session not found');
        setSession(null);
      } else setSession(s);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] loadSession error:', err);
      setError(message);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [findSessionById]);

  const addProduct = useCallback(async (params: { productName: string; quantity: number; supplierName: string; supplierEmail: string; notes?: string }) => {
    if (!userId || !session) return { success: false, error: 'No active session or user not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      await items.create(session.id, params.productName, params.supplierName, params.supplierEmail, params.quantity, params.notes);
      const updated = await findSessionById(session.id);
      if (updated) setSession(updated);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] addProduct error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [session, items, findSessionById, userId]);

  const removeProduct = useCallback(async (productId: string) => {
    if (!userId || !session) return { success: false, error: 'No active session or user not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      await items.delete(productId);
      const updated = await findSessionById(session.id);
      if (updated) setSession(updated);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] removeProduct error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [session, items, findSessionById, userId]);

  const updateSessionName = useCallback(async (id: string, name: string) => {
    if (!userId) return { success: false, error: 'User not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      await sessions.update(id, name, undefined);
      const updated = await findSessionById(id);
      if (updated) setSession(updated);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useRestockSession] updateSessionName error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [sessions, findSessionById, userId]);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (sessionId) loadSession(sessionId);
  }, [sessionId, loadSession]);

  return {
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
  };
}
