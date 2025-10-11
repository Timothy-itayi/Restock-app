import { Logger } from './logger';

// Error handling utility for restock sessions
export const ErrorHandler = {
  handleAsyncStorageError: (error: any, operation: string) => {
    Logger.error(`AsyncStorage ${operation} failed`, error, { operation });
    return {
      success: false,
      error: `Failed to ${operation}: ${error?.message || 'Unknown error'}`
    };
  },

  handleDatabaseError: (error: any, operation: string, context?: any) => {
    Logger.error(`Database ${operation} failed`, error, { operation, context });
    return {
      success: false,
      error: `Database ${operation} failed: ${error?.message || 'Unknown error'}`
    };
  },

  handleValidationError: (field: string, value: any, rule: string) => {
    Logger.warning(`Validation failed for ${field}`, { field, value, rule });
    return `Invalid ${field}: ${rule}`;
  },

  handleNetworkError: (error: any, operation: string) => {
    Logger.error(`Network ${operation} failed`, error, { operation });
    return {
      success: false,
      error: `Network error during ${operation}: ${error?.message || 'Connection failed'}`
    };
  }
};