/**
 * DOMAIN LAYER EXPORTS
 * 
 * This is the public API of the domain layer
 * Only these exports should be used by other layers
 */

// Entities
export { RestockSession, SessionStatus, type RestockItemValue, type SessionValue } from './_entities/RestockSession';
export { Product, type ProductValue } from './_entities/Product';
export { Supplier, type SupplierValue } from './_entities/Supplier';

// Domain Services
export { 
  RestockSessionDomainService, 
  type AddItemRequest,
  type AddItemResult,
  type EmailDraft
} from './_services/RestockSessionDomainService';

// Repository Interfaces
export { 
  type SessionRepository, 
  type SessionRepositoryError,
  SessionNotFoundError,
  SessionSaveError
} from './_interfaces/SessionRepository';

export { 
  type ProductRepository, 
  type ProductRepositoryError,
  ProductNotFoundError,
  ProductSaveError
} from './_interfaces/ProductRepository';

export { 
  type SupplierRepository, 
  type SupplierRepositoryError,
  SupplierNotFoundError,
  SupplierSaveError
} from './_interfaces/SupplierRepository';
