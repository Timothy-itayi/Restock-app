import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex../_generated/api';
import { Id } from '../../convex../_generated/dataModel';
import type { EmailSent, InsertEmailSent, UpdateEmailSent } from '../types/database';

// Email status constants
export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed'
} as const;

export class EmailService {
  private static convexClient: ConvexHttpClient | null = null;

  private static getConvexClient(): ConvexHttpClient {
    if (!this.convexClient) {
      const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error('EXPO_PUBLIC_CONVEX_URL not configured');
      }
      this.convexClient = new ConvexHttpClient(convexUrl);
    }
    return this.convexClient;
  }

  /**
   * Get all emails for a session
   */
  static async getSessionEmails(sessionId: string) {
    try {
      const client = this.getConvexClient();
      const emails = await client.query(api.emails.listBySession, { sessionId: sessionId as Id<"restockSessions"> });
      
      // Transform to match expected format
      const data = emails.map((email: any) => ({
        id: email._id,
        sessionId: email.sessionId,
        supplierId: null, // Not stored in Convex schema
        emailContent: email.emailContent,
        status: email.status,
        sentAt: new Date(email.sentAt).toISOString(),
        errorMessage: email.errorMessage,
        suppliers: {
          id: null,
          name: email.supplierName,
          email: email.supplierEmail
        }
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get a single email by ID
   */
  static async getEmail(emailId: string) {
    try {
      const client = this.getConvexClient();
      const email = await client.query(api.emails.get, { id: emailId as Id<"emailsSent"> });
      
      if (!email) {
        return { data: null, error: 'Email not found' };
      }

      // Transform to match expected format
      const data = {
        id: email._id,
        sessionId: email.sessionId,
        supplierId: null, // Not stored in Convex schema
        emailContent: email.emailContent,
        status: email.status,
        sentAt: new Date(email.sentAt).toISOString(),
        errorMessage: email.errorMessage,
        suppliers: {
          id: null,
          name: email.supplierName,
          email: email.supplierEmail
        }
      };

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new email record
   */
  static async createEmail(email: InsertEmailSent) {
    try {
      const client = this.getConvexClient();
      const emailId = await client.mutation(api.emails.create, {
        sessionId: email.sessionId as Id<"restockSessions">,
        supplierEmail: email.supplierEmail || '', // Use supplierEmail from the email object
        supplierName: email.supplierName || '', // Use supplierName from the email object
        emailContent: email.emailContent || ''
      });

      return { data: { id: emailId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update email status
   */
  static async updateEmail(emailId: string, updates: UpdateEmailSent) {
    try {
      const client = this.getConvexClient();
      await client.mutation(api.emails.updateStatus, {
        id: emailId as Id<"emailsSent">,
        status: updates.status as any, // Type conversion needed
        errorMessage: updates.errorMessage
      });

      return { data: { id: emailId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark email as sent
   */
  static async markEmailAsSent(emailId: string) {
    try {
      const client = this.getConvexClient();
      await client.mutation(api.emails.updateStatus, {
        id: emailId as Id<"emailsSent">,
        status: 'sent'
      });

      return { data: { id: emailId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark email as failed
   */
  static async markEmailAsFailed(emailId: string, errorMessage?: string) {
    try {
      const client = this.getConvexClient();
      await client.mutation(api.emails.updateStatus, {
        id: emailId as Id<"emailsSent">,
        status: 'failed',
        errorMessage
      });

      return { data: { id: emailId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get email statistics for a session
   */
  static async getSessionEmailStats(sessionId: string) {
    try {
      const client = this.getConvexClient();
      const emails = await client.query(api.emails.listBySession, { sessionId: sessionId as Id<"restockSessions"> });
      
      const stats = {
        total: emails.length,
        sent: emails.filter((email: any) => email.status === 'sent').length,
        failed: emails.filter((email: any) => email.status === 'failed').length,
        pending: emails.filter((email: any) => email.status === 'pending').length,
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
      const client = this.getConvexClient();
      const emails = await client.query(api.emails.listByUser, {});
      
      // Transform to match expected format
      const data = emails.map((email: any) => ({
        id: email._id,
        sessionId: email.sessionId,
        supplierId: null, // Not stored in Convex schema
        emailContent: email.emailContent,
        status: email.status,
        sentAt: new Date(email.sentAt).toISOString(),
        errorMessage: email.errorMessage,
        suppliers: {
          id: null,
          name: email.supplierName,
          email: email.supplierEmail
        },
        restockSessions: {
          id: email.sessionId,
          name: null, // We'd need to join with sessions table
          createdAt: new Date(email.sentAt).toISOString()
        }
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete email record
   */
  static async deleteEmail(emailId: string) {
    try {
      const client = this.getConvexClient();
      await client.mutation(api.emails.remove, { id: emailId as Id<"emailsSent"> });
      return { error: null };
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
      // Direct Resend API call - no more Supabase Edge Functions
      const resendApiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error('EXPO_PUBLIC_RESEND_API_KEY not configured');
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Restock App <noreply@yourdomain.com>',
          to: emailData.to,
          reply_to: emailData.replyTo,
          subject: emailData.subject,
          html: emailData.body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Email sending failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      // Update email record with sent status
      if (emailData.emailId) {
        await this.markEmailAsSent(emailData.emailId);
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
      const resendApiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error('EXPO_PUBLIC_RESEND_API_KEY not configured');
      }

      const results = [];
      
      for (const email of emails) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Restock App <noreply@yourdomain.com>',
              to: email.to,
              reply_to: email.replyTo,
              subject: email.subject,
              html: email.body,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            await this.markEmailAsSent(email.emailId);
            results.push({ 
              emailId: email.emailId, 
              success: true, 
              messageId: result.id 
            });
          } else {
            const errorData = await response.text();
            await this.markEmailAsFailed(email.emailId, errorData);
            results.push({ 
              emailId: email.emailId, 
              success: false, 
              error: errorData 
            });
          }
        } catch (error) {
          await this.markEmailAsFailed(email.emailId, error instanceof Error ? error.message : 'Unknown error');
          results.push({ 
            emailId: email.emailId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      return { data: { results }, error: null };
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
      
      if (deliveryStatus === 'email.delivered') {
        await this.updateEmail(emailId, { status: 'delivered' as any });
      } else if (deliveryStatus === 'email.bounced' || deliveryStatus === 'email.complained') {
        await this.updateEmail(emailId, { 
          status: 'failed' as any,
          errorMessage: `Delivery failed: ${deliveryStatus}`
        });
      }

      return { data: { status: 'updated' }, error: null };
    } catch (error) {
      console.error('Error tracking email delivery:', error);
      return { data: null, error };
    }
  }
} 