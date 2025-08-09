import React, { useState, useEffect } from "react";
import { ScrollView, RefreshControl, DeviceEventEmitter } from "react-native";
import { dashboardStyles } from "../../../styles/components/dashboard";
import { useAuth } from "@clerk/clerk-expo";
import { SessionService } from "../../../backend/services/sessions";
import { useFocusEffect } from "expo-router";
import { useUnifiedAuth } from "../../_contexts/UnifiedAuthProvider";
import useProfileStore from "../../stores/useProfileStore";
import { 
  WelcomeSection, 
  QuickActions, 
  UnfinishedSessions, 
  FinishedSessions,
  StatsOverview, 
  EmptyState 
} from './components';
import { HistorySection } from '../profile/components/HistorySection';

interface SessionItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
  }[];
  suppliers: {
    id: string;
    name: string;
  }[];
}

interface UnfinishedSession {
  id: string;
  name?: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  items: SessionItem[];
}

export default function DashboardScreen() {
  const { userId, isSignedIn } = useAuth();
  const { isReady: authReady, isAuthenticated, authType } = useUnifiedAuth();

  // Use profile store for user data
  const { userName, storeName, isLoading: profileLoading } = useProfileStore();
  
  const [unfinishedSessions, setUnfinishedSessions] = useState<UnfinishedSession[]>([]);
  const [finishedSessions, setFinishedSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [displayStartTime] = useState(Date.now());
  const [showFinishedExpanded, setShowFinishedExpanded] = useState(false);

  // Component display logging
  useEffect(() => {
    console.log('📺 Dashboard: Component mounted', {
      timestamp: displayStartTime,
      userId: !!userId,
      isSignedIn,
      authReady,
      isAuthenticated,
      authType
    });

    return () => {
      const displayDuration = Date.now() - displayStartTime;
      console.log('📺 Dashboard: Component unmounted', {
        displayDuration,
        timestamp: Date.now()
      });
    };
  }, [displayStartTime, userId, isSignedIn, authReady, isAuthenticated, authType]);

  useEffect(() => {
    console.log('📺 Dashboard: Data fetch effect triggered', {
      userId: !!userId,
      isSignedIn,
      authReady,
      isAuthenticated,
      authType,
      needsProfileSetup: authType?.needsProfileSetup,
      timestamp: Date.now()
    });

    // Only fetch data when auth is fully settled and user doesn't need profile setup
    if (!authReady) {
      console.log('📺 Dashboard: Auth not ready yet, waiting...');
      return;
    }

    if (!isAuthenticated || !userId) {
      console.log('📺 Dashboard: User not authenticated or no userId, setting sessions loading to false');
      setSessionsLoading(false);
      return;
    }

    if (authType?.needsProfileSetup) {
      console.log('📺 Dashboard: User needs profile setup, not fetching data yet');
      return;
    }

    console.log('📺 Dashboard: All conditions met, starting sessions fetch');

    const fetchSessions = async () => {
      console.log('📺 Dashboard: Fetching sessions...');
      try {
        const [unfinishedResult, finishedResult] = await Promise.all([
          SessionService.getUnfinishedSessions(userId),
          SessionService.getFinishedSessions(userId)
        ]);
        
        if (unfinishedResult.data) {
          setUnfinishedSessions(unfinishedResult.data);
        }
        
        if (finishedResult.data) {
          setFinishedSessions(finishedResult.data);
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching sessions:', error);
      } finally {
        console.log('📺 Dashboard: Sessions fetch complete');
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [userId, isSignedIn, authReady, isAuthenticated, authType]);

  // Fallback timeout to prevent infinite loading for sessions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionsLoading) {
        console.log('Dashboard: Fallback timeout - setting sessionsLoading to false');
        setSessionsLoading(false);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timer);
  }, [sessionsLoading]);

  // Refresh data when user returns to dashboard
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        const refreshData = async () => {
          try {
            const [unfinishedResult, finishedResult] = await Promise.all([
              SessionService.getUnfinishedSessions(userId),
              SessionService.getFinishedSessions(userId)
            ]);
            
            if (unfinishedResult.data) {
              setUnfinishedSessions(unfinishedResult.data);
            }
            
            if (finishedResult.data) {
              setFinishedSessions(finishedResult.data);
            }
          } catch (error) {
            console.error('Error refreshing dashboard sessions data:', error);
          }
        };
        
        refreshData();

        // Subscribe to session-sent events to refresh finished sessions immediately
        const sub = DeviceEventEmitter.addListener('restock:sessionSent', () => {
          refreshData();
        });

        return () => {
          sub.remove();
        };
      }
    }, [userId])
  );

  const onRefresh = async () => {
    if (!userId) {
      console.error('Cannot refresh: userId is null or undefined');
      return;
    }
    
    setRefreshing(true);
    try {
      const [unfinishedResult, finishedResult] = await Promise.all([
        SessionService.getUnfinishedSessions(userId),
        SessionService.getFinishedSessions(userId)
      ]);
      
      if (unfinishedResult.data) {
        setUnfinishedSessions(unfinishedResult.data);
      }
      
      if (finishedResult.data) {
        setFinishedSessions(finishedResult.data);
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView 
      style={dashboardStyles.container} 
      contentContainerStyle={dashboardStyles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C757D']} />
      }
    >
      <WelcomeSection 
        profileLoading={profileLoading} 
        userName={userName} 
        storeName={storeName} 
      />
      
      <QuickActions />

      {/* Overview under quick actions, minimized styling handled inside */}
      <StatsOverview 
        sessionsLoading={sessionsLoading} 
        unfinishedSessions={unfinishedSessions} 
      />

      {/* History access inline like Instagram-style toggle */}
      <HistorySection userId={userId || undefined} />

      <UnfinishedSessions 
        sessionsLoading={sessionsLoading} 
        unfinishedSessions={unfinishedSessions} 
      />

      <FinishedSessions 
        sessionsLoading={sessionsLoading} 
        finishedSessions={finishedSessions}
        isExpanded={showFinishedExpanded}
        onToggleExpanded={() => setShowFinishedExpanded(!showFinishedExpanded)}
      />
      
      <EmptyState 
        sessionsLoading={sessionsLoading} 
        hasUnfinishedSessions={unfinishedSessions.length > 0 || finishedSessions.length > 0} 
      />
    </ScrollView>
  );
}