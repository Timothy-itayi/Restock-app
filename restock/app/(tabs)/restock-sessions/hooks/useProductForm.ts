/**
 * PRODUCT FORM HOOK - CLEAN VERSION
 * 
 * Focused hook for managing product form state and validation
 * No business logic - only UI form concerns
 */

import { useState, useCallback } from 'react';
import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from '../../../infrastructure/repositories/SupabaseHooksProvider';

export interface ProductFormData {
  productName: string;
  quantity: string;
  supplierName: string;
  supplierEmail: string;
  notes?: string;
}

export interface ProductFormState {
  formData: ProductFormData;
  isSubmitting: boolean;
  error: string | null;
  isFormVisible: boolean;
  validationErrors: Partial<ProductFormData>;
}

export interface ProductFormActions {
  updateField: (field: keyof ProductFormData, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  openForm: () => void;
  closeForm: () => void;
  setError: (error: string | null) => void;
  submitForm: (onSuccess?: () => void) => Promise<{ success: boolean; error?: string }>;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  defaultQuantity: number;
  defaultSupplierId?: string;
}

export interface SupplierSuggestion {
  id: string;
  name: string;
  email: string;
}

/**
 * Clean product form hook
 * 
 * Handles only form state, validation, and UI concerns
 * Business logic is delegated to application service
 */
export function useProductForm(): ProductFormState & ProductFormActions {
  const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus } = useSessionRepository();

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    quantity: '1',
    supplierName: '',
    supplierEmail: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<ProductFormData>>({});

  /**
   * Update a form field
   */
  const updateField = useCallback((field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error
    if (error) {
      setError(null);
    }
  }, [validationErrors, error]);

  /**
   * Validate the form
   */
  const validateForm = useCallback((): boolean => {
    const errors: Partial<ProductFormData> = {};

    // Product name validation
    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required';
    } else if (formData.productName.length < 2) {
      errors.productName = 'Product name must be at least 2 characters';
    }

    // Quantity validation
    const quantity = parseInt(formData.quantity);
    if (!formData.quantity.trim() || isNaN(quantity)) {
      errors.quantity = 'Quantity is required';
    } else if (quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    } else if (quantity > 10000) {
      errors.quantity = 'Quantity cannot exceed 10,000';
    }

    // Supplier name validation
    if (!formData.supplierName.trim()) {
      errors.supplierName = 'Supplier name is required';
    } else if (formData.supplierName.length < 2) {
      errors.supplierName = 'Supplier name must be at least 2 characters';
    }

    // Supplier email validation
    if (!formData.supplierEmail.trim()) {
      errors.supplierEmail = 'Supplier email is required';
    } else if (!isValidEmail(formData.supplierEmail.trim())) {
      errors.supplierEmail = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      productName: '',
      quantity: '1',
      supplierName: '',
      supplierEmail: '',
      notes: ''
    });
    setValidationErrors({});
    setError(null);
    setIsSubmitting(false);
  }, []);

  /**
   * Show the form
   */
  const openForm = useCallback(() => {
    setIsFormVisible(true);
    setError(null);
  }, []);

  /**
   * Hide the form
   */
  const closeForm = useCallback(() => {
    setIsFormVisible(false);
    resetForm();
  }, [resetForm]);

  /**
   * Set error message
   */
  const setErrorMessage = useCallback((error: string | null) => {
    setError(error);
  }, []);

  /**
   * Submit the form
   */
  const submitForm = useCallback(async (onSuccess?: () => void) => {
    if (!validateForm()) {
      return { success: false, error: 'Please fix validation errors' };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Note: In the clean architecture, the form doesn't directly
      // interact with the application service. This should be handled
      // by the parent component that has access to the session.
      // For now, we'll return the form data for the parent to handle.
      
      const result = {
        success: true,
        formData: {
          productName: formData.productName.trim(),
          quantity: parseInt(formData.quantity),
          supplierName: formData.supplierName.trim(),
          supplierEmail: formData.supplierEmail.trim().toLowerCase(),
          notes: formData.notes?.trim() || undefined
        }
      };

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  return {
    // State
    formData,
    isSubmitting,
    error,
    isFormVisible,
    validationErrors,

    // Actions
    updateField,
    validateForm,
    resetForm,
    openForm,
    closeForm,
    setError: setErrorMessage,
    submitForm
  };
}

/**
 * Hook for product autocomplete suggestions
 */
export function useProductSuggestions(searchTerm: string): {
  suggestions: ProductSuggestion[];
  isLoading: boolean;
  error: string | null;
} {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would fetch from the application service
  // For now, return empty suggestions
  return {
    suggestions: [],
    isLoading: false,
    error: null
  };
}

/**
 * Hook for supplier autocomplete suggestions
 */
export function useSupplierSuggestions(searchTerm: string): {
  suggestions: SupplierSuggestion[];
  isLoading: boolean;
  error: string | null;
} {
  const [suggestions, setSuggestions] = useState<SupplierSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would fetch from the application service
  // For now, return empty suggestions
  return {
    suggestions: [],
    isLoading: false,
    error: null
  };
}

// Helper functions

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper to increment quantity safely
 */
export function incrementQuantity(currentValue: string): string {
  const current = parseInt(currentValue) || 0;
  return Math.min(current + 1, 10000).toString();
}

/**
 * Helper to decrement quantity safely
 */
export function decrementQuantity(currentValue: string): string {
  const current = parseInt(currentValue) || 0;
  return Math.max(current - 1, 1).toString();
}
