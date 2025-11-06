import { Product } from '../../../lib/domain/_entities/Product';
import { ProductRepository } from '../../../lib/domain/_interfaces/ProductRepository';
import { ProductMapper } from '../../../lib/infrastructure/_repositories/_mappers/ProductMapper';
import { supabase } from '../../_config/supabase';


export class SupabaseProductRepository implements ProductRepository {
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

  async save(product: Product): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const dbProduct = ProductMapper.toDatabase(product);
    
    if (product.id) {
      // Update existing product
      const { error } = await client.rpc('update_product', {
        p_id: product.id,
        p_name: dbProduct.name,
        p_default_quantity: dbProduct.default_quantity,
        p_default_supplier_id: dbProduct.default_supplier_id
      });

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
    } else {
      // Create new product
      const { error } = await client.rpc('insert_product', {
        p_name: dbProduct.name,
        p_default_quantity: dbProduct.default_quantity,
        p_default_supplier_id: dbProduct.default_supplier_id
      });

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      const product = products?.find((p: any) => p.id === id);
      return product ? ProductMapper.toDomain(product) : null;
    } catch (error) {
      console.error('[SupabaseProductRepository] Error finding product by ID:', error);
      return null;
    }
  }

  async findByUserId(): Promise<ReadonlyArray<Product>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      return products?.map((item: any) => ProductMapper.toDomain(item)) || [];
    } catch (error) {
      console.error('[SupabaseProductRepository] Error finding products by user ID:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.getAuthenticatedClient();
    const { error } = await client.rpc('delete_product', {
      p_id: id
    });

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async findByName(name: string): Promise<ReadonlyArray<Product>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      const filteredProducts = products?.filter((p: any) => 
        p.name.toLowerCase().includes(name.toLowerCase())
      ) || [];

      return filteredProducts.map((item: any) => ProductMapper.toDomain(item));
    } catch (error) {
      console.error('[SupabaseProductRepository] Error finding products by name:', error);
      return [];
    }
  }

  async search(searchTerm: string): Promise<ReadonlyArray<Product>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      const filteredProducts = products?.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      ) || [];

      return filteredProducts.map((item: any) => ProductMapper.toDomain(item));
    } catch (error) {
      console.error('[SupabaseProductRepository] Error searching products:', error);
      return [];
    }
  }

  async findBySupplierId(supplierId: string): Promise<ReadonlyArray<Product>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      const filteredProducts = products?.filter((p: any) => 
        p.default_supplier_id === supplierId
      ) || [];

      return filteredProducts.map((item: any) => ProductMapper.toDomain(item));
    } catch (error) {
      console.error('[SupabaseProductRepository] Error finding products by supplier ID:', error);
      return [];
    }
  }

  async findAll(): Promise<ReadonlyArray<Product>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      return products?.map((item: any) => ProductMapper.toDomain(item)) || [];
    } catch (error) {
      console.error('[SupabaseProductRepository] Error getting all products:', error);
      return [];
    }
  }

  async countByUserId(): Promise<number> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      return products?.length || 0;
    } catch (error) {
      console.error('[SupabaseProductRepository] Error counting products:', error);
      return 0;
    }
  }

  async findMostUsed(limit: number): Promise<ReadonlyArray<Product>> {
    try {
      const client = await this.getAuthenticatedClient();
      const { data: products, error } = await client.rpc('get_products');
      
      if (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }

      // For now, return recent products as a fallback since we don't have usage tracking yet
      const recentProducts = products?.slice(0, limit) || [];
      return recentProducts.map((item: any) => ProductMapper.toDomain(item));
    } catch (error) {
      console.error('[SupabaseProductRepository] Error finding most used products:', error);
      return [];
    }
  }
}
