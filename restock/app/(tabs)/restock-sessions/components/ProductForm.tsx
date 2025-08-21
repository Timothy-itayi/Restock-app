import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useProductForm } from '../hooks/useProductForm';
import { useRestockSession } from '../hooks/useRestockSession';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CustomToast from '../../../components/CustomToast';
import { Logger } from '../utils/logger';

interface ProductFormProps {
  onSuccess?: () => void;
  onSubmit?: (values: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => void;
  isNewSession?: boolean; // Flag to indicate this is for a new session
  isSubmitting?: boolean; // Flag to show loading state
}

export function ProductForm({ onSuccess, onSubmit, isNewSession = false, isSubmitting = false }: ProductFormProps) {
  const productForm = useProductForm();
  const currentSession = useRestockSession();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Check if there's an active session
  const hasActiveSession = !!currentSession.session;

  // Show toast message
  const showToastMessage = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Validate form using the hook
    if (!productForm.validateForm()) {
      // Show validation errors
      const errors = Object.values(productForm.validationErrors).filter(Boolean);
      if (errors.length > 0) {
        Alert.alert('Validation Error', errors.join('\n'));
        return;
      }
      return;
    }

    // If onSubmit prop is provided, use it (new flow)
    if (onSubmit) {
      onSubmit({
        productName: productForm.formData.productName.trim(),
        quantity: parseInt(productForm.formData.quantity),
        supplierName: productForm.formData.supplierName.trim(),
        supplierEmail: productForm.formData.supplierEmail.trim().toLowerCase(),
        notes: productForm.formData.notes?.trim() || undefined,
      });
      return;
    }

    // Legacy flow - handle submission internally
    if (hasActiveSession) {
      try {
        const result = await currentSession.addProduct({
          productName: productForm.formData.productName.trim(),
          quantity: parseInt(productForm.formData.quantity),
          supplierName: productForm.formData.supplierName.trim(),
          supplierEmail: productForm.formData.supplierEmail.trim().toLowerCase(),
          notes: productForm.formData.notes?.trim() || undefined,
        });

        if (result.success) {
          // Clear form using the hook
          productForm.resetForm();
          showToastMessage('Product added successfully!');
          
          // Notify parent component
          if (onSuccess) {
            onSuccess();
          }

          Logger.info('Product added to session', {
            sessionId: currentSession.session?.toValue().id,
            productName: productForm.formData.productName,
            quantity: productForm.formData.quantity,
            supplierName: productForm.formData.supplierName,
          });
        } else {
          showToastMessage(result.error || 'Failed to add product', 'error');
        }
      } catch (error) {
        Logger.error('Failed to add product to session', error, {
          sessionId: currentSession.session?.toValue().id,
          formData: productForm.formData,
        });
        showToastMessage('An unexpected error occurred', 'error');
      }
    } else {
      // For new sessions, just notify parent with form data
      // The parent will handle session creation and product addition
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [productForm, currentSession, showToastMessage, onSuccess, hasActiveSession, onSubmit]);

  // Handle input changes using the hook
  const handleInputChange = useCallback((field: keyof typeof productForm.formData, value: string) => {
    productForm.updateField(field, value);
  }, [productForm]);

  // Check if form can be submitted
  const canSubmit = productForm.formData.productName.trim() && 
                   productForm.formData.quantity.trim() && 
                   productForm.formData.supplierName.trim() && 
                   productForm.formData.supplierEmail.trim() &&
                   !productForm.isSubmitting;

  // If this is for a new session, show the form even without an active session
  if (!hasActiveSession && !isNewSession) {
    return (
      <Card style={styles.noSessionCard}>
        <Text style={styles.noSessionTitle}>No Active Session</Text>
        <Text style={styles.noSessionDescription}>
          You need to start a new restocking session before adding products.
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Add Product to Session</Text>
      
      <View style={styles.form}>
        <Input
          label="Product Name"
          value={productForm.formData.productName}
          onChangeText={(value) => handleInputChange('productName', value)}
          placeholder="e.g., Organic Bananas"
          autoCapitalize="words"
          style={styles.input}
        />
        {productForm.validationErrors.productName && (
          <Text style={styles.errorText}>{productForm.validationErrors.productName}</Text>
        )}

        <Input
          label="Quantity"
          value={productForm.formData.quantity}
          onChangeText={(value) => handleInputChange('quantity', value)}
          placeholder="e.g., 10"
          keyboardType="numeric"
          style={styles.input}
        />
        {productForm.validationErrors.quantity && (
          <Text style={styles.errorText}>{productForm.validationErrors.quantity}</Text>
        )}

        <Input
          label="Supplier Name"
          value={productForm.formData.supplierName}
          onChangeText={(value) => handleInputChange('supplierName', value)}
          placeholder="e.g., Fresh Farms Co"
          autoCapitalize="words"
          style={styles.input}
        />
        {productForm.validationErrors.supplierName && (
          <Text style={styles.errorText}>{productForm.validationErrors.supplierName}</Text>
        )}

        <Input
          label="Supplier Email"
          value={productForm.formData.supplierEmail}
          onChangeText={(value) => handleInputChange('supplierEmail', value)}
          placeholder="e.g., orders@freshfarms.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {productForm.validationErrors.supplierEmail && (
          <Text style={styles.errorText}>{productForm.validationErrors.supplierEmail}</Text>
        )}

        <Input
          label="Notes (Optional)"
          value={productForm.formData.notes || ''}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="e.g., Organic preferred, urgent delivery"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <Button
          title={productForm.isSubmitting ? "Adding Product..." : "Add Product"}
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={styles.submitButton}
        />
      </View>

      <CustomToast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 0, // Remove default margin since we're using gap
  },
  submitButton: {
    backgroundColor: '#6B7F6B',
    marginTop: 8,
  },
  noSessionCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  noSessionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  noSessionDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
  },
});