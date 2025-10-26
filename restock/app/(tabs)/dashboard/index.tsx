import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { getDashboardStyles } from '../../../styles/components/dashboard';

import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';
import { useSafeTheme } from '../../../lib/stores/useThemeStore';
import colors, { AppColors } from '../../../lib/theme/colors';

import {
    EmptyState,
    StatsOverviewEnhanced,
    UnfinishedSessions,
    WelcomeSection
} from '../../../lib/components/dashboard';
import { useDashboardData } from '../../../lib/hooks/dashboard/useDashboardData';


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
  const t = useSafeTheme();
  const dashboardStyles = getDashboardStyles(t.theme as AppColors);
  
  const { unfinishedSessions, finishedSessions, sessionsLoading, refreshing, onRefresh, trackSessionTap } = useDashboardData();

  // Show loading state while profile is being fetched
  const isLoadingProfile = isProfileLoading && (!userName || !storeName);

  // Show loading state while profile is being fetched
  if (isLoadingProfile) {
    return (
      <View style={[dashboardStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: colors.neutral.medium }}>Loading your profile...</Text>
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
          colors={[colors.neutral.medium]} 
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

      {/* Finished sessions list removed; use StatsOverviewEnhanced (color wheel) as sole entry to finished */}
      
      <EmptyState 
        sessionsLoading={sessionsLoading} 
        hasUnfinishedSessions={unfinishedSessions.length > 0 || finishedSessions.length > 0} 
      />
    </ScrollView>
  );
}
