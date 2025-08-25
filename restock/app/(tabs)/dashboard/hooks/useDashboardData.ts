import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';
import { useSessionRepository } from '../../../infrastructure/supabase/SupabaseHooksProvider';

interface SessionItemView {
  id: string;
  name?: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  items: Array<{
    quantity: number;
    suppliers: { id: string; name: string };
  }>;
}

function mapDomainToView(session: RestockSession): SessionItemView {
  const items = session.items.map((it) => ({
    quantity: it.quantity,
    suppliers: { id: it.supplierId, name: it.supplierName },
  }));

  return {
    id: session.id,
    name: session.name,
    createdAt: session.createdAt.toISOString(),
    status: session.status,
    totalItems: items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    totalQuantity: items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    uniqueSuppliers: session.getUniqueSupplierCount(),
    uniqueProducts: session.items.length,
    items,
  };
}

export function useDashboardData() {
  const { userId, isAuthenticated, isReady: authReady, isProfileSetupComplete } = useUnifiedAuth();
  const { findByUserId } = useSessionRepository();

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [unfinishedSessions, setUnfinishedSessions] = useState<SessionItemView[]>([]);
  const [finishedSessions, setFinishedSessions] = useState<SessionItemView[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const canLoad = useMemo(() => authReady && isAuthenticated && !!userId && isProfileSetupComplete, [authReady, isAuthenticated, userId, isProfileSetupComplete]);

  const fetchSessions = useCallback(async () => {
    if (!canLoad) {
      setSessionsLoading(false);
      return;
    }
    try {
      setSessionsLoading(true);
      const sessions = await findByUserId(); // Use the destructured method directly
      const all = sessions.map(mapDomainToView);
      const unfinished = all.filter((s: SessionItemView) => s.status === SessionStatus.DRAFT || s.status === SessionStatus.EMAIL_GENERATED);
      const finished = all.filter((s: SessionItemView) => s.status === SessionStatus.SENT);
      setUnfinishedSessions(unfinished);
      setFinishedSessions(finished);
      setLastRefreshTime(Date.now());
    } finally {
      setSessionsLoading(false);
    }
  }, [canLoad, findByUserId]);

  // initial load
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // listen for session sent events to refresh
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('restock:sessionSent', () => {
      setTimeout(() => {
        fetchSessions();
      }, 1000);
    });
    return () => sub.remove();
  }, [fetchSessions]);

  // listen for session updates to refresh
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('restock:sessionUpdated', () => {
      setTimeout(() => {
        fetchSessions();
      }, 500);
    });
    return () => sub.remove();
  }, [fetchSessions]);

  // refresh on focus with throttle
  useFocusEffect(
    useCallback(() => {
      if (!canLoad) return;
      const now = Date.now();
      if (now - lastRefreshTime > 2000) {
        fetchSessions();
      }
    }, [canLoad, fetchSessions, lastRefreshTime])
  );

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await fetchSessions();
    } finally {
      setRefreshing(false);
    }
  }, [fetchSessions, userId]);

  return {
    sessionsLoading,
    unfinishedSessions,
    finishedSessions,
    refreshing,
    onRefresh,
  };
}


