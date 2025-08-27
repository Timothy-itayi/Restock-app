import React, { useState, useCallback } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useProductForm } from '../hooks/useProductForm';
import { useSessionContext } from '../context/SessionContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import CustomToast from '../../../components/CustomToast';
import { Logger } from '../utils/logger';

// Styles
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';

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
  const sessionContext = useSessionContext();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);

  // Check if there's an active session using the new SessionContext
  const hasActiveSession = !!sessionContext.currentSession;

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
        const result = await sessionContext.addProduct({
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
            sessionId: sessionContext.currentSession?.toValue().id,
            productName: productForm.formData.productName,
            quantity: productForm.formData.quantity,
            supplierName: productForm.formData.supplierName,
          });
        } else {
          showToastMessage(result.error || 'Failed to add product', 'error');
        }
      } catch (error) {
        Logger.error('Failed to add product to session', error, {
          sessionId: sessionContext.currentSession?.toValue().id,
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
  }, [productForm, sessionContext, showToastMessage, onSuccess, hasActiveSession, onSubmit]);

  // Handle input changes using the hook
  const handleInputChange = useCallback((field: keyof typeof productForm.formData, value: string) => {
    productForm.updateField(field, value);
  }, [productForm]);

  // Handle quantity changes
  const handleQuantityChange = useCallback((increment: boolean) => {
    const currentQuantity = parseInt(productForm.formData.quantity) || 0;
    const newQuantity = increment ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);
    productForm.updateField('quantity', newQuantity.toString());
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
      <View style={restockSessionsStyles.emptyState}>
        <Text style={restockSessionsStyles.emptyStateText}>No Active Session</Text>
        <Text style={restockSessionsStyles.emptyStateSubtext}>
          You need to start a new restocking session before adding products.
        </Text>
      </View>
    );
  }

  // Custom placeholderTextColor for all Input fields to ensure darker, more visible placeholder
  const placeholderTextColor = '#444'; // dark neutral for clear form distinction
  const forestGreen = '#67C090';

  return (
    <View>
      <Text style={restockSessionsStyles.formTitle}>Add Product to Session</Text>
      
      <View style={[restockSessionsStyles.inputGroup, { paddingHorizontal: 16, paddingVertical: 18 }]}>
        <Input
          label="Product Name"
          value={productForm.formData.productName}
          onChangeText={(value) => handleInputChange('productName', value)}
          placeholder="e.g., Organic Bananas"
          placeholderTextColor={placeholderTextColor}
          autoCapitalize="words"
          variant="filled"
          fullWidth
          multiline
          numberOfLines={2}
          style={{ minHeight: 64, textAlignVertical: 'top', backgroundColor: forestGreen }}
        />
        {productForm.validationErrors.productName && (
          <Text style={restockSessionsStyles.errorText}>{productForm.validationErrors.productName}</Text>
        )}
      </View>

      <View style={[restockSessionsStyles.inputGroup, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        <Text style={restockSessionsStyles.inputLabel}>Quantity</Text>
        <View style={restockSessionsStyles.quantityContainer}>
          <TouchableOpacity 
            style={restockSessionsStyles.quantityButton} 
            onPress={() => handleQuantityChange(false)}
            disabled={parseInt(productForm.formData.quantity) <= 0}
          >
            <Text style={restockSessionsStyles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          
          <View style={restockSessionsStyles.quantityDisplay}>
            <Text style={restockSessionsStyles.quantityText}>
              {productForm.formData.quantity || '0'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={restockSessionsStyles.quantityButton} 
            onPress={() => handleQuantityChange(true)}
          >
            <Text style={restockSessionsStyles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        {productForm.validationErrors.quantity && (
          <Text style={restockSessionsStyles.errorText}>{productForm.validationErrors.quantity}</Text>
        )}
      </View>

      <View style={[restockSessionsStyles.inputGroup, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        <Input
          label="Supplier Name"
          value={productForm.formData.supplierName}
          onChangeText={(value) => handleInputChange('supplierName', value)}
          placeholder="e.g., Fresh Farms Co"
          placeholderTextColor={placeholderTextColor}
          autoCapitalize="words"
          variant="filled"
          fullWidth
          style={{ backgroundColor: forestGreen }}
        />
        {productForm.validationErrors.supplierName && (
          <Text style={restockSessionsStyles.errorText}>{productForm.validationErrors.supplierName}</Text>
        )}
      </View>

      <View style={[restockSessionsStyles.inputGroup, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        <Input
          label="Supplier Email"
          value={productForm.formData.supplierEmail}
          onChangeText={(value) => handleInputChange('supplierEmail', value)}
          placeholder="e.g., orders@freshfarms.com"
          placeholderTextColor={placeholderTextColor}
          keyboardType="email-address"
          autoCapitalize="none"
          variant="filled"
          fullWidth
          style={{ backgroundColor: forestGreen }}
        />
        {productForm.validationErrors.supplierEmail && (
          <Text style={restockSessionsStyles.errorText}>{productForm.validationErrors.supplierEmail}</Text>
        )}
      </View>

      <View style={[restockSessionsStyles.inputGroup, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        <Input
          label="Notes (Optional)"
          value={productForm.formData.notes || ''}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="e.g., Organic preferred, urgent delivery"
          placeholderTextColor={placeholderTextColor}
          multiline
          numberOfLines={3}
          variant="filled"
          fullWidth
          style={{ backgroundColor: forestGreen }}
        />
      </View>

      <View style={restockSessionsStyles.formButtons}>
        <Button
          title={isSubmitting ? "Adding Product..." : "Add Product"}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>

      <CustomToast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
    </View>
  );
}

