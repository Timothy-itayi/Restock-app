import { supabase } from '../config/supabase';
import type { Product, InsertProduct, UpdateProduct } from '../types/database';

export class ProductService {
  /**
   * Get all products for a user
   */
  static async getUserProducts(userId: string) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: products, error: null };
    } catch (error) {
      console.error('[ProductService] Error getting user products', { error, userId });
      return { data: null, error };
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(productId: string) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: product, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(product: any) {
    try {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          user_id: product.userId,
          name: product.name,
          default_quantity: product.defaultQuantity || 1,
          default_supplier_id: product.defaultSupplierId,
          notes: product.notes
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: newProduct.id }, error: null };
    } catch (error) {
      console.error('[ProductService] Error creating product', { error, product });
      return { data: null, error };
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(productId: string, updates: any) {
    try {
      const updateData: UpdateProduct = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.defaultQuantity !== undefined) updateData.default_quantity = updates.defaultQuantity;
      if (updates.defaultSupplierId !== undefined) updateData.default_supplier_id = updates.defaultSupplierId;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { data: { id: updatedProduct.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Search products by name
   */
  static async searchProducts(query: string) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
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