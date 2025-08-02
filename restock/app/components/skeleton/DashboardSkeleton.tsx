import React from 'react';
import { View, StyleSheet } from 'react-native';
import { dashboardStyles } from '../../../styles/components/dashboard';
import SkeletonBox from './SkeletonBox';

export default function DashboardSkeleton() {
  return (
    <View style={[dashboardStyles.container, dashboardStyles.contentContainer, styles.container]}>
      {/* Welcome Section Skeleton */}
      <View style={dashboardStyles.welcomeSection}>
        <SkeletonBox width="60%" height={36} />
        <SkeletonBox width="80%" height={22} style={{ marginTop: 8 }} />
      </View>

      {/* Quick Actions Section Skeleton */}
      <View style={dashboardStyles.section}>
        <SkeletonBox width="40%" height={18} />
        <View style={dashboardStyles.actionGrid}>
          <View style={dashboardStyles.actionCard}>
            <View style={dashboardStyles.actionIconContainer}>
              <SkeletonBox width={24} height={24} />
            </View>
            <SkeletonBox width="80%" height={13} style={{ marginTop: 8 }} />
          </View>
          <View style={dashboardStyles.actionCard}>
            <View style={dashboardStyles.actionIconContainer}>
              <SkeletonBox width={24} height={24} />
            </View>
            <SkeletonBox width="60%" height={13} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>

      {/* Unfinished Sessions Section Skeleton */}
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

        {/* Second Session Card Skeleton */}
        <View style={dashboardStyles.sessionCard}>
          <View style={dashboardStyles.sessionHeader}>
            <View style={dashboardStyles.sessionInfo}>
              <SkeletonBox width="60%" height={16} />
              <SkeletonBox width="85%" height={14} style={{ marginTop: 4 }} />
            </View>
            <SkeletonBox width={80} height={32} borderRadius={6} />
          </View>
          
          <View style={dashboardStyles.breakdownContainer}>
            <SkeletonBox width="100%" height={8} borderRadius={4} />
            <View style={styles.breakdownLabels}>
              <SkeletonBox width="25%" height={12} />
              <SkeletonBox width="25%" height={12} />
              <SkeletonBox width="25%" height={12} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
  },
  breakdownLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
}); 