import { supabase } from '../../config/supabase';
import { EmailRepository, EmailRecord, CreateEmailRequest, UpdateEmailStatusRequest, EmailAnalytics } from '../../../app/domain/interfaces/EmailRepository';

export class SupabaseEmailRepository implements EmailRepository {
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  /**
   * Set the user ID for this repository instance
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Get the current user ID, throwing an error if not set
   */
  private getCurrentUserId(): string {
    if (!this.userId) {
      throw new Error('User ID not set in repository. Call setUserId() first.');
    }
    return this.userId;
  }

  async create(request: CreateEmailRequest): Promise<string> {
    const { data, error } = await supabase.rpc('insert_email_sent', {
      p_delivery_status: 'pending',
      p_sent_via: 'resend',
      p_tracking_id: null,
      p_resend_webhook_data: null,
      p_session_id: request.sessionId,
      p_supplier_id: null, // We'll need to map supplier_email to supplier_id
      p_email_content: request.emailContent,
      p_sent_at: new Date().toISOString(),
      p_status: 'sent',
      p_error_message: null
    });

    if (error) {
      throw new Error(`Failed to create email record: ${error.message}`);
    }

    // RPC returns array, get first item
    const createdEmail = Array.isArray(data) ? data[0] : data;
    return createdEmail?.id || '';
  }

  async updateStatus(request: UpdateEmailStatusRequest): Promise<string> {
    const { data, error } = await supabase.rpc('update_email_sent', {
      p_user_id: this.getCurrentUserId(),
      p_id: request.id,
      p_delivery_status: request.status,
      p_sent_via: null,
      p_tracking_id: null,
      p_resend_webhook_data: null,
      p_email_content: null,
      p_sent_at: null,
      p_status: request.status,
      p_error_message: request.errorMessage
    });

    if (error) {
      throw new Error(`Failed to update email status: ${error.message}`);
    }

    // RPC returns array, get first item
    const updatedEmail = Array.isArray(data) ? data[0] : data;
    return updatedEmail?.id || '';
  }

  async getById(id: string): Promise<EmailRecord | null> {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent', {
        p_user_id: this.getCurrentUserId()
      });
      
      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      const email = emails?.find((e: any) => e.id === id);
      return email ? this.mapToEmailRecord(email) : null;
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error getting email by ID:', error);
      return null;
    }
  }

  async findBySessionId(sessionId: string): Promise<EmailRecord[]> {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent', {
        p_user_id: this.getCurrentUserId()
      });
      
      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      const sessionEmails = emails?.filter((e: any) => e.session_id === sessionId) || [];
      return sessionEmails.map((item: any) => this.mapToEmailRecord(item));
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error finding emails by session ID:', error);
      return [];
    }
  }

  async findByUserId(): Promise<EmailRecord[]> {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent', {
        p_user_id: this.getCurrentUserId()
      });
      
      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      return emails?.map((item: any) => this.mapToEmailRecord(item)) || [];
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error finding emails by user ID:', error);
      return [];
    }
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_email_sent', {
      p_user_id: this.getCurrentUserId(),
      p_id: id
    });

    if (error) {
      throw new Error(`Failed to remove email: ${error.message}`);
    }
  }

  async getAnalytics(): Promise<EmailAnalytics> {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent', {
        p_user_id: this.getCurrentUserId()
      });
      
      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      const totalEmails = emails?.length || 0;
      const sentEmails = emails?.filter((e: any) => e.status === 'sent').length || 0;
      const failedEmails = emails?.filter((e: any) => e.status === 'failed').length || 0;
      const pendingEmails = emails?.filter((e: any) => e.status === 'pending').length || 0;

      return {
        totalEmails,
        sentEmails,
        failedEmails,
        pendingEmails,
        successRate: totalEmails > 0 ? (sentEmails / totalEmails) * 100 : 0
      };
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error getting email analytics:', error);
      return {
        totalEmails: 0,
        sentEmails: 0,
        failedEmails: 0,
        pendingEmails: 0,
        successRate: 0
      };
    }
  }

  async findByStatus(status: string): Promise<EmailRecord[]> {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent', {
        p_user_id: this.getCurrentUserId()
      });
      
      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      const filteredEmails = emails?.filter((e: any) => e.status === status) || [];
      return filteredEmails.map((item: any) => this.mapToEmailRecord(item));
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error finding emails by status:', error);
      return [];
    }
  }

  async findBySupplier(supplierEmail: string): Promise<EmailRecord[]> {
    try {
      const { data: emails, error } = await supabase.rpc('get_emails_sent', {
        p_user_id: this.getCurrentUserId()
      });
      
      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      // Note: This assumes the emails_sent table has supplier_email field
      // If it only has supplier_id, we'd need to join with suppliers table
      const supplierEmails = emails?.filter((e: any) => 
        e.supplier_email === supplierEmail || e.supplier_id === supplierEmail
      ) || [];

      return supplierEmails.map((item: any) => this.mapToEmailRecord(item));
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error finding emails by supplier:', error);
      return [];
    }
  }

  private mapToEmailRecord(data: any): EmailRecord {
    return {
      id: data.id,
      sessionId: data.session_id,
      supplierEmail: data.supplier_email || '',
      supplierName: data.supplier_name || '',
      emailContent: data.email_content || '',
      sentAt: data.sent_at ? new Date(data.sent_at).getTime() : new Date().getTime(),
      status: data.status || 'pending',
      errorMessage: data.error_message || null,
      deliveryStatus: data.delivery_status || 'pending',
      trackingId: data.tracking_id || null
    };
  }
}
