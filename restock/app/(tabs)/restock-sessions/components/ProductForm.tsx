import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useProductForm, incrementQuantity, decrementQuantity } from '../hooks/useProductForm';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import CustomToast from '../../../components/CustomToast';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface ProductFormProps {
  onSubmit?: (values: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => void;
  isEditMode?: boolean;
  isSubmitting?: boolean;
  submitButtonText?: string;
  initialValues?: Partial<{
    productName: string;
    quantity: string;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }>;
}

const ProductFormComponent: React.FC<ProductFormProps> = ({
  onSubmit,
  isEditMode = false,
  isSubmitting = false,
  submitButtonText,
  initialValues,
}) => {
  const productForm = useProductForm();
  const styles = useThemedStyles(getRestockSessionsStyles);

  // Destructure stable parts to avoid unnecessary re-renders
  const { formData, validationErrors, error, setError, updateField, setInitialValues, isSubmitting: formSubmitting } = productForm;

  // ✅ Set initial values once on mount
  useEffect(() => {
    if (initialValues) {
      setInitialValues(initialValues);
    }
  }, []); // empty array ensures this runs only once

  // ✅ Input change handler
  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      updateField(field, value);
    },
    [updateField, formData] // formData is safe because we only read value, not the whole object
  );

  // ✅ Quantity change handler
  const handleQuantityChange = useCallback(
    (increment: boolean) => {
      const newQuantity = increment
        ? incrementQuantity(formData.quantity)
        : decrementQuantity(formData.quantity);
      updateField('quantity', newQuantity);
    },
    [formData.quantity, updateField]
  );

  // ✅ Submit handler
  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit({
        productName: formData.productName.trim(),
        quantity: parseInt(formData.quantity),
        supplierName: formData.supplierName.trim(),
        supplierEmail: formData.supplierEmail.trim(),
        notes: formData.notes?.trim() || undefined,
      });
    }
  }, [onSubmit, formData]);

  const canSubmit =
    !!formData.productName &&
    !!formData.quantity &&
    !!formData.supplierName &&
    !!formData.supplierEmail &&
    !formSubmitting;

  return (
    <View>
      <Text style={styles.formTitle}>{isEditMode ? 'Edit Product' : 'Add Product'}</Text>

      {/* Product Name */}
      <View style={styles.inputGroup}>
        <Input
          label="Product Name"
          value={formData.productName}
          onChangeText={val => handleInputChange('productName', val)}
          placeholder="Product Name"
        />
        {validationErrors.productName && <Text style={styles.errorText}>{validationErrors.productName}</Text>}
      </View>

      {/* Quantity */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => handleQuantityChange(false)}>
            <Text>-</Text>
          </TouchableOpacity>
          <Text>{formData.quantity || '0'}</Text>
          <TouchableOpacity onPress={() => handleQuantityChange(true)}>
            <Text>+</Text>
          </TouchableOpacity>
        </View>
        {validationErrors.quantity && <Text style={styles.errorText}>{validationErrors.quantity}</Text>}
      </View>

      {/* Supplier Name */}
      <View style={styles.inputGroup}>
        <Input
          label="Supplier Name"
          value={formData.supplierName}
          onChangeText={val => handleInputChange('supplierName', val)}
          placeholder="Supplier Name"
        />
        {validationErrors.supplierName && <Text style={styles.errorText}>{validationErrors.supplierName}</Text>}
      </View>

      {/* Supplier Email */}
      <View style={styles.inputGroup}>
        <Input
          label="Supplier Email"
          value={formData.supplierEmail}
          onChangeText={val => handleInputChange('supplierEmail', val)}
          placeholder="Supplier Email"
          keyboardType="email-address"
        />
        {validationErrors.supplierEmail && <Text style={styles.errorText}>{validationErrors.supplierEmail}</Text>}
      </View>

      {/* Submit button */}
      <View style={styles.formButtons}>
        <Button
          title={submitButtonText || (isSubmitting ? 'Submitting...' : isEditMode ? 'Update Product' : 'Add Product')}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        />
      </View>

      {/* Error toast */}
      {error && <CustomToast visible message={error} onDismiss={() => setError(null)} />}
    </View>
  );
};

// ✅ Use React.memo to avoid unnecessary re-renders
export const ProductForm = React.memo(ProductFormComponent);
