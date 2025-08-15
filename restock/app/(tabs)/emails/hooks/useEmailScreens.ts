import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { useUnifiedAuth } from '../../../_contexts/UnifiedAuthProvider';
import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from '../../../infrastructure/convex/ConvexHooksProvider';
import type { EmailDraft } from './useEmailSession';

export interface EmailSessionView {
  id: string;
  emails: EmailDraft[];
  totalProducts: number;
  createdAt: Date;
}

export function useEmailScreens() {
  const { userId, isAuthenticated } = useUnifiedAuth();
  const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus, markAsSent } = useSessionRepository();

  const [sessions, setSessions] = useState<EmailSessionView[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeSession = useMemo(() => sessions.find((s) => s.id === activeSessionId) || null, [activeSessionId, sessions]);

  const loadFromStorage = useCallback(async () => {
    const sessionDataString = await AsyncStorage.getItem('currentEmailSession');
    if (!sessionDataString) return [] as EmailSessionView[];
    try {
      const data = JSON.parse(sessionDataString);
      const emails: EmailDraft[] = Array.isArray(data.editedEmails) ? data.editedEmails : [];
      return [
        {
          id: data.sessionId,
          emails,
          totalProducts: data.products?.length || 0,
          createdAt: new Date(data.createdAt),
        },
      ];
    } catch {
      return [] as EmailSessionView[];
    }
  }, []);

  const load = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setIsLoading(false);
      setSessions([]);
      return;
    }
    setIsLoading(true);
    const local = await loadFromStorage();
    setSessions(local);
    setActiveSessionId(local[0]?.id ?? null);
    setIsLoading(false);
  }, [isAuthenticated, loadFromStorage, userId]);

  const refreshSessions = useCallback(async () => {
    await load();
  }, [load]);

  const updateEmailInSession = useCallback(async (updatedEmails: EmailDraft[]) => {
    if (!activeSessionId) return;
    setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? { ...s, emails: updatedEmails } : s)));
    try {
      const sessionDataString = await AsyncStorage.getItem('currentEmailSession');
      if (sessionDataString) {
        const parsed = JSON.parse(sessionDataString);
        await AsyncStorage.setItem('currentEmailSession', JSON.stringify({
          ...parsed,
          editedEmails: updatedEmails,
        }));
      }
    } catch {}
  }, [activeSessionId]);

  const sendEmail = useCallback(async (emailId: string): Promise<{ success: boolean; message: string }> => {
    if (!activeSessionId) return { success: false, message: 'No active session' };
    const current = sessions.find((s) => s.id === activeSessionId);
    if (!current) return { success: false, message: 'Session not found' };
    const updated = current.emails.map((e) => (e.id === emailId ? { ...e, status: 'sent' as const } : e));
    await updateEmailInSession(updated);
    const allSent = updated.every((e) => e.status === 'sent');
    if (allSent) {
      const result = await markAsSent(activeSessionId);
      if (result.success) {
        await AsyncStorage.removeItem('currentEmailSession');
        setSessions([]);
        setActiveSessionId(null);
        setTimeout(() => DeviceEventEmitter.emit('restock:sessionSent', { sessionId: activeSessionId }), 800);
      }
    }
    return { success: true, message: '' };
  }, [activeSessionId, markAsSent, sessions, updateEmailInSession]);

  const sendAllEmails = useCallback(async () => {
    if (!activeSessionId) return { success: false, message: 'No active session' };
    // Delegate to application layer to mark as sent once backend email send completes via functions
    const result = await markAsSent(activeSessionId);
    if (result.success) {
      await AsyncStorage.removeItem('currentEmailSession');
      setSessions([]);
      setActiveSessionId(null);
      setTimeout(() => DeviceEventEmitter.emit('restock:sessionSent', { sessionId: activeSessionId }), 800);
      return { success: true, message: 'Emails sent' };
    }
    return { success: false, message: result.error || 'Failed to mark session as sent' };
  }, [activeSessionId, markAsSent]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    isLoading,
    setActiveSessionId,
    refreshSessions,
    sendAllEmails,
    updateEmailInSession,
    sendEmail,
  };
}


