import React from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { typography } from '../../styles/typography';
import colors, { AppColors } from '../theme/colors';

interface NameSessionModalProps {
  visible: boolean;
  title: string;
  message: string;
  inputPlaceholder?: string;
  inputValue: string;
  onChangeInput: (text: string) => void;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const NameSessionModal: React.FC<NameSessionModalProps> = ({
  visible,
  title,
  message,
  inputPlaceholder = 'Name this session',
  inputValue,
  onChangeInput,
  confirmText = 'Create Session',
  cancelText = 'Create Without Name',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.dialog}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.message}>{message}</Text>
              <TextInput
                style={styles.input}
                placeholder={inputPlaceholder}
                placeholderTextColor="#6C757D"
                value={inputValue}
                onChangeText={onChangeInput}
                returnKeyType="done"
                onSubmitEditing={() => {
                  const trimmed = (inputValue || '').trim();
                  if (trimmed.length > 0) {
                    onConfirm();
                  }
                }}
                autoFocus
              />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} activeOpacity={0.7}>
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    shadowOffset: { width: 0, height: 8 },
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
    ...typography.bodyMedium,
    color: '#6C757D',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    ...typography.bodyMedium,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    color: '#212529',
    minHeight: 52,
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
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  cancelButtonText: {
    ...typography.bodyMedium,
    color: '#6C757D',
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary as AppColors['brand']['primary'] as string    ,
    borderWidth: 1,
    borderColor: colors.brand.primary as AppColors['brand']['primary'] as string,
  },
  confirmButtonText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default NameSessionModal;


