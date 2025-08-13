import React, { useState, useEffect } from "react";
import { ScrollView, RefreshControl, DeviceEventEmitter } from "react-native";
import { getDashboardStyles } from "../../../styles/components/dashboard";
import { useThemedStyles } from "../../../styles/useThemedStyles";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import { useUnifiedAuth } from "../../_contexts/UnifiedAuthProvider";
import { useDashboardData } from "./hooks/useDashboardData";
import useProfileStore from "../../stores/useProfileStore";
import { 
  WelcomeSection, 
  UnfinishedSessions, 
  FinishedSessions,
  StatsOverviewEnhanced, 
  EmptyState 
} from './components';
import useThemeStore from "../../stores/useThemeStore";

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
  
  // Use themed styles
  const dashboardStyles = useThemedStyles(getDashboardStyles);
  
  const [displayStartTime] = useState(Date.now());
  const { unfinishedSessions, finishedSessions, sessionsLoading, refreshing, onRefresh } = useDashboardData();


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

  // data fetching and refresh now handled by useDashboardData

  return (
    <ScrollView 
      style={dashboardStyles.container} 
      contentContainerStyle={dashboardStyles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[useThemeStore.getState().theme.neutral.medium]} />
      }
    >
      <WelcomeSection 
        profileLoading={profileLoading} 
        userName={userName} 
        storeName={storeName} 
      />
      
  

      {/* Enhanced Overview with donut chart */}
      <StatsOverviewEnhanced 
        sessionsLoading={sessionsLoading} 
        unfinishedSessions={unfinishedSessions} 
        finishedSessions={finishedSessions}
      />

  

      <UnfinishedSessions 
        sessionsLoading={sessionsLoading} 
        unfinishedSessions={unfinishedSessions} 
      />

      <FinishedSessions 
        sessionsLoading={sessionsLoading} 
        finishedSessions={finishedSessions}
      />
      
      <EmptyState 
        sessionsLoading={sessionsLoading} 
        hasUnfinishedSessions={unfinishedSessions.length > 0 || finishedSessions.length > 0} 
      />
    </ScrollView>
  );
}