/**
 * USE CASE: GetUserSessionsUseCase
 * 
 * Retrieves and organizes user sessions for display
 */

import { 
  RestockSession, 
  RestockSessionDomainService,
  SessionRepository
} from '../../domain';

export interface GetUserSessionsQuery {
  readonly includeCompleted?: boolean;
  readonly limit?: number;
}

export interface GetUserSessionsResult {
  readonly success: boolean;
  readonly sessions?: {
    readonly draft: ReadonlyArray<RestockSession>;
    readonly emailGenerated: ReadonlyArray<RestockSession>;
    readonly sent: ReadonlyArray<RestockSession>;
    readonly all: ReadonlyArray<RestockSession>;
  };
  readonly error?: string;
}

export class GetUserSessionsUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(query: GetUserSessionsQuery): Promise<GetUserSessionsResult> {
    try {
      // 1. Validate query - no userId needed with RPC functions

      // 2. Load sessions from repository (RPC functions handle user isolation)
      let sessions: ReadonlyArray<RestockSession>;
      
      if (query.includeCompleted) {
        sessions = await this.sessionRepository.findByUserId();
      } else {
        sessions = await this.sessionRepository.findUnfinishedByUserId();
      }

      // 3. Apply limit if specified
      if (query.limit && query.limit > 0) {
        sessions = sessions.slice(0, query.limit);
      }

      // 4. Group sessions by status using domain service
      const groupedSessions = RestockSessionDomainService.groupSessionsByStatus(sessions);

      // 5. Return organized results
      return {
        success: true,
        sessions: {
          ...groupedSessions,
          all: sessions,
        },
      };

    } catch (error) {
      console.error('GetUserSessionsUseCase failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user sessions',
      };
    }
  }
}
