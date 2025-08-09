import React from 'react';
import { View, Text } from 'react-native';
import { dashboardStyles } from '../../../../styles/components/dashboard';
import SkeletonBox from '../../../components/skeleton/SkeletonBox';

interface UnfinishedSession {
  id: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  items: any[];
}

interface StatsOverviewProps {
  sessionsLoading: boolean;
  unfinishedSessions: UnfinishedSession[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  sessionsLoading,
  unfinishedSessions
}) => {
  return (
    <View style={dashboardStyles.section}>
      <Text style={dashboardStyles.sectionTitle}>Overview</Text>
      {sessionsLoading ? (
        <View style={dashboardStyles.statsGrid}>
          <View style={dashboardStyles.statCard}>
            <SkeletonBox width={30} height={32} />
            <Text style={dashboardStyles.statLabel}>Active Sessions</Text>
          </View>
          <View style={dashboardStyles.statCard}>
            <SkeletonBox width={30} height={32} />
            <Text style={dashboardStyles.statLabel}>Products</Text>
          </View>
          <View style={dashboardStyles.statCard}>
            <SkeletonBox width={30} height={32} />
            <Text style={dashboardStyles.statLabel}>Suppliers</Text>
          </View>
        </View>
      ) : (
        <View style={dashboardStyles.statsGrid}>
          <View style={[dashboardStyles.statCard, { padding: 14, borderRadius: 10 }]}>
            <Text style={[dashboardStyles.statNumber, { fontSize: 18 }]}>{unfinishedSessions.length}</Text>
            <Text style={[dashboardStyles.statLabel, { fontSize: 11 }]}>Active Sessions</Text>
          </View>
          <View style={[dashboardStyles.statCard, { padding: 14, borderRadius: 10 }]}>
            <Text style={[dashboardStyles.statNumber, { fontSize: 18 }]}>
              {unfinishedSessions.reduce((sum, session) => sum + session.uniqueProducts, 0)}
            </Text>
            <Text style={[dashboardStyles.statLabel, { fontSize: 11 }]}>Products</Text>
          </View>
          <View style={[dashboardStyles.statCard, { padding: 14, borderRadius: 10 }]}>
            <Text style={[dashboardStyles.statNumber, { fontSize: 18 }]}>
              {unfinishedSessions.reduce((sum, session) => sum + session.uniqueSuppliers, 0)}
            </Text>
            <Text style={[dashboardStyles.statLabel, { fontSize: 11 }]}>Suppliers</Text>
          </View>
        </View>
      )}
    </View>
  );
};