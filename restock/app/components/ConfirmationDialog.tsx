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
import { typography } from '../../styles/typography';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmIcon,
  onConfirm,
  onCancel,
  stats,
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
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.message}>{message}</Text>

              {/* Stats Section */}
              {stats && stats.length > 0 && (
                <View style={styles.statsContainer}>
                  {stats.map((stat, index) => (
                    <View key={index} style={styles.statItem}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                {confirmIcon && (
                  <Ionicons 
                    name={confirmIcon} 
                    size={20} 
                    color="white" 
                    style={styles.confirmButtonIcon} 
                  />
                )}
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
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
  },

  title: {
    ...typography.subsectionHeader,
    color: '#212529',
    fontWeight: '600',
    textAlign: 'center',
  },

  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  message: {
    ...typography.body,
    color: '#6C757D',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    ...typography.h3,
    color: '#212529',
    fontWeight: '700',
    marginBottom: 4,
  },

  statLabel: {
    ...typography.caption,
    color: '#6C757D',
    fontWeight: '500',
    textAlign: 'center',
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
    paddingVertical: 14,
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
    paddingVertical: 14,
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