import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EmailService } from "../../../../backend/services/emails";
import { UserProfile } from './useUserProfile';

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

export function useEmailSession(userProfile: UserProfile, userId?: string) {
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

      // Prepare emails for bulk sending
      const emailsToSend = emailSession.emails.map(email => ({
        to: email.supplierEmail,
        replyTo: userProfile.email,
        subject: email.subject,
        body: email.body,
        storeName: userProfile.storeName || 'Your Store',
        supplierName: email.supplierName,
        emailId: email.id
      }));

      // Send emails via EmailService
      const result = await EmailService.sendBulkEmails(emailsToSend, emailSession.id, userId);
      
      if (result.error) {
        const errorMessage = result.error instanceof Error 
          ? result.error.message 
          : typeof result.error === 'string' 
            ? result.error 
            : 'Failed to send emails';
        throw new Error(errorMessage);
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
        message: `Successfully sent ${result.data?.totalSent || emailSession.emails.length} emails to your suppliers.`
      };

    } catch (error) {
      console.error('Error sending emails:', error);
      
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