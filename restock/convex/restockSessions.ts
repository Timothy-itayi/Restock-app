import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * RESTOCK SESSIONS FUNCTIONS
 * 
 * Handles all operations related to restock sessions
 * Clerk auth context is automatically available
 */

// Create a new restock session
export const create = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    const sessionId = await ctx.db.insert("restockSessions", {
      userId,
      name: args.name || `Restock Session ${new Date().toLocaleDateString()}`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "create_session",
      resourceType: "restockSession",
      resourceId: sessionId,
      details: `Created session: ${args.name || 'Unnamed'}`,
      timestamp: now,
    });

    return sessionId;
  },
});

// Get all sessions for the current user
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("email_generated"),
      v.literal("sent")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    if (args.status) {
      return await ctx.db
        .query("restockSessions")
        .withIndex("by_user_and_status", (q) => 
          q.eq("userId", userId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("restockSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get a specific session by ID
export const get = query({
  args: { id: v.id("restockSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const session = await ctx.db.get(args.id);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    return session;
  },
});

// Update session name
export const updateName = mutation({
  args: {
    id: v.id("restockSessions"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const session = await ctx.db.get(args.id);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "update_session_name",
      resourceType: "restockSession",
      resourceId: args.id,
      details: `Updated name to: ${args.name}`,
      timestamp: Date.now(),
    });
  },
});

// Update session status
export const updateStatus = mutation({
  args: {
    id: v.id("restockSessions"),
    status: v.union(
      v.literal("draft"),
      v.literal("email_generated"),
      v.literal("sent")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const session = await ctx.db.get(args.id);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "sent") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "update_session_status",
      resourceType: "restockSession",
      resourceId: args.id,
      details: `Status changed to: ${args.status}`,
      timestamp: Date.now(),
    });
  },
});

// Delete a session
export const remove = mutation({
  args: { id: v.id("restockSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const session = await ctx.db.get(args.id);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Access denied");
    }

    // Delete all related items first
    const items = await ctx.db
      .query("restockItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete the session
    await ctx.db.delete(args.id);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "delete_session",
      resourceType: "restockSession",
      resourceId: args.id,
      details: `Deleted session: ${session.name}`,
      timestamp: Date.now(),
    });
  },
});
