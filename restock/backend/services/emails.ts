import { supabase, TABLES, EMAIL_STATUS } from '../config/supabase';
import type { EmailSent, InsertEmailSent, UpdateEmailSent } from '../types/database';

export class EmailService {
  /**
   * Resolve the base URL for the send-email Supabase Edge Function
   * Priority:
   * 1) EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL (recommended)
   * 2) EXPO_PUBLIC_SUPABASE_FUNCTION_URL with replace('generate-email' → 'send-email') or already pointing to send-email
   * 3) Derive from EXPO_PUBLIC_SUPABASE_URL (extract project ref): https://<ref>.functions.supabase.co/send-email
   */
  private static resolveSendEmailBaseUrl(): string {
    const direct = process.env.EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL;
    if (direct && direct.trim().length > 0) {
      return direct.replace(/\/$/, '');
    }

    const legacy = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL;
    if (legacy && legacy.trim().length > 0) {
      // If already points to send-email, use it; otherwise try replacing generate-email
      if (legacy.includes('/send-email')) {
        return legacy.replace(/\/$/, '');
      }
      if (legacy.includes('/generate-email')) {
        return legacy.replace('generate-email', 'send-email').replace(/\/$/, '');
      }
    }

    // Derive from EXPO_PUBLIC_SUPABASE_URL: https://<ref>.supabase.co → <ref>
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    try {
      if (supabaseUrl) {
        const url = new URL(supabaseUrl);
        const host = url.hostname; // <ref>.supabase.co
        const projectRef = host.split('.')[0];
        if (projectRef) {
          return `https://${projectRef}.functions.supabase.co/send-email`;
        }
      }
    } catch (_) {
      // ignore and fall-through
    }

    throw new Error('Supabase send-email function URL not configured. Set EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL or EXPO_PUBLIC_SUPABASE_FUNCTION_URL, or ensure EXPO_PUBLIC_SUPABASE_URL is set.');
  }
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
            name,
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
      const functionUrl = this.resolveSendEmailBaseUrl();

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
  }>, sessionId: string, userId?: string) {
    try {
      const baseUrl = this.resolveSendEmailBaseUrl();
      const functionUrl = `${baseUrl}/bulk`;

      // Pre-create DB records to get real email IDs for tracking
      const emailsWithDbIds: Array<{
        to: string;
        replyTo: string;
        subject: string;
        body: string;
        storeName: string;
        supplierName: string;
        emailId?: string; // updated with DB id when available
      }> = [];

      for (const email of emails) {
        let dbEmailId: string | undefined = undefined;

        try {
          // Resolve supplier_id by email (preferred) or by name for this user
          let supplierId: string | undefined = undefined;
          if (email.to) {
            const { data: supplierByEmail } = await supabase
              .from(TABLES.SUPPLIERS)
              .select('id')
              .eq('email', email.to)
              .limit(1)
              .maybeSingle();
            supplierId = supplierByEmail?.id;
          }

          if (!supplierId && email.supplierName && userId) {
            const { data: supplierByName } = await supabase
              .from(TABLES.SUPPLIERS)
              .select('id')
              .eq('name', email.supplierName)
              .eq('user_id', userId)
              .limit(1)
              .maybeSingle();
            supplierId = supplierByName?.id;
          }

          if (supplierId) {
            const insertPayload: InsertEmailSent = {
              session_id: sessionId,
              supplier_id: supplierId,
              email_content: `${email.subject}\n\n${email.body}`,
              status: EMAIL_STATUS.PENDING,
              sent_via: 'resend',
            };

            const { data: created, error: createErr } = await supabase
              .from(TABLES.EMAILS_SENT)
              .insert(insertPayload)
              .select('id')
              .single();

            if (!createErr && created?.id) {
              dbEmailId = created.id;
            }
          }
        } catch (_) {
          // If anything fails, proceed without DB pre-creation for this email
        }

        emailsWithDbIds.push({ ...email, emailId: dbEmailId || email.emailId });
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          emails: emailsWithDbIds.map(email => ({ ...email, sessionId })),
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