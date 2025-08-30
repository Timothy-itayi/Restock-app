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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(async (onSuccess?: () => void) => {
    setIsSubmitting(true);
    setError(null);

    // Simple validation
    if (!formData.productName.trim()) { setError('Product name required'); setIsSubmitting(false); return; }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) { setError('Quantity must be > 0'); setIsSubmitting(false); return; }
    if (!formData.supplierName.trim()) { setError('Supplier name required'); setIsSubmitting(false); return; }
    if (!formData.supplierEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supplierEmail)) { setError('Valid email required'); setIsSubmitting(false); return; }

    try { await new Promise(res => setTimeout(res, 500)); if (onSuccess) onSuccess(); }
    catch { setError('Submission failed'); }
    finally { setIsSubmitting(false); }
  }, [formData]);

  return { formData, updateField, resetForm, submitForm, isSubmitting, error };
}

export const incrementQuantity = (qty: string) => Math.min(Number(qty) + 1, 10000).toString();
export const decrementQuantity = (qty: string) => Math.max(Number(qty) - 1, 1).toString();
