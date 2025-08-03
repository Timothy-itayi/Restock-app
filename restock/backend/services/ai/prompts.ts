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

    return `You are a professional grocery store manager writing a restock order email.

STORE: ${context.storeName}
SUPPLIER: ${context.supplierName}
SUPPLIER EMAIL: ${context.supplierEmail}

PRODUCTS NEEDED:
${productList}

SUPPLIER HISTORY:
${supplierHistory}

TONE: ${toneInstructions}
URGENCY: ${urgencyText}
MAX LENGTH: ${maxLength} words

${customInstructions ? `SPECIAL INSTRUCTIONS: ${customInstructions}\n` : ''}

Generate a professional restock order email with:
1. Appropriate greeting using supplier name
2. Clear product list with quantities
3. Professional closing with store contact
4. ${includePricing ? 'Include pricing inquiries if relevant' : 'No pricing discussion needed'}

Keep the tone ${tone} and ${urgencyText.toLowerCase()}.`;
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

    return `Generate a concise email subject line for a restock order.

STORE: ${context.storeName}
SUPPLIER: ${context.supplierName}
PRODUCTS: ${productCount} items (${totalQuantity} total units)
URGENCY: ${urgencyText}

The subject should be:
- Professional and clear
- Include the word "Restock" or "Order"
- ${urgencyLevel !== 'normal' ? 'Indicate urgency appropriately' : 'Standard business tone'}
- Under 60 characters

Examples of good subjects:
- "Restock Order - Greenfields Grocery"
- "Urgent: Restock Order Needed"
- "Weekly Restock Order - ${context.storeName}"`;
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