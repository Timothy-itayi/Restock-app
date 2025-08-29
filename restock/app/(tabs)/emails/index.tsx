import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getEmailsStyles } from "../../../styles/components/emails";
import { useThemedStyles } from "../../../styles/useThemedStyles";
import { useUserProfile, useEmailEditor, EmailDraft, useEmailSessions } from './hooks';
import { 
  EmailCard, 
  EmailEditModal, 
  EmailsSummary, 
  EmptyState, 
  ActionButtons,
  SessionTabs,
  SendConfirmationModal,
  EmailDetailModal
} from './components';
import useThemeStore from '../../stores/useThemeStore';

export default function EmailsScreen() {
  // Use themed styles
  const emailsStyles = useThemedStyles(getEmailsStyles);
  const { theme } = useThemeStore();
  
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
    refreshSessions,
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
  } = useEmailEditor(userProfile);

  // Local state for custom modal
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailDraft | null>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const [pendingSendEmail, setPendingSendEmail] = useState<EmailDraft | null>(null);
  const [isIndividualSend, setIsIndividualSend] = useState(false);

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
    setPendingSendEmail(null);
    setIsIndividualSend(false);
    setShowSendConfirmation(true);
  };

  const handleConfirmSend = async () => {
    setShowSendConfirmation(false);
    
    if (isIndividualSend && pendingSendEmail) {
      // Individual email send
      await handleActualSendEmail(pendingSendEmail.id);
      setPendingSendEmail(null);
    } else {
      // Bulk email send
      const result = await sendAllEmails();
      if (result.success) {
        // Show success message
        setSuccessMessage("✅ All emails sent successfully! Returning to dashboard...");
        setShowSuccessMessage(true);
        
        // Wait 2.5 seconds then clear and navigate
        setTimeout(() => {
          setActiveSessionId(null);
          cancelEdit();
          refreshSessions();
          setShowSuccessMessage(false);
          setSuccessMessage("");
        }, 2500);
      } else {
        // Only show alert on error
        Alert.alert(
          "Error Sending Emails",
          result.message,
          [{ text: "OK" }]
        );
      }
    }
  };

  const handleCancelSend = () => {
    setShowSendConfirmation(false);
    setPendingSendEmail(null);
    setIsIndividualSend(false);
  };

  const handleEmailTap = (email: EmailDraft) => {
    setSelectedEmail(email);
    setShowEmailDetail(true);
  };

  const handleCloseEmailDetail = () => {
    setShowEmailDetail(false);
    setSelectedEmail(null);
  };

  const handleSendEmail = async (emailId: string) => {
    // Find the email to send
    const emailToSend = activeSession?.emails.find(email => email.id === emailId);
    if (!emailToSend) return { success: false, message: 'Email not found' };
    
    // Set up for individual send confirmation
    setPendingSendEmail(emailToSend);
    setIsIndividualSend(true);
    setShowSendConfirmation(true);
    
    return { success: true, message: '' };
  };
  
  const handleActualSendEmail = async (emailId: string) => {
    const result = await sendEmail(emailId);
    if (!result.success) {
      Alert.alert('Error', result.message);
    } else {
      // Close edit modal if it's open for this email
      if (editingEmail && editingEmail.id === emailId) {
        cancelEdit();
      }
      
      // Show success message
      const emailName = activeSession?.emails.find(e => e.id === emailId)?.supplierName || 'supplier';
      setSuccessMessage(`✅ Email sent successfully to ${emailName}!`);
      setShowSuccessMessage(true);
      
      // Wait 2 seconds then clear message
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage("");
      }, 2000);
    }
    return result;
  };

  // Remove the handleClearSession function since we removed the clear button

  return (
    <View style={[emailsStyles.container, { backgroundColor: useThemeStore.getState().theme.neutral.lighter }]}>
      {/* Header */}
      <View style={emailsStyles.header}>
        <Text style={emailsStyles.headerTitle}>Generated Emails</Text>
      </View>

    
      {/* Show loading state */}
      {isLoading && (
        <View style={{ padding: 32, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: theme.neutral.medium }}>
            Loading emails...
          </Text>
        </View>
      )}

      {/* 🔧 FIXED: Show emails if we have them, regardless of SessionContext state */}
      {!isLoading && emailSessions.length > 0 && activeSession && activeSession.emails.length > 0 ? (
        <>
          {/* Session Tabs - hide during sending process and after all emails sent */}
          {emailSessions.length > 1 && 
           !activeSession.emails.some(e => e.status === 'sending') && 
           !activeSession.emails.every(e => e.status === 'sent') && (
            <SessionTabs
              sessions={emailSessions}
              activeSessionId={activeSessionId || ''}
              onSessionChange={(id) => setActiveSessionId(id)}
            />
          )}

          {/* Email Summary - always show if we have emails */}
          <EmailsSummary 
            emailCount={activeSession.emails.length}
            userProfile={userProfile}
          />

          {/* Gmail-style Email List */}
          {!activeSession.emails.every(e => e.status === 'sent') && (
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.neutral.dark,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                Email Drafts ({activeSession.emails.length})
              </Text>
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {activeSession.emails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    onEdit={handleEditEmail}
                    onSend={handleSendEmail}
                    onTap={handleEmailTap}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Success message when all emails are sent */}
          {activeSession.emails.every(e => e.status === 'sent') && (
            <View style={emailsStyles.successContainer}>
              <View style={emailsStyles.successIcon}>
                <Ionicons name="checkmark" size={32} color={theme.neutral.lightest} />
              </View>
              <Text style={emailsStyles.successTitle}>All Emails Sent!</Text>
              <Text style={emailsStyles.successText}>
                Your {activeSession.emails.length} professional restock emails have been successfully sent to suppliers. They can now reply directly to your email address.
              </Text>
            </View>
          )}

          {/* Action Buttons - only show if we have emails and they're not all sent */}
          {!activeSession.emails.every(e => e.status === 'sent') && (
            <ActionButtons
              emailSession={activeSession}
              onSendAll={handleSendAllEmails}
            />
          )}
        </>
      ) : !isLoading ? (
        <EmptyState />
      ) : null}

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: theme.neutral.lightest,
            padding: 32,
            borderRadius: 16,
            alignItems: 'center',
            marginHorizontal: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.brand.primary,
              textAlign: 'center',
              marginBottom: 8
            }}>
              {successMessage}
            </Text>
            <View style={{
              width: 48,
              height: 4,
              backgroundColor: theme.brand.primary,
              borderRadius: 2,
              marginTop: 16
            }}>
              <View style={{
                height: '100%',
                backgroundColor: theme.status.success,
                borderRadius: 2,
                width: '100%'
              }} />
            </View>
          </View>
        </View>
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
        emailCount={isIndividualSend ? 1 : (activeSession?.emails.length || 0)}
        onConfirm={handleConfirmSend}
        onCancel={handleCancelSend}
        isIndividualSend={isIndividualSend}
        supplierName={pendingSendEmail?.supplierName || ''}
      />

      {/* Email Detail Modal */}
      <EmailDetailModal
        visible={showEmailDetail}
        email={selectedEmail}
        userProfile={userProfile}
        onClose={handleCloseEmailDetail}
        onEdit={handleEditEmail}
        onSend={handleSendEmail}
      />
    </View>


  );
}