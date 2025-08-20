import { supabase } from '../../backend/config/supabase';
import { RestockSession } from '../../app/domain/entities/RestockSession';
import { SessionRepository } from '../../app/domain/interfaces/SessionRepository';
import { SessionMapper } from '../../app/infrastructure/repositories/mappers/SessionMapper';
import type { RestockSession as DbRestockSession, RestockItem as DbRestockItem } from '../../backend/types/database';

export class SupabaseSessionRepository implements SessionRepository {
  async save(session: RestockSession): Promise<void> {
    const dbSession = SessionMapper.toDatabase(session);
    
    const { error } = await supabase
      .from('restock_sessions')
      .upsert(dbSession, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to save session: ${error.message}`);
    }
  }

  async findById(id: string): Promise<RestockSession | null> {
    // Fetch session with related items
    const { data: sessionData, error: sessionError } = await supabase
      .from('restock_sessions')
      .select()
      .eq('id', id)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to find session: ${sessionError.message}`);
    }

    // Fetch session items
    const { data: itemsData, error: itemsError } = await supabase
      .from('restock_items')
      .select()
      .eq('session_id', id);

    if (itemsError) {
      throw new Error(`Failed to find session items: ${itemsError.message}`);
    }

    // Create domain entity with items
    return SessionMapper.toDomainWithItems(sessionData, itemsData || []);
  }

  async findByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    // Fetch sessions for the user
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('restock_sessions')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      throw new Error(`Failed to find sessions: ${sessionsError.message}`);
    }

    if (!sessionsData || sessionsData.length === 0) {
      return [];
    }

    // Fetch all items for these sessions in one query for efficiency
    const sessionIds = sessionsData.map(s => s.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('restock_items')
      .select()
      .in('session_id', sessionIds);

    if (itemsError) {
      throw new Error(`Failed to find session items: ${itemsError.message}`);
    }

    // Group items by session_id
    const itemsBySessionId = (itemsData || []).reduce((acc: any, item: any) => {
      if (!acc[item.session_id]) {
        acc[item.session_id] = [];
      }
      acc[item.session_id].push(item);
      return acc;
    }, {});

    // Create domain entities with their items
    return sessionsData.map((session: DbRestockSession) => 
      SessionMapper.toDomainWithItems(session, itemsBySessionId[session.id] || [])
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('restock_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }

  async create(sessionValue: any): Promise<string> {
    // Handle both domain entity toValue() result and plain objects
    const sessionData = sessionValue.userId ? sessionValue : sessionValue;
    
    const dbSessionData = {
      user_id: sessionData.userId,
      name: sessionData.name,
      status: sessionData.status || 'draft'
    };
    
    const { data, error } = await supabase
      .from('restock_sessions')
      .insert(dbSessionData)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data.id;
  }

  async addItem(sessionId: string, item: any): Promise<void> {
    const { error } = await supabase
      .from('restock_items')
      .insert({
        session_id: sessionId,
        user_id: item.userId,
        product_name: item.productName,
        quantity: item.quantity,
        supplier_name: item.supplierName,
        supplier_email: item.supplierEmail,
        notes: item.notes
      });

    if (error) {
      throw new Error(`Failed to add item to session: ${error.message}`);
    }
  }

  async removeItem(sessionId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('restock_items')
      .delete()
      .eq('id', itemId)
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to remove item from session: ${error.message}`);
    }
  }

  async updateName(sessionId: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('restock_sessions')
      .update({ name })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to update session name: ${error.message}`);
    }
  }

  async updateStatus(sessionId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('restock_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to update session status: ${error.message}`);
    }
  }

  async markAsSent(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('restock_sessions')
        .update({ 
          status: 'sent',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async findUnfinishedByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    const { data, error } = await supabase
      .from('restock_sessions')
      .select()
      .eq('user_id', userId)
      .neq('status', 'sent')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find unfinished sessions: ${error.message}`);
    }

    return data?.map((item: DbRestockSession) => SessionMapper.toDomain(item)) || [];
  }

  async findCompletedByUserId(userId: string): Promise<ReadonlyArray<RestockSession>> {
    const { data, error } = await supabase
      .from('restock_sessions')
      .select()
      .eq('user_id', userId)
      .eq('status', 'sent')
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find completed sessions: ${error.message}`);
    }

    return data?.map((item: DbRestockSession) => SessionMapper.toDomain(item)) || [];
  }

  async findByStatus(userId: string, status: string): Promise<ReadonlyArray<RestockSession>> {
    const { data, error } = await supabase
      .from('restock_sessions')
      .select()
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find sessions by status: ${error.message}`);
    }

    return data?.map((item: DbRestockSession) => SessionMapper.toDomain(item)) || [];
  }

  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('restock_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to count sessions: ${error.message}`);
    }

    return count || 0;
  }

  async findRecentByUserId(userId: string, limit: number): Promise<ReadonlyArray<RestockSession>> {
    const { data, error } = await supabase
      .from('restock_sessions')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find recent sessions: ${error.message}`);
    }

    return data?.map((item: DbRestockSession) => SessionMapper.toDomain(item)) || [];
  }
}
