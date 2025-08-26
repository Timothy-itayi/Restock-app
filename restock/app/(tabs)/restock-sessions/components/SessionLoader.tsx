import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface SessionLoaderProps {
  message?: string;
  subtitle?: string;
  size?: 'small' | 'large';
}

export const SessionLoader: React.FC<SessionLoaderProps> = ({ 
  message = 'Loading Sessions', 
  subtitle = 'Please wait...',
  size = 'small'
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  
  return (
    <View style={restockSessionsStyles.existingSessionsSection}>
      <Text style={restockSessionsStyles.sectionTitle}>{message}</Text>
      <Text style={restockSessionsStyles.sectionSubtitle}>{subtitle}</Text>
      <View style={{ marginTop: 16, alignItems: 'center' }}>
        <ActivityIndicator size={size} color="#6B7F6B" />
      </View>
    </View>
  );
};
