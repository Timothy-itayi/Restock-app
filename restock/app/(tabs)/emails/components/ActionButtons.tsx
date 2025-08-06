import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { emailsStyles } from '../../../../styles/components/emails';
import { EmailSession } from '../hooks';

interface ActionButtonsProps {
  emailSession: EmailSession;
  onSendAll: () => void;
  onClear: () => void;
}

export function ActionButtons({ emailSession, onSendAll, onClear }: ActionButtonsProps) {
  const isSending = emailSession.emails.some(email => email.status === 'sending');
  const areAllSent = emailSession.emails.every(email => email.status === 'sent');

  const renderSendButton = () => {
    const isDisabled = isSending || areAllSent;
    
    return (
      <TouchableOpacity 
        style={[
          emailsStyles.sendAllButton,
          isDisabled && { opacity: 0.6, backgroundColor: '#6C757D' }
        ]} 
        onPress={onSendAll}
        disabled={isDisabled}
      >
        {isSending ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="sync" size={16} color="#FFFFFF" />
            <Text style={emailsStyles.sendAllButtonText}>Sending Emails...</Text>
          </View>
        ) : areAllSent ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={emailsStyles.sendAllButtonText}>All Emails Sent</Text>
          </View>
        ) : (
          <Text style={emailsStyles.sendAllButtonText}>Send All Emails</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}>
      {renderSendButton()}
      
      <TouchableOpacity 
        style={[emailsStyles.sendAllButton, { backgroundColor: '#F8F9FA', borderColor: '#DEE2E6' }]} 
        onPress={onClear}
      >
        <Text style={[emailsStyles.sendAllButtonText, { color: '#6C757D' }]}>Clear Session</Text>
      </TouchableOpacity>
    </View>
  );
}