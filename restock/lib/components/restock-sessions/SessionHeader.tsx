import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { getSessionColorTheme } from '../../utils/restock-sessions/colorUtils';
import { formatDate, formatProductCount } from '../../utils/restock-sessions/formatters';

interface SessionHeaderProps {
  currentSession: any | null; // Accept domain session or legacy type
  onShowSessionSelection: () => void;
  allSessionsCount?: number;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  currentSession,
  allSessionsCount = 0,
  onShowSessionSelection
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  
  const sessionId = currentSession && typeof currentSession.toValue === 'function' 
    ? currentSession.toValue().id 
    : currentSession?.id;
  const sessionColor = sessionId ? getSessionColorTheme(sessionId) : null;
  const currentName = currentSession && typeof currentSession.toValue === 'function'
    ? currentSession.toValue().name
    : currentSession?.name;
  const createdAt = currentSession && typeof currentSession.toValue === 'function'
    ? currentSession.toValue().createdAt
    : currentSession?.createdAt;
  const productsCount = currentSession && typeof currentSession.toValue === 'function'
    ? (Array.isArray(currentSession.toValue().items) ? currentSession.toValue().items.length : 0)
    : (Array.isArray(currentSession?.products) ? currentSession.products.length : 0);

  return (
    <>
      {/* Session header with switcher */}
      <View style={[
        restockSessionsStyles.sessionHeader,
        sessionColor && {
          borderLeftWidth: 4,
          borderLeftColor: sessionColor.primary,
          backgroundColor: sessionColor.light
        }
      ]}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
          <View style={[restockSessionsStyles.sessionCardTitle, { flexDirection: 'row', alignItems: 'center', flex: 1 }]}>
            {sessionColor && (
              <View style={[
                restockSessionsStyles.sessionCardTitle,
                { backgroundColor: sessionColor.primary }
              ]} />
            )}
            <Text style={[restockSessionsStyles.sessionHeaderTitle, ]}>
              {(currentName ? currentName + ' • ' : 'Session • ') +
                formatDate(createdAt || new Date())}
            </Text>
            
      
          </View>
          
          {allSessionsCount > 0 && (
            <TouchableOpacity
              style={restockSessionsStyles.sessionSwitcherButton}
              onPress={onShowSessionSelection}
            >
              <Text style={restockSessionsStyles.sessionSwitcherText}>
                Switch ({allSessionsCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Session summary */}
      {productsCount > 0 && (
        <View style={restockSessionsStyles.sessionSummary}>
          <Text style={restockSessionsStyles.summaryText}>
            {formatProductCount(productsCount)} added • 
            Ready to generate supplier emails
          </Text>
        </View>
      )}

      {/* Start section with instructions */}
      <View style={restockSessionsStyles.addProductSection}>
        <Text style={restockSessionsStyles.addProductInstructions}>
          Walk around your store and add products that need restocking
        </Text>
      </View>

    </>
  );
};