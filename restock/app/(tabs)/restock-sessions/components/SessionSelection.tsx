import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatProductCount, formatSupplierCount } from '../utils/formatters';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface SessionSelectionProps {
  sessions: any[]; // array of domain sessions or legacy UI sessions
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const SessionSelection: React.FC<SessionSelectionProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
  onClose,
  isLoading
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const getSupplierCount = (session: any): number => {
    const products = session.products || session.toValue?.().items || [];
    const supplierNames = products.map((p: any) => p.supplierName).filter(Boolean);
    return new Set(supplierNames).size;
  };

  const getTotalQuantity = (session: any): number => {
    const products = session.products || session.toValue?.().items || [];
    return products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
  };

  return (
    <View style={restockSessionsStyles.sessionSelectionContainer}>
      <View style={restockSessionsStyles.sessionSelectionHeader}>
        <Text style={restockSessionsStyles.sessionSelectionTitle}>Choose a Session</Text>
        <Text style={restockSessionsStyles.sessionSelectionSubtitle}>
          {isLoading ? 'Loading sessions...' : `You have ${Array.isArray(sessions) ? sessions.length : 0} unfinished session${Array.isArray(sessions) && sessions.length !== 1 ? 's' : ''}`}
        </Text>
      </View>
      
      <ScrollView style={restockSessionsStyles.sessionList}>
        {sessions.map((session, index) => {
          const id = session.toValue?.().id || session.id;
          const name = session.toValue?.().name || session.name;
          const createdAt = session.toValue?.().createdAt || session.createdAt;
          const products = session.products || session.toValue?.().items || [];
          return (
          <TouchableOpacity
            key={id}
            style={restockSessionsStyles.sessionCard}
            onPress={() => onSelectSession(id)}
          >
            <View style={restockSessionsStyles.sessionCardHeader}>
              <Text style={restockSessionsStyles.sessionCardTitle}>
                {name ? `${name} • ` : `Session #${index + 1} • `}{formatDate(createdAt)}
              </Text>
              <TouchableOpacity
                style={restockSessionsStyles.sessionDeleteButton}
                onPress={() => onDeleteSession(id)}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
            
            <View style={restockSessionsStyles.sessionCardContent}>
              <Text style={restockSessionsStyles.sessionCardSubtitle}>
                {formatProductCount(Array.isArray(products) ? products.length : 0)} • {getTotalQuantity(session)} total quantity
              </Text>
              
              {Array.isArray(products) && products.length > 0 && (
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
        );})}
      </ScrollView>
      
      <View style={restockSessionsStyles.sessionSelectionFooter}>
        <TouchableOpacity 
          style={restockSessionsStyles.newSessionButton}
          onPress={onClose}
        >
          <Text style={restockSessionsStyles.newSessionButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};