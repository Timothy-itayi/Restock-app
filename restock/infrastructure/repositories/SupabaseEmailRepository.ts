import { supabase } from '../../backend/config/supabase';
import { EmailRepository, EmailRecord, CreateEmailRequest, UpdateEmailStatusRequest, EmailAnalytics } from '../../app/domain/interfaces/EmailRepository';

export class SupabaseEmailRepository implements EmailRepository {
  async create(request: CreateEmailRequest): Promise<string> {
    const { data, error } = await supabase
      .from('emails_sent')
      .insert({
        session_id: request.sessionId,
        user_id: request.userId, // This will need to be passed from the caller
        supplier_email: request.supplierEmail,
        supplier_name: request.supplierName,
        email_content: request.emailContent,
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create email record: ${error.message}`);
    }

    return data.id;
  }

  async updateStatus(request: UpdateEmailStatusRequest): Promise<string> {
    const { data, error } = await supabase
      .from('emails_sent')
      .update({
        status: request.status,
        error_message: request.errorMessage
      })
      .eq('id', request.id)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to update email status: ${error.message}`);
    }

    return data.id;
  }

  async getById(id: string): Promise<EmailRecord | null> {
    const { data, error } = await supabase
      .from('emails_sent')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to get email: ${error.message}`);
    }

    return this.mapToEmailRecord(data);
  }

  async findBySessionId(sessionId: string): Promise<EmailRecord[]> {
    const { data, error } = await supabase
      .from('emails_sent')
      .select()
      .eq('session_id', sessionId)
      .order('sent_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find emails by session: ${error.message}`);
    }

    return data?.map(item => this.mapToEmailRecord(item)) || [];
  }

  async findByUserId(userId: string): Promise<EmailRecord[]> {
    const { data, error } = await supabase
      .from('emails_sent')
      .select()
      .eq('user_id', userId)
      .order('sent_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find emails by user: ${error.message}`);
    }

    return data?.map(item => this.mapToEmailRecord(item)) || [];
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('emails_sent')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to remove email: ${error.message}`);
    }
  }

  async getAnalytics(): Promise<EmailAnalytics> {
    // This would need to be implemented with proper user context
    // For now, return default analytics
    const { data, error } = await supabase
      .from('emails_sent')
      .select('status, sent_at');

    if (error) {
      throw new Error(`Failed to get email analytics: ${error.message}`);
    }

    const totalSent = data?.length || 0;
    const totalDelivered = data?.filter(item => item.status === 'delivered').length || 0;
    const totalFailed = data?.filter(item => item.status === 'failed').length || 0;
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    // Calculate average delivery time (simplified)
    const deliveredEmails = data?.filter(item => item.status === 'delivered') || [];
    let totalDeliveryTime = 0;
    let validDeliveryTimes = 0;

    deliveredEmails.forEach(email => {
      if (email.sent_at) {
        const sentTime = new Date(email.sent_at).getTime();
        const now = Date.now();
        const deliveryTime = now - sentTime;
        if (deliveryTime > 0) {
          totalDeliveryTime += deliveryTime;
          validDeliveryTimes++;
        }
      }
    });

    const averageDeliveryTime = validDeliveryTimes > 0 ? totalDeliveryTime / validDeliveryTimes : 0;

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate,
      averageDeliveryTime
    };
  }

  private mapToEmailRecord(dbEmail: any): EmailRecord {
    return {
      id: dbEmail.id,
      sessionId: dbEmail.session_id,
      userId: dbEmail.user_id,
      supplierEmail: dbEmail.supplier_email,
      supplierName: dbEmail.supplier_name,
      emailContent: dbEmail.email_content,
      sentAt: new Date(dbEmail.sent_at).getTime(),
      status: dbEmail.status,
      errorMessage: dbEmail.error_message
    };
  }
}
