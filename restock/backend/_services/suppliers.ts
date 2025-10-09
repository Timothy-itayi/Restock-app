import { supabase } from '../_config/supabase';


export class SupplierService {
  /**
   * Get all suppliers for current user via RPC
   */
  static async getUserSuppliers() {
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
      if (error) {
        throw error;
      }

      return { data: suppliers, error: null };
    } catch (error) {
      console.error('[SupplierService] Error getting user suppliers via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single supplier by ID (filter from RPC results)
   */
  static async getSupplier(supplierId: string) {
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
      if (error) {
        throw error;
      }

      const supplier = suppliers?.find((s: any) => s.id === supplierId);
      return { data: supplier || null, error: null };
    } catch (error) {
      console.error('[SupplierService] Error getting supplier via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new supplier via RPC
   */
  static async createSupplier(supplier: any) {
    try {
      const { data: newSupplier, error } = await supabase.rpc('insert_supplier', {
        p_name: supplier.name,
        p_email: supplier.email,
        p_phone: supplier.phone,
        p_notes: supplier.notes
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const createdSupplier = Array.isArray(newSupplier) ? newSupplier[0] : newSupplier;
      return { data: { id: createdSupplier?.id }, error: null };
    } catch (error) {
      console.error('[SupplierService] Error creating supplier via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing supplier via RPC
   */
  static async updateSupplier(supplierId: string, updates: any) {
    try {
      const { data: updatedSupplier, error } = await supabase.rpc('update_supplier', {
        p_id: supplierId,
        p_name: updates.name,
        p_email: updates.email,
        p_phone: updates.phone,
        p_notes: updates.notes
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const supplier = Array.isArray(updatedSupplier) ? updatedSupplier[0] : updatedSupplier;
      return { data: { id: supplier?.id }, error: null };
    } catch (error) {
      console.error('[SupplierService] Error updating supplier via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a supplier via RPC
   */
  static async deleteSupplier(supplierId: string) {
    try {
      const { error } = await supabase.rpc('delete_supplier', {
        p_id: supplierId
      });

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('[SupplierService] Error deleting supplier via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Search suppliers by name (filter from RPC results)
   */
  static async searchSuppliers(searchTerm: string) {
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
      if (error) {
        throw error;
      }

      const filteredSuppliers = suppliers?.filter((supplier: any) => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

      return { data: filteredSuppliers, error: null };
    } catch (error) {
      console.error('[SupplierService] Error searching suppliers via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get suppliers by email (filter from RPC results)
   */
  static async getSupplierByEmail(email: string) {
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
      if (error) {
        throw error;
      }

      const supplier = suppliers?.find((s: any) => s.email === email);
      return { data: supplier || null, error: null };
    } catch (error) {
      console.error('[SupplierService] Error getting supplier by email via RPC:', error);
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