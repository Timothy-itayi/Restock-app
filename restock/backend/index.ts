// Backend services and utilities exports

// Configuration
export { CLERK_PUBLISHABLE_KEY, clerkConfig } from './config/clerk';

// Services
export { AuthService } from './_services/auth';
export { ClerkSyncService } from './_services/clerk-sync';
export { ProductService } from './_services/products';
export { SupplierService } from './_services/suppliers';
export { SessionService } from './_services/sessions';
export { EmailService } from './_services/emails';
export { UserProfileService } from './_services/user-profile';

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