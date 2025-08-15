import { ConvexReactClient } from "convex/react";
import { SupplierRepository } from "../../../domain/interfaces/SupplierRepository";
import { Supplier } from "../../../domain/entities/Supplier";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

/**
 * ConvexSupplierRepository
 * 
 * Implements SupplierRepository interface using Convex functions
 * Maintains clean architecture - no React hooks in repository class
 * Convex specifics are completely hidden from other layers
 */
export class ConvexSupplierRepository implements SupplierRepository {
  constructor(private convexClient: ConvexReactClient) {}

  /**
   * Save a supplier (create or update)
   */
  async save(supplier: Supplier): Promise<void> {
    const value = supplier.toValue();
    
    if (supplier.id.startsWith('temp_')) {
      // Create new supplier
      await this.convexClient.mutation(api.suppliers.create, {
        name: value.name,
        email: value.email,
        phone: value.phone,
        notes: value.notes,
      });
    } else {
      // Update existing supplier
      await this.convexClient.mutation(api.suppliers.update, {
        id: supplier.id as Id<"suppliers">,
        name: value.name,
        email: value.email,
        phone: value.phone,
        notes: value.notes,
      });
    }
  }

  /**
   * Find supplier by ID
   */
  async findById(id: string): Promise<Supplier | null> {
    try {
      const convexId = id as Id<"suppliers">;
      const supplierData = await this.convexClient.query(api.suppliers.get, { id: convexId });
      
      if (!supplierData) {
        return null;
      }
      
      // Convert Convex data to domain entity
      return Supplier.fromValue({
        id: supplierData._id,
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        userId: supplierData.userId,
        notes: supplierData.notes,
        createdAt: new Date(supplierData.createdAt),
        updatedAt: supplierData.updatedAt ? new Date(supplierData.updatedAt) : undefined,
      });
    } catch (error) {
      console.error('Error finding supplier by ID:', error);
      return null;
    }
  }

  /**
   * Find all suppliers for a user
   */
  async findByUserId(userId: string): Promise<ReadonlyArray<Supplier>> {
    try {
      const suppliersData = await this.convexClient.query(api.suppliers.list, {});
      
      return suppliersData
        .filter(supplier => supplier.userId === userId)
        .map(supplier => Supplier.fromValue({
          id: supplier._id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          userId: supplier.userId,
          notes: supplier.notes,
          createdAt: new Date(supplier.createdAt),
          updatedAt: supplier.updatedAt ? new Date(supplier.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding suppliers by user ID:', error);
      return [];
    }
  }

  /**
   * Delete a supplier
   */
  async delete(id: string): Promise<void> {
    try {
      const convexId = id as Id<"suppliers">;
      await this.convexClient.mutation(api.suppliers.remove, { id: convexId });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }

  /**
   * Find supplier by email
   */
  async findByEmail(email: string): Promise<Supplier | null> {
    try {
      const suppliersData = await this.convexClient.query(api.suppliers.list, {});
      const supplierData = suppliersData.find(supplier => supplier.email === email);
      
      if (!supplierData) {
        return null;
      }
      
      return Supplier.fromValue({
        id: supplierData._id,
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        userId: supplierData.userId,
        notes: supplierData.notes,
        createdAt: new Date(supplierData.createdAt),
        updatedAt: supplierData.updatedAt ? new Date(supplierData.updatedAt) : undefined,
      });
    } catch (error) {
      console.error('Error finding supplier by email:', error);
      return null;
    }
  }

  /**
   * Search suppliers for a user
   */
  async search(userId: string, searchTerm: string): Promise<ReadonlyArray<Supplier>> {
    try {
      const suppliersData = await this.convexClient.query(api.suppliers.search, { query: searchTerm });
      
      return suppliersData
        .filter(supplier => supplier.userId === userId)
        .map(supplier => Supplier.fromValue({
          id: supplier._id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          userId: supplier.userId,
          notes: supplier.notes,
          createdAt: new Date(supplier.createdAt),
          updatedAt: supplier.updatedAt ? new Date(supplier.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error searching suppliers:', error);
      return [];
    }
  }

  /**
   * Count suppliers for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      const suppliersData = await this.convexClient.query(api.suppliers.list, {});
      return suppliersData.filter(supplier => supplier.userId === userId).length;
    } catch (error) {
      console.error('Error counting suppliers:', error);
      return 0;
    }
  }

  /**
   * Find most used suppliers for a user
   */
  async findMostUsed(userId: string, limit: number): Promise<ReadonlyArray<Supplier>> {
    try {
      const suppliersData = await this.convexClient.query(api.suppliers.list, {});
      
      return suppliersData
        .filter(supplier => supplier.userId === userId)
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, limit)
        .map(supplier => Supplier.fromValue({
          id: supplier._id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          userId: supplier.userId,
          notes: supplier.notes,
          createdAt: new Date(supplier.createdAt),
          updatedAt: supplier.updatedAt ? new Date(supplier.updatedAt) : undefined,
        }));
    } catch (error) {
      console.error('Error finding most used suppliers:', error);
      return [];
    }
  }
}
