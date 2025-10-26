// components/ProductForm.tsx
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';
import Button from '../../components/Button';
import { decrementQuantity, incrementQuantity, useProductForm } from '../../hooks/restock-sessions/useProductForm';
import { useSafeTheme } from '../../stores/useThemeStore';
import colors, { AppColors } from '../../theme/colors';

interface ProductFormProps {
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isSubmitting: boolean;
  isDisabled?: boolean;
  isEditMode?: boolean;
} 

export function ProductForm({ onSubmit, initialValues, isDisabled = false, isSubmitting, isEditMode = false }: ProductFormProps) {
  const { formData, updateField, submitForm, error } = useProductForm(initialValues);
  const t = useSafeTheme();
  const styles = getRestockSessionsStyles(t.theme as AppColors);

  const handleSubmit = () => {
    if (isSubmitting || isDisabled) return; // guard against double-taps
    submitForm(() => onSubmit({
      productName: formData.productName.trim(),
      quantity: Number(formData.quantity),
      supplierName: formData.supplierName.trim(),
      supplierEmail: formData.supplierEmail.trim(),
      notes: formData.notes?.trim() || undefined,
    }));
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>{isEditMode ? 'Edit Product' : 'Add Product'}</Text>

      {/* Product Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Product Name</Text>
        <TextInput
          value={formData.productName}
          onChangeText={val => { if (!(isDisabled || isSubmitting)) updateField('productName', val); }}
          placeholder="Product Name"
          style={styles.textInput}
          editable={!(isDisabled || isSubmitting)}
        />
      </View>

      {/* Quantity */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} disabled={isDisabled || isSubmitting} onPress={() => updateField('quantity', decrementQuantity(formData.quantity))}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={formData.quantity}
            onChangeText={val => { if (!(isDisabled || isSubmitting)) updateField('quantity', val); }}
            keyboardType="numeric"
            style={styles.quantityInput}
            editable={!(isDisabled || isSubmitting)}
          />
          <TouchableOpacity style={styles.quantityButton} disabled={isDisabled || isSubmitting} onPress={() => updateField('quantity', incrementQuantity(formData.quantity))}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Supplier Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Supplier Name</Text>
        <TextInput
          value={formData.supplierName}
          onChangeText={val => { if (!(isDisabled || isSubmitting)) updateField('supplierName', val); }}
          placeholder="Supplier Name"
          style={styles.textInput}
          editable={!(isDisabled || isSubmitting)}
        />
      </View>

      {/* Supplier Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Supplier Email</Text>
        <TextInput
          value={formData.supplierEmail}
          onChangeText={val => { if (!(isDisabled || isSubmitting)) updateField('supplierEmail', val); }}
          placeholder="supplier@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.textInput}
          editable={!(isDisabled || isSubmitting)}
        />
      </View>

      {/* Notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes (Optional)</Text>
        <TextInput
          value={formData.notes}
          onChangeText={val => { if (!(isDisabled || isSubmitting)) updateField('notes', val); }}
          placeholder="Additional notes..."
          multiline
          numberOfLines={3}
          style={styles.textInput}
          editable={!(isDisabled || isSubmitting)}
        />
      </View>

      {/* Error */}
      {error && (
        <Text style={{ color: colors.status.error, marginBottom: 8 }}>{error}</Text>
      )}

      {/* Form Buttons */}
      <View style={styles.formButtons}>
        <Button
          title="Submit"
          onPress={handleSubmit}
          disabled={isDisabled || isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </View>
  );
}
