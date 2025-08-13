import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useUnifiedAuth } from '../../../_contexts/UnifiedAuthProvider';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';
import { useRestockApplicationService } from '../../restock-sessions/hooks/useService';

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
  const { userId, isAuthenticated, isReady: authReady, authType } = useUnifiedAuth();
  const restockService = useRestockApplicationService();

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [unfinishedSessions, setUnfinishedSessions] = useState<SessionItemView[]>([]);
  const [finishedSessions, setFinishedSessions] = useState<SessionItemView[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const canLoad = useMemo(() => authReady && isAuthenticated && !!userId && !authType?.needsProfileSetup, [authReady, isAuthenticated, userId, authType?.needsProfileSetup]);

  const fetchSessions = useCallback(async () => {
    if (!canLoad || !userId) {
      setSessionsLoading(false);
      return;
    }
    try {
      setSessionsLoading(true);
      const result = await restockService.getSessions({ userId, includeCompleted: true });
      if (result.success && result.sessions) {
        const all = result.sessions.all.map(mapDomainToView);
        const unfinished = all.filter((s) => s.status === SessionStatus.DRAFT || s.status === SessionStatus.EMAIL_GENERATED);
        const finished = all.filter((s) => s.status === SessionStatus.SENT);
        setUnfinishedSessions(unfinished);
        setFinishedSessions(finished);
      } else {
        setUnfinishedSessions([]);
        setFinishedSessions([]);
      }
      setLastRefreshTime(Date.now());
    } finally {
      setSessionsLoading(false);
    }
  }, [canLoad, restockService, userId]);

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


