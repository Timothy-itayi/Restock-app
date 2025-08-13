/**
 * INFRASTRUCTURE REPOSITORY: SupabaseProductRepository
 * 
 * Implements ProductRepository interface with Supabase as the data store
 * Handles RLS context, data mapping, and error conversion
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ProductRepository } from '../../domain/interfaces/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { ProductMapper } from './mappers/ProductMapper';
import { UserContextService } from '../services/UserContextService';
import { TABLES } from '../config/SupabaseConfig';

// Domain-specific errors
export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductSaveError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'ProductSaveError';
  }
}

export class ProductAccessError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'ProductAccessError';
  }
}

/**
 * Supabase implementation of ProductRepository
 */
export class SupabaseProductRepository implements ProductRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userContextService: UserContextService
  ) {}

  /**
   * Save a product (create or update)
   */
  async save(product: Product): Promise<void> {
    const value = product.toValue();
    
    try {
      await this.withUserContext(value.userId, async () => {
        // Check if product already exists
        const { data: existingProduct } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('id')
          .eq('id', value.id)
          .maybeSingle();

        if (existingProduct) {
          await this.updateExistingProduct(product);
        } else {
          await this.createNewProduct(product);
        }
      });
    } catch (error) {
      this.handleDatabaseError(error, 'save product');
    }
  }

  /**
   * Find product by ID
   */
  async findById(productId: string): Promise<Product | null> {
    try {
      // Get user ID from product first for RLS context
      const { data: productMeta } = await this.supabase
        .from(TABLES.PRODUCTS)
        .select('user_id')
        .eq('id', productId)
        .maybeSingle();

      if (!productMeta) {
        return null;
      }

      return await this.withUserContext(productMeta.user_id, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }

        return ProductMapper.toDomain(data);
      });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        return null;
      }
      this.handleDatabaseError(error, 'find product by ID');
      return null;
    }
  }

  /**
   * Find all products for a user
   */
  async findByUserId(userId: string): Promise<Product[]> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        return ProductMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find products by user ID');
      return [];
    }
  }

  /**
   * Find products by name for a user
   */
  async findByName(userId: string, name: string): Promise<ReadonlyArray<Product>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('user_id', userId)
          .ilike('name', `%${name}%`)
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        return ProductMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find products by name');
      return [];
    }
  }

  /**
   * Search products by name for a user
   */
  async search(userId: string, searchTerm: string): Promise<ReadonlyArray<Product>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('user_id', userId)
          .ilike('name', `%${searchTerm}%`)
          .order('name', { ascending: true })
          .limit(20); // Limit for search performance

        if (error) {
          throw error;
        }

        return ProductMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'search products');
      return [];
    }
  }

  /**
   * Find products by supplier for a user
   */
  async findBySupplierId(userId: string, supplierId: string): Promise<ReadonlyArray<Product>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('user_id', userId)
          .eq('default_supplier_id', supplierId)
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        return ProductMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find products by supplier ID');
      return [];
    }
  }

  /**
   * Count products for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      return await this.withUserContext(userId, async () => {
        const { count, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        return count || 0;
      });
    } catch (error) {
      this.handleDatabaseError(error, 'count products by user ID');
      return 0;
    }
  }

  /**
   * Find most used products for a user (based on usage frequency)
   */
  async findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Product>> {
    try {
      return await this.withUserContext(userId, async () => {
        // For now, we'll return products ordered by name since we don't have usage tracking yet
        // TODO: Implement usage frequency tracking in the future
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true })
          .limit(limit);

        if (error) {
          throw error;
        }

        return ProductMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find most used products');
      return [];
    }
  }

  /**
   * Delete a product
   */
  async delete(productId: string): Promise<void> {
    try {
      // Get user ID for RLS context
      const { data: productMeta } = await this.supabase
        .from(TABLES.PRODUCTS)
        .select('user_id')
        .eq('id', productId)
        .maybeSingle();

      if (!productMeta) {
        throw new ProductNotFoundError(productId);
      }

      await this.withUserContext(productMeta.user_id, async () => {
        const { error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .delete()
          .eq('id', productId);

        if (error) {
          throw error;
        }
      });
    } catch (error) {
      this.handleDatabaseError(error, 'delete product');
    }
  }

  /**
   * Check if a product exists for a user
   */
  async exists(userId: string, productName: string): Promise<boolean> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('id')
          .eq('user_id', userId)
          .ilike('name', productName)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return !!data;
      });
    } catch (error) {
      this.handleDatabaseError(error, 'check product existence');
      return false;
    }
  }

  /**
   * Get product suggestions for autocomplete
   */
  async getAutocompleteSuggestions(userId: string, searchTerm: string, limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    defaultQuantity: number;
    defaultSupplierId?: string;
  }>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('user_id', userId)
          .ilike('name', `%${searchTerm}%`)
          .order('name', { ascending: true })
          .limit(limit);

        if (error) {
          throw error;
        }

        return (data || []).map(ProductMapper.toSelectOption);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'get autocomplete suggestions');
      return [];
    }
  }

  // Private helper methods

  /**
   * Create a new product
   */
  private async createNewProduct(product: Product): Promise<void> {
    const insertData = ProductMapper.toDatabaseInsert(product);

    const { error } = await this.supabase
      .from(TABLES.PRODUCTS)
      .insert(insertData);

    if (error) {
      throw error;
    }
  }

  /**
   * Update existing product
   */
  private async updateExistingProduct(product: Product): Promise<void> {
    const value = product.toValue();
    const updateData = ProductMapper.toDatabaseUpdate(product);

    const { error } = await this.supabase
      .from(TABLES.PRODUCTS)
      .update(updateData)
      .eq('id', value.id);

    if (error) {
      throw error;
    }
  }

  /**
   * Execute operation with proper user context for RLS
   */
  private async withUserContext<T>(
    userId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    await this.userContextService.setUserContext(userId);
    return await operation();
  }

  /**
   * Convert database errors to domain-specific errors
   */
  private handleDatabaseError(error: any, operation: string): never {
    console.error(`[SupabaseProductRepository] Error during ${operation}:`, error);

    if (error.code === 'PGRST116') {
      throw new ProductNotFoundError('Product not found');
    }

    if (error.code === '42501' || error.message?.includes('RLS')) {
      throw new ProductAccessError(`Access denied during ${operation}`, error);
    }

    throw new ProductSaveError(`Failed to ${operation}`, error);
  }
}
