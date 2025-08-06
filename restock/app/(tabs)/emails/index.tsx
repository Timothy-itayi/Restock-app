import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { emailsStyles } from "../../../styles/components/emails";
import { useUserProfile, useEmailSession, useEmailEditor } from './hooks';
import { 
  EmailCard, 
  EmailEditModal, 
  EmailsSummary, 
  EmptyState, 
  ActionButtons 
} from './components';

export default function EmailsScreen() {
  // Custom hooks for separation of concerns
  const { userProfile, isLoading: isUserLoading, userId } = useUserProfile();
  const { 
    emailSession, 
    isLoading: isSessionLoading, 
    updateEmailInSession, 
    sendAllEmails, 
    clearSession 
  } = useEmailSession(userProfile, userId || undefined);
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

  const isLoading = isUserLoading || isSessionLoading;

  // Handle email editing
  const handleEditEmail = (email: any) => {
    startEditing(email);
  };

  const handleSaveEmail = async () => {
    if (!emailSession) return;

    const result = saveEmail();
    if (!result) return;

    const { updatedEmail } = result;
    
    // Update the email in the session
    const updatedEmails = emailSession.emails.map(email => 
      email.id === updatedEmail.id ? updatedEmail : email
    );

    await updateEmailInSession(updatedEmails);
  };

  // Handle bulk email sending
  const handleSendAllEmails = () => {
    if (!emailSession) return;

    Alert.alert(
      "Send All Emails",
      `Are you sure you want to send ${emailSession.emails.length} emails to your suppliers?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send All",
          onPress: async () => {
            const result = await sendAllEmails();
            
            if (result.success) {
              Alert.alert(
                "Emails Sent Successfully",
                result.message,
                [
                  {
                    text: "OK",
                    onPress: () => clearSession()
                  }
                ]
              );
            } else {
              Alert.alert(
                "Error Sending Emails",
                result.message,
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  // Handle session clearing
  const handleClearSession = () => {
    Alert.alert(
      "Clear Session",
      "Are you sure you want to clear this email session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: clearSession
        }
      ]
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

      {/* Show empty state if no session data */}
      {!emailSession ? (
        <EmptyState />
      ) : (
        <>
          {/* Email Summary */}
          <EmailsSummary 
            emailCount={emailSession.emails.length}
            userProfile={userProfile}
          />

          {/* Email List */}
          <ScrollView style={emailsStyles.emailList} showsVerticalScrollIndicator={false}>
            {emailSession.emails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onEdit={handleEditEmail}
              />
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <ActionButtons
            emailSession={emailSession}
            onSendAll={handleSendAllEmails}
            onClear={handleClearSession}
          />
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
    </View>
  );
}