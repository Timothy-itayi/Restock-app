import { useState } from 'react';
import { EmailDraft } from './useEmailSession';
import { UserProfile } from './useUserProfile';

export function useEmailEditor(userProfile: UserProfile) {
  const [editingEmail, setEditingEmail] = useState<EmailDraft | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const startEditing = (email: EmailDraft) => {
    setEditingEmail(email);
    setEditedSubject(email.subject);
    
    // Update the email body with current user profile data in the signature
    const updatedBody = updateEmailSignature(email.body, userProfile);
    setEditedBody(updatedBody);
    
    setShowEditModal(true);
  };

  const updateEmailSignature = (emailBody: string, profile: UserProfile): string => {
    // Extract the main content before the signature
    const signaturePattern = /\n\nBest regards,?\n.*$/s;
    const match = emailBody.match(signaturePattern);
    
    if (match) {
      // Remove the old signature
      const contentBeforeSignature = emailBody.replace(signaturePattern, '');
      
      // Create new signature with current user data
      const newSignature = `\n\nBest regards,\n${profile.name || 'Store Manager'}\n${profile.storeName || 'Your Store'}\n${profile.email || 'manager@store.com'}`;
      
      return contentBeforeSignature + newSignature;
    }
    
    // If no signature found, append one
    const newSignature = `\n\nBest regards,\n${profile.name || 'Store Manager'}\n${profile.storeName || 'Your Store'}\n${profile.email || 'manager@store.com'}`;
    return emailBody + newSignature;
  };

  const saveEmail = (): { updatedEmail: EmailDraft } | null => {
    if (!editingEmail) return null;

    // Ensure the signature is updated with current user data before saving
    const finalBody = updateEmailSignature(editedBody, userProfile);

    const updatedEmail = {
      ...editingEmail,
      subject: editedSubject,
      body: finalBody,
      isEdited: true
    };

    // Reset editing state
    cancelEdit();

    return { updatedEmail };
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingEmail(null);
    setEditedSubject('');
    setEditedBody('');
  };

  return {
    // State
    editingEmail,
    editedSubject,
    editedBody,
    showEditModal,
    
    // Actions
    startEditing,
    saveEmail,
    cancelEdit,
    
    // Setters for controlled inputs
    setEditedSubject,
    setEditedBody
  };
}