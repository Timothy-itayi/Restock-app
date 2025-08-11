import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardStyles } from '../../../../styles/components/dashboard';

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

  const displayedSessions = isExpanded ? finishedSessions : finishedSessions.slice(0, 3);

  return (
    <View style={dashboardStyles.section}>
      <TouchableOpacity 
        style={dashboardStyles.sectionHeader}
        onPress={onToggleExpanded}
      >
        <Text style={[dashboardStyles.sectionTitle, { fontSize: 16 }]}>Finished Sessions</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#6B7280', marginRight: 6 }}>
            {finishedSessions.length}
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#6B7280" 
          />
        </View>
      </TouchableOpacity>
      
      {displayedSessions.map((session, index) => {
        return (
          <View key={session.id} style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#10B981',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1F2937'
                }}>
                  {session.name || `Session #${index + 1}`}
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: '#6B7280',
                marginBottom: 2
              }}>
                {formatDate(session.createdAt)} • {session.totalItems} items • {session.uniqueSuppliers} suppliers
              </Text>
            </View>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#10B981',
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
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '500'
              }}>
                Revisit
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Show more/less button */}
      {finishedSessions.length > 3 && (
        <TouchableOpacity 
          style={{
            padding: 8,
            alignItems: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: 6,
            marginTop: 4
          }}
          onPress={onToggleExpanded}
        >
          <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '500' }}>
            {isExpanded 
              ? 'Show less' 
              : `Show ${finishedSessions.length - 3} more`
            }
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};