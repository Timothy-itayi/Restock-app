import { supabase, TABLES } from '../config/supabase';
import type { Supplier, InsertSupplier, UpdateSupplier } from '../types/database';

export class SupplierService {
  /**
   * Get all suppliers for a user
   */
  static async getUserSuppliers(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPLIERS)
        .select('*')
        .eq('user_id', userId)
        .order('name');

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get a single supplier by ID
   */
  static async getSupplier(supplierId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPLIERS)
        .select('*')
        .eq('id', supplierId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new supplier
   */
  static async createSupplier(supplier: InsertSupplier) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPLIERS)
        .insert(supplier)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update an existing supplier
   */
  static async updateSupplier(supplierId: string, updates: UpdateSupplier) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPLIERS)
        .update(updates)
        .eq('id', supplierId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a supplier
   */
  static async deleteSupplier(supplierId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.SUPPLIERS)
        .delete()
        .eq('id', supplierId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Check if a supplier is being used in any sessions
   */
  static async isSupplierUsedInSessions(supplierId: string) {
    try {
      const { count, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', supplierId);

      return { isUsed: (count || 0) > 0, count: count || 0, error };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if a supplier is being used in any session suppliers
   */
  static async isSupplierUsedInSessionSuppliers(supplierId: string) {
    try {
      const { count, error } = await supabase
        .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', supplierId);

      return { isUsed: (count || 0) > 0, count: count || 0, error };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if a supplier is being used as default supplier for any products
   */
  static async isSupplierUsedAsDefault(supplierId: string) {
    try {
      const { count, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*', { count: 'exact', head: true })
        .eq('default_supplier_id', supplierId);

      return { isUsed: (count || 0) > 0, count: count || 0, error };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Search suppliers by name (for autocomplete)
   */
  static async searchSuppliers(userId: string, searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPLIERS)
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${searchTerm}%`)
        .order('name')
        .limit(10);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get suppliers with their associated products count
   */
  static async getSuppliersWithProductCount(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPLIERS)
        .select(`
          *,
          products!default_supplier_id (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('name');

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get suppliers for a specific session
   */
  static async getSuppliersForSession(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select(`
          suppliers!supplier_id (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('session_id', sessionId);

      // Remove duplicates and extract supplier data
      const uniqueSuppliers = data?.reduce((acc: any[], item: any) => {
        const supplier = item.suppliers;
        if (supplier && !acc.find((s: any) => s.id === supplier.id)) {
          acc.push(supplier);
        }
        return acc;
      }, []);

      return { data: uniqueSuppliers, error };
    } catch (error) {
      return { data: null, error };
    }
  }
} 