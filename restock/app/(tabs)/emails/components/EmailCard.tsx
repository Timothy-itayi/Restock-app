import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/theme/colors';
import { EmailDraft } from '../hooks';

interface EmailCardProps {
  email: EmailDraft;
  onEdit: (email: EmailDraft) => void;
  onSend?: (emailId: string) => Promise<{ success: boolean; message: string }>;
  onTap?: (email: EmailDraft) => void;
  accentColor?: string;
}

export function EmailCard({ 
  email, 
  onEdit, 
  onSend, 
  onTap,
  accentColor = '#22C55E' 
}: EmailCardProps) {
  
  const renderStatusIndicator = () => {
    const statusConfig = {
      sending: { icon: 'sync', color: colors.status.warning },
      sent: { icon: 'checkmark-circle', color: colors.status.success },
      failed: { icon: 'close-circle', color: colors.status.error },
      draft: { icon: 'create-outline', color: colors.neutral.medium }
    };

    const config = statusConfig[email.status];
    return (
      <View style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: config.color,
        marginRight: 8
      }} />
    );
  };

  const getPreviewText = () => {
    // Extract first line or first 80 characters
    const firstLine = email.body.split('\n')[0];
    return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.neutral.lightest,
        borderRadius: 8,
        marginBottom: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.neutral.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
      }}
      onPress={() => onTap?.(email)}
      activeOpacity={0.7}
    >
      {/* Gmail-style header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        {/* Left side - Status and Supplier */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {renderStatusIndicator()}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.neutral.darkest,
              marginBottom: 2
            }}>
              {email.supplierName}
            </Text>
            <Text style={{
              fontSize: 12,
              color: colors.neutral.medium,
              fontFamily: 'monospace'
            }}>
              {email.supplierEmail}
            </Text>
          </View>
        </View>

        {/* Right side - Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          
        

          {/* Edit button */}
          <TouchableOpacity
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: colors.neutral.lighter
            }}
            onPress={() => onEdit(email)}
          >
            <Ionicons name="pencil" size={16} color={colors.neutral.medium} />
          </TouchableOpacity>
          
          {/* Chevron to indicate it's tappable */}
          <Ionicons name="chevron-forward" size={16} color={colors.neutral.medium} />
        </View>
      </View>

      {/* Subject line */}
      <View style={{ marginBottom: 6 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: colors.neutral.dark,
          marginBottom: 2
        }}>
          {email.subject}
        </Text>
      </View>

      {/* Preview text */}
      <Text style={{
        fontSize: 13,
        color: colors.neutral.medium,
        lineHeight: 18
      }} numberOfLines={1}>
        {getPreviewText()}
      </Text>

      {/* Status indicator for sent/sending emails */}
      {email.status !== 'draft' && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.neutral.lighter
        }}>
          <Ionicons 
            name={
              email.status === 'sent' ? 'checkmark-circle' :
              email.status === 'sending' ? 'sync' : 'close-circle'
            }
            size={14}
            color={
              email.status === 'sent' ? colors.status.success :
              email.status === 'sending' ? colors.status.warning : colors.status.error
            }
          />
          <Text style={{
            fontSize: 11,
            color: colors.neutral.medium,
            marginLeft: 4,
            textTransform: 'capitalize'
          }}>
            {email.status === 'sending' ? 'Sending...' : email.status}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}