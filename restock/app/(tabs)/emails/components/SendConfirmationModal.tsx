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
import { typography } from '../../../../styles/typography';

interface SendConfirmationModalProps {
  visible: boolean;
  emailCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SendConfirmationModal: React.FC<SendConfirmationModalProps> = ({
  visible,
  emailCount,
  onConfirm,
  onCancel,
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
              <Ionicons name="mail" size={24} color="#22C55E" />
              <Text style={styles.title}>Send All Emails</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.message}>
                Ready to send {emailCount} professional emails to your suppliers?
              </Text>

              <View style={styles.emailCountContainer}>
                <Text style={styles.emailCountValue}>{emailCount}</Text>
                <Text style={styles.emailCountLabel}>Emails to Send</Text>
              </View>

              <Text style={styles.note}>
                Your suppliers will receive professional restock orders and can reply directly to you.
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
                <Text style={styles.confirmButtonText}>Send All</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: Math.min(screenWidth - 40, 400),
    shadowColor: '#000000',
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
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  title: {
    ...typography.subsectionHeader,
    color: '#212529',
    fontWeight: '600',
  },

  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },

  message: {
    ...typography.body,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },

  emailCountContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  emailCountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 4,
  },

  emailCountLabel: {
    ...typography.caption,
    color: '#16A34A',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  note: {
    ...typography.small,
    color: '#6B7280',
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
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },

  cancelButtonText: {
    ...typography.body,
    color: '#6C757D',
    fontWeight: '600',
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    borderWidth: 1,
    borderColor: '#22C55E',
  },

  confirmButtonIcon: {
    marginRight: 8,
  },

  confirmButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});