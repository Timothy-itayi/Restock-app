import { ConvexReactClient } from "convex/react";
import { SessionRepository } from "../../../domain/interfaces/SessionRepository";
import { RestockSession, SessionStatus } from "../../../domain/entities/RestockSession";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

/**
 * ConvexSessionRepository
 * 
 * Implements SessionRepository interface using Convex functions
 * Maintains clean architecture - no React hooks in repository class
 * Convex specifics are completely hidden from other layers
 */
export class ConvexSessionRepository implements SessionRepository {
  constructor(private convexClient: ConvexReactClient) {}

  /**
   * Save a new session or update existing one
   */
  async save(session: RestockSession): Promise<void> {
    const value = session.toValue();
    
    if (session.id.startsWith('temp_')) {
      // Create new session
      const convexId = await this.convexClient.mutation(api.restockSessions.create, {
        name: value.name,
      });
      
      // Note: We can't update the session ID directly since it's readonly
      // The session will need to be recreated with the new ID in the calling code
      console.log('Session created with Convex ID:', convexId);
    } else {
      // Update existing session
      if (value.name) {
        await this.convexClient.mutation(api.restockSessions.updateName, {
          id: session.id as Id<"restockSessions">,
          name: value.name,
        });
      }
    }
  }

  /**
   * Find session by ID
   */
  async findById(id: string): Promise<RestockSession | null> {
    try {
      const convexId = id as Id<"restockSessions">;
      const sessionData = await this.convexClient.query(api.restockSessions.get, { id: convexId });
      
      if (!sessionData) {
        return null;
      }
      
      // Convert Convex data to domain entity
      return RestockSession.fromValue({
        id: sessionData._id,
        userId: sessionData.userId,
        name: sessionData.name,
        status: sessionData.status as SessionStatus,
        items: [], // TODO: Load items from restockItems table
        createdAt: new Date(sessionData.createdAt),
        updatedAt: sessionData.updatedAt ? new Date(sessionData.updatedAt) : undefined,
      });
    } catch (error) {
      console.error('Error finding session by ID:', error);
      return null;
    }
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      const sessionsData = await this.convexClient.query(api.restockSessions.list, {});
      
      return sessionsData
        .filter(session => session.userId === userId)
        .map(session => RestockSession.fromValue({
          id: session._id,
          userId: session.userId,
          name: session.name,
          status: session.status as SessionStatus,
          items: [], // TODO: Load items from restockItems table
          createdAt: new Date(session.createdAt),
          updatedAt: session.updatedAt ? new Date(session.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding sessions by user ID:', error);
      return [];
    }
  }

  /**
   * Delete a session
   */
  async delete(id: string): Promise<void> {
    try {
      const convexId = id as Id<"restockSessions">;
      await this.convexClient.mutation(api.restockSessions.remove, { id: convexId });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Remove a session (alias for delete for backward compatibility)
   */
  async remove(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Find unfinished sessions for a user
   */
  async findUnfinishedByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      const sessionsData = await this.convexClient.query(api.restockSessions.list, {});
      
      return sessionsData
        .filter(session => session.userId === userId && session.status !== 'sent')
        .map(session => RestockSession.fromValue({
          id: session._id,
          userId: session.userId,
          name: session.name,
          status: session.status as SessionStatus,
          items: [], // TODO: Load items from restockItems table
          createdAt: new Date(session.createdAt),
          updatedAt: session.updatedAt ? new Date(session.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding unfinished sessions:', error);
      return [];
    }
  }

  /**
   * Find completed sessions for a user
   */
  async findCompletedByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      const sessionsData = await this.convexClient.query(api.restockSessions.list, {});
      
      return sessionsData
        .filter(session => session.userId === userId && session.status === 'sent')
        .map(session => RestockSession.fromValue({
          id: session._id,
          userId: session.userId,
          name: session.name,
          status: session.status as SessionStatus,
          items: [], // TODO: Load items from restockItems table
          createdAt: new Date(session.createdAt),
          updatedAt: session.updatedAt ? new Date(session.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding completed sessions:', error);
      return [];
    }
  }

  /**
   * Find sessions by status for a user
   */
  async findByStatus(userId: string, status: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      const sessionsData = await this.convexClient.query(api.restockSessions.list, { status: status as any });
      
      return sessionsData
        .filter(session => session.userId === userId)
        .map(session => RestockSession.fromValue({
          id: session._id,
          userId: session.userId,
          name: session.name,
          status: session.status as SessionStatus,
          items: [], // TODO: Load items from restockItems table
          createdAt: new Date(session.createdAt),
          updatedAt: session.updatedAt ? new Date(session.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding sessions by status:', error);
      return [];
    }
  }

  /**
   * Count sessions for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      const sessionsData = await this.convexClient.query(api.restockSessions.list, {});
      return sessionsData.filter(session => session.userId === userId).length;
    } catch (error) {
      console.error('Error counting sessions:', error);
      return 0;
    }
  }

  /**
   * Find recent sessions for a user
   */
  async findRecentByUserId(userId: string, limit: number): Promise<ReadonlyArray<RestockSession>> {
    try {
      const sessionsData = await this.convexClient.query(api.restockSessions.list, {});
      
      return sessionsData
        .filter(session => session.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
        .map(session => RestockSession.fromValue({
          id: session._id,
          userId: session.userId,
          name: session.name,
          status: session.status as SessionStatus,
          items: [], // TODO: Load items from restockItems table
          createdAt: new Date(session.createdAt),
          updatedAt: session.updatedAt ? new Date(session.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding recent sessions:', error);
      return [];
    }
  }

  /**
   * Create a new session
   */
  async create(session: Omit<RestockSession, 'id'>): Promise<string> {
    try {
      const convexId = await this.convexClient.mutation(api.restockSessions.create, {
        name: session.name,
      });
      return convexId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Add an item to a session
   */
  async addItem(sessionId: string, item: any): Promise<void> {
    try {
      // TODO: Implement item addition via restockItems table
      console.log('Adding item to session:', { sessionId, item });
      // For now, this is a placeholder - items are managed separately
    } catch (error) {
      console.error('Error adding item to session:', error);
      throw new Error('Failed to add item to session');
    }
  }

  /**
   * Remove an item from a session
   */
  async removeItem(sessionId: string, itemId: string): Promise<void> {
    try {
      // TODO: Implement item removal via restockItems table
      console.log('Removing item from session:', { sessionId, itemId });
      // For now, this is a placeholder - items are managed separately
    } catch (error) {
      console.error('Error removing item from session:', error);
      throw new Error('Failed to remove item from session');
    }
  }

  /**
   * Update session name
   */
  async updateName(sessionId: string, name: string): Promise<void> {
    try {
      const convexId = sessionId as Id<"restockSessions">;
      await this.convexClient.mutation(api.restockSessions.updateName, {
        id: convexId,
        name,
      });
    } catch (error) {
      console.error('Error updating session name:', error);
      throw new Error('Failed to update session name');
    }
  }

  /**
   * Update session status
   */
  async updateStatus(sessionId: string, status: string): Promise<void> {
    try {
      const convexId = sessionId as Id<"restockSessions">;
      await this.convexClient.mutation(api.restockSessions.updateStatus, {
        id: convexId,
        status: status as any,
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      throw new Error('Failed to update session status');
    }
  }

  /**
   * Mark session as sent
   */
  async markAsSent(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const convexId = sessionId as Id<"restockSessions">;
      await this.convexClient.mutation(api.restockSessions.updateStatus, {
        id: convexId,
        status: 'sent',
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking session as sent:', error);
      return { success: false, error: 'Failed to mark session as sent' };
    }
  }
}
