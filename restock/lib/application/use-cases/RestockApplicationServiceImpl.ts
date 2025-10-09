/**
 * APPLICATION SERVICE IMPLEMENTATION: RestockApplicationServiceImpl
 * 
 * Implements the RestockApplicationService interface
 * Coordinates multiple use cases to provide high-level operations
 */

import {
  RestockApplicationService,
  CreateSessionCommand,
  AddProductCommand,
  AddItemCommand,
  GenerateEmailsCommand,
  GetSessionsQuery,
  SessionResult,
  EmailsResult,
  SessionsResult,
} from '../_interfaces/RestockApplicationService';

import {
  RestockSession,
  RestockSessionDomainService,
  SessionRepository,
  ProductRepository,
  SupplierRepository,
  SessionNotFoundError,
} from '../../_domain';

import { CreateRestockSessionUseCase } from './CreateRestockSessionUseCase';
import { AddProductToSessionUseCase } from './AddProductToSessionUseCase';
import { AddItemToSessionUseCase } from './AddItemToSessionUseCase';
import { GenerateEmailsUseCase } from './GenerateEmailsUseCase';
import { GetUserSessionsUseCase } from './GetUserSessionsUseCase';
import { UpdateSessionNameUseCase } from './UpdateSessionNameUseCase';

export class RestockApplicationServiceImpl implements RestockApplicationService {
  private readonly createSessionUseCase: CreateRestockSessionUseCase;
  private readonly addProductUseCase: AddProductToSessionUseCase;
  private readonly addItemUseCase: AddItemToSessionUseCase;
  private readonly generateEmailsUseCase: GenerateEmailsUseCase;
  private readonly getUserSessionsUseCase: GetUserSessionsUseCase;
  private readonly updateSessionNameUseCase: UpdateSessionNameUseCase;

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly productRepository: ProductRepository,
    private readonly supplierRepository: SupplierRepository,
    private readonly idGenerator: () => string
  ) {
    // Initialize use cases with their dependencies
    this.createSessionUseCase = new CreateRestockSessionUseCase(
      sessionRepository,
      idGenerator
    );
    
    this.addProductUseCase = new AddProductToSessionUseCase(
      sessionRepository,
      productRepository,
      supplierRepository
    );
    
    this.addItemUseCase = new AddItemToSessionUseCase(
      sessionRepository,
      productRepository,
      supplierRepository
    );
    
    this.generateEmailsUseCase = new GenerateEmailsUseCase(
      sessionRepository
    );
    
    this.getUserSessionsUseCase = new GetUserSessionsUseCase(
      sessionRepository
    );
    
    this.updateSessionNameUseCase = new UpdateSessionNameUseCase(
      sessionRepository,
      idGenerator
    );
  }

  // Session management
  async createSession(command: CreateSessionCommand): Promise<SessionResult> {
    return await this.createSessionUseCase.execute(command);
  }

  async getSession(sessionId: string): Promise<SessionResult> {
    try {
      const session = await this.sessionRepository.findById(sessionId);
      
      if (!session) {
        return {
          success: false,
          error: `Session with ID ${sessionId} not found`,
        };
      }

      return {
        success: true,
        session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session',
      };
    }
  }

  async getSessions(query: GetSessionsQuery): Promise<SessionsResult> {
    return await this.getUserSessionsUseCase.execute(query);
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sessionRepository.delete(sessionId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete session',
      };
    }
  }

  // Session modification
  async addProduct(command: AddProductCommand): Promise<SessionResult> {
    return await this.addProductUseCase.execute(command);
  }

  async addItem(command: AddItemCommand): Promise<SessionResult> {
    // If we have an existing session, pass it to avoid repository lookup
    if (command.existingSession) {
      console.log('[RestockApplicationServiceImpl] Using existing session for addItem');
    }
    return await this.addItemUseCase.execute(command);
  }

  async removeProduct(sessionId: string, productId: string): Promise<SessionResult> {
    try {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new SessionNotFoundError(sessionId);
      }

      const updatedSession = session.removeItem(productId);
      await this.sessionRepository.save(updatedSession);

      return {
        success: true,
        session: updatedSession,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove product',
      };
    }
  }

  async updateProduct(
    sessionId: string, 
    productId: string, 
    quantity: number, 
    notes?: string
  ): Promise<SessionResult> {
    try {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new SessionNotFoundError(sessionId);
      }

      const updatedSession = session.updateItem(productId, { quantity, notes });
      await this.sessionRepository.save(updatedSession);

      return {
        success: true,
        session: updatedSession,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  }

  async setSessionName(sessionId: string, name: string): Promise<SessionResult> {
    try {
      // First get the session to get the user ID
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new SessionNotFoundError(sessionId);
      }

      // Use the new use case for better logic handling
      const result = await this.updateSessionNameUseCase.execute({
        sessionId,
        newName: name,
      });

      if (result.success && result.session) {
        return {
          success: true,
          session: result.session,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to update session name',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set session name',
      };
    }
  }

  async updateSessionName(command: { sessionId?: string; newName: string }): Promise<SessionResult> {
    return await this.updateSessionNameUseCase.execute(command);
  }

  // Email operations
  async generateEmails(command: GenerateEmailsCommand): Promise<EmailsResult> {
    return await this.generateEmailsUseCase.execute(command);
  }

  async markAsSent(sessionId: string): Promise<SessionResult> {
    try {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new SessionNotFoundError(sessionId);
      }

      const updatedSession = session.markAsSent();
      await this.sessionRepository.save(updatedSession);

      return {
        success: true,
        session: updatedSession,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark session as sent',
      };
    }
  }

  // Business queries
  async getSessionSummary(sessionId: string) {
    try {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        return {
          success: false,
          error: `Session with ID ${sessionId} not found`,
        };
      }

      const summary = RestockSessionDomainService.calculateSessionSummary(session);

      return {
        success: true,
        summary: {
          totalItems: summary.totalItems,
          totalProducts: summary.totalProducts,
          supplierCount: summary.supplierCount,
          status: summary.status,
          isEmpty: summary.isEmpty,
          canGenerateEmails: summary.canGenerateEmails,
          canSendEmails: summary.canSendEmails,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session summary',
      };
    }
  }
}
