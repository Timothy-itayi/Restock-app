import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, TextInput } from 'react-native';
import { RestockSession } from '../utils/types';
import { formatDate, formatProductCount } from '../utils/formatters';
import { getSessionColorTheme } from '../utils/colorUtils';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import { useRestockSessionContext } from '../context/RestockSessionContext';

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
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const sessionColor = currentSession ? getSessionColorTheme(currentSession.id) : null;
  const { setSessionName } = useRestockSessionContext();
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(currentSession?.name || '');

  // Update temp name when session changes
  useEffect(() => {
    setTempName(currentSession?.name || '');
  }, [currentSession?.name]);

  const handleSaveSessionName = async () => {
    setIsRenaming(false);
    if (currentSession && tempName.trim().length > 0) {
      try {
        await setSessionName(currentSession.id, tempName.trim());
      } catch (error) {
        console.error('Failed to set session name:', error);
        // Revert to original name if update failed
        setTempName(currentSession.name || '');
      }
    } else {
      // Revert if empty
      setTempName(currentSession?.name || '');
    }
  };

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
        <View style={restockSessionsStyles.sessionHeaderLeft}>
          <View style={restockSessionsStyles.sessionCardTitle}>
            {sessionColor && (
              <View style={[
                restockSessionsStyles.sessionCardTitle,
                { backgroundColor: sessionColor.primary }
              ]} />
            )}
            {isRenaming ? (
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                autoFocus
                placeholder="Tap to name session"
                returnKeyType="done"
                onSubmitEditing={handleSaveSessionName}
                onBlur={handleSaveSessionName}
                style={{
                  fontFamily: restockSessionsStyles.sessionHeaderTitle.fontFamily,
                  fontSize: restockSessionsStyles.sessionHeaderTitle.fontSize,
                  fontWeight: '600',
                  color: '#000',
                  minWidth: 200,
                }}
              />
            ) : (
              <Text style={restockSessionsStyles.sessionHeaderTitle} onPress={() => setIsRenaming(true)}>
                {(currentSession?.name ? currentSession.name + ' • ' : 'Session • ') +
                  formatDate(currentSession?.createdAt || new Date())}
              </Text>
            )}
          </View>
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