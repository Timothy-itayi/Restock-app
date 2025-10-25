import { RestockSession } from '../../../lib/domain/_entities/RestockSession';
import { SessionRepository } from '../../../lib/domain/_interfaces/SessionRepository';
import { SessionMapper } from '../../../lib/infrastructure/_repositories/_mappers/SessionMapper';
import { supabase } from '../../_config/supabase';
import type { RestockSession as DbRestockSession } from '../../_types/database';

export class SupabaseSessionRepository implements SessionRepository {
  private userId: string | null = null;
  private getClerkTokenFn: (() => Promise<string | null>) | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  /**
   * Set the user ID for this repository instance
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Set the Clerk token getter function
   */
  setClerkTokenGetter(fn: () => Promise<string | null>) {
    this.getClerkTokenFn = fn;
  }

  /**
   * Get the current user ID, throwing an error if not set
   */
  private getCurrentUserId(): string {
    if (!this.userId) {
      throw new Error('User ID not set in repository. Call setUserId() first.');
    }
    return this.userId;
  }

  /**
   * Create an authenticated Supabase client with Clerk JWT token
   */
  private _cachedClient: any = null;
  private _cachedToken: string | null = null;

  private async getAuthenticatedClient() {
    if (!this.getClerkTokenFn) {
      console.warn('No Clerk token getter set, using default client');
      return supabase;
    }

    try {
      const token = await this.getClerkTokenFn();
      if (!token) {
        console.warn('No Clerk token available, using default client');
        return supabase;
      }

      // Return cached client if token hasn't changed
      if (this._cachedClient && this._cachedToken === token) {
        return this._cachedClient;
      }

      // Create new authenticated client
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

      // Cache the client and token
      this._cachedClient = client;
      this._cachedToken = token;

      return client;
    } catch (error) {
      console.warn('Failed to create authenticated client:', error);
      return supabase;
    }
  }

  async save(session: RestockSession): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const dbSession = SessionMapper.toDatabase(session);
    
