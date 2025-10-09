import { supabase } from '../_config/supabase';
import type { EmailSent, InsertEmailSent, UpdateEmailSent } from '../_types/database';

// Email status constants
export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed'
} as const;

export class EmailService {
  /**
   * Get all emails for current user via RPC
   */
  static async getUserEmails() {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent');
      
      if (error) {
        throw error;
      }

      return { data: emails, error: null };
    } catch (error) {
      console.error('[EmailService] Error getting user emails via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all emails for a specific session via RPC
   */
  static async getSessionEmails(sessionId: string) {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent');
      
      if (error) {
        throw error;
      }

      // Filter emails by session ID
      const sessionEmails = emails?.filter((email: any) => email.session_id === sessionId) || [];
      return { data: sessionEmails, error: null };
    } catch (error) {
      console.error('[EmailService] Error getting session emails via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single email by ID via RPC
   */
  static async getEmail(emailId: string) {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent');
      
      if (error) {
        throw error;
      }

      const email = emails?.find((e: any) => e.id === emailId);
      if (!email) {
        return { data: null, error: 'Email not found' };
      }

      return { data: email, error: null };
    } catch (error) {
      console.error('[EmailService] Error getting email via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new email record via RPC
   */
  static async createEmail(email: InsertEmailSent) {
    try {
      const { data: newEmail, error } = await supabase.rpc('insert_email_sent', {
        p_delivery_status: email.delivery_status || 'pending',
        p_sent_via: email.sent_via || 'resend',
        p_tracking_id: email.tracking_id || null,
        p_resend_webhook_data: email.resend_webhook_data || null,
        p_session_id: email.session_id,
        p_supplier_id: email.supplier_id,
        p_email_content: email.email_content,
        p_sent_at: email.sent_at || new Date().toISOString(),
        p_status: email.status || 'pending',
        p_error_message: email.error_message || null
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const createdEmail = Array.isArray(newEmail) ? newEmail[0] : newEmail;
      return { data: { id: createdEmail?.id }, error: null };
    } catch (error) {
      console.error('[EmailService] Error creating email via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing email via RPC
   */
  static async updateEmail(emailId: string, updates: UpdateEmailSent) {
    try {
      const { data: updatedEmail, error } = await supabase.rpc('update_email_sent', {
        p_id: emailId,
        p_delivery_status: updates.delivery_status,
        p_sent_via: updates.sent_via,
        p_tracking_id: updates.tracking_id,
        p_resend_webhook_data: updates.resend_webhook_data,
        p_email_content: updates.email_content,
        p_sent_at: updates.sent_at,
        p_status: updates.status,
        p_error_message: updates.error_message
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const email = Array.isArray(updatedEmail) ? updatedEmail[0] : updatedEmail;
      return { data: { id: email?.id }, error: null };
    } catch (error) {
      console.error('[EmailService] Error updating email via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete an email via RPC
   */
  static async deleteEmail(emailId: string) {
    try {
      const { error } = await supabase.rpc('delete_email_sent', {
        p_id: emailId
      });

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('[EmailService] Error deleting email via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Update email delivery status via RPC
   */
  static async updateDeliveryStatus(emailId: string, status: string, webhookData?: any) {
    try {
      const { data: updatedEmail, error } = await supabase.rpc('update_email_sent', {
        p_id: emailId,
        p_delivery_status: status,
        p_resend_webhook_data: webhookData || null,
        p_sent_via: null,
        p_tracking_id: null,
        p_email_content: null,
        p_sent_at: null,
        p_status: null,
        p_error_message: null
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const email = Array.isArray(updatedEmail) ? updatedEmail[0] : updatedEmail;
      return { data: { id: email?.id }, error: null };
    } catch (error) {
      console.error('[EmailService] Error updating delivery status via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get emails by status via RPC
   */
  static async getEmailsByStatus(status: string) {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent');
      
      if (error) {
        throw error;
      }

      const filteredEmails = emails?.filter((email: any) => email.status === status) || [];
      return { data: filteredEmails, error: null };
    } catch (error) {
      console.error('[EmailService] Error getting emails by status via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get emails by supplier via RPC
   */
  static async getEmailsBySupplier(supplierId: string) {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent');
      
      if (error) {
        throw error;
      }

      const supplierEmails = emails?.filter((email: any) => email.supplier_id === supplierId) || [];
      return { data: supplierEmails, error: null };
    } catch (error) {
      console.error('[EmailService] Error getting emails by supplier via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Search emails by content via RPC
   */
  static async searchEmails(searchTerm: string) {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent');
      
      if (error) {
        throw error;
      }

      const filteredEmails = emails?.filter((email: any) => 
        email.email_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.error_message?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

      return { data: filteredEmails, error: null };
    } catch (error) {
      console.error('[EmailService] Error searching emails via RPC:', error);
      return { data: null, error };
    }
  }
} 