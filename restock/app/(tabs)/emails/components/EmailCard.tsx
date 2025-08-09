import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { emailsStyles } from '../../../../styles/components/emails';
import { EmailDraft } from '../hooks';

interface EmailCardProps {
  email: EmailDraft;
  onEdit: (email: EmailDraft) => void;
  onSend?: (emailId: string) => Promise<{ success: boolean; message: string }>;
  accentColor?: string;
}

export function EmailCard({ email, onEdit, onSend, accentColor = '#22C55E' }: EmailCardProps) {
  const renderStatusBadge = () => {
    const statusStyles = {
      sending: { backgroundColor: '#FFF3CD', color: '#856404' },
      sent: { backgroundColor: '#D1E7DD', color: '#0F5132' },
      failed: { backgroundColor: '#F8D7DA', color: '#842029' },
      draft: {}
    };

    const statusConfig = {
      sending: { icon: 'sync', text: 'Sending...' },
      sent: { icon: 'checkmark-circle', text: 'Sent' },
      failed: { icon: 'close-circle', text: 'Failed' },
      draft: { icon: null, text: 'Draft' }
    };

    const config = statusConfig[email.status];
    const styles = statusStyles[email.status];

    return (
      <View style={[emailsStyles.statusBadge, styles]}> 
        {config.icon ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={config.icon as any} size={12} color={styles.color} />
            <Text style={[emailsStyles.statusText, { color: styles.color }]}>
              {config.text}
            </Text>
          </View>
        ) : (
          <Text style={emailsStyles.statusText}>{config.text}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[emailsStyles.emailCard, { borderLeftWidth: 4, borderLeftColor: accentColor }] }>
      <View style={emailsStyles.emailCardHeader}>
        <View style={emailsStyles.emailDetails}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={emailsStyles.emailSubject}>{email.subject}</Text>
            {email.isEdited && (
              <View style={emailsStyles.editedBadge}>
                <Text style={emailsStyles.editedBadgeText}>Edited</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Notepad divider line */}
      <View style={emailsStyles.notepadDivider} />
      
      <View style={emailsStyles.emailInfoRow}>
        <Text style={emailsStyles.emailInfoLabel}>To: </Text>
        <Text style={emailsStyles.emailInfoValue}>{email.supplierName}</Text>
      </View>
      
      {/* Notepad divider line */}
      <View style={emailsStyles.notepadDivider} />
      
      <View style={emailsStyles.emailInfoRow}>
        <Text style={emailsStyles.emailInfoLabel}>Email: </Text>
        <Text style={emailsStyles.emailInfoValue}>{email.supplierEmail}</Text>
      </View>
      
      {/* Notepad divider line */}
      <View style={emailsStyles.notepadDivider} />
      
      <Text style={emailsStyles.emailPreview} numberOfLines={3}>
        {email.body}
      </Text>
      
      <View style={emailsStyles.emailActions}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            style={emailsStyles.editButton}
            onPress={() => onEdit(email)}
          >
            <Ionicons name="pencil" size={16} color="#F97316" />
            <Text style={[emailsStyles.editButtonText, { color: '#F97316' }]}>Edit</Text>
          </TouchableOpacity>
          {onSend && (
            <TouchableOpacity 
              style={[emailsStyles.editButton, { backgroundColor: accentColor, borderColor: accentColor }]}
              onPress={async () => {
                if (email.status === 'sent' || email.status === 'sending') return;
                const res = await onSend(email.id);
                if (!res.success) {
                  Alert.alert('Send Email', res.message);
                }
              }}
              disabled={email.status === 'sent' || email.status === 'sending'}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={[emailsStyles.editButtonText, { color: '#FFFFFF' }]}>Send</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {renderStatusBadge()}
      </View>
    </View>
  );
}