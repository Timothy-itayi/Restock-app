/**
 * DOMAIN ENTITY: Product
 * 
 * Pure business logic - NO external dependencies
 * Represents a product that can be restocked
 */

export interface ProductValue {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly defaultQuantity: number;
  readonly defaultSupplierId?: string;
  readonly createdAt: Date;
}

export class Product {
  private constructor(private readonly value: ProductValue) {}

  // Factory methods
  static create(params: {
    id: string;
    userId: string;
    name: string;
    defaultQuantity: number;
    defaultSupplierId?: string;
    createdAt?: Date;
  }): Product {
    // Business rule: Name must not be empty
    if (!params.name.trim()) {
      throw new Error('Product name cannot be empty');
    }

    // Business rule: Default quantity must be positive
    if (params.defaultQuantity <= 0) {
      throw new Error('Default quantity must be greater than zero');
    }

    return new Product({
      id: params.id,
      userId: params.userId,
      name: params.name.trim(),
      defaultQuantity: params.defaultQuantity,
      defaultSupplierId: params.defaultSupplierId,
      createdAt: params.createdAt || new Date(),
    });
  }

  static fromValue(value: ProductValue): Product {
    // Validate required fields
    if (!value.id || value.id.trim() === '') {
      throw new Error('Product ID is required');
    }
    
    if (!value.userId || value.userId.trim() === '') {
      throw new Error('User ID is required');
    }
    
    if (!value.name || value.name.trim() === '') {
      throw new Error('Product name cannot be empty');
    }
    
    if (value.name.length > 255) {
      throw new Error('Product name cannot exceed 255 characters');
    }
    
    if (value.defaultQuantity <= 0) {
      throw new Error('Default quantity must be greater than zero');
    }
    
    return new Product({
      ...value,
      name: value.name.trim(),
    });
  }

  // Getters
  get id(): string { return this.value.id; }
  get userId(): string { return this.value.userId; }
  get name(): string { return this.value.name; }
  get defaultQuantity(): number { return this.value.defaultQuantity; }
  get defaultSupplierId(): string | undefined { return this.value.defaultSupplierId; }
  get createdAt(): Date { return this.value.createdAt; }

  // Business logic methods
  updateName(name: string): Product {
    if (!name.trim()) {
      throw new Error('Product name cannot be empty');
    }

    return new Product({
      ...this.value,
      name: name.trim(),
    });
  }

  updateDefaultQuantity(quantity: number): Product {
    if (quantity <= 0) {
      throw new Error('Default quantity must be greater than zero');
    }

    return new Product({
      ...this.value,
      defaultQuantity: quantity,
    });
  }

  updateDefaultSupplier(supplierId?: string): Product {
    return new Product({
      ...this.value,
      defaultSupplierId: supplierId,
    });
  }

  // Query methods
  hasDefaultSupplier(): boolean {
    return !!this.value.defaultSupplierId;
  }

  matches(searchTerm: string): boolean {
    return this.value.name.toLowerCase().includes(searchTerm.toLowerCase());
  }

  // Export for persistence
  toValue(): ProductValue {
    return { ...this.value };
  }
}
