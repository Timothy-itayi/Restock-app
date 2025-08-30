// screens/AddProductScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Alert, DeviceEventEmitter, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';
import { ProductForm } from './components/ProductForm';
import CustomToast from '../../components/CustomToast';
import { useSessionContext } from './context/SessionContext';
import { useRepositories } from '../../infrastructure/supabase/SupabaseHooksProvider';
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';

export default function AddProductScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const styles = useThemedStyles(getRestockSessionsStyles);
  const { userId } = useUnifiedAuth();
  const { sessionRepository, productRepository, isSupabaseReady } = useRepositories();
  const sessionContext = useSessionContext();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingName = params?.pendingName ?? '';
  const sessionId = typeof params?.sessionId === 'string' ? params.sessionId : '';
  const isExistingSession = params?.isExistingSession === 'true';

  // 🔧 NEW: Load existing session if provided
  useEffect(() => {
    if (isExistingSession && sessionId && !sessionContext.currentSession) {
      console.log('🔄 Loading existing session for add-product:', sessionId);
      sessionContext.loadExistingSession(sessionId);
    }
  }, [isExistingSession, sessionId, sessionContext.currentSession, sessionContext.loadExistingSession]);

  const handleBack = useCallback(() => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to go back without saving?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]
    );
  }, [router]);

  const handleAddProduct = useCallback(async (values: any) => {
    if (!isSupabaseReady || !userId) {
      setToastMessage('System not ready');
      return;
    }

    setIsSubmitting(true);
    try {
      let sessionToUse = sessionContext.currentSession;

      if (!sessionToUse) {
        const result = await sessionContext.startNewSession(pendingName as string || `Restock ${new Date().toLocaleDateString()}`);
        if (!result.success) throw new Error(result.error || 'Failed to create session');
        sessionToUse = sessionContext.currentSession;
        setToastMessage('Session created!');
      }

             const addResult = await sessionContext.addProduct(values);
       if (addResult.success) {
         setToastMessage('Product added successfully!');
         
         // 🔧 NEW: Emit event to notify main screen that product was added
         DeviceEventEmitter.emit('restock:productAdded', {
           sessionId: sessionToUse?.toValue()?.id,
           productName: values.productName
         });
         
         setTimeout(() => router.back(), 1500);
       } else {
         setToastMessage(`Failed: ${addResult.error}`);
       }
    } catch (err) {
      setToastMessage('Error adding product');
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionContext, router, pendingName, userId, isSupabaseReady]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.sessionHeader}>
        <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 12 }} onPress={handleBack}>
          <Text style={{ fontFamily: 'Satoshi-Regular', fontSize: 16, color: '#6C757D' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.sessionHeaderTitle}>
          {sessionContext.currentSession 
            ? `Add Product to ${sessionContext.currentSession.toValue().name}`
            : 'Start New Session'
          }
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <View style={styles.formContainer}>
          <ProductForm
            onSubmit={handleAddProduct}
            isSubmitting={isSubmitting}
          />
        </View>
      </ScrollView>
      <CustomToast message={toastMessage || ''} onDismiss={() => setToastMessage(null)} />
    </SafeAreaView>
  );
}
