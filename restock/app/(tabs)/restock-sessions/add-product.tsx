import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Auth
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';

// Hooks
import { useProductForm } from './hooks/useProductForm';
import { useSessionContext } from './context/SessionContext';
import { useRepositories } from '../../infrastructure/supabase/SupabaseHooksProvider';

// Components
import { ProductForm } from './components/ProductForm';
import CustomToast from '../../components/CustomToast';

// Styles
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';

export default function AddProductScreen() {
  // Params
  const params = useLocalSearchParams();
  const pendingName = params?.pendingName ?? '';
  const sessionId = params?.sessionId ?? '';
  const isExistingSession = params?.isExistingSession === 'true';

  const router = useRouter();
  const { userId } = useUnifiedAuth();
  const { sessionRepository, productRepository, isSupabaseReady } = useRepositories();
  const sessionContext = useSessionContext();
  const productForm = useProductForm();

  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  /** --- Async initialization effect --- */
  useEffect(() => {
    const init = async () => {
      if (!userId || !isSupabaseReady) return;

      setIsInitializing(true);

      try {
        console.log('🔄 AddProductScreen: Initializing with params:', {
          sessionId,
          isExistingSession,
          pendingName,
          hasCurrentSession: !!sessionContext.currentSession
        });

        // Load existing session if needed
        if (isExistingSession && sessionId) {
          console.log('🔄 AddProductScreen: Loading existing session:', sessionId);
          await sessionContext.loadExistingSession(sessionId as string);
          
          // Verify the session was loaded
          if (!sessionContext.currentSession) {
            console.error('❌ AddProductScreen: Failed to load existing session after loadExistingSession call');
            setToastMessage('Failed to load existing session. Please try again.');
            return;
          }
          
          console.log('✅ AddProductScreen: Existing session loaded successfully:', sessionContext.currentSession.toValue().id);
        }
        // Start new session if none exists
        else if (!sessionContext.currentSession) {
          if (pendingName) {
            console.log('🔄 AddProductScreen: Starting new session with name:', pendingName);
            await sessionContext.startNewSession(pendingName as string);
          }
        }
        
        console.log('✅ AddProductScreen: Initialization complete. Current session:', sessionContext.currentSession?.toValue().id);
      } catch (error) {
        console.error('❌ AddProductScreen init error:', error);
        setToastMessage('Failed to initialize session');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [userId, isSupabaseReady, sessionId, isExistingSession, pendingName, sessionContext.loadExistingSession, sessionContext.startNewSession]);

  /** --- Form submission handler --- */
  const handleSubmit = useCallback(async (values: {
    productName: string;
    quantity: number;
    supplierName: string;
    supplierEmail: string;
    notes?: string;
  }) => {
    if (!isSupabaseReady || !sessionRepository || !productRepository) {
      setToastMessage('System not ready. Please try again.');
      return;
    }

    if (!userId) {
      setToastMessage('No authenticated user found.');
      return;
    }

    setIsSubmitting(true);

    try {
      let sessionToUse = sessionContext.currentSession;

      if (!sessionToUse) {
        const sessionName = pendingName || `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const result = await sessionContext.startNewSession(sessionName as string);
        if (!result.success) throw new Error(result.error || 'Failed to create session');
        sessionToUse = sessionContext.currentSession;
        setToastMessage('Session created! Adding product...');
      }

      if (!sessionToUse) throw new Error('No session available');

      await sessionRepository.addItem(sessionToUse.id, {
        productId: `temp_${Date.now()}`,
        productName: values.productName,
        quantity: values.quantity,
        supplierId: `temp_${Date.now()}`,
        supplierName: values.supplierName,
        supplierEmail: values.supplierEmail,
        notes: values.notes
      });

      setToastMessage('Product added successfully!');
      productForm.resetForm();
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error('[AddProductScreen] Error adding product:', error);
      setToastMessage('An error occurred while adding the product');
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionContext, productForm, pendingName, router, isSupabaseReady, sessionRepository, productRepository, userId]);

  /** --- Back navigation handler --- */
  const handleBack = useCallback(() => {
    const formData = productForm?.formData;
    if (formData?.productName || formData?.quantity || formData?.supplierName) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else router.back();
  }, [productForm?.formData, router]);

  // 🔍 NEW: Debug form dependencies
  useEffect(() => {
    console.log('🔍 AddProductScreen: Form dependencies check:', {
      hasProductForm: !!productForm,
      isSupabaseReady,
      hasSessionRepository: !!sessionRepository,
      hasProductRepository: !!productRepository,
      currentSession: !!sessionContext.currentSession
    });
  }, [productForm, isSupabaseReady, sessionRepository, productRepository, sessionContext.currentSession]);

  /** --- Render loading state if initializing --- */
  if (isInitializing || sessionContext.isSessionLoading) {
    console.log('🔄 AddProductScreen: Showing loading state - isInitializing:', isInitializing, 'isSessionLoading:', sessionContext.isSessionLoading);
    return (
      <SafeAreaView style={[restockSessionsStyles.container, { paddingTop: 20, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={{ marginTop: 12, color: '#666' }}>Initializing session...</Text>
      </SafeAreaView>
    );
  }

  // 🔍 NEW: Show error state if we're supposed to have a session but don't
  if (isExistingSession && sessionId && !sessionContext.currentSession) {
    console.log('❌ AddProductScreen: Showing session loading failed state');
    return (
      <SafeAreaView style={[restockSessionsStyles.container, { paddingTop: 20, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#dc3545', textAlign: 'center', marginBottom: 16 }}>
          Session Loading Failed
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 }}>
          Unable to load the session. This might be a temporary issue.
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#6B7F6B', 
            paddingHorizontal: 24, 
            paddingVertical: 12, 
            borderRadius: 8 
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  console.log('✅ AddProductScreen: Reached main render logic. About to render form...');

  return (
    <SafeAreaView style={[restockSessionsStyles.container, { paddingTop: 20 }]}>
      {/* Header */}
      <View style={restockSessionsStyles.sessionHeader}>
        <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 12 }} onPress={handleBack}>
          <Text style={{ fontFamily: 'Satoshi-Regular', fontSize: 16, color: '#6C757D' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={restockSessionsStyles.sessionHeaderTitle}>
          {sessionContext.currentSession ? `Add Product to ${sessionContext.currentSession.toValue().name}` : 'Start New Session'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Form */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[restockSessionsStyles.formContainer, { minHeight: '100%' }]}>
          {/* 🔍 NEW: Debug form dependencies right before rendering */}
          {(() => {
            console.log('🔍 AddProductScreen: Form rendering condition check:', {
              hasProductForm: !!productForm,
              isSupabaseReady,
              hasSessionRepository: !!sessionRepository,
              hasProductRepository: !!productRepository,
              currentSession: !!sessionContext.currentSession,
              allReady: !!(productForm && isSupabaseReady && sessionRepository && productRepository)
            });
            return null;
          })()}
          
          {productForm && isSupabaseReady && sessionRepository && productRepository ? (
            <React.Suspense fallback={<Text style={{ textAlign: 'center', color: '#666' }}>Loading form...</Text>}>
              <ProductForm
                isNewSession={!sessionContext.currentSession}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </React.Suspense>
          ) : (
            <View style={{ padding: 20 }}>
              <Text style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
                Loading form...
              </Text>
              {/* 🔍 NEW: Show which dependency is missing */}
              <Text style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
                Missing: {[
                  !productForm && 'Product Form',
                  !isSupabaseReady && 'Supabase',
                  !sessionRepository && 'Session Repository',
                  !productRepository && 'Product Repository'
                ].filter(Boolean).join(', ') || 'All ready'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast */}
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
