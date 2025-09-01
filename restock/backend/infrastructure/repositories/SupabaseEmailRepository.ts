import { supabase } from '../../config/supabase';
import { EmailRepository, CreateEmailRequest } from '../../../app/domain/interfaces/EmailRepository';

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
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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
    const { data, error } = await client.rpc('insert_email', {
      p_session_id: request.sessionId,
      p_supplier_name: request.supplierName,
      p_supplier_email: request.supplierEmail,
      p_subject: 'Restock Order', // Default subject
      p_body: request.emailContent,
      p_status: request.status || 'sent'
    });

    if (error) {
      throw new Error(`Failed to create email record: ${error.message}`);
    }

    // Return the created email ID
    return data?.id || '';
  }

  async saveEmail(emailData: any): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('insert_email', {
      p_session_id: emailData.sessionId,
      p_supplier_name: emailData.supplierName,
      p_supplier_email: emailData.supplierEmail,
      p_subject: emailData.subject,
      p_body: emailData.body,
      p_status: emailData.status
    });

    if (error) {
      throw new Error(`Failed to save email: ${error.message}`);
    }
  }

  async updateEmailStatus(emailId: string, status: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('update_email_status', {
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
