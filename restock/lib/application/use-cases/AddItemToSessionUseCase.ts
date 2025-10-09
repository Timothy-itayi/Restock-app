/**
 * USE CASE: AddItemToSessionUseCase
 * 
 * Orchestrates adding an item to a restock session using user-friendly input
 * (product name, supplier name, supplier email) without requiring IDs
 */

import { 
  RestockSession, 
  RestockSessionDomainService,
  SessionRepository,
  ProductRepository,
  SupplierRepository,
  SessionNotFoundError,
  AddItemRequest,
  AddItemResult
} from '../../_domain';

export interface AddItemToSessionCommand {
  readonly sessionId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly supplierName: string;
  readonly supplierEmail: string;
  readonly notes?: string;
  readonly existingSession?: RestockSession; // Allow passing existing session from UI
}

export interface AddItemToSessionResult {
  readonly success: boolean;
  readonly session?: RestockSession;
  readonly item?: any;
  readonly error?: string;
}

export class AddItemToSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly productRepository: ProductRepository,
    private readonly supplierRepository: SupplierRepository
  ) {}

  async execute(command: AddItemToSessionCommand): Promise<AddItemToSessionResult> {
    try {
      // 1. Validate command
      if (!command.sessionId) {
        return {
          success: false,
          error: 'Session ID is required',
        };
      }

      if (!command.productName?.trim()) {
        return {
          success: false,
          error: 'Product name is required',
        };
      }

      if (!command.supplierName?.trim()) {
        return {
          success: false,
          error: 'Supplier name is required',
        };
      }

      if (!command.supplierEmail?.trim()) {
        return {
          success: false,
          error: 'Supplier email is required',
        };
      }

      if (command.quantity <= 0) {
        return {
          success: false,
          error: 'Quantity must be greater than zero',
        };
      }

      // 2. Get session - either from command or repository
      let session: RestockSession | null = null;
      
      if (command.existingSession) {
        // Use the session passed from UI layer
        session = command.existingSession;
        console.log('[AddItemToSessionUseCase] Using existing session from UI:', session.toValue().id);
      } else {
        // Try to load from repository
        session = await this.sessionRepository.findById(command.sessionId);
        if (!session) {
          throw new SessionNotFoundError(command.sessionId);
        }
        console.log('[AddItemToSessionUseCase] Loaded session from repository:', session.toValue().id);
      }

      // 3. Load existing products and suppliers for potential ID resolution
      // RPC functions automatically filter by current user
      const [existingProducts, existingSuppliers] = await Promise.all([
        this.productRepository.findByUserId(),
        this.supplierRepository.findByUserId(),
      ]);

      // 4. Create the add item request
      const addItemRequest: AddItemRequest = {
        productName: command.productName.trim(),
        quantity: command.quantity,
        supplierName: command.supplierName.trim(),
        supplierEmail: command.supplierEmail.trim().toLowerCase(),
        notes: command.notes?.trim(),
      };

      // 5. Use domain service to add item with business validation
      const result: AddItemResult = RestockSessionDomainService.addItemToSession(
        session,
        addItemRequest,
        existingProducts,
        existingSuppliers
      );

      // 6. Persist updated session
      await this.sessionRepository.save(result.session);

      // 7. Return success result
      return {
        success: true,
        session: result.session,
        item: result.item,
      };

    } catch (error) {
      console.error('AddItemToSessionUseCase failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to session',
      };
    }
  }
}
