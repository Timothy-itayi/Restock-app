import { useState, useCallback } from 'react';

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
  setInitialValues: (values: Partial<ProductFormData>) => void;
}

export function useProductForm(): ProductFormState & ProductFormActions {
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

  // ✅ Stable field updater
  const updateField = useCallback((field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    setError(null);
  }, []);

  // ✅ Stable initial values setter
  const setInitialValues = useCallback((values: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...values }));
    setValidationErrors({});
    setError(null);
  }, []);

  // ✅ Validation function
  const validateForm = useCallback((): boolean => {
    const errors: Partial<ProductFormData> = {};

    if (!formData.productName.trim()) errors.productName = 'Product name is required';
    else if (formData.productName.length < 2) errors.productName = 'Product name must be at least 2 characters';

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity.trim() || isNaN(quantity)) errors.quantity = 'Quantity is required';
    else if (quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
    else if (quantity > 10000) errors.quantity = 'Quantity cannot exceed 10,000';

    if (!formData.supplierName.trim()) errors.supplierName = 'Supplier name is required';
    else if (formData.supplierName.length < 2) errors.supplierName = 'Supplier name must be at least 2 characters';

    if (!formData.supplierEmail.trim()) errors.supplierEmail = 'Supplier email is required';
    else if (!isValidEmail(formData.supplierEmail.trim())) errors.supplierEmail = 'Please enter a valid email address';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // ✅ Reset form
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

  // ✅ Open/close form
  const openForm = useCallback(() => {
    setIsFormVisible(true);
    setError(null);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormVisible(false);
    resetForm();
  }, [resetForm]);

  // ✅ Submit form
  const submitForm = useCallback(async (onSuccess?: () => void) => {
    if (!validateForm()) {
      return { success: false, error: 'Please fix validation errors' };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const sanitized = {
        productName: formData.productName.trim(),
        quantity: parseInt(formData.quantity),
        supplierName: formData.supplierName.trim(),
        supplierEmail: formData.supplierEmail.trim().toLowerCase(),
        notes: formData.notes?.trim() || undefined
      };

      onSuccess?.();
      return { success: true, formData: sanitized };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  return {
    formData,
    isSubmitting,
    error,
    isFormVisible,
    validationErrors,
    updateField,
    validateForm,
    resetForm,
    openForm,
    closeForm,
    setError,
    submitForm,
    setInitialValues
  };
}

// helpers
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function incrementQuantity(currentValue: string) {
  const current = parseInt(currentValue) || 0;
  return Math.min(current + 1, 10000).toString();
}

export function decrementQuantity(currentValue: string) {
  const current = parseInt(currentValue) || 0;
  return Math.max(current - 1, 1).toString();
}
