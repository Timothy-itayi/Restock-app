/**
 * USE CASE: CreateRestockSessionUseCase
 * 
 * Orchestrates domain logic and infrastructure to create a new restock session
 * This represents a complete user operation
 */

import { 
  RestockSession, 
  RestockSessionDomainService,
  SessionRepository 
} from '../../domain';

export interface CreateRestockSessionCommand {
  readonly userId: string;
  readonly name?: string;
}

export interface CreateRestockSessionResult {
  readonly success: boolean;
  readonly session?: RestockSession;
  readonly error?: string;
}

export class CreateRestockSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly idGenerator: () => string // Infrastructure service for generating IDs
  ) {}

  async execute(command: CreateRestockSessionCommand): Promise<CreateRestockSessionResult> {
    try {
      // 1. Validate command
      if (!command.userId) {
        return {
          success: false,
          error: 'User ID is required',
        };
      }

      // 2. Generate unique session ID
      const sessionId = this.idGenerator();

      // 3. Use domain service to create session with business logic
      const session = RestockSessionDomainService.createSession({
        id: sessionId,
        userId: command.userId,
        name: command.name,
      });

      // 4. Persist via repository
      await this.sessionRepository.save(session);

      // 5. Return success result
      return {
        success: true,
        session,
      };

    } catch (error) {
      console.error('CreateRestockSessionUseCase failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
      };
    }
  }
}
