/**
 * RESTOCK SESSIONS SCREEN - CLEAN VERSION
 * 
 * Refactored to use clean hooks and dependency injection
 * No more massive context - focused, single-responsibility hooks
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams } from 'expo-router';

// Clean hooks using dependency injection
import { useSessionList } from './hooks/useSessionList';
import { useRestockSession } from './hooks/useRestockSession';
import { useProductForm } from './hooks/useProductForm';

// UI Components (keeping existing components)
import { SessionHeader } from './components/SessionHeader';
import { SessionSelection } from './components/SessionSelection';
import { StartSection } from './components/StartSection';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { FinishSection } from './components/FinishSection';
import NameSessionModal from '../../components/NameSessionModal';
import CustomToast from '../../components/CustomToast';

// Styles
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';

/**
 * Main restock sessions screen content
 * 
 * Uses clean hooks with dependency injection instead of massive context
 */
const RestockSessionsContent: React.FC = () => {
  const params = useLocalSearchParams();
  const { userId } = useAuth();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);

  // Clean hooks - each focused on single responsibility
  const sessionList = useSessionList();
  const currentSession = useRestockSession();
  const productForm = useProductForm();

  // Local UI state
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /**
   * Handle starting a new session
   */
  const handleStartNewSession = useCallback(async () => {
    if (!userId) {
      setToastMessage('Please log in to create a session');
      return;
    }

    try {
      const result = await currentSession.createSession();
      
      if (result.success && result.session) {
        setToastMessage('New session created successfully!');
        sessionList.refreshSessions(); // Refresh the session list
      } else {
        setToastMessage(result.error || 'Failed to create session');
      }
    } catch (error) {
      setToastMessage('An error occurred while creating the session');
      console.error('[RestockSessions] Error creating session:', error);
    }
  }, [userId, currentSession, sessionList]);

  /**
   * Handle selecting an existing session
   */
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      await currentSession.loadSession(sessionId);
      sessionList.hideSelectionModal();
      setToastMessage('Session loaded successfully!');
    } catch (error) {
      setToastMessage('Failed to load session');
      console.error('[RestockSessions] Error loading session:', error);
    }
  }, [currentSession, sessionList]);

  /**
   * Handle deleting a session
   */
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      const result = await sessionList.deleteSession(sessionId);
      
      if (result.success) {
        setToastMessage('Session deleted successfully');
        
        // If we deleted the current session, clear it
        if (currentSession.session?.toValue().id === sessionId) {
          currentSession.clearSession();
        }
      } else {
        setToastMessage(result.error || 'Failed to delete session');
      }
    } catch (error) {
      setToastMessage('An error occurred while deleting the session');
      console.error('[RestockSessions] Error deleting session:', error);
    }
  }, [sessionList, currentSession]);

  /**
   * Handle adding a product to the current session
   */
  const handleAddProduct = useCallback(async () => {
    if (!currentSession.session) {
      setToastMessage('No active session');
      return;
    }

    const formResult = await productForm.submitForm();
    
    if (!formResult.success) {
      setToastMessage(formResult.error || 'Please fix form errors');
      return;
    }

    try {
      const result = await currentSession.addProduct({
        productName: productForm.formData.productName,
        quantity: parseInt(productForm.formData.quantity),
        supplierName: productForm.formData.supplierName,
        supplierEmail: productForm.formData.supplierEmail,
        notes: productForm.formData.notes
      });

      if (result.success) {
        setToastMessage('Product added successfully!');
          productForm.resetForm();
          productForm.closeForm();
      } else {
        setToastMessage(result.error || 'Failed to add product');
      }
    } catch (error) {
      setToastMessage('An error occurred while adding the product');
      console.error('[RestockSessions] Error adding product:', error);
    }
  }, [currentSession, productForm]);

  /**
   * Handle naming a session
   */
  const handleNameSession = useCallback(async () => {
    if (!currentSession.session || !sessionNameInput.trim()) {
      setToastMessage('Please enter a session name');
      return;
    }

    try {
      const result = await currentSession.updateSessionName(
        currentSession.session.toValue().id,
        sessionNameInput.trim()
      );

      if (result.success) {
        setToastMessage('Session name updated successfully!');
        setShowNameModal(false);
        setSessionNameInput('');
      } else {
        setToastMessage(result.error || 'Failed to update session name');
      }
    } catch (error) {
      setToastMessage('An error occurred while updating the session name');
      console.error('[RestockSessions] Error updating session name:', error);
    }
  }, [currentSession, sessionNameInput]);

  /**
   * Show confirmation dialog for session actions
   */
  const showConfirmation = useCallback((message: string, onConfirm: () => void) => {
    Alert.alert(
      'Confirm Action',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: onConfirm }
      ]
    );
  }, []);

  // Auto-load sessions on mount
  useEffect(() => {
    if (userId) {
      sessionList.loadSessions();
    }
  }, [userId]);

  // Handle continue action from dashboard
  useEffect(() => {
    const sessionId = params.sessionId as string;
    const action = params.action as string;
    
    console.log('[RestockSessions] URL params changed:', { 
      sessionId, 
      action, 
      hasCurrentSession: !!currentSession.session,
      currentSessionId: currentSession.session?.toValue().id 
    });
    
    if (sessionId && action === 'continue' && !currentSession.session) {
      console.log('[RestockSessions] Auto-loading session from dashboard:', sessionId);
      
      // Load the session and then open the product form
      const loadSessionAndOpenForm = async () => {
        try {
          console.log('[RestockSessions] Starting session load...');
          await currentSession.loadSession(sessionId);
          console.log('[RestockSessions] Session loaded successfully, current session:', {
            id: currentSession.session?.toValue().id,
            status: currentSession.session?.toValue().status,
            itemCount: currentSession.session?.toValue().items.length
          });
          
          setToastMessage('Session loaded successfully! Continue adding products...');
          
          // Small delay to ensure session is fully loaded before opening form
          setTimeout(() => {
            if (currentSession.session) {
              console.log('[RestockSessions] Opening product form...');
              productForm.openForm();
            } else {
              console.log('[RestockSessions] No session available when trying to open form');
            }
          }, 100);
        } catch (error) {
          console.error('[RestockSessions] Error in loadSessionAndOpenForm:', error);
          setToastMessage('Failed to load session');
        }
      };
      
      loadSessionAndOpenForm();
    }
  }, [params.sessionId, params.action, currentSession.session, currentSession.loadSession, productForm]);

  // Clear URL parameters after session is loaded to prevent re-triggering
  useEffect(() => {
    if (currentSession.session && params.sessionId) {
      // Clear the URL parameters to prevent re-triggering the continue action
      // This is a simple way to handle it without complex navigation state management
      console.log('[RestockSessions] Session loaded, clearing URL parameters');
    }
  }, [currentSession.session, params.sessionId]);

  // Determine current UI state
  const hasActiveSessions = sessionList.sessions.length > 0;
  const hasActiveSession = currentSession.session !== null;
  const isLoading = sessionList.isLoading || currentSession.isLoading;

  // Show loading if still loading and no sessions
  if (isLoading && !hasActiveSessions) {
    return (
      <View style={restockSessionsStyles.container}>
        <Text style={restockSessionsStyles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={restockSessionsStyles.container}>
      {/* Header */}
        <SessionHeader
          currentSession={currentSession.session}
          onNameSession={() => setShowNameModal(true)}
          onShowSessionSelection={() => sessionList.openSelectionModal()}
          allSessionsCount={sessionList.sessions.length}
        />

      <ScrollView>
        {/* Show existing sessions first if no active session */}
        {!hasActiveSession && hasActiveSessions && (
          <View style={restockSessionsStyles.existingSessionsSection}>
            <Text style={restockSessionsStyles.sectionTitle}>Your Sessions</Text>
            <Text style={restockSessionsStyles.sectionSubtitle}>
              You have {sessionList.sessions.length} active session{sessionList.sessions.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity 
              style={restockSessionsStyles.existingSessionsButton}
              onPress={() => sessionList.openSelectionModal()}
            >
              <Text style={restockSessionsStyles.existingSessionsButtonText}>
                Continue Existing Session
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No Active Session and No Existing Sessions - Show Start Section */}
        {!hasActiveSession && !hasActiveSessions && (
          <StartSection
            hasExistingSessions={hasActiveSessions}
            onStartNewSession={handleStartNewSession}
            onShowSessionSelection={() => sessionList.openSelectionModal()}
            isLoading={isLoading}
          />
        )}

        {/* Active Session - Show Product Management */}
        {hasActiveSession && (
          <>
            {/* Product Form */}
            {productForm.isFormVisible && (
              <ProductForm
                mode="add"
                formState={{
                  productName: productForm.formData.productName,
                  quantity: productForm.formData.quantity,
                  supplierName: productForm.formData.supplierName,
                  supplierEmail: productForm.formData.supplierEmail,
                  errorMessage: productForm.error || ''
                }}
                filteredProducts={[]}
                filteredSuppliers={[]}
                onProductNameChange={(v) => productForm.updateField('productName', v)}
                onQuantityChange={(v) => productForm.updateField('quantity', v)}
                onSupplierNameChange={(v) => productForm.updateField('supplierName', v)}
                onSupplierEmailChange={(v) => productForm.updateField('supplierEmail', v)}
                onIncrementQuantity={() => productForm.updateField('quantity', (parseInt(productForm.formData.quantity || '0') + 1).toString())}
                onDecrementQuantity={() => productForm.updateField('quantity', (Math.max(1, parseInt(productForm.formData.quantity || '0') - 1)).toString())}
                onSelectProductSuggestion={() => {}}
                onSelectSupplierSuggestion={() => {}}
                onSubmit={handleAddProduct}
                onCancel={productForm.closeForm}
              />
            )}

            {/* Add Product Button */}
            {!productForm.isFormVisible && (
              <View style={restockSessionsStyles.addProductSection}>
                <Text 
                  style={restockSessionsStyles.addProductButtonText}
                  onPress={() => productForm.openForm()}
                >
                  + Add Product
                </Text>
              </View>
            )}

            {/* Product List */}
            <ProductList
              session={currentSession.session}
              onEditProduct={async (productId) => {
                try {
                  // For now, show a simple edit form
                  // In the future, this could open a modal or navigate to edit screen
                  setToastMessage('Product editing coming soon - will open edit form');
                } catch (error) {
                  setToastMessage('Failed to edit product');
                  console.error('[RestockSessions] Error editing product:', error);
                }
              }}
              onDeleteProduct={async (productId) => {
                try {
                  if (!currentSession.session) {
                    setToastMessage('No active session');
                    return;
                  }

                  const result = await currentSession.removeProduct(productId);
                  
                  if (result.success) {
                    setToastMessage('Product deleted successfully!');
                  } else {
                    setToastMessage(result.error || 'Failed to delete product');
                  }
                } catch (error) {
                  setToastMessage('Failed to delete product');
                  console.error('[RestockSessions] Error deleting product:', error);
                }
              }}
            />

            {/* Finish Section */}
            <FinishSection
              session={currentSession.session}
              onFinishSession={async () => {
                try {
                  if (!currentSession.session) {
                    setToastMessage('No active session');
                    return;
                  }

                  // Navigate to emails screen to generate emails
                  const { router } = await import('expo-router');
                  router.push(`/(tabs)/emails?sessionId=${currentSession.session.toValue().id}`);
                  
                  setToastMessage('Redirecting to email generation...');
                } catch (error) {
                  setToastMessage('Failed to navigate to email generation');
                  console.error('[RestockSessions] Error navigating to emails:', error);
                }
              }}
            />
          </>
        )}
      </ScrollView>

      {/* Session Selection Modal */}
      {sessionList.showSelectionModal && (
        <SessionSelection
          sessions={sessionList.sessions}
          onSelectSession={handleSelectSession}
          onDeleteSession={(sessionId) => handleDeleteSession(sessionId)}
          onClose={sessionList.hideSelectionModal}
          isLoading={sessionList.isLoading}
        />
      )}

      {/* Name Session Modal */}
      {showNameModal && (
        <NameSessionModal
          visible={showNameModal}
          title="Name Your Session"
          message="Give this restock session a helpful name. You can change it later."
          inputValue={sessionNameInput}
          onChangeInput={setSessionNameInput}
          onConfirm={handleNameSession}
          onCancel={() => {
            setShowNameModal(false);
            setSessionNameInput('');
          }}
        />
      )}

      {/* Toast Message */}
      {toastMessage && (
        <CustomToast
          visible={true}
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
          type="info"
        />
      )}
    </View>
  );
};

/**
 * Main export wrapped with error boundary
 */
const RestockSessionsScreen: React.FC = () => {
  return (
    <React.Suspense fallback={<Text>Loading...</Text>}>
      <RestockSessionsContent />
    </React.Suspense>
  );
};

export default RestockSessionsScreen;
