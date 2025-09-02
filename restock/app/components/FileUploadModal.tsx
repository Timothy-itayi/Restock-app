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
import useThemeStore from '../stores/useThemeStore';

interface FileUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadFile: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  visible,
  onClose,
  onUploadFile,
}) => {
  const { theme } = useThemeStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.dialog, { backgroundColor: theme.neutral.lightest }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.neutral.darkest }]}>
                Upload Catalog
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.neutral.darkest} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.message, { color: theme.neutral.dark }]}>
                Upload your product catalog file
              </Text>

              {/* Upload Option */}
              <TouchableOpacity 
                style={[styles.uploadButton, { backgroundColor: theme.neutral.lighter }]}
                onPress={onUploadFile}
                activeOpacity={0.7}
              >
                <View style={[styles.uploadIcon, { backgroundColor: theme.brand.primary }]}>
                  <Ionicons name="document-outline" size={32} color={theme.neutral.lightest} />
                </View>
                <Text style={[styles.uploadTitle, { color: theme.neutral.darkest }]}>
                  Choose File
                </Text>
                <Text style={[styles.uploadDescription, { color: theme.neutral.medium }]}>
                  PDF, Excel, or CSV files supported
                </Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: theme.neutral.light }]} 
                onPress={onClose} 
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: theme.neutral.dark }]}>
                  Cancel
                </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth - 32,
    maxWidth: 400,
  },
  dialog: {
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    ...typography.subsectionHeader,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  message: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(107, 127, 107, 0.2)',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadDescription: {
    ...typography.caption,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
});
