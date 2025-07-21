import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
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

  const handleCancelEdit = () => {
    setShowEmailEditor(false);
    setEditingEmail(null);
    setEditSubject("");
    setEditBody("");
  };

  const handleRegenerateEmail = (emailId: string) => {
    if (!emailSession) return;

    const emailToRegenerate = emailSession.emails.find(email => email.id === emailId);
    if (!emailToRegenerate) return;

    // Regenerate the email content
    const productList = emailToRegenerate.products.map(p => `• ${p}`).join('\n');
    const newBody = `Hi ${emailToRegenerate.supplierName} team,\n\nWe hope you're doing well! We'd like to place a restock order for the following items:\n\n${productList}\n\nPlease confirm availability at your earliest convenience.\n\nThank you as always for your continued support.\n\nBest regards,\nGreenfields Grocery`;

    const updatedEmails = emailSession.emails.map(email =>
      email.id === emailId
        ? { ...email, body: newBody }
        : email
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

            // Simulate sending progress
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

  const getStatusTextStyle = (status: EmailDraft['status']) => {
    switch (status) {
      case 'draft': return emailsStyles.statusDraftText;
      case 'sending': return emailsStyles.statusSendingText;
      case 'sent': return emailsStyles.statusSentText;
      case 'failed': return emailsStyles.statusFailedText;
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

  // Email Editor Screen
  if (showEmailEditor && editingEmail) {
    return (
      <View style={emailsStyles.container}>
        {/* Header */}
        <View style={emailsStyles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={emailsStyles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={emailsStyles.editButton} onPress={handleSaveEmail}>
              <Text style={emailsStyles.editButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Content */}
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Subject */}
          <TextInput
            style={[emailsStyles.modalInput, { fontSize: 18, fontWeight: '600' }]}
            value={editSubject}
            onChangeText={setEditSubject}
            placeholder="Subject"
          />

          {/* Recipient Info */}
          <View style={{ marginVertical: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E8EAED' }}>
            <Text style={{ fontSize: 14, color: '#5F6368', marginBottom: 4 }}>To:</Text>
            <Text style={{ fontSize: 16, color: '#202124' }}>
              {editingEmail.supplierName} ({editingEmail.supplierEmail})
            </Text>
          </View>

          {/* Email Body */}
          <TextInput
            style={[emailsStyles.modalTextArea, { height: 400, borderWidth: 0, padding: 0 }]}
            value={editBody}
            onChangeText={setEditBody}
            placeholder="Write your email..."
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={emailsStyles.container}>
      {/* Header */}
      <View style={emailsStyles.header}>
        <Text style={emailsStyles.headerTitle}>Email Drafts</Text>
        <Text style={emailsStyles.headerSubtitle}>
          {emailSession.emails.length} emails ready to send
        </Text>
      </View>

      {/* Email Summary */}
      <View style={emailsStyles.emailSummary}>
        <Text style={emailsStyles.summaryText}>
          Emails auto-generated using your saved supplier data
        </Text>
      </View>

      {/* Email List */}
      <ScrollView style={emailsStyles.emailList} showsVerticalScrollIndicator={false}>
        {emailSession.emails.map((email) => (
          <View key={email.id} style={emailsStyles.emailCard}>
            <View style={emailsStyles.emailCardHeader}>
              <View style={emailsStyles.emailDetails}>
                <Text style={emailsStyles.emailSubject}>{email.subject}</Text>
                <Text style={emailsStyles.emailSupplier}>
                  To: {email.supplierName} ({email.supplierEmail})
                </Text>
              </View>
            </View>
            
            <Text style={emailsStyles.emailPreview} numberOfLines={3}>
              {email.body}
            </Text>
            
            <View style={emailsStyles.emailActions}>
              <TouchableOpacity
                style={emailsStyles.editButton}
                onPress={() => handleEditEmail(email)}
              >
                <Text style={emailsStyles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <View style={[emailsStyles.statusBadge, getStatusStyle(email.status)]}>
                <Text style={[emailsStyles.statusText, getStatusTextStyle(email.status)]}>
                  {getStatusText(email.status)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Send All Button */}
      <TouchableOpacity style={emailsStyles.sendAllButton} onPress={handleSendAllEmails}>
        <Text style={emailsStyles.sendAllButtonText}>Send All Emails</Text>
      </TouchableOpacity>

      {/* Sending Progress Overlay */}
      {isSending && (
        <View style={emailsStyles.sendingOverlay}>
          <View style={emailsStyles.sendingContainer}>
            <Text style={emailsStyles.sendingTitle}>Sending Emails</Text>
            
            <View style={emailsStyles.progressBar}>
              <Animated.View
                style={[
                  emailsStyles.progressFill,
                  {
                    width: `${sendingProgress}%`,
                  },
                ]}
              />
            </View>
            
            <Text style={emailsStyles.progressText}>
              {sendingProgress}% complete
            </Text>
          </View>
        </View>
      )}
    </View>
  );
} 