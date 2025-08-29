/**
 * USE CASE: GenerateEmailsUseCase
 * 
 * Orchestrates email generation for a restock session
 */

import { 
  RestockSession, 
  RestockSessionDomainService,
  SessionRepository,
  SessionNotFoundError,
  type EmailDraft
} from '../../domain';

export interface GenerateEmailsCommand {
  readonly sessionId: string;
  readonly userStoreName?: string;
  readonly userName?: string;
  readonly userEmail?: string;
}

export interface GenerateEmailsResult {
  readonly success: boolean;
  readonly emailDrafts?: ReadonlyArray<EmailDraft>;
  readonly session?: RestockSession;
  readonly error?: string;
}

export class GenerateEmailsUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(command: GenerateEmailsCommand): Promise<GenerateEmailsResult> {
    try {
      // 1. Validate command
      if (!command.sessionId) {
        return {
          success: false,
          error: 'Session ID is required',
        };
      }

      // 2. Load session from repository
      const session = await this.sessionRepository.findById(command.sessionId);
      if (!session) {
        throw new SessionNotFoundError(command.sessionId);
      }

      // 3. Validate session for email generation
      const validation = RestockSessionDomainService.validateSessionForEmailGeneration(session);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join('; '),
        };
      }

      // 4. Generate email drafts using domain service
      const emailDrafts = RestockSessionDomainService.generateEmailDrafts(
        session,
        command.userStoreName,
        command.userName,
        command.userEmail
      );

      // 5. Update session status to indicate emails are generated
      const updatedSession = session.generateEmails();

      // 6. Persist updated session
      await this.sessionRepository.save(updatedSession);

      // 7. Return success result
      return {
        success: true,
        emailDrafts,
        session: updatedSession,
      };

    } catch (error) {
      console.error('GenerateEmailsUseCase failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate emails',
      };
    }
  }
}
