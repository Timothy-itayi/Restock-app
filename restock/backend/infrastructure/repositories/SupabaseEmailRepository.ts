import { EmailRepository, CreateEmailRequest } from '../../../app/domain/interfaces/EmailRepository';

export class SupabaseEmailRepository implements EmailRepository {
  private edgeFunctionUrl: string;
  private userId: string | null = null;

  constructor() {
    if (!process.env.EXPO_PUBLIC_SUPABASE_EMAIL_FN_URL) {
      throw new Error('Missing Supabase Edge Function URL in environment variables');
    }
    this.edgeFunctionUrl = process.env.EXPO_PUBLIC_SUPABASE_EMAIL_FN_URL;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  async create(request: CreateEmailRequest): Promise<string> {
    try {
      // Send request to edge function
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          userId: this.userId, // optional, if needed by edge function
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Edge Function failed to create email record');
      }

      console.log(`[EmailRepository] Email record created for ${request.supplierName}`);
      return result.data?.id;
    } catch (err: any) {
      console.error('[EmailRepository] create() error:', err);
      throw err;
    }
  }
}
