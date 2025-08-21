import { supabase } from '../config/supabase';

export class SessionService {
  /**
   * Get all sessions for current user via RPC
   */
  static async getUserSessions() {
    try {
      const { data: sessions, error } = await supabase.rpc('get_restock_sessions');
      
      if (error) {
        throw error;
      }

      return { data: sessions, error: null };
    } catch (error) {
      console.error('[SessionService] Error getting user sessions via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single session with all its items via RPC
   */
  static async getSessionWithItems(sessionId: string) {
    try {
      // Get session via RPC
      const { data: sessions, error: sessionError } = await supabase.rpc('get_restock_sessions');
      
      if (sessionError) {
        throw sessionError;
      }

      const session = sessions?.find((s: any) => s.id === sessionId);
      if (!session) {
        return { data: null, error: new Error('Session not found') };
      }

      // Get items for this session via RPC
      const { data: items, error: itemsError } = await supabase.rpc('get_restock_items');
      
      if (itemsError) {
        throw itemsError;
      }
      
      const sessionItems = items?.filter((item: any) => item.session_id === sessionId) || [];
      
      const sessionWithItems = {
        ...session,
        restockItems: sessionItems
      };

      return { data: sessionWithItems, error: null };
    } catch (error) {
      console.error('[SessionService] Error getting session with items via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new restock session via RPC
   */
  static async createSession(session: any) {
    try {
      const { data: newSession, error } = await supabase.rpc('insert_restock_session', {
        p_name: session.name || `Restock Session ${new Date().toLocaleDateString()}`,
        p_status: 'draft'
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const createdSession = Array.isArray(newSession) ? newSession[0] : newSession;
      return { data: { id: createdSession?.id }, error: null };
    } catch (error) {
      console.error('[SessionService] Error creating session via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Update session name via RPC
   */
  static async updateSessionName(sessionId: string, name: string) {
    try {
      const { data: updatedSession, error } = await supabase.rpc('update_restock_session', {
        p_id: sessionId,
        p_name: name.trim(),
        p_status: null // Keep existing status
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const session = Array.isArray(updatedSession) ? updatedSession[0] : updatedSession;
      return { data: { id: session?.id }, error: null };
    } catch (error) {
      console.error('[SessionService] Error updating session name via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Update session status via RPC
   */
  static async updateSessionStatus(sessionId: string, status: string) {
    try {
      const { data: updatedSession, error } = await supabase.rpc('update_restock_session', {
        p_id: sessionId,
        p_name: null, // Keep existing name
        p_status: status
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const session = Array.isArray(updatedSession) ? updatedSession[0] : updatedSession;
      return { data: { id: session?.id }, error: null };
    } catch (error) {
      console.error('[SessionService] Error updating session status via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a session via RPC
   */
  static async deleteSession(sessionId: string) {
    try {
      const { error } = await supabase.rpc('delete_restock_session', {
        p_id: sessionId
      });

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('[SessionService] Error deleting session via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Add item to session via RPC
   */
  static async addItemToSession(sessionId: string, item: any) {
    try {
      const { data: newItem, error } = await supabase.rpc('insert_restock_item', {
        p_session_id: sessionId,
        p_product_id: item.productId,
        p_supplier_id: item.supplierId,
        p_quantity: item.quantity,
        p_notes: item.notes
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const createdItem = Array.isArray(newItem) ? newItem[0] : newItem;
      return { data: { id: createdItem?.id }, error: null };
    } catch (error) {
      console.error('[SessionService] Error adding item to session via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Update item in session via RPC
   */
  static async updateItemInSession(itemId: string, updates: any) {
    try {
      const { data: updatedItem, error } = await supabase.rpc('update_restock_item', {
        p_id: itemId,
        p_quantity: updates.quantity,
        p_notes: updates.notes
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const item = Array.isArray(updatedItem) ? updatedItem[0] : updatedItem;
      return { data: { id: item?.id }, error: null };
    } catch (error) {
      console.error('[SessionService] Error updating item in session via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Remove item from session via RPC
   */
  static async removeItemFromSession(itemId: string) {
    try {
      const { error } = await supabase.rpc('delete_restock_item', {
        p_id: itemId
      });

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('[SessionService] Error removing item from session via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all items for current user via RPC
   */
  static async getUserItems() {
    try {
      const { data: items, error } = await supabase.rpc('get_restock_items');
      
      if (error) {
        throw error;
      }

      return { data: items, error: null };
    } catch (error) {
      console.error('[SessionService] Error getting user items via RPC:', error);
      return { data: null, error };
    }
  }
} 