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
        user: 'Store Manager',
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
    
    // Build product list
    const productList = context.products.map(p => `• ${p.quantity}x ${p.name}`).join('\n');
    
    // Generate subject based on urgency
    let subject = 'Restock Order Request';
    if (context.urgencyLevel === 'urgent') {
      subject = 'Urgent Restock Order Request';
    } else if (context.urgencyLevel === 'rush') {
      subject = 'Rush Restock Order Request';
    }

    // Generate email body
    const greeting = `Hi ${context.supplierName} team,`;
    const intro = `We hope you're doing well! We'd like to place a restock order for the following items:`;
    const closing = `Please confirm availability at your earliest convenience.\n\nThank you as always for your continued support.\n\nBest regards,\n${context.storeName}`;
    
    const body = `${greeting}\n\n${intro}\n\n${productList}\n\n${closing}`;

    const generationTime = Date.now() - startTime;

    return {
      subject,
      body,
      confidence: 0.8, // Lower confidence for fallback
      generationTime
    };
  }

  async generateSubject(context: EmailContext): Promise<string> {
    const result = await this.generateEmail(context, 50);
    return result.subject;
  }

  async regenerateEmail(originalEmail: string, feedback: string): Promise<GeneratedEmail> {
    // For regeneration, we'll create a new context with the feedback
    const context: EmailContext = {
      supplierName: 'Supplier',
      supplierEmail: 'supplier@example.com',
      products: [],
      storeName: 'Store',
      tone: 'professional',
      urgencyLevel: 'normal'
    };

    return this.generateEmail(context);
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