import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { emailsStyles } from "../../styles/components/emails";

// Types for email data
interface EmailDraft {
  id: string;
  supplierName: string;
  supplierEmail: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  products: string[];
}

interface EmailSession {
  id: string;
  emails: EmailDraft[];
  totalProducts: number;
  createdAt: Date;
}

interface SessionData {
  products: any[];
  sessionId: string;
  createdAt: Date;
}

// Placeholder email generation function
const generatePlaceholderEmails = (products: any[]): EmailDraft[] => {
  // Group products by supplier
  const supplierGroups: { [key: string]: any[] } = {};
  
  products.forEach(product => {
    if (!supplierGroups[product.supplierName]) {
      supplierGroups[product.supplierName] = [];
    }
    supplierGroups[product.supplierName].push(product);
  });

  // Generate email drafts for each supplier
  return Object.entries(supplierGroups).map(([supplierName, supplierProducts], index) => {
    const productList = supplierProducts.map(p => `• ${p.quantity}x ${p.name}`).join('\n');
    
    return {
      id: `email-${index}`,
      supplierName,
      supplierEmail: supplierProducts[0].supplierEmail,
      subject: `Restock Order from Greenfields Grocery`,
      body: `Hi ${supplierName} team,\n\nWe hope you're doing well! We'd like to place a restock order for the following items:\n\n${productList}\n\nPlease confirm availability at your earliest convenience.\n\nThank you as always for your continued support.\n\nBest regards,\nGreenfields Grocery`,
      status: 'draft' as const,
      products: supplierProducts.map(p => `${p.quantity}x ${p.name}`),
    };
  });
};

// Fallback mock data for demonstration
const mockProducts = [
  { name: "Organic Bananas", quantity: 4, supplierName: "Fresh Farms Co.", supplierEmail: "orders@freshfarms.com" },
  { name: "Whole Grain Bread", quantity: 2, supplierName: "Bakery Delights", supplierEmail: "supply@bakerydelights.com" },
  { name: "Greek Yogurt", quantity: 3, supplierName: "Dairy Fresh", supplierEmail: "orders@dairyfresh.com" },
  { name: "Almond Milk", quantity: 5, supplierName: "Nutty Beverages", supplierEmail: "supply@nuttybeverages.com" },
  { name: "Quinoa", quantity: 2, supplierName: "Grain Masters", supplierEmail: "orders@grainmasters.com" },
  { name: "Organic Eggs", quantity: 6, supplierName: "Fresh Farms Co.", supplierEmail: "orders@freshfarms.com" },
];

