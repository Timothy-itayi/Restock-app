import { supabase } from '../../backend/config/supabase';
import { Product } from '../../app/domain/entities/Product';
import { ProductRepository } from '../../app/domain/interfaces/ProductRepository';
import { ProductMapper } from '../../app/infrastructure/repositories/mappers/ProductMapper';


export class SupabaseProductRepository implements ProductRepository {
  async save(product: Product): Promise<void> {
    const dbProduct = ProductMapper.toDatabase(product);
    
    if (product.id) {
      // Update existing product
      const { error } = await supabase.rpc('update_product', {
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
      const { error } = await supabase.rpc('insert_product', {
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
      const { data: products, error } = await supabase.rpc('get_products');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
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
    const { error } = await supabase.rpc('delete_product', {
      p_id: id
    });

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async findByName(name: string): Promise<ReadonlyArray<Product>> {
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
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
      const { data: products, error } = await supabase.rpc('get_products');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: products, error } = await supabase.rpc('get_products');
      
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
