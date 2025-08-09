import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { emailsStyles } from "../../../styles/components/emails";
import { useUserProfile, useEmailSessions, useEmailEditor } from './hooks';
import { 
  EmailCard, 
  EmailEditModal, 
  EmailsSummary, 
  EmailTemplates,
  EmptyState, 
  ActionButtons,
  SessionTabs,
  SendConfirmationModal
} from './components';
import { getSessionColorTheme } from '../restock-sessions/utils/colorUtils';

export default function EmailsScreen() {
  // Custom hooks for separation of concerns
  const { userProfile, isLoading: isUserLoading, userId } = useUserProfile();
  const { 
    emailSessions,
    activeSession, 
    activeSessionId,
    isLoading: isSessionLoading, 
    setActiveSessionId,
    updateEmailInSession, 
    sendAllEmails,
    sendEmail,
    refreshSessions
  } = useEmailSessions(userProfile, userId || undefined);
  const { 
    editingEmail, 
    editedSubject, 
    editedBody, 
    showEditModal, 
    startEditing, 
    saveEmail, 
    cancelEdit, 
    setEditedSubject, 
    setEditedBody 
  } = useEmailEditor();

  // Local state for custom modal
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);

  const isLoading = isUserLoading || isSessionLoading;

  // Refresh sessions when screen gains focus (handles coming from Restock tab)
  useFocusEffect(
    React.useCallback(() => {
      refreshSessions();
    }, [refreshSessions])
  );

  // Handle email editing
  const handleEditEmail = (email: any) => {
    startEditing(email);
  };

  const handleSaveEmail = async () => {
    if (!activeSession) return;

    const result = saveEmail();
    if (!result) return;

    const { updatedEmail } = result;
    
    // Update the email in the session
    const updatedEmails = activeSession.emails.map(email => 
      email.id === updatedEmail.id ? updatedEmail : email
    );

    await updateEmailInSession(updatedEmails);
  };

  // Handle bulk email sending
  const handleSendAllEmails = () => {
    if (!activeSession) return;
    setShowSendConfirmation(true);
  };

  const handleConfirmSendAll = async () => {
    setShowSendConfirmation(false);
    
    const result = await sendAllEmails();
    if (result.success) {
      // Clear immediately to avoid lingering UI
      setActiveSessionId(null);
      // Close any open edit modal
      cancelEdit();
      await refreshSessions();
      
      // No alert needed - the UI will show the empty state
    } else {
      // Only show alert on error
      Alert.alert(
        "Error Sending Emails",
        result.message,
        [{ text: "OK" }]
      );
    }
  };

  const handleCancelSend = () => {
    setShowSendConfirmation(false);
  };

  const handleSendEmail = async (emailId: string) => {
    const result = await sendEmail(emailId);
    if (!result.success) {
      Alert.alert('Error', result.message);
    } else {
      // Close edit modal if it's open for this email
      if (editingEmail && editingEmail.id === emailId) {
        cancelEdit();
      }
      // The useEmailSessions hook now handles clearing the session automatically
      // when the last email is sent, so no need to refresh here
    }
    return result;
  };

  // Remove the handleClearSession function since we removed the clear button

  const handleUseTemplate = (template: any) => {
    // For now, just show that templates are available
    // In a full implementation, this would integrate with the email creation flow
    Alert.alert(
      'Template Applied',
      `Template "${template.name}" has been applied. You can now create new emails based on this template.`,
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return (
      <View style={emailsStyles.container}>
        <View style={emailsStyles.header}>
          <Text style={emailsStyles.headerTitle}>Emails</Text>
        </View>
        <View style={emailsStyles.emptyState}>
          <Text style={emailsStyles.emptyStateText}>Loading emails...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={emailsStyles.container}>
      {/* Header */}
      <View style={emailsStyles.header}>
        <Text style={emailsStyles.headerTitle}>Generated Emails</Text>
      </View>

      {/* Show empty state if no session data OR no active session */}
      {emailSessions.length === 0 || !activeSession ? (
        <EmptyState />
      ) : (
        <>
          {/* Session Tabs - hide during sending process and after all emails sent */}
          {emailSessions.length > 1 && 
           !activeSession.emails.some(e => e.status === 'sending') && 
           !activeSession.emails.every(e => e.status === 'sent') && (
            <SessionTabs
              sessions={emailSessions}
              activeSessionId={activeSessionId}
              onSessionChange={setActiveSessionId}
            />
          )}

          {/* Email Templates - hide during sending process and after all emails sent */}
          {activeSession && 
           activeSession.emails.length > 0 && 
           !activeSession.emails.some(e => e.status === 'sending') &&
           !activeSession.emails.every(e => e.status === 'sent') && (
            <EmailTemplates
              recentEmails={[...activeSession.emails]}
              onUseTemplate={handleUseTemplate}
            />
          )}

          {/* Email Summary - always show if we have emails */}
          {activeSession && activeSession.emails.length > 0 && (
            <EmailsSummary 
              emailCount={activeSession.emails.length}
              userProfile={userProfile}
            />
          )}

          {/* Email List - only show if emails haven't all been sent */}
          {activeSession && 
           activeSession.emails.length > 0 && 
           !activeSession.emails.every(e => e.status === 'sent') && (
            <ScrollView style={emailsStyles.emailList} showsVerticalScrollIndicator={false}>
              {activeSession.emails.map((email) => {
                const accent = getSessionColorTheme(activeSession.id).primary;
                return (
                  <EmailCard
                    key={email.id}
                    email={email}
                    onEdit={handleEditEmail}
                    onSend={handleSendEmail}
                    accentColor={accent}
                  />
                );
              })}
            </ScrollView>
          )}

          {/* Success message when all emails are sent */}
          {activeSession && 
           activeSession.emails.length > 0 && 
           activeSession.emails.every(e => e.status === 'sent') && (
            <View style={emailsStyles.successContainer}>
              <View style={emailsStyles.successIcon}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </View>
              <Text style={emailsStyles.successTitle}>All Emails Sent!</Text>
              <Text style={emailsStyles.successText}>
                Your {activeSession.emails.length} professional restock emails have been successfully sent to suppliers. They can now reply directly to your email address.
              </Text>
            </View>
          )}

          {/* Action Buttons - only show if we have emails and they're not all sent */}
          {activeSession && 
           activeSession.emails.length > 0 && 
           !activeSession.emails.every(e => e.status === 'sent') && (
            <ActionButtons
              emailSession={activeSession}
              onSendAll={handleSendAllEmails}
            />
          )}
        </>
      )}

      {/* Email Edit Modal */}
      <EmailEditModal
        visible={showEditModal}
        editingEmail={editingEmail}
        editedSubject={editedSubject}
        editedBody={editedBody}
        onSubjectChange={setEditedSubject}
        onBodyChange={setEditedBody}
        onSave={handleSaveEmail}
        onCancel={cancelEdit}
      />

      {/* Send Confirmation Modal */}
      <SendConfirmationModal
        visible={showSendConfirmation}
        emailCount={activeSession?.emails.length || 0}
        onConfirm={handleConfirmSendAll}
        onCancel={handleCancelSend}
      />
    </View>
  );
}