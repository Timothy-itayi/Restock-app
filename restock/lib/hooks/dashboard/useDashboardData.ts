import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';
import { RestockSession, SessionStatus } from '../../domain/_entities/RestockSession';
import { useRepositories } from '../../infrastructure/_supabase/SupabaseHooksProvider';

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

  const canLoad = useMemo(() => {
    const ready = authReady && isAuthenticated && !!userId;
    console.log('🔍 Dashboard canLoad check:', {
      authReady,
      isAuthenticated,
      hasUserId: !!userId,
      isProfileSetupComplete,
      canLoad: ready
    });
    return ready;
  }, [authReady, isAuthenticated, userId, isProfileSetupComplete]);

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
    if (hasError && (Date.now() - lastErrorTime) < 5000) {
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
        console.log('📊 Dashboard: Session statuses:', all.map((s: SessionItemView) => ({ id: s.id, status: s.status, name: s.name })));
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

  // Listen for session events - always refresh when session is sent
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('restock:sessionSent', (eventData) => {
      console.log('🔄 Dashboard: Received restock:sessionSent event, refreshing...', eventData);
      
      // Immediately update UI to show session completion
      if (eventData?.sessionId) {
        // Remove the completed session from unfinished list immediately
        setUnfinishedSessions(prev => prev.filter(s => s.id !== eventData.sessionId));
        console.log(`🔄 Dashboard: Immediately removed session ${eventData.sessionId} from unfinished list`);
      }
      
      // Always refresh when a session is sent, regardless of current data state
      // Reduced delay since email sending now has proper database updates
      setTimeout(() => {
        console.log('🔄 Dashboard: Executing delayed refresh after session sent...');
        fetchSessions();
      }, 800); // Reduced from 1000ms for better UX
    });
    return () => sub.remove();
  }, [fetchSessions]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('restock:sessionUpdated', () => {
      if (dataInitialized && (unfinishedSessions.length > 0 || finishedSessions.length > 0)) {
        setTimeout(() => {
          fetchSessions();
        }, 100); // Reduced from 500ms
      }
    });
    return () => sub.remove();
  }, [fetchSessions, dataInitialized, unfinishedSessions.length, finishedSessions.length]);

  // Force clear loading state after 3 seconds to prevent stuck skeleton (reduced from 10s)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sessionsLoading) {
        console.log('⚠️ Dashboard: Force clearing stuck loading state');
        setSessionsLoading(false);
      }
    }, 3000); // Reduced from 10000ms

    return () => clearTimeout(timeout);
  }, [sessionsLoading]);

  // Focus refresh - only if we have data and enough time has passed
  useFocusEffect(
    useCallback(() => {
      if (!canLoad || hasError) return;
      
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;
      
      // Only refresh if we have data and it's been more than 3 seconds (reduced from 10s)
      if (dataInitialized && timeSinceLastRefresh > 3000) {
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

  // 🔍 NEW: Track session tap for debugging
  const trackSessionTap = useCallback((sessionId: string, sessionName?: string, sessionIndex?: number) => {
    console.log('🚀 Dashboard: Session tapped for continue:', {
      sessionId,
      sessionName,
      sessionIndex,
      timestamp: new Date().toISOString(),
      userId
    });
  }, [userId]);

  return {
    sessionsLoading,
    unfinishedSessions,
    finishedSessions,
    refreshing,
    onRefresh,
    hasError,
    dataInitialized,
    // 🔍 NEW: Expose session tap tracking
    trackSessionTap,
  };
}


