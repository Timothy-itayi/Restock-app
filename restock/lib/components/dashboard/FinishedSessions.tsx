import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStyles } from '../../../styles/components/dashboard';
import { useSafeTheme } from '../../stores/useThemeStore';
import colors, { AppColors } from '../../theme/colors';

interface FinishedSession {
  id: string;
  name?: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  emailsSent?: number;
  items: any[];
}

interface FinishedSessionsProps {
  sessionsLoading: boolean;
  finishedSessions: FinishedSession[];
}

export const FinishedSessions: React.FC<FinishedSessionsProps> = ({
  sessionsLoading,
  finishedSessions
}) => {
  const t = useSafeTheme();
  const dashboardStyles = getDashboardStyles(t.theme as AppColors);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Don't show loading state for finished sessions to keep it minimal
  if (sessionsLoading) {
    return null;
  }

  // Don't render if no finished sessions
  if (finishedSessions.length === 0) {
    console.log('📊 FinishedSessions: No finished sessions to display');
    return null;
  }

  console.log('📊 FinishedSessions: Rendering', { count: finishedSessions.length, sessions: finishedSessions.map(s => ({ id: s.id, status: s.status })) });

  return (
    <View style={dashboardStyles.section}>
      <View style={dashboardStyles.sectionHeader}>
        <Text style={[dashboardStyles.sectionTitle, { fontSize: 16 }]}>Finished Sessions</Text>
      </View>
      
      {finishedSessions.map((session, index) => {
        return (
          <View key={session.id} style={{
            backgroundColor: colors.neutral.lighter,
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            borderLeftWidth: 3,
            borderLeftColor: colors.status.success,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color={colors.status.success} style={{ marginRight: 6 }} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.neutral.darkest
                }}>
                  {session.name || `Session #${index + 1}`}
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: colors.neutral.medium,
                marginBottom: 2
              }}>
                {formatDate(session.createdAt)} • {session.totalItems} items • {session.uniqueSuppliers} suppliers
              </Text>
            </View>
            
            <TouchableOpacity
              style={{
                backgroundColor: colors.status.success,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6
              }}
              onPress={() => {
                // TODO: Navigate to session details or email history
                console.log('Revisit session:', session.id);
              }}
            >
              <Text style={{
                color: colors.neutral.lightest,
                fontSize: 12,
                fontWeight: '500'
              }}>
                Revisit
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};