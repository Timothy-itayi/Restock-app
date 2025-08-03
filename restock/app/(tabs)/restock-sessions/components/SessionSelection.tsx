import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RestockSession } from '../utils/types';
import { formatDate, formatProductCount, formatSupplierCount } from '../utils/formatters';
import { restockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface SessionSelectionProps {
  allSessions: RestockSession[];
  onSelectSession: (session: RestockSession) => void;
  onDeleteSession: (session: RestockSession) => void;
  onStartNewSession: () => void;
}

export const SessionSelection: React.FC<SessionSelectionProps> = ({
  allSessions,
  onSelectSession,
  onDeleteSession,
  onStartNewSession
}) => {
  const getSupplierCount = (session: RestockSession): number => {
    return new Set(session.products.map(p => p.supplierName)).size;
  };

  const getTotalQuantity = (session: RestockSession): number => {
    return session.products.reduce((sum, p) => sum + p.quantity, 0);
  };

  return (
    <View style={restockSessionsStyles.sessionSelectionContainer}>
      <View style={restockSessionsStyles.sessionSelectionHeader}>
        <Text style={restockSessionsStyles.sessionSelectionTitle}>Choose a Session</Text>
        <Text style={restockSessionsStyles.sessionSelectionSubtitle}>
          You have {allSessions.length} unfinished session{allSessions.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <ScrollView style={restockSessionsStyles.sessionList}>
        {allSessions.map((session, index) => (
          <TouchableOpacity
            key={session.id}
            style={restockSessionsStyles.sessionCard}
            onPress={() => onSelectSession(session)}
          >
            <View style={restockSessionsStyles.sessionCardHeader}>
              <Text style={restockSessionsStyles.sessionCardTitle}>
                Session #{index + 1} • {formatDate(session.createdAt)}
              </Text>
              <TouchableOpacity
                style={restockSessionsStyles.sessionDeleteButton}
                onPress={() => onDeleteSession(session)}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
            
            <View style={restockSessionsStyles.sessionCardContent}>
              <Text style={restockSessionsStyles.sessionCardSubtitle}>
                {formatProductCount(session.products.length)} • 
                {getTotalQuantity(session)} total quantity
              </Text>
              
              {session.products.length > 0 && (
                <View style={restockSessionsStyles.sessionCardSuppliers}>
                  <Text style={restockSessionsStyles.sessionCardSuppliersText}>
                    {formatSupplierCount(getSupplierCount(session))}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={restockSessionsStyles.sessionCardFooter}>
              <Text style={restockSessionsStyles.sessionCardAction}>Tap to continue</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={restockSessionsStyles.sessionSelectionFooter}>
        <TouchableOpacity 
          style={restockSessionsStyles.newSessionButton}
          onPress={onStartNewSession}
        >
          <Text style={restockSessionsStyles.newSessionButtonText}>Create New Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};