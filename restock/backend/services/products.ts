import { supabase, TABLES } from '../config/supabase';
import type { Product, InsertProduct, UpdateProduct } from '../types/database';
import { UserContextService } from './user-context';

export class ProductService {
  /**
   * Get all products for a user
   */
  static async getUserProducts(userId: string) {
    try {
      return await UserContextService.withUserContext(userId, async () => {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select(`
            *,
            suppliers!default_supplier_id (
              id,
              name,
              email
            )
          `)
          .eq('user_id', userId)
          .order('name');

        return { data, error };
      });
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
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          suppliers!default_supplier_id (
            id,
            name,
            email
          )
        `)
        .eq('id', productId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(product: InsertProduct) {
    if (!product.user_id) {
      return { data: null, error: new Error('User ID is required to create a product') };
    }

    try {
      return await UserContextService.withUserContext(product.user_id, async () => {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .insert(product)
          .select()
          .single();

        return { data, error };
      });
    } catch (error) {
      console.error('[ProductService] Error creating product', { error, userId: product.user_id });
      return { data: null, error };
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(productId: string, updates: UpdateProduct) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      return { data, error };
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
        .from(TABLES.PRODUCTS)
        .delete()
        .eq('id', productId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Check if a product is being used in any sessions
   */
  static async isProductUsedInSessions(productId: string) {
    try {
      const { count, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      return { isUsed: (count || 0) > 0, count: count || 0, error };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if a product is being used in any session products
   */
  static async isProductUsedInSessionProducts(productId: string) {
    try {
      const { count, error } = await supabase
        .from(TABLES.RESTOCK_SESSION_PRODUCTS)
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      return { isUsed: (count || 0) > 0, count: count || 0, error };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Search products by name (for autocomplete)
   */
  static async searchProducts(userId: string, searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          suppliers!default_supplier_id (
            id,
            name,
            email
          )
        `)
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
   * Get products with their default suppliers
   */
  static async getProductsWithSuppliers(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          suppliers!default_supplier_id (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('user_id', userId)
        .order('name');

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
} 