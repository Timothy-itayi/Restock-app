/**
 * INFRASTRUCTURE MAPPER: SupplierMapper
 * 
 * Converts between domain Supplier entities and database records
 */

import { Supplier, SupplierValue } from '../../../domain/entities/Supplier';
import type { 
  Supplier as DbSupplier,
  InsertSupplier as DbInsertSupplier,
  UpdateSupplier as DbUpdateSupplier
} from '../../../../backend/types/database';

/**
 * SupplierMapper handles conversion between domain and database formats
 */
export class SupplierMapper {
  /**
   * Convert database supplier record to domain Supplier entity
   */
  static toDomain(dbSupplier: DbSupplier): Supplier {
    const supplierValue: SupplierValue = {
      id: dbSupplier.id,
      userId: dbSupplier.user_id,
      name: dbSupplier.name,
      email: dbSupplier.email,
      phone: dbSupplier.phone,
      notes: dbSupplier.notes,
      createdAt: new Date(dbSupplier.created_at)
    };

    return Supplier.fromValue(supplierValue);
  }

  /**
   * Convert domain Supplier to database insert format
   */
  static toDatabaseInsert(supplier: Supplier): DbInsertSupplier {
    const value = supplier.toValue();
    
    return {
      user_id: value.userId,
      name: value.name,
      email: value.email,
      phone: value.phone,
      notes: value.notes
    };
  }

  /**
   * Convert domain Supplier to database update format
   */
  static toDatabaseUpdate(supplier: Supplier): DbUpdateSupplier {
    const value = supplier.toValue();
    
    return {
      name: value.name,
      email: value.email,
      phone: value.phone,
      notes: value.notes
    };
  }

  /**
   * Convert domain Supplier to database format with ID for full updates
   */
  static toDatabase(supplier: Supplier): DbSupplier {
    const value = supplier.toValue();
    
    return {
      id: value.id,
      user_id: value.userId,
      name: value.name,
      email: value.email,
      phone: value.phone,
      notes: value.notes,
      created_at: value.createdAt.toISOString()
    };
  }

  /**
   * Create array of domain suppliers from database records
   */
  static toDomainArray(dbSuppliers: DbSupplier[]): Supplier[] {
    return dbSuppliers.map(dbSupplier => this.toDomain(dbSupplier));
  }

  /**
   * Create minimal supplier data for autocomplete/selection
   */
  static toSelectOption(dbSupplier: DbSupplier): {
    id: string;
    name: string;
    email: string;
  } {
    return {
      id: dbSupplier.id,
      name: dbSupplier.name,
      email: dbSupplier.email
    };
  }

  /**
   * Create supplier contact info for email generation
   */
  static toContactInfo(dbSupplier: DbSupplier): {
    id: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  } {
    return {
      id: dbSupplier.id,
      name: dbSupplier.name,
      email: dbSupplier.email,
      phone: dbSupplier.phone,
      notes: dbSupplier.notes
    };
  }
}
