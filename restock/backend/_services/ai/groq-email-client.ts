import { supabase } from '../../_config/supabase';
import { EmailContext, GeneratedEmail } from './types';

export class GroqEmailClient {
  private isInitialized = false;
  private isConfigured = false;

  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    this.isConfigured = !!(supabaseUrl && supabaseKey);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.isConfigured) {
      console.warn('⚠️ Groq Email Client not configured. Using fallback email generation.');
      this.isInitialized = true;
      return;
    }

    try {
      console.log('🤖 Initializing Groq Email Client with Supabase...');
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      this.isInitialized = true;
      console.log('✅ Groq Email Client initialized successfully with Supabase');
    } catch (error) {
      console.error('❌ Error initializing Groq Email Client:', error);
      this.isConfigured = false;
      this.isInitialized = true;
    }
  }

  async generateEmail(context: EmailContext, maxLength: number = 300): Promise<GeneratedEmail> {
    if (!this.isInitialized) throw new Error('Groq Email Client not initialized. Call initialize() first.');
    if (!this.isConfigured) return this.generateFallbackEmail(context, maxLength);

    const startTime = Date.now();

    try {
      console.log(`📧 Generating email for ${context.supplierName}...`);

      // Fallback for now; can be replaced with Supabase AI function
      return this.generateFallbackEmail(context, maxLength);

    } catch (error) {
      console.error('❌ Error generating email:', error);
      return this.generateFallbackEmail(context, maxLength);
    }
  }

  private generateFallbackEmail(context: EmailContext, maxLength: number = 300): GeneratedEmail {
    const startTime = Date.now();

    // Build product list
    const productListHTML = context.products.map(p => {
      const notes = p.notes ? ` <span style="color:#666;font-style:italic;">(${p.notes})</span>` : '';
      return `<li style="margin:8px 0;padding:8px 0;border-bottom:1px solid #eee;"><strong>${p.quantity}x ${p.name}</strong>${notes}</li>`;
    }).join('');

    // Subject line based on urgency
    let subject = `Restock Order from ${context.storeName}`;
    if (context.urgencyLevel === 'urgent') subject = `⚠️ Urgent Restock Order - ${context.storeName}`;
    if (context.urgencyLevel === 'rush') subject = `🚨 Rush Order - ${context.storeName} to ${context.supplierName}`;

    const content = {
      greeting: this.getPersonalizedGreetingHTML(context),
      intro: this.getPersonalizedIntroHTML(context),
      urgencyNote: this.getUrgencyNoteHTML(context.urgencyLevel),
      productListHTML,
      closing: this.getPersonalizedClosingHTML(context)
    };

    const body = this.renderEmailLayout(context, content);
    const text = this.renderPlainText(context, content);

    return {
      subject,
      body,
      confidence: 0.9,
      generationTime: Date.now() - startTime
    };
  }

  private renderEmailLayout(context: EmailContext, content: {
    greeting: string;
    intro: string;
    urgencyNote: string;
    productListHTML: string;
    closing: string;
  }): string {
    const preheader = `Order from ${context.storeName} for ${context.products.length} item(s)`;
    const logoUrl = process.env.EXPO_PUBLIC_EMAIL_LOGO_URL || 'https://restockapp.email/logo.png';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${context.storeName} Restock</title>
  <style>
    .preheader{display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;}
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;line-height:1.6;">
  <div class="preheader">${preheader}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="padding:40px 24px 20px 24px;text-align:center;">
        <img src="${logoUrl}" width="48" height="48" style="border-radius:10px;border:1px solid #e5e7eb;margin-bottom:12px;"/>
        <h1 style="margin:0;font-size:22px;font-weight:600;color:#111827;">Restock</h1>
        <p style="margin:6px 0 0;font-size:14px;color:#6b7280;">Smarter Store Management</p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">On behalf of <strong>${context.storeName}</strong> → <strong>${context.supplierName}</strong></p>
        <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">From: orders@restockapp.email<br/>Reply-To: ${context.userEmail}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#111827;">${content.greeting}</h2>
        <p style="margin:0 0 20px;color:#374151;font-size:15px;">${content.intro}</p>
        ${content.urgencyNote ? `<p style="padding:12px 16px;background:#fef3c7;color:#92400e;border-radius:6px;font-size:14px;margin-bottom:24px;">${content.urgencyNote}</p>` : ''}
        <div style="margin-bottom:24px;">
          <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">Order Items</h3>
          <ul style="margin:0;padding:0;list-style:none;">${content.productListHTML}</ul>
        </div>
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;color:#374151;font-size:14px;">${content.closing}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;">
        <p style="margin:0;">Delivered via <strong>Restock App</strong></p>
        <p style="margin:4px 0 0;">© ${new Date().getFullYear()} Restock. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private renderPlainText(context: EmailContext, content: {
    greeting: string;
    intro: string;
    urgencyNote: string;
    productListHTML: string;
    closing: string;
  }): string {
    return `
Order from ${context.storeName}

${content.greeting}

${content.intro}

${content.urgencyNote ? `\n${content.urgencyNote}\n` : ''}

Order Items:
${context.products.map(p => `- ${p.name} (${p.quantity})`).join('\n')}

${content.closing}

Sent via Restock App
From: orders@restockapp.email
Reply-To: ${context.userEmail}
    `;
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
        return `🚨 RUSH ORDER - Please deliver within 24 hours if possible`;
      case 'urgent':
        return `⚠️ URGENT ORDER - Please prioritize for delivery within 2-3 business days`;
      case 'normal':
      default:
        return '';
    }
  }

  private getPersonalizedClosingHTML(context: EmailContext): string {
    const userName = context.userName || 'Store Manager';
    const userEmail = context.userEmail || 'manager@store.com';

    const baseClosing = `
<p style="margin:20px 0;color:#555;">Please confirm availability and expected delivery time at your earliest convenience.</p>
<p style="margin:20px 0;color:#555;">Thank you for your continued partnership and excellent service.</p>
<div style="margin-top:30px;">
  <div style="font-weight:600;color:#2c3e50;font-size:16px;">Best regards,</div>
  <div style="margin-top:10px;color:#555;">
    <strong>${userName}</strong><br/>
    ${context.storeName}<br/>
    <a href="mailto:${userEmail}" style="color:#6B7F6B;text-decoration:none;">${userEmail}</a>
  </div>
</div>`;

    switch (context.tone) {
      case 'friendly':
        return `
<p style="margin:20px 0;color:#555;">Looking forward to hearing from you soon!</p>
<div style="margin-top:30px;">
  <div style="font-weight:600;color:#2c3e50;font-size:16px;">Thanks,</div>
  <div style="margin-top:10px;color:#555;">
    <strong>${userName}</strong><br/>
    ${context.storeName}<br/>
    <a href="mailto:${userEmail}" style="color:#6B7F6B;text-decoration:none;">${userEmail}</a>
  </div>
</div>`;
      case 'urgent':
        return `<p style="margin:20px 0;color:#555;font-weight:600;">Please respond as soon as possible.</p>` + baseClosing;
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
    return this.generateEmail(emailContext);
  }

  getModelInfo(): { name: string; size: number } {
    return { name: 'Groq Mixtral-8x7b-32768', size: 0 };
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
  }

  setFunctionUrl(url: string): void {
    console.log('Function URL updated:', url);
  }
}
