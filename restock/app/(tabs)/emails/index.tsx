import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getEmailsStyles } from '../../../styles/components/emails';
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { useUserProfile, useEmailEditor, EmailDraft, useEmailSessions } from './_hooks';
import { 
  EmailCard, 
  EmailEditModal, 
  EmailsSummary, 
  EmptyState, 
  SessionTabs,
  SendConfirmationModal,
  EmailDetailModal
} from './_components';
import useThemeStore from '../../../lib/stores/useThemeStore';

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
  } = useEmailSessions(userProfile);
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
  const [bulkSendCompleted, setBulkSendCompleted] = useState(false);

  const isLoading = isUserLoading || isSessionLoading;

  // Refresh sessions when screen comes into focus to ensure state is up to date
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [EmailScreen] Screen focused, refreshing sessions...');
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
    const updatedEmails = activeSession.emails.map((email: EmailDraft) => 
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
    console.log('🚀 [EmailScreen] handleConfirmSend called');
    console.log('🚀 [EmailScreen] isIndividualSend:', isIndividualSend);
    console.log('🚀 [EmailScreen] pendingSendEmail:', pendingSendEmail);
    
    setShowSendConfirmation(false);
    
    if (isIndividualSend && pendingSendEmail) {
      console.log('🚀 [EmailScreen] Individual email send for:', pendingSendEmail.id);
      // Individual email send
      await handleActualSendEmail(pendingSendEmail.id);
      setPendingSendEmail(null);
    } else {
      console.log('🚀 [EmailScreen] Bulk email send - calling sendAllEmails()');
      // Bulk email send
      const result = await sendAllEmails();
      console.log('🚀 [EmailScreen] sendAllEmails result:', result);
      
      if (result.success) {
        console.log('🚀 [EmailScreen] Bulk send successful');
        // Set bulk send completed flag to show success state
        setBulkSendCompleted(true);
        
        // Show success message
        setSuccessMessage("✅ All emails sent successfully! Returning to dashboard...");
        setShowSuccessMessage(true);
        
        // Clear local state immediately - the useEmailSessions hook will handle session clearing
        cancelEdit();
        setShowSuccessMessage(false);
        setSuccessMessage("");
        setBulkSendCompleted(false);
      } else {
        console.error('🚀 [EmailScreen] Bulk send failed:', result.message);
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
    const emailToSend = activeSession?.emails.find((email: EmailDraft) => email.id === emailId);
    if (!emailToSend) return { success: false, message: 'Email not found' };
    
    // Set up for individual send confirmation
    setPendingSendEmail(emailToSend);
    setIsIndividualSend(true);
    setShowSendConfirmation(true);
    
    return { success: true, message: '' };
  };
  
  const handleActualSendEmail = async (emailId: string) => {
    console.log('🚀 [EmailScreen] handleActualSendEmail called with emailId:', emailId);
    console.log('🚀 [EmailScreen] Calling sendEmail(emailId)...');
    
    const result = await sendEmail(emailId);
    console.log('🚀 [EmailScreen] sendEmail result:', result);
    
    if (!result.success) {
      console.error('🚀 [EmailScreen] Email send failed:', result.message);
      Alert.alert('Error', result.message);
    } else {
      console.log('🚀 [EmailScreen] Email send successful');
      // Close edit modal if it's open for this email
      if (editingEmail && editingEmail.id === emailId) {
        cancelEdit();
      }
      
      // Show success message
      const emailName = activeSession?.emails.find((e: EmailDraft) => e.id === emailId)?.supplierName || 'supplier';
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
        <Text style={emailsStyles.headerTitle}>Emails</Text>
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
           !activeSession.emails.some((e: EmailDraft) => e.status === 'sending') && 
           !activeSession.emails.every((e: EmailDraft) => e.status === 'sent') && (
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

          {/* Gmail-style Email List - Only this section is scrollable */}
          {!activeSession.emails.every((e: EmailDraft) => e.status === 'sent') && (
            <View style={{ paddingHorizontal: 16, marginBottom: 80 }}>
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
              <ScrollView 
                style={{ maxHeight: 350 }} 
                showsVerticalScrollIndicator={true}
           
              >
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
          {activeSession.emails.every((e: EmailDraft) => e.status === 'sent') && (
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
        </>
      ) : !isLoading && bulkSendCompleted ? (
        // Show bulk send success state
        <View style={emailsStyles.successContainer}>
          <View style={emailsStyles.successIcon}>
            <Ionicons name="checkmark" size={32} color={theme.neutral.lightest} />
          </View>
          <Text style={emailsStyles.successTitle}>All Emails Sent Successfully!</Text>
          <Text style={emailsStyles.successText}>
            Your professional restock emails have been successfully sent to suppliers. They can now reply directly to your email address.
          </Text>
          <Text style={[emailsStyles.successText, { marginTop: 16, fontSize: 14, color: theme.neutral.medium }]}>
            Returning to dashboard...
          </Text>
        </View>
      ) : !isLoading ? (
        <EmptyState />
      ) : null}

      {/* 🔧 FIXED: Fixed "Send All" button at bottom, above navigation bar */}
      {!isLoading && !bulkSendCompleted && activeSession && activeSession.emails.length > 0 && !activeSession.emails.every((e: EmailDraft) => e.status === 'sent') && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: useThemeStore.getState().theme.neutral.lighter,
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 10, // Clear the tab bar
          borderTopWidth: 1,
          borderTopColor: useThemeStore.getState().theme.neutral.light,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        }}>
          <TouchableOpacity 
            style={{
              backgroundColor: theme.brand.primary,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: 'center',
              shadowColor: theme.brand.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }} 
            onPress={handleSendAllEmails}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="paper-plane" size={20} color={theme.neutral.lightest} />
              <Text style={{ color: theme.neutral.lightest, fontSize: 18, fontWeight: '600' }}>Send All</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

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