/**
 * USE CASE: UpdateSessionNameUseCase
 * 
 * Updates the name of an existing session or creates a new one if none exists
 * This handles the user experience of renaming sessions while working
 */

import { 
  RestockSession, 
  RestockSessionDomainService,
  SessionRepository 
} from '../../domain';

export interface UpdateSessionNameCommand {
  readonly sessionId?: string; // Optional - if provided, update existing session
  readonly userId: string;
  readonly newName: string;
}

export interface UpdateSessionNameResult {
  readonly success: boolean;
  readonly session?: RestockSession;
  readonly error?: string;
  readonly action: 'updated' | 'created'; // Indicates what action was taken
}

export class UpdateSessionNameUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly idGenerator: () => string
  ) {}

  async execute(command: UpdateSessionNameCommand): Promise<UpdateSessionNameResult> {
    try {
      // 1. Validate command
      if (!command.userId) {
        return {
          success: false,
          error: 'User ID is required',
          action: 'updated'
        };
      }

      if (!command.newName || command.newName.trim() === '') {
        return {
          success: false,
          error: 'Session name cannot be empty',
          action: 'updated'
        };
      }

      // 2. If sessionId is provided, update existing session
      if (command.sessionId) {
        const existingSession = await this.sessionRepository.findById(command.sessionId);
        
        if (!existingSession) {
          return {
            success: false,
            error: `Session with ID ${command.sessionId} not found`,
            action: 'updated'
          };
        }

        // Verify user owns this session
        if (existingSession.userId !== command.userId) {
          return {
            success: false,
            error: 'You can only rename your own sessions',
            action: 'updated'
          };
        }

        // Update the session name
        const updatedSession = existingSession.setName(command.newName.trim());
        await this.sessionRepository.save(updatedSession);

        return {
          success: true,
          session: updatedSession,
          action: 'updated'
        };
      }

      // 3. If no sessionId, create new session (fallback behavior)
      const sessionId = this.idGenerator();
      const newSession = RestockSessionDomainService.createSession({
        id: sessionId,
        userId: command.userId,
        name: command.newName.trim(),
      });

      await this.sessionRepository.save(newSession);

      return {
        success: true,
        session: newSession,
        action: 'created'
      };

    } catch (error) {
      console.error('UpdateSessionNameUseCase failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update session name',
        action: 'updated'
      };
    }
  }
}
