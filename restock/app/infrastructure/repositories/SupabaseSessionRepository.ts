/**
 * INFRASTRUCTURE REPOSITORY: SupabaseSessionRepository
 * 
 * Implements SessionRepository interface with Supabase as the data store
 * Handles RLS context, data mapping, and error conversion
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SessionRepository } from '../../domain/interfaces/SessionRepository';
import { RestockSession, SessionStatus } from '../../domain/entities/RestockSession';
import { SessionMapper, DbSessionWithRelations } from './mappers/SessionMapper';
import { UserContextService } from '../services/UserContextService';
import { TABLES } from '../config/SupabaseConfig';

// Domain-specific errors
export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class SessionSaveError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'SessionSaveError';
  }
}

export class SessionAccessError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'SessionAccessError';
  }
}

/**
 * Supabase implementation of SessionRepository
 * 
 * Encapsulates all database concerns while maintaining clean domain interface
 */
export class SupabaseSessionRepository implements SessionRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userContextService: UserContextService
  ) {}

  /**
   * Save a new session or update existing one
   */
  async save(session: RestockSession): Promise<void> {
    const value = session.toValue();
    
    try {
      await this.withUserContext(value.userId, async () => {
        // Check if session already exists
        const { data: existingSession } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select('id')
          .eq('id', value.id)
          .maybeSingle();

        if (existingSession) {
          await this.updateExistingSession(session);
        } else {
          await this.createNewSession(session);
        }
      });
    } catch (error) {
      this.handleDatabaseError(error, 'save session');
    }
  }

  /**
   * Find session by ID with all items
   */
  async findById(sessionId: string): Promise<RestockSession | null> {
    try {
      // Get user ID from session first for RLS context
      const { data: sessionMeta } = await this.supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select('user_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (!sessionMeta) {
        return null;
      }

      return await this.withUserContext(sessionMeta.user_id, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select(`
            *,
            restock_items (
              *,
              products (
                id,
                name,
                default_quantity,
                default_supplier_id
              ),
              suppliers (
                id,
                name,
                email,
                phone
              )
            )
          `)
          .eq('id', sessionId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }

        const dbSessionWithRelations: DbSessionWithRelations = {
          session: data,
          items: data.restock_items || []
        };

        return SessionMapper.toDomain(dbSessionWithRelations);
      });
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        return null;
      }
      this.handleDatabaseError(error, 'find session by ID');
      return null;
    }
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select(`
            *,
            restock_items (
              *,
              products (
                id,
                name,
                default_quantity,
                default_supplier_id
              ),
              suppliers (
                id,
                name,
                email,
                phone
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return (data || []).map(sessionData => {
          const dbSessionWithRelations: DbSessionWithRelations = {
            session: sessionData,
            items: sessionData.restock_items || []
          };
          return SessionMapper.toDomain(dbSessionWithRelations);
        });
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find sessions by user ID');
      return [];
    }
  }

  /**
   * Find unfinished sessions for a user (draft or email_generated status)
   */
  async findUnfinishedByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select(`
            *,
            restock_items (
              *,
              products (
                id,
                name,
                default_quantity,
                default_supplier_id
              ),
              suppliers (
                id,
                name,
                email,
                phone
              )
            )
          `)
          .eq('user_id', userId)
          .in('status', ['draft', 'email_generated'])
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return (data || []).map(sessionData => {
          const dbSessionWithRelations: DbSessionWithRelations = {
            session: sessionData,
            items: sessionData.restock_items || []
          };
          return SessionMapper.toDomain(dbSessionWithRelations);
        });
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find unfinished sessions');
      return [];
    }
  }

  /**
   * Find completed sessions for a user (sent status)
   */
  async findCompletedByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select(`
            *,
            restock_items (
              *,
              products (
                id,
                name,
                default_quantity,
                default_supplier_id
              ),
              suppliers (
                id,
                name,
                email,
                phone
              )
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'sent')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return (data || []).map(sessionData => {
          const dbSessionWithRelations: DbSessionWithRelations = {
            session: sessionData,
            items: sessionData.restock_items || []
          };
          return SessionMapper.toDomain(dbSessionWithRelations);
        });
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find completed sessions');
      return [];
    }
  }

  /**
   * Find sessions by status for a user
   */
  async findByStatus(userId: string, status: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select(`
            *,
            restock_items (
              *,
              products (
                id,
                name,
                default_quantity,
                default_supplier_id
              ),
              suppliers (
                id,
                name,
                email,
                phone
              )
            )
          `)
          .eq('user_id', userId)
          .eq('status', status)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return (data || []).map(sessionData => {
          const dbSessionWithRelations: DbSessionWithRelations = {
            session: sessionData,
            items: sessionData.restock_items || []
          };
          return SessionMapper.toDomain(dbSessionWithRelations);
        });
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find sessions by status');
      return [];
    }
  }

  /**
   * Count sessions for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      return await this.withUserContext(userId, async () => {
        const { count, error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        return count || 0;
      });
    } catch (error) {
      this.handleDatabaseError(error, 'count sessions');
      return 0;
    }
  }

  /**
   * Find recent sessions for a user with limit
   */
  async findRecentByUserId(userId: string, limit: number): Promise<ReadonlyArray<RestockSession>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .select(`
            *,
            restock_items (
              *,
              products (
                id,
                name,
                default_quantity,
                default_supplier_id
              ),
              suppliers (
                id,
                name,
                email,
                phone
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw error;
        }

        return (data || []).map(sessionData => {
          const dbSessionWithRelations: DbSessionWithRelations = {
            session: sessionData,
            items: sessionData.restock_items || []
          };
          return SessionMapper.toDomain(dbSessionWithRelations);
        });
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find recent sessions');
      return [];
    }
  }

  /**
   * Find sessions by status for a user (alias for findByStatus to maintain compatibility)
   */
  async findByUserIdAndStatus(userId: string, status: SessionStatus): Promise<RestockSession[]> {
    const dbStatus = this.mapStatusToDatabase(status);
    return this.findByStatus(userId, dbStatus) as Promise<RestockSession[]>;
  }

  /**
   * Delete a session and all its items
   */
  async delete(sessionId: string): Promise<void> {
    try {
      // Get user ID for RLS context
      const { data: sessionMeta } = await this.supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select('user_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (!sessionMeta) {
        throw new SessionNotFoundError(sessionId);
      }

      await this.withUserContext(sessionMeta.user_id, async () => {
        // Delete items first (foreign key constraint)
        await this.supabase
          .from(TABLES.RESTOCK_ITEMS)
          .delete()
          .eq('session_id', sessionId);

        // Delete session
        const { error } = await this.supabase
          .from(TABLES.RESTOCK_SESSIONS)
          .delete()
          .eq('id', sessionId);

        if (error) {
          throw error;
        }
      });
    } catch (error) {
      this.handleDatabaseError(error, 'delete session');
    }
  }

  // Private helper methods

  /**
   * Create a new session with items
   */
  private async createNewSession(session: RestockSession): Promise<void> {
    const { sessionRecord, itemRecords } = SessionMapper.toDatabase(session);

    // Insert session
    const { data: sessionData, error: sessionError } = await this.supabase
      .from(TABLES.RESTOCK_SESSIONS)
      .insert(sessionRecord)
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Insert items if any
    if (itemRecords.length > 0) {
      const itemsWithSessionId = itemRecords.map(item => ({
        ...item,
        session_id: sessionData.id
      }));

      const { error: itemsError } = await this.supabase
        .from(TABLES.RESTOCK_ITEMS)
        .insert(itemsWithSessionId);

      if (itemsError) {
        throw itemsError;
      }
    }
  }

  /**
   * Update existing session and its items
   */
  private async updateExistingSession(session: RestockSession): Promise<void> {
    const { sessionRecord, itemRecords } = SessionMapper.toDatabaseForUpdate(session);

    // Update session
    const { error: sessionError } = await this.supabase
      .from(TABLES.RESTOCK_SESSIONS)
      .update(sessionRecord)
      .eq('id', sessionRecord.id);

    if (sessionError) {
      throw sessionError;
    }

    // Replace all items (delete and re-insert for simplicity)
    await this.supabase
      .from(TABLES.RESTOCK_ITEMS)
      .delete()
      .eq('session_id', sessionRecord.id);

    if (itemRecords.length > 0) {
      const { error: itemsError } = await this.supabase
        .from(TABLES.RESTOCK_ITEMS)
        .insert(itemRecords);

      if (itemsError) {
        throw itemsError;
      }
    }
  }

  /**
   * Execute operation with proper user context for RLS
   */
  private async withUserContext<T>(
    userId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    await this.userContextService.setUserContext(userId);
    return await operation();
  }

  /**
   * Map domain status to database format
   */
  private mapStatusToDatabase(status: SessionStatus): 'draft' | 'email_generated' | 'sent' {
    switch (status) {
      case SessionStatus.DRAFT:
        return 'draft';
      case SessionStatus.EMAIL_GENERATED:
        return 'email_generated';
      case SessionStatus.SENT:
        return 'sent';
      default:
        throw new Error(`Unknown status: ${status}`);
    }
  }

  /**
   * Convert database errors to domain-specific errors
   */
  private handleDatabaseError(error: any, operation: string): never {
    console.error(`[SupabaseSessionRepository] Error during ${operation}:`, error);

    if (error.code === 'PGRST116') {
      throw new SessionNotFoundError('Session not found');
    }

    if (error.code === '42501' || error.message?.includes('RLS')) {
      throw new SessionAccessError(`Access denied during ${operation}`, error);
    }

    throw new SessionSaveError(`Failed to ${operation}`, error);
  }
}
