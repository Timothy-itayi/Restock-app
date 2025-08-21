import { supabase } from '../../backend/config/supabase';
import { Supplier } from '../../app/domain/entities/Supplier';
import { SupplierRepository } from '../../app/domain/interfaces/SupplierRepository';
import { SupplierMapper } from '../../app/infrastructure/repositories/mappers/SupplierMapper';
import type { Supplier as DbSupplier } from '../../backend/types/database';

export class SupabaseSupplierRepository implements SupplierRepository {
  async save(supplier: Supplier): Promise<void> {
    const dbSupplier = SupplierMapper.toDatabase(supplier);
    
    if (supplier.id) {
      // Update existing supplier
      const { error } = await supabase.rpc('update_supplier', {
        p_id: supplier.id,
        p_name: dbSupplier.name,
        p_email: dbSupplier.email,
        p_phone: dbSupplier.phone,
        p_notes: dbSupplier.notes
      });

      if (error) {
        throw new Error(`Failed to update supplier: ${error.message}`);
      }
    } else {
      // Create new supplier
      const { error } = await supabase.rpc('insert_supplier', {
        p_name: dbSupplier.name,
        p_email: dbSupplier.email,
        p_phone: dbSupplier.phone,
        p_notes: dbSupplier.notes
      });

      if (error) {
        throw new Error(`Failed to create supplier: ${error.message}`);
      }
    }
  }

  async findById(id: string): Promise<Supplier | null> {
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
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
    const { error } = await supabase.rpc('delete_supplier', {
      p_id: id
    });

    if (error) {
      throw new Error(`Failed to delete supplier: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
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
    // RPC functions automatically filter by current user, so userId is not needed
    try {
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
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
      const { data: suppliers, error } = await supabase.rpc('get_suppliers');
      
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
