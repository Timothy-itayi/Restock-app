import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * CONVEX SCHEMA
 * 
 * Simplified schema for the Restock app
 * No need for complex RLS policies - Clerk handles auth context automatically
 */

export default defineSchema({
  // Users table - stores user profile information
  users: defineTable({
    clerkUserId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.optional(v.string()),
    storeName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Products table - user's restock items
  products: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    defaultQuantity: v.number(),
    defaultSupplierId: v.optional(v.id("suppliers")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_supplier", ["defaultSupplierId"]),

  // Suppliers table - contact information for ordering
  suppliers: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  // Restock sessions - main entity for tracking restocking operations
  restockSessions: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("email_generated"),
      v.literal("sent")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  // Restock items - products and quantities in each session
  restockItems: defineTable({
    sessionId: v.id("restockSessions"),
    userId: v.string(), // Clerk user ID (for easier querying)
    productName: v.string(),
    quantity: v.number(),
    supplierName: v.string(),
    supplierEmail: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_supplier", ["supplierEmail"]),

  // Email tracking - records of emails sent to suppliers
  emailsSent: defineTable({
    sessionId: v.id("restockSessions"),
    userId: v.string(), // Clerk user ID
    supplierEmail: v.string(),
    supplierName: v.string(),
    emailContent: v.string(),
    sentAt: v.number(),
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_supplier", ["supplierEmail"])
    .index("by_status", ["status"]),

  // Audit logs - track important actions for debugging
  auditLogs: defineTable({
    userId: v.string(), // Clerk user ID
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"]),
});
