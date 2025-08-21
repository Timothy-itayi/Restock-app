/**
 * DOMAIN INTERFACE: EmailRepository
 * 
 * Defines the contract for email management operations
 * This interface is implemented by infrastructure layer repositories
 */

export interface EmailRecord {
  id: string;
  sessionId: string;
  supplierEmail: string;
  supplierName: string;
  emailContent: string;
  sentAt: number;
  status: "sent" | "delivered" | "failed";
  errorMessage?: string;
  deliveryStatus?: string;
  trackingId?: string;
}

export interface CreateEmailRequest {
  sessionId: string;
  supplierEmail: string;
  supplierName: string;
  emailContent: string;
}

export interface UpdateEmailStatusRequest {
  id: string;
  status: "sent" | "delivered" | "failed";
  errorMessage?: string;
}

export interface EmailAnalytics {
  totalEmails: number;
  sentEmails: number;
  failedEmails: number;
  pendingEmails: number;
  successRate: number;
}

export interface EmailRepository {
  /**
   * Create an email record
   */
  create(request: CreateEmailRequest): Promise<string>;

  /**
   * Update email delivery status
   */
  updateStatus(request: UpdateEmailStatusRequest): Promise<string>;

  /**
   * Get email by ID
   */
  getById(id: string): Promise<EmailRecord | null>;

  /**
   * List emails by session
   */
  findBySessionId(sessionId: string): Promise<EmailRecord[]>;

  /**
   * List emails by user (RPC functions handle user isolation)
   */
  findByUserId(): Promise<EmailRecord[]>;

  /**
   * Remove email record
   */
  remove(id: string): Promise<void>;

  /**
   * Get email analytics for the current user (RPC functions handle user isolation)
   */
  getAnalytics(): Promise<EmailAnalytics>;

  /**
   * Find emails by status (RPC functions handle user isolation)
   */
  findByStatus(status: string): Promise<EmailRecord[]>;

  /**
   * Find emails by supplier (RPC functions handle user isolation)
   */
  findBySupplier(supplierEmail: string): Promise<EmailRecord[]>;
}
