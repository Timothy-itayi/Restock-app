import React, { createContext, useContext, ReactNode } from 'react';
import { 
  useRestockSessions,
  useProductForm,
  useStoredData,
  useNotifications
} from '../hooks';
import { 
  RestockSession, 
  Product, 
  StoredProduct, 
  StoredSupplier, 
  ErrorState, 
  LoadingState,
  FormState,
  Notification
} from '../utils/types';

interface RestockSessionContextType {
  // Session state
  allSessions: RestockSession[];
  currentSession: RestockSession | null;
  isSessionActive: boolean;
  showSessionSelection: boolean;
  isLoadingSessions: boolean;

  // Data state
  storedProducts: StoredProduct[];
  storedSuppliers: StoredSupplier[];
  isDataReady: boolean;
  loadingState: LoadingState;
  errorState: ErrorState;

  // Form state
  formState: FormState;
  filteredProducts: StoredProduct[];
  filteredSuppliers: StoredSupplier[];
  editingProduct: Product | null;
  showAddProductForm: boolean;
  showEditProductForm: boolean;

  // Notification state
  notifications: Notification[];
  notificationAnimation: any;

  // Session actions
  loadAllSessions: () => Promise<void>;
  startNewSession: () => Promise<{ success: boolean; session?: RestockSession; error?: string }>;
  selectSession: (session: RestockSession) => { success: boolean; message?: string };
  deleteSession: (session: RestockSession) => Promise<{ success: boolean; error?: string }>;
  showSessionSelectionModal: () => void;
  hideSessionSelectionModal: () => void;
  updateCurrentSession: (session: RestockSession | null) => void;

  // Data actions
  loadStoredData: () => Promise<void>;
  retryLoadData: () => void;
  updateStoredProducts: (products: StoredProduct[]) => void;
  updateStoredSuppliers: (suppliers: StoredSupplier[]) => void;

  // Form actions
  updateFormField: (field: keyof FormState, value: string) => void;
  handleProductNameChange: (text: string, storedProducts: StoredProduct[]) => void;
  handleSupplierNameChange: (text: string, storedSuppliers: StoredSupplier[]) => void;
  selectProductSuggestion: (product: StoredProduct) => void;
  selectSupplierSuggestion: (supplier: StoredSupplier) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setErrorMessage: (message: string) => void;

  // Product operations
  addProduct: (
    currentSession: RestockSession,
    storedProducts: StoredProduct[],
    storedSuppliers: StoredSupplier[],
    onUpdateStoredProducts: (products: StoredProduct[]) => void,
    onUpdateStoredSuppliers: (suppliers: StoredSupplier[]) => void
  ) => Promise<{ success: boolean; product?: Product; error?: string }>;
  editProduct: (product: Product) => void;
  saveEditedProduct: () => Promise<{ success: boolean; error?: string }>;
  cancelEdit: () => void;
  cancelAddProduct: () => void;

  // Form controls
  setShowAddProductForm: (show: boolean) => void;
  setShowEditProductForm: (show: boolean) => void;

  // Notification actions
  showNotification: (type: Notification['type'], message: string, title?: string) => void;
  removeNotification: (id: string) => void;
  getNotificationStyles: (type: Notification['type']) => any;
  clearAllNotifications: () => void;
}

const RestockSessionContext = createContext<RestockSessionContextType | undefined>(undefined);

interface RestockSessionProviderProps {
  children: ReactNode;
}

export const RestockSessionProvider: React.FC<RestockSessionProviderProps> = ({ children }) => {
  // Initialize all hooks
  const sessionHook = useRestockSessions();
  const formHook = useProductForm();
  const dataHook = useStoredData();
  const notificationsHook = useNotifications();

  const contextValue: RestockSessionContextType = {
    // Session state
    allSessions: sessionHook.allSessions,
    currentSession: sessionHook.currentSession,
    isSessionActive: sessionHook.isSessionActive,
    showSessionSelection: sessionHook.showSessionSelection,
    isLoadingSessions: sessionHook.isLoadingSessions,

    // Data state
    storedProducts: dataHook.storedProducts,
    storedSuppliers: dataHook.storedSuppliers,
    isDataReady: dataHook.isDataReady,
    loadingState: dataHook.loadingState,
    errorState: dataHook.errorState,

    // Form state
    formState: formHook.formState,
    filteredProducts: formHook.filteredProducts,
    filteredSuppliers: formHook.filteredSuppliers,
    editingProduct: formHook.editingProduct,
    showAddProductForm: formHook.showAddProductForm,
    showEditProductForm: formHook.showEditProductForm,

    // Notification state
    notifications: notificationsHook.notifications,
    notificationAnimation: notificationsHook.notificationAnimation,

    // Session actions
    loadAllSessions: sessionHook.loadAllSessions,
    startNewSession: sessionHook.startNewSession,
    selectSession: sessionHook.selectSession,
    deleteSession: sessionHook.deleteSession,
    showSessionSelectionModal: sessionHook.showSessionSelectionModal,
    hideSessionSelectionModal: sessionHook.hideSessionSelectionModal,
    updateCurrentSession: sessionHook.updateCurrentSession,

    // Data actions
    loadStoredData: dataHook.loadStoredData,
    retryLoadData: dataHook.retryLoadData,
    updateStoredProducts: dataHook.updateStoredProducts,
    updateStoredSuppliers: dataHook.updateStoredSuppliers,

    // Form actions
    updateFormField: formHook.updateFormField,
    handleProductNameChange: formHook.handleProductNameChange,
    handleSupplierNameChange: formHook.handleSupplierNameChange,
    selectProductSuggestion: formHook.selectProductSuggestion,
    selectSupplierSuggestion: formHook.selectSupplierSuggestion,
    incrementQuantity: formHook.incrementQuantity,
    decrementQuantity: formHook.decrementQuantity,
    validateForm: formHook.validateForm,
    resetForm: formHook.resetForm,
    setErrorMessage: formHook.setErrorMessage,

    // Product operations
    addProduct: formHook.addProduct,
    editProduct: formHook.editProduct,
    saveEditedProduct: formHook.saveEditedProduct,
    cancelEdit: formHook.cancelEdit,
    cancelAddProduct: formHook.cancelAddProduct,

    // Form controls
    setShowAddProductForm: formHook.setShowAddProductForm,
    setShowEditProductForm: formHook.setShowEditProductForm,

    // Notification actions
    showNotification: notificationsHook.showNotification,
    removeNotification: notificationsHook.removeNotification,
    getNotificationStyles: notificationsHook.getNotificationStyles,
    clearAllNotifications: notificationsHook.clearAllNotifications,
  };

  return (
    <RestockSessionContext.Provider value={contextValue}>
      {children}
    </RestockSessionContext.Provider>
  );
};

export const useRestockSessionContext = (): RestockSessionContextType => {
  const context = useContext(RestockSessionContext);
  if (context === undefined) {
    throw new Error('useRestockSessionContext must be used within a RestockSessionProvider');
  }
  return context;
};