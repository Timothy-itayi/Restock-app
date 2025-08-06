import React from 'react';
import { Modal, KeyboardAvoidingView, Platform, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { emailsStyles } from '../../../../styles/components/emails';
import { EmailDraft } from '../hooks';

interface EmailEditModalProps {
  visible: boolean;
  editingEmail: EmailDraft | null;
  editedSubject: string;
  editedBody: string;
  onSubjectChange: (text: string) => void;
  onBodyChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EmailEditModal({
  visible,
  editingEmail,
  editedSubject,
  editedBody,
  onSubjectChange,
  onBodyChange,
  onSave,
  onCancel
}: EmailEditModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={emailsStyles.modalContainer}>
          {/* Modal Header */}
          <View style={emailsStyles.modalHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={emailsStyles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={emailsStyles.modalTitle}>Edit Email</Text>
            
            <TouchableOpacity onPress={onSave}>
              <Text style={emailsStyles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={emailsStyles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Supplier Info */}
            {editingEmail && (
              <View style={emailsStyles.modalSupplierInfo}>
                <Text style={emailsStyles.modalSupplierName}>To: {editingEmail.supplierName}</Text>
                <Text style={emailsStyles.modalSupplierEmail}>{editingEmail.supplierEmail}</Text>
              </View>
            )}

            {/* Subject Input */}
            <View style={emailsStyles.modalInputSection}>
              <Text style={emailsStyles.modalInputLabel}>Subject</Text>
              <TextInput
                style={emailsStyles.modalSubjectInput}
                value={editedSubject}
                onChangeText={onSubjectChange}
                placeholder="Email subject"
                multiline={false}
              />
            </View>

            {/* Body Input */}
            <View style={emailsStyles.modalInputSection}>
              <Text style={emailsStyles.modalInputLabel}>Message</Text>
              <TextInput
                style={emailsStyles.modalBodyInput}
                value={editedBody}
                onChangeText={onBodyChange}
                placeholder="Email message"
                multiline={true}
                textAlignVertical="top"
              />
            </View>

            {/* Product List Preview */}
            {editingEmail && (
              <View style={emailsStyles.modalProductsSection}>
                <Text style={emailsStyles.modalInputLabel}>Products in this order</Text>
                <View style={emailsStyles.modalProductsList}>
                  {editingEmail.products.map((product, index) => (
                    <Text key={index} style={emailsStyles.modalProductItem}>
                      • {product}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}