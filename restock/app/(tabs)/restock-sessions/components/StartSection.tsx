import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface StartSectionProps {
  hasExistingSessions: boolean;
  onStartNewSession: () => void;
  onShowSessionSelection: () => void;
  onPromptNewSession?: () => void;
  isLoading?: boolean;
}

export const StartSection: React.FC<StartSectionProps> = ({
  hasExistingSessions,
  onStartNewSession,
  onShowSessionSelection,
  onPromptNewSession,
  isLoading
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  return (
    <View style={restockSessionsStyles.startSection}>
      <Text style={restockSessionsStyles.startPrompt}>What do you want to restock?</Text>
      <Text style={restockSessionsStyles.instructions}>
        Walk around your store with this digital notepad and add products that need restocking. 
        Each product will be organized by supplier for easy email generation.
      </Text>
      
      {hasExistingSessions && (
        <TouchableOpacity 
          style={restockSessionsStyles.existingSessionsButton}
          onPress={onShowSessionSelection}
        >
          <Text style={restockSessionsStyles.existingSessionsButtonText}>
            Continue Existing Session
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={restockSessionsStyles.startButton} 
        onPress={onPromptNewSession || onStartNewSession}
        accessibilityLabel="Create a new restock session"
        accessibilityHint="Opens a dialog to name your session before starting"
      >
        <Text style={restockSessionsStyles.startButtonText}>{isLoading ? 'Starting...' : 'Start New Session'}</Text>
      </TouchableOpacity>
    </View>
  );
};