export default function EmailsScreen() {
  const [emailSession, setEmailSession] = useState<EmailSession | null>(null);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailDraft | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);

  // Load session data from AsyncStorage
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setIsLoading(true);
        const sessionDataString = await AsyncStorage.getItem('currentEmailSession');
        
        if (sessionDataString) {
          const sessionData: SessionData = JSON.parse(sessionDataString);
          const emails = generatePlaceholderEmails(sessionData.products);
          
          setEmailSession({
            id: sessionData.sessionId,
            emails,
            totalProducts: sessionData.products.length,
            createdAt: new Date(sessionData.createdAt),
          });
          
          // Clear the session data from storage after loading
          await AsyncStorage.removeItem('currentEmailSession');
        } else {
          // Fallback to mock data if no session data found
          const emails = generatePlaceholderEmails(mockProducts);
          setEmailSession({
            id: Date.now().toString(),
            emails,
            totalProducts: mockProducts.length,
            createdAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Error loading session data:', error);
        // Fallback to mock data on error
        const emails = generatePlaceholderEmails(mockProducts);
        setEmailSession({
          id: Date.now().toString(),
          emails,
          totalProducts: mockProducts.length,
          createdAt: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, []);

  const handleEditEmail = (email: EmailDraft) => {
    setEditingEmail(email);
    setEditSubject(email.subject);
    setEditBody(email.body);
    setShowEmailEditor(true);
  };

  const handleSaveEmail = () => {
    if (!editingEmail || !emailSession) return;

    const updatedEmails = emailSession.emails.map(email =>
      email.id === editingEmail.id
        ? { ...email, subject: editSubject, body: editBody }
        : email
    );

    setEmailSession({
      ...emailSession,
      emails: updatedEmails,
    });

    setShowEmailEditor(false);
    setEditingEmail(null);
    setEditSubject("");
    setEditBody("");
  };

  const handleRegenerateEmail = (emailId: string) => {
    if (!emailSession) return;

    // Simulate regeneration with slightly different content
    const email = emailSession.emails.find(e => e.id === emailId);
    if (!email) return;

    const newBody = `Hi ${email.supplierName} team,\n\nHope you're well! We're placing a restock order for the following items:\n\n${email.products.map(p => `• ${p}`).join('\n')}\n\nPlease let us know availability when convenient.\n\nThanks again for your support!\n\nBest regards,\nGreenfields Grocery`;

    const updatedEmails = emailSession.emails.map(e =>
      e.id === emailId
        ? { ...e, body: newBody, subject: `Restock Request from Greenfields Grocery` }
        : e
    );

    setEmailSession({
      ...emailSession,
      emails: updatedEmails,
    });
  };

  const handleSendAllEmails = () => {
    if (!emailSession) return;

    Alert.alert(
      "Send All Emails",
      `Are you sure you want to send ${emailSession.emails.length} emails to your suppliers?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send All",
          onPress: () => {
            setIsSending(true);
            setSendingProgress(0);
            
            // Simulate sending process
            let currentProgress = 0;
            const progressInterval = setInterval(() => {
              currentProgress += 20;
              setSendingProgress(currentProgress);
              
              if (currentProgress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                  setIsSending(false);
                  setShowSuccess(true);
                }, 500);
              }
            }, 300);
          }
        }
      ]
    );
  };

  const handleBackToSessions = () => {
    Alert.alert(
      "Leave Email Review",
      "Are you sure you want to go back? Your email drafts will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Go Back", onPress: () => {
          // Navigate back to restock sessions tab
          router.push('/(tabs)/restock-sessions');
        }}
      ]
    );
  };

  const handleDone = () => {
    setShowSuccess(false);
    // Reset the session
    const emails = generatePlaceholderEmails(mockProducts);
    setEmailSession({
      id: Date.now().toString(),
      emails,
      totalProducts: mockProducts.length,
      createdAt: new Date(),
    });
  };

  const getStatusText = (status: EmailDraft['status']) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'sending': return 'Sending...';
      case 'sent': return 'Sent';
      case 'failed': return 'Failed';
    }
  };

  const getStatusStyle = (status: EmailDraft['status']) => {
    switch (status) {
      case 'draft': return emailsStyles.statusDraft;
      case 'sending': return emailsStyles.statusSending;
      case 'sent': return emailsStyles.statusSent;
      case 'failed': return emailsStyles.statusFailed;
    }
  };

  if (showSuccess) {
    return (
      <View style={emailsStyles.successContainer}>
        <View style={emailsStyles.successIcon}>
          <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' }}>✓</Text>
        </View>
        <Text style={emailsStyles.successTitle}>Emails Sent Successfully!</Text>
        <Text style={emailsStyles.successText}>
          All {emailSession?.emails.length} emails have been sent to your suppliers. 
          You'll receive confirmation responses shortly.
        </Text>
        <TouchableOpacity style={emailsStyles.doneButton} onPress={handleDone}>
          <Text style={emailsStyles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={emailsStyles.container}>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, color: '#666666', marginBottom: 8 }}>
            Preparing your emails...
          </Text>
          <Text style={{ fontSize: 14, color: '#999999', textAlign: 'center' }}>
            Generating email drafts from your restock session
          </Text>
        </View>
      </View>
    );
  }

  if (!emailSession) {
    return (
      <View style={emailsStyles.container}>
        <Text>No email session data found.</Text>
      </View>
    );
  }

  return (
    <View style={emailsStyles.container}>
      {/* Header */}
      <View style={emailsStyles.header}>
        <View>
          <Text style={emailsStyles.headerTitle}>Review & Send Emails</Text>
          <Text style={emailsStyles.headerSubtitle}>
            ✉️ {emailSession.emails.length} Emails Ready to Send
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={emailsStyles.backButton} onPress={handleBackToSessions}>
            <Text style={emailsStyles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={emailsStyles.sendAllButton} onPress={handleSendAllEmails}>
            <Text style={emailsStyles.sendAllButtonText}>Send All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Summary */}
      <View style={emailsStyles.emailSummary}>
        <Text style={emailsStyles.summaryTitle}>🤖 AI Summary</Text>
        <Text style={emailsStyles.summaryText}>
          Emails auto-generated using your saved supplier data. 
          Each email is personalized and includes all products for that supplier.
        </Text>
      </View>

      {/* Email List */}
      <ScrollView style={emailsStyles.emailList} showsVerticalScrollIndicator={false}>
        {emailSession.emails.map((email) => (
          <View key={email.id} style={emailsStyles.emailCard}>
            <View style={emailsStyles.emailCardHeader}>
              <Text style={emailsStyles.supplierName}>🏷️ {email.supplierName}</Text>
              <Text style={[emailsStyles.emailStatus, getStatusStyle(email.status)]}>
                {getStatusText(email.status)}
              </Text>
            </View>
            
            <View style={emailsStyles.emailDetails}>
              <Text style={emailsStyles.emailTo}>To: {email.supplierEmail}</Text>
              <Text style={emailsStyles.emailSubject}>Subject: {email.subject}</Text>
              <Text style={emailsStyles.emailPreview} numberOfLines={3}>
                {email.body}
              </Text>
            </View>
            
            <View style={emailsStyles.emailActions}>
              <TouchableOpacity
                style={emailsStyles.editButton}
                onPress={() => handleEditEmail(email)}
              >
                <Text style={emailsStyles.editButtonText}>📝 Edit Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={emailsStyles.regenerateButton}
                onPress={() => handleRegenerateEmail(email.id)}
              >
                <Text style={emailsStyles.regenerateButtonText}>🔄 Regenerate</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Email Editor Modal */}
      <Modal
        visible={showEmailEditor}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={emailsStyles.modalOverlay}>
          <View style={emailsStyles.modalContainer}>
            <View style={emailsStyles.modalHeader}>
              <Text style={emailsStyles.modalTitle}>
                Edit Email to {editingEmail?.supplierName}
              </Text>
              <TouchableOpacity
                style={emailsStyles.closeButton}
                onPress={() => setShowEmailEditor(false)}
              >
                <Text style={emailsStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={emailsStyles.modalContent}>
              <View style={emailsStyles.inputGroup}>
                <Text style={emailsStyles.inputLabel}>Subject</Text>
                <TextInput
                  style={emailsStyles.textInput}
                  value={editSubject}
                  onChangeText={setEditSubject}
                  placeholder="Enter email subject"
                />
              </View>
              
              <View style={emailsStyles.inputGroup}>
                <Text style={emailsStyles.inputLabel}>Email Body</Text>
                <TextInput
                  style={emailsStyles.bodyInput}
                  value={editBody}
                  onChangeText={setEditBody}
                  placeholder="Enter email body"
                  multiline
                />
              </View>
              
              <View style={emailsStyles.modalButtons}>
                <TouchableOpacity
                  style={emailsStyles.cancelButton}
                  onPress={() => setShowEmailEditor(false)}
                >
                  <Text style={[emailsStyles.buttonText, emailsStyles.cancelButtonText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={emailsStyles.saveButton}
                  onPress={handleSaveEmail}
                >
                  <Text style={[emailsStyles.buttonText, emailsStyles.saveButtonText]}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sending Progress Overlay */}
      {isSending && (
        <View style={emailsStyles.sendingOverlay}>
          <View style={emailsStyles.sendingContainer}>
            <Text style={emailsStyles.sendingTitle}>Sending Emails...</Text>
            <Text style={emailsStyles.sendingText}>
              Sending {emailSession.emails.length} emails to your suppliers
            </Text>
            <View style={emailsStyles.progressBar}>
              <Animated.View
                style={[
                  emailsStyles.progressFill,
                  {
                    width: `${sendingProgress}%`,
                  }
                ]}
              />
            </View>
            <Text style={{ marginTop: 12, fontSize: 14, color: '#666666' }}>
              {sendingProgress}% Complete
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 