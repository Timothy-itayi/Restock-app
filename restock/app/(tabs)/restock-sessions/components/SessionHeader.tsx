import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, TextInput } from 'react-native';
import { formatDate, formatProductCount } from '../utils/formatters';
import { getSessionColorTheme } from '../utils/colorUtils';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface SessionHeaderProps {
  currentSession: any | null; // Accept domain session or legacy type
  onShowSessionSelection: () => void;
  onNameSession?: () => void;
  allSessionsCount?: number;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  currentSession,
  allSessionsCount = 0,
  onShowSessionSelection,
  onNameSession
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const sessionId = currentSession && typeof currentSession.toValue === 'function' 
    ? currentSession.toValue().id 
    : currentSession?.id;
  const sessionColor = sessionId ? getSessionColorTheme(sessionId) : null;
  const [isRenaming, setIsRenaming] = useState(false);
  const currentName = currentSession && typeof currentSession.toValue === 'function'
    ? currentSession.toValue().name
    : currentSession?.name;
  const createdAt = currentSession && typeof currentSession.toValue === 'function'
    ? currentSession.toValue().createdAt
    : currentSession?.createdAt;
  const productsCount = currentSession && typeof currentSession.toValue === 'function'
    ? (Array.isArray(currentSession.toValue().items) ? currentSession.toValue().items.length : 0)
    : (Array.isArray(currentSession?.products) ? currentSession.products.length : 0);
  const [tempName, setTempName] = useState(currentName || '');

  // Update temp name when session changes
  useEffect(() => {
    setTempName(currentName || '');
  }, [currentName]);

  const handleSaveSessionName = async () => {
    setIsRenaming(false);
    // In the new architecture, naming is handled by parent modal
    if (onNameSession) onNameSession();
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
              <Text style={restockSessionsStyles.sessionHeaderTitle} onPress={() => onNameSession?.()}>
                {(currentName ? currentName + ' • ' : 'Session • ') +
                  formatDate(createdAt || new Date())}
              </Text>
            )}
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