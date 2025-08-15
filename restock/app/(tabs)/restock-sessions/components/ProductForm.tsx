import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSessionStateManager } from '../hooks/useSessionStateManager';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { CustomToast } from '../../../components/CustomToast';
import { Logger } from '../utils/logger';

interface ProductFormProps {
  onProductAdded?: () => void;
}

export function ProductForm({ onProductAdded }: ProductFormProps) {
  const sessionManager = useSessionStateManager();
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    supplierName: '',
    supplierEmail: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Show toast message
  const showToastMessage = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // Validate form data
  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!formData.productName.trim()) {
      errors.push('Product name is required');
    }

    if (!formData.quantity.trim()) {
      errors.push('Quantity is required');
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push('Quantity must be a positive number');
      }
    }

    if (!formData.supplierName.trim()) {
      errors.push('Supplier name is required');
    }

    if (!formData.supplierEmail.trim()) {
      errors.push('Supplier email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.supplierEmail.trim())) {
        errors.push('Please enter a valid email address');
      }
    }

    return errors;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!sessionManager.state.currentSession) {
      showToastMessage('No active session. Please start a new session first.', 'error');
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sessionManager.addItemToSession({
        productName: formData.productName.trim(),
        quantity: parseInt(formData.quantity),
        supplierName: formData.supplierName.trim(),
        supplierEmail: formData.supplierEmail.trim().toLowerCase(),
        notes: formData.notes.trim() || undefined,
      });

      if (result.success) {
        // Clear form
        setFormData({
          productName: '',
          quantity: '',
          supplierName: '',
          supplierEmail: '',
          notes: '',
        });

        showToastMessage('Product added successfully!');
        
        // Notify parent component
        if (onProductAdded) {
          onProductAdded();
        }

        Logger.info('Product added to session', {
          sessionId: sessionManager.state.currentSession?.id,
          productName: formData.productName,
          quantity: formData.quantity,
          supplierName: formData.supplierName,
        });
      } else {
        showToastMessage(result.error || 'Failed to add product', 'error');
      }
    } catch (error) {
      Logger.error('Failed to add product to session', error, {
        sessionId: sessionManager.state.currentSession?.id,
        formData,
      });
      showToastMessage('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, sessionManager, validateForm, showToastMessage, onProductAdded]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Check if form can be submitted
  const canSubmit = formData.productName.trim() && 
                   formData.quantity.trim() && 
                   formData.supplierName.trim() && 
                   formData.supplierEmail.trim() &&
                   !isSubmitting;

  // Check if there's an active session
  const hasActiveSession = !!sessionManager.state.currentSession;

  if (!hasActiveSession) {
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
          value={formData.productName}
          onChangeText={(value) => handleInputChange('productName', value)}
          placeholder="e.g., Organic Bananas"
          autoCapitalize="words"
          style={styles.input}
        />

        <Input
          label="Quantity"
          value={formData.quantity}
          onChangeText={(value) => handleInputChange('quantity', value)}
          placeholder="e.g., 10"
          keyboardType="numeric"
          style={styles.input}
        />

        <Input
          label="Supplier Name"
          value={formData.supplierName}
          onChangeText={(value) => handleInputChange('supplierName', value)}
          placeholder="e.g., Fresh Farms Co"
          autoCapitalize="words"
          style={styles.input}
        />

        <Input
          label="Supplier Email"
          value={formData.supplierEmail}
          onChangeText={(value) => handleInputChange('supplierEmail', value)}
          placeholder="e.g., orders@freshfarms.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Input
          label="Notes (Optional)"
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="e.g., Organic preferred, urgent delivery"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <Button
          title={isSubmitting ? "Adding Product..." : "Add Product"}
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={styles.submitButton}
        />
      </View>

      <CustomToast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
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
});