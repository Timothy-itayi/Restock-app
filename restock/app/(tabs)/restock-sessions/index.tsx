import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import { SessionService } from "../../../backend/services/sessions";
import { RestockSessionsSkeleton } from "../../components/skeleton";
import CustomToast from "../../components/CustomToast";
import { restockSessionsStyles } from "../../../styles/components/restock-sessions";
import { RestockSessionProvider, useRestockSessionContext } from "./context/RestockSessionContext";
import {
  SessionSelection,
  StartSection,
  ProductForm,
  ProductList,
  SessionHeader,
  FinishSection,
  NotificationRenderer,
  ErrorDisplay
} from "./components";
import { Logger } from "./utils/logger";
import { useAuth } from "@clerk/clerk-expo";

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

  // Local state for transition toast
  const [showTransitionToast, setShowTransitionToast] = useState(false);
  const [transitionToastData, setTransitionToastData] = useState({
    type: 'info' as const,
    title: '',
    message: '',
  });

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
  const handleAddProduct = async () => {
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
  };

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

  const handleRemoveProduct = (productId: string) => {
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
              
              // Remove from database first (with cleanup of unused products/suppliers)
              const removeResult = await SessionService.removeSessionItemWithCleanup(productId);
              
              Logger.info('Database deletion result', { 
                productId, 
                hasError: !!removeResult.error, 
                error: removeResult.error 
              });
              
              if (removeResult.error) {
                Logger.error('Failed to remove item from database', removeResult.error, { productId });
                showNotification('error', 'Failed to remove product from session');
                return;
              }
              
              Logger.success('Database deletion successful', { productId });
              
              // Update local state
              const updatedProducts = currentSession.products.filter(p => p.id !== productId);
              updateCurrentSession({
                ...currentSession,
                products: updatedProducts,
              });

              // Refresh stored data lists
              retryLoadData();
              
              showNotification('warning', `${productToRemove?.name} removed from session`);
              
              Logger.success('Product removed from session', { 
                productId, 
                productName: productToRemove?.name,
                remainingProducts: updatedProducts.length 
              });
            } catch (error) {
              Logger.error('Unexpected error removing product', error, { productId });
              showNotification('error', 'Failed to remove product from session');
            }
          }
        }
      ]
    );
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

      // Show transition toast instead of alert
      const supplierCount = new Set(currentSession.products.map(p => p.supplierName)).size;
      setTransitionToastData({
        type: 'info',
        title: 'Ready to generate emails?',
        message: `You have ${currentSession.products.length} products ready to send to ${supplierCount} suppliers.`,
      });
      setShowTransitionToast(true);
      
      Logger.info('Session ready for email generation', { 
        productCount: currentSession.products.length,
        supplierCount
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
        products: currentSession.products, // Keep for backward compatibility
      };
      
      // Store the session data in AsyncStorage for the emails screen to access
      await AsyncStorage.setItem('currentEmailSession', JSON.stringify(sessionData));
      
      Logger.success('Session data stored for email generation', { sessionId: currentSession.id });
      
      // Reset session state
      updateCurrentSession(null);
      
      // Hide the transition toast
      setShowTransitionToast(false);
      
      // Navigate to the emails tab
      router.push('/(tabs)/emails');
      
    } catch (error) {
      Logger.error('Failed to prepare email generation', error, { sessionId: currentSession.id });
      showNotification('error', 'Failed to prepare email session');
    }
  };

  const handleCancelTransition = () => {
    Logger.info('Canceling email generation transition');
    setShowTransitionToast(false);
  };

  // Form helper functions
  const handleProductFormProductNameChange = (text: string) => {
    handleProductNameChange(text, storedProducts);
  };

  const handleProductFormSupplierNameChange = (text: string) => {
    handleSupplierNameChange(text, storedSuppliers);
  };

  const handleEditProductChange = (field: keyof any, value: string | number) => {
    if (editingProduct) {
      // This is a simplified version - in a real implementation you'd want to handle this properly
      updateFormField(field as any, value.toString());
    }
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
              onSubmit={handleAddProduct}
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
              onEditProductChange={handleEditProductChange}
            />
          ) : (
            <ProductList
              currentSession={currentSession}
              onEditProduct={editProduct}
              onRemoveProduct={handleRemoveProduct}
              onAddProduct={() => setShowAddProductForm(true)}
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
      <NotificationRenderer
        notifications={notifications}
        notificationAnimation={notificationAnimation}
        onRemoveNotification={removeNotification}
        getNotificationStyles={getNotificationStyles}
      />
      
      <KeyboardAvoidingView
        style={restockSessionsStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Error State */}
        <ErrorDisplay
          errorState={errorState}
          onRetry={retryLoadData}
        />
        
        {/* Loading State */}
        {!isDataReady && <RestockSessionsSkeleton />}
        
        {/* Main Content */}
        {isDataReady && !errorState.hasError && renderMainContent()}
      </KeyboardAvoidingView>

      {/* Custom Transition Toast */}
      <CustomToast
        visible={showTransitionToast}
        type={transitionToastData.type}
        title={transitionToastData.title}
        message={transitionToastData.message}
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancelTransition,
            primary: false,
          },
          {
            label: 'Generate Emails',
            onPress: handleGenerateEmails,
            primary: true,
          },
        ]}
        autoDismiss={false}
        onDismiss={() => setShowTransitionToast(false)}
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