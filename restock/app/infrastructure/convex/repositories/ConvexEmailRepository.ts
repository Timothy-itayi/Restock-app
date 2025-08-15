import { ConvexReactClient } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { 
  EmailRepository, 
  EmailRecord as DomainEmailRecord,
  CreateEmailRequest as DomainCreateEmailRequest,
  UpdateEmailStatusRequest as DomainUpdateEmailStatusRequest,
  EmailAnalytics as DomainEmailAnalytics
} from "../../../domain/interfaces/EmailRepository";

/**
 * ConvexEmailRepository
 * 
 * Implements email management using Convex functions
 * Maintains clean architecture by providing email service interface
 * Convex specifics are completely hidden from other layers
 */



export class ConvexEmailRepository implements EmailRepository {
  constructor(private convexClient: ConvexReactClient) {}

  /**
   * Create an email record
   */
  async create(request: DomainCreateEmailRequest): Promise<string> {
    const convexRequest = {
      ...request,
      sessionId: request.sessionId as Id<"restockSessions">
    };
    return await this.convexClient.mutation(api.emails.create, convexRequest);
  }

  /**
   * Update email delivery status
   */
  async updateStatus(request: DomainUpdateEmailStatusRequest): Promise<string> {
    const convexRequest = {
      ...request,
      id: request.id as Id<"emailsSent">
    };
    return await this.convexClient.mutation(api.emails.updateStatus, convexRequest);
  }

  /**
   * Get email by ID
   */
  async getById(id: string): Promise<DomainEmailRecord | null> {
    return await this.convexClient.query(api.emails.get, { id: id as Id<"emailsSent"> });
  }

  /**
   * List emails by session
   */
  async findBySessionId(sessionId: string): Promise<DomainEmailRecord[]> {
    return await this.convexClient.query(api.emails.listBySession, { sessionId: sessionId as Id<"restockSessions"> });
  }

  /**
   * List emails by user
   */
  async findByUserId(userId: string): Promise<DomainEmailRecord[]> {
    return await this.convexClient.query(api.emails.listByUser, {});
  }

  /**
   * Remove email record
   */
  async remove(id: string): Promise<void> {
    await this.convexClient.mutation(api.emails.remove, { id: id as Id<"emailsSent"> });
  }

  /**
   * Get email analytics for the current user
   */
  async getAnalytics(): Promise<DomainEmailAnalytics> {
    return await this.convexClient.query(api.emails.getAnalytics, {});
  }
}
