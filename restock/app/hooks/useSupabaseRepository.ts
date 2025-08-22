import { useSupabaseWithAuth } from './useAuthenticatedSupabase';
import { RestockSession } from '../domain/entities/RestockSession';
import { Product } from '../domain/entities/Product';
import { Supplier } from '../domain/entities/Supplier';

/**
 * Hook that provides easy access to Supabase RPC functions with Clerk authentication
 * This replaces the complex repository pattern with a simpler, hook-based approach
 */
export function useSupabaseRepository() {
  const { client, isLoading, isAuthenticated, rpc } = useSupabaseWithAuth();

  // Session operations
  const sessions = {
    getAll: async () => {
      const { data, error } = await rpc('get_restock_sessions');
      if (error) throw error;
      return data;
    },

    create: async (name: string, status: string = 'draft') => {
      const { data, error } = await rpc('insert_restock_session', {
        p_name: name,
        p_status: status
      });
      if (error) throw error;
      return data?.[0]; // RPC returns array, get first item
    },

    update: async (id: string, name?: string, status?: string) => {
      const { data, error } = await rpc('update_restock_session', {
        p_id: id,
        p_name: name || null,
        p_status: status || null
      });
      if (error) throw error;
      return data?.[0];
    },

    delete: async (id: string) => {
      const { error } = await rpc('delete_restock_session', { p_id: id });
      if (error) throw error;
    }
  };

  // Product operations
  const products = {
    getAll: async () => {
      const { data, error } = await rpc('get_products');
      if (error) throw error;
      return data;
    },

    create: async (name: string, defaultQuantity: number, defaultSupplierId?: string) => {
      const { data, error } = await rpc('insert_product', {
        p_name: name,
        p_default_quantity: defaultQuantity,
        p_default_supplier_id: defaultSupplierId || null
      });
      if (error) throw error;
      return data?.[0];
    },

    update: async (id: string, name: string, defaultQuantity: number, defaultSupplierId?: string) => {
      const { data, error } = await rpc('update_product', {
        p_id: id,
        p_name: name,
        p_default_quantity: defaultQuantity,
        p_default_supplier_id: defaultSupplierId || null
      });
      if (error) throw error;
      return data?.[0];
    },

    delete: async (id: string) => {
      const { error } = await rpc('delete_product', { p_id: id });
      if (error) throw error;
    }
  };

  // Supplier operations
  const suppliers = {
    getAll: async () => {
      const { data, error } = await rpc('get_suppliers');
      if (error) throw error;
      return data;
    },

    create: async (name: string, email: string, phone?: string, notes?: string) => {
      const { data, error } = await rpc('insert_supplier', {
        p_name: name,
        p_email: email,
        p_phone: phone || null,
        p_notes: notes || null
      });
      if (error) throw error;
      return data?.[0];
    },

    update: async (id: string, name: string, email: string, phone?: string, notes?: string) => {
      const { data, error } = await rpc('update_supplier', {
        p_id: id,
        p_name: name,
        p_email: email,
        p_phone: phone || null,
        p_notes: notes || null
      });
      if (error) throw error;
      return data?.[0];
    },

    delete: async (id: string) => {
      const { error } = await rpc('delete_supplier', { p_id: id });
      if (error) throw error;
    }
  };

  // Restock items operations
  const items = {
    getAll: async () => {
      const { data, error } = await rpc('get_restock_items');
      if (error) throw error;
      return data;
    },

    create: async (sessionId: string, productName: string, supplierName: string, supplierEmail: string, quantity: number, notes?: string) => {
      const { data, error } = await rpc('insert_restock_item', {
        p_session_id: sessionId,
        p_product_name: productName,
        p_supplier_name: supplierName,
        p_supplier_email: supplierEmail,
        p_quantity: quantity,
        p_notes: notes || null
      });
      if (error) throw error;
      return data?.[0];
    },

    update: async (id: string, quantity?: number, notes?: string) => {
      const { data, error } = await rpc('update_restock_item', {
        p_id: id,
        p_quantity: quantity || null,
        p_notes: notes || null
      });
      if (error) throw error;
      return data?.[0];
    },

    delete: async (id: string) => {
      const { error } = await rpc('delete_restock_item', { p_id: id });
      if (error) throw error;
    }
  };

  // User operations
  const user = {
    register: async (clerkId: string, email: string, name?: string, storeName?: string) => {
      const { data, error } = await rpc('handle_clerk_user', {
        p_clerk_id: clerkId,
        p_email: email,
        p_name: name || null,
        p_store_name: storeName || null
      });
      if (error) throw error;
      return data; // Returns UUID
    },

    getProfile: async () => {
      const { data, error } = await rpc('get_current_user_profile');
      if (error) throw error;
      return data?.[0];
    },

    updateProfile: async (name?: string, storeName?: string) => {
      const { data, error } = await rpc('update_user_profile', {
        p_name: name || null,
        p_store_name: storeName || null
      });
      if (error) throw error;
      return data?.[0];
    }
  };

  return {
    isLoading,
    isAuthenticated,
    sessions,
    products,
    suppliers,
    items,
    user,
    // Direct access to client for custom queries
    client
  };
}
