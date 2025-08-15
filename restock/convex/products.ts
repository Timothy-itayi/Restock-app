import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * PRODUCTS FUNCTIONS
 * 
 * Handles all operations related to products
 * Clerk auth context is automatically available
 */

// Create a new product
export const create = mutation({
  args: {
    name: v.string(),
    defaultQuantity: v.number(),
    defaultSupplierId: v.optional(v.id("suppliers")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    const productId = await ctx.db.insert("products", {
      userId,
      name: args.name,
      defaultQuantity: args.defaultQuantity,
      defaultSupplierId: args.defaultSupplierId,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "create_product",
      resourceType: "product",
      resourceId: productId,
      details: `Created product: ${args.name}`,
      timestamp: now,
    });

    return productId;
  },
});

// Get all products for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

// Get a specific product by ID
export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== userId) {
      throw new Error("Access denied");
    }

    return product;
  },
});

// Update a product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    defaultQuantity: v.optional(v.number()),
    defaultSupplierId: v.optional(v.id("suppliers")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== userId) {
      throw new Error("Access denied");
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.defaultQuantity !== undefined) updateData.defaultQuantity = args.defaultQuantity;
    if (args.defaultSupplierId !== undefined) updateData.defaultSupplierId = args.defaultSupplierId;
    if (args.notes !== undefined) updateData.notes = args.notes;

    await ctx.db.patch(args.id, updateData);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "update_product",
      resourceType: "product",
      resourceId: args.id,
      details: `Updated product: ${product.name}`,
      timestamp: now,
    });

    return args.id;
  },
});

// Delete a product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.id);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "delete_product",
      resourceType: "product",
      resourceId: args.id,
      details: `Deleted product: ${product.name}`,
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Search products by name (for autocomplete)
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    if (!args.query.trim()) {
      return [];
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Simple search - could be enhanced with full-text search later
    return products.filter(product =>
      product.name.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});

// Get products by supplier
export const listBySupplier = query({
  args: { supplierId: v.id("suppliers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db
      .query("products")
      .withIndex("by_supplier", (q) => q.eq("defaultSupplierId", args.supplierId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});
