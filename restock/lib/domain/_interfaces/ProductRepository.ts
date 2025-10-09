/**
 * DOMAIN INTERFACE: ProductRepository
 * 
 * Contract for product data access - NO implementation details
 */

import { Product } from '../_entities/Product';

export interface ProductRepository {
  /**
   * Set the current user ID for this repository instance
   */
  setUserId(userId: string): void;

  // Basic CRUD operations
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findByUserId(): Promise<ReadonlyArray<Product>>; // RPC functions handle user isolation
  delete(id: string): Promise<void>;

  // Query operations
  findByName(name: string): Promise<ReadonlyArray<Product>>; // RPC functions handle user isolation
  search(searchTerm: string): Promise<ReadonlyArray<Product>>; // RPC functions handle user isolation
  findBySupplierId(supplierId: string): Promise<ReadonlyArray<Product>>; // RPC functions handle user isolation
  
  // Business queries
  countByUserId(): Promise<number>; // RPC functions handle user isolation
  findMostUsed(limit: number): Promise<ReadonlyArray<Product>>; // RPC functions handle user isolation
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
