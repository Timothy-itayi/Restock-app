import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * USERS FUNCTIONS
 * 
 * Handles all operations related to user profiles
 * Clerk auth context is automatically available
 */

// Create a new user profile
export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    storeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (existingUser) {
      throw new Error("User profile already exists");
    }

    const userProfileId = await ctx.db.insert("users", {
      clerkUserId: userId,
      email: args.email,
      name: args.name,
      storeName: args.storeName,
      createdAt: now,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "create_user_profile",
      resourceType: "user",
      resourceId: userProfileId,
      details: `Created user profile for ${args.email}`,
      timestamp: now,
    });

    return userProfileId;
  },
});

// Get the current user's profile
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const userProfile = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!userProfile) {
      return null; // User profile doesn't exist yet
    }

    return userProfile;
  },
});

// Update the current user's profile
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    storeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const userProfile = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.storeName !== undefined) updateData.storeName = args.storeName;

    await ctx.db.patch(userProfile._id, updateData);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "update_user_profile",
      resourceType: "user",
      resourceId: userProfile._id,
      details: `Updated user profile`,
      timestamp: now,
    });

    return userProfile._id;
  },
});

// Check if the current user's profile is complete
export const checkProfileCompletion = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const userProfile = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!userProfile) {
      return {
        isComplete: false,
        missingFields: ["profile"],
        message: "User profile not found"
      };
    }

    const missingFields: string[] = [];
    
    if (!userProfile.name) missingFields.push("name");
    if (!userProfile.storeName) missingFields.push("storeName");

    const isComplete = missingFields.length === 0;

    return {
      isComplete,
      missingFields,
      message: isComplete 
        ? "Profile is complete" 
        : `Missing required fields: ${missingFields.join(", ")}`
    };
  },
});

// Get user by email (for admin purposes)
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Only allow users to get their own profile by email
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!currentUser || currentUser.email !== args.email) {
      throw new Error("Access denied");
    }

    return currentUser;
  },
});

// List all users (for admin purposes - only returns current user's data)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Only return the current user's profile for security
    const userProfile = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    return userProfile ? [userProfile] : [];
  },
});

// Delete user profile (for account deletion)
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const userProfile = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    await ctx.db.delete(userProfile._id);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "delete_user_profile",
      resourceType: "user",
      resourceId: userProfile._id,
      details: `Deleted user profile`,
      timestamp: Date.now(),
    });

    return userProfile._id;
  },
});
