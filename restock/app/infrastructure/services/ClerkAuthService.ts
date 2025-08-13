/**
 * INFRASTRUCTURE SERVICE: ClerkAuthService
 * 
 * Authentication adapter that abstracts Clerk authentication concerns
 * Provides clean interface to the domain/application layers
 */

export interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AuthUser | null;
}

/**
 * ClerkAuthService provides authentication abstraction
 * 
 * This service isolates Clerk-specific concerns from the rest of the application
 * Making it easier to swap authentication providers if needed
 */
export class ClerkAuthService {
  private authState: AuthState;

  constructor(authState: AuthState) {
    this.authState = authState;
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return this.authState;
  }

  /**
   * Get current user ID (Clerk user ID)
   */
  getCurrentUserId(): string | null {
    return this.authState.user?.id || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isSignedIn || false;
  }

  /**
   * Check if authentication is loaded
   */
  isAuthLoaded(): boolean {
    return this.authState.isLoaded;
  }

  /**
   * Get current user information
   */
  getCurrentUser(): AuthUser | null {
    return this.authState.user;
  }

  /**
   * Get user email
   */
  getUserEmail(): string | null {
    return this.authState.user?.email || null;
  }

  /**
   * Get user's display name
   */
  getUserDisplayName(): string | null {
    if (!this.authState.user) return null;
    
    // Try different name sources in order of preference
    if (this.authState.user.fullName) return this.authState.user.fullName;
    if (this.authState.user.firstName) {
      if (this.authState.user.lastName) {
        return `${this.authState.user.firstName} ${this.authState.user.lastName}`;
      }
      return this.authState.user.firstName;
    }
    if (this.authState.user.lastName) return this.authState.user.lastName;
    
    return null;
  }

  /**
   * Update authentication state
   */
  updateAuthState(authState: AuthState): void {
    this.authState = authState;
  }

  /**
   * Clear authentication state
   */
  clearAuthState(): void {
    this.authState = {
      isLoaded: false,
      isSignedIn: false,
      user: null
    };
  }

  /**
   * Check if user has completed profile setup
   */
  hasCompletedProfileSetup(): boolean {
    return !!(this.authState.user?.firstName && this.authState.user?.lastName);
  }

  /**
   * Get user's first name
   */
  getFirstName(): string | null {
    return this.authState.user?.firstName || null;
  }

  /**
   * Get user's last name
   */
  getLastName(): string | null {
    return this.authState.user?.lastName || null;
  }

  /**
   * Get user's full name
   */
  getFullName(): string | null {
    return this.authState.user?.fullName || null;
  }

  /**
   * Check if user has email
   */
  hasEmail(): boolean {
    return !!this.authState.user?.email;
  }

  /**
   * Get user's initials (for avatar fallback)
   */
  getUserInitials(): string | null {
    if (!this.authState.user) return null;
    
    const firstName = this.authState.user.firstName || '';
    const lastName = this.authState.user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (lastName) {
      return lastName[0].toUpperCase();
    }
    
    return null;
  }

  /**
   * Check if user profile is complete
   */
  isProfileComplete(): boolean {
    const user = this.authState.user;
    if (!user) return false;
    
    return !!(user.firstName && user.lastName && user.email);
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(): number {
    const user = this.authState.user;
    if (!user) return 0;
    
    let completed = 0;
    const total = 3; // firstName, lastName, email
    
    if (user.firstName) completed++;
    if (user.lastName) completed++;
    if (user.email) completed++;
    
    return Math.round((completed / total) * 100);
  }
}
