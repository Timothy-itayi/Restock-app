/**
 * DOMAIN INTERFACE: SupplierRepository
 * 
 * Contract for supplier data access - NO implementation details
 */

import { Supplier } from '../_entities/Supplier';

export interface SupplierRepository {
  

 // RPC functions handle user isolation
  delete(id: string): Promise<void>;

  // Query operations

// RPC functions handle user isolation
  


}

export interface SupplierRepositoryError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;
}

export class SupplierNotFoundError extends Error implements SupplierRepositoryError {
  readonly code = 'SUPPLIER_NOT_FOUND';
  
  constructor(supplierId: string) {
    super(`Supplier with ID ${supplierId} not found`);
    this.name = 'SupplierNotFoundError';
  }
}

export class SupplierSaveError extends Error implements SupplierRepositoryError {
  readonly code = 'SUPPLIER_SAVE_ERROR';
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'SupplierSaveError';
    this.context = context;
  }
}
