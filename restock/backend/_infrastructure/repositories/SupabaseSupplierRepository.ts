import { Supplier } from '../../../lib/domain/_entities/Supplier';
import { SupplierRepository } from '../../../lib/domain/_interfaces/SupplierRepository';
import { SupplierMapper } from '../../../lib/infrastructure/_repositories/_mappers/SupplierMapper';
import { supabase } from '../../_config/supabase';

export class SupabaseSupplierRepository implements SupplierRepository {
  private userId: string | null = null;
  private getClerkTokenFn: (() => Promise<string | null>) | null = null;
  private _cachedClient: any = null;
  private _cachedToken: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  /**
   * Set the user ID for this repository instance
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Set the Clerk token getter function
   */
  setClerkTokenGetter(fn: () => Promise<string | null>) {
    this.getClerkTokenFn = fn;
  }

  /**
   * Get the current user ID, throwing an error if not set
   */
  private getCurrentUserId(): string {
    if (!this.userId) {
      throw new Error('User ID not set in repository. Call setUserId() first.');
    }
    return this.userId;
  }

  /**
   * Create an authenticated Supabase client with Clerk JWT token
   */
  private async getAuthenticatedClient() {
    if (!this.getClerkTokenFn) {
      console.warn('No Clerk token getter set, using default client');
      return supabase;
    }

    try {
      const token = await this.getClerkTokenFn();
      if (!token) {
        console.warn('No Clerk token available, using default client');
        return supabase;
      }

      // Return cached client if token hasn't changed
      if (this._cachedClient && this._cachedToken === token) {
        return this._cachedClient;
      }

      // Create new authenticated client
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

      // Cache the client and token
      this._cachedClient = client;
      this._cachedToken = token;

      return client;
    } catch (error) {
      console.warn('Failed to create authenticated client:', error);
      return supabase;
    }
  }

  async save(supplier: Supplier): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const dbSupplier = SupplierMapper.toDatabase(supplier);
    
    if (supplier.id) {
      // Update existing supplier
      const { error } = await client.rpc('update_supplier', {
        p_id: supplier.id,
        p_name: dbSupplier.name,
        p_email: dbSupplier.email,
        p_phone: dbSupplier.phone
      });

      if (error) {
        throw new Error(`Failed to update supplier: ${error.message}`);
      }
    } else {
      // Create new supplier
      const { error } = await client.rpc('insert_supplier', {
        p_name: dbSupplier.name,
        p_email: dbSupplier.email,
        p_phone: dbSupplier.phone
      });

      if (error) {
        throw new Error(`Failed to create supplier: ${error.message}`);
      }
    }
  }

  async findById(id: string): Promise<Supplier | null> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: suppliers, error } = await client.rpc('get_suppliers');
      
      if (error) {
        throw new Error(`Failed to get suppliers: ${error.message}`);
      }

      const supplier = suppliers?.find((s: any) => s.id === id);
      return supplier ? SupplierMapper.toDomain(supplier) : null;
    } catch (error) {
      console.error('[SupabaseSupplierRepository] Error finding supplier by ID:', error);
      return null;
    }
  }

  async findByUserId(): Promise<ReadonlyArray<Supplier>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: suppliers, error } = await client.rpc('get_suppliers');
      
      if (error) {
        throw new Error(`Failed to get suppliers: ${error.message}`);
      }

      return suppliers?.map((item: any) => SupplierMapper.toDomain(item)) || [];
    } catch (error) {
      console.error('[SupabaseSupplierRepository] Error finding suppliers by user ID:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('delete_supplier', {
      p_id: id
    });

    if (error) {
      throw new Error(`Failed to delete supplier: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: suppliers, error } = await client.rpc('get_suppliers');
      
      if (error) {
        throw new Error(`Failed to get suppliers: ${error.message}`);
      }

      const supplier = suppliers?.find((s: any) => s.email === email);
      return supplier ? SupplierMapper.toDomain(supplier) : null;
    } catch (error) {
      console.error('[SupabaseSupplierRepository] Error finding supplier by email:', error);
      return null;
    }
  }

  async search(searchTerm: string): Promise<ReadonlyArray<Supplier>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: suppliers, error } = await client.rpc('get_suppliers');
      
      if (error) {
        throw new Error(`Failed to get suppliers: ${error.message}`);
      }

      const filteredSuppliers = suppliers?.filter((s: any) => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      ) || [];

      return filteredSuppliers.map((item: any) => SupplierMapper.toDomain(item));
    } catch (error) {
      console.error('[SupabaseSupplierRepository] Error searching suppliers:', error);
      return [];
    }
  }

  async countByUserId(): Promise<number> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: suppliers, error } = await client.rpc('get_suppliers');
      
      if (error) {
        throw new Error(`Failed to get suppliers: ${error.message}`);
      }

      return suppliers?.length || 0;
    } catch (error) {
      console.error('[SupabaseSupplierRepository] Error counting suppliers:', error);
      return 0;
    }
  }

  async findAll(): Promise<ReadonlyArray<Supplier>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: suppliers, error } = await client.rpc('get_suppliers');
      
      if (error) {
        throw new Error(`Failed to get suppliers: ${error.message}`);
      }

      return suppliers?.map((item: any) => SupplierMapper.toDomain(item)) || [];
    } catch (error) {
      console.error('[SupabaseSupplierRepository] Error getting all suppliers:', error);
      return [];
    }
  }
}
