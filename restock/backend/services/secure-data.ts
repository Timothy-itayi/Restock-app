import { supabase } from '../config/supabase';

export class SecureDataService {
  /**
   * Get user data securely via backend Edge Function
   * This bypasses RLS issues by using service role privileges
   */
  static async getUserData(
    userId: string, 
    dataType: 'sessions' | 'products' | 'suppliers' | 'all' = 'all',
    includeFinished: boolean = true
  ) {
    try {
      console.log(`🔐 SecureDataService: Getting ${dataType} data for user:`, userId);
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/get-user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          dataType,
          includeFinished
        })
      });

      if (!response.ok) {
        console.error('🚨 SecureDataService: Backend request failed:', response.status);
        // Fallback to direct database query if backend fails
        return await this.getUserDataFallback(userId, dataType, includeFinished);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('🚨 SecureDataService: Backend error:', result.error);
        // Fallback to direct database query
        return await this.getUserDataFallback(userId, dataType, includeFinished);
      }

      console.log(`✅ SecureDataService: Successfully retrieved ${dataType} data via backend`);
      return { data: result.data, error: null };

    } catch (error) {
      console.error('🚨 SecureDataService: Error calling backend:', error);
      // Fallback to direct database query
      return await this.getUserDataFallback(userId, dataType, includeFinished);
    }
  }

  /**
   * Fallback method using direct database queries
   * May have limited access due to RLS policies
   */
  static async getUserDataFallback(
    userId: string, 
    dataType: 'sessions' | 'products' | 'suppliers' | 'all' = 'all',
    includeFinished: boolean = true
  ) {
    try {
      console.log(`🔄 SecureDataService: Using fallback for ${dataType} data`);
      
      const result: any = {};

      // Get sessions
      if (dataType === 'sessions' || dataType === 'all') {
        const { data: sessions, error: sessionsError } = await supabase
          .from('restock_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (sessionsError) {
          console.warn('⚠️ SecureDataService: Sessions query failed:', sessionsError);
        } else {
          const unfinishedSessions = sessions?.filter(s => s.status !== 'sent') || [];
          const finishedSessions = sessions?.filter(s => s.status === 'sent') || [];
          
          result.sessions = {
            unfinished: unfinishedSessions,
            finished: includeFinished ? finishedSessions : [],
            total: sessions?.length || 0
          };
        }
      }

      // Get products
      if (dataType === 'products' || dataType === 'all') {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .order('name');

        if (productsError) {
          console.warn('⚠️ SecureDataService: Products query failed:', productsError);
        } else {
          result.products = products || [];
        }
      }

      // Get suppliers
      if (dataType === 'suppliers' || dataType === 'all') {
        const { data: suppliers, error: suppliersError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('user_id', userId)
          .order('name');

        if (suppliersError) {
          console.warn('⚠️ SecureDataService: Suppliers query failed:', suppliersError);
        } else {
          result.suppliers = suppliers || [];
        }
      }

      // Get profile
      if (dataType === 'all') {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, email, name, store_name, created_at')
          .eq('id', userId)
          .maybeSingle();

        if (!profileError && profile) {
          result.profile = profile;
        }
      }

      console.log(`✅ SecureDataService: Fallback ${dataType} data retrieved`);
      return { data: result, error: null };

    } catch (error) {
      console.error('🚨 SecureDataService: Fallback failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user sessions specifically
   */
  static async getUserSessions(userId: string, includeFinished: boolean = true) {
    const result = await this.getUserData(userId, 'sessions', includeFinished);
    return {
      unfinished: result.data?.sessions?.unfinished || [],
      finished: result.data?.sessions?.finished || [],
      total: result.data?.sessions?.total || 0,
      error: result.error
    };
  }

  /**
   * Get user products specifically
   */
  static async getUserProducts(userId: string) {
    const result = await this.getUserData(userId, 'products');
    return {
      products: result.data?.products || [],
      error: result.error
    };
  }

  /**
   * Get user suppliers specifically
   */
  static async getUserSuppliers(userId: string) {
    const result = await this.getUserData(userId, 'suppliers');
    return {
      suppliers: result.data?.suppliers || [],
      error: result.error
    };
  }
}
