import { supabase } from '../../backend/config/supabase';
import { Supplier } from '../../app/domain/entities/Supplier';
import { SupplierRepository } from '../../app/domain/interfaces/SupplierRepository';
import { SupplierMapper } from '../../app/infrastructure/repositories/mappers/SupplierMapper';
import type { Supplier as DbSupplier } from '../../backend/types/database';

export class SupabaseSupplierRepository implements SupplierRepository {
  async save(supplier: Supplier): Promise<void> {
    const dbSupplier = SupplierMapper.toDatabase(supplier);
    
    const { error } = await supabase
      .from('suppliers')
      .upsert(dbSupplier, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to save supplier: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to find supplier: ${error.message}`);
    }

    return SupplierMapper.toDomain(data);
  }

  async findByUserId(userId: string): Promise<ReadonlyArray<Supplier>> {
    const { data, error } = await supabase
      .from('suppliers')
      .select()
      .eq('user_id', userId)
      .order('name');

    if (error) {
      throw new Error(`Failed to find suppliers: ${error.message}`);
    }

    return data?.map((item: DbSupplier) => SupplierMapper.toDomain(item)) || [];
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete supplier: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select()
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to find supplier by email: ${error.message}`);
    }

    return SupplierMapper.toDomain(data);
  }

  async search(userId: string, searchTerm: string): Promise<ReadonlyArray<Supplier>> {
    const { data, error } = await supabase
      .from('suppliers')
      .select()
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
      .order('name');

    if (error) {
      throw new Error(`Failed to search suppliers: ${error.message}`);
    }

    return data?.map((item: DbSupplier) => SupplierMapper.toDomain(item)) || [];
  }

  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to count suppliers: ${error.message}`);
    }

    return count || 0;
  }

  async findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Supplier>> {
    // This would require a more complex query with restock_items table
    // For now, return recent suppliers as a fallback
    const { data, error } = await supabase
      .from('suppliers')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find most used suppliers: ${error.message}`);
    }

    return data?.map((item: DbSupplier) => SupplierMapper.toDomain(item)) || [];
  }
}
