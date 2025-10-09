import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { getDashboardStyles } from '../../../styles/components/dashboard';
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';

import { useDashboardData } from './_hooks/useDashboardData';
import { 
  WelcomeSection, 
  UnfinishedSessions, 
  FinishedSessions,
  StatsOverviewEnhanced, 
  EmptyState 
} from './_components';
import useThemeStore from '../../../lib/stores/useThemeStore';

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
  // Use the new unified auth system with profile data
  const { 
    userId, 
    isAuthenticated, 
    isReady: authReady, 
    authType,
    userName,
    storeName,
    isProfileLoading,
    profileError,
    retryProfileLoad
  } = useUnifiedAuth();
  
  // Use responsive theme system
  const { styles: dashboardStyles } = useDashboardTheme();
  const appTheme = useAppTheme();
  
  const { unfinishedSessions, finishedSessions, sessionsLoading, refreshing, onRefresh, trackSessionTap } = useDashboardData();

  // Show loading state while profile is being fetched
  const isLoadingProfile = isProfileLoading && (!userName || !storeName);

  // Show loading state while profile is being fetched
  if (isLoadingProfile) {
    return (
      <View style={[dashboardStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: appTheme.colors.neutral.medium }}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={dashboardStyles.container} 
      contentContainerStyle={dashboardStyles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={[appTheme.colors.neutral.medium]} 
        />
      }
    >
      <WelcomeSection 
        profileLoading={isProfileLoading} 
        userName={userName} 
        storeName={storeName}
        profileError={profileError}
        retryProfileLoad={retryProfileLoad}
        userId={userId}
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
        onSessionTap={trackSessionTap}
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
