import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';
import CustomToast from '../../../lib/components/CustomToast';
import { ProductForm } from '../../../lib/components/restock-sessions/ProductForm';
import { useSessionContext } from '../../../lib/contexts/restock-sessions/SessionContext';
import { useRepositories } from '../../../lib/infrastructure/_supabase/SupabaseHooksProvider';
import { useSafeTheme } from '../../../lib/stores/useThemeStore';
import { AppColors } from '../../../lib/theme/colors';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';

export default function EditProductScreen() {
  const router = useRouter();
  const { userId } = useUnifiedAuth();
  const { sessionRepository, productRepository, isSupabaseReady } = useRepositories();
  const sessionContext = useSessionContext();
  const t = useSafeTheme();
  const restockSessionsStyles = getRestockSessionsStyles(t.theme as AppColors);

  const params = useLocalSearchParams();
  const editData = useMemo(() => ({
    sessionId: params?.sessionId ?? '',
    editProductId: Array.isArray(params?.editProductId) ? params.editProductId[0] : params?.editProductId ?? '',
    editProductName: Array.isArray(params?.editProductName) ? params.editProductName[0] : params?.editProductName ?? '',
    editQuantity: Array.isArray(params?.editQuantity) ? params.editQuantity[0] : params?.editQuantity ?? '',
    editSupplierName: Array.isArray(params?.editSupplierName) ? params.editSupplierName[0] : params?.editSupplierName ?? '',
    editSupplierEmail: Array.isArray(params?.editSupplierEmail) ? params.editSupplierEmail[0] : params?.editSupplierEmail ?? '',
    editNotes: Array.isArray(params?.editNotes) ? params.editNotes[0] : params?.editNotes ?? '',
  }), [params]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitialized = useRef(false);
  const [initialFormValues, setInitialFormValues] = useState<any>();

  useEffect(() => {
    if (hasInitialized.current || !userId || !isSupabaseReady || !editData.sessionId || !editData.editProductId) return;

    const init = async () => {
      hasInitialized.current = true;
      setIsInitializing(true);

      try {
        await sessionContext.loadExistingSession(editData.sessionId as string);
        const sessionData = sessionContext.currentSession?.toValue ? sessionContext.currentSession.toValue() : sessionContext.currentSession;
        const productItem = sessionData?.items?.find(item => item.productId === editData.editProductId);

        if (!productItem) { setToastMessage('Product not found'); return; }
        setInitialFormValues({
          productName: productItem.productName || editData.editProductName || '',
          quantity: (productItem.quantity || editData.editQuantity || '1').toString(),
          supplierName: productItem.supplierName || editData.editSupplierName || '',
          supplierEmail: productItem.supplierEmail || editData.editSupplierEmail || '',
          notes: productItem.notes || editData.editNotes || ''
        });
      } catch (err) {
        setToastMessage('Failed to load session or product');
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [userId, isSupabaseReady, editData, sessionContext]);

  const handleSubmit = useCallback(async (values: any) => {
    if (!isSupabaseReady || !sessionRepository || !productRepository || !userId || !editData.editProductId) {
      setToastMessage('System not ready');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sessionContext.editProduct(editData.editProductId, values);
      if (result.success) {
        // Navigate back immediately to avoid showing stale content
        router.back();
        return;
      }
      setToastMessage(`Failed: ${result.error}`);
    } catch (err) {
      setToastMessage('Error updating product');
    } finally { setIsSubmitting(false); }
  }, [sessionContext, router, isSupabaseReady, sessionRepository, productRepository, userId, editData.editProductId]);

  const handleBack = useCallback(() => {
    Alert.alert('Discard Changes?', 'You have unsaved changes. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() }
    ]);
  }, [router]);

  if (isInitializing || (sessionContext.isSessionLoading && !isSubmitting)) return (
    <SafeAreaView style={[restockSessionsStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" />
      <Text>Loading product...</Text>
    </SafeAreaView>
  );

  if (!initialFormValues) return (
    <SafeAreaView style={[restockSessionsStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text>Product not found or session failed</Text>
      <TouchableOpacity onPress={() => router.back()}><Text>Go Back</Text></TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={restockSessionsStyles.EditProductcontainer}>
      <View style={restockSessionsStyles.sessionHeader}>
        <TouchableOpacity onPress={handleBack}><Text>← Back</Text></TouchableOpacity>
        <Text style={restockSessionsStyles.sessionHeaderTitle}>Edit Product</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView >
        <ProductForm
          initialValues={initialFormValues}
          isEditMode
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}

        />
      </ScrollView>

      {isSubmitting && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Saving changes…</Text>
        </View>
      )}

      {toastMessage && <CustomToast visible message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </SafeAreaView>
  );
}
