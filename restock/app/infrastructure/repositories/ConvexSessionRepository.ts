import { SessionRepository } from '../../domain/interfaces/SessionRepository';
import { RestockSession, SessionStatus } from '../../domain/entities/RestockSession';
import { SessionMapper } from './mappers/SessionMapper';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

/**
 * Convex Implementation of SessionRepository
 * 
 * Uses Convex functions instead of direct database access
 * Clerk authentication is handled automatically
 */
export class ConvexSessionRepository implements SessionRepository {
  constructor() {}

  /**
   * Save a new session or update existing one
   */
  async save(session: RestockSession): Promise<void> {
    const value = session.toValue();
    
    try {
      if (value.id) {
        // Update existing session
        await this.updateExistingSession(session);
      } else {
        // Create new session
        await this.createNewSession(session);
      }
    } catch (error) {
      throw new Error(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find session by ID with all items
   */
  async findById(sessionId: string): Promise<RestockSession | null> {
    try {
      // This would need to be implemented with Convex queries
      // For now, we'll need to restructure how we handle this
      throw new Error('findById not yet implemented in Convex - use queries instead');
    } catch (error) {
      throw new Error(`Failed to find session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<RestockSession[]> {
    try {
      // This would need to be implemented with Convex queries
      // For now, we'll need to restructure how we handle this
      throw new Error('findByUserId not yet implemented in Convex - use queries instead');
    } catch (error) {
      throw new Error(`Failed to find sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find unfinished sessions for a user
   */
  async findUnfinishedByUserId(userId: string): Promise<RestockSession[]> {
    try {
      // This would need to be implemented with Convex queries
      throw new Error('findUnfinishedByUserId not yet implemented in Convex - use queries instead');
    } catch (error) {
      throw new Error(`Failed to find unfinished sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find completed sessions for a user
   */
  async findCompletedByUserId(userId: string): Promise<RestockSession[]> {
    try {
      // This would need to be implemented with Convex queries
      throw new Error('findCompletedByUserId not yet implemented in Convex - use queries instead');
    } catch (error) {
      throw new Error(`Failed to find completed sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find sessions by status
   */
  async findByStatus(userId: string, status: SessionStatus): Promise<RestockSession[]> {
    try {
      // This would need to be implemented with Convex queries
      throw new Error('findByStatus not yet implemented in Convex - use queries instead');
    } catch (error) {
      throw new Error(`Failed to find sessions by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count sessions for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      // This would need to be implemented with Convex queries
      throw new Error('countByUserId not yet implemented in Convex - use queries instead');
    } catch (error) {
      throw new Error(`Failed to count sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find recent sessions for a user
   */
  async findRecentByUserId(userId: string, limit: number = 10): Promise<RestockSession[]> {
    try {
      // This would need to be implemented with Convex queries
      throw new Error('findRecentByUserId not yet implemented in Convex - use queries instead');
    } catch (error) {
      throw new Error(`Failed to find recent sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a session
   */
  async delete(sessionId: string): Promise<void> {
    try {
      // This would need to be implemented with Convex mutations
      // For now, we'll need to restructure how we handle this
      throw new Error('delete not yet implemented in Convex - use mutations instead');
    } catch (error) {
      throw new Error(`Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  /**
   * Create a new session with items
   */
  private async createNewSession(session: RestockSession): Promise<void> {
    const value = session.toValue();
    
    // This would need to be implemented with Convex mutations
    // For now, we'll need to restructure how we handle this
    throw new Error('createNewSession not yet implemented in Convex - use mutations instead');
  }

  /**
   * Update existing session and its items
   */
  private async updateExistingSession(session: RestockSession): Promise<void> {
    const value = session.toValue();
    
    // This would need to be implemented with Convex mutations
    // For now, we'll need to restructure how we handle this
    throw new Error('updateExistingSession not yet implemented in Convex - use mutations instead');
  }
}

/**
 * React Hook for Convex Session Operations
 * 
 * This provides a cleaner interface for React components
 * using Convex functions directly
 */
export function useConvexSessions() {
  const createSession = useMutation(api.restockSessions.create);
  const updateSessionName = useMutation(api.restockSessions.updateName);
  const updateSessionStatus = useMutation(api.restockSessions.updateStatus);
  const deleteSession = useMutation(api.restockSessions.remove);
  
  // Note: These queries need arguments, but we'll handle that in the component
  const sessions = useQuery(api.restockSessions.list, {});
  const getSession = useQuery(api.restockSessions.get, { id: "" as Id<"restockSessions"> });

  return {
    // Mutations
    createSession,
    updateSessionName,
    updateSessionStatus,
    deleteSession,
    
    // Queries
    sessions,
    getSession,
    
    // Computed values
    isLoading: sessions === undefined,
    error: null,
  };
}

/**
 * React Hook for Convex Restock Items Operations
 */
export function useConvexRestockItems() {
  const addItem = useMutation(api.restockItems.add);
  const updateItem = useMutation(api.restockItems.update);
  const removeItem = useMutation(api.restockItems.remove);
  
  // Note: This query needs arguments, but we'll handle that in the component
  const getSessionSummary = useQuery(api.restockItems.getSessionSummary, { sessionId: "" as Id<"restockSessions"> });

  return {
    // Mutations
    addItem,
    updateItem,
    removeItem,
    
    // Queries
    getSessionSummary,
  };
}
