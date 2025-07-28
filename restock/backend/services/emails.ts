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
} 