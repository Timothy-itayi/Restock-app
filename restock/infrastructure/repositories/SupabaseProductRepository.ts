import { supabase } from '../../backend/config/supabase';
import { Product } from '../../app/domain/entities/Product';
import { ProductRepository } from '../../app/domain/interfaces/ProductRepository';
import { ProductMapper } from '../../app/infrastructure/repositories/mappers/ProductMapper';
import type { Product as DbProduct } from '../../backend/types/database';

export class SupabaseProductRepository implements ProductRepository {
  async save(product: Product): Promise<void> {
    const dbProduct = ProductMapper.toDatabase(product);
    
    const { error } = await supabase
      .from('products')
      .upsert(dbProduct, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to save product: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to find product: ${error.message}`);
    }

    return ProductMapper.toDomain(data);
  }

  async findByUserId(userId: string): Promise<ReadonlyArray<Product>> {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('user_id', userId)
      .order('name');

    if (error) {
      throw new Error(`Failed to find products: ${error.message}`);
    }

    return data?.map(item => ProductMapper.toDomain(item)) || [];
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async findByName(userId: string, name: string): Promise<ReadonlyArray<Product>> {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('user_id', userId)
      .ilike('name', `%${name}%`)
      .order('name');

    if (error) {
      throw new Error(`Failed to find products by name: ${error.message}`);
    }

    return data?.map(item => ProductMapper.toDomain(item)) || [];
  }

  async search(userId: string, searchTerm: string): Promise<ReadonlyArray<Product>> {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
      .order('name');

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data?.map(item => ProductMapper.toDomain(item)) || [];
  }

  async findBySupplierId(userId: string, supplierId: string): Promise<ReadonlyArray<Product>> {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('user_id', userId)
      .eq('default_supplier_id', supplierId)
      .order('name');

    if (error) {
      throw new Error(`Failed to find products by supplier: ${error.message}`);
    }

    return data?.map(item => ProductMapper.toDomain(item)) || [];
  }

  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to count products: ${error.message}`);
    }

    return count || 0;
  }

  async findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Product>> {
    // This would require a more complex query with restock_items table
    // For now, return recent products as a fallback
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find most used products: ${error.message}`);
    }

    return data?.map(item => ProductMapper.toDomain(item)) || [];
  }
}
