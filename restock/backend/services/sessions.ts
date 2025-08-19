import { supabase } from '../config/supabase';
import type { RestockSession, RestockItem, InsertRestockSession, UpdateRestockSession } from '../types/database';

export class SessionService {
  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string) {
    try {
      const { data: sessions, error } = await supabase
        .from('restock_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: sessions, error: null };
    } catch (error) {
      console.error('[SessionService] Error getting user sessions', { error, userId });
      return { data: null, error };
    }
  }

  /**
   * Get a single session with all its items
   */
  static async getSessionWithItems(sessionId: string) {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('restock_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          return { data: null, error: new Error('Session not found') };
        }
        throw sessionError;
      }

      // Get items for this session
      const { data: items, error: itemsError } = await supabase
        .from('restock_items')
        .select('*')
        .eq('session_id', sessionId);
      
      if (itemsError) {
        throw itemsError;
      }
      
      const sessionWithItems = {
        ...session,
        restockItems: items || []
      };

      return { data: sessionWithItems, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new restock session
   */
  static async createSession(session: any) {
    try {
      const { data: newSession, error } = await supabase
        .from('restock_sessions')
        .insert({
          user_id: session.userId,
          name: session.name || `Restock Session ${new Date().toLocaleDateString()}`,
          status: 'draft'
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: newSession.id }, error: null };
    } catch (error) {
      console.error('[SessionService] Error creating session', { error, session });
      return { data: null, error };
    }
  }

  /**
   * Update session name
   */
  static async updateSessionName(sessionId: string, name: string) {
    try {
      const { data: updatedSession, error } = await supabase
        .from('restock_sessions')
        .update({ name: name.trim() })
        .eq('id', sessionId)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: updatedSession.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update session status
   */
  static async updateSessionStatus(sessionId: string, status: 'draft' | 'email_generated' | 'sent') {
    try {
      const { data: updatedSession, error } = await supabase
        .from('restock_sessions')
        .update({ status })
        .eq('id', sessionId)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: updatedSession.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string) {
    try {
      const { error } = await supabase
        .from('restock_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add an item to a session
   */
  static async addItemToSession(sessionId: string, item: any) {
    try {
      const { data: newItem, error } = await supabase
        .from('restock_items')
        .insert({
          session_id: sessionId,
          user_id: item.userId,
          product_name: item.productName,
          quantity: item.quantity,
          supplier_name: item.supplierName,
          supplier_email: item.supplierEmail,
          notes: item.notes
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: newItem.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update an item in a session
   */
  static async updateItem(itemId: string, updates: any) {
    try {
      const { data: updatedItem, error } = await supabase
        .from('restock_items')
        .update(updates)
        .eq('id', itemId)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: updatedItem.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Remove an item from a session
   */
  static async removeItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('restock_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get session summary for email generation
   */
  static async getSessionSummary(sessionId: string) {
    try {
      const { data: summary, error } = await supabase
        .from('restock_items')
        .select('*')
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }

      return { data: summary, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get sessions by status
   */
  static async getSessionsByStatus(status: 'draft' | 'email_generated' | 'sent') {
    try {
      const { data: sessions, error } = await supabase
        .from('restock_sessions')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: sessions, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all sessions for dashboard
   */
  static async getAllSessions() {
    try {
      const { data: sessions, error } = await supabase
        .from('restock_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: sessions, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
} 