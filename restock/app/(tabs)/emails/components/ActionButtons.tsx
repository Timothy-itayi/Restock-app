import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmailSession } from '../hooks';

interface ActionButtonsProps {
  emailSession: EmailSession;
  onSendAll: () => void;
}

export function ActionButtons({ emailSession, onSendAll }: ActionButtonsProps) {
  const isSending = emailSession.emails.some(email => email.status === 'sending');
  const areAllSent = emailSession.emails.every(email => email.status === 'sent');

  const renderSendButton = () => {
    const isDisabled = isSending || areAllSent;
    
    return (
      <TouchableOpacity 
        style={[
          styles.sendButton,
          isDisabled && styles.sendButtonDisabled
        ]} 
        onPress={onSendAll}
        disabled={isDisabled}
      >
        {isSending ? (
          <View style={styles.buttonContent}>
            <Ionicons name="sync" size={16} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>Sending...</Text>
          </View>
        ) : areAllSent ? (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>All Sent</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>Send All</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderSendButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  sendButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  sendButtonDisabled: {
    backgroundColor: '#6C757D',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});