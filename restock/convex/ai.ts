import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * AI FUNCTIONS
 * 
 * Handles AI-powered email generation using Groq
 * Clerk auth context is automatically available
 */

export const generateEmail = mutation({
  args: {
    supplier: v.string(),
    email: v.string(),
    products: v.array(v.object({
      name: v.string(),
      quantity: v.number()
    })),
    user: v.string(),
    userEmail: v.string(),
    storeName: v.string(),
    urgency: v.string(),
    tone: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    try {
      // For now, we'll use a template-based approach
      // In the future, this can be enhanced with actual Groq API calls
      
      const subject = generateSubject(args.storeName || 'Your Store', args.urgency);
      const body = generateEmailBody(args);
      
      // Create email record in the database
      const emailId = await ctx.db.insert("emailsSent", {
        sessionId: "template" as any, // We'll need a proper session ID
        userId,
        supplierEmail: args.email,
        supplierName: args.supplier,
        emailContent: `${subject}\n\n${body}`,
        sentAt: now,
        status: "sent",
      });

      // Create audit log
      await ctx.db.insert("auditLogs", {
        userId,
        action: "generate_ai_email",
        resourceType: "email",
        resourceId: emailId,
        details: `Generated AI email to ${args.supplier} (${args.email})`,
        timestamp: now,
      });

      return {
        subject,
        body,
        confidence: 0.95,
        emailId
      };

    } catch (error) {
      console.error('Error generating AI email:', error);
      
      // Fallback to template generation
      const subject = generateSubject(args.storeName || 'Your Store', args.urgency);
      const body = generateEmailBody(args);
      
      return {
        subject,
        body,
        confidence: 0.85,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
});

// Helper methods for email generation
function generateSubject(storeName: string, urgency: string): string {
  switch (urgency) {
    case 'rush':
      return `Rush Order - ${storeName}`;
    case 'urgent':
      return `Urgent Restock Order - ${storeName}`;
    default:
      return `Restock Order from ${storeName}`;
  }
}

function generateEmailBody(args: any): string {
  const productList = args.products.map((p: any) => 
    `• ${p.quantity}x ${p.name}`
  ).join('\n');
  
  const greeting = getPersonalizedGreeting(args.tone, args.supplier);
  const intro = getPersonalizedIntro(args.tone);
  const urgencyNote = getUrgencyNote(args.urgency);
  const closing = getPersonalizedClosing(args.tone, args.user, args.storeName);
  
  return `${greeting}\n\n${intro}\n\n${productList}\n\n${urgencyNote}${closing}`;
}

function getPersonalizedGreeting(tone: string, supplierName: string): string {
  switch (tone) {
    case 'friendly':
      return `Hello ${supplierName} team,\n\nI hope you're having a great day!`;
    case 'urgent':
      return `Dear ${supplierName},`;
    case 'professional':
    default:
      return `Dear ${supplierName} team,\n\nI hope this email finds you well.`;
  }
}

function getPersonalizedIntro(tone: string): string {
  switch (tone) {
    case 'friendly':
      return `We're reaching out to place our next restock order with you. Here's what we need:`;
    case 'urgent':
      return `I need to place a restock order with the following products:`;
    case 'professional':
    default:
      return `We would like to place a restock order for the following items:`;
  }
}

function getUrgencyNote(urgencyLevel: string): string {
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

function getPersonalizedClosing(tone: string, userName: string, storeName: string): string {
  const baseClosing = `Please confirm availability and expected delivery time at your earliest convenience.

Thank you for your continued partnership and excellent service.

Best regards,
${userName}
${storeName}`;

  switch (tone) {
    case 'friendly':
      return `Looking forward to hearing from you soon!

Thanks,
${userName}
${storeName}`;
    case 'urgent':
      return `Please respond as soon as possible.

${baseClosing}`;
    case 'professional':
    default:
      return baseClosing;
  }
}
