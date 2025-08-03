import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emailsStyles } from "../../styles/components/emails";
import { Ionicons } from "@expo/vector-icons";

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

interface SessionData {
  products: any[];
  sessionId: string;
  createdAt: Date;
  groupedItems?: any;
}

export default function EmailsScreen() {
  const [emailSession, setEmailSession] = useState<{
    id: string;
    emails: EmailDraft[];
    totalProducts: number;
    createdAt: Date;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session data from AsyncStorage
  useEffect(() => {
    const loadSessionData = async () => {
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
            const emails = generateEmailsFromSession(sessionData.products);
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
  }, []);

  // Generate email drafts from session products
  const generateEmailsFromSession = (products: any[]): EmailDraft[] => {
    console.log('🔄 Generating emails from session products...');
    
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
          </View>

          {/* Email List */}
          <ScrollView style={emailsStyles.emailList} showsVerticalScrollIndicator={false}>
            {emailSession.emails.map((email) => (
              <View key={email.id} style={emailsStyles.emailCard}>
                <View style={emailsStyles.emailCardHeader}>
                  <View style={emailsStyles.emailDetails}>
                    <Text style={emailsStyles.emailSubject}>{email.subject}</Text>
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
    </View>
  );
} 