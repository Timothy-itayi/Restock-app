import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getDashboardStyles } from '../../../../styles/components/dashboard';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import useThemeStore from '../../../../lib/stores/useThemeStore';

interface EmptyStateProps {
  sessionsLoading: boolean;
  hasUnfinishedSessions: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  sessionsLoading,
  hasUnfinishedSessions
}) => {
  const { styles: dashboardStyles } = useDashboardTheme();
  const appTheme = useAppTheme();
  if (sessionsLoading || hasUnfinishedSessions) {
    return null;
  }

  return (
    <View style={dashboardStyles.emptyState}>
      <Ionicons name="checkmark-circle" size={48} color={appTheme.colors.neutral.medium} />
      <Text style={dashboardStyles.emptyStateTitle}>All caught up!</Text>
      <Text style={dashboardStyles.emptyStateText}>
        No unfinished restock sessions. Ready to start a new one?
      </Text>
      <TouchableOpacity 
        style={dashboardStyles.startNewButton}
        onPress={() => router.push('/(tabs)/restock-sessions?action=create' as any)}
      >
        <Text style={dashboardStyles.startNewButtonText}>Create New Session</Text>
      </TouchableOpacity>
    </View>
  );
};