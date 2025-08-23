import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUnifiedAuthState } from '../../../auth';
import { useSupabaseRepository } from '../../../hooks/useSupabaseRepository';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';

export const useRestockSession = () => {
  const { userId } = useUnifiedAuthState();
  
  // Safe auth handling to prevent hydration errors

  const { sessions, items, isLoading: repoLoading, isAuthenticated } = useSupabaseRepository();
  
  // Stable references to prevent callback recreation
  const authRef = useRef(userId);
  const sessionsRef = useRef(sessions);
  const itemsRef = useRef(items);
  const repoLoadingRef = useRef(repoLoading);
  const isAuthenticatedRef = useRef(isAuthenticated);
  
  // Update refs when dependencies change
  useEffect(() => {
    authRef.current = userId;
    sessionsRef.current = sessions;
    itemsRef.current = items;
    repoLoadingRef.current = repoLoading;
    isAuthenticatedRef.current = isAuthenticated;
  }, [userId, sessions, items, repoLoading, isAuthenticated]);

  const [session, setSession] = useState<RestockSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findSessionById = useCallback(async (id: string) => {
    if (!authRef.current) return null;

    try {
      const allSessions = await sessionsRef.current.getAll();
      const sessionData = Array.isArray(allSessions) ? allSessions.find((s: any) => s.id === id) : null;
      if (!sessionData) return null;

      const allItems = await itemsRef.current.getAll();
      const sessionItems = Array.isArray(allItems) ? allItems.filter((i: any) => i.session_id === id) : [];

      return RestockSession.fromValue({
        id: sessionData.id,
        userId: authRef.current || '',
        name: sessionData.name,
        status: sessionData.status as SessionStatus,
        createdAt: new Date(sessionData.created_at),
        items: sessionItems.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          supplierId: item.supplier_id,
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
  }, []); // Empty dependency array using refs

  const createSession = useCallback(async (name?: string) => {
    if (!authRef.current || repoLoadingRef.current || !isAuthenticatedRef.current) return { success: false, error: 'User not authenticated or repo loading' };
    setIsLoading(true);
    setError(null);

    try {
      const sessionName = name || `Restock Session ${new Date().toLocaleDateString()}`;
      const created = await sessionsRef.current.create(sessionName, SessionStatus.DRAFT);
      if (!created) throw new Error('Failed to create session');

      const newSession = RestockSession.fromValue({
        id: created.id,
        userId: authRef.current || '',
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
  }, []); // Empty dependency array using refs

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

  // Store session in ref for stable access
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  
  const addProduct = useCallback(async (params: { productName: string; quantity: number; supplierName: string; supplierEmail: string; notes?: string }) => {
    if (!authRef.current || !sessionRef.current) return { success: false, error: 'No active session or user not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      await itemsRef.current.create(sessionRef.current.id, params.productName, params.supplierName, params.supplierEmail, params.quantity, params.notes);
      const updated = await findSessionById(sessionRef.current.id);
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
  }, [findSessionById]); // Only findSessionById dependency

  const removeProduct = useCallback(async (productId: string) => {
    if (!authRef.current || !sessionRef.current) return { success: false, error: 'No active session or user not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      await itemsRef.current.delete(productId);
      const updated = await findSessionById(sessionRef.current.id);
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
  }, [findSessionById]); // Only findSessionById dependency

  const updateSessionName = useCallback(async (id: string, name: string) => {
    if (!authRef.current) return { success: false, error: 'User not authenticated' };
    setIsLoading(true);
    setError(null);

    try {
      await sessionsRef.current.update(id, name, undefined);
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
  }, [findSessionById]); // Only findSessionById dependency

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  useEffect(() => {
    // This effect is no longer needed as sessionId is removed from the hook signature
    // if (sessionId) loadSession(sessionId);
  }, [/* sessionId, */loadSession]);

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
}
