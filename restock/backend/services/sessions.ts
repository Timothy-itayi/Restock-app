import { supabase, TABLES, SESSION_STATUS } from '../config/supabase';
import type { 
  RestockSession, 
  RestockItem, 
  RestockSessionSupplier,
  RestockSessionProduct,
  InsertRestockSession, 
  InsertRestockItem, 
  InsertRestockSessionSupplier,
  InsertRestockSessionProduct,
  UpdateRestockSession 
} from '../types/database';
import { ProductService } from './products';
import { SupplierService } from './suppliers';

export class SessionService {
  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get a single session with all its items
   */
  static async getSessionWithItems(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select(`
          *,
          restock_items (
            *,
            products (
              id,
              name,
              default_quantity
            ),
            suppliers (
              id,
              name,
              email
            )
          )
        `)
        .eq('id', sessionId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new restock session
   */
  static async createSession(session: InsertRestockSession) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .insert(session)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update session status
   */
  static async updateSession(sessionId: string, updates: UpdateRestockSession) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a session and all its related data
   */
  static async deleteSession(sessionId: string) {
    try {
      // Delete all related data in the correct order
      const { error: itemsError } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .delete()
        .eq('session_id', sessionId);

      if (itemsError) throw itemsError;

      const { error: sessionSuppliersError } = await supabase
        .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
        .delete()
        .eq('restock_session_id', sessionId);

      if (sessionSuppliersError) throw sessionSuppliersError;

      const { error: sessionProductsError } = await supabase
        .from(TABLES.RESTOCK_SESSION_PRODUCTS)
        .delete()
        .eq('restock_session_id', sessionId);

      if (sessionProductsError) throw sessionProductsError;

      // Delete the session
      const { error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .delete()
        .eq('id', sessionId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Add an item to a session
   */
  static async addSessionItem(item: InsertRestockItem) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .insert(item)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity
          ),
          suppliers (
            id,
            name,
            email
          )
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update a session item
   */
  static async updateSessionItem(itemId: string, updates: Partial<RestockItem>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .update(updates)
        .eq('id', itemId)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity
          ),
          suppliers (
            id,
            name,
            email
          )
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Remove an item from a session
   */
  static async removeSessionItem(itemId: string) {
    try {
      console.log(`[SessionService] Removing session item: ${itemId}`);
      
      // First check if the item exists
      const { data: existingItem, error: checkError } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('id')
        .eq('id', itemId)
        .single();

      if (checkError) {
        console.warn(`[SessionService] Item not found or error checking existence: ${itemId}`, checkError);
        // If item doesn't exist, we consider this a successful deletion
        return { error: null };
      }

      console.log(`[SessionService] Item found, proceeding with deletion: ${itemId}`);
      
      const { error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error(`[SessionService] Failed to remove session item: ${itemId}`, error);
      } else {
        console.log(`[SessionService] Successfully removed session item: ${itemId}`);
      }

      return { error };
    } catch (error) {
      console.error(`[SessionService] Exception removing session item: ${itemId}`, error);
      return { error };
    }
  }

  /**
   * Remove an item from a session and clean up unused products/suppliers
   */
  static async removeSessionItemWithCleanup(itemId: string) {
    try {
      console.log(`[SessionService] Removing session item with cleanup: ${itemId}`);
      
      // First get the item details before deletion
      const { data: itemDetails, error: fetchError } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select(`
          id,
          product_id,
          supplier_id,
          products!product_id (
            id,
            name
          ),
          suppliers!supplier_id (
            id,
            name
          )
        `)
        .eq('id', itemId)
        .single();

      if (fetchError) {
        console.warn(`[SessionService] Item not found: ${itemId}`, fetchError);
        return { error: null };
      }

      const productId = itemDetails.product_id;
      const supplierId = itemDetails.supplier_id;
      const productName = (itemDetails.products as any)?.name || 'Unknown Product';
      const supplierName = (itemDetails.suppliers as any)?.name || 'Unknown Supplier';

      console.log(`[SessionService] Item details - Product: ${productName} (${productId}), Supplier: ${supplierName} (${supplierId})`);

      // Remove the session item
      const { error: deleteError } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error(`[SessionService] Failed to remove session item: ${itemId}`, deleteError);
        return { error: deleteError };
      }

      console.log(`[SessionService] Successfully removed session item: ${itemId}`);

      // Check if product is still used in other sessions
      const [productUsageResult, productSessionUsageResult] = await Promise.all([
        ProductService.isProductUsedInSessions(productId),
        ProductService.isProductUsedInSessionProducts(productId)
      ]);

      const isProductUsed = productUsageResult.isUsed || productSessionUsageResult.isUsed;

      console.log(`[SessionService] Product usage check - Used in sessions: ${productUsageResult.isUsed} (${productUsageResult.count}), Used in session products: ${productSessionUsageResult.isUsed} (${productSessionUsageResult.count})`);

      // Delete product if not used elsewhere
      if (!isProductUsed) {
        console.log(`[SessionService] Deleting unused product: ${productName} (${productId})`);
        const { error: productDeleteError } = await ProductService.deleteProduct(productId);
        
        if (productDeleteError) {
          console.error(`[SessionService] Failed to delete product: ${productId}`, productDeleteError);
        } else {
          console.log(`[SessionService] Successfully deleted product: ${productName} (${productId})`);
        }
      } else {
        console.log(`[SessionService] Product still in use, keeping: ${productName} (${productId})`);
      }

      // Check if supplier is still used in other sessions or as default supplier
      const [supplierUsageResult, supplierSessionUsageResult, supplierDefaultResult] = await Promise.all([
        SupplierService.isSupplierUsedInSessions(supplierId),
        SupplierService.isSupplierUsedInSessionSuppliers(supplierId),
        SupplierService.isSupplierUsedAsDefault(supplierId)
      ]);

      const isSupplierUsed = supplierUsageResult.isUsed || supplierSessionUsageResult.isUsed || supplierDefaultResult.isUsed;

      console.log(`[SessionService] Supplier usage check - Used in sessions: ${supplierUsageResult.isUsed} (${supplierUsageResult.count}), Used in session suppliers: ${supplierSessionUsageResult.isUsed} (${supplierSessionUsageResult.count}), Used as default: ${supplierDefaultResult.isUsed} (${supplierDefaultResult.count})`);

      // Delete supplier if not used elsewhere
      if (!isSupplierUsed) {
        console.log(`[SessionService] Deleting unused supplier: ${supplierName} (${supplierId})`);
        const { error: supplierDeleteError } = await SupplierService.deleteSupplier(supplierId);
        
        if (supplierDeleteError) {
          console.error(`[SessionService] Failed to delete supplier: ${supplierId}`, supplierDeleteError);
        } else {
          console.log(`[SessionService] Successfully deleted supplier: ${supplierName} (${supplierId})`);
        }
      } else {
        console.log(`[SessionService] Supplier still in use, keeping: ${supplierName} (${supplierId})`);
      }

      return { error: null };
    } catch (error) {
      console.error(`[SessionService] Exception in removeSessionItemWithCleanup: ${itemId}`, error);
      return { error };
    }
  }

  /**
   * Get session items grouped by supplier
   */
  static async getSessionItemsBySupplier(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity
          ),
          suppliers (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('session_id', sessionId)
        .order('suppliers(name)');

      // Group by supplier
      const groupedItems = data?.reduce((acc: any, item) => {
        const supplierId = item.supplier_id;
        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplier: item.suppliers,
            items: []
          };
        }
        acc[supplierId].items.push(item);
        return acc;
      }, {});

      return { data: groupedItems, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark session as sent
   */
  static async markSessionAsSent(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .update({ status: SESSION_STATUS.SENT })
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add a supplier to a session (using join table)
   */
  static async addSessionSupplier(sessionSupplier: InsertRestockSessionSupplier) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
        .insert(sessionSupplier)
        .select(`
          *,
          suppliers (
            id,
            name,
            email,
            phone
          )
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add a product to a session (using join table)
   */
  static async addSessionProduct(sessionProduct: InsertRestockSessionProduct) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSION_PRODUCTS)
        .insert(sessionProduct)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity,
            default_supplier_id
          )
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get session with all related data using join tables
   */
  static async getSessionWithFullData(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select(`
          *,
          restock_session_suppliers (
            *,
            suppliers (
              id,
              name,
              email,
              phone,
              notes
            )
          ),
          restock_session_products (
            *,
            products (
              id,
              name,
              default_quantity,
              default_supplier_id
            )
          ),
          restock_items (
            *,
            products (
              id,
              name,
              default_quantity
            ),
            suppliers (
              id,
              name,
              email
            )
          )
        `)
        .eq('id', sessionId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all suppliers for a session
   */
  static async getSessionSuppliers(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
        .select(`
          *,
          suppliers (
            id,
            name,
            email,
            phone,
            notes
          )
        `)
        .eq('restock_session_id', sessionId);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all products for a session
   */
  static async getSessionProducts(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSION_PRODUCTS)
        .select(`
          *,
          products (
            id,
            name,
            default_quantity,
            default_supplier_id
          )
        `)
        .eq('restock_session_id', sessionId);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Remove a supplier from a session
   */
  static async removeSessionSupplier(sessionId: string, supplierId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
        .delete()
        .eq('restock_session_id', sessionId)
        .eq('supplier_id', supplierId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Remove a product from a session
   */
  static async removeSessionProduct(sessionId: string, productId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.RESTOCK_SESSION_PRODUCTS)
        .delete()
        .eq('restock_session_id', sessionId)
        .eq('product_id', productId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Check if a session item exists
   */
  static async sessionItemExists(itemId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('id')
        .eq('id', itemId)
        .single();

      return { exists: !!data, error };
    } catch (error) {
      return { exists: false, error };
    }
  }

  /**
   * Get session item count
   */
  static async getSessionItemCount(sessionId: string) {
    try {
      const { count, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      return { count: count || 0, error };
    } catch (error) {
      return { count: 0, error };
    }
  }

  /**
   * Get unfinished sessions with summary data for dashboard
   */
  static async getUnfinishedSessions(userId: string) {
    try {
      console.log(`[SessionService] Getting unfinished sessions for user: ${userId}`);
      
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select(`
          id,
          created_at,
          status,
          restock_items (
            id,
            quantity,
            product_id,
            supplier_id,
            products!product_id (
              id,
              name
            ),
            suppliers!supplier_id (
              id,
              name,
              email
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`[SessionService] Error fetching unfinished sessions:`, error);
        return { data: null, error };
      }

      console.log(`[SessionService] Raw session data:`, JSON.stringify(data, null, 2));

      // Process the data to add summary information
      const processedSessions = data?.map(session => {
        const items = session.restock_items || [];
        const totalItems = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        console.log(`[SessionService] Processing session ${session.id} with ${items.length} items`);
        
        // Get unique suppliers
        const uniqueSuppliers = new Set();
        items.forEach(item => {
          console.log(`[SessionService] Item ${item.id}:`, {
            product_id: item.product_id,
            supplier_id: item.supplier_id,
            products: item.products,
            suppliers: item.suppliers
          });
          
          // Handle both array and object formats
          const suppliers = Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers;
          if (suppliers?.id) {
            uniqueSuppliers.add(suppliers.id);
          }
        });

        // Get unique products
        const uniqueProducts = new Set();
        items.forEach(item => {
          // Handle both array and object formats
          const products = Array.isArray(item.products) ? item.products[0] : item.products;
          if (products?.id) {
            uniqueProducts.add(products.id);
          }
        });

        const processedSession = {
          id: session.id,
          createdAt: session.created_at,
          status: session.status,
          totalItems,
          totalQuantity,
          uniqueSuppliers: uniqueSuppliers.size,
          uniqueProducts: uniqueProducts.size,
          items: items
        };

        console.log(`[SessionService] Processed session:`, {
          id: processedSession.id,
          totalItems: processedSession.totalItems,
          totalQuantity: processedSession.totalQuantity,
          uniqueSuppliers: processedSession.uniqueSuppliers,
          uniqueProducts: processedSession.uniqueProducts,
          items: processedSession.items.map(item => {
            const products = Array.isArray(item.products) ? item.products[0] : item.products;
            const suppliers = Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers;
            return {
              id: item.id,
              quantity: item.quantity,
              productName: products?.name || 'Unknown Product',
              supplierName: suppliers?.name || 'Unknown Supplier'
            };
          })
        });

        return processedSession;
      });

      console.log(`[SessionService] Returning ${processedSessions?.length || 0} processed sessions`);
      return { data: processedSessions, error: null };
    } catch (error) {
      console.error(`[SessionService] Exception in getUnfinishedSessions:`, error);
      return { data: null, error };
    }
  }
} 