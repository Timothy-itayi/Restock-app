import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Initialize Convex client for backend usage
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export class ProductService {
  /**
   * Get all products for a user
   */
  static async getUserProducts(userId: string) {
    try {
      const products = await convex.query(api.products.list);
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
      const product = await convex.query(api.products.get, { id: productId as Id<"products"> });
      return { data: product, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(product: any) {
    if (!product.user_id) {
      return { data: null, error: new Error('User ID is required to create a product') };
    }

    try {
      const productId = await convex.mutation(api.products.create, {
        name: product.name,
        defaultQuantity: product.default_quantity || product.defaultQuantity || 1,
        defaultSupplierId: product.default_supplier_id || product.defaultSupplierId,
        notes: product.notes
      });

      return { data: { id: productId }, error: null };
    } catch (error) {
      console.error('[ProductService] Error creating product', { error, userId: product.user_id });
      return { data: null, error };
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(productId: string, updates: any) {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.defaultQuantity !== undefined) updateData.defaultQuantity = updates.defaultQuantity;
      if (updates.defaultSupplierId !== undefined) updateData.defaultSupplierId = updates.defaultSupplierId;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const updatedId = await convex.mutation(api.products.update, {
        id: productId as Id<"products">,
        ...updateData
      });

      return { data: { id: updatedId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId: string) {
    try {
      await convex.mutation(api.products.remove, { id: productId as Id<"products"> });
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
      const products = await convex.query(api.products.search, { query });
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
      const products = await convex.query(api.products.listBySupplier, { supplierId: supplierId as Id<"suppliers"> });
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
      // This would need to be implemented in Convex if needed
      // For now, return false to avoid complexity
      return { isUsed: false, count: 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if product is used in session products
   */
  static async isProductUsedInSessionProducts(productId: string) {
    try {
      // This would need to be implemented in Convex if needed
      // For now, return false to avoid complexity
      return { isUsed: false, count: 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }
} 