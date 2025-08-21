import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks
import { useRestockSession } from './hooks/useRestockSession';
import { useProductForm } from './hooks/useProductForm';

// Components
import { ProductForm } from './components/ProductForm';
import CustomToast from '../../components/CustomToast';

// Styles
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';

export default function AddProductScreen() {
  const { pendingName } = useLocalSearchParams();
  const router = useRouter();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  
  // Hooks
  const currentSession = useRestockSession();
  const productForm = useProductForm();
  
  // Local state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = useCallback(async (values: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // If no active session, create one first
      if (!currentSession.session) {
        const sessionName = (pendingName as string) || `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        console.log('[AddProductScreen] Creating new session for first product:', sessionName);
        const sessionResult = await currentSession.createSession(sessionName);
        
        if (!sessionResult.success) {
          setToastMessage(sessionResult.error || 'Failed to create session');
          return;
        }
        
        setToastMessage('Session created! Adding product...');
      }

      // Now add the product
      const result = await currentSession.addProduct({
        productName: values.productName,
        quantity: values.quantity,
        supplierName: values.supplierName,
        supplierEmail: values.supplierEmail,
        notes: values.notes
      });

      if (result.success) {
        setToastMessage('Product added successfully!');
        
        // Reset form
        productForm.resetForm();
        
        // Navigate back to the main screen after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setToastMessage(result.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('[AddProductScreen] Error adding product:', error);
      setToastMessage('An error occurred while adding the product');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSession, productForm, pendingName, router]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    // If we have unsaved changes, show confirmation
    if (productForm.formData.productName || productForm.formData.quantity || productForm.formData.supplierName) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  }, [productForm.formData, router]);

  return (
    <SafeAreaView style={restockSessionsStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#DEE2E6',
        backgroundColor: '#FEFDF9'
      }}>
        <TouchableOpacity 
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12
          }}
          onPress={handleBack}
        >
          <Text style={{
            fontFamily: 'Satoshi-Regular',
            fontSize: 16,
            color: '#6C757D'
          }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{
          fontFamily: 'Satoshi-Bold',
          fontSize: 18,
          fontWeight: '600',
          color: '#212529'
        }}>
          {currentSession.session ? 'Add Product' : 'Start New Session'}
        </Text>
        <View style={{ width: 60 }} /> {/* Spacer for centering */}
      </View>

      {/* Content */}
      <ScrollView 
        style={restockSessionsStyles.container}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{
          backgroundColor: '#FEFDF9',
          borderRadius: 12,
          padding: 20,
          borderWidth: 1,
          borderColor: '#DEE2E6'
        }}>
          <ProductForm
            isNewSession={!currentSession.session}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </View>
      </ScrollView>

      {/* Toast Message */}
      {toastMessage && (
        <CustomToast
          visible={true}
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
          type="info"
        />
      )}
    </SafeAreaView>
  );
}
