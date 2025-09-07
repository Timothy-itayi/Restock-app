import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useDashboardTheme } from '../../../../styles/components/dashboard';
import SkeletonBox from '../../../components/skeleton/SkeletonBox';
import { SwipeableSessionCard } from './SwipeableSessionCard';

interface UnfinishedSession {
  id: string;
  name?: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  items: any[];
}

interface UnfinishedSessionsProps {
  sessionsLoading: boolean;
  unfinishedSessions: UnfinishedSession[];
  onSessionTap?: (sessionId: string, sessionName?: string, sessionIndex?: number) => void;
}

export const UnfinishedSessions: React.FC<UnfinishedSessionsProps> = ({
  sessionsLoading,
  unfinishedSessions,
  onSessionTap
}) => {
  const { styles: dashboardStyles } = useDashboardTheme();
  const [sessions, setSessions] = useState<UnfinishedSession[]>(unfinishedSessions);

  // Update local state when prop changes
  React.useEffect(() => {
    setSessions(unfinishedSessions);
  }, [unfinishedSessions]);

  const handleSessionDeleted = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  }, []);

  if (sessionsLoading) {
    return (
      <View style={dashboardStyles.section}>
        <SkeletonBox width="50%" height={18} style={{ marginBottom: 16 }} />
        <View style={dashboardStyles.sessionCard}>
          <View style={dashboardStyles.sessionHeader}>
            <View style={dashboardStyles.sessionInfo}>
              <SkeletonBox width="70%" height={16} />
              <SkeletonBox width="90%" height={14} style={{ marginTop: 4 }} />
            </View>
            <SkeletonBox width={80} height={32} borderRadius={6} />
          </View>
        </View>
      </View>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <View style={dashboardStyles.section}>
      <View style={dashboardStyles.sectionHeader}>
        <Text style={dashboardStyles.sectionTitle}>Unfinished Sessions</Text>
      
      </View>
      
      {sessions.map((session, index) => (
        <SwipeableSessionCard
          key={session.id}
          session={session}
          index={index}
          onSessionDeleted={handleSessionDeleted}
          onSessionTap={onSessionTap}
        />
      ))}
    </View>
  );
};