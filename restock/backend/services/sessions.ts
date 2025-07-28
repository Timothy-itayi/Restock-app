import { supabase, TABLES, SESSION_STATUS } from '../config/supabase';
import type { RestockSession, RestockItem, InsertRestockSession, InsertRestockItem, UpdateRestockSession } from '../types/database';

export class SessionService {
  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get a single session with all its items
   */
  static async getSessionWithItems(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select(`
          *,
          restock_items (
            *,
            products (
              id,
              name,
              default_quantity
            ),
            suppliers (
              id,
              name,
              email
            )
          )
        `)
        .eq('id', sessionId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new restock session
   */
  static async createSession(session: InsertRestockSession) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .insert(session)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update session status
   */
  static async updateSession(sessionId: string, updates: UpdateRestockSession) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a session and all its items
   */
  static async deleteSession(sessionId: string) {
    try {
      // Delete all items first
      const { error: itemsError } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .delete()
        .eq('session_id', sessionId);

      if (itemsError) throw itemsError;

      // Delete the session
      const { error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .delete()
        .eq('id', sessionId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Add an item to a session
   */
  static async addSessionItem(item: InsertRestockItem) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .insert(item)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity
          ),
          suppliers (
            id,
            name,
            email
          )
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update a session item
   */
  static async updateSessionItem(itemId: string, updates: Partial<RestockItem>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .update(updates)
        .eq('id', itemId)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity
          ),
          suppliers (
            id,
            name,
            email
          )
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Remove an item from a session
   */
  static async removeSessionItem(itemId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .delete()
        .eq('id', itemId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get session items grouped by supplier
   */
  static async getSessionItemsBySupplier(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity
          ),
          suppliers (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('session_id', sessionId)
        .order('suppliers(name)');

      // Group by supplier
      const groupedItems = data?.reduce((acc: any, item) => {
        const supplierId = item.supplier_id;
        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplier: item.suppliers,
            items: []
          };
        }
        acc[supplierId].items.push(item);
        return acc;
      }, {});

      return { data: groupedItems, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark session as sent
   */
  static async markSessionAsSent(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .update({ status: SESSION_STATUS.SENT })
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
} 