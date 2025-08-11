import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import useThemeStore from '../../../stores/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import { EmailSession } from '../hooks';

interface ActionButtonsProps {
  emailSession: EmailSession;
  onSendAll: () => void;
}

export function ActionButtons({ emailSession, onSendAll }: ActionButtonsProps) {
  const { theme } = useThemeStore();
  const isSending = emailSession.emails.some(email => email.status === 'sending');
  const areAllSent = emailSession.emails.every(email => email.status === 'sent');

  const renderSendButton = () => {
    const isDisabled = isSending || areAllSent;
    
    return (
      <TouchableOpacity 
        style={{
          backgroundColor: isDisabled ? theme.neutral.medium : theme.brand.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          minWidth: 140,
          alignItems: 'center',
          shadowColor: isDisabled ? 'transparent' : theme.brand.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDisabled ? 0 : 0.2,
          shadowRadius: 4,
          elevation: isDisabled ? 0 : 4,
        }} 
        onPress={onSendAll}
        disabled={isDisabled}
      >
        {isSending ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="sync" size={16} color={theme.neutral.lightest} />
            <Text style={{ color: theme.neutral.lightest, fontSize: 16, fontWeight: '600' }}>Sending...</Text>
          </View>
        ) : areAllSent ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="checkmark-circle" size={16} color={theme.neutral.lightest} />
            <Text style={{ color: theme.neutral.lightest, fontSize: 16, fontWeight: '600' }}>All Sent</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="paper-plane" size={16} color={theme.neutral.lightest} />
            <Text style={{ color: theme.neutral.lightest, fontSize: 16, fontWeight: '600' }}>Send All</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 100, // Add extra bottom padding to clear the tab bar
      alignItems: 'center',
    }}>
      {renderSendButton()}
    </View>
  );
};

