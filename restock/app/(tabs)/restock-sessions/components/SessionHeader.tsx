import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RestockSession } from '../utils/types';
import { formatDate, formatProductCount } from '../utils/formatters';
import { restockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface SessionHeaderProps {
  currentSession: RestockSession | null;
  allSessionsCount: number;
  onShowSessionSelection: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  currentSession,
  allSessionsCount,
  onShowSessionSelection
}) => {
  return (
    <>
      {/* Session header with switcher */}
      <View style={restockSessionsStyles.sessionHeader}>
        <View style={restockSessionsStyles.sessionHeaderLeft}>
          <Text style={restockSessionsStyles.sessionHeaderTitle}>
            Session • {formatDate(currentSession?.createdAt || new Date())}
          </Text>
          {allSessionsCount > 1 && (
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
      {currentSession && currentSession.products.length > 0 && (
        <View style={restockSessionsStyles.sessionSummary}>
          <Text style={restockSessionsStyles.summaryText}>
            {formatProductCount(currentSession.products.length)} added • 
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