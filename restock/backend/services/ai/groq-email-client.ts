import { GeneratedEmail, EmailContext } from './types';
import { supabase } from '../../config/supabase';

export class GroqEmailClient {
  private isInitialized = false;
  private isConfigured = false;

  constructor() {
    // Check if we have Supabase configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    this.isConfigured = !!(supabaseUrl && supabaseKey);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // If not configured, skip initialization
    if (!this.isConfigured) {
      console.warn('⚠️ Groq Email Client not configured. Using fallback email generation.');
      this.isInitialized = true;
      return;
    }

    try {
      console.log('🤖 Initializing Groq Email Client with Supabase...');
      
      // Test the connection by calling a simple Supabase query
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        throw error;
      }
      
      this.isInitialized = true;
      console.log('✅ Groq Email Client initialized successfully with Supabase');
    } catch (error) {
      console.error('❌ Error initializing Groq Email Client:', error);
      // Don't throw error, just mark as not configured
      this.isConfigured = false;
      this.isInitialized = true;
    }
  }

  async generateEmail(context: EmailContext, maxLength: number = 300): Promise<GeneratedEmail> {
    if (!this.isInitialized) {
      throw new Error('Groq Email Client not initialized. Call initialize() first.');
    }

    // If not configured, use fallback generation
    if (!this.isConfigured) {
      return this.generateFallbackEmail(context, maxLength);
    }

    const startTime = Date.now();

    try {
      console.log(`📧 Generating email for ${context.supplierName}...`);

      // Prepare the request payload for Supabase Edge Function
      const payload = {
        supplier: context.supplierName,
        email: context.supplierEmail,
        products: context.products.map(product => ({
          name: product.name,
          quantity: product.quantity
        })),
        user: context.userName || 'Store Manager',
        userEmail: context.userEmail,
        storeName: context.storeName,
        urgency: context.urgencyLevel || 'normal',
        tone: context.tone || 'professional'
      };

      // For now, use fallback generation since we don't have AI functions set up in Supabase yet
      // TODO: Implement Supabase Edge Functions for AI email generation
      console.log('🔄 Using fallback email generation (Supabase AI functions not yet implemented)');
      return this.generateFallbackEmail(context, maxLength);

    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error('Error generating email with Groq via Supabase:', error);
      // Fall back to template generation
      console.log('🔄 Falling back to template email generation...');
      return this.generateFallbackEmail(context, maxLength);
    }
  }

  private generateFallbackEmail(context: EmailContext, maxLength: number = 300): GeneratedEmail {
    const startTime = Date.now();
    
    // Build detailed product list with better formatting
    const productList = context.products.map(p => {
      const notes = p.notes ? ` (${p.notes})` : '';
      return `• ${p.quantity}x ${p.name}${notes}`;
    }).join('\n');
    
    // Generate personalized subject based on urgency and supplier
    let subject = `Restock Order from ${context.storeName}`;
    if (context.urgencyLevel === 'urgent') {
      subject = `Urgent Restock Order - ${context.storeName}`;
    } else if (context.urgencyLevel === 'rush') {
      subject = `Rush Order - ${context.storeName} to ${context.supplierName}`;
    }

    // Generate personalized email body based on tone
    const personalizedGreeting = this.getPersonalizedGreeting(context);
    const intro = this.getPersonalizedIntro(context);
    const urgencyNote = this.getUrgencyNote(context.urgencyLevel);
    const closing = this.getPersonalizedClosing(context);
    
    const body = `${personalizedGreeting}\n\n${intro}\n\n${productList}\n\n${urgencyNote}${closing}`;

    const generationTime = Date.now() - startTime;

    return {
      subject,
      body,
      confidence: 0.85, // Slightly higher confidence for improved fallback
      generationTime
    };
  }

  private getPersonalizedGreeting(context: EmailContext): string {
    switch (context.tone) {
      case 'friendly':
        return `Hello ${context.supplierName} team,\n\nI hope you're having a great day!`;
      case 'urgent':
        return `Dear ${context.supplierName},`;
      case 'professional':
      default:
        return `Dear ${context.supplierName} team,\n\nI hope this email finds you well.`;
    }
  }

  private getPersonalizedIntro(context: EmailContext): string {
    switch (context.tone) {
      case 'friendly':
        return `We're reaching out to place our next restock order with you. Here's what we need:`;
      case 'urgent':
        return `I need to place a restock order with the following products:`;
      case 'professional':
      default:
        return `We would like to place a restock order for the following items:`;
    }
  }

  private getUrgencyNote(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'rush':
        return `Please note: This is a rush order and we would appreciate delivery within 24 hours if possible.\n\n`;
      case 'urgent':
        return `Please prioritize this order for delivery within 2-3 business days.\n\n`;
      case 'normal':
      default:
        return ``;
    }
  }

  private getPersonalizedClosing(context: EmailContext): string {
    const userName = context.userName || 'Store Manager';
    const baseClosing = `Please confirm availability and expected delivery time at your earliest convenience.

Thank you for your continued partnership and excellent service.

Best regards,
${userName}
${context.storeName}`;

    switch (context.tone) {
      case 'friendly':
        return `Looking forward to hearing from you soon!

Thanks,
${userName}
${context.storeName}`;
      case 'urgent':
        return `Please respond as soon as possible.

${baseClosing}`;
      case 'professional':
      default:
        return baseClosing;
    }
  }

  async generateSubject(context: EmailContext): Promise<string> {
    const result = await this.generateEmail(context, 50);
    return result.subject;
  }

  async regenerateEmail(originalEmail: string, feedback: string, context?: EmailContext): Promise<GeneratedEmail> {
    // Use provided context or create a fallback context
    const emailContext = context || {
      supplierName: 'Supplier',
      supplierEmail: 'supplier@example.com',
      products: [],
      storeName: 'Your Store',
      tone: 'professional',
      urgencyLevel: 'normal',
      userEmail: 'manager@store.com',
      userName: 'Store Manager'
    };

    // For now, regenerate using the current context - could be enhanced to use feedback
    return this.generateEmail(emailContext);
  }

  getModelInfo(): { name: string; size: number } {
    return {
      name: 'Groq Mixtral-8x7b-32768',
      size: 0 // No local size for cloud model
    };
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
  }

  // Method to update the function URL (useful for development)
  setFunctionUrl(url: string): void {
    // Store URL for future use if needed
    console.log('Function URL updated:', url);
  }
} 