    if (session.id) {
      // Update existing session
      const { error } = await client.rpc('update_restock_session', {
        p_id: session.id,
        p_name: dbSession.sessionRecord.name,
        p_status: dbSession.sessionRecord.status
      });

      if (error) {
        throw new Error(`Failed to update session: ${error.message}`);
      }
    } else {
      // Create new session
      const { error } = await client.rpc('insert_restock_session', {
        p_name: dbSession.sessionRecord.name,
        p_status: dbSession.sessionRecord.status
      });

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }
    }
  }

  async findById(id: string): Promise<RestockSession | null> {
    try {
      const client = await this.getAuthenticatedClient();
      // Get session via RPC
      const { data: sessions, error: sessionError } = await client.rpc('get_restock_sessions');
      
      if (sessionError) {
        throw new Error(`Failed to get sessions: ${sessionError.message}`);
      }

      const session = sessions?.find((s: any) => s.id === id);
      if (!session) {
        return null;
      }

      // Get session items via RPC
      const { data: items, error: itemsError } = await client.rpc('get_restock_items');
      
      if (itemsError) {
        throw new Error(`Failed to get restock items: ${itemsError.message}`);
      }

      const sessionItems = items?.filter((item: any) => item.session_id === id) || [];

      // Create domain entity with items
      return SessionMapper.toDomainWithItems(session, sessionItems);
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error finding session by ID:', error);
      return null;
    }
  }

  async findByUserId(): Promise<ReadonlyArray<RestockSession>> {
    try {
      console.log('[SupabaseSessionRepository] 🔍 findByUserId called:', {
        hasGetAuthenticatedClient: typeof this.getAuthenticatedClient === 'function',
        hasTokenGetter: !!this.getClerkTokenFn,
        userId: this.userId,
        constructorName: this.constructor.name
      });

      if (typeof this.getAuthenticatedClient !== 'function') {
        console.error('[SupabaseSessionRepository] ❌ getAuthenticatedClient method missing');
        throw new Error('Repository method getAuthenticatedClient is not available');
      }

      const client = await this.getAuthenticatedClient();
      // RPC functions automatically filter by current user, so userId is not needed
      // Get sessions via RPC
      const { data: sessions, error: sessionsError } = await client.rpc('get_restock_sessions');
      
      if (sessionsError) {
        throw new Error(`Failed to get sessions: ${sessionsError.message}`);
      }

      if (!sessions || sessions.length === 0) {
        return [];
      }

      // Get all items via RPC
      const { data: items, error: itemsError } = await client.rpc('get_restock_items');
      
      if (itemsError) {
        throw new Error(`Failed to get restock items: ${itemsError.message}`);
      }

      // Group items by session_id
      const itemsBySessionId = (items || []).reduce((acc: any, item: any) => {
        if (!acc[item.session_id]) {
          acc[item.session_id] = [];
        }
        acc[item.session_id].push(item);
        return acc;
      }, {});

      // Create domain entities with their items
      return sessions.map((session: DbRestockSession) => 
        SessionMapper.toDomainWithItems(session, itemsBySessionId[session.id] || [])
      );
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error finding sessions by user ID:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('delete_restock_session', {
      p_id: id
    });

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  async findUnfinishedByUserId(): Promise<ReadonlyArray<RestockSession>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: sessions, error: sessionsError } = await client.rpc('get_restock_sessions');
      
      if (sessionsError) {
        throw new Error(`Failed to get sessions: ${sessionsError.message}`);
      }

      // Filter for unfinished sessions (draft or email_generated)
      const unfinishedSessions = sessions?.filter((s: any) => 
        s.status === 'draft' || s.status === 'email_generated'
      ) || [];

      if (unfinishedSessions.length === 0) {
        return [];
      }

      // Get items for unfinished sessions
      const { data: items, error: itemsError } = await client.rpc('get_restock_items');
      
      if (itemsError) {
        throw new Error(`Failed to get restock items: ${itemsError.message}`);
      }

      // Group items by session_id
      const itemsBySessionId = (items || []).reduce((acc: any, item: any) => {
        if (!acc[item.session_id]) {
          acc[item.session_id] = [];
        }
        acc[item.session_id].push(item);
        return acc;
      }, {});

      // Create domain entities with their items
      return unfinishedSessions.map((session: DbRestockSession) => 
        SessionMapper.toDomainWithItems(session, itemsBySessionId[session.id] || [])
      );
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error finding unfinished sessions:', error);
      return [];
    }
  }

  async addItem(sessionId: string, item: any): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('insert_restock_item', {
      p_session_id: sessionId,         // uuid
      p_product_name: item.productName, // text
      p_supplier_name: item.supplierName, // text
      p_supplier_email: item.supplierEmail, // text
      p_quantity: item.quantity,       // int
      p_notes: item.notes ?? null      // text
    });

    if (error) {
      // Convert unique violation into a no-op success so rapid double taps don't break flow
      const message = String(error.message || '').toLowerCase();
      const isUnique = message.includes('duplicate key value') || message.includes('unique constraint');
      if (!isUnique) {
        throw new Error(`Failed to add item to session: ${error.message}`);
      }
    }
  }

  async removeItem(itemId: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('delete_restock_item', {
      p_id: itemId
    });

    if (error) {
      throw new Error(`Failed to remove item from session: ${error.message}`);
    }
  }

  async updateName(sessionId: string, name: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('update_restock_session', {
      p_id: sessionId,
      p_name: name,
      p_status: null // Keep existing status
    });

    if (error) {
      throw new Error(`Failed to update session name: ${error.message}`);
    }
  }
 
