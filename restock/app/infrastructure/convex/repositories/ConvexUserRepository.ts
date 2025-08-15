import { ConvexReactClient } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { 
  UserRepository, 
  UserProfile as DomainUserProfile,
  CreateUserProfileRequest as DomainCreateUserProfileRequest,
  UpdateUserProfileRequest as DomainUpdateUserProfileRequest
} from "../../../domain/interfaces/UserRepository";

/**
 * ConvexUserRepository
 * 
 * Implements user management using Convex functions
 * Maintains clean architecture by implementing domain interface
 * Convex specifics are completely hidden from other layers
 */



export class ConvexUserRepository implements UserRepository {
  constructor(private convexClient: ConvexReactClient) {}

  /**
   * Create a new user profile
   */
  async createProfile(request: DomainCreateUserProfileRequest): Promise<string> {
    return await this.convexClient.mutation(api.users.create, request);
  }

  /**
   * Get the current user's profile
   */
  async getCurrentProfile(): Promise<DomainUserProfile | null> {
    const result = await this.convexClient.query(api.users.get);
    if (!result) return null;
    
    return {
      id: result._id,
      clerkUserId: result.clerkUserId,
      email: result.email,
      name: result.name,
      storeName: result.storeName,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      userName: result.name // Backward compatibility alias
    };
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(request: DomainUpdateUserProfileRequest): Promise<string> {
    return await this.convexClient.mutation(api.users.update, request);
  }

  /**
   * Check if the current user's profile is complete
   */
  async checkProfileCompletion(): Promise<{ isComplete: boolean; missingFields: string[] }> {
    return await this.convexClient.query(api.users.checkProfileCompletion);
  }


}
