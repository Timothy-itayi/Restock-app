import { supabase } from '../config/supabase';
import type { Supplier, InsertSupplier, UpdateSupplier } from '../types/database';

export class SupplierService {
  /**
   * Get all suppliers for a user
   */
  static async getUserSuppliers(userId: string) {
    try {
      const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: suppliers, error: null };
    } catch (error) {
      console.error('[SupplierService] Error getting user suppliers', { error, userId });
      return { data: null, error };
    }
  }

  /**
   * Get a single supplier by ID
   */
  static async getSupplier(supplierId: string) {
    try {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: supplier, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new supplier
   */
  static async createSupplier(supplier: any) {
    try {
      const { data: newSupplier, error } = await supabase
        .from('suppliers')
        .insert({
          user_id: supplier.userId,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          notes: supplier.notes
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: newSupplier.id }, error: null };
    } catch (error) {
      console.error('[SupplierService] Error creating supplier', { error, supplier });
      return { data: null, error };
    }
  }

  /**
   * Update an existing supplier
   */
  static async updateSupplier(supplierId: string, updates: any) {
    try {
      const updateData: UpdateSupplier = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data: updatedSupplier, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', supplierId)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: updatedSupplier.id }, error: null };
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
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Search suppliers by name or email
   */
  static async searchSuppliers(query: string) {
    try {
      const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: suppliers, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get supplier by email
   */
  static async getSupplierByEmail(email: string) {
    try {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: supplier, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Check if supplier is used in sessions
   */
  static async isSupplierUsedInSessions(supplierId: string) {
    try {
      const { data: sessions, error } = await supabase
        .from('restock_sessions')
        .select('id')
        .eq('user_id', supplierId)
        .limit(1);

      if (error) {
        throw error;
      }

      const isUsed = sessions && sessions.length > 0;
      return { isUsed, count: sessions?.length || 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if supplier is used in session suppliers
   */
  static async isSupplierUsedInSessionSuppliers(supplierId: string) {
    try {
      const { data: items, error } = await supabase
        .from('restock_items')
        .select('id')
        .eq('supplier_name', supplierId)
        .limit(1);

      if (error) {
        throw error;
      }

      const isUsed = items && items.length > 0;
      return { isUsed, count: items?.length || 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if supplier is used as default supplier
   */
  static async isSupplierUsedAsDefault(supplierId: string) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id')
        .eq('default_supplier_id', supplierId)
        .limit(1);

      if (error) {
        throw error;
      }

      const isUsed = products && products.length > 0;
      return { isUsed, count: products?.length || 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }
} 