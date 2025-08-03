import AsyncStorage from "@react-native-async-storage/async-storage";
// import { router } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import { EmailsSkeleton } from '../components/skeleton';
import { useAuth } from "@clerk/clerk-expo";
import { EmailGenerator } from "../../backend/services/ai";
import type { GenerationProgress } from "../../backend/services/ai/types";

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
  groupedItems?: any; // Add groupedItems property
}

// AI-powered email generation function
const generateAIEmails = async (
  sessionData: any, // Session data from AsyncStorage
  userId: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<EmailDraft[]> => {
  try {
    console.log('🤖 Starting AI email generation...');
    const emailGenerator = new EmailGenerator();
    
    onProgress?.({
      step: 'initializing',
      progress: 5,
      message: 'Initializing AI email generator...'
    });

    const generatedEmails = await emailGenerator.generateEmailsForSession(
      sessionData, // Pass the full session data
      userId,
      {},
      onProgress
    );

    console.log(`✅ Generated ${generatedEmails.length} emails successfully`);

    // Convert GeneratedEmail to EmailDraft format
    return generatedEmails.map((email: any, index: number) => ({
      id: `email-${index}`,
      supplierName: email.supplierName || 'Supplier',
      supplierEmail: email.supplierEmail || 'supplier@example.com',
      subject: email.subject,
      body: email.body,
      status: 'draft' as const,
      products: [], // Will be populated from session data
    }));
  } catch (error) {
    console.error('❌ AI email generation failed:', error);
    throw error;
  }
};

// Fallback email generation function (simple templates)
const generateFallbackEmails = (products: any[]): EmailDraft[] => {
  console.log('🔄 Using fallback email generation...');
  
  // Group products by supplier
  const supplierGroups: { [key: string]: any[] } = {};
  
  products.forEach(product => {
    const supplierName = product.supplierName || 'Unknown Supplier';
    if (!supplierGroups[supplierName]) {
      supplierGroups[supplierName] = [];
    }
    supplierGroups[supplierName].push(product);
  });

  // Generate email drafts for each supplier
  return Object.entries(supplierGroups).map(([supplierName, supplierProducts], index) => {
    const productList = supplierProducts.map(p => `• ${p.quantity}x ${p.name}`).join('\n');
    
    return {
      id: `email-${index}`,
      supplierName,
      supplierEmail: supplierProducts[0].supplierEmail || 'supplier@example.com',
      subject: `Restock Order from Greenfields Grocery`,
      body: `Hi ${supplierName} team,\n\nWe hope you're doing well! We'd like to place a restock order for the following items:\n\n${productList}\n\nPlease confirm availability at your earliest convenience.\n\nThank you as always for your continued support.\n\nBest regards,\nGreenfields Grocery`,
      status: 'draft' as const,
      products: supplierProducts.map(p => `${p.quantity}x ${p.name}`),
    };
  });
};

export default function EmailsScreen() {
  const { userId } = useAuth();
  const [emailSession, setEmailSession] = useState<EmailSession | null>(null);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailDraft | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [aiGenerationProgress, setAiGenerationProgress] = useState<GenerationProgress | null>(null);

  // Minimum loading time to prevent flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 300); // 300ms minimum loading time
    
    return () => clearTimeout(timer);
  }, []);

  // Load session data from AsyncStorage
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setIsLoading(true);
        const sessionDataString = await AsyncStorage.getItem('currentEmailSession');
        
        if (sessionDataString && userId) {
          let sessionData: SessionData;
          
          try {
            sessionData = JSON.parse(sessionDataString);
          } catch (parseError) {
            console.error('Failed to parse session data:', parseError);
            throw new Error('Invalid session data format');
          }
          
          console.log('📦 Loaded session data:', {
            sessionId: sessionData.sessionId,
            productCount: sessionData.products?.length || 0,
            hasGroupedItems: !!sessionData.groupedItems
          });
          
          // Validate session data structure
          if (!sessionData.products || sessionData.products.length === 0) {
            throw new Error('No products found in session');
          }
          
          try {
            // Use AI to generate emails
            console.log('🚀 Attempting AI email generation...');
            const emails = await generateAIEmails(
              sessionData, // Pass the full session data
              userId,
              (progress) => {
                console.log('📊 AI Generation Progress:', progress);
                setAiGenerationProgress(progress);
              }
            );
            
            setEmailSession({
              id: sessionData.sessionId,
              emails,
              totalProducts: sessionData.products.length,
              createdAt: new Date(sessionData.createdAt),
            });
            
            console.log('✅ AI email generation completed successfully');
            
            // Clear the session data from storage after loading
            await AsyncStorage.removeItem('currentEmailSession');
          } catch (aiError) {
            console.error('❌ AI email generation failed, using fallback:', aiError);
            // Fallback to simple template generation
            const emails = generateFallbackEmails(sessionData.products);
            setEmailSession({
              id: sessionData.sessionId,
              emails,
              totalProducts: sessionData.products.length,
              createdAt: new Date(sessionData.createdAt),
            });
            
            // Clear the session data from storage after loading
            await AsyncStorage.removeItem('currentEmailSession');
          }
        } else {
          console.log('📭 No session data found, showing empty state');
          setEmailSession(null); // Show empty state if no session data
        }
      } catch (error) {
        console.error('❌ Error loading session data:', error);
        // Fallback to empty state on error
        setEmailSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [userId]);

  // Show skeleton until email session is loaded and minimum time has passed
  if (isLoading || !emailSession || minLoadingTime) {
    return <EmailsSkeleton />;
  }

  // Show AI generation progress
  if (aiGenerationProgress && aiGenerationProgress.step !== 'complete') {
    return (
      <View style={emailsStyles.container}>
        <View style={emailsStyles.header}>
          <Text style={emailsStyles.headerTitle}>Generating AI Emails</Text>
        </View>
        
        <View style={emailsStyles.progressContainer}>
          <View style={emailsStyles.progressIcon}>
            <Text style={{ color: '#6B7F6B', fontSize: 32 }}>🤖</Text>
          </View>
          
          <Text style={emailsStyles.progressTitle}>
            {aiGenerationProgress.message}
          </Text>
          
          {aiGenerationProgress.currentSupplier && (
            <Text style={emailsStyles.progressSubtitle}>
              Working on: {aiGenerationProgress.currentSupplier}
            </Text>
          )}
          
          <View style={emailsStyles.progressBar}>
            <Animated.View 
              style={[
                emailsStyles.progressFill,
                { width: `${aiGenerationProgress.progress}%` }
              ]} 
            />
          </View>
          
          <Text style={emailsStyles.progressText}>
            {aiGenerationProgress.progress.toFixed(0)}% Complete
          </Text>
        </View>
      </View>
    );
  }

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


  const handleDone = () => {
    setShowSuccess(false);
    // Reset the session
    setEmailSession(null); // Clear the session data
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
        <Text style={emailsStyles.headerTitle}>Generated Emails</Text>
      </View>

      {/* Show empty state if no session data */}
      {!emailSession ? (
        <View style={emailsStyles.emptyState}>
          <Text style={emailsStyles.emptyStateText}>
            No Email Session Found
          </Text>
          <Text style={emailsStyles.emptyStateText}>
            Please create a restock session and generate emails first.
            Navigate to the Restock Sessions tab to get started.
          </Text>
        </View>
      ) : (
        <>
          {/* Email Summary */}
          <View style={emailsStyles.emailSummary}>
            <Text style={emailsStyles.headerSubtitle}>
              {emailSession.emails.length} emails ready to send
            </Text>
            <Text style={emailsStyles.summaryText}>
              Emails auto-generated using your saved supplier data
            </Text>
          </View>

          {/* Email List */}
          <ScrollView style={emailsStyles.emailList} showsVerticalScrollIndicator={false}>
            {emailSession.emails.length === 0 ? (
              <View style={emailsStyles.emptyState}>
                <Text style={emailsStyles.emptyStateText}>
                  No Emails Generated Yet
                </Text>
                <Text style={emailsStyles.emptyStateText}>
                  Please ensure you have saved supplier data in the previous step.
                  Once you do, this section will automatically populate with emails
                  generated using your supplier information.
                </Text>
              </View>
            ) : (
              emailSession.emails.map((email) => (
                <View key={email.id} style={emailsStyles.emailCard}>
                  <View style={emailsStyles.emailCardHeader}>
                    <View style={emailsStyles.emailDetails}>
                      <Text style={emailsStyles.emailSubject}>{email.subject}</Text>
                      <TouchableOpacity
                        style={emailsStyles.editIconButton}
                        onPress={() => handleEditEmail(email)}
                      >
                        <Ionicons name="pencil" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Notepad divider line */}
                  <View style={emailsStyles.notepadDivider} />
                  
                  <View style={emailsStyles.emailInfoRow}>
                    <Text style={emailsStyles.emailInfoLabel}>To: </Text>
                    <Text style={emailsStyles.emailInfoValue}>{email.supplierName}</Text>
                  </View>
                  
                  {/* Notepad divider line */}
                  <View style={emailsStyles.notepadDivider} />
                  
                  <View style={emailsStyles.emailInfoRow}>
                    <Text style={emailsStyles.emailInfoLabel}>Email: </Text>
                    <Text style={emailsStyles.emailInfoValue}>{email.supplierEmail}</Text>
                  </View>
                  
                  {/* Notepad divider line */}
                  <View style={emailsStyles.notepadDivider} />
                  
                  <Text style={emailsStyles.emailPreview} numberOfLines={3}>
                    {email.body}
                  </Text>
                  
                  <View style={emailsStyles.emailActions}>
                    <View style={[emailsStyles.statusBadge, getStatusStyle(email.status)]}>
                      <Text style={[emailsStyles.statusText, getStatusTextStyle(email.status)]}>
                        {getStatusText(email.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Send All Button - only show if there are emails */}
          {emailSession.emails.length > 0 && (
            <TouchableOpacity style={emailsStyles.sendAllButton} onPress={handleSendAllEmails}>
              <Text style={emailsStyles.sendAllButtonText}>Send All Emails</Text>
            </TouchableOpacity>
          )}
        </>
      )}

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