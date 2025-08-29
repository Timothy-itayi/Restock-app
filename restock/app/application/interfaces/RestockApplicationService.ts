/**
 * APPLICATION SERVICE INTERFACE: RestockApplicationService
 * 
 * High-level interface for restock session operations
 * Coordinates multiple use cases and provides a clean API for the UI layer
 */

import { RestockSession, type EmailDraft } from '../../domain';

// Command/Query types
export interface CreateSessionCommand {
  readonly name?: string;
}

export interface AddProductCommand {
  readonly sessionId: string;
  readonly productId: string;
  readonly supplierId: string;
  readonly quantity: number;
  readonly notes?: string;
}

export interface AddItemCommand {
  readonly sessionId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly supplierName: string;
  readonly supplierEmail: string;
  readonly notes?: string;
  readonly existingSession?: any; // Allow passing existing session to avoid repository lookup
}

export interface GenerateEmailsCommand {
  readonly sessionId: string;
  readonly userStoreName?: string;
  readonly userName?: string;
  readonly userEmail?: string;
}

export interface GetSessionsQuery {
  readonly includeCompleted?: boolean;
  readonly limit?: number;
}

// Result types
export interface SessionResult {
  readonly success: boolean;
  readonly session?: RestockSession;
  readonly error?: string;
}

export interface EmailsResult {
  readonly success: boolean;
  readonly emailDrafts?: ReadonlyArray<EmailDraft>;
  readonly session?: RestockSession;
  readonly error?: string;
}

export interface SessionsResult {
  readonly success: boolean;
  readonly sessions?: {
    readonly draft: ReadonlyArray<RestockSession>;
    readonly emailGenerated: ReadonlyArray<RestockSession>;
    readonly sent: ReadonlyArray<RestockSession>;
    readonly all: ReadonlyArray<RestockSession>;
  };
  readonly error?: string;
}

/**
 * Application Service Interface
 * 
 * This is what the UI layer depends on - a clean, stable interface
 * The implementation can change without affecting the UI
 */
export interface RestockApplicationService {
  // Session management
  createSession(command: CreateSessionCommand): Promise<SessionResult>;
  getSession(sessionId: string): Promise<SessionResult>;
  getSessions(query: GetSessionsQuery): Promise<SessionsResult>;
  deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }>;
  
  // Session modification
  addProduct(command: AddProductCommand): Promise<SessionResult>;
  addItem(command: AddItemCommand): Promise<SessionResult>;
  removeProduct(sessionId: string, productId: string): Promise<SessionResult>;
  updateProduct(sessionId: string, productId: string, quantity: number, notes?: string): Promise<SessionResult>;
  setSessionName(sessionId: string, name: string): Promise<SessionResult>;
  updateSessionName(command: { sessionId?: string; newName: string }): Promise<SessionResult>;
  
  // Email operations
  generateEmails(command: GenerateEmailsCommand): Promise<EmailsResult>;
  markAsSent(sessionId: string): Promise<SessionResult>;
  
  // Business queries
  getSessionSummary(sessionId: string): Promise<{
    success: boolean;
    summary?: {
      totalItems: number;
      totalProducts: number;
      supplierCount: number;
      status: string;
      isEmpty: boolean;
      canGenerateEmails: boolean;
      canSendEmails: boolean;
    };
    error?: string;
  }>;
}