async updateRestockItem(itemId: string, updates: {
  productName?: string;
  quantity?: number;
  supplierName?: string;
  supplierEmail?: string;
  notes?: string;
}): Promise<void> {
  const client = await this.getAuthenticatedClient();
  
  const { error } = await client.rpc('update_restock_item', {
    p_item_id: itemId,
    p_product_name: updates.productName || '',
    p_quantity: updates.quantity || 0,
    p_supplier_name: updates.supplierName || '',
    p_supplier_email: updates.supplierEmail || '',
    p_notes: updates.notes || null
  });

  if (error) {
    throw new Error(`Failed to update restock item: ${error.message}`);
  }
}

  async updateStatus(sessionId: string, status: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('update_restock_session', {
      p_id: sessionId,
      p_name: null, // Keep existing name
      p_status: status
    });

    if (error) {
      throw new Error(`Failed to update session status: ${error.message}`);
    }
  }

  async findAll(): Promise<ReadonlyArray<RestockSession>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: sessions, error: sessionsError } = await client.rpc('get_restock_sessions');
      
      if (sessionsError) {
        throw new Error(`Failed to get sessions: ${sessionsError.message}`);
      }

      if (!sessions || sessions.length === 0) {
        return [];
      }

      // Get all items
      const { data: items, error: itemsError } = await client.rpc('get_restock_items');
      
      if (itemsError) {
        throw new Error(`Failed to get restock items: ${itemsError.message}`);
      }

      // Group items by session_id
      const itemsBySessionId = (items || []).reduce((acc: any, item: any) => {
        if (!acc[item.session_id]) {
          acc[item.session_id] = [];
        }
        acc[item.session_id].push(item);
        return acc;
      }, {});

      // Create domain entities with their items
      return sessions.map((session: DbRestockSession) => 
        SessionMapper.toDomainWithItems(session, itemsBySessionId[session.id] || [])
      );
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error getting all sessions:', error);
      return [];
    }
  }

  // Additional methods required by the interface
  async remove(id: string): Promise<void> {
    return this.delete(id);
  }

  async create(session: Omit<RestockSession, 'id'>): Promise<string> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data, error } = await client.rpc('insert_restock_session', {
        p_name: session.name,
        p_status: session.status
      });

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }

      // RPC returns array, get first item
      const createdSession = Array.isArray(data) ? data[0] : data;
      return createdSession?.id || '';
    } catch (error) {
      throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async markAsSent(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getAuthenticatedClient();
      const { error } = await client.rpc('update_restock_session', {
        p_id: sessionId,
        p_name: null, // Keep existing name
        p_status: 'sent'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async findCompletedByUserId(): Promise<ReadonlyArray<RestockSession>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: sessions, error: sessionsError } = await client.rpc('get_restock_sessions');
      
      if (sessionsError) {
        throw new Error(`Failed to get sessions: ${sessionsError.message}`);
      }

      // Filter for completed sessions (sent)
      const completedSessions = sessions?.filter((s: any) => s.status === 'sent') || [];

      if (completedSessions.length === 0) {
        return [];
      }

      // Get items for completed sessions
      const { data: items, error: itemsError } = await client.rpc('get_restock_items');
      
      if (itemsError) {
        throw new Error(`Failed to get restock items: ${itemsError.message}`);
      }

      // Group items by session_id
      const itemsBySessionId = (items || []).reduce((acc: any, item: any) => {
        if (!acc[item.session_id]) {
          acc[item.session_id] = [];
        }
        acc[item.session_id].push(item);
        return acc;
      }, {});

      // Create domain entities with their items
      return completedSessions.map((session: DbRestockSession) => 
        SessionMapper.toDomainWithItems(session, itemsBySessionId[session.id] || [])
      );
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error finding completed sessions:', error);
      return [];
    }
  }

  async findByStatus(status: string): Promise<ReadonlyArray<RestockSession>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: sessions, error: sessionsError } = await client.rpc('get_restock_sessions');
      
      if (sessionsError) {
        throw new Error(`Failed to get sessions: ${sessionsError.message}`);
      }

      // Filter by status
      const filteredSessions = sessions?.filter((s: any) => s.status === status) || [];

      if (filteredSessions.length === 0) {
        return [];
      }

      // Get items for filtered sessions
      const { data: items, error: itemsError } = await client.rpc('get_restock_items');
      
      if (itemsError) {
        throw new Error(`Failed to get restock items: ${itemsError.message}`);
      }

      // Group items by session_id
      const itemsBySessionId = (items || []).reduce((acc: any, item: any) => {
        if (!acc[item.session_id]) {
          acc[item.session_id] = [];
        }
        acc[item.session_id].push(item);
        return acc;
      }, {});

      // Create domain entities with their items
      return filteredSessions.map((session: DbRestockSession) => 
        SessionMapper.toDomainWithItems(session, itemsBySessionId[session.id] || [])
      );
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error finding sessions by status:', error);
      return [];
    }
  }

  async countByUserId(): Promise<number> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: sessions, error } = await client.rpc('get_restock_sessions');
      
      if (error) {
        throw new Error(`Failed to get sessions: ${error.message}`);
      }

      return sessions?.length || 0;
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error counting sessions:', error);
      return 0;
    }
  }

  async findRecentByUserId(limit: number): Promise<ReadonlyArray<RestockSession>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: sessions, error: sessionsError } = await client.rpc('get_restock_sessions');
      
      if (sessionsError) {
        throw new Error(`Failed to get sessions: ${sessionsError.message}`);
      }

      // Get recent sessions (limit by count)
      const recentSessions = sessions?.slice(0, limit) || [];

      if (recentSessions.length === 0) {
        return [];
      }

      // Get items for recent sessions
      const { data: items, error: itemsError } = await client.rpc('get_restock_items');
      
      if (itemsError) {
        throw new Error(`Failed to get restock items: ${itemsError.message}`);
      }

      // Group items by session_id
      const itemsBySessionId = (items || []).reduce((acc: any, item: any) => {
        if (!acc[item.session_id]) {
          acc[item.session_id] = [];
        }
        acc[item.session_id].push(item);
        return acc;
      }, {});

      // Create domain entities with their items
      return recentSessions.map((session: DbRestockSession) => 
        SessionMapper.toDomainWithItems(session, itemsBySessionId[session.id] || [])
      );
    } catch (error) {
      console.error('[SupabaseSessionRepository] Error finding recent sessions:', error);
      return [];
    }
  }
}