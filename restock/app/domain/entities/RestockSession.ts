/**
 * DOMAIN ENTITY: RestockSession
 * 
 * Pure business logic - NO external dependencies
 * Represents the core business concept of a restocking session
 */

export enum SessionStatus {
  DRAFT = 'draft',
  EMAIL_GENERATED = 'email_generated', 
  SENT = 'sent'
}

export interface RestockItemValue {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly supplierId: string;
  readonly supplierName: string;
  readonly supplierEmail: string;
  readonly notes?: string;
}

export interface SessionValue {
  readonly id: string;
  readonly userId: string;
  readonly name?: string;
  readonly status: SessionStatus;
  readonly items: ReadonlyArray<RestockItemValue>;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

/**
 * RestockSession Domain Entity
 * 
 * Contains ONLY business logic and invariants
 * No knowledge of React, Supabase, or any external systems
 */
export class RestockSession {
  private constructor(private readonly value: SessionValue) {}

  // Factory methods
  static create(params: {
    id: string;
    userId: string;
    name?: string;
    createdAt?: Date;
  }): RestockSession {
    // Generate default name if not provided
    const defaultName = params.name || `Restock Session ${new Date().toISOString().split('T')[0]}`;
    
    return new RestockSession({
      id: params.id,
      userId: params.userId,
      name: defaultName,
      status: SessionStatus.DRAFT,
      items: [],
      createdAt: params.createdAt || new Date(),
    });
  }

  static fromValue(value: SessionValue): RestockSession {
    // Validate required fields
    if (!value.id || value.id.trim() === '') {
      throw new Error('Session ID is required');
    }
    
    if (!value.userId || value.userId.trim() === '') {
      throw new Error('User ID is required');
    }
    
    if (value.name && value.name.length > 255) {
      throw new Error('Session name cannot exceed 255 characters');
    }
    
    return new RestockSession(value);
  }

  // Getters
  get id(): string { return this.value.id; }
  get userId(): string { return this.value.userId; }
  get name(): string | undefined { return this.value.name; }
  get status(): SessionStatus { return this.value.status; }
  get items(): ReadonlyArray<RestockItemValue> { return this.value.items; }
  get createdAt(): Date { return this.value.createdAt; }
  get updatedAt(): Date | undefined { return this.value.updatedAt; }

  // Business logic methods
  addItem(item: Omit<RestockItemValue, 'productId'> & { productId: string }): RestockSession {
    // Business rule: Cannot add duplicate products
    if (this.hasProduct(item.productId)) {
      throw new Error(`Product ${item.productName} is already in this session`);
    }

    // Business rule: Quantity must be positive
    if (item.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const newItems = [...this.value.items, item];
    return new RestockSession({
      ...this.value,
      items: newItems,
      updatedAt: new Date(),
    });
  }

  removeItem(productId: string): RestockSession {
    const newItems = this.value.items.filter(item => item.productId !== productId);
    return new RestockSession({
      ...this.value,
      items: newItems,
      updatedAt: new Date(),
    });
  }

  updateItem(productId: string, updates: Partial<Pick<RestockItemValue, 'productName' | 'quantity' | 'supplierName' | 'supplierEmail' | 'notes'>>): RestockSession {
    if (updates.quantity !== undefined && updates.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const newItems = this.value.items.map(item => 
      item.productId === productId 
        ? { ...item, ...updates }
        : item
    );

    return new RestockSession({
      ...this.value,
      items: newItems,
      updatedAt: new Date(),
    });
  }

  setName(name: string): RestockSession {
    // Business rule: Name cannot be empty
    if (!name.trim()) {
      throw new Error('Session name cannot be empty');
    }

    return new RestockSession({
      ...this.value,
      name: name.trim(),
      updatedAt: new Date(),
    });
  }

  generateEmails(): RestockSession {
    // Business rule: Can only generate emails from draft status
    if (this.value.status !== SessionStatus.DRAFT) {
      throw new Error('Emails can only be generated from draft sessions');
    }

    // Business rule: Cannot generate emails for empty session
    if (this.value.items.length === 0) {
      throw new Error('Cannot generate emails for empty session');
    }

    return new RestockSession({
      ...this.value,
      status: SessionStatus.EMAIL_GENERATED,
      updatedAt: new Date(),
    });
  }

  markAsSent(): RestockSession {
    // Business rule: Can only send from email_generated status
    if (this.value.status !== SessionStatus.EMAIL_GENERATED) {
      throw new Error('Can only send emails that have been generated');
    }

    return new RestockSession({
      ...this.value,
      status: SessionStatus.SENT,
      updatedAt: new Date(),
    });
  }

  // Query methods
  hasProduct(productId: string): boolean {
    return this.value.items.some(item => item.productId === productId);
  }

  findItemById(productId: string): RestockItemValue | undefined {
    return this.value.items.find(item => item.productId === productId);
  }

  isEmpty(): boolean {
    return this.value.items.length === 0;
  }

  getTotalItems(): number {
    return this.value.items.reduce((total, item) => total + item.quantity, 0);
  }

  getUniqueSupplierCount(): number {
    return this.getUniqueSuppliers().length;
  }

  getUniqueSuppliers(): ReadonlyArray<{ id: string; name: string; email: string }> {
    const supplierMap = new Map<string, { id: string; name: string; email: string }>();
    
    this.value.items.forEach(item => {
      if (!supplierMap.has(item.supplierId)) {
        supplierMap.set(item.supplierId, {
          id: item.supplierId,
          name: item.supplierName,
          email: item.supplierEmail,
        });
      }
    });

    return Array.from(supplierMap.values());
  }

  getItemsBySupplier(supplierId: string): ReadonlyArray<RestockItemValue> {
    return this.value.items.filter(item => item.supplierId === supplierId);
  }

  canAddItems(): boolean {
    return this.value.status === SessionStatus.DRAFT;
  }

  canGenerateEmails(): boolean {
    return this.value.status === SessionStatus.DRAFT && this.value.items.length > 0;
  }

  canSendEmails(): boolean {
    return this.value.status === SessionStatus.EMAIL_GENERATED;
  }

  isDraft(): boolean {
    return this.value.status === SessionStatus.DRAFT;
  }

  isCompleted(): boolean {
    return this.value.status === SessionStatus.SENT;
  }

  // Export for persistence
  toValue(): SessionValue {
    return { ...this.value };
  }
}
