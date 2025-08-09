import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RestockSession } from '../utils/types';
import { restockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface StartSectionProps {
  allSessions: RestockSession[];
  onStartNewSession: () => void;
  onShowSessionSelection: () => void;
  onPromptNewSession?: () => void;
}

export const StartSection: React.FC<StartSectionProps> = ({
  allSessions,
  onStartNewSession,
  onShowSessionSelection,
  onPromptNewSession
}) => {
  return (
    <View style={restockSessionsStyles.startSection}>
      <Text style={restockSessionsStyles.startPrompt}>What do you want to restock?</Text>
      <Text style={restockSessionsStyles.instructions}>
        Walk around your store with this digital notepad and add products that need restocking. 
        Each product will be organized by supplier for easy email generation.
      </Text>
      
      {allSessions.length > 0 && (
        <TouchableOpacity 
          style={restockSessionsStyles.existingSessionsButton}
          onPress={onShowSessionSelection}
        >
          <Text style={restockSessionsStyles.existingSessionsButtonText}>
            Continue Existing Session ({allSessions.length})
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={restockSessionsStyles.startButton} 
        onPress={onPromptNewSession || onStartNewSession}
        accessibilityLabel="Create a new restock session"
        accessibilityHint="Opens a dialog to name your session before starting"
      >
        <Text style={restockSessionsStyles.startButtonText}>Start New Restock</Text>
      </TouchableOpacity>
    </View>
  );
};