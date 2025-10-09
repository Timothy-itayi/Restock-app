/**
 * DOMAIN INTERFACE: UserRepository
 * 
 * Defines the contract for user management operations
 * This interface is implemented by infrastructure layer repositories
 */

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  name?: string;
  storeName?: string;
  createdAt: number;
  updatedAt: number;
  // Backward compatibility alias
  userName?: string;
}

export interface CreateUserProfileRequest {
  clerk_id: string;
  email: string;
  name?: string;
  storeName?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  storeName?: string;
}

export interface UserRepository {
  /**
   * Create a new user profile
   */
  createProfile(request: CreateUserProfileRequest): Promise<string>;

  /**
   * Get the current user's profile
   */
  getCurrentProfile(): Promise<UserProfile | null>;

  /**
   * Update the current user's profile
   */
  updateProfile(request: UpdateUserProfileRequest): Promise<string>;

  /**
   * Check if the current user's profile is complete
   */
  checkProfileCompletion(): Promise<{ isComplete: boolean; missingFields: string[] }>;


}
