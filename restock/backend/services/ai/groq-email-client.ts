import { GeneratedEmail, EmailContext } from './types';

export class GroqEmailClient {
  private isInitialized = false;
  private functionUrl: string;
  private isConfigured = false;

  constructor() {
    // This will be set when the function is deployed
    this.functionUrl = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL || 
                      'https://your-project-id.functions.supabase.co/generate-email';
    
    // Check if we have a real function URL (not the placeholder)
    this.isConfigured = this.functionUrl !== 'https://your-project-id.functions.supabase.co/generate-email' && 
                       this.functionUrl.includes('supabase.co');
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
      console.log('🤖 Initializing Groq Email Client...');
      
      // Test the connection
      const testResponse = await fetch(this.functionUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });

      if (testResponse.ok) {
        this.isInitialized = true;
        console.log('✅ Groq Email Client initialized successfully');
      } else {
        throw new Error(`Function not accessible: ${testResponse.status}`);
      }
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

      // Prepare the request payload
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

      // Call the Supabase Edge Function
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Function error response:', errorData);
        throw new Error(`Email generation failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const generationTime = Date.now() - startTime;

      return {
        subject: data.subject || 'Restock Order Request',
        body: data.body || data.emailText || '',
        confidence: data.confidence || 0.95,
        generationTime
      };

    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error('Error generating email with Groq:', error);
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
${context.storeName}
${context.userEmail}`;

    switch (context.tone) {
      case 'friendly':
        return `Looking forward to hearing from you soon!\n\n${baseClosing}`;
      case 'urgent':
        return `Your prompt response would be greatly appreciated.\n\n${baseClosing}`;
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
    this.functionUrl = url;
  }
} 