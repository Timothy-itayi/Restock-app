import { ErrorHandler } from './errorHandler';
import { Logger } from './logger';

// Form validation utilities
export const ValidationUtils = {
  validateProductForm: (
    productName: string,
    quantity: string,
    supplierName: string,
    supplierEmail: string
  ): { isValid: boolean; errorMessage: string } => {
    Logger.debug('Validating form', { productName, quantity, supplierName, supplierEmail });
    
    if (!productName.trim()) {
      const error = ErrorHandler.handleValidationError('productName', productName, 'required');
      return { isValid: false, errorMessage: error };
    }
    
    if (!quantity.trim() || parseInt(quantity) <= 0) {
      const error = ErrorHandler.handleValidationError('quantity', quantity, 'must be greater than 0');
      return { isValid: false, errorMessage: error };
    }
    
    if (!supplierName.trim()) {
      const error = ErrorHandler.handleValidationError('supplierName', supplierName, 'required');
      return { isValid: false, errorMessage: error };
    }
    
    if (!supplierEmail.trim() || !supplierEmail.includes("@")) {
      const error = ErrorHandler.handleValidationError('supplierEmail', supplierEmail, 'must be a valid email');
      return { isValid: false, errorMessage: error };
    }
    
    Logger.debug('Form validation passed');
    return { isValid: true, errorMessage: '' };
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateQuantity: (quantity: string): boolean => {
    const num = parseInt(quantity);
    return !isNaN(num) && num > 0;
  },

  sanitizeString: (str: string): string => {
    return str.trim();
  }
};