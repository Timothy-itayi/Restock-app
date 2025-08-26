import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';
import { RestockSession, SessionStatus } from '../../../domain/entities/RestockSession';
import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';

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
  const { sessionRepository } = useRepositories();

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [unfinishedSessions, setUnfinishedSessions] = useState<SessionItemView[]>([]);
  const [finishedSessions, setFinishedSessions] = useState<SessionItemView[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState(0);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Add request deduplication
  const [isFetching, setIsFetching] = useState(false);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const canLoad = useMemo(() => authReady && isAuthenticated && !!userId && isProfileSetupComplete, [authReady, isAuthenticated, userId, isProfileSetupComplete]);

  const fetchSessions = useCallback(async () => {
    // Don't fetch if we can't load or already fetching
    if (!canLoad || isFetching) {
      if (fetchPromiseRef.current) {
        return fetchPromiseRef.current;
      }
      setSessionsLoading(false); // Ensure loading is cleared
      return;
    }

    // Don't retry if we just had an error (5 second cooldown)
    if (hasError && (Date.now() - lastErrorTime) < 500) {
      console.log('🛑 Skipping fetch - error cooldown active');
      setSessionsLoading(false); // Ensure loading is cleared
      return;
    }

    // Create a single fetch promise
    const fetchPromise = (async () => {
      try {
        setIsFetching(true);
        setSessionsLoading(true);
        setHasError(false);
        
        console.log('🔄 Dashboard: Starting fetch...');
        
        const sessions = await sessionRepository?.findByUserId();
        const all = sessions?.map(mapDomainToView) || [];
        const unfinished = all.filter((s: SessionItemView) => s.status === SessionStatus.DRAFT || s.status === SessionStatus.EMAIL_GENERATED);
        const finished = all.filter((s: SessionItemView) => s.status === SessionStatus.SENT);
        
        setUnfinishedSessions(unfinished);
        setFinishedSessions(finished);
        setLastRefreshTime(Date.now());
        setDataInitialized(true);
        
        console.log(`📊 Dashboard: Loaded ${all.length} sessions (${unfinished.length} unfinished, ${finished.length} finished)`);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setHasError(true);
        setLastErrorTime(Date.now());
      } finally {
        setIsFetching(false);
        setSessionsLoading(false); // Ensure this always runs
        fetchPromiseRef.current = null;
        console.log('🔄 Dashboard: Fetch complete, loading states cleared');
      }
    })();

    fetchPromiseRef.current = fetchPromise;
    return fetchPromise;
  }, [canLoad, sessionRepository, isFetching, hasError, lastErrorTime]);

  // Add debug logging for loading states
  useEffect(() => {
    console.log('🔄 Dashboard Loading States:', {
      sessionsLoading,
      isFetching,
      hasError,
      canLoad,
      dataInitialized,
      sessionRepository: !!sessionRepository
    });
  }, [sessionsLoading, isFetching, hasError, canLoad, dataInitialized, sessionRepository]);

  // Initial load only once
  useEffect(() => {
    if (canLoad && !dataInitialized) {
      fetchSessions();
    }
  }, [canLoad, dataInitialized, fetchSessions]);

  // Listen for session events - only refresh if we have data
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('restock:sessionSent', () => {
      if (dataInitialized && (unfinishedSessions.length > 0 || finishedSessions.length > 0)) {
        setTimeout(() => {
          fetchSessions();
        }, 1000);
      }
    });
    return () => sub.remove();
  }, [fetchSessions, dataInitialized, unfinishedSessions.length, finishedSessions.length]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('restock:sessionUpdated', () => {
      if (dataInitialized && (unfinishedSessions.length > 0 || finishedSessions.length > 0)) {
        setTimeout(() => {
          fetchSessions();
        }, 500);
      }
    });
    return () => sub.remove();
  }, [fetchSessions, dataInitialized, unfinishedSessions.length, finishedSessions.length]);

  // Force clear loading state after 10 seconds to prevent stuck skeleton
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sessionsLoading) {
        console.log('⚠️ Dashboard: Force clearing stuck loading state');
        setSessionsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [sessionsLoading]);

  // Focus refresh - only if we have data and enough time has passed
  useFocusEffect(
    useCallback(() => {
      if (!canLoad || hasError) return;
      
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;
      
      // Only refresh if we have data and it's been more than 10 seconds
      if (dataInitialized && timeSinceLastRefresh > 10000) {
        fetchSessions();
      }
    }, [canLoad, fetchSessions, lastRefreshTime, hasError, dataInitialized])
  );

  // Manual refresh - always works
  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setHasError(false); // Reset error state
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
    hasError,
    dataInitialized,
  };
}


