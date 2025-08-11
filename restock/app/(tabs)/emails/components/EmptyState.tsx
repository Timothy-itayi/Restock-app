import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEmailsStyles } from '../../../../styles/components/emails';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import useThemeStore from '../../../stores/useThemeStore';

export function EmptyState() {
  const emailsStyles = useThemedStyles(getEmailsStyles);
  const { theme } = useThemeStore();
  
  return (
    <View style={emailsStyles.emptyState}>
      <View style={emailsStyles.progressIcon}>
        <Ionicons name="mail-outline" size={64} color={theme.neutral.medium} />
      </View>
      
      <Text style={emailsStyles.progressTitle}>
        No Emails Yet
      </Text>
      
      <Text style={emailsStyles.emptyStateText}>
        Emails will appear here once you generate them from your restock sessions.
      </Text>
      
      <Text style={emailsStyles.progressSubtitle}>
        Navigate to the Restock Sessions tab to create a session and generate supplier emails.
      </Text>
    </View>
  );
}