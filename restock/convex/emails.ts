import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * EMAILS FUNCTIONS
 * 
 * Replaces Supabase edge functions for email management
 * Clerk auth context is automatically available
 */

// Create an email record
export const create = mutation({
  args: {
    sessionId: v.id("restockSessions"),
    supplierEmail: v.string(),
    supplierName: v.string(),
    emailContent: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Verify the session belongs to the user
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Access denied");
    }

    const emailId = await ctx.db.insert("emailsSent", {
      sessionId: args.sessionId,
      userId,
      supplierEmail: args.supplierEmail,
      supplierName: args.supplierName,
      emailContent: args.emailContent,
      sentAt: now,
      status: "sent",
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "create_email",
      resourceType: "email",
      resourceId: emailId,
      details: `Created email to ${args.supplierName} (${args.supplierEmail})`,
      timestamp: now,
    });

    return emailId;
  },
});

// Update email delivery status
export const updateStatus = mutation({
  args: {
    id: v.id("emailsSent"),
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const email = await ctx.db.get(args.id);

    if (!email || email.userId !== userId) {
      throw new Error("Access denied");
    }

    const updateData: any = { status: args.status };
    if (args.errorMessage !== undefined) {
      updateData.errorMessage = args.errorMessage;
    }

    await ctx.db.patch(args.id, updateData);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "update_email_status",
      resourceType: "email",
      resourceId: args.id,
      details: `Updated email status to ${args.status}`,
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// List emails by session
export const listBySession = query({
  args: { sessionId: v.id("restockSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify the session belongs to the user
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Access denied");
    }

    return await ctx.db
      .query("emailsSent")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
  },
});

// Get email analytics for the current user
export const getAnalytics = query({
  args: {
    days: v.optional(v.number()), // Number of days to look back
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const daysBack = args.days || 30;
    const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);

    const emails = await ctx.db
      .query("emailsSent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("sentAt"), cutoffTime))
      .collect();

    // Calculate analytics
    const totalEmails = emails.length;
    const deliveredEmails = emails.filter(e => e.status === "delivered").length;
    const failedEmails = emails.filter(e => e.status === "failed").length;
    const pendingEmails = emails.filter(e => e.status === "sent").length;

    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails) * 100 : 0;
    const failureRate = totalEmails > 0 ? (failedEmails / totalEmails) * 100 : 0;

    // Group by supplier
    const supplierStats = emails.reduce((acc, email) => {
      if (!acc[email.supplierEmail]) {
        acc[email.supplierEmail] = {
          name: email.supplierName,
          email: email.supplierEmail,
          total: 0,
          delivered: 0,
          failed: 0,
          pending: 0,
        };
      }
      
      acc[email.supplierEmail].total++;
      acc[email.supplierEmail][email.status]++;
      
      return acc;
    }, {} as Record<string, any>);

    return {
      summary: {
        totalEmails,
        deliveredEmails,
        failedEmails,
        pendingEmails,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
      },
      supplierStats: Object.values(supplierStats),
      timeRange: `${daysBack} days`,
    };
  },
});

// Get emails by status
export const listByStatus = query({
  args: { 
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db
      .query("emailsSent")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// Get failed emails for retry
export const getFailedEmails = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db
      .query("emailsSent")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// Bulk update email statuses (for webhook processing)
export const bulkUpdateStatus = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("emailsSent"),
      status: v.union(
        v.literal("sent"),
        v.literal("delivered"),
        v.literal("failed")
      ),
      errorMessage: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();
    const results = [];

    for (const update of args.updates) {
      const email = await ctx.db.get(update.id);
      
      if (email && email.userId === userId) {
        const updateData: any = { status: update.status };
        if (update.errorMessage !== undefined) {
          updateData.errorMessage = update.errorMessage;
        }

        await ctx.db.patch(update.id, updateData);
        results.push({ id: update.id, success: true });
      } else {
        results.push({ id: update.id, success: false, error: "Access denied or not found" });
      }
    }

    // Create audit log for bulk operation
    if (results.length > 0) {
      await ctx.db.insert("auditLogs", {
        userId,
        action: "bulk_update_email_status",
        resourceType: "email",
        details: `Bulk updated ${results.filter(r => r.success).length} emails`,
        timestamp: now,
      });
    }

    return results;
  },
});
