/**
 * Email Session Converter
 * 
 * Converts domain RestockSession entities to format expected by email system
 * Bridges the gap between fixed session management and email generation
 */

import { RestockSession } from '../../../../lib/domain/_entities/RestockSession';
import type { EmailDraft } from '../_hooks/useEmailSession';

export interface EmailSessionData {
  sessionId: string;
  products: Array<{
    name: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
  }>;
  createdAt: Date;
}

/**
 * Convert RestockSession domain entity to format suitable for email generation
 */
export function convertSessionToEmailData(session: RestockSession): EmailSessionData {
  return {
    sessionId: session.id,
    products: session.items.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      supplierName: item.supplierName,
      supplierEmail: item.supplierEmail,
    })),
    createdAt: session.createdAt,
  };
}

/**
 * Generate email drafts from session data with user profile information
 */
export function generateEmailDraftsFromSession(
  sessionData: EmailSessionData,
  userProfile: {
    name: string;
    email: string;
    storeName: string;
  }
): EmailDraft[] {
  const { storeName, name: userName, email: userEmail } = userProfile;
  
  console.log('📝 [EmailSessionConverter] Using user profile for email generation:', { storeName, userName, userEmail });
  
  // Group products by supplier
  const supplierGroups: { [key: string]: typeof sessionData.products } = {};
  
  sessionData.products.forEach(product => {
    const supplierName = product.supplierName || 'Unknown Supplier';
    if (!supplierGroups[supplierName]) {
      supplierGroups[supplierName] = [];
    }
    supplierGroups[supplierName].push(product);
  });

  // Generate email drafts for each supplier
  return Object.entries(supplierGroups).map(([supplierName, supplierProducts], index) => {
    const productList = supplierProducts
      .map(p => `• ${p.quantity}x ${p.name}`)
      .join('\n');
    
    const supplierEmail = supplierProducts[0].supplierEmail || 'supplier@example.com';
    
    return {
      id: `${sessionData.sessionId}-email-${index}`,
      supplierName,
      supplierEmail,
      subject: `Restock Order from ${storeName}`,
      body: `Hi ${supplierName} team,

We hope you're doing well! We'd like to place a restock order for the following items:

${productList}

Please confirm availability at your earliest convenience.

Thank you as always for your continued support.

Best regards,
${userName}
${storeName}
${userEmail}`,
      status: 'draft' as const,
      products: supplierProducts.map(p => `${p.quantity}x ${p.name}`),
    };
  });
}

/**
 * Check if a session can generate emails
 */
export function canGenerateEmails(session: RestockSession): boolean {
  return session.canGenerateEmails();
}

/**
 * Check if a session has been sent
 */
export function isSessionSent(session: RestockSession): boolean {
  return session.isCompleted();
}