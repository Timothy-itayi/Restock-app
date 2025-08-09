import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardStyles } from '../../../../styles/components/dashboard';
import SkeletonBox from '../../../components/skeleton/SkeletonBox';
import { getSessionColorTheme } from '../../restock-sessions/utils/colorUtils';

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
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const FinishedSessions: React.FC<FinishedSessionsProps> = ({
  sessionsLoading,
  finishedSessions,
  isExpanded,
  onToggleExpanded
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (finishedSessions.length === 0) {
    return null;
  }

  const displayedSessions = isExpanded ? finishedSessions : finishedSessions.slice(0, 2);

  return (
    <View style={dashboardStyles.section}>
      <TouchableOpacity 
        style={dashboardStyles.sectionHeader}
        onPress={onToggleExpanded}
      >
        <Text style={dashboardStyles.sectionTitle}>Completed Sessions</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#6B7280', marginRight: 8 }}>
            {finishedSessions.length} total
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6B7280" 
          />
        </View>
      </TouchableOpacity>
      
      {displayedSessions.map((session, index) => {
        const sessionColor = getSessionColorTheme(session.id, index);
        const totalQuantity = session.totalQuantity;
        
        return (
          <View key={session.id} style={[
            dashboardStyles.sessionCard,
            {
              borderLeftWidth: 4,
              borderLeftColor: sessionColor.primary,
              backgroundColor: sessionColor.light,
              opacity: 0.8 // Slightly faded to indicate completion
            }
          ]}>
            <View style={dashboardStyles.sessionHeader}>
              <View style={dashboardStyles.sessionInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={[
                    { 
                      width: 8, 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: sessionColor.primary,
                      marginRight: 8
                    }
                  ]} />
                  <Text style={dashboardStyles.sessionTitle}>
                    {session.name ? `${session.name} • ` : `Session #{index + 1} • `}{formatDate(session.createdAt)}
                  </Text>
                </View>
                <Text style={dashboardStyles.sessionSubtitle}>
                  {session.totalItems} items • {totalQuantity} total quantity • {session.uniqueSuppliers} suppliers
                  {session.emailsSent && ` • ${session.emailsSent} emails sent`}
                </Text>
              </View>
              <View style={[
                dashboardStyles.continueButton,
                { backgroundColor: '#10B981', opacity: 0.9 }
              ]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={[dashboardStyles.continueButtonText, { color: '#FFFFFF', fontSize: 12 }]}>
                  Completed
                </Text>
              </View>
            </View>

            {/* Completion Stats */}
            <View style={[dashboardStyles.breakdownContainer, { paddingTop: 8 }]}>
              <View style={dashboardStyles.breakdownHeader}>
                <Text style={[dashboardStyles.breakdownTitle, { color: '#10B981' }]}>
                  SESSION COMPLETED
                </Text>
                <Text style={dashboardStyles.breakdownTotal}>
                  {session.status === 'sent' ? 'Emails sent' : 'Finished'}
                </Text>
              </View>
              
              {/* Success indicators */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginTop: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: '#DCFCE7',
                borderRadius: 6
              }}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={{ 
                  marginLeft: 6, 
                  fontSize: 12, 
                  color: '#16A34A',
                  fontWeight: '500'
                }}>
                  All suppliers have been contacted
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Show more/less button */}
      {finishedSessions.length > 2 && (
        <TouchableOpacity 
          style={{
            padding: 12,
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: 8,
            marginTop: 8,
            borderWidth: 1,
            borderColor: '#E5E7EB'
          }}
          onPress={onToggleExpanded}
        >
          <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>
            {isExpanded 
              ? 'Show less' 
              : `Show ${finishedSessions.length - 2} more completed sessions`
            }
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};