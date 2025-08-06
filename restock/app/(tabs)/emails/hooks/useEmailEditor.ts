import { useState } from 'react';
import { EmailDraft } from './useEmailSession';

export function useEmailEditor() {
  const [editingEmail, setEditingEmail] = useState<EmailDraft | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const startEditing = (email: EmailDraft) => {
    setEditingEmail(email);
    setEditedSubject(email.subject);
    setEditedBody(email.body);
    setShowEditModal(true);
  };

  const saveEmail = (): { updatedEmail: EmailDraft } | null => {
    if (!editingEmail) return null;

    const updatedEmail = {
      ...editingEmail,
      subject: editedSubject,
      body: editedBody,
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