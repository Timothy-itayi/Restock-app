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
  deliveryStatus?: string;
  sentVia?: string;
  trackingId?: string;
  resendWebhookData?: any;
  supplierId?: string;
  sentAt?: string;
  status?: string;
  errorMessage?: string;
}



export interface EmailRepository {
  /**
   * Set the current user ID for this repository instance
   */
  setUserId(userId: string): void;

  /**
   * Create an email record
   */
  create(request: CreateEmailRequest): Promise<string>;


}
