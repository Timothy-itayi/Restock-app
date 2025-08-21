import { supabase } from '../config/supabase';
import type { Product, InsertProduct, UpdateProduct } from '../types/database';

export class ProductService {
  /**
   * Get all products for current user via RPC
   */
  static async getUserProducts() {
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
      if (error) {
        throw error;
      }

      return { data: products, error: null };
    } catch (error) {
      console.error('[ProductService] Error getting user products via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single product by ID (filter from RPC results)
   */
  static async getProduct(productId: string) {
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
      if (error) {
        throw error;
      }

      const product = products?.find((p: any) => p.id === productId);
      return { data: product || null, error: null };
    } catch (error) {
      console.error('[ProductService] Error getting product via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new product via RPC
   */
  static async createProduct(product: any) {
    try {
      const { data: newProduct, error } = await supabase.rpc('insert_product', {
        p_name: product.name,
        p_default_quantity: product.defaultQuantity || 1,
        p_default_supplier_id: product.defaultSupplierId
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const createdProduct = Array.isArray(newProduct) ? newProduct[0] : newProduct;
      return { data: { id: createdProduct?.id }, error: null };
    } catch (error) {
      console.error('[ProductService] Error creating product via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing product via RPC
   */
  static async updateProduct(productId: string, updates: any) {
    try {
      const { data: updatedProduct, error } = await supabase.rpc('update_product', {
        p_id: productId,
        p_name: updates.name,
        p_default_quantity: updates.defaultQuantity,
        p_default_supplier_id: updates.defaultSupplierId
      });

      if (error) {
        throw error;
      }

      // RPC returns array, get first item
      const product = Array.isArray(updatedProduct) ? updatedProduct[0] : updatedProduct;
      return { data: { id: product?.id }, error: null };
    } catch (error) {
      console.error('[ProductService] Error updating product via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a product via RPC
   */
  static async deleteProduct(productId: string) {
    try {
      const { error } = await supabase.rpc('delete_product', {
        p_id: productId
      });

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('[ProductService] Error deleting product via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Search products by name (filter from RPC results)
   */
  static async searchProducts(searchTerm: string) {
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
      if (error) {
        throw error;
      }

      const filteredProducts = products?.filter((product: any) => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

      return { data: filteredProducts, error: null };
    } catch (error) {
      console.error('[ProductService] Error searching products via RPC:', error);
      return { data: null, error };
    }
  }

  /**
   * Get products by supplier
   */
  static async getProductsBySupplier(supplierId: string) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('default_supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: products, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Check if product is used in sessions
   */
  static async isProductUsedInSessions(productId: string) {
    try {
      const { data: sessions, error } = await supabase
        .from('restock_sessions')
        .select('id')
        .eq('user_id', productId)
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
   * Check if product is used in session products
   */
  static async isProductUsedInSessionProducts(productId: string) {
    try {
      const { data: items, error } = await supabase
        .from('restock_items')
        .select('id')
        .eq('product_name', productId)
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
} 