import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * SUPPLIERS FUNCTIONS
 * 
 * Handles all operations related to suppliers
 * Clerk auth context is automatically available
 */

// Create a new supplier
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    const supplierId = await ctx.db.insert("suppliers", {
      userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "create_supplier",
      resourceType: "supplier",
      resourceId: supplierId,
      details: `Created supplier: ${args.name} (${args.email})`,
      timestamp: now,
    });

    return supplierId;
  },
});

// Get all suppliers for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db
      .query("suppliers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

// Get a specific supplier by ID
export const get = query({
  args: { id: v.id("suppliers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const supplier = await ctx.db.get(args.id);

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    if (supplier.userId !== userId) {
      throw new Error("Access denied");
    }

    return supplier;
  },
});

// Update a supplier
export const update = mutation({
  args: {
    id: v.id("suppliers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const supplier = await ctx.db.get(args.id);

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    if (supplier.userId !== userId) {
      throw new Error("Access denied");
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.email !== undefined) updateData.email = args.email;
    if (args.phone !== undefined) updateData.phone = args.phone;
    if (args.notes !== undefined) updateData.notes = args.notes;

    await ctx.db.patch(args.id, updateData);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "update_supplier",
      resourceType: "supplier",
      resourceId: args.id,
      details: `Updated supplier: ${supplier.name}`,
      timestamp: now,
    });

    return args.id;
  },
});

// Delete a supplier
export const remove = mutation({
  args: { id: v.id("suppliers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const supplier = await ctx.db.get(args.id);

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    if (supplier.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.id);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "delete_supplier",
      resourceType: "supplier",
      resourceId: args.id,
      details: `Deleted supplier: ${supplier.name}`,
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Search suppliers by name or email (for autocomplete)
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

    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Simple search - could be enhanced with full-text search later
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(args.query.toLowerCase()) ||
      supplier.email.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});

// Get supplier by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return suppliers[0] || null;
  },
});
