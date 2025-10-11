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


  // Basic CRUD operations


// RPC functions handle user isolation
  delete(id: string): Promise<void>;

  // Query operations
 // RPC functions handle user isolation
// RPC functions handle user isolation
// RPC functions handle user isolation
  
  // Business queries
// RPC functions handle user isolation
// RPC functions handle user isolation
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
