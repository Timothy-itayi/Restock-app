import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ErrorState } from '../utils/types';
import { restockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface ErrorDisplayProps {
  errorState: ErrorState;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errorState,
  onRetry
}) => {
  if (!errorState.hasError) return null;
  
  return (
    <View style={restockSessionsStyles.errorContainer}>
      <Text style={restockSessionsStyles.errorTitle}>⚠️ Error Loading Data</Text>
      <Text style={restockSessionsStyles.errorStateMessage}>{errorState.errorMessage}</Text>
      <TouchableOpacity 
        style={restockSessionsStyles.retryButton}
        onPress={onRetry}
      >
        <Text style={restockSessionsStyles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};