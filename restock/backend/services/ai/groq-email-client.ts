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
  
  // Build detailed product list with HTML formatting
  const productListHTML = context.products.map(p => {
    const notes = p.notes ? ` <span style="color: #666; font-style: italic;">(${p.notes})</span>` : '';
    return `<li style="margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${p.quantity}x ${p.name}</strong>${notes}</li>`;
  }).join('');
  
  // Generate personalized subject based on urgency and supplier
  let subject = `Restock Order from ${context.storeName}`;
  if (context.urgencyLevel === 'urgent') {
    subject = `Urgent Restock Order - ${context.storeName}`;
  } else if (context.urgencyLevel === 'rush') {
    subject = `Rush Order - ${context.storeName} to ${context.supplierName}`;
  }

  // Generate personalized email body based on tone
  const personalizedGreeting = this.getPersonalizedGreetingHTML(context);
  const intro = this.getPersonalizedIntroHTML(context);
  const urgencyNote = this.getUrgencyNoteHTML(context.urgencyLevel);
  const closing = this.getPersonalizedClosingHTML(context);
  
  // Create professional HTML email body
  const body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restock Order from ${context.storeName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  
  <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6B7F6B 0%, #A7B9A7 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0;">Restock App</h1>
      <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Professional Store Management</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px 20px;">
      <div style="font-size: 18px; margin-bottom: 20px; color: #2c3e50;">
        ${personalizedGreeting}
      </div>
      
      ${urgencyNote}
      
      <p style="margin: 20px 0; color: #555;">
        ${intro}
      </p>
      
      <!-- Product List -->
      <div style="background: #f8f9fa; border-left: 4px solid #6B7F6B; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Order Items:</h3>
        <ul style="margin: 0; padding: 0; list-style: none;">
          ${productListHTML}
        </ul>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef;">
        ${closing}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
      <p style="margin: 0;">Sent via <strong>Restock App</strong> - Professional Store Management</p>
      <p style="margin: 5px 0 0 0;">This email was sent to ${context.supplierName} on behalf of ${context.storeName}</p>
    </div>
    
  </div>
</body>
</html>`;

  const generationTime = Date.now() - startTime;

  return {
    subject,
    body,
    confidence: 0.9, // Higher confidence for professional HTML template
    generationTime
  };
}

private getPersonalizedGreetingHTML(context: EmailContext): string {
  switch (context.tone) {
    case 'friendly':
      return `Hello <strong>${context.supplierName}</strong> team!<br><br>I hope you're having a great day!`;
    case 'urgent':
      return `Dear <strong>${context.supplierName}</strong>,`;
    case 'professional':
    default:
      return `Dear <strong>${context.supplierName}</strong> team,<br><br>I hope this email finds you well.`;
  }
}

private getPersonalizedIntroHTML(context: EmailContext): string {
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

private getUrgencyNoteHTML(urgencyLevel: string): string {
  switch (urgencyLevel) {
    case 'rush':
      return `<div style="background: #ff6b6b; color: white; padding: 12px; border-radius: 6px; margin: 20px 0; text-align: center; font-weight: 600;">
        🚨 RUSH ORDER - Please deliver within 24 hours if possible
      </div>`;
    case 'urgent':
      return `<div style="background: #ffa726; color: white; padding: 12px; border-radius: 6px; margin: 20px 0; text-align: center; font-weight: 600;">
        ⚠️ URGENT ORDER - Please prioritize for delivery within 2-3 business days
      </div>`;
    case 'normal':
    default:
      return ``;
  }
}

private getPersonalizedClosingHTML(context: EmailContext): string {
  const userName = context.userName || 'Store Manager';
  const userEmail = context.userEmail || 'manager@store.com';
  
  const baseClosing = `
    <p style="margin: 20px 0; color: #555;">
      Please confirm availability and expected delivery time at your earliest convenience.
    </p>
    <p style="margin: 20px 0; color: #555;">
      Thank you for your continued partnership and excellent service.
    </p>
    <div style="margin-top: 30px;">
      <div style="font-weight: 600; color: #2c3e50; font-size: 16px;">Best regards,</div>
      <div style="margin-top: 10px; color: #555;">
        <strong>${userName}</strong><br>
        ${context.storeName}<br>
        <a href="mailto:${userEmail}" style="color: #6B7F6B; text-decoration: none;">${userEmail}</a>
      </div>
    </div>`;

  switch (context.tone) {
    case 'friendly':
      return `
        <p style="margin: 20px 0; color: #555;">
          Looking forward to hearing from you soon!
        </p>
        <div style="margin-top: 30px;">
          <div style="font-weight: 600; color: #2c3e50; font-size: 16px;">Thanks,</div>
          <div style="margin-top: 10px; color: #555;">
            <strong>${userName}</strong><br>
            ${context.storeName}<br>
            <a href="mailto:${userEmail}" style="color: #6B7F6B; text-decoration: none;">${userEmail}</a>
          </div>
        </div>`;
    case 'urgent':
      return `
        <p style="margin: 20px 0; color: #555; font-weight: 600;">
          Please respond as soon as possible.
        </p>
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