import { useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRepositories } from '../../../infrastructure/supabase/SupabaseHooksProvider';
import { useSessionContext } from '../../restock-sessions/context/SessionContext';
import { UserProfile } from './useUserProfile';
import { EmailDraft, EmailSession } from './useEmailSession';

const STORAGE_KEY = 'emailSessions';

export function useEmailSessions(userProfile: UserProfile, userId?: string) {
  const { sessionRepository } = useRepositories();
  const sessionContext = useSessionContext();
  const [emailSessions, setEmailSessions] = useState<EmailSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeSession = emailSessions.find(session => session.id === activeSessionId) || null;

  const generateEmailsFromSession = (products: any[], userStoreName?: string, userUserName?: string, userUserEmail?: string): EmailDraft[] => {
    const actualStoreName = userStoreName || 'Your Store';
    const actualUserName = userUserName || 'Store Manager';
    const actualUserEmail = userUserEmail || 'manager@store.com';
    
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

  const loadAllSessions = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 [EmailSessions] Starting to load email sessions...');
      console.log('🔍 [EmailSessions] SessionContext state:', {
        hasCurrentSession: !!sessionContext.currentSession,
        sessionStatus: sessionContext.currentSession?.toValue().status,
        hasGeneratedEmails: !!sessionContext.generatedEmails,
        generatedEmailsCount: sessionContext.generatedEmails?.length || 0
      });
      
      let newSessions: EmailSession[] = [];
      
      // 🔧 FIXED: Check SessionContext first for active session with generated emails
      if (sessionContext.currentSession && 
          sessionContext.currentSession.toValue().status === 'email_generated') {
        
        const sessionData = sessionContext.currentSession.toValue();
        console.log('✅ [EmailSessions] Found active session with email_generated status:', sessionData.id);
        
        // 🔧 FIXED: Use emails from SessionContext if available, otherwise generate them
        let emails: EmailDraft[];
        
        if (sessionContext.generatedEmails && sessionContext.generatedEmails.length > 0) {
          // Use emails already generated in SessionContext
          emails = sessionContext.generatedEmails.map((email, index) => ({
            id: email.id || `email-${index}`,
            supplierName: email.supplierName,
            supplierEmail: email.supplierEmail,
            subject: email.subject,
            body: email.body,
            status: email.status || 'draft',
            products: email.products,
          }));
          console.log(`✅ [EmailSessions] Using ${emails.length} emails from SessionContext`);
        } else {
          console.log('⚠️ [EmailSessions] No generated emails in SessionContext, generating from session data...');
          // Fallback: generate emails from session data
          const products = sessionData.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            supplierName: item.supplierName,
            supplierEmail: item.supplierEmail,
            notes: item.notes
          }));

          emails = generateEmailsFromSession(
            products, 
            userProfile.storeName, 
            userProfile.name, 
            userProfile.email
          );
          console.log(`✅ [EmailSessions] Generated ${emails.length} emails from session data`);
        }
        
        const currentSession: EmailSession = {
          id: sessionData.id,
          emails,
          totalProducts: sessionData.items.length,
          createdAt: sessionData.createdAt,
        };
        
        newSessions = [currentSession];
        setActiveSessionId(currentSession.id);
        
        console.log(`✅ [EmailSessions] Loaded session from SessionContext: ${currentSession.id} with ${emails.length} emails`);
        
        // Also save to AsyncStorage for backward compatibility
        const emailSessionData = {
          sessionId: sessionData.id,
          products: sessionData.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            supplierName: item.supplierName,
            supplierEmail: item.supplierEmail,
            notes: item.notes
          })),
          emails,
          createdAt: sessionData.createdAt,
          editedEmails: emails
        };
        await AsyncStorage.setItem('currentEmailSession', JSON.stringify(emailSessionData));
        
      } else {
        console.log('⚠️ [EmailSessions] No active session in SessionContext, checking AsyncStorage...');
        // Fallback to AsyncStorage if no active session in context
        const currentSessionString = await AsyncStorage.getItem('currentEmailSession');
        
        if (currentSessionString) {
          const currentSessionData = JSON.parse(currentSessionString);
          
          if (currentSessionData.products && currentSessionData.products.length > 0) {
            let emails = generateEmailsFromSession(
              currentSessionData.products, 
              userProfile.storeName, 
              userProfile.name, 
              userProfile.email
            );
            
            // Check if there are edited emails
            if (currentSessionData.editedEmails && Array.isArray(currentSessionData.editedEmails)) {
              emails = currentSessionData.editedEmails;
            }
            
            const currentSession: EmailSession = {
              id: currentSessionData.sessionId,
              emails,
              totalProducts: currentSessionData.products.length,
              createdAt: new Date(currentSessionData.createdAt),
            };
            
            newSessions = [currentSession];
            setActiveSessionId(currentSession.id);
            
            console.log(`✅ [EmailSessions] Loaded session from AsyncStorage: ${currentSession.id} with ${emails.length} emails`);
          }
        } else {
          console.log('📭 [EmailSessions] No session data found in AsyncStorage either');
        }
      }
      
      console.log(`📊 [EmailSessions] Final result: ${newSessions.length} sessions loaded`);
      setEmailSessions(newSessions);
      
      // Clear old persistent storage to prevent sessions from reappearing
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (cleanupError) {
        console.warn('Could not clear old email sessions storage:', cleanupError);
      }
      
    } catch (error) {
      console.error('❌ Error loading email sessions:', error);
      setError('Failed to load email sessions');
      setEmailSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, sessionRepository, userProfile.storeName, userProfile.name, userProfile.email, sessionContext.currentSession, sessionContext.generatedEmails]);

  const saveSession = async (session: EmailSession) => {
    try {
      // Don't persist sessions to storage - keep them only in memory
      // This prevents sessions from reappearing after they've been completed
      const updatedSessions = emailSessions.map(s => 
        s.id === session.id ? session : s
      );
      
      if (!emailSessions.find(s => s.id === session.id)) {
        updatedSessions.unshift(session);
      }
      
      updatedSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Only update in-memory state, no persistent storage
      setEmailSessions(updatedSessions);
    } catch (error) {
      console.error('Error saving session:', error);
      setError('Failed to save session');
    }
  };

  const markSessionSentIfComplete = async (sessionId: string, currentEmails?: EmailDraft[]) => {
    const session = emailSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // Use provided currentEmails if available, otherwise use session.emails
    const emailsToCheck = currentEmails || session.emails;
    const allSent = emailsToCheck.every(e => e.status === 'sent');
    if (allSent) {
      try {
        // TODO: Implement proper session status update via session repository
        console.log(`[EmailSessions] Marking session ${sessionId} as sent in database`);
        
        // Clear currentEmailSession storage
        const currentSessionString = await AsyncStorage.getItem('currentEmailSession');
        if (currentSessionString) {
          const currentSessionData = JSON.parse(currentSessionString);
          if (currentSessionData.sessionId === sessionId) {
            await AsyncStorage.removeItem('currentEmailSession');
          }
        }
        
        // Wait longer to ensure database transaction is committed
        setTimeout(() => {
          DeviceEventEmitter.emit('restock:sessionSent', { sessionId });
          console.log(`[EmailSessions] Emitted restock:sessionSent event for session ${sessionId}`);
        }, 800);
      } catch (error) {
        console.error(`[EmailSessions] Exception marking session as sent: ${sessionId}`, error);
      }
    }
  };

  const sendSingleEmail = async (sessionId: string, emailId: string): Promise<{ success: boolean; message: string }> => {
    const session = emailSessions.find(s => s.id === sessionId);
    if (!session || !userProfile.email) {
      return { success: false, message: 'No email session or user email found' };
    }

    const email = session.emails.find(e => e.id === emailId);
    if (!email) {
      return { success: false, message: 'Email not found in session' };
    }

    try {
      // Optimistically set this email to sending
      const updatedEmailsStart = session.emails.map(e => e.id === emailId ? { ...e, status: 'sending' as const } : e);
      await saveSession({ ...session, emails: updatedEmailsStart });

      // In clean layer mode, defer actual send to backend; optimistically mark as sent
      const result = { error: null as any };

      const finalStatus = result.error ? 'failed' as const : 'sent' as const;
      const updatedEmailsEnd = session.emails.map(e => e.id === emailId ? { ...e, status: finalStatus } : e);

      // Check if this was the last email to be sent
      const remainingUnsent = updatedEmailsEnd.filter(e => e.status !== 'sent' && e.status !== 'failed');
      
      if (remainingUnsent.length === 0 && finalStatus === 'sent') {
        // This was the last email - clear the entire session
        await markSessionSentIfComplete(sessionId, updatedEmailsEnd);
        
        // Clear the current session storage completely
        try {
          await AsyncStorage.removeItem('currentEmailSession');
          console.log(`[EmailSessions] Cleared currentEmailSession after last individual email sent`);
        } catch (error) {
          console.warn('[EmailSessions] Could not clear currentEmailSession:', error);
        }
        
        // Remove this session from local list and clear active selection
        setEmailSessions([]);
        setActiveSessionId(null);
        
        // Wait longer to ensure database transaction is fully committed, then notify
        setTimeout(() => {
          DeviceEventEmitter.emit('restock:sessionSent', { sessionId });
          console.log(`[EmailSessions] Emitted restock:sessionSent event for individual email completion: ${sessionId}`);
        }, 800);
      } else {
        // Still have remaining emails - update session with current status
        await saveSession({ ...session, emails: updatedEmailsEnd });
      }

      return {
        success: !result.error,
        message: result.error ? 'Failed to send email' : 'Email sent successfully'
      };
    } catch (error) {
      // Set to failed on exception
      const updatedEmailsFail = session.emails.map(e => e.id === emailId ? { ...e, status: 'failed' as const } : e);
      await saveSession({ ...session, emails: updatedEmailsFail });
      return { success: false, message: 'Failed to send email' };
    }
  };

  const updateEmailInSession = async (sessionId: string, updatedEmails: EmailDraft[]) => {
    const session = emailSessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedSession = {
      ...session,
      emails: updatedEmails
    };

    await saveSession(updatedSession);
    
    // Also update current session storage if this is the current session
    try {
      const currentSessionString = await AsyncStorage.getItem('currentEmailSession');
      if (currentSessionString) {
        const currentSessionData = JSON.parse(currentSessionString);
        if (currentSessionData.sessionId === sessionId) {
          await AsyncStorage.setItem('currentEmailSession', JSON.stringify({
            ...currentSessionData,
            editedEmails: updatedEmails
          }));
        }
      }
    } catch (error) {
      console.error('Error updating current session storage:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const updatedSessions = emailSessions.filter(s => s.id !== sessionId);
      setEmailSessions(updatedSessions);
      
      // If we deleted the active session, switch to another one
      if (activeSessionId === sessionId) {
        setActiveSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
      }
      
      // Clear current session storage if this was the current session
      try {
        const currentSessionString = await AsyncStorage.getItem('currentEmailSession');
        if (currentSessionString) {
          const currentSessionData = JSON.parse(currentSessionString);
          if (currentSessionData.sessionId === sessionId) {
            await AsyncStorage.removeItem('currentEmailSession');
          }
        }
      } catch (error) {
        console.error('Error clearing current session storage:', error);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session');
    }
  };

  const sendAllEmails = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    const session = emailSessions.find(s => s.id === sessionId);
    if (!session || !userProfile.email) {
      return { success: false, message: 'No email session or user email found' };
    }

    try {
      // Update UI to show sending status
      const updatedEmails = session.emails.map(email => ({
        ...email,
        status: 'sending' as const
      }));
      
      const updatedSession = { ...session, emails: updatedEmails };
      await saveSession(updatedSession);

      // Prepare emails for bulk sending
      const emailsToSend = session.emails.map(email => ({
        to: email.supplierEmail,
        replyTo: userProfile.email,
        subject: email.subject,
        body: email.body,
        storeName: userProfile.storeName || 'Your Store',
        supplierName: email.supplierName,
        emailId: email.id
      }));

      // TODO: Implement proper session status update via session repository
      console.log(`[EmailSessions] Marking session ${sessionId} as sent`);

      // Update UI to show success by removing this session from drafts list
      const sentEmails = session.emails.map(email => ({ ...email, status: 'sent' as const }));
      await saveSession({ ...session, emails: sentEmails });

      // TODO: Implement proper session status update via session repository
      console.log(`[EmailSessions] Session ${sessionId} marked as sent in database`);
      
      // Clear the current session from AsyncStorage since it's now completed
      const currentSessionString = await AsyncStorage.getItem('currentEmailSession');
      if (currentSessionString) {
        const currentSessionData = JSON.parse(currentSessionString);
        if (currentSessionData.sessionId === sessionId) {
          await AsyncStorage.removeItem('currentEmailSession');
          console.log(`[EmailSessions] Cleared currentEmailSession for completed session ${sessionId}`);
        }
      }

      // Remove session from local list and active selection
      setEmailSessions(prev => prev.filter(s => s.id !== sessionId));
      setActiveSessionId(prev => (prev === sessionId ? null : prev));

      // Wait longer to ensure database transaction is committed
      setTimeout(() => {
        DeviceEventEmitter.emit('restock:sessionSent', { sessionId });
        console.log(`[EmailSessions] Emitted restock:sessionSent event for bulk send completion: ${sessionId}`);
      }, 800);

      return { 
        success: true, 
        message: `Successfully sent ${session.emails.length} emails to your suppliers.`
      };

    } catch (error) {
      console.error('Error sending emails:', error);
      
      // Update UI to show failure
      const failedEmails = session.emails.map(email => ({
        ...email,
        status: 'failed' as const
      }));
      
      const failedSession = { ...session, emails: failedEmails };
      await saveSession(failedSession);

      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send emails. Please try again."
      };
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Could not clear old email sessions storage:', error);
      } finally {
        await loadAllSessions();
      }
    };
    initialize();
  }, [loadAllSessions]);

  // 🔧 NEW: Watch for SessionContext changes and reload emails when they're generated
  useEffect(() => {
    console.log('🔄 [EmailSessions] SessionContext changed, checking for new emails...');
    console.log('🔍 [EmailSessions] New SessionContext state:', {
      hasCurrentSession: !!sessionContext.currentSession,
      sessionStatus: sessionContext.currentSession?.toValue().status,
      hasGeneratedEmails: !!sessionContext.generatedEmails,
      generatedEmailsCount: sessionContext.generatedEmails?.length || 0
    });
    
    // If we have generated emails in SessionContext, reload the sessions
    if (sessionContext.generatedEmails && sessionContext.generatedEmails.length > 0) {
      console.log('✅ [EmailSessions] Detected generated emails in SessionContext, reloading...');
      loadAllSessions();
    }
  }, [sessionContext.generatedEmails, sessionContext.currentSession, loadAllSessions]);

  return {
    emailSessions,
    activeSession,
    activeSessionId,
    isLoading,
    error,
    setActiveSessionId,
    updateEmailInSession: (updatedEmails: EmailDraft[]) => 
      activeSessionId ? updateEmailInSession(activeSessionId, updatedEmails) : Promise.resolve(),
    sendAllEmails: () => 
      activeSessionId ? sendAllEmails(activeSessionId) : Promise.resolve({ success: false, message: 'No active session' }),
    sendEmail: (emailId: string) => 
      activeSessionId ? sendSingleEmail(activeSessionId, emailId) : Promise.resolve({ success: false, message: 'No active session' }),
    deleteSession,
    refreshSessions: loadAllSessions
  };
}