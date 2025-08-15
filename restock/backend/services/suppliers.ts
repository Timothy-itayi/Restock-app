import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Initialize Convex client for backend usage
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export class SupplierService {
  /**
   * Get all suppliers for a user
   */
  static async getUserSuppliers(userId: string) {
    try {
      const suppliers = await convex.query(api.suppliers.list);
      return { data: suppliers, error: null };
    } catch (error) {
      console.error('[SupplierService] Error getting user suppliers', { error, userId });
      return { data: null, error };
    }
  }

  /**
   * Get a single supplier by ID
   */
  static async getSupplier(supplierId: string) {
    try {
      const supplier = await convex.query(api.suppliers.get, { id: supplierId as Id<"suppliers"> });
      return { data: supplier, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new supplier
   */
  static async createSupplier(supplier: any) {
    if (!supplier.user_id) {
      return { data: null, error: new Error('User ID is required to create a supplier') };
    }

    try {
      const supplierId = await convex.mutation(api.suppliers.create, {
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        notes: supplier.notes
      });

      return { data: { id: supplierId }, error: null };
    } catch (error) {
      console.error('[SupplierService] Error creating supplier', { error, userId: supplier.user_id });
      return { data: null, error };
    }
  }

  /**
   * Update an existing supplier
   */
  static async updateSupplier(supplierId: string, updates: any) {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const updatedId = await convex.mutation(api.suppliers.update, {
        id: supplierId as Id<"suppliers">,
        ...updateData
      });

      return { data: { id: updatedId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a supplier
   */
  static async deleteSupplier(supplierId: string) {
    try {
      await convex.mutation(api.suppliers.remove, { id: supplierId as Id<"suppliers"> });
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Search suppliers by name or email
   */
  static async searchSuppliers(query: string) {
    try {
      const suppliers = await convex.query(api.suppliers.search, { query });
      return { data: suppliers, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get supplier by email
   */
  static async getSupplierByEmail(email: string) {
    try {
      const supplier = await convex.query(api.suppliers.getByEmail, { email });
      return { data: supplier, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Check if supplier is used in sessions
   */
  static async isSupplierUsedInSessions(supplierId: string) {
    try {
      // This would need to be implemented in Convex if needed
      // For now, return false to avoid complexity
      return { isUsed: false, count: 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if supplier is used in session suppliers
   */
  static async isSupplierUsedInSessionSuppliers(supplierId: string) {
    try {
      // This would need to be implemented in Convex if needed
      // For now, return false to avoid complexity
      return { isUsed: false, count: 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }

  /**
   * Check if supplier is used as default supplier
   */
  static async isSupplierUsedAsDefault(supplierId: string) {
    try {
      // This would need to be implemented in Convex if needed
      // For now, return false to avoid complexity
      return { isUsed: false, count: 0, error: null };
    } catch (error) {
      return { isUsed: false, count: 0, error };
    }
  }
} 