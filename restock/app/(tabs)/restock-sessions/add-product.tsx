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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddProductScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const styles = useThemedStyles(getRestockSessionsStyles);
  const { userId } = useUnifiedAuth();
  const { sessionRepository, productRepository, isSupabaseReady } = useRepositories();
  const sessionContext = useSessionContext();

  // Debug logging for repository readiness
  console.log('🔍 AddProduct: Repository state:', {
    isSupabaseReady,
    hasSessionRepository: !!sessionRepository,
    hasProductRepository: !!productRepository,
    userId: !!userId
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear "system initializing" message when repositories become ready
  useEffect(() => {
    if (isSupabaseReady && toastMessage === 'System initializing - please try again in a moment') {
      setToastMessage(null);
    }
  }, [isSupabaseReady, toastMessage]);

  const [finalPendingName, setFinalPendingName] = useState<string>('');

  const pendingName = Array.isArray(params?.pendingName) ? params.pendingName[0] : params?.pendingName ?? '';
  const sessionId = Array.isArray(params?.sessionId) ? params.sessionId[0] : (typeof params?.sessionId === 'string' ? params.sessionId : '');
  const isExistingSession = params?.isExistingSession === 'true';

  // 🔧 DEBUG: Log navigation parameters and check AsyncStorage fallback
  useEffect(() => {
    const checkPendingName = async () => {
      console.log('🔍 AddProduct: Navigation params received:', {
        pendingName,
        sessionId,
        isExistingSession,
        allParams: params
      });

      let nameToUse = pendingName;

      // If no pendingName from params, check AsyncStorage for fallback
      if (!nameToUse) {
        try {
          const storedName = await AsyncStorage.getItem('pendingSessionName');
          if (storedName) {
            console.log('🔍 AddProduct: Found fallback name in AsyncStorage:', storedName);
            nameToUse = storedName;
            // Clear the stored name since we're using it
            await AsyncStorage.removeItem('pendingSessionName');
          }
        } catch (error) {
          console.error('❌ AddProduct: Error checking AsyncStorage for pending name:', error);
        }
      }

      // If still no name, use a default
      if (!nameToUse) {
        nameToUse = `Restock ${new Date().toLocaleDateString()}`;
        console.log('🔍 AddProduct: Using default name:', nameToUse);
      }

      setFinalPendingName(nameToUse);
    };

    checkPendingName();
  }, [pendingName, sessionId, isExistingSession, params]);

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
    // Check authentication first
    if (!userId) {
      setToastMessage('User not authenticated');
      return;
    }

    // Check if repositories are ready
    if (!isSupabaseReady) {
      console.log('⏳ AddProduct: System not ready, showing message to user');
      setToastMessage('System initializing - please try again in a moment');
      return;
    }

    setIsSubmitting(true);
    try {
      let sessionToUse = sessionContext.currentSession;

      if (!sessionToUse) {
        console.log('🔍 AddProduct: Creating new session with finalPendingName:', {
          finalPendingName,
          finalPendingNameType: typeof finalPendingName,
          finalPendingNameLength: finalPendingName?.length || 0
        });

        console.log('🔍 AddProduct: Final name to use for session:', finalPendingName);

        const result = await sessionContext.startNewSession(finalPendingName);
        if (!result.success) throw new Error(result.error || 'Failed to create session');
        sessionToUse = sessionContext.currentSession;
        setToastMessage('Session created!');
      }

      const addResult = await sessionContext.addProduct(values);
      if (addResult.success) {
        // 🔧 NEW: Emit event to notify main screen that product was added
        DeviceEventEmitter.emit('restock:productAdded', {
          sessionId: sessionToUse?.toValue()?.id,
          productName: values.productName
        });

        // Immediate navigation for instant feedback
        router.back();

        // No toast delay needed - navigation provides immediate feedback
      } else {
        setToastMessage(`Failed: ${addResult.error}`);
        setIsSubmitting(false); // Reset state on failure
      }
    } catch (err) {
      setToastMessage('Error adding product');
      setIsSubmitting(false); // Reset state on error
    }
    // Remove finally block - handle state reset in success/error cases above
  }, [sessionContext, router, finalPendingName, userId, isSupabaseReady]);

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
            isDisabled={!isSupabaseReady}
          />
        </View>
      </ScrollView>
      <CustomToast message={toastMessage || ''} onDismiss={() => setToastMessage(null)} />
    </SafeAreaView>
  );
}
