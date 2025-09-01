// components/ProductForm.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useProductForm, incrementQuantity, decrementQuantity } from '../hooks/useProductForm';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import Button from '../../../components/Button';

interface ProductFormProps {
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isSubmitting: boolean;
  isDisabled?: boolean;
}

export function ProductForm({ onSubmit, initialValues, isDisabled = false }: ProductFormProps) {
  const { formData, updateField, submitForm, error } = useProductForm(initialValues);
  const styles = useThemedStyles(getRestockSessionsStyles);

  const handleSubmit = () => {
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
      <Text style={styles.formTitle}>Add Product</Text>

      {/* Product Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Product Name</Text>
        <TextInput
          value={formData.productName}
          onChangeText={val => updateField('productName', val)}
          placeholder="Product Name"
          style={styles.textInput}
        />
      </View>

      {/* Quantity */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => updateField('quantity', decrementQuantity(formData.quantity))}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={formData.quantity}
            onChangeText={val => updateField('quantity', val)}
            keyboardType="numeric"
            style={styles.quantityInput}
          />
          <TouchableOpacity style={styles.quantityButton} onPress={() => updateField('quantity', incrementQuantity(formData.quantity))}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Supplier Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Supplier Name</Text>
        <TextInput
          value={formData.supplierName}
          onChangeText={val => updateField('supplierName', val)}
          placeholder="Supplier Name"
          style={styles.textInput}
        />
      </View>

      {/* Supplier Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Supplier Email</Text>
        <TextInput
          value={formData.supplierEmail}
          onChangeText={val => updateField('supplierEmail', val)}
          placeholder="supplier@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.textInput}
        />
      </View>

      {/* Notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes (Optional)</Text>
        <TextInput
          value={formData.notes}
          onChangeText={val => updateField('notes', val)}
          placeholder="Additional notes..."
          multiline
          numberOfLines={3}
          style={styles.textInput}
        />
      </View>

      {/* Error */}
      {error && (
        <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
      )}

      {/* Form Buttons */}
      <View style={styles.formButtons}>
        <Button
          title="Submit"
          onPress={handleSubmit}
          disabled={isDisabled}
        />
      </View>
    </View>
  );
}
