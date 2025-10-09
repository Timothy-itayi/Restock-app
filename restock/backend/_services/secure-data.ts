import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex../_generated/api';

export class SecureDataService {
  private static convexClient: ConvexHttpClient | null = null;

  private static getConvexClient(): ConvexHttpClient {
    if (!this.convexClient) {
      const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error('EXPO_PUBLIC_CONVEX_URL not configured');
      }
      this.convexClient = new ConvexHttpClient(convexUrl);
    }
    return this.convexClient;
  }

  /**
   * Get user data securely via Convex
   * Clerk auth context is automatically available
   */
  static async getUserData(
    userId: string, 
    dataType: 'sessions' | 'products' | 'suppliers' | 'all' = 'all',
    includeFinished: boolean = true
  ) {
    try {
      console.log(`🔐 SecureDataService: Getting ${dataType} data for user:`, userId);
      
      const client = this.getConvexClient();
      const result: any = {};

      // Get sessions
      if (dataType === 'sessions' || dataType === 'all') {
        try {
          const sessions = await client.query(api.restockSessions.list, {});
          
          const unfinishedSessions = sessions?.filter((s: any) => s.status !== 'sent') || [];
          const finishedSessions = sessions?.filter((s: any) => s.status === 'sent') || [];
          
          result.sessions = {
            unfinished: unfinishedSessions,
            finished: includeFinished ? finishedSessions : [],
            total: sessions?.length || 0
          };
        } catch (error) {
          console.warn('⚠️ SecureDataService: Sessions query failed:', error);
          result.sessions = { unfinished: [], finished: [], total: 0 };
        }
      }

      // Get products
      if (dataType === 'products' || dataType === 'all') {
        try {
          const products = await client.query(api.products.list, {});
          result.products = products || [];
        } catch (error) {
          console.warn('⚠️ SecureDataService: Products query failed:', error);
          result.products = [];
        }
      }

      // Get suppliers
      if (dataType === 'suppliers' || dataType === 'all') {
        try {
          const suppliers = await client.query(api.suppliers.list, {});
          result.suppliers = suppliers || [];
        } catch (error) {
          console.warn('⚠️ SecureDataService: Suppliers query failed:', error);
          result.suppliers = [];
        }
      }

      console.log(`✅ SecureDataService: Successfully retrieved ${dataType} data via Convex`);
      return { data: result, error: null };

    } catch (error) {
      console.error('🚨 SecureDataService: Error getting data:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user profile data
   */
  static async getUserProfile(userId: string) {
    try {
      const client = this.getConvexClient();
      const profile = await client.query(api.users.get, {});
      
      if (!profile) {
        return { data: null, error: 'Profile not found' };
      }

      return { data: profile, error: null };
    } catch (error) {
      console.error('🚨 SecureDataService: Error getting user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Get session summary data
   */
  static async getSessionSummary(sessionId: string) {
    try {
      const client = this.getConvexClient();
      const summary = await client.query(api.restockItems.getSessionSummary, { 
        sessionId: sessionId as any 
      });
      
      return { data: summary, error: null };
    } catch (error) {
      console.error('🚨 SecureDataService: Error getting session summary:', error);
      return { data: null, error };
    }
  }

  /**
   * Get email analytics for user
   */
  static async getEmailAnalytics(days: number = 30) {
    try {
      const client = this.getConvexClient();
      const analytics = await client.query(api.emails.getAnalytics, { days });
      
      return { data: analytics, error: null };
    } catch (error) {
      console.error('🚨 SecureDataService: Error getting email analytics:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user has any data
   */
  static async hasUserData(userId: string) {
    try {
      const client = this.getConvexClient();
      
      // Check sessions
      const sessions = await client.query(api.restockSessions.list, {});
      if (sessions && sessions.length > 0) {
        return { hasData: true, dataType: 'sessions' };
      }

      // Check products
      const products = await client.query(api.products.list, {});
      if (products && products.length > 0) {
        return { hasData: true, dataType: 'products' };
      }

      // Check suppliers
      const suppliers = await client.query(api.suppliers.list, {});
      if (suppliers && suppliers.length > 0) {
        return { hasData: true, dataType: 'suppliers' };
      }

      return { hasData: false, dataType: null };
    } catch (error) {
      console.error('🚨 SecureDataService: Error checking user data:', error);
      return { hasData: false, dataType: null, error };
    }
  }
}
