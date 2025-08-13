/**
 * DOMAIN INTERFACE: SupplierRepository
 * 
 * Contract for supplier data access - NO implementation details
 */

import { Supplier } from '../entities/Supplier';

export interface SupplierRepository {
  // Basic CRUD operations
  save(supplier: Supplier): Promise<void>;
  findById(id: string): Promise<Supplier | null>;
  findByUserId(userId: string): Promise<ReadonlyArray<Supplier>>;
  delete(id: string): Promise<void>;

  // Query operations
  findByEmail(email: string): Promise<Supplier | null>;
  search(userId: string, searchTerm: string): Promise<ReadonlyArray<Supplier>>;
  
  // Business queries
  countByUserId(userId: string): Promise<number>;
  findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Supplier>>;
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
