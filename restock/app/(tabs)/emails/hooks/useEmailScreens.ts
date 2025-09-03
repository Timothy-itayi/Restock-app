import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { useUnifiedAuth } from '../../../auth/UnifiedAuthProvider';
import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';
import type { EmailDraft } from './useEmailSession';
import { useUserProfile } from './useUserProfile';

// 🔧 NEW: Import EmailService for proper email tracking
import { EmailService } from '../../../../backend/services/emails';

export interface EmailSessionView {
  id: string;
  emails: EmailDraft[];
  totalProducts: number;
  createdAt: Date;
}

// Helper function to get email URL safely
const getEmailFunctionUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL;
  if (!url) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL is not configured in environment variables');

    throw new Error('Email service not configured. Please check your environment variables.');
  }
  return url;
};

export function useEmailScreens() {
  const { userId, isAuthenticated, getClerkSupabaseToken } = useUnifiedAuth();
  const userProfile = useUserProfile();
  const { sessionRepository } = useRepositories();

  const [sessions, setSessions] = useState<EmailSessionView[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeSession = useMemo(() => sessions.find((s) => s.id === activeSessionId) || null, [activeSessionId, sessions]);

  const loadFromStorage = useCallback(async () => {
    const sessionDataString = await AsyncStorage.getItem('currentEmailSession');
    if (!sessionDataString) return [] as EmailSessionView[];
    try {
      const data = JSON.parse(sessionDataString);
      const emails: EmailDraft[] = Array.isArray(data.editedEmails) ? data.editedEmails : [];
      return [
        {
          id: data.sessionId,
          emails,
          totalProducts: data.products?.length || 0,
          createdAt: new Date(data.createdAt),
        },
      ];
    } catch {
      return [] as EmailSessionView[];
    }
  }, []);

  const load = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setIsLoading(false);
      setSessions([]);
      return;
    }
    setIsLoading(true);
    const local = await loadFromStorage();
    setSessions(local);
    setActiveSessionId(local[0]?.id ?? null);
    setIsLoading(false);
  }, [isAuthenticated, loadFromStorage, userId]);

  const refreshSessions = useCallback(async () => {
    await load();
  }, [load]);

  const updateEmailInSession = useCallback(async (updatedEmails: EmailDraft[]) => {
    if (!activeSessionId) return;
    setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? { ...s, emails: updatedEmails } : s)));
    try {
      const sessionDataString = await AsyncStorage.getItem('currentEmailSession');
      if (sessionDataString) {
        const parsed = JSON.parse(sessionDataString);
        await AsyncStorage.setItem('currentEmailSession', JSON.stringify({
          ...parsed,
          editedEmails: updatedEmails,
        }));
      }
    } catch {}
  }, [activeSessionId]);

  const sendEmail = useCallback(async (emailId: string): Promise<{ success: boolean; message: string }> => {
    console.log('🚀 [EmailScreens] sendEmail function called with emailId:', emailId);
    console.log('🚀 [EmailScreens] activeSessionId:', activeSessionId);
    console.log('🚀 [EmailScreens] sessions count:', sessions.length);
    
    if (!activeSessionId) return { success: false, message: 'No active session' };
    const current = sessions.find((s) => s.id === activeSessionId);
    if (!current) return { success: false, message: 'Session not found' };
    
    try {
      // Find the email to send
      const emailToSend = current.emails.find(e => e.id === emailId);
      if (!emailToSend) {
        return { success: false, message: 'Email not found' };
      }

      console.log('📧 [EmailScreens] ===== STARTING EMAIL SEND =====');
      console.log('📧 [EmailScreens] Email ID:', emailId);
      console.log('📧 [EmailScreens] Session ID:', activeSessionId);
      console.log('📧 [EmailScreens] Email Details:', {
        supplierName: emailToSend.supplierName,
        supplierEmail: emailToSend.supplierEmail,
        subject: emailToSend.subject,
        bodyLength: emailToSend.body?.length || 0
      });
      
      // 🔧 FIXED: Get the Clerk JWT token for authentication
      const clerkToken = await getClerkSupabaseToken();
      if (!clerkToken) {
        throw new Error('No authentication token available');
      }
      
      // 🔧 FIXED: Actually send the email via Resend API with proper auth
      const emailUrl = getEmailFunctionUrl();
      const requestBody = {
        to: emailToSend.supplierEmail,
        subject: emailToSend.subject,
        html: emailToSend.body,
        from: 'orders@restockapp.email',     // your domain, authenticated
        reply_to: userProfile.userProfile.email,         // the user's actual email
      };
      
      console.log('📧 [EmailScreens] Sending request to:', emailUrl);
      console.log('📧 [EmailScreens] Request body:', requestBody);
      
      const response = await fetch(emailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 🔧 FIXED: Use the actual Clerk JWT token instead of hardcoded anon key
          'Authorization': `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📧 [EmailScreens] Response status:', response.status);
      console.log('📧 [EmailScreens] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [EmailScreens] Email send failed - Status:', response.status);
        console.error('❌ [EmailScreens] Error response:', errorData);
        return { success: false, message: `Failed to send email: ${errorData.error || 'Unknown error'}` };
      }

      const result = await response.json();
      console.log('✅ [EmailScreens] Email sent successfully!');
      console.log('✅ [EmailScreens] Response data:', result);

      // 🔧 NEW: Track the sent email in the database via EmailService
      try {
        console.log('📧 [EmailScreens] Creating email record in database...');
        const emailRecord = await EmailService.createEmail({
          session_id: activeSessionId,
          user_id: userId || '',
          supplier_email: emailToSend.supplierEmail,
          supplier_name: emailToSend.supplierName,
          email_content: emailToSend.body,
          delivery_status: 'sent',
          sent_via: 'resend',
          tracking_id: result.messageId || '',
          resend_webhook_data: JSON.stringify(result),
          supplier_id: `temp_${Date.now()}`, // We'll need to get actual supplier ID
          sent_at: new Date().toISOString(),
          status: 'sent',
          error_message: ''
        });
        
        if (emailRecord.error) {
          console.warn('⚠️ [EmailScreens] Failed to create email record:', emailRecord.error);
        } else {
          console.log('✅ [EmailScreens] Email record created successfully:', emailRecord.data);
        }
      } catch (error) {
        console.warn('⚠️ [EmailScreens] Error creating email record:', error);
      }

      // Update email status to sent
      const updated = current.emails.map((e) => (e.id === emailId ? { ...e, status: 'sent' as const } : e));
      await updateEmailInSession(updated);
      console.log('✅ [EmailScreens] Email status updated to sent');
      
      // Check if all emails are sent
      const allSent = updated.every((e) => e.status === 'sent');
      console.log('📊 [EmailScreens] All emails sent?', allSent, `(${updated.filter(e => e.status === 'sent').length}/${updated.length})`);
      
      if (allSent && sessionRepository) {
        console.log('🔄 [EmailScreens] Marking session as sent in database...');
        const markResult = await sessionRepository.markAsSent(activeSessionId);
        if (markResult.success) {
          console.log('✅ [EmailScreens] Session marked as sent successfully');
          await AsyncStorage.removeItem('currentEmailSession');
          setSessions([]);
          setActiveSessionId(null);
          console.log('🔄 [EmailScreens] Emitting sessionSent event...');
          setTimeout(() => DeviceEventEmitter.emit('restock:sessionSent', { sessionId: activeSessionId }), 500);
        } else {
          console.error('❌ [EmailScreens] Failed to mark session as sent:', markResult.error);
        }
      }
      
      console.log('📧 [EmailScreens] ===== EMAIL SEND COMPLETED =====');
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('❌ [EmailScreens] ===== EMAIL SEND ERROR =====');
      console.error('❌ [EmailScreens] Error details:', error);
      console.error('❌ [EmailScreens] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [EmailScreens] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return { success: false, message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }, [activeSessionId, sessions, updateEmailInSession, sessionRepository]);

  const sendAllEmails = useCallback(async () => {
    if (!activeSessionId) return { success: false, message: 'No active session' };
    
    try {
      const current = sessions.find((s) => s.id === activeSessionId);
      if (!current) return { success: false, message: 'Session not found' };
      
      console.log('📧 [EmailScreens] ===== STARTING BULK EMAIL SEND =====');
      console.log('📧 [EmailScreens] Session ID:', activeSessionId);
      console.log('📧 [EmailScreens] Total emails to send:', current.emails.length);
      console.log('📧 [EmailScreens] Emails:', current.emails.map(e => ({
        id: e.id,
        supplierName: e.supplierName,
        supplierEmail: e.supplierEmail,
        subject: e.subject
      })));
      
      // 🔧 FIXED: Actually send all emails via Resend API
      const emailPromises = current.emails.map(async (email, index) => {
        try {
          console.log(`📧 [EmailScreens] Sending email ${index + 1}/${current.emails.length}:`, email.supplierName);
          
          const emailUrl = getEmailFunctionUrl();
          const requestBody = {
            to: email.supplierEmail,
            subject: email.subject,
            html: email.body,
            from: 'orders@restockapp.email',     // your domain, authenticated
            reply_to: userProfile.userProfile.email,         // the user's actual email
          };
          
          console.log(`📧 [EmailScreens] Email ${index + 1} request body:`, requestBody);
          
          const clerkToken = await getClerkSupabaseToken();
          if (!clerkToken) {
            throw new Error('No authentication token available for bulk email sending');
          }

          const response = await fetch(emailUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 🔧 FIXED: Use the Clerk JWT token instead of hardcoded anon key
              'Authorization': `Bearer ${clerkToken}`,
            },
            body: JSON.stringify(requestBody),
          });

          console.log(`📧 [EmailScreens] Email ${index + 1} response status:`, response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ [EmailScreens] Email ${index + 1} failed - Status:`, response.status);
            console.error(`❌ [EmailScreens] Email ${index + 1} error:`, errorData);
            throw new Error(errorData.error || 'Failed to send email');
          }

          const result = await response.json();
          console.log(`✅ [EmailScreens] Email ${index + 1} sent successfully:`, email.supplierName);
          console.log(`✅ [EmailScreens] Email ${index + 1} response:`, result);
          
          // 🔧 NEW: Track the sent email in the database via EmailService
          try {
            console.log(`📧 [EmailScreens] Creating email record ${index + 1} in database...`);
            const emailRecord = await EmailService.createEmail({
              session_id: activeSessionId,
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
              console.warn(`⚠️ [EmailScreens] Failed to create email record ${index + 1}:`, emailRecord.error);
            } else {
              console.log(`✅ [EmailScreens] Email record ${index + 1} created successfully:`, emailRecord.data);
            }
          } catch (error) {
            console.warn(`⚠️ [EmailScreens] Error creating email record ${index + 1}:`, error);
          }
          
          return { success: true, emailId: email.id, result };
        } catch (error) {
          console.error(`❌ [EmailScreens] Email ${index + 1} failed:`, email.supplierName);
          console.error(`❌ [EmailScreens] Email ${index + 1} error:`, error);
          return { success: false, emailId: email.id, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      console.log('📧 [EmailScreens] Waiting for all emails to complete...');
      const results = await Promise.all(emailPromises);
      const failedEmails = results.filter(r => !r.success);
      const successfulEmails = results.filter(r => r.success);
      
      console.log('📊 [EmailScreens] Bulk send results:');
      console.log('📊 [EmailScreens] - Successful:', successfulEmails.length);
      console.log('📊 [EmailScreens] - Failed:', failedEmails.length);
      console.log('📊 [EmailScreens] - Total:', results.length);
      
      if (failedEmails.length > 0) {
        console.warn('⚠️ [EmailScreens] Some emails failed to send:', failedEmails);
        return { 
          success: false, 
          message: `${failedEmails.length} out of ${current.emails.length} emails failed to send` 
        };
      }

      console.log('✅ [EmailScreens] All emails sent successfully! Marking session as sent...');

      // All emails sent successfully, mark session as sent
      if (sessionRepository) {
        const result = await sessionRepository.markAsSent(activeSessionId);
        if (result.success) {
          console.log('✅ [EmailScreens] Session marked as sent successfully');
          await AsyncStorage.removeItem('currentEmailSession');
          setSessions([]);
          setActiveSessionId(null);
          console.log('🔄 [EmailScreens] Emitting sessionSent event...');
          setTimeout(() => DeviceEventEmitter.emit('restock:sessionSent', { sessionId: activeSessionId }), 500);
          console.log('📧 [EmailScreens] ===== BULK EMAIL SEND COMPLETED =====');
          return { success: true, message: 'All emails sent successfully' };
        }
        console.error('❌ [EmailScreens] Failed to mark session as sent:', result.error);
        return { success: false, message: result.error || 'Failed to mark session as sent' };
      }
      
      console.log('❌ [EmailScreens] Repository not available');
      return { success: false, message: 'Repository not available' };
    } catch (error) {
      console.error('❌ [EmailScreens] ===== BULK EMAIL SEND ERROR =====');
      console.error('❌ [EmailScreens] Error details:', error);
      console.error('❌ [EmailScreens] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [EmailScreens] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return { success: false, message: `Failed to send emails: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }, [activeSessionId, sessions, sessionRepository]);

  useEffect(() => {
    load();
  }, [load]);

  // 🔧 NEW: Listen for session deletion events to clear email sessions
  useEffect(() => {
    const handleSessionDeleted = (event: { sessionId: string }) => {
      console.log('🔄 [EmailScreens] Received session deleted event for:', event.sessionId);
      
      // Remove the deleted session from email sessions
      setSessions(prev => prev.filter(s => s.id !== event.sessionId));
      
      // Clear active session if it was the deleted one
      if (activeSessionId === event.sessionId) {
        console.log('🔄 [EmailScreens] Clearing active session (was deleted)');
        setActiveSessionId(null);
      }
      
      // Clear current session storage if it was the deleted session
      const clearCurrentSessionStorage = async () => {
        try {
          const currentSessionString = await AsyncStorage.getItem('currentEmailSession');
          if (currentSessionString) {
            const currentSessionData = JSON.parse(currentSessionString);
            if (currentSessionData.sessionId === event.sessionId) {
              await AsyncStorage.removeItem('currentEmailSession');
              console.log(`[EmailScreens] Cleared currentEmailSession for deleted session ${event.sessionId}`);
            }
          }
        } catch (error) {
          console.error('Error clearing current session storage:', error);
        }
      };
      
      clearCurrentSessionStorage();
      console.log('✅ [EmailScreens] Session removed from email sessions');
    };

    const deletedSubscription = DeviceEventEmitter.addListener('restock:sessionDeleted', handleSessionDeleted);
    
    return () => {
      deletedSubscription.remove();
    };
  }, [activeSessionId]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    isLoading,
    setActiveSessionId,
    refreshSessions,
    sendAllEmails,
    updateEmailInSession,
    sendEmail,
  };
}


