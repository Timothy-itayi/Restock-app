/**
 * INFRASTRUCTURE REPOSITORY: SupabaseSupplierRepository
 * 
 * Implements SupplierRepository interface with Supabase as the data store
 * Handles RLS context, data mapping, and error conversion
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupplierRepository } from '../../domain/interfaces/SupplierRepository';
import { Supplier } from '../../domain/entities/Supplier';
import { SupplierMapper } from './mappers/SupplierMapper';
import { UserContextService } from '../services/UserContextService';
import { TABLES } from '../../infrastructure/config/SupabaseConfig';

// Domain-specific errors
export class SupplierNotFoundError extends Error {
  constructor(supplierId: string) {
    super(`Supplier not found: ${supplierId}`);
    this.name = 'SupplierNotFoundError';
  }
}

export class SupplierSaveError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'SupplierSaveError';
  }
}

export class SupplierAccessError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'SupplierAccessError';
  }
}

/**
 * Supabase implementation of SupplierRepository
 */
export class SupabaseSupplierRepository implements SupplierRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userContextService: UserContextService
  ) {}

  /**
   * Save a supplier (create or update)
   */
  async save(supplier: Supplier): Promise<void> {
    const value = supplier.toValue();
    
    try {
      await this.withUserContext(value.userId, async () => {
        // Check if supplier already exists
        const { data: existingSupplier } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('id')
          .eq('id', value.id)
          .maybeSingle();

        if (existingSupplier) {
          await this.updateExistingSupplier(supplier);
        } else {
          await this.createNewSupplier(supplier);
        }
      });
    } catch (error) {
      this.handleDatabaseError(error, 'save supplier');
    }
  }

  /**
   * Find supplier by ID
   */
  async findById(supplierId: string): Promise<Supplier | null> {
    try {
      // Get user ID from supplier first for RLS context
      const { data: supplierMeta } = await this.supabase
        .from(TABLES.SUPPLIERS)
        .select('user_id')
        .eq('id', supplierId)
        .maybeSingle();

      if (!supplierMeta) {
        return null;
      }

      return await this.withUserContext(supplierMeta.user_id, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('id', supplierId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }

        return SupplierMapper.toDomain(data);
      });
    } catch (error) {
      if (error instanceof SupplierNotFoundError) {
        return null;
      }
      this.handleDatabaseError(error, 'find supplier by ID');
      return null;
    }
  }

  /**
   * Find all suppliers for a user
   */
  async findByUserId(userId: string): Promise<Supplier[]> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        return SupplierMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find suppliers by user ID');
      return [];
    }
  }

  /**
   * Search suppliers by name for a user
   */
  async searchByName(userId: string, searchTerm: string): Promise<Supplier[]> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('user_id', userId)
          .ilike('name', `%${searchTerm}%`)
          .order('name', { ascending: true })
          .limit(20); // Limit for autocomplete performance

        if (error) {
          throw error;
        }

        return SupplierMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'search suppliers by name');
      return [];
    }
  }

  /**
   * Find supplier by email for a user
   */
  async findByEmail(email: string): Promise<Supplier | null> {
    try {
      // Since we need user context but the interface doesn't provide userId,
      // we'll need to get it from the current user context or handle this differently
      // For now, we'll search across all suppliers (this may need to be refactored)
      const { data, error } = await this.supabase
        .from(TABLES.SUPPLIERS)
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? SupplierMapper.toDomain(data) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'find supplier by email');
      return null;
    }
  }

  /**
   * Search suppliers by name for a user
   */
  async search(userId: string, searchTerm: string): Promise<ReadonlyArray<Supplier>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        return SupplierMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'search suppliers');
      return [];
    }
  }

  /**
   * Count suppliers for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      return await this.withUserContext(userId, async () => {
        const { count, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        return count || 0;
      });
    } catch (error) {
      this.handleDatabaseError(error, 'count suppliers by user ID');
      return 0;
    }
  }

  /**
   * Find most used suppliers for a user (based on usage frequency)
   */
  async findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Supplier>> {
    try {
      return await this.withUserContext(userId, async () => {
        // For now, we'll return suppliers ordered by name since we don't have usage tracking yet
        // TODO: Implement usage frequency tracking in the future
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true })
          .limit(limit);

        if (error) {
          throw error;
        }

        return SupplierMapper.toDomainArray(data || []);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find most used suppliers');
      return [];
    }
  }

  /**
   * Find supplier by email for a user (internal method with userId)
   */
  async findByEmailForUser(userId: string, email: string): Promise<Supplier | null> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('user_id', userId)
          .eq('email', email)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return data ? SupplierMapper.toDomain(data) : null;
      });
    } catch (error) {
      this.handleDatabaseError(error, 'find supplier by email');
      return null;
    }
  }

  /**
   * Delete a supplier
   */
  async delete(supplierId: string): Promise<void> {
    try {
      // Get user ID for RLS context
      const { data: supplierMeta } = await this.supabase
        .from(TABLES.SUPPLIERS)
        .select('user_id')
        .eq('id', supplierId)
        .maybeSingle();

      if (!supplierMeta) {
        throw new SupplierNotFoundError(supplierId);
      }

      await this.withUserContext(supplierMeta.user_id, async () => {
        const { error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .delete()
          .eq('id', supplierId);

        if (error) {
          throw error;
        }
      });
    } catch (error) {
      this.handleDatabaseError(error, 'delete supplier');
    }
  }

  /**
   * Check if a supplier exists for a user
   */
  async exists(userId: string, supplierName: string): Promise<boolean> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('id')
          .eq('user_id', userId)
          .ilike('name', supplierName)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return !!data;
      });
    } catch (error) {
      this.handleDatabaseError(error, 'check supplier existence');
      return false;
    }
  }

  /**
   * Check if a supplier email exists for a user
   */
  async emailExists(userId: string, email: string): Promise<boolean> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('id')
          .eq('user_id', userId)
          .eq('email', email)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return !!data;
      });
    } catch (error) {
      this.handleDatabaseError(error, 'check supplier email existence');
      return false;
    }
  }

  /**
   * Get supplier suggestions for autocomplete
   */
  async getAutocompleteSuggestions(userId: string, searchTerm: string, limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    email: string;
  }>> {
    try {
      return await this.withUserContext(userId, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .order('name', { ascending: true })
          .limit(limit);

        if (error) {
          throw error;
        }

        return (data || []).map(SupplierMapper.toSelectOption);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'get autocomplete suggestions');
      return [];
    }
  }

  /**
   * Get supplier contact information for email generation
   */
  async getContactInfo(supplierId: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  } | null> {
    try {
      // Get user ID from supplier first for RLS context
      const { data: supplierMeta } = await this.supabase
        .from(TABLES.SUPPLIERS)
        .select('user_id')
        .eq('id', supplierId)
        .maybeSingle();

      if (!supplierMeta) {
        return null;
      }

      return await this.withUserContext(supplierMeta.user_id, async () => {
        const { data, error } = await this.supabase
          .from(TABLES.SUPPLIERS)
          .select('*')
          .eq('id', supplierId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }

        return SupplierMapper.toContactInfo(data);
      });
    } catch (error) {
      this.handleDatabaseError(error, 'get supplier contact info');
      return null;
    }
  }

  // Private helper methods

  /**
   * Create a new supplier
   */
  private async createNewSupplier(supplier: Supplier): Promise<void> {
    const insertData = SupplierMapper.toDatabaseInsert(supplier);

    const { error } = await this.supabase
      .from(TABLES.SUPPLIERS)
      .insert(insertData);

    if (error) {
      throw error;
    }
  }

  /**
   * Update existing supplier
   */
  private async updateExistingSupplier(supplier: Supplier): Promise<void> {
    const value = supplier.toValue();
    const updateData = SupplierMapper.toDatabaseUpdate(supplier);

    const { error } = await this.supabase
      .from(TABLES.SUPPLIERS)
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
    console.error(`[SupabaseSupplierRepository] Error during ${operation}:`, error);

    if (error.code === 'PGRST116') {
      throw new SupplierNotFoundError('Supplier not found');
    }

    if (error.code === '42501' || error.message?.includes('RLS')) {
      throw new SupplierAccessError(`Access denied during ${operation}`, error);
    }

    throw new SupplierSaveError(`Failed to ${operation}`, error);
  }
}
