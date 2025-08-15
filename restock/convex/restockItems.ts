import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * RESTOCK ITEMS FUNCTIONS
 * 
 * Handles all operations related to restock items within sessions
 * Clerk auth context is automatically available
 */

// Add a new item to a session
export const add = mutation({
  args: {
    sessionId: v.id("restockSessions"),
    productName: v.string(),
    quantity: v.number(),
    supplierName: v.string(),
    supplierEmail: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Verify the session exists and belongs to the user
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    const now = Date.now();

    const itemId = await ctx.db.insert("restockItems", {
      sessionId: args.sessionId,
      userId,
      productName: args.productName,
      quantity: args.quantity,
      supplierName: args.supplierName,
      supplierEmail: args.supplierEmail,
      notes: args.notes,
      createdAt: now,
    });

    // Update session timestamp
    await ctx.db.patch(args.sessionId, {
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "add_item",
      resourceType: "restockItem",
      resourceId: itemId,
      details: `Added ${args.quantity}x ${args.productName} from ${args.supplierName}`,
      timestamp: now,
    });

    return itemId;
  },
});

// Get all items for a specific session
export const listBySession = query({
  args: { sessionId: v.id("restockSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Verify the session exists and belongs to the user
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    return await ctx.db
      .query("restockItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

// Get items grouped by supplier for email generation
export const listBySupplier = query({
  args: { sessionId: v.id("restockSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Verify the session exists and belongs to the user
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    const items = await ctx.db
      .query("restockItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Group items by supplier
    const groupedBySupplier = items.reduce((acc, item) => {
      const key = `${item.supplierEmail}|${item.supplierName}`;
      if (!acc[key]) {
        acc[key] = {
          supplierEmail: item.supplierEmail,
          supplierName: item.supplierName,
          items: [],
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedBySupplier);
  },
});

// Update an existing item
export const update = mutation({
  args: {
    id: v.id("restockItems"),
    productName: v.optional(v.string()),
    quantity: v.optional(v.number()),
    supplierName: v.optional(v.string()),
    supplierEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Verify the item exists and belongs to the user
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }
    if (item.userId !== userId) {
      throw new Error("Access denied");
    }

    const updates: any = {};
    if (args.productName !== undefined) updates.productName = args.productName;
    if (args.quantity !== undefined) updates.quantity = args.quantity;
    if (args.supplierName !== undefined) updates.supplierName = args.supplierName;
    if (args.supplierEmail !== undefined) updates.supplierEmail = args.supplierEmail;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.id, updates);

    // Update session timestamp
    const session = await ctx.db.get(item.sessionId);
    if (session) {
      await ctx.db.patch(item.sessionId, {
        updatedAt: Date.now(),
      });
    }

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "update_item",
      resourceType: "restockItem",
      resourceId: args.id,
      details: `Updated item: ${item.productName}`,
      timestamp: Date.now(),
    });
  },
});

// Remove an item from a session
export const remove = mutation({
  args: { id: v.id("restockItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Verify the item exists and belongs to the user
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }
    if (item.userId !== userId) {
      throw new Error("Access denied");
    }

    // Delete the item
    await ctx.db.delete(args.id);

    // Update session timestamp
    const session = await ctx.db.get(item.sessionId);
    if (session) {
      await ctx.db.patch(item.sessionId, {
        updatedAt: Date.now(),
      });
    }

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "remove_item",
      resourceType: "restockItem",
      resourceId: args.id,
      details: `Removed item: ${item.productName}`,
      timestamp: Date.now(),
    });
  },
});

// Get session summary (total items, suppliers, etc.)
export const getSessionSummary = query({
  args: { sessionId: v.id("restockSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Verify the session exists and belongs to the user
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    const items = await ctx.db
      .query("restockItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueSuppliers = new Set(items.map(item => item.supplierEmail)).size;
    const isEmpty = items.length === 0;
    const canGenerateEmails = !isEmpty && session.status === "draft";
    const canSendEmails = session.status === "email_generated";

    return {
      totalItems,
      totalProducts: items.length,
      supplierCount: uniqueSuppliers,
      status: session.status,
      isEmpty,
      canGenerateEmails,
      canSendEmails,
    };
  },
});
