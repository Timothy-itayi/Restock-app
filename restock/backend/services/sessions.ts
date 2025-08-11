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
   * Add an item to a session with proper junction table management and restock_items storage
   */
  static async addSessionItem(item: InsertRestockItem) {
    try {
      console.log('[SessionService] Adding session item with fixed FK constraint:', {
        sessionId: item.session_id,
        productId: item.product_id,
        supplierId: item.supplier_id,
        quantity: item.quantity
      });

      // Validate that supplier exists and get full supplier data
      const supplierResult = await supabase
        .from(TABLES.SUPPLIERS)
        .select('*')
        .eq('id', item.supplier_id)
        .single();
      
      if (supplierResult.error) {
        console.error('[SessionService] Supplier validation failed:', supplierResult.error);
        return { data: null, error: new Error(`Supplier ${item.supplier_id} not found`) };
      }

      // Validate that product exists
      const productResult = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('id', item.product_id)
        .single();
      
      if (productResult.error) {
        console.error('[SessionService] Product validation failed:', productResult.error);
        return { data: null, error: new Error(`Product ${item.product_id} not found`) };
      }

      // 1. Add to restock_session_suppliers if not already exists
      const existingSessionSupplier = await supabase
        .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
        .select('id')
        .eq('restock_session_id', item.session_id)
        .eq('supplier_id', item.supplier_id)
        .maybeSingle();

      if (!existingSessionSupplier.data) {
        console.log('[SessionService] Adding supplier to session suppliers table');
        const sessionSupplierResult = await supabase
          .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
          .insert({
            restock_session_id: item.session_id,
            supplier_id: item.supplier_id
          });
        
        if (sessionSupplierResult.error) {
          console.error('[SessionService] Failed to add session supplier:', sessionSupplierResult.error);
          return { data: null, error: sessionSupplierResult.error };
        }
      }

      // 2. Add to restock_session_products if not already exists
      const existingSessionProduct = await supabase
        .from(TABLES.RESTOCK_SESSION_PRODUCTS)
        .select('id')
        .eq('restock_session_id', item.session_id)
        .eq('product_id', item.product_id)
        .maybeSingle();

      if (!existingSessionProduct.data) {
        console.log('[SessionService] Adding product to session products table');
        const sessionProductResult = await supabase
          .from(TABLES.RESTOCK_SESSION_PRODUCTS)
          .insert({
            restock_session_id: item.session_id,
            product_id: item.product_id,
            quantity: item.quantity
          });
        
        if (sessionProductResult.error) {
          console.error('[SessionService] Failed to add session product:', sessionProductResult.error);
          return { data: null, error: sessionProductResult.error };
        }
      } else {
        // Update quantity in session products if it already exists
        console.log('[SessionService] Updating quantity in session products table');
        const updateResult = await supabase
          .from(TABLES.RESTOCK_SESSION_PRODUCTS)
          .update({ quantity: item.quantity })
          .eq('id', existingSessionProduct.data.id);
        
        if (updateResult.error) {
          console.error('[SessionService] Failed to update session product:', updateResult.error);
          return { data: null, error: updateResult.error };
        }
      }

      // 3. Add to restock_items (now with fixed FK constraint)
      console.log('[SessionService] Adding to restock_items table (FK constraint fixed)');
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .insert(item)
        .select('*')
        .single();

      if (error) {
        console.error('[SessionService] Failed to insert into restock_items:', error);
        return { data: null, error };
      }

      // Enrich with product and supplier data
      const enriched = {
        ...data,
        products: productResult.data,
        suppliers: supplierResult.data,
      };

      console.log('[SessionService] Successfully added session item with all tables:', {
        itemId: data.id,
        productName: productResult.data?.name,
        supplierName: supplierResult.data?.name
      });

      return { data: enriched, error: null };
    } catch (error) {
      console.error('[SessionService] Unexpected error adding session item:', error);
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
        .select('*')
        .single();

      if (error) return { data: null, error };

      const [{ data: prod }, { data: supp }] = await Promise.all([
        data?.product_id ? supabase.from(TABLES.PRODUCTS).select('id,name,default_quantity').eq('id', data.product_id).maybeSingle() : Promise.resolve({ data: null } as any),
        data?.supplier_id ? supabase.from(TABLES.SUPPLIERS).select('id,name,email').eq('id', data.supplier_id).maybeSingle() : Promise.resolve({ data: null } as any),
      ]);

      const enriched = { ...data, products: prod, suppliers: supp };
      return { data: enriched, error: null };
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
   * Remove an item from a session and clean up unused products/suppliers (using proper restock_items table)
   */
  static async removeSessionItemWithCleanup(itemId: string) {
    try {
      console.log(`[SessionService] Removing session item with cleanup: ${itemId}`);
      
      // Get the item details before deletion from restock_items table
      const { data: itemDetails, error: fetchError } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('id, session_id, product_id, supplier_id')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        console.warn(`[SessionService] Item not found: ${itemId}`, fetchError);
        return { error: null };
      }

      const productId = itemDetails.product_id;
      const supplierId = itemDetails.supplier_id;
      const sessionId = itemDetails.session_id;

      // Get product and supplier names for logging
      const [{ data: prod }, { data: supp }] = await Promise.all([
        productId ? supabase.from(TABLES.PRODUCTS).select('id,name').eq('id', productId).maybeSingle() : Promise.resolve({ data: null } as any),
        supplierId ? supabase.from(TABLES.SUPPLIERS).select('id,name').eq('id', supplierId).maybeSingle() : Promise.resolve({ data: null } as any),
      ]);

      const productName = (prod as any)?.name || 'Unknown Product';
      const supplierName = (supp as any)?.name || 'Unknown Supplier';

      console.log(`[SessionService] Item details - Product: ${productName} (${productId}), Supplier: ${supplierName} (${supplierId})`);

      // Remove the restock item
      const { error: deleteError } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error(`[SessionService] Failed to remove restock item: ${itemId}`, deleteError);
        return { error: deleteError };
      }

      console.log(`[SessionService] Successfully removed restock item: ${itemId}`);

      // Check if this was the last item from this supplier in the session
      const { data: remainingItemsFromSupplier } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('id')
        .eq('session_id', sessionId)
        .eq('supplier_id', supplierId);

      // If no more items from this supplier, remove from session suppliers
      if (!remainingItemsFromSupplier || remainingItemsFromSupplier.length === 0) {
        console.log(`[SessionService] Removing supplier ${supplierName} from session ${sessionId}`);
        await supabase
          .from(TABLES.RESTOCK_SESSION_SUPPLIERS)
          .delete()
          .eq('restock_session_id', sessionId)
          .eq('supplier_id', supplierId);
      }

      // Check if this was the last item of this product in the session
      const { data: remainingItemsOfProduct } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('id')
        .eq('session_id', sessionId)
        .eq('product_id', productId);

      // If no more items of this product, remove from session products
      if (!remainingItemsOfProduct || remainingItemsOfProduct.length === 0) {
        console.log(`[SessionService] Removing product ${productName} from session ${sessionId}`);
        await supabase
          .from(TABLES.RESTOCK_SESSION_PRODUCTS)
          .delete()
          .eq('restock_session_id', sessionId)
          .eq('product_id', productId);
      }

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
      // Load items without FK embeds
      const { data: items, error } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('id, session_id, product_id, supplier_id, quantity')
        .eq('session_id', sessionId);

      if (error) return { data: null, error };

      const productIds = Array.from(new Set((items || []).map((it: any) => it.product_id).filter(Boolean)));
      const supplierIds = Array.from(new Set((items || []).map((it: any) => it.supplier_id).filter(Boolean)));

      const [productsRes, suppliersRes] = await Promise.all([
        productIds.length > 0
          ? supabase.from(TABLES.PRODUCTS).select('id,name,default_quantity').in('id', productIds)
          : Promise.resolve({ data: [] } as any),
        supplierIds.length > 0
          ? supabase.from(TABLES.SUPPLIERS).select('id,name,email,phone').in('id', supplierIds)
          : Promise.resolve({ data: [] } as any),
      ]);

      const productMap = new Map<string, any>((productsRes.data || []).map((p: any) => [p.id, p]));
      const supplierMap = new Map<string, any>((suppliersRes.data || []).map((s: any) => [s.id, s]));

      // Group by supplier
      const groupedItems = (items || []).reduce((acc: any, it: any) => {
        const supplierId = it.supplier_id;
        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplier: supplierMap.get(supplierId) || null,
            items: []
          };
        }
        acc[supplierId].items.push({
          ...it,
          products: productMap.get(it.product_id) || null,
          suppliers: supplierMap.get(it.supplier_id) || null,
        });
        return acc;
      }, {} as Record<string, any>);

      return { data: groupedItems, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark session as sent
   */
  static async markSessionAsSent(sessionId: string) {
    try {
      console.log(`[SessionService] Marking session as sent: ${sessionId}`);
      
      // First verify the session exists and get its current status
      const { data: existingSession, error: fetchError } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select('id, status, user_id')
        .eq('id', sessionId)
        .single();
        
      if (fetchError) {
        console.error(`[SessionService] Failed to fetch session before update: ${sessionId}`, fetchError);
        return { data: null, error: fetchError };
      }
      
      console.log(`[SessionService] Session ${sessionId} current status: ${existingSession.status}`);
      
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .update({ 
          status: SESSION_STATUS.SENT
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error(`[SessionService] Failed to mark session as sent: ${sessionId}`, error);
        return { data: null, error };
      }
      
      console.log(`[SessionService] Successfully marked session as sent: ${sessionId}`, {
        oldStatus: existingSession.status,
        newStatus: data.status,
        timestamp: new Date().toISOString()
      });

      return { data, error: null };
    } catch (error) {
      console.error(`[SessionService] Exception marking session as sent: ${sessionId}`, error);
      return { data: null, error };
    }
  }

  /**
   * Get finished/completed sessions for a user (sent status)
   */
  static async getFinishedSessions(userId: string) {
    try {
      console.log(`[SessionService] Getting finished sessions for user: ${userId}`);
      const { data, error } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select(`
          id,
          name,
          created_at,
          status,
          user_id,
          restock_items (
            id,
            quantity,
            products (
              id,
              name
            ),
            suppliers (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', SESSION_STATUS.SENT)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to recent 20 finished sessions

      if (error) {
        console.error(`[SessionService] Error fetching finished sessions for user ${userId}:`, error);
        return { data: null, error };
      }

      console.log(`[SessionService] Found ${data?.length || 0} finished sessions for user ${userId}`);

      // Transform the data to match the expected format
      const transformedData = data?.map(session => ({
        id: session.id,
        name: session.name,
        createdAt: session.created_at,
        status: session.status,
        totalItems: session.restock_items?.length || 0,
        totalQuantity: session.restock_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0,
        uniqueSuppliers: new Set(session.restock_items?.map((item: any) => item.suppliers?.id)).size || 0,
        uniqueProducts: new Set(session.restock_items?.map((item: any) => item.products?.id)).size || 0,
        items: session.restock_items || []
      }));

      console.log(`[SessionService] Returning ${transformedData?.length || 0} transformed finished sessions:`,
        transformedData?.map(s => ({ id: s.id, status: s.status, items: s.totalItems })) || []);
      
      return { data: transformedData, error: null };
    } catch (error) {
      console.error(`[SessionService] Exception getting finished sessions for user ${userId}:`, error);
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
   * Get unfinished sessions with summary data for dashboard (using proper restock_items table)
   */
  static async getUnfinishedSessions(userId: string) {
    try {
      console.log(`[SessionService] Getting unfinished sessions for user with fixed FK: ${userId}`);
      // 1) Fetch sessions only (no nested selects) - include both draft AND email_generated statuses
      const { data: sessions, error: sessionsErr } = await supabase
        .from(TABLES.RESTOCK_SESSIONS)
        .select('id, name, created_at, status')
        .eq('user_id', userId)
        .in('status', [SESSION_STATUS.DRAFT, SESSION_STATUS.EMAIL_GENERATED])
        .order('created_at', { ascending: false });

      if (sessionsErr) {
        console.error(`[SessionService] Error fetching unfinished sessions:`, sessionsErr);
        return { data: null, error: sessionsErr };
      }

      if (!sessions || sessions.length === 0) {
        console.log(`[SessionService] No unfinished sessions found for user ${userId}`);
        return { data: [], error: null };
      }
      
      console.log(`[SessionService] Found ${sessions.length} unfinished sessions:`, 
        sessions.map(s => ({ id: s.id, status: s.status, name: s.name })));

      // 2) Fetch items from restock_items table (now with fixed FK constraint)
      const sessionIds = sessions.map(s => s.id);
      const { data: items, error: itemsErr } = await supabase
        .from(TABLES.RESTOCK_ITEMS)
        .select('id, session_id, quantity, product_id, supplier_id')
        .in('session_id', sessionIds);

      if (itemsErr) {
        console.error('[SessionService] Error fetching restock items:', itemsErr);
        return { data: null, error: itemsErr };
      }

      // 3) Collect product/supplier ids
      const allItems = items || [];
      const productIdsSet = new Set<string>();
      const supplierIdsSet = new Set<string>();
      allItems.forEach((item: any) => {
        if (item.product_id) productIdsSet.add(item.product_id);
        if (item.supplier_id) supplierIdsSet.add(item.supplier_id);
      });

      const productIds = Array.from(productIdsSet);
      const supplierIds = Array.from(supplierIdsSet);

      // Fetch products and suppliers in bulk and build maps
      const [productsResult, suppliersResult] = await Promise.all([
        productIds.length > 0
          ? supabase.from(TABLES.PRODUCTS).select('id,name').in('id', productIds)
          : Promise.resolve({ data: [], error: null } as any),
        supplierIds.length > 0
          ? supabase.from(TABLES.SUPPLIERS).select('id,name,email').in('id', supplierIds)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      if (productsResult.error || suppliersResult.error) {
        console.warn('[SessionService] Warning: product/supplier lookup had errors', {
          productsError: productsResult.error,
          suppliersError: suppliersResult.error,
        });
      }

      const productMap = new Map<string, any>((productsResult.data || []).map((p: any) => [p.id, p]));
      const supplierMap = new Map<string, any>((suppliersResult.data || []).map((s: any) => [s.id, s]));

      // Process the data to add summary information
      const itemsBySession: Record<string, any[]> = {};
      for (const it of allItems) {
        if (!itemsBySession[it.session_id]) itemsBySession[it.session_id] = [];
        itemsBySession[it.session_id].push(it);
      }

      const processedSessions = sessions?.map(session => {
        const itemsForSession = itemsBySession[session.id] || [];
        const totalItems = itemsForSession.length;
        const totalQuantity = itemsForSession.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        console.log(`[SessionService] Processing session ${session.id} with ${itemsForSession.length} items`);
        
        // Resolve supplier/product details
        const itemsWithDetails = itemsForSession.map((item: any) => {
          const prod = productMap.get(item.product_id);
          const supp = supplierMap.get(item.supplier_id);
          return {
            ...item,
            products: prod ? { id: prod.id, name: prod.name } : null,
            suppliers: supp ? { id: supp.id, name: supp.name, email: supp.email } : null,
          };
        });

        // Unique supplier/product counts
        const uniqueSuppliers = new Set(itemsForSession.map((it: any) => it.supplier_id).filter(Boolean));
        const uniqueProducts = new Set(itemsForSession.map((it: any) => it.product_id).filter(Boolean));

        const processedSession = {
          id: session.id,
          name: session.name,
          createdAt: session.created_at,
          status: session.status,
          totalItems,
          totalQuantity,
          uniqueSuppliers: uniqueSuppliers.size,
          uniqueProducts: uniqueProducts.size,
          items: itemsWithDetails
        };

        console.log(`[SessionService] Processed session with restock_items table:`, {
          id: processedSession.id,
          totalItems: processedSession.totalItems,
          totalQuantity: processedSession.totalQuantity,
          uniqueSuppliers: processedSession.uniqueSuppliers,
          uniqueProducts: processedSession.uniqueProducts,
          items: processedSession.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            productName: (item.products as any)?.name || 'Unknown Product',
            supplierName: (item.suppliers as any)?.name || 'Unknown Supplier'
          }))
        });

        return processedSession;
      });

      console.log(`[SessionService] Returning ${processedSessions?.length || 0} processed sessions with fixed FK`);
      return { data: processedSessions, error: null };
    } catch (error) {
      console.error(`[SessionService] Exception in getUnfinishedSessions:`, error);
      return { data: null, error };
    }
  }
} 