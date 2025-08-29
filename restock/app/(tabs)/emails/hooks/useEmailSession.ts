import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from './useUserProfile';
import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';

// 🔧 NEW: Import EmailService for proper email tracking
import { EmailService } from '../../../../backend/services/emails';

export interface EmailDraft {
  id: string;
  supplierName: string;
  supplierEmail: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  products: string[];
  isEdited?: boolean;
}

export interface EmailSession {
  id: string;
  emails: EmailDraft[];
  totalProducts: number;
  createdAt: Date;
}

interface SessionData {
  products: any[];
  sessionId: string;
  createdAt: Date;
  groupedItems?: any;
  editedEmails?: EmailDraft[];
}

export function useEmailSession(userProfile: UserProfile) {
  // ✅ CORRECT: Get auth state directly from UnifiedAuth like other hooks
  const { userId, isAuthenticated, isReady: authReady, getClerkSupabaseToken } = useUnifiedAuth();
  const { sessionRepository } = useRepositories();
  const [emailSession, setEmailSession] = useState<EmailSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateEmailsFromSession = (products: any[], userStoreName?: string, userUserName?: string, userUserEmail?: string): EmailDraft[] => {
    console.log('🔄 Generating emails from session products...');
    
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

  const loadSessionData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
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
          let emails = generateEmailsFromSession(
            sessionData.products, 
            userProfile.storeName, 
            userProfile.name, 
            userProfile.email
          );
          
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
      setError('Failed to load email session');
      setEmailSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userProfile.storeName, userProfile.name, userProfile.email]);

  const updateEmailInSession = async (updatedEmails: EmailDraft[]) => {
    if (!emailSession) return;

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
        await AsyncStorage.setItem('currentEmailSession', JSON.stringify({
          ...parsedSession,
          editedEmails: updatedEmails
        }));
      }
    } catch (error) {
      console.error('Error saving edited email:', error);
      setError('Failed to save email changes');
    }
  };

  const sendAllEmails = async (): Promise<{ success: boolean; message: string }> => {
    if (!emailSession || !userProfile.email) {
      return { success: false, message: 'No email session or user email found' };
    }

    try {
      // Update UI to show sending status
      const updatedEmails = emailSession.emails.map(email => ({
        ...email,
        status: 'sending' as const
      }));
      setEmailSession({
        ...emailSession,
        emails: updatedEmails
      });

      // 🔧 FIXED: Actually send emails via Resend API with proper authentication
      console.log('📧 [EmailSession] Starting to send all emails...');
      
      // Get the Clerk JWT token for authentication
      if (!getClerkSupabaseToken) {
        throw new Error('Authentication not available');
      }
      
      const clerkToken = await getClerkSupabaseToken();
      if (!clerkToken) {
        throw new Error('No authentication token available');
      }

      // Send each email individually
      const emailPromises = emailSession.emails.map(async (email, index) => {
        try {
          console.log(`📧 [EmailSession] Sending email ${index + 1}/${emailSession.emails.length}:`, email.supplierName);
          
          const emailUrl = 'https://dxnjzeefmqwhfmpknbjh.supabase.co/functions/v1/send-email';
          const requestBody = {
            to: email.supplierEmail,
            subject: email.subject,
            html: email.body,
            from: 'noreply@restockapp.email',
          };
          
          console.log(`📧 [EmailSession] Email ${index + 1} request body:`, requestBody);
          
          const response = await fetch(emailUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 🔧 FIXED: Use the Clerk JWT token for authentication
              'Authorization': `Bearer ${clerkToken}`,
            },
            body: JSON.stringify(requestBody),
          });

          console.log(`📧 [EmailSession] Email ${index + 1} response status:`, response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ [EmailSession] Email ${index + 1} failed - Status:`, response.status);
            console.error(`❌ [EmailSession] Error response:`, errorData);
            throw new Error(errorData.message || `HTTP ${response.status}`);
          }

          const result = await response.json();
          console.log(`✅ [EmailSession] Email ${index + 1} sent successfully:`, email.supplierName);
          console.log(`✅ [EmailSession] Email ${index + 1} response:`, result);
          
          // 🔧 NEW: Track the sent email in the database via EmailService
          try {
            console.log(`📧 [EmailSession] Creating email record ${index + 1} in database...`);
            const emailRecord = await EmailService.createEmail({
              session_id: emailSession.id,
              user_id: userId || '',
              supplier_email: email.supplierEmail,
              supplier_name: email.supplierName,
              email_content: email.body,
              delivery_status: 'sent',
              sent_via: 'resend',
              tracking_id: result.messageId || '',
              resend_webhook_data: JSON.stringify(result),
              supplier_id: `temp_${Date.now()}_${index}`, // We'll need to get actual supplier ID
              sent_at: new Date().toISOString(),
              status: 'sent',
              error_message: ''
            });
            
            if (emailRecord.error) {
              console.warn(`⚠️ [EmailSession] Failed to create email record ${index + 1}:`, emailRecord.error);
            } else {
              console.log(`✅ [EmailSession] Email record ${index + 1} created successfully:`, emailRecord.data);
            }
          } catch (error) {
            console.warn(`⚠️ [EmailSession] Error creating email record ${index + 1}:`, error);
          }
          
          return { success: true, emailId: email.id, result };
        } catch (error) {
          console.error(`❌ [EmailSession] Email ${index + 1} failed:`, email.supplierName);
          console.error(`❌ [EmailSession] Email ${index + 1} error:`, error);
          return { success: false, emailId: email.id, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      console.log('📧 [EmailSession] Waiting for all emails to complete...');
      const results = await Promise.all(emailPromises);
      const failedEmails = results.filter(r => !r.success);
      const successfulEmails = results.filter(r => r.success);
      
      console.log('📊 [EmailSession] Bulk send results:');
      console.log('📊 [EmailSession] - Successful:', successfulEmails.length);
      console.log('📊 [EmailSession] - Failed:', failedEmails.length);
      console.log('📊 [EmailSession] - Total:', results.length);
      
      if (failedEmails.length > 0) {
        console.warn('⚠️ [EmailSession] Some emails failed to send:', failedEmails);
        return { 
          success: false, 
          message: `${failedEmails.length} out of ${emailSession.emails.length} emails failed to send` 
        };
      }

      console.log('✅ [EmailSession] All emails sent successfully!');

      // Mark session as sent via session repository
      if (sessionRepository) {
        const result = await sessionRepository.markAsSent(emailSession.id);
        if (result.success) {
          console.log('✅ [EmailSession] Session marked as sent successfully');
        } else {
          console.error('❌ [EmailSession] Failed to mark session as sent:', result.error);
        }
      }

      // Update UI to show success
      const sentEmails = emailSession.emails.map(email => ({
        ...email,
        status: 'sent' as const
      }));
      setEmailSession({
        ...emailSession,
        emails: sentEmails
      });

      return { 
        success: true, 
        message: `Successfully sent ${emailSession.emails.length} emails to your suppliers.`
      };

    } catch (error) {
      console.error('❌ [EmailSession] Error sending emails:', error);
      
      // Update UI to show failure
      const failedEmails = emailSession.emails.map(email => ({
        ...email,
        status: 'failed' as const
      }));
      setEmailSession({
        ...emailSession,
        emails: failedEmails
      });

      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send emails. Please try again."
      };
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem('currentEmailSession');
      setEmailSession(null);
    } catch (error) {
      console.error('Error clearing session:', error);
      setError('Failed to clear session');
    }
  };

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  return {
    emailSession,
    isLoading,
    error,
    updateEmailInSession,
    sendAllEmails,
    clearSession,
    refreshSession: loadSessionData
  };
}