// hooks/useProductForm.ts
import { useState, useCallback } from 'react';

export interface ProductFormData {
  productName: string;
  quantity: string;
  supplierName: string;
  supplierEmail: string;
  notes?: string;
}

export function useProductForm(initialValues?: Partial<ProductFormData>) {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    quantity: '1',
    supplierName: '',
    supplierEmail: '',
    notes: '',
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback((field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      productName: '',
      quantity: '1',
      supplierName: '',
      supplierEmail: '',
      notes: '',
      ...initialValues,
    });
    setError(null);
  }, [initialValues]);

  const submitForm = useCallback(async (onSuccess?: () => void) => {
    setError(null);

    // Simple validation
    if (!formData.productName.trim()) { setError('Product name required'); return; }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) { setError('Quantity must be > 0'); return; }
    if (!formData.supplierName.trim()) { setError('Supplier name required'); return; }
    if (!formData.supplierEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supplierEmail)) { setError('Valid email required'); return; }

    try {
      if (onSuccess) onSuccess();
    } catch (error) {
      setError('Submission failed');
    }
  }, [formData]);

  return { formData, updateField, resetForm, submitForm, error };
}

export const incrementQuantity = (qty: string) => Math.min(Number(qty) + 1, 10000).toString();
export const decrementQuantity = (qty: string) => Math.max(Number(qty) - 1, 1).toString();
