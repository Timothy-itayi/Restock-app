/**
 * DOMAIN INTERFACE: SessionRepository
 * 
 * Contract for session data access - NO implementation details
 * This is the boundary between domain and infrastructure
 */

import { RestockSession } from '../entities/RestockSession';

export interface SessionRepository {
  /**
   * Set the current user ID for this repository instance
   */
  setUserId(userId: string): void;

  // Basic CRUD operations
  save(session: RestockSession): Promise<void>;
  findById(id: string): Promise<RestockSession | null>;
  findByUserId(): Promise<ReadonlyArray<RestockSession>>; // RPC functions handle user isolation
  delete(id: string): Promise<void>;
  remove(id: string): Promise<void>; // Alias for delete for backward compatibility

  // Session management operations (used by UI components)
  create(session: Omit<RestockSession, 'id'>): Promise<string>;
  addItem(sessionId: string, item: any): Promise<void>;
  removeItem(itemId: string): Promise<void>; // RPC functions handle user isolation
  updateName(sessionId: string, name: string): Promise<void>;
  updateStatus(sessionId: string, status: string): Promise<void>;
  updateRestockItem(itemId: string, updates: {
    productName?: string;
    quantity?: number;
    supplierName?: string;
    supplierEmail?: string;
    notes?: string;
  }): Promise<void>;
  markAsSent(sessionId: string): Promise<{ success: boolean; error?: string }>;

  // Query operations
  findUnfinishedByUserId(): Promise<ReadonlyArray<RestockSession>>; // RPC functions handle user isolation
  findCompletedByUserId(): Promise<ReadonlyArray<RestockSession>>; // RPC functions handle user isolation
  findByStatus(status: string): Promise<ReadonlyArray<RestockSession>>; // RPC functions handle user isolation
  
  // Business queries
  countByUserId(): Promise<number>; // RPC functions handle user isolation
  findRecentByUserId(limit: number): Promise<ReadonlyArray<RestockSession>>; // RPC functions handle user isolation
}

export interface SessionRepositoryError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;
}

export class SessionNotFoundError extends Error implements SessionRepositoryError {
  readonly code = 'SESSION_NOT_FOUND';
  
  constructor(sessionId: string) {
    super(`Session with ID ${sessionId} not found`);
    this.name = 'SessionNotFoundError';
  }
}

export class SessionSaveError extends Error implements SessionRepositoryError {
  readonly code = 'SESSION_SAVE_ERROR';
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'SessionSaveError';
    this.context = context;
  }
}
