/**
 * APPLICATION LAYER EXPORTS
 * 
 * This is the public API of the application layer
 * The UI layer should primarily use the RestockApplicationService interface
 */

// Application Service Interface (main entry point for UI)
export { 
  type RestockApplicationService,
  type CreateSessionCommand,
  type AddProductCommand,
  type GenerateEmailsCommand,
  type GetSessionsQuery,
  type SessionResult,
  type EmailsResult,
  type SessionsResult,
} from './interfaces/RestockApplicationService';

// Application Service Implementation
export { RestockApplicationServiceImpl } from './use-cases/RestockApplicationServiceImpl';

// Individual Use Cases (for advanced usage or testing)
export { CreateRestockSessionUseCase } from './use-cases/CreateRestockSessionUseCase';
export { AddProductToSessionUseCase } from './use-cases/AddProductToSessionUseCase';
export { AddItemToSessionUseCase } from './use-cases/AddItemToSessionUseCase';
export { GenerateEmailsUseCase } from './use-cases/GenerateEmailsUseCase';
export { GetUserSessionsUseCase } from './use-cases/GetUserSessionsUseCase';
export { UpdateSessionNameUseCase } from './use-cases/UpdateSessionNameUseCase';
