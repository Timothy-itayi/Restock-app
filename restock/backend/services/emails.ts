import { supabase, TABLES, EMAIL_STATUS } from '../config/supabase';
import type { EmailSent, InsertEmailSent, UpdateEmailSent } from '../types/database';

export class EmailService {
  /**
   * Get all emails for a session
   */
  static async getSessionEmails(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .select(`
          *,
          suppliers (
            id,
            name,
            email
          )
        `)
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get a single email by ID
   */
  static async getEmail(emailId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .select(`
          *,
          suppliers (
            id,
            name,
            email
          )
        `)
        .eq('id', emailId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new email record
   */
  static async createEmail(email: InsertEmailSent) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .insert(email)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update email status
   */
  static async updateEmail(emailId: string, updates: UpdateEmailSent) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .update(updates)
        .eq('id', emailId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark email as sent
   */
  static async markEmailAsSent(emailId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .update({ 
          status: EMAIL_STATUS.SENT,
          sent_at: new Date().toISOString()
        })
        .eq('id', emailId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark email as failed
   */
  static async markEmailAsFailed(emailId: string, errorMessage?: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .update({ 
          status: EMAIL_STATUS.FAILED,
          error_message: errorMessage
        })
        .eq('id', emailId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get email statistics for a session
   */
  static async getSessionEmailStats(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .select('status')
        .eq('session_id', sessionId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        sent: data?.filter(email => email.status === EMAIL_STATUS.SENT).length || 0,
        failed: data?.filter(email => email.status === EMAIL_STATUS.FAILED).length || 0,
        pending: data?.filter(email => email.status === EMAIL_STATUS.PENDING).length || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all emails for a user (across all sessions)
   */
  static async getUserEmails(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .select(`
          *,
          suppliers (
            id,
            name,
            email
          ),
          restock_sessions!session_id (
            id,
            created_at
          )
        `)
        .eq('restock_sessions.user_id', userId)
        .order('sent_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete email record
   */
  static async deleteEmail(emailId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .delete()
        .eq('id', emailId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Send a single email via Resend
   */
  static async sendEmail(emailData: {
    to: string;
    replyTo: string;
    subject: string;
    body: string;
    storeName: string;
    supplierName: string;
    sessionId?: string;
    emailId?: string;
  }) {
    try {
      const functionUrl = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL?.replace('generate-email', 'send-email');
      
      if (!functionUrl) {
        throw new Error('Supabase function URL not configured');
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Email sending failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      // Update email record with sent status and tracking ID
      if (emailData.emailId) {
        await this.updateEmail(emailData.emailId, {
          status: EMAIL_STATUS.SENT,
          sent_at: new Date().toISOString(),
          tracking_id: result.messageId,
          sent_via: 'resend'
        });
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update email record with failed status
      if (emailData.emailId) {
        await this.markEmailAsFailed(emailData.emailId, error instanceof Error ? error.message : 'Unknown error');
      }
      
      return { data: null, error };
    }
  }

  /**
   * Send multiple emails for a session
   */
  static async sendBulkEmails(emails: Array<{
    to: string;
    replyTo: string;
    subject: string;
    body: string;
    storeName: string;
    supplierName: string;
    emailId: string;
  }>, sessionId: string) {
    try {
      const functionUrl = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL?.replace('generate-email', 'send-email/bulk');
      
      if (!functionUrl) {
        throw new Error('Supabase function URL not configured');
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          emails: emails.map(email => ({ ...email, sessionId })),
          sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Bulk email sending failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      // Update email records based on results
      for (const emailResult of result.results) {
        if (emailResult.success) {
          await this.updateEmail(emailResult.emailId, {
            status: EMAIL_STATUS.SENT,
            sent_at: new Date().toISOString(),
            tracking_id: emailResult.messageId,
            sent_via: 'resend'
          });
        } else {
          await this.markEmailAsFailed(emailResult.emailId, emailResult.error);
        }
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      return { data: null, error };
    }
  }

  /**
   * Track email delivery status using Resend webhook data
   */
  static async trackDelivery(emailId: string, webhookData: any) {
    try {
      const deliveryStatus = webhookData.type; // delivered, bounced, complained, etc.
      
      const { data, error } = await supabase
        .from(TABLES.EMAILS_SENT)
        .update({
          delivery_status: deliveryStatus,
          resend_webhook_data: JSON.stringify(webhookData),
          updated_at: new Date().toISOString()
        })
        .eq('tracking_id', webhookData.data.email_id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error tracking email delivery:', error);
      return { data: null, error };
    }
  }
} 