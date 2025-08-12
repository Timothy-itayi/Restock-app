import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import { SessionService } from "../../../backend/services/sessions";
import { SecureDataService } from "../../../backend/services/secure-data";
import { RestockSessionsSkeleton } from "../../components/skeleton";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { NameSessionModal } from "../../components";
import { getRestockSessionsStyles } from "../../../styles/components/restock-sessions";
import { useThemedStyles } from "../../../styles/useThemedStyles";
import { RestockSessionProvider, useRestockSessionContext } from "./context/RestockSessionContext";
import {
  SessionSelection,
  StartSection,
  ProductForm,
  ProductList,
  ReplaySuggestions,
  SessionHeader,
  FinishSection,
  // NotificationRenderer,
  // ErrorDisplay
} from "./components";
import { Logger } from "./utils/logger";
import { useAuth } from "@clerk/clerk-expo";
import { Product } from "./utils/types";
import useThemeStore from "../../stores/useThemeStore";

// Main screen component that uses the context
const RestockSessionsContent: React.FC = () => {
  const params = useLocalSearchParams();
  const { userId } = useAuth();
  
  // Use themed styles
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  
  // Reduce noisy render logs
  
  const {
    // State
    allSessions,
    currentSession,
    isSessionActive,
    showSessionSelection,
    isLoadingSessions,
    isDataReady,
    errorState,
    formState,
    filteredProducts,
    filteredSuppliers,
    editingProduct,
    showAddProductForm,
    showEditProductForm,
    storedProducts,
    storedSuppliers,

    // Actions
    startNewSession,
    selectSession,
    deleteSession,
    showSessionSelectionModal,
    updateCurrentSession,
    setSessionName,
    
    updateStoredProducts,
    updateStoredSuppliers,
    handleProductNameChange,
    handleSupplierNameChange,
    selectProductSuggestion,
    selectSupplierSuggestion,
    updateFormField,
    incrementQuantity,
    decrementQuantity,
    addProduct,
    editProduct,
    saveEditedProduct,
    cancelEdit,
    cancelAddProduct,
    setShowAddProductForm,
    showNotification,
   
    loadAllSessions
  } = useRestockSessionContext();

  // Local state for confirmation dialog
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  // Local state for naming modal
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState("");

  // Additional loading state to ensure content is fully ready
  const [isContentReady, setIsContentReady] = useState(false);
  // Track if user has visited this screen before to avoid showing skeleton on first visit
  const [hasVisitedRestock, setHasVisitedRestock] = useState(false);
  // Brief intro delay after auto-creating a session to avoid immediate UI jump
  const [introDelayActive, setIntroDelayActive] = useState(false);

  // Session management functions
  const handleStartNewSession = React.useCallback(async () => {
    const result = await startNewSession();
    if (result.success) {
      showNotification('info', 'New restock session started');
    } else {
      showNotification('error', result.error || 'Failed to start session');
    }
  }, [startNewSession, showNotification]);

  // Prompt for session name before creating (custom modal)
  const promptNewSession = React.useCallback(() => {
    setSessionNameInput("");
    setShowNameModal(true);
  }, []);

  const introTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const unnamedIntroTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleConfirmCreateSession = React.useCallback(async () => {
    // Engage brief intro delay so header shows first before list/forms
    setIntroDelayActive(true);
    introTimerRef.current = setTimeout(() => setIntroDelayActive(false), 900);
    const result = await startNewSession();
    if (result.success && result.session) {
      const trimmed = sessionNameInput.trim();
      if (trimmed.length > 0) {
        try {
          // Persist via centralized setter to keep allSessions and currentSession in sync
          await setSessionName(result.session.id, trimmed);
          showNotification('info', `New session "${trimmed}" started`);
        } catch (error) {
          console.error('Failed to set session name:', error);
          showNotification('info', 'New restock session started');
        }
      } else {
        showNotification('info', 'New restock session started');
      }
    } else {
      showNotification('error', result.error || 'Failed to start session');
    }
    setShowNameModal(false);
  }, [sessionNameInput, startNewSession, setSessionName, showNotification]);

  const handleCreateWithoutName = React.useCallback(async () => {
    // Engage brief intro delay so header shows first before list/forms
    setIntroDelayActive(true);
    unnamedIntroTimerRef.current = setTimeout(() => setIntroDelayActive(false), 900);
    setShowNameModal(false);
    await handleStartNewSession();
  }, [handleStartNewSession]);

  // Log component mount and params
  React.useEffect(() => {
    // Quiet mount logs
  }, [params]);

  // Load sessions when component mounts or user changes.
  // Skip auto-loading when creating a new session to avoid auto-selecting an existing one.
  React.useEffect(() => {
    if (isDataReady && params.action !== 'create') {
      loadAllSessions();
    }
  }, [isDataReady, params.action, loadAllSessions]);

  // Set content ready after both data and sessions are loaded
  React.useEffect(() => {
    if (params.action === 'create') {
      // When explicitly creating a session, avoid skeleton gating
      setIsContentReady(true);
      return;
    }
    if (isDataReady && !isLoadingSessions) {
      // Minimal delay only when not creating
      const delay = 200;
      const timer = setTimeout(() => setIsContentReady(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsContentReady(false);
    }
  }, [isDataReady, isLoadingSessions, allSessions.length, params.action]);

  // Cleanup any pending timers on unmount
  React.useEffect(() => {
    return () => {
      if (introTimerRef.current) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
      if (unnamedIntroTimerRef.current) {
        clearTimeout(unnamedIntroTimerRef.current);
        unnamedIntroTimerRef.current = null;
      }
    };
  }, []);

  // Determine if this is the user's first visit to the Restock screen
  React.useEffect(() => {
    const checkVisited = async () => {
      try {
        const val = await AsyncStorage.getItem('hasVisitedRestock');
        const visited = val === 'true';
        setHasVisitedRestock(visited);
        if (!visited) {
          await AsyncStorage.setItem('hasVisitedRestock', 'true');
        }
      } catch (_) {
        // If storage fails, default to not visited to avoid skeleton
        setHasVisitedRestock(false);
      }
    };
    checkVisited();
  }, []);

  // Debug effect to monitor state changes
  React.useEffect(() => {
    // Quiet frequent state logs
  }, [allSessions.length, currentSession?.id, isSessionActive, showSessionSelection, isDataReady, errorState.hasError, errorState.errorMessage]);

  // Test database connection and session loading
  React.useEffect(() => {
    const testDatabaseConnection = async () => {
      // Quiet DB test logs in production
      if (isDataReady && userId) {
        try {
          await SessionService.getUserSessions(userId);
        } catch (error) {
          // noop
        }
      }
    };
    
    testDatabaseConnection();
  }, [isDataReady]);

  // Handle URL parameters for automatic actions
  useEffect(() => {
    if (params.action === 'create') {
      Logger.info('Preparing to create new session from URL parameter');
      // Show naming modal first to give user chance to set a name
      setSessionNameInput("");
      setShowNameModal(true);
    }
  }, [params.action]);

  const handleSelectSession = (session: any) => {
    const result = selectSession(session);
    if (result.success && result.message) {
      showNotification('info', result.message);
    }
  };

  const handleDeleteSession = async (session: any) => {
    const result = await deleteSession(session);
    if (result.success) {
      showNotification('warning', 'Session deleted');
    } else {
      showNotification('error', result.error || 'Failed to delete session');
    }
  };

  // Product management functions
  const handleRemoveProduct = React.useCallback((productId: string) => {
    if (!currentSession) {
      Logger.error('Cannot remove product: no active session');
      return;
    }

    const productToRemove = currentSession.products.find(p => p.id === productId);
    
    Logger.info('Removing product from session', { 
      productId, 
      productName: productToRemove?.name 
    });
    
    Alert.alert(
      "Remove Product",
      `Are you sure you want to remove "${productToRemove?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              Logger.info('Starting database deletion', { productId, productName: productToRemove?.name });
              
              // Optimistically update UI first for better UX
              const updatedProducts = currentSession.products.filter(p => p.id !== productId);
              updateCurrentSession({
                ...currentSession,
                products: updatedProducts,
              });
              
              // Remove from database (with cleanup of unused products/suppliers)
              const removeResult = await SessionService.removeSessionItemWithCleanup(productId);
              
              Logger.info('Database deletion result', { 
                productId, 
                hasError: !!removeResult.error, 
                error: removeResult.error 
              });
              
              if (removeResult.error) {
                Logger.error('Failed to remove item from database', removeResult.error, { productId });
                // Revert the optimistic update on error
                updateCurrentSession(currentSession);
                showNotification('error', 'Failed to remove product from session');
                return;
              }
              
              Logger.success('Database deletion successful', { productId });
              
              // Show success notification
              showNotification('warning', `${productToRemove?.name} removed from session`);
              
              Logger.success('Product removed from session', { 
                productId, 
                productName: productToRemove?.name,
                remainingProducts: updatedProducts.length 
              });
            } catch (error) {
              Logger.error('Unexpected error removing product', error, { productId });
              // Revert the optimistic update on error
              updateCurrentSession(currentSession);
              showNotification('error', 'Failed to remove product from session');
            }
          }
        }
      ]
    );
  }, [currentSession, updateCurrentSession, showNotification]);

  const handleEditProduct = React.useCallback((product: Product) => {
    editProduct(product);
  }, [editProduct]);

  const handleAddProduct = React.useCallback(() => {
    setShowAddProductForm(true);
  }, [setShowAddProductForm]);

  // Product management functions
  const handleSubmitAddProduct = React.useCallback(async () => {
    if (!currentSession) return;
    
    const result = await addProduct(
      currentSession,
      storedProducts,
      storedSuppliers,
      updateStoredProducts,
      updateStoredSuppliers
    );
    
    if (result.success && result.product) {
      // Update current session with new product
      const updatedSession = {
        ...currentSession,
        products: [...currentSession.products, result.product],
      };
      updateCurrentSession(updatedSession);
      showNotification('success', `${result.product.name} added to restock session`);
    } else {
      showNotification('error', result.error || 'Failed to add product');
    }
  }, [currentSession, addProduct, storedProducts, storedSuppliers, updateStoredProducts, updateStoredSuppliers, updateCurrentSession, showNotification]);

  const handleSaveEditedProduct = async () => {
    if (!editingProduct || !currentSession) return;
    
    const result = await saveEditedProduct();
    if (result.success) {
      // Update the product in current session
      const updatedProducts = currentSession.products.map(p => 
        p.id === editingProduct.id ? {
          ...p,
          name: formState.productName.trim(),
          quantity: parseInt(formState.quantity),
          supplierName: formState.supplierName.trim(),
          supplierEmail: formState.supplierEmail.trim(),
        } : p
      );
      
      updateCurrentSession({
        ...currentSession,
        products: updatedProducts,
      });
      
      showNotification('info', `Updated ${formState.productName}`);
    } else {
      showNotification('error', result.error || 'Failed to update product');
    }
  };

  // Session finishing functions
  const finishSession = async () => {
    Logger.info('Finishing restock session', { 
      sessionId: currentSession?.id,
      productCount: currentSession?.products.length 
    });
    
    if (!currentSession || currentSession.products.length === 0) {
      Logger.warning('Cannot finish session: no products added');
      showNotification('error', 'Please add at least one product before finishing');
      return;
    }

    try {
      // Attempt to update session status to email_generated (remove from active list)
      const updateResult = await SessionService.updateSession(currentSession.id, {
        status: 'email_generated'
      });

      if (updateResult.error) {
        const code = (updateResult.error as any)?.code;
        // If DB check constraint doesn't allow email_generated, proceed anyway
        if (code === '23514') {
          Logger.warning('Database does not allow email_generated status; proceeding without status change', { error: updateResult.error, sessionId: currentSession.id });
          showNotification('info', 'Preparing emails...');
        } else {
          Logger.error('Failed to update session status', updateResult.error, { sessionId: currentSession.id });
          showNotification('error', 'Failed to prepare session for email generation');
          return;
        }
      } else {
        Logger.success('Session status updated to email_generated', { sessionId: currentSession.id, status: updateResult.data.status });
      }

      // Show confirmation dialog regardless if we can proceed
      setShowConfirmationDialog(true);

      Logger.info('Session ready for email generation', {
        productCount: currentSession.products.length,
        supplierCount: new Set(currentSession.products.map(p => p.supplierName)).size
      });
    } catch (error) {
      Logger.error('Unexpected error finishing session', error, { sessionId: currentSession.id });
      showNotification('error', 'Failed to prepare session for email generation');
    }
  };

  const handleGenerateEmails = async () => {
    if (!currentSession) {
      Logger.error('Cannot generate emails: no active session');
      return;
    }

    Logger.info('Generating emails for session', { 
      sessionId: currentSession.id,
      productCount: currentSession.products.length 
    });

    try {
      // Get session items grouped by supplier for email generation
      const groupedItemsResult = await SessionService.getSessionItemsBySupplier(currentSession.id);
      
      if (groupedItemsResult.error) {
        Logger.error('Failed to get session items for email generation', groupedItemsResult.error, { sessionId: currentSession.id });
        showNotification('error', 'Failed to prepare email data');
        return;
      }
      
      Logger.success('Session items retrieved for email generation', { 
        sessionId: currentSession.id,
        supplierCount: Object.keys(groupedItemsResult.data || {}).length 
      });

      // Show success notification
      showNotification('success', `Session completed with ${currentSession.products.length} products`);
      
      // Store session data for the emails screen
      const sessionData = {
        sessionId: currentSession.id,
        createdAt: currentSession.createdAt,
        groupedItems: groupedItemsResult.data,
        products: currentSession.products.map(product => ({
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          supplierName: product.supplierName,
          supplierEmail: product.supplierEmail,
        })),
      };
      
      // Log the complete session data for debugging
      Logger.info('Session data prepared for email generation', {
        sessionId: currentSession.id,
        productCount: sessionData.products.length,
        products: sessionData.products.map(p => ({
          name: p.name,
          quantity: p.quantity,
          supplierName: p.supplierName,
          supplierEmail: p.supplierEmail,
        }))
      });
      
      // Validate that all products have supplier emails
      const productsWithoutEmails = sessionData.products.filter(p => !p.supplierEmail || p.supplierEmail.trim() === '');
      if (productsWithoutEmails.length > 0) {
        Logger.warning('Found products without supplier emails', {
          count: productsWithoutEmails.length,
          products: productsWithoutEmails.map(p => ({ name: p.name, supplierName: p.supplierName }))
        });
      }
      
      // Store the session data in AsyncStorage for the emails screen to access
      await AsyncStorage.setItem('currentEmailSession', JSON.stringify(sessionData));
      
      Logger.success('Session data stored for email generation', { sessionId: currentSession.id });
      
      // Reset session state
      updateCurrentSession(null);
      
      // Close confirmation dialog
      setShowConfirmationDialog(false);
      
      // Navigate to the emails tab
      router.push('/(tabs)/emails');
      
    } catch (error) {
      Logger.error('Failed to prepare email generation', error, { sessionId: currentSession.id });
      showNotification('error', 'Failed to prepare email session');
    }
  };

  const handleCancelEmailGeneration = () => {
    Logger.info('Canceling email generation dialog');
    setShowConfirmationDialog(false);
  };

  // Replay session handler
  const handleReplaySession = async (replayData: any) => {
    try {
      Logger.info('Starting session replay', { 
        productCount: replayData.productCount,
        supplierCount: replayData.supplierCount 
      });

      // Start a new session
      const newSessionResult = await startNewSession();
      if (!newSessionResult.success) {
        showNotification('error', newSessionResult.error || 'Failed to start new session');
        return;
      }

      // Use the newly created session for replay additions
      const sessionForReplay = newSessionResult.session;
      if (!sessionForReplay) {
        showNotification('error', 'Unable to access new session context');
        return;
      }

      // Add all products from the replay data
      for (const product of replayData.products) {
        try {
          // Set form data
          updateFormField('productName', product.name);
          updateFormField('quantity', product.quantity.toString());
          updateFormField('supplierName', product.supplierName);
          updateFormField('supplierEmail', product.supplierEmail);

          // Add the product
          const result = await addProduct(
            sessionForReplay,
            storedProducts,
            storedSuppliers,
            updateStoredProducts,
            updateStoredSuppliers
          );

          if (result.success && result.product) {
            // Update current session with new product
            const updatedSession = {
              ...sessionForReplay,
              products: [...(sessionForReplay.products || []), result.product],
            };
            updateCurrentSession(updatedSession);
          }
        } catch (error) {
          Logger.error('Error adding product during replay', error, { productName: product.name });
        }
      }

      showNotification('success', `Replayed session with ${replayData.products.length} products`);
      Logger.success('Session replay completed', { 
        productCount: replayData.products.length,
        sessionId: sessionForReplay.id 
      });
    } catch (error) {
      Logger.error('Failed to replay session', error);
      showNotification('error', 'Failed to replay session');
    }
  };

  // Form helper functions
  const handleProductFormProductNameChange = (text: string) => {
    handleProductNameChange(text, storedProducts);
  };

  const handleProductFormSupplierNameChange = (text: string) => {
    handleSupplierNameChange(text, storedSuppliers);
  };


  // Render different screens based on state
  const renderMainContent = () => {
    if (showSessionSelection) {
      return (
        <SessionSelection
          allSessions={allSessions}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onStartNewSession={handleStartNewSession}
        />
      );
    }

    if (isSessionActive) {
      return (
        <View style={restockSessionsStyles.sessionContainer}>
          <SessionHeader
            currentSession={currentSession}
            allSessionsCount={allSessions.length}
            onShowSessionSelection={showSessionSelectionModal}
          />

          {/* Main content area */}
          {introDelayActive ? null : showAddProductForm ? (
            <ProductForm
              mode="add"
              formState={formState}
              filteredProducts={filteredProducts}
              filteredSuppliers={filteredSuppliers}
              onProductNameChange={handleProductFormProductNameChange}
              onQuantityChange={(text) => updateFormField('quantity', text)}
              onSupplierNameChange={handleProductFormSupplierNameChange}
              onSupplierEmailChange={(text) => updateFormField('supplierEmail', text)}
              onIncrementQuantity={incrementQuantity}
              onDecrementQuantity={decrementQuantity}
              onSelectProductSuggestion={selectProductSuggestion}
              onSelectSupplierSuggestion={selectSupplierSuggestion}
              onSubmit={handleSubmitAddProduct}
              onCancel={cancelAddProduct}
            />
          ) : showEditProductForm ? (
            <ProductForm
              mode="edit"
              formState={formState}
              filteredProducts={filteredProducts}
              filteredSuppliers={filteredSuppliers}
              editingProduct={editingProduct}
              onProductNameChange={handleProductFormProductNameChange}
              onQuantityChange={(text) => updateFormField('quantity', text)}
              onSupplierNameChange={handleProductFormSupplierNameChange}
              onSupplierEmailChange={(text) => updateFormField('supplierEmail', text)}
              onIncrementQuantity={incrementQuantity}
              onDecrementQuantity={decrementQuantity}
              onSelectProductSuggestion={selectProductSuggestion}
              onSelectSupplierSuggestion={selectSupplierSuggestion}
              onSubmit={handleSaveEditedProduct}
              onCancel={cancelEdit}
            />
          ) : (
            <ProductList
              currentSession={currentSession}
              onEditProduct={handleEditProduct}
              onRemoveProduct={handleRemoveProduct}
              onAddProduct={handleAddProduct}
            />
          )}

          {!introDelayActive && (
            <FinishSection
              currentSession={currentSession}
              showAddProductForm={showAddProductForm}
              showEditProductForm={showEditProductForm}
              onFinishSession={finishSession}
            />
          )}
        </View>
      );
    }

    return (
      <View>
        <ReplaySuggestions 
          userId={userId || undefined}
          onReplaySession={handleReplaySession}
          currentSession={currentSession}
        />
        <StartSection
          allSessions={allSessions}
          onStartNewSession={handleStartNewSession}
          onPromptNewSession={promptNewSession}
          onShowSessionSelection={showSessionSelectionModal}
        />
      </View>
    );
  };

  const theme = useThemeStore.getState().theme;
  return (
    <View style={{ flex: 1, backgroundColor: theme.neutral.lighter }}>
      {/* Notifications */}
      {/* <NotificationRenderer
        notifications={notifications}
        notificationAnimation={notificationAnimation}
        onRemoveNotification={removeNotification}
        getNotificationStyles={getNotificationStyles}
      /> */}
      
      <KeyboardAvoidingView
        style={[restockSessionsStyles.container, { backgroundColor: theme.neutral.lighter }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Error State */}
        {/* <ErrorDisplay
          errorState={errorState}
          onRetry={retryLoadData}
        /> */}
        
        {/* Loading State */}
        {!isContentReady && params.action !== 'create' && (
          <RestockSessionsSkeleton />
        )}
        
        {/* Main Content */}
        {isContentReady && !errorState.hasError && renderMainContent()}
      </KeyboardAvoidingView>

      {/* Email Generation Confirmation Dialog */}
      <ConfirmationDialog
        visible={showConfirmationDialog}
        title="Ready to Generate Emails"
        message="Your restock session is complete and ready for email generation."
        confirmText="Generate Emails"
        cancelText="Continue Editing"
        confirmIcon="mail"
        onConfirm={handleGenerateEmails}
        onCancel={handleCancelEmailGeneration}
        stats={currentSession ? [
          { label: 'Products', value: currentSession.products.length },
          { label: 'Total Quantity', value: currentSession.products.reduce((sum, p) => sum + p.quantity, 0) },
          { label: 'Suppliers', value: new Set(currentSession.products.map(p => p.supplierName)).size },
        ] : undefined}
      />

      {/* Name Session Modal */}
      <NameSessionModal
        visible={showNameModal}
        title="Name Your Restock Session"
        message="Give this session a name to easily identify it later (e.g., 'Weekly Restock', 'Holiday Prep')."
        inputPlaceholder="Name this session"
        inputValue={sessionNameInput}
        onChangeInput={setSessionNameInput}
        confirmText="Create Session"
        cancelText="Create Without Name"
        onConfirm={handleConfirmCreateSession}
        onCancel={handleCreateWithoutName}
      />
    </View>
  );
};

// Main exported component with provider
export default function RestockSessionsScreen() {
  return (
    <RestockSessionProvider>
      <RestockSessionsContent />
    </RestockSessionProvider>
  );
}