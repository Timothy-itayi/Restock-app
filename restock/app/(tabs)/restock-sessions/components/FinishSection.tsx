import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface FinishSectionProps {
  session: any | null; // domain session or legacy type
  onFinishSession: () => void;
}

export const FinishSection: React.FC<FinishSectionProps> = ({
  session,
  onFinishSession
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const productsCount = session && typeof session.toValue === 'function'
    ? (session.toValue().items?.length || 0)
    : (session?.products?.length || 0);
  // Only show if we have products
  if (!session || productsCount === 0) {
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