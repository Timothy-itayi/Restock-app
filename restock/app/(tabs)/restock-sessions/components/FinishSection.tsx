import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RestockSession } from '../utils/types';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface FinishSectionProps {
  currentSession: RestockSession | null;
  showAddProductForm: boolean;
  showEditProductForm: boolean;
  onFinishSession: () => void;
}

export const FinishSection: React.FC<FinishSectionProps> = ({
  currentSession,
  showAddProductForm,
  showEditProductForm,
  onFinishSession
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  // Only show if we have products and not in form mode
  if (!currentSession || 
      currentSession.products.length === 0 || 
      showAddProductForm || 
      showEditProductForm) {
    return null;
  }

  return (
    <View style={restockSessionsStyles.bottomFinishSection}>
      <TouchableOpacity 
        style={restockSessionsStyles.bottomFinishButton} 
        onPress={onFinishSession}
      >
        <Text style={restockSessionsStyles.bottomFinishButtonText}>
          Finish & Generate Emails
        </Text>
      </TouchableOpacity>
    </View>
  );
};