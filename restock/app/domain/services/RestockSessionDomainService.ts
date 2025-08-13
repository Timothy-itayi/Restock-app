/**
 * DOMAIN SERVICE: RestockSessionDomainService
 * 
 * Pure business logic orchestration - NO external dependencies
 * Contains complex business logic that doesn't belong to a single entity
 */

import { RestockSession, RestockItemValue, SessionStatus } from '../entities/RestockSession';
import { Product } from '../entities/Product';
import { Supplier } from '../entities/Supplier';

export interface EmailDraft {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly supplierEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly items: ReadonlyArray<RestockItemValue>;
}

export interface SessionSummary {
  readonly totalItems: number;
  readonly totalProducts: number;
  readonly supplierCount: number;
  readonly status: SessionStatus;
  readonly isEmpty: boolean;
  readonly canGenerateEmails: boolean;
  readonly canSendEmails: boolean;
}

export class RestockSessionDomainService {
  /**
   * Create a new restock session with validation
   */
  static createSession(params: {
    id: string;
    userId: string;
    name?: string;
  }): RestockSession {
    return RestockSession.create(params);
  }

  /**
   * Add a product to a session with business validation
   */
  static addProductToSession(
    session: RestockSession,
    product: Product,
    supplier: Supplier,
    quantity: number,
    notes?: string
  ): RestockSession {
    // Business rule: Product and supplier must belong to same user
    if (product.userId !== session.userId) {
      throw new Error('Product must belong to the session owner');
    }

    if (supplier.userId !== session.userId) {
      throw new Error('Supplier must belong to the session owner');
    }

    // Business rule: Session must be editable
    if (!session.canAddItems()) {
      throw new Error('Cannot add items to a completed session');
    }

    const item: RestockItemValue = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      notes: notes,
    };

    return session.addItem(item);
  }

  /**
   * Generate email drafts for all suppliers in a session
   */
  static generateEmailDrafts(
    session: RestockSession,
    userStoreName?: string,
    userName?: string
  ): ReadonlyArray<EmailDraft> {
    if (!session.canGenerateEmails()) {
      throw new Error('Session is not ready for email generation');
    }

    const suppliers = session.getUniqueSuppliers();
    const storeName = userStoreName || 'Your Store';
    const senderName = userName || 'Store Manager';

    return suppliers.map(supplier => {
      const supplierItems = session.getItemsBySupplier(supplier.id);
      
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        subject: this.generateEmailSubject(storeName, supplier.name),
        body: this.generateEmailBody(supplierItems, storeName, senderName, supplier.name),
        items: supplierItems,
      };
    });
  }

  /**
   * Calculate session summary statistics
   */
  static calculateSessionSummary(session: RestockSession): SessionSummary {
    return {
      totalItems: session.getTotalItems(),
      totalProducts: session.items.length,
      supplierCount: session.getUniqueSuppliers().length,
      status: session.status,
      isEmpty: session.items.length === 0,
      canGenerateEmails: session.canGenerateEmails(),
      canSendEmails: session.canSendEmails(),
    };
  }

  /**
   * Validate session before email generation
   */
  static validateSessionForEmailGeneration(session: RestockSession): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (session.items.length === 0) {
      errors.push('Session must contain at least one product');
    }

    if (!session.canGenerateEmails()) {
      errors.push('Session is not in a state that allows email generation');
    }

    // Check that all items have valid suppliers
    const invalidItems = session.items.filter(item => 
      !item.supplierEmail || !this.isValidEmail(item.supplierEmail)
    );

    if (invalidItems.length > 0) {
      errors.push('All items must have valid supplier email addresses');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Group sessions by status for dashboard display
   */
  static groupSessionsByStatus(sessions: ReadonlyArray<RestockSession>): {
    draft: ReadonlyArray<RestockSession>;
    emailGenerated: ReadonlyArray<RestockSession>;
    sent: ReadonlyArray<RestockSession>;
  } {
    return {
      draft: sessions.filter(s => s.status === SessionStatus.DRAFT),
      emailGenerated: sessions.filter(s => s.status === SessionStatus.EMAIL_GENERATED),
      sent: sessions.filter(s => s.status === SessionStatus.SENT),
    };
  }

  /**
   * Find sessions that can be replayed (sent sessions with items)
   */
  static findReplayableSessions(sessions: ReadonlyArray<RestockSession>): ReadonlyArray<RestockSession> {
    return sessions.filter(s => s.isCompleted() && s.items.length > 0);
  }

  /**
   * Create a replay session from an existing completed session
   */
  static createReplaySession(
    originalSession: RestockSession,
    newSessionId: string,
    adjustQuantities: boolean = false,
    quantityMultiplier: number = 1.0
  ): RestockSession {
    if (!originalSession.isCompleted()) {
      throw new Error('Can only replay completed sessions');
    }

    const newSession = RestockSession.create({
      id: newSessionId,
      userId: originalSession.userId,
      name: `${originalSession.name || 'Restock Session'} (Replay)`,
    });

    // Add all items from original session
    let replaySession = newSession;
    
    for (const item of originalSession.items) {
      const quantity = adjustQuantities 
        ? Math.max(1, Math.round(item.quantity * quantityMultiplier))
        : item.quantity;

      replaySession = replaySession.addItem({
        ...item,
        quantity,
      });
    }

    return replaySession;
  }

  // Private helper methods
  private static generateEmailSubject(storeName: string, supplierName: string): string {
    return `Restock Order from ${storeName}`;
  }

  private static generateEmailBody(
    items: ReadonlyArray<RestockItemValue>,
    storeName: string,
    senderName: string,
    supplierName: string
  ): string {
    const itemList = items
      .map(item => `• ${item.quantity}x ${item.productName}`)
      .join('\n');

    return `Hi ${supplierName} team,

We hope you're doing well! We'd like to place a restock order for the following items:

${itemList}

Please confirm availability and provide an estimated delivery time at your earliest convenience.

Thank you for your continued support.

Best regards,
${senderName}
${storeName}`;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
