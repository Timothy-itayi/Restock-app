import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import { SessionService } from "../../../backend/services/sessions";
import { RestockSessionsSkeleton } from "../../components/skeleton";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { restockSessionsStyles } from "../../../styles/components/restock-sessions";
import { RestockSessionProvider, useRestockSessionContext } from "./context/RestockSessionContext";
import {
  SessionSelection,
  StartSection,
  ProductForm,
  ProductList,
  SessionHeader,
  FinishSection,
  // NotificationRenderer,
  // ErrorDisplay
} from "./components";
import { Logger } from "./utils/logger";
import { useAuth } from "@clerk/clerk-expo";
import { Product } from "./utils/types";

// Main screen component that uses the context
const RestockSessionsContent: React.FC = () => {
  const params = useLocalSearchParams();
  const { userId } = useAuth();
  
  console.log('[RestockSessions] Component render', { 
    userId, 
    hasUserId: !!userId,
    userIdLength: userId?.length 
  });
  
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
    notifications,
    notificationAnimation,
    storedProducts,
    storedSuppliers,

    // Actions
    startNewSession,
    selectSession,
    deleteSession,
    showSessionSelectionModal,
    updateCurrentSession,
    retryLoadData,
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
    removeNotification,
    getNotificationStyles,
    loadAllSessions
  } = useRestockSessionContext();

  // Local state for confirmation dialog
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  // Additional loading state to ensure content is fully ready
  const [isContentReady, setIsContentReady] = useState(false);

  // Session management functions
  const handleStartNewSession = React.useCallback(async () => {
    const result = await startNewSession();
    if (result.success) {
      showNotification('info', 'New restock session started');
    } else {
      showNotification('error', result.error || 'Failed to start session');
    }
  }, [startNewSession, showNotification]);

  // Log component mount and params
  React.useEffect(() => {
    console.log('[RestockSessions] Component mounted', { 
      hasAction: !!params.action,
      actionValue: params.action 
    });
  }, [params]);

  // Load sessions when component mounts or user changes
  React.useEffect(() => {
    if (isDataReady) {
      console.log('[RestockSessions] Loading sessions after data is ready');
      loadAllSessions();
    }
  }, [isDataReady, loadAllSessions]);

  // Set content ready after both data and sessions are loaded with additional delay
  React.useEffect(() => {
    if (isDataReady && !isLoadingSessions) {
      console.log('[RestockSessions] Data and sessions loaded, adding delay before showing content');
      const timer = setTimeout(() => {
        console.log('[RestockSessions] Setting content ready to true');
        setIsContentReady(true);
      }, 800); // Additional 800ms delay to ensure everything is settled
      
      return () => clearTimeout(timer);
    } else {
      setIsContentReady(false);
    }
  }, [isDataReady, isLoadingSessions]);

  // Debug effect to monitor state changes
  React.useEffect(() => {
    console.log('[RestockSessions] State update', {
      allSessionsCount: allSessions.length,
      currentSessionId: currentSession?.id,
      isSessionActive,
      showSessionSelection,
      isDataReady,
      hasError: errorState.hasError,
      errorMessage: errorState.errorMessage
    });
  }, [allSessions.length, currentSession?.id, isSessionActive, showSessionSelection, isDataReady, errorState.hasError, errorState.errorMessage]);

  // Test database connection and session loading
  React.useEffect(() => {
    const testDatabaseConnection = async () => {
      if (isDataReady) {
        console.log('[RestockSessions] Testing database connection...');
        try {
          // Test basic session loading
          const testResult = await SessionService.getUserSessions('test-user');
          console.log('[RestockSessions] Database test result:', {
            hasError: !!testResult.error,
            error: testResult.error,
            dataCount: testResult.data?.length || 0
          });
        } catch (error) {
          console.error('[RestockSessions] Database connection test failed:', error);
        }
      }
    };
    
    testDatabaseConnection();
  }, [isDataReady]);

  // Handle URL parameters for automatic actions
  useEffect(() => {
    console.log('[RestockSessions] URL parameter effect triggered', {
      action: params.action,
      isDataReady,
      shouldCreate: params.action === 'create' && isDataReady
    });
    
    if (params.action === 'create' && isDataReady) {
      console.log('[RestockSessions] Auto-creating new session from URL parameter');
      Logger.info('Auto-creating new session from URL parameter');
      handleStartNewSession();
    }
  }, [params.action, isDataReady, handleStartNewSession]);

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
      // Update session status to indicate it's ready for email generation
      const updateResult = await SessionService.updateSession(currentSession.id, {
        status: 'draft' // Keep as draft until emails are actually sent
      });
      
      if (updateResult.error) {
        Logger.error('Failed to update session status', updateResult.error, { sessionId: currentSession.id });
        showNotification('error', 'Failed to prepare session for email generation');
        return;
      }
      
      Logger.success('Session status updated', { sessionId: currentSession.id, status: updateResult.data.status });

      // Show confirmation dialog
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
          {showAddProductForm ? (
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

          <FinishSection
            currentSession={currentSession}
            showAddProductForm={showAddProductForm}
            showEditProductForm={showEditProductForm}
            onFinishSession={finishSession}
          />
        </View>
      );
    }

    return (
      <StartSection
        allSessions={allSessions}
        onStartNewSession={handleStartNewSession}
        onShowSessionSelection={showSessionSelectionModal}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Notifications */}
      {/* <NotificationRenderer
        notifications={notifications}
        notificationAnimation={notificationAnimation}
        onRemoveNotification={removeNotification}
        getNotificationStyles={getNotificationStyles}
      /> */}
      
      <KeyboardAvoidingView
        style={restockSessionsStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Error State */}
        {/* <ErrorDisplay
          errorState={errorState}
          onRetry={retryLoadData}
        /> */}
        
        {/* Loading State */}
        {!isContentReady && <RestockSessionsSkeleton />}
        
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