// /**
//  * INFRASTRUCTURE REPOSITORY: ClerkSessionRepository
//  * 
//  * Handles restock session data persistence using Clerk user context
//  * Replaces SupabaseSessionRepository for Convex-based architecture
//  */

// import { SessionRepository } from '../../domain/interfaces/SessionRepository';
// import { RestockSession } from '../../domain/entities/RestockSession';
// import { UserContextService } from '../services/UserContextService';

// export class ClerkSessionRepository implements SessionRepository {
//   private userContextService: UserContextService;

//   constructor(userContextService: UserContextService) {
//     this.userContextService = userContextService;
//   }

//   /**
//    * Get all sessions for the current user
//    */
//   async getAll(): Promise<RestockSession[]> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Getting all sessions for user:', userId);
      
//       // This will be replaced with Convex hooks in components
//       return [];
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error getting all sessions:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get a session by ID
//    */
//   async getById(id: string): Promise<RestockSession | null> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Getting session by ID:', id, 'for user:', userId);
      
//       // This will be replaced with Convex hooks in components
//       return null;
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error getting session by ID:', error);
//       throw error;
//     }
//   }

//   /**
//    * Create a new session
//    */
//   async create(session: Omit<RestockSession, 'id'>): Promise<RestockSession> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Creating session for user:', userId, session);
      
//       // This will be replaced with Convex mutations in components
//       const newSession: RestockSession = {
//         ...session,
//         id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
//       };

//       return newSession;
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error creating session:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update an existing session
//    */
//   async update(id: string, updates: Partial<RestockSession>): Promise<RestockSession> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Updating session:', id, 'for user:', userId, updates);
      
//       // This will be replaced with Convex mutations in components
//       throw new Error('Update not implemented - use Convex hooks instead');
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error updating session:', error);
//       throw error;
//     }
//   }

//   /**
//    * Delete a session
//    */
//   async delete(id: string): Promise<void> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Deleting session:', id, 'for user:', userId);
      
//       // This will be replaced with Convex mutations in components
//       throw new Error('Delete not implemented - use Convex hooks instead');
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error deleting session:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get sessions by status
//    */
//   async getByStatus(status: string): Promise<RestockSession[]> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Getting sessions by status:', status, 'for user:', userId);
      
//       // This will be replaced with Convex hooks in components
//       return [];
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error getting sessions by status:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get active sessions (draft or email_generated)
//    */
//   async getActive(): Promise<RestockSession[]> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Getting active sessions for user:', userId);
      
//       // This will be replaced with Convex hooks in components
//       return [];
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error getting active sessions:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get completed sessions
//    */
//   async getCompleted(): Promise<RestockSession[]> {
//     try {
//       const userId = await this.userContextService.getCurrentUserId();
//       if (!userId) {
//         throw new Error('User not authenticated');
//       }

//       console.log('[ClerkSessionRepository] Getting completed sessions for user:', userId);
      
//       // This will be replaced with Convex hooks in components
//       return [];
//     } catch (error) {
//       console.error('[ClerkSessionRepository] Error getting completed sessions:', error);
//       throw error;
//     }
//   }
// }
