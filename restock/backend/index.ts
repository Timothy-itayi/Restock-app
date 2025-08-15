// Backend services and utilities exports

// Configuration
export { CLERK_PUBLISHABLE_KEY, clerkConfig } from './config/clerk';

// Services
export { AuthService } from './services/auth';
export { ClerkSyncService } from './services/clerk-sync';
export { ProductService } from './services/products';
export { SupplierService } from './services/suppliers';
export { SessionService } from './services/sessions';
export { EmailService } from './services/emails';
export { UserProfileService } from './services/user-profile';

// Types
export type {
  User,
  Product,
  Supplier,
  RestockSession,
  RestockItem,
  EmailSent,
  InsertUser,
  InsertProduct,
  InsertSupplier,
  InsertRestockSession,
  InsertRestockItem,
  InsertEmailSent,
  UpdateProduct,
  UpdateSupplier,
  UpdateRestockSession,
  UpdateEmailSent,
} from './types/database';

// Utilities
export {
  generateId,
  formatDate,
  formatDateOnly,
  getTimeAgo,
  isValidEmail,
  sanitizeString,
  capitalizeWords,
  formatPhoneNumber,
  getCurrentUserId,
  isAuthenticated,

  debounce,
} from './utils/helpers'; 