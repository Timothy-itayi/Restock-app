import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { getDashboardStyles } from '../../../styles/components/dashboard';
import SkeletonBox from './SkeletonBox';
import { useSafeTheme } from '../../stores/useThemeStore';
import colors, { AppColors } from '../../theme/colors';

interface DashboardSkeletonProps {
  showWelcomeSection?: boolean;
  showSessionsSection?: boolean;
}

export default function DashboardSkeleton({ 
  showWelcomeSection = true, 
  showSessionsSection = true 
}: DashboardSkeletonProps) {
  const t = useSafeTheme();
  const dashboardStyles = getDashboardStyles(t.theme as AppColors);
  return (
    <ScrollView 
      style={dashboardStyles.container} 
      contentContainerStyle={[dashboardStyles.contentContainer, { paddingTop: 65 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section Skeleton - Only for userName and storeName */}
      {showWelcomeSection && (
        <View style={[dashboardStyles.welcomeSection, { paddingTop: 8 }]}>
          <SkeletonBox width="60%" height={36} />
          <SkeletonBox width="80%" height={22} style={{ marginTop: 8 }} />
        </View>
      )}

      {/* Sessions Section Skeleton - Only when sessions are loading */}
      {showSessionsSection && (
        <View style={dashboardStyles.section}>
          <View style={dashboardStyles.sectionHeader}>
            <SkeletonBox width="50%" height={18} />
          </View>
          
          {/* Session Card Skeleton */}
          <View style={dashboardStyles.sessionCard}>
            <View style={dashboardStyles.sessionHeader}>
              <View style={dashboardStyles.sessionInfo}>
                <SkeletonBox width="70%" height={16} />
                <SkeletonBox width="90%" height={14} style={{ marginTop: 4 }} />
              </View>
              <SkeletonBox width={80} height={32} borderRadius={6} />
            </View>
            
            {/* Supplier Breakdown Skeleton */}
            <View style={dashboardStyles.breakdownContainer}>
              <SkeletonBox width="100%" height={8} borderRadius={4} />
              <View style={styles.breakdownLabels}>
                <SkeletonBox width="30%" height={12} />
                <SkeletonBox width="30%" height={12} />
                <SkeletonBox width="30%" height={12} />
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  breakdownLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
}); 