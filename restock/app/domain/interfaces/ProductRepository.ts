/**
 * DOMAIN INTERFACE: ProductRepository
 * 
 * Contract for product data access - NO implementation details
 */

import { Product } from '../entities/Product';

export interface ProductRepository {
  // Basic CRUD operations
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findByUserId(userId: string): Promise<ReadonlyArray<Product>>;
  delete(id: string): Promise<void>;

  // Query operations
  findByName(userId: string, name: string): Promise<ReadonlyArray<Product>>;
  search(userId: string, searchTerm: string): Promise<ReadonlyArray<Product>>;
  findBySupplierId(userId: string, supplierId: string): Promise<ReadonlyArray<Product>>;
  
  // Business queries
  countByUserId(userId: string): Promise<number>;
  findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Product>>;
}

export interface ProductRepositoryError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;
}

export class ProductNotFoundError extends Error implements ProductRepositoryError {
  readonly code = 'PRODUCT_NOT_FOUND';
  
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductSaveError extends Error implements ProductRepositoryError {
  readonly code = 'PRODUCT_SAVE_ERROR';
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ProductSaveError';
    this.context = context;
  }
}
