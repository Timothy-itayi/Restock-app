/**
 * DOMAIN INTERFACE: EmailRepository
 * 
 * Defines the contract for email management operations
 * This interface is implemented by infrastructure layer repositories
 */

export interface EmailRecord {
  id: string;
  sessionId: string;
  userId: string;
  supplierEmail: string;
  supplierName: string;
  emailContent: string;
  sentAt: number;
  status: "sent" | "delivered" | "failed";
  errorMessage?: string;
}

export interface CreateEmailRequest {
  sessionId: string;
  userId: string;
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
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  averageDeliveryTime: number;
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
   * List emails by user
   */
  findByUserId(userId: string): Promise<EmailRecord[]>;

  /**
   * Remove email record
   */
  remove(id: string): Promise<void>;

  /**
   * Get email analytics for the current user
   */
  getAnalytics(): Promise<EmailAnalytics>;
}
