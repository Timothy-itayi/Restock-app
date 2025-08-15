import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Initialize Convex client for backend usage
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export class SessionService {
  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string) {
    try {
      const sessions = await convex.query(api.restockSessions.list, {});
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
      const session = await convex.query(api.restockSessions.get, { id: sessionId as Id<"restockSessions"> });
      
      if (!session) {
        return { data: null, error: new Error('Session not found') };
      }

      // Get items for this session
      const items = await convex.query(api.restockItems.listBySession, { sessionId: sessionId as Id<"restockSessions"> });
      
      const sessionWithItems = {
        ...session,
        restock_items: items
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
    if (!session.user_id) {
      return { data: null, error: new Error('User ID is required to create a session') };
    }

    try {
      const sessionId = await convex.mutation(api.restockSessions.create, {
        name: session.name || `Restock Session ${new Date().toLocaleDateString()}`
      });

      return { data: { id: sessionId }, error: null };
    } catch (error) {
      console.error('[SessionService] Error creating session', { error, userId: session.user_id });
      return { data: null, error };
    }
  }

  /**
   * Update session name
   */
  static async updateSessionName(sessionId: string, name: string) {
    try {
      const updatedId = await convex.mutation(api.restockSessions.updateName, {
        id: sessionId as Id<"restockSessions">,
        name: name.trim()
      });

      return { data: { id: updatedId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update session status
   */
  static async updateSessionStatus(sessionId: string, status: 'draft' | 'email_generated' | 'sent') {
    try {
      const updatedId = await convex.mutation(api.restockSessions.updateStatus, {
        id: sessionId as Id<"restockSessions">,
        status
      });

      return { data: { id: updatedId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string) {
    try {
      await convex.mutation(api.restockSessions.remove, { id: sessionId as Id<"restockSessions"> });
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add item to session
   */
  static async addItemToSession(sessionId: string, item: any) {
    try {
      const itemId = await convex.mutation(api.restockItems.add, {
        sessionId: sessionId as Id<"restockSessions">,
        productName: item.productName || item.name,
        quantity: item.quantity || 1,
        supplierName: item.supplierName || '',
        supplierEmail: item.supplierEmail || '',
        notes: item.notes
      });

      return { data: { id: itemId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update item in session
   */
  static async updateItem(itemId: string, updates: any) {
    try {
      const updatedId = await convex.mutation(api.restockItems.update, {
        id: itemId as Id<"restockItems">,
        ...updates
      });

      return { data: { id: updatedId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Remove item from session
   */
  static async removeItem(itemId: string) {
    try {
      await convex.mutation(api.restockItems.remove, { id: itemId as Id<"restockItems"> });
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get session summary
   */
  static async getSessionSummary(sessionId: string) {
    try {
      const summary = await convex.query(api.restockItems.getSessionSummary, { sessionId: sessionId as Id<"restockSessions"> });
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
      const sessions = await convex.query(api.restockSessions.list, { status });
      return { data: sessions, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get recent sessions for user
   */
  static async getRecentSessions(userId: string, limit: number = 5) {
    try {
      const sessions = await convex.query(api.restockSessions.list, {});
      const recentSessions = sessions.slice(0, limit);
      return { data: recentSessions, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
} 