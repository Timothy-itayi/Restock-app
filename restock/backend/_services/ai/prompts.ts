import { EmailContext, EmailGenerationOptions } from './types';

export class PromptBuilder {
  static buildEmailPrompt(context: EmailContext, options: EmailGenerationOptions = {}): string {
    const {
      tone = 'professional',
      includePricing = false,
      urgencyLevel = 'normal',
      customInstructions = '',
      maxLength = 300
    } = options;

    const productList = context.products
      .map(p => `• ${p.quantity}x ${p.name}${p.notes ? ` (${p.notes})` : ''}`)
      .join('\n');

    const supplierHistory = context.supplierHistory?.length 
      ? this.formatSupplierHistory(context.supplierHistory)
      : 'No previous interactions recorded.';

    const urgencyText = this.getUrgencyText(urgencyLevel);
    const toneInstructions = this.getToneInstructions(tone);

    return `You are writing a professional restock order email from a grocery store manager to a specific supplier.

SENDER INFORMATION:
- Store Name: ${context.storeName}
- Manager Email: ${context.userEmail}
- Manager Name: ${context.userName || 'Store Manager'}

RECIPIENT INFORMATION:
- Supplier: ${context.supplierName}
- Supplier Email: ${context.supplierEmail}

PRODUCTS TO ORDER:
${productList}

SUPPLIER RELATIONSHIP:
${supplierHistory}

EMAIL REQUIREMENTS:
- Tone: ${toneInstructions}
- Urgency: ${urgencyText}
- Maximum Length: ${maxLength} words
- ${includePricing ? 'Include pricing inquiries where appropriate' : 'Focus on product availability, not pricing'}

${customInstructions ? `SPECIAL INSTRUCTIONS: ${customInstructions}\n` : ''}

Generate a personalized, professional restock order email that:
1. Opens with a personalized greeting addressing ${context.supplierName} specifically
2. Clearly states this is a restock order from ${context.storeName}
3. Lists all products with exact quantities needed
4. Uses the supplier's actual name throughout the email (not generic terms)
5. Closes with a professional signature including:
   - The sender's name (${context.userName || 'Store Manager'})
   - Store name (${context.storeName})
   - Contact email (${context.userEmail})
6. Maintains a ${tone} tone with ${urgencyText.toLowerCase()} urgency level

IMPORTANT: 
- Address the supplier by their actual name "${context.supplierName}"
- Sign the email with the manager's information and store name
- Make it clear this email is from a real person at ${context.storeName}, not a generic template
- Include the sender's email (${context.userEmail}) in the signature for replies`;
  }

  private static formatSupplierHistory(history: any[]): string {
    if (!history.length) return 'No previous interactions.';

    const recentHistory = history
      .slice(-3) // Last 3 interactions
      .map(h => `${h.date}: ${h.type} - ${h.summary} (${h.outcome})`)
      .join('\n');

    return recentHistory;
  }

  private static getUrgencyText(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'rush':
        return 'URGENT - Need delivery within 24 hours';
      case 'urgent':
        return 'URGENT - Need delivery within 2-3 days';
      case 'normal':
      default:
        return 'Standard delivery timeline acceptable';
    }
  }

  private static getToneInstructions(tone: string): string {
    switch (tone) {
      case 'friendly':
        return 'Warm and personable, like writing to a trusted business partner';
      case 'urgent':
        return 'Direct and urgent, emphasizing time sensitivity';
      case 'professional':
      default:
        return 'Professional and courteous, maintaining business relationship';
    }
  }

  static buildSubjectPrompt(context: EmailContext, options: EmailGenerationOptions = {}): string {
    const urgencyLevel = options.urgencyLevel || 'normal';
    const urgencyText = this.getUrgencyText(urgencyLevel);
    
    const productCount = context.products.length;
    const totalQuantity = context.products.reduce((sum, p) => sum + p.quantity, 0);

    return `Generate a personalized email subject line for a restock order to a specific supplier.

FROM: ${context.storeName}
TO: ${context.supplierName}
ORDER DETAILS: ${productCount} items (${totalQuantity} total units)
URGENCY: ${urgencyText}

Create a subject line that:
- Clearly identifies this as a restock order from ${context.storeName}
- ${urgencyLevel !== 'normal' ? 'Indicates urgency appropriately' : 'Uses standard business tone'}
- Is professional and concise (under 60 characters)
- Could include supplier name for personalization
- Uses clear action words like "Restock Order" or "Product Order"

Good examples for this context:
- "Restock Order from ${context.storeName}"
- "${urgencyLevel === 'urgent' ? 'Urgent ' : ''}Restock Order - ${context.storeName}"
- "Product Order Request - ${context.storeName} to ${context.supplierName}"
- "${context.storeName} Restock Order (${productCount} items)"

Generate ONE subject line that best fits this specific supplier relationship.`;
  }

  static buildRegenerationPrompt(originalEmail: string, feedback: string): string {
    return `Please improve this restock order email based on the feedback provided.

ORIGINAL EMAIL:
${originalEmail}

FEEDBACK:
${feedback}

Please generate an improved version that addresses the feedback while maintaining the professional tone and including all necessary information.`;
  }

  static buildPersonalizationPrompt(context: EmailContext): string {
    const supplierHistory = context.supplierHistory?.filter(h => h.outcome === 'positive');
    
    if (!supplierHistory?.length) {
      return 'This is our first order with this supplier. Keep the tone professional and welcoming.';
    }

    const recentPositive = supplierHistory.slice(-2);
    const positiveInteractions = recentPositive
      .map(h => `${h.date}: ${h.summary}`)
      .join('\n');

    return `Based on our positive history with ${context.supplierName}, personalize this email appropriately.

RECENT POSITIVE INTERACTIONS:
${positiveInteractions}

Use this history to:
- Reference past successful orders if relevant
- Show appreciation for continued partnership
- Maintain the positive relationship tone`;
  }
} 