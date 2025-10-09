import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../../../lib/stores/useThemeStore';
import { EmailDraft, UserProfile } from '../_hooks';

interface EmailDetailModalProps {
  visible: boolean;
  email: EmailDraft | null;
  userProfile: UserProfile;
  onClose: () => void;
  onEdit: (email: EmailDraft) => void;
  onSend?: (emailId: string) => Promise<{ success: boolean; message: string }>;
}

export function EmailDetailModal({ 
  visible, 
  email, 
  userProfile,
  onClose, 
  onEdit, 
  onSend 
}: EmailDetailModalProps) {
  const { theme } = useThemeStore();
  
  if (!email) return null;

  const handleSend = async () => {
    if (!onSend) return;
    
    // Close the modal first
    onClose();
    
    // Call the parent's send function which will handle all messaging
    await onSend(email.id);
  };

  const getStatusColor = () => {
    switch (email.status) {
      case 'sent': return theme.status.success;
      case 'sending': return theme.status.warning;
      case 'failed': return theme.status.error;
      default: return theme.neutral.medium;
    }
  };

  const getStatusText = () => {
    switch (email.status) {
      case 'sent': return 'Email Sent';
      case 'sending': return 'Sending...';
      case 'failed': return 'Send Failed';
      default: return 'Draft';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.neutral.lightest }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.neutral.light
        }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: theme.neutral.lighter
            }}
          >
            <Ionicons name="close" size={20} color={theme.neutral.medium} />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.neutral.darkest
          }}>
            Email Details
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}>
            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onEdit(email);
              }}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: theme.neutral.lighter
              }}
            >
              <Ionicons name="pencil" size={20} color={theme.neutral.medium} />
            </TouchableOpacity>

            {/* Send Button */}
            {onSend && email.status === 'draft' && (
              <TouchableOpacity
                onPress={handleSend}
                style={{
                  backgroundColor: theme.brand.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Ionicons name="send" size={16} color={theme.neutral.lightest} />
                <Text style={{
                  color: theme.neutral.lightest,
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  Send
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Email Header */}
          <View style={{
            backgroundColor: theme.neutral.lighter,
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.neutral.light
          }}>
            {/* Status Badge */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <View style={{
                backgroundColor: getStatusColor(),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.neutral.lightest
                }} />
                <Text style={{
                  color: theme.neutral.lightest,
                  fontSize: 11,
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}>
                  {getStatusText()}
                </Text>
              </View>
            </View>

            {/* From */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 12,
                color: theme.neutral.medium,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}>
                FROM
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.neutral.darkest,
                marginBottom: 2
              }}>
                {userProfile.storeName || 'Your Store'}
              </Text>
              {userProfile.name && (
                <Text style={{ fontSize: 14, color: theme.neutral.medium }}>
                  {userProfile.name}
                </Text>
              )}
              <Text style={{
                fontSize: 13,
                color: theme.neutral.medium,
                fontFamily: 'monospace'
              }}>
                {userProfile.email}
              </Text>
            </View>

            {/* To */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 12,
                color: theme.neutral.medium,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}>
                TO
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.neutral.darkest,
                marginBottom: 2
              }}>
                {email.supplierName}
              </Text>
              <Text style={{
                fontSize: 13,
                color: theme.neutral.medium,
                fontFamily: 'monospace'
              }}>
                {email.supplierEmail}
              </Text>
            </View>

            {/* Subject */}
            <View>
              <Text style={{
                fontSize: 12,
                color: theme.neutral.medium,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}>
                SUBJECT
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.neutral.darkest,
                lineHeight: 24
              }}>
                {email.subject}
              </Text>
            </View>
          </View>

          {/* Email Body */}
          <View style={{ padding: 20 }}>
            <Text style={{
              fontSize: 12,
              color: theme.neutral.medium,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 12
            }}>
              MESSAGE
            </Text>
            <View style={{
              backgroundColor: theme.neutral.lighter,
              padding: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.neutral.light
            }}>
              <Text style={{
                fontSize: 15,
                lineHeight: 24,
                color: theme.neutral.dark,
                fontFamily: 'system'
              }}>
                {email.body}
              </Text>
            </View>

            {/* Products List */}
            {email.products && email.products.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={{
                  fontSize: 12,
                  color: theme.neutral.medium,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 12
                }}>
                  PRODUCTS ({email.products.length})
                </Text>
                <View style={{
                  backgroundColor: theme.neutral.lighter,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.neutral.light
                }}>
                  {email.products.map((product, index) => (
                    <View
                      key={index}
                      style={{
                        padding: 12,
                        borderBottomWidth: index < email.products.length - 1 ? 1 : 0,
                        borderBottomColor: theme.neutral.light
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: theme.neutral.dark,
                        fontWeight: '500'
                      }}>
                        {product}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}