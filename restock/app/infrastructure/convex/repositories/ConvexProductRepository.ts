import { ConvexReactClient } from "convex/react";
import { ProductRepository } from "../../../domain/interfaces/ProductRepository";
import { Product } from "../../../domain/entities/Product";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

/**
 * ConvexProductRepository
 * 
 * Implements ProductRepository interface using Convex functions
 * Maintains clean architecture - no React hooks in repository class
 * Convex specifics are completely hidden from other layers
 */
export class ConvexProductRepository implements ProductRepository {
  constructor(private convexClient: ConvexReactClient) {}

  /**
   * Save a product (create or update)
   */
  async save(product: Product): Promise<void> {
    const value = product.toValue();
    
    if (product.id.startsWith('temp_')) {
      // Create new product
      await this.convexClient.mutation(api.products.create, {
        name: value.name,
        defaultQuantity: value.defaultQuantity,
        defaultSupplierId: value.defaultSupplierId,
        notes: value.notes,
      });
    } else {
      // Update existing product
      await this.convexClient.mutation(api.products.update, {
        id: product.id as Id<"products">,
        name: value.name,
        defaultQuantity: value.defaultQuantity,
        defaultSupplierId: value.defaultSupplierId,
        notes: value.notes,
      });
    }
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    try {
      const convexId = id as Id<"products">;
      const productData = await this.convexClient.query(api.products.get, { id: convexId });
      
      if (!productData) {
        return null;
      }
      
      // Convert Convex data to domain entity
      return Product.fromValue({
        id: productData._id,
        name: productData.name,
        userId: productData.userId,
        defaultQuantity: productData.defaultQuantity,
        defaultSupplierId: productData.defaultSupplierId,
        notes: productData.notes,
        createdAt: new Date(productData.createdAt),
        updatedAt: productData.updatedAt ? new Date(productData.updatedAt) : undefined,
      });
    } catch (error) {
      console.error('Error finding product by ID:', error);
      return null;
    }
  }

  /**
   * Find all products for a user
   */
  async findByUserId(userId: string): Promise<ReadonlyArray<Product>> {
    try {
      const productsData = await this.convexClient.query(api.products.list, {});
      
      return productsData
        .filter(product => product.userId === userId)
        .map(product => Product.fromValue({
          id: product._id,
          name: product.name,
          userId: product.userId,
          defaultQuantity: product.defaultQuantity,
          defaultSupplierId: product.defaultSupplierId,
          notes: product.notes,
          createdAt: new Date(product.createdAt),
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding products by user ID:', error);
      return [];
    }
  }

  /**
   * Delete a product
   */
  async delete(id: string): Promise<void> {
    try {
      const convexId = id as Id<"products">;
      await this.convexClient.mutation(api.products.remove, { id: convexId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Find products by name for a user
   */
  async findByName(userId: string, name: string): Promise<ReadonlyArray<Product>> {
    try {
      const productsData = await this.convexClient.query(api.products.search, { query: name });
      
      return productsData
        .filter(product => product.userId === userId)
        .map(product => Product.fromValue({
          id: product._id,
          name: product.name,
          userId: product.userId,
          defaultQuantity: product.defaultQuantity,
          defaultSupplierId: product.defaultSupplierId,
          notes: product.notes,
          createdAt: new Date(product.createdAt),
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding products by name:', error);
      return [];
    }
  }

  /**
   * Search products for a user
   */
  async search(userId: string, searchTerm: string): Promise<ReadonlyArray<Product>> {
    try {
      const productsData = await this.convexClient.query(api.products.search, { query: searchTerm });
      
      return productsData
        .filter(product => product.userId === userId)
        .map(product => Product.fromValue({
          id: product._id,
          name: product.name,
          userId: product.userId,
          defaultQuantity: product.defaultQuantity,
          defaultSupplierId: product.defaultSupplierId,
          notes: product.notes,
          createdAt: new Date(product.createdAt),
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Find products by supplier for a user
   */
  async findBySupplierId(userId: string, supplierId: string): Promise<ReadonlyArray<Product>> {
    try {
      const productsData = await this.convexClient.query(api.products.list, {});
      
      return productsData
        .filter(product => product.userId === userId && product.defaultSupplierId === supplierId)
        .map(product => Product.fromValue({
          id: product._id,
          name: product.name,
          userId: product.userId,
          defaultQuantity: product.defaultQuantity,
          defaultSupplierId: product.defaultSupplierId,
          notes: product.notes,
          createdAt: new Date(product.createdAt),
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding products by supplier:', error);
      return [];
    }
  }

  /**
   * Count products for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      const productsData = await this.convexClient.query(api.products.list, {});
      return productsData.filter(product => product.userId === userId).length;
    } catch (error) {
      console.error('Error counting products:', error);
      return 0;
    }
  }

  /**
   * Find most used products for a user
   */
  async findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Product>> {
    try {
      const productsData = await this.convexClient.query(api.products.list, {});
      
      return productsData
        .filter(product => product.userId === userId)
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, limit)
        .map(product => Product.fromValue({
          id: product._id,
          name: product.name,
          userId: product.userId,
          defaultQuantity: product.defaultQuantity,
          defaultSupplierId: product.defaultSupplierId,
          notes: product.notes,
          createdAt: new Date(product.createdAt),
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding most used products:', error);
      return [];
    }
  }
}
