import { CreateEmailRequest, EmailRepository } from '../../../lib/domain/_interfaces/EmailRepository';
import { supabase } from '../../_config/supabase';

export class SupabaseEmailRepository implements EmailRepository {
  private userId: string | null = null;
  private getClerkTokenFn: (() => Promise<string | null>) | null = null;
  private _cachedClient: any = null;
  private _cachedToken: string | null = null;

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
   * Set the Clerk token getter function
   */
  setClerkTokenGetter(fn: () => Promise<string | null>) {
    this.getClerkTokenFn = fn;
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

  /**
   * Create an authenticated Supabase client with Clerk JWT token
   */
  private async getAuthenticatedClient() {
    if (!this.getClerkTokenFn) {
      console.warn('No Clerk token getter set, using default client');
      return supabase;
    }

    try {
      const token = await this.getClerkTokenFn();
      if (!token) {
        console.warn('No Clerk token available, using default client');
        return supabase;
      }

      // Return cached client if token hasn't changed
      if (this._cachedClient && this._cachedToken === token) {
        return this._cachedClient;
      }

      // Create new authenticated client
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

      // Cache the client and token
      this._cachedClient = client;
      this._cachedToken = token;

      return client;
    } catch (error) {
      console.warn('Failed to create authenticated client:', error);
      return supabase;
    }
  }

  /**
   * Create an email record
   */
  async create(request: CreateEmailRequest): Promise<string> {
    const client = await this.getAuthenticatedClient();
    const { data, error } = await client.rpc('insert_email_sent', {
      p_delivery_status: request.deliveryStatus || 'pending',
      p_sent_via: request.sentVia || 'resend',
      p_tracking_id: request.trackingId || null,
      p_resend_webhook_data: request.resendWebhookData || null,
      p_session_id: request.sessionId,
      p_supplier_id: request.supplierId || null,
      p_email_content: request.emailContent,
      p_sent_at: request.sentAt || new Date().toISOString(),
      p_status: request.status || 'sent',
      p_error_message: request.errorMessage || null
    });

    if (error) {
      throw new Error(`Failed to create email record: ${error.message}`);
    }

    // RPC commonly returns an array; normalize to ID
    const created = Array.isArray(data) ? data[0] : data;
    return created?.id || '';
  }

  async saveEmail(emailData: any): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('insert_email_sent', {
      p_delivery_status: emailData.deliveryStatus || 'pending',
      p_sent_via: emailData.sentVia || 'resend',
      p_tracking_id: emailData.trackingId || null,
      p_resend_webhook_data: emailData.resendWebhookData || null,
      p_session_id: emailData.sessionId,
      p_supplier_id: emailData.supplierId || null,
      p_email_content: emailData.body || emailData.emailContent,
      p_sent_at: emailData.sentAt || new Date().toISOString(),
      p_status: emailData.status || 'sent',
      p_error_message: emailData.errorMessage || null
    });

    if (error) {
      throw new Error(`Failed to save email: ${error.message}`);
    }
  }

  async updateEmailStatus(emailId: string, status: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('update_email_sent', {
      p_id: emailId,
      p_status: status
    });

    if (error) {
      throw new Error(`Failed to update email status: ${error.message}`);
    }
  }

  async findBySessionId(sessionId: string): Promise<any[]> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: emails, error } = await client.rpc('get_emails_by_session', {
        p_session_id: sessionId
      });

      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      return emails || [];
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error finding emails by session ID:', error);
      return [];
    }
  }

  async findByUserId(): Promise<any[]> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: emails, error } = await client.rpc('get_emails');

      if (error) {
        throw new Error(`Failed to get emails: ${error.message}`);
      }

      return emails || [];
    } catch (error) {
      console.error('[SupabaseEmailRepository] Error finding emails by user ID:', error);
      return [];
    }
  }

  async deleteEmail(emailId: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('delete_email', {
      p_id: emailId
    });

    if (error) {
      throw new Error(`Failed to delete email: ${error.message}`);
    }
  }
}
