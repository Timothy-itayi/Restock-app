/**
 * USE CASE: AddProductToSessionUseCase
 * 
 * Orchestrates adding a product to a restock session with full business validation
 */

import { 
  RestockSession, 
  RestockSessionDomainService,
  SessionRepository,
  ProductRepository,
  SupplierRepository,
  SessionNotFoundError,
  ProductNotFoundError,
  SupplierNotFoundError
} from '../../_domain';

export interface AddProductToSessionCommand {
  readonly sessionId: string;
  readonly productId: string;
  readonly supplierId: string;
  readonly quantity: number;
  readonly notes?: string;
}

export interface AddProductToSessionResult {
  readonly success: boolean;
  readonly session?: RestockSession;
  readonly error?: string;
}

export class AddProductToSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly productRepository: ProductRepository,
    private readonly supplierRepository: SupplierRepository
  ) {}

  async execute(command: AddProductToSessionCommand): Promise<AddProductToSessionResult> {
    try {
      // 1. Validate command
      if (!command.sessionId || !command.productId || !command.supplierId) {
        return {
          success: false,
          error: 'Session ID, Product ID, and Supplier ID are required for this operation',
        };
      }

      if (command.quantity <= 0) {
        return {
          success: false,
          error: 'Quantity must be greater than zero',
        };
      }

      // 2. Load entities from repositories
      const [session, product, supplier] = await Promise.all([
        this.sessionRepository.findById(command.sessionId),
        this.productRepository.findById(command.productId),
        this.supplierRepository.findById(command.supplierId),
      ]);

      // 3. Validate entities exist
      if (!session) {
        throw new SessionNotFoundError(command.sessionId);
      }
      if (!product) {
        throw new ProductNotFoundError(command.productId);
      }
      if (!supplier) {
        throw new SupplierNotFoundError(command.supplierId);
      }

      // 4. Use domain service to add product with business validation
      const updatedSession = RestockSessionDomainService.addProductToSession(
        session,
        product,
        supplier,
        command.quantity,
        command.notes
      );

      // 5. Persist updated session
      await this.sessionRepository.save(updatedSession);

      // 6. Return success result
      return {
        success: true,
        session: updatedSession,
      };

    } catch (error) {
      console.error('AddProductToSessionUseCase failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add product to session',
      };
    }
  }
}
