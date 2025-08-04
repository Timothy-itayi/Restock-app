import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emailsStyles } from "../../styles/components/emails";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { UserProfileService } from "../../backend/services/user-profile";

// Types for email data
interface EmailDraft {
  id: string;
  supplierName: string;
  supplierEmail: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  products: string[];
  isEdited?: boolean;
}

interface SessionData {
  products: any[];
  sessionId: string;
  createdAt: Date;
  groupedItems?: any;
  editedEmails?: EmailDraft[];
}

export default function EmailsScreen() {
  const { userId } = useAuth();
  const [emailSession, setEmailSession] = useState<{
    id: string;
    emails: EmailDraft[];
    totalProducts: number;
    createdAt: Date;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  
  // Email editing state
  const [editingEmail, setEditingEmail] = useState<EmailDraft | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      
      try {
        const result = await UserProfileService.getUserProfile(userId);
        if (result.data) {
          setUserName(result.data.name || "");
          setUserEmail(result.data.email || "");
          setStoreName(result.data.store_name || "");
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [userId]);

  // Load session data from AsyncStorage - wait for user profile to load first
  useEffect(() => {
    const loadSessionData = async () => {
      // Don't load session data until we have userId
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const sessionDataString = await AsyncStorage.getItem('currentEmailSession');
        
        if (sessionDataString) {
          let sessionData: SessionData;
          
          try {
            sessionData = JSON.parse(sessionDataString);
          } catch (parseError) {
            console.error('Failed to parse session data:', parseError);
            setEmailSession(null);
            return;
          }
          
          console.log('📦 Loaded session data for emails:', {
            sessionId: sessionData.sessionId,
            productCount: sessionData.products?.length || 0,
            products: sessionData.products?.map(p => ({
              name: p.name,
              quantity: p.quantity,
              supplierName: p.supplierName,
              supplierEmail: p.supplierEmail,
            }))
          });
          
          // Generate email drafts from session data
          if (sessionData.products && sessionData.products.length > 0) {
            let emails = generateEmailsFromSession(sessionData.products, storeName, userName, userEmail);
            
            // Check if there are edited emails and use those instead
            if (sessionData.editedEmails && Array.isArray(sessionData.editedEmails)) {
              console.log('📝 Using edited emails from session');
              emails = sessionData.editedEmails;
            }
            
            setEmailSession({
              id: sessionData.sessionId,
              emails,
              totalProducts: sessionData.products.length,
              createdAt: new Date(sessionData.createdAt),
            });
            
            console.log('✅ Generated emails from session data:', emails.length);
          } else {
            setEmailSession(null);
          }
        } else {
          console.log('📭 No session data found for emails');
          setEmailSession(null);
        }
      } catch (error) {
        console.error('❌ Error loading session data for emails:', error);
        setEmailSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [userId, storeName, userName, userEmail]); // Depend on user profile data

  // Generate email drafts from session products
  const generateEmailsFromSession = (products: any[], userStoreName?: string, userUserName?: string, userUserEmail?: string): EmailDraft[] => {
    console.log('🔄 Generating emails from session products...');
    
    // Use actual user data or fallbacks
    const actualStoreName = userStoreName || 'Your Store';
    const actualUserName = userUserName || 'Store Manager';
    const actualUserEmail = userUserEmail || 'manager@store.com';
    
    console.log('📝 Using user info for emails:', { actualStoreName, actualUserName, actualUserEmail });
    
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
        subject: `Restock Order from ${actualStoreName}`,
        body: `Hi ${supplierName} team,\n\nWe hope you're doing well! We'd like to place a restock order for the following items:\n\n${productList}\n\nPlease confirm availability at your earliest convenience.\n\nThank you as always for your continued support.\n\nBest regards,\n${actualUserName}\n${actualStoreName}\n${actualUserEmail}`,
        status: 'draft' as const,
        products: supplierProducts.map(p => `${p.quantity}x ${p.name}`),
      };
    });
  };

  const handleEditEmail = (email: EmailDraft) => {
    setEditingEmail(email);
    setEditedSubject(email.subject);
    setEditedBody(email.body);
    setShowEditModal(true);
  };

  const handleSaveEmail = async () => {
    if (!editingEmail || !emailSession) return;

    // Update the email in the session
    const updatedEmails = emailSession.emails.map(email => 
      email.id === editingEmail.id 
        ? { ...email, subject: editedSubject, body: editedBody, isEdited: true }
        : email
    );

    const updatedSession = {
      ...emailSession,
      emails: updatedEmails
    };

    setEmailSession(updatedSession);
    
    // Save to AsyncStorage
    try {
      const sessionData = await AsyncStorage.getItem('currentEmailSession');
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData);
        // Keep the original session structure but update with edited emails
        await AsyncStorage.setItem('currentEmailSession', JSON.stringify({
          ...parsedSession,
          editedEmails: updatedEmails // Store edited emails separately
        }));
      }
    } catch (error) {
      console.error('Error saving edited email:', error);
    }

    // Close modal
    setShowEditModal(false);
    setEditingEmail(null);
    setEditedSubject('');
    setEditedBody('');
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingEmail(null);
    setEditedSubject('');
    setEditedBody('');
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
            // TODO: Implement actual email sending
            Alert.alert(
              "Emails Sent",
              `Successfully sent ${emailSession.emails.length} emails to your suppliers.`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Clear the session data after sending
                    AsyncStorage.removeItem('currentEmailSession');
                    setEmailSession(null);
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleClearSession = () => {
    Alert.alert(
      "Clear Session",
      "Are you sure you want to clear this email session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('currentEmailSession');
            setEmailSession(null);
          }
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
        <View style={emailsStyles.emptyState}>
          <View style={emailsStyles.progressIcon}>
            <Ionicons name="mail-outline" size={64} color="#6B7F6B" />
          </View>
          
          <Text style={emailsStyles.progressTitle}>
            No Emails Yet
          </Text>
          
          <Text style={emailsStyles.emptyStateText}>
            Emails will appear here once you generate them from your restock sessions.
          </Text>
          
          <Text style={emailsStyles.progressSubtitle}>
            Navigate to the Restock Sessions tab to create a session and generate supplier emails.
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
              Emails auto-generated using your session data
            </Text>
            {(storeName || userEmail || userName) && (
              <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#495057', marginBottom: 4 }}>
                  Sender Information:
                </Text>
                {storeName && <Text style={{ fontSize: 11, color: '#6C757D' }}>Store: {storeName}</Text>}
                {userName && <Text style={{ fontSize: 11, color: '#6C757D' }}>Name: {userName}</Text>}
                {userEmail && <Text style={{ fontSize: 11, color: '#6C757D' }}>Email: {userEmail}</Text>}
              </View>
            )}
          </View>

          {/* Email List */}
          <ScrollView style={emailsStyles.emailList} showsVerticalScrollIndicator={false}>
            {emailSession.emails.map((email) => (
              <View key={email.id} style={emailsStyles.emailCard}>
                <View style={emailsStyles.emailCardHeader}>
                  <View style={emailsStyles.emailDetails}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={emailsStyles.emailSubject}>{email.subject}</Text>
                      {email.isEdited && (
                        <View style={emailsStyles.editedBadge}>
                          <Text style={emailsStyles.editedBadgeText}>Edited</Text>
                        </View>
                      )}
                    </View>
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
                  <TouchableOpacity 
                    style={emailsStyles.editButton}
                    onPress={() => handleEditEmail(email)}
                  >
                    <Ionicons name="pencil" size={16} color="#6B7F6B" />
                    <Text style={emailsStyles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <View style={emailsStyles.statusBadge}>
                    <Text style={emailsStyles.statusText}>Draft</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}>
            <TouchableOpacity style={emailsStyles.sendAllButton} onPress={handleSendAllEmails}>
              <Text style={emailsStyles.sendAllButtonText}>Send All Emails</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[emailsStyles.sendAllButton, { backgroundColor: '#F8F9FA', borderColor: '#DEE2E6' }]} 
              onPress={handleClearSession}
            >
              <Text style={[emailsStyles.sendAllButtonText, { color: '#6C757D' }]}>Clear Session</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Email Edit Modal */}
      <Modal
        visible={showEditModal}
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
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text style={emailsStyles.modalCancelButton}>Cancel</Text>
              </TouchableOpacity>
              
              <Text style={emailsStyles.modalTitle}>Edit Email</Text>
              
              <TouchableOpacity onPress={handleSaveEmail}>
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
                  onChangeText={setEditedSubject}
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
                  onChangeText={setEditedBody}
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
    </View>
  );
} 