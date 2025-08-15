/**
 * DOMAIN SERVICE: RestockSessionDomainService
 * 
 * Orchestrates business operations on RestockSession entities
 * Enforces business rules and coordinates between entities
 */

import { RestockSession, RestockItemValue, SessionStatus } from '../entities/RestockSession';
import { Product } from '../entities/Product';
import { Supplier } from '../entities/Supplier';

export interface AddItemRequest {
  readonly productName: string;
  readonly quantity: number;
  readonly supplierName: string;
  readonly supplierEmail: string;
  readonly notes?: string;
}

export interface AddItemResult {
  readonly session: RestockSession;
  readonly item: RestockItemValue;
  readonly newProduct?: Product;
  readonly newSupplier?: Supplier;
}

export interface AddProductToSessionRequest {
  readonly product: Product;
  readonly supplier: Supplier;
  readonly quantity: number;
  readonly notes?: string;
}

export interface EmailDraft {
  readonly supplierName: string;
  readonly supplierEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly items: Array<{ productName: string; quantity: number }>;
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
   * Add a product to a session using only user-provided information
   * This method ensures products and suppliers exist before linking to sessions
   */
  static addItemToSession(
    session: RestockSession,
    request: AddItemRequest,
    existingProducts?: ReadonlyArray<Product>,
    existingSuppliers?: ReadonlyArray<Supplier>
  ): AddItemResult {
    // Business rule: Session must be editable
    if (!session.canAddItems()) {
      throw new Error('Cannot add items to a completed session');
    }

    // Business rule: Quantity must be positive
    if (request.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    // Business rule: Product name cannot be empty
    if (!request.productName.trim()) {
      throw new Error('Product name cannot be empty');
    }

    // Business rule: Supplier name cannot be empty
    if (!request.supplierName.trim()) {
      throw new Error('Supplier name cannot be empty');
    }

    // Business rule: Supplier email must be valid
    if (!this.isValidEmail(request.supplierEmail)) {
      throw new Error('Supplier email must be valid');
    }

    // Check for duplicate products in the session
    const existingItem = session.items.find(item => 
      item.productName.toLowerCase() === request.productName.toLowerCase()
    );
    
    if (existingItem) {
      throw new Error(`Product "${request.productName}" is already in this session`);
    }

    // CRITICAL FIX: Ensure product exists before adding to session
    let product = existingProducts?.find(p => 
      p.name.toLowerCase() === request.productName.toLowerCase()
    );
    
    let supplier = existingSuppliers?.find(s => 
      s.name.toLowerCase() === request.supplierName.toLowerCase() &&
      s.email.toLowerCase() === request.supplierEmail.toLowerCase()
    );

    // Create new product if it doesn't exist
    if (!product) {
      product = Product.create({
        id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        name: request.productName.trim(),
        defaultQuantity: request.quantity,
      });
    }

    // Create new supplier if it doesn't exist
    if (!supplier) {
      supplier = Supplier.create({
        id: `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        name: request.supplierName.trim(),
        email: request.supplierEmail.trim().toLowerCase(),
      });
    }

    // Now create the item with real IDs (no more temporary IDs)
    const item: RestockItemValue = {
      productId: product.id,
      productName: product.name,
      quantity: request.quantity,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      notes: request.notes?.trim(),
    };

    // Add item to session
    const updatedSession = session.addItem(item);

    return {
      session: updatedSession,
      item,
      newProduct: !existingProducts?.find(p => p.id === product.id) ? product : undefined,
      newSupplier: !existingSuppliers?.find(s => s.id === supplier.id) ? supplier : undefined,
    };
  }

  /**
   * Add an existing product to a session (for when you have full entities)
   */
  static addProductToSession(
    session: RestockSession,
    product: Product,
    supplier: Supplier,
    quantity: number,
    notes?: string
  ): RestockSession {
    // Business rule: Session must be editable
    if (!session.canAddItems()) {
      throw new Error('Cannot add items to a completed session');
    }

    // Business rule: Product must belong to the same user
    if (product.userId !== session.userId) {
      throw new Error('Product does not belong to the current user');
    }

    // Business rule: Supplier must belong to the same user
    if (supplier.userId !== session.userId) {
      throw new Error('Supplier does not belong to the current user');
    }

    // Business rule: Quantity must be positive
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    // Check for duplicate products in the session
    if (session.hasProduct(product.id)) {
      throw new Error(`Product "${product.name}" is already in this session`);
    }

    const item: RestockItemValue = {
      productId: product.id,
      productName: product.name,
      quantity,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      notes: notes?.trim(),
    };

    return session.addItem(item);
  }

  /**
   * Remove an item from a session
   */
  static removeItemFromSession(
    session: RestockSession,
    productId: string
  ): RestockSession {
    if (!session.canAddItems()) {
      throw new Error('Cannot modify a completed session');
    }

    return session.removeItem(productId);
  }

  /**
   * Update an item in a session
   */
  static updateItemInSession(
    session: RestockSession,
    productId: string,
    updates: Partial<Pick<RestockItemValue, 'quantity' | 'notes'>>
  ): RestockSession {
    if (!session.canAddItems()) {
      throw new Error('Cannot modify a completed session');
    }

    return session.updateItem(productId, updates);
  }

  /**
   * Mark a session as ready for email generation
   */
  static markSessionReadyForEmails(session: RestockSession): RestockSession {
    if (session.items.length === 0) {
      throw new Error('Cannot generate emails for a session with no items');
    }

    if (session.status !== SessionStatus.DRAFT) {
      throw new Error('Session is not in draft status');
    }

    return session.generateEmails();
  }

  /**
   * Mark a session as completed (emails sent)
   */
  static markSessionCompleted(session: RestockSession): RestockSession {
    if (session.status !== SessionStatus.EMAIL_GENERATED) {
      throw new Error('Session must be ready for emails before marking as completed');
    }

    return session.markAsSent();
  }

  /**
   * Generate email content for a session
   */
  static generateEmailContent(
    session: RestockSession,
    storeName: string,
    senderName: string
  ): Array<{
    supplierName: string;
    supplierEmail: string;
    subject: string;
    body: string;
    items: Array<{ productName: string; quantity: number }>;
  }> {
    if (session.status === SessionStatus.DRAFT) {
      throw new Error('Session must be ready for emails before generating content');
    }

    // Group items by supplier
    const supplierGroups = new Map<string, Array<RestockItemValue>>();
    
    for (const item of session.items) {
      const key = `${item.supplierId}:${item.supplierEmail}`;
      if (!supplierGroups.has(key)) {
        supplierGroups.set(key, []);
      }
      supplierGroups.get(key)!.push(item);
    }

    // Generate email content for each supplier
    return Array.from(supplierGroups.entries()).map(([key, items]) => {
      const [supplierId, supplierEmail] = key.split(':');
      const supplierName = items[0].supplierName;
      
      const subject = this.generateEmailSubject(storeName, supplierName);
      const body = this.generateEmailBody(items, storeName, senderName, supplierName);
      
      return {
        supplierName,
        supplierEmail,
        subject,
        body,
        items: items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
        })),
      };
    });
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
   * Generate email drafts for all suppliers in a session
   */
  static generateEmailDrafts(
    session: RestockSession,
    userStoreName?: string,
    userName?: string
  ): Array<{
    supplierName: string;
    supplierEmail: string;
    subject: string;
    body: string;
    items: Array<{ productName: string; quantity: number }>;
  }> {
    if (!session.canGenerateEmails()) {
      throw new Error('Session is not ready for email generation');
    }

    const storeName = userStoreName || 'Your Store';
    const senderName = userName || 'Store Manager';

    // Group items by supplier
    const supplierGroups = new Map<string, Array<RestockItemValue>>();
    
    for (const item of session.items) {
      const key = `${item.supplierId}:${item.supplierEmail}`;
      if (!supplierGroups.has(key)) {
        supplierGroups.set(key, []);
      }
      supplierGroups.get(key)!.push(item);
    }

    // Generate email content for each supplier
    return Array.from(supplierGroups.entries()).map(([key, items]) => {
      const [supplierId, supplierEmail] = key.split(':');
      const supplierName = items[0].supplierName;
      
      const subject = this.generateEmailSubject(storeName, supplierName);
      const body = this.generateEmailBody(items, storeName, senderName, supplierName);
      
      return {
        supplierName,
        supplierEmail,
        subject,
        body,
        items: items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
        })),
      };
    });
  }

  /**
   * Calculate session summary statistics
   */
  static calculateSessionSummary(session: RestockSession): {
    totalItems: number;
    totalProducts: number;
    supplierCount: number;
    status: SessionStatus;
    isEmpty: boolean;
    canGenerateEmails: boolean;
    canSendEmails: boolean;
  } {
    return {
      totalItems: session.getTotalItems(),
      totalProducts: session.items.length,
      supplierCount: session.getUniqueSupplierCount(),
      status: session.status,
      isEmpty: session.items.length === 0,
      canGenerateEmails: session.canGenerateEmails(),
      canSendEmails: session.canSendEmails(),
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
