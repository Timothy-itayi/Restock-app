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
  // Params
  let params: Record<string, any> = {};
  let pendingName = '';
  try {
    params = useLocalSearchParams();
    pendingName = params?.pendingName ?? '';
  } catch (error) {
    console.error('❌ AddProductScreen: useLocalSearchParams error:', error);
  }

  const router = useRouter();

  // Styles
  let restockSessionsStyles;
  try {
    restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  } catch (error) {
    console.error('❌ AddProductScreen: Styles error:', error);
    restockSessionsStyles = {
      container: { flex: 1, backgroundColor: '#fff' },
      sessionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
      sessionHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
      formContainer: { flex: 1, padding: 20 }
    };
  }

  // Hooks
  let currentSession;
  let productForm;
  try {
    currentSession = useRestockSession();
    productForm = useProductForm();
  } catch (error) {
    console.error('❌ AddProductScreen: Hook error:', error);
    currentSession = { 
      session: null, 
      createSession: async () => ({ success: false, error: 'Hook error' }),
      addProduct: async () => ({ success: false, error: 'Hook error' })
    };
    productForm = { resetForm: () => {}, formData: {} };
  }

  // Local state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug logs
  console.log('🔍 AddProductScreen: Params received:', params);
  console.log('🔍 AddProductScreen: Pending name:', pendingName);
  console.log('🔍 AddProductScreen: Hooks loaded:', { currentSession: !!currentSession, productForm: !!productForm });

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
      if (!currentSession.session) {
        const sessionName = pendingName || `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const sessionResult = await currentSession.createSession(sessionName);

        if (!sessionResult.success) {
          setToastMessage(sessionResult.error ?? 'Failed to create session');
          return;
        }

        setToastMessage('Session created! Adding product...');
      }

      const result = await currentSession.addProduct(values);

      if (result.success) {
        setToastMessage('Product added successfully!');
        productForm.resetForm();
        setTimeout(() => router.back(), 1500);
      } else {
        setToastMessage(result.error ?? 'Failed to add product');
      }
    } catch (error) {
      console.error('[AddProductScreen] Error adding product:', error);
      setToastMessage('An error occurred while adding the product');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSession, productForm, pendingName, router]);

  // Handle back
  const handleBack = useCallback(() => {
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
    <SafeAreaView style={[restockSessionsStyles.container, { paddingTop: 20 }]}>
      {/* Header */}
      <View style={restockSessionsStyles.sessionHeader}>
        <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 12 }} onPress={handleBack}>
          <Text style={{ fontFamily: 'Satoshi-Regular', fontSize: 16, color: '#6C757D' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={restockSessionsStyles.sessionHeaderTitle}>
          {currentSession?.session ? 'Add Product' : 'Start New Session'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Form */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={restockSessionsStyles.formContainer}>
          {productForm && currentSession ? (
            <React.Suspense fallback={<Text style={{ textAlign: 'center', color: '#666' }}>Loading form...</Text>}>
              <ProductForm
                isNewSession={!currentSession.session}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </React.Suspense>
          ) : (
            <Text style={{ textAlign: 'center', color: '#666' }}>Loading form...</Text>
          )}
        </View>
      </ScrollView>

      {/* Toast */}
      {toastMessage && (
        <CustomToast
          visible={true}
          message={toastMessage as string}
          onDismiss={() => setToastMessage(null)}
          type="info"
        />
      )}
    </SafeAreaView>
  );
}
