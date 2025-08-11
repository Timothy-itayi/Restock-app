import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/theme/colors';
import { typography } from '../../../../styles/typography';

interface SendConfirmationModalProps {
  visible: boolean;
  emailCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isIndividualSend?: boolean;
  supplierName?: string;
}

export const SendConfirmationModal: React.FC<SendConfirmationModalProps> = ({
  visible,
  emailCount,
  onConfirm,
  onCancel,
  isIndividualSend = false,
  supplierName = '',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.dialog}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="mail" size={24} color={colors.brand.primary} />
              <Text style={styles.title}>{isIndividualSend ? 'Send Email' : 'Send All Emails'}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.message}>
                {isIndividualSend 
                  ? `Ready to send this professional email to ${supplierName}?`
                  : `Ready to send ${emailCount} professional emails to your suppliers?`
                }
              </Text>

              <View style={styles.emailCountContainer}>
                <Text style={styles.emailCountValue}>{emailCount}</Text>
                <Text style={styles.emailCountLabel}>{isIndividualSend ? 'Email to Send' : 'Emails to Send'}</Text>
              </View>

              <Text style={styles.note}>
                {isIndividualSend 
                  ? `${supplierName} will receive a professional restock order and can reply directly to you.`
                  : 'Your suppliers will receive professional restock orders and can reply directly to you.'
                }
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="paper-plane" 
                  size={18} 
                  color="white" 
                  style={styles.confirmButtonIcon} 
                />
                <Text style={styles.confirmButtonText}>{isIndividualSend ? 'Send' : 'Send All'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  dialog: {
    backgroundColor: colors.neutral.lightest,
    borderRadius: 12,
    width: Math.min(screenWidth - 40, 400),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  title: {
    ...typography.subsectionHeader,
    color: colors.neutral.darkest,
    fontWeight: '600',
  },

  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },

  message: {
    ...typography.body,
    color: colors.neutral.dark,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },

  emailCountContainer: {
    backgroundColor: colors.status.success + '22',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.status.success + '44',
  },

  emailCountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.brand.primary,
    marginBottom: 4,
  },

  emailCountLabel: {
    ...typography.caption,
    color: colors.status.success,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  note: {
    ...typography.small,
    color: colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.neutral.lighter,
    borderWidth: 1,
    borderColor: colors.neutral.light,
  },

  cancelButtonText: {
    ...typography.body,
    color: colors.neutral.medium,
    fontWeight: '600',
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },

  confirmButtonIcon: {
    marginRight: 8,
  },

  confirmButtonText: {
    ...typography.body,
    color: colors.neutral.lightest,
    fontWeight: '600',
  },
});