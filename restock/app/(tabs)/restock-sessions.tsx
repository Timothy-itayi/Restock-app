import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { restockSessionsStyles } from "../../styles/components/restock-sessions";
import CustomToast from "../components/CustomToast";
import { ProductService } from "../../backend/services/products";
import { SupplierService } from "../../backend/services/suppliers";
import { SessionService } from "../../backend/services/sessions";
import { Ionicons } from "@expo/vector-icons";
import type { Product as DatabaseProduct, Supplier as DatabaseSupplier, RestockSession as DatabaseRestockSession, RestockItem as DatabaseRestockItem } from "../../backend/types/database";

// Enhanced logging utility
const Logger = {
  info: (message: string, data?: any) => {
    console.log(`[RESTOCK-SESSIONS] ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  success: (message: string, data?: any) => {
    console.log(`[RESTOCK-SESSIONS] ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warning: (message: string, data?: any) => {
    console.warn(`[RESTOCK-SESSIONS] ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error?: any, context?: any) => {
    console.error(`[RESTOCK-SESSIONS] ❌ ${message}`, {
      error: error ? JSON.stringify(error, null, 2) : 'No error object',
      context: context ? JSON.stringify(context, null, 2) : 'No context',
      timestamp: new Date().toISOString(),
      stack: error?.stack || 'No stack trace'
    });
  },
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[RESTOCK-SESSIONS] 🔍 ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

// Error handling utility
const ErrorHandler = {
  handleAsyncStorageError: (error: any, operation: string) => {
    Logger.error(`AsyncStorage ${operation} failed`, error, { operation });
    return {
      success: false,
      error: `Failed to ${operation}: ${error?.message || 'Unknown error'}`
    };
  },

  handleDatabaseError: (error: any, operation: string, context?: any) => {
    Logger.error(`Database ${operation} failed`, error, { operation, context });
    return {
      success: false,
      error: `Database ${operation} failed: ${error?.message || 'Unknown error'}`
    };
  },

  handleValidationError: (field: string, value: any, rule: string) => {
    Logger.warning(`Validation failed for ${field}`, { field, value, rule });
    return `Invalid ${field}: ${rule}`;
  },

  handleNetworkError: (error: any, operation: string) => {
    Logger.error(`Network ${operation} failed`, error, { operation });
    return {
      success: false,
      error: `Network error during ${operation}: ${error?.message || 'Connection failed'}`
    };
  }
};

// Types for our data structures
interface Product {
  id: string;
  name: string;
  quantity: number;
  supplierName: string;
  supplierEmail: string;
}

interface RestockSession {
  id: string;
  products: Product[];
  createdAt: Date;
  status: 'draft' | 'sent';
}

// Database types for autocomplete
interface StoredProduct {
  id: string;
  name: string;
  default_quantity: number;
  default_supplier_id?: string;
  supplier?: {
    id: string;
    name: string;
    email: string;
  };
}

interface StoredSupplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  title?: string;
}

// Error state interface
interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorContext?: any;
  timestamp: Date;
}

// Placeholder data for demonstration (will be replaced with database data)
const initialProducts: StoredProduct[] = [];
const initialSuppliers: StoredSupplier[] = [];

export default function RestockSessionsScreen() {
  const { userId } = useAuth();
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [currentSession, setCurrentSession] = useState<RestockSession | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnimation] = useState(new Animated.Value(0));
  
  // Error state
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    errorMessage: '',
    timestamp: new Date()
  });
  
  // Custom toast state
  const [showTransitionToast, setShowTransitionToast] = useState(false);
  const [transitionToastData, setTransitionToastData] = useState({
    type: 'info' as const,
    title: '',
    message: '',
  });
  
  // Form state
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Database state
  const [storedProducts, setStoredProducts] = useState<StoredProduct[]>([]);
  const [storedSuppliers, setStoredSuppliers] = useState<StoredSupplier[]>([]);

  // Filtered suggestions
  const [filteredProducts, setFilteredProducts] = useState<StoredProduct[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<StoredSupplier[]>([]);

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Load stored data on component mount
  useEffect(() => {
    if (userId) {
      Logger.info('Component mounted, loading stored data', { userId });
      loadStoredData();
      loadActiveSession();
    } else {
      Logger.warning('Component mounted but no userId available');
    }
  }, [userId]);

  // Load active session if user has one in progress
  const loadActiveSession = async () => {
    if (!userId) return;
    
    try {
      Logger.info('Loading active session', { userId });
      
      // Get the most recent draft session
      const sessionsResult = await SessionService.getUserSessions(userId);
      
      if (sessionsResult.error) {
        Logger.error('Failed to load user sessions', sessionsResult.error, { userId });
        return;
      }
      
      const draftSession = sessionsResult.data?.find(session => session.status === 'draft');
      
      if (draftSession) {
        Logger.info('Found active draft session', { sessionId: draftSession.id });
        
        // Load session with items
        const sessionWithItemsResult = await SessionService.getSessionWithItems(draftSession.id);
        
        if (sessionWithItemsResult.error) {
          Logger.error('Failed to load session items', sessionWithItemsResult.error, { sessionId: draftSession.id });
          return;
        }
        
        // Convert database items to local format
        const products: Product[] = sessionWithItemsResult.data?.restock_items?.map((item: any) => ({
          id: item.id,
          name: item.products?.name || 'Unknown Product',
          quantity: item.quantity,
          supplierName: item.suppliers?.name || 'Unknown Supplier',
          supplierEmail: item.suppliers?.email || '',
        })) || [];
        
        const activeSession: RestockSession = {
          id: draftSession.id,
          products,
          createdAt: new Date(draftSession.created_at),
          status: draftSession.status as 'draft' | 'sent'
        };
        
        setCurrentSession(activeSession);
        setIsSessionActive(true);
        
        Logger.success('Active session loaded', { 
          sessionId: activeSession.id, 
          productCount: activeSession.products.length 
        });
      } else {
        Logger.info('No active session found', { userId });
      }
    } catch (error) {
      Logger.error('Unexpected error loading active session', error, { userId });
    }
  };

  const showNotification = (type: Notification['type'], message: string, title?: string) => {
    Logger.info(`Showing notification`, { type, message, title });
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      title,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Animate in
    Animated.timing(notificationAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 4000);
  };

  const removeNotification = (id: string) => {
    Logger.debug(`Removing notification`, { id });
    
    // Animate out
    Animated.timing(notificationAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    });
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          container: restockSessionsStyles.notificationSuccess,
          icon: restockSessionsStyles.notificationSuccessIcon,
          iconText: '✓',
        };
      case 'info':
        return {
          container: restockSessionsStyles.notificationInfo,
          icon: restockSessionsStyles.notificationInfoIcon,
          iconText: 'ℹ',
        };
      case 'warning':
        return {
          container: restockSessionsStyles.notificationWarning,
          icon: restockSessionsStyles.notificationWarningIcon,
          iconText: '⚠',
        };
      case 'error':
        return {
          container: restockSessionsStyles.notificationError,
          icon: restockSessionsStyles.notificationErrorIcon,
          iconText: '✕',
        };
    }
  };

  const loadStoredData = async () => {
    if (!userId) {
      Logger.warning('Cannot load stored data: no userId');
      return;
    }
    
    setIsLoadingData(true);
    setErrorState({ hasError: false, errorMessage: '', timestamp: new Date() });
    
    try {
      Logger.info('Loading stored data from database', { userId });
      
      // Load products and suppliers from Supabase
      const [productsResult, suppliersResult] = await Promise.all([
        ProductService.getUserProducts(userId),
        SupplierService.getUserSuppliers(userId),
      ]);
      
      // Handle products result
      if (productsResult.error) {
        Logger.error('Failed to load products', productsResult.error, { userId });
        setErrorState({
          hasError: true,
          errorMessage: `Failed to load products: ${productsResult.error}`,
          errorContext: { operation: 'loadProducts', userId },
          timestamp: new Date()
        });
      } else {
        Logger.success('Products loaded successfully', { 
          count: productsResult.data?.length || 0,
          products: productsResult.data?.map(p => ({ id: p.id, name: p.name }))
        });
        setStoredProducts(productsResult.data || []);
      }
      
      // Handle suppliers result
      if (suppliersResult.error) {
        Logger.error('Failed to load suppliers', suppliersResult.error, { userId });
        setErrorState({
          hasError: true,
          errorMessage: `Failed to load suppliers: ${suppliersResult.error}`,
          errorContext: { operation: 'loadSuppliers', userId },
          timestamp: new Date()
        });
      } else {
        Logger.success('Suppliers loaded successfully', { 
          count: suppliersResult.data?.length || 0,
          suppliers: suppliersResult.data?.map(s => ({ id: s.id, name: s.name }))
        });
        setStoredSuppliers(suppliersResult.data || []);
      }
    } catch (error) {
      Logger.error('Unexpected error loading stored data', error, { userId });
      setErrorState({
        hasError: true,
        errorMessage: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorContext: { operation: 'loadStoredData', userId },
        timestamp: new Date()
      });
      
      // Fallback to empty arrays
      setStoredProducts([]);
      setStoredSuppliers([]);
    } finally {
      setIsLoadingData(false);
    }
  };



  const startNewSession = async () => {
    Logger.info('Starting new restock session');
    
    if (!userId) {
      Logger.error('Cannot start session: no userId');
      showNotification('error', 'User not authenticated');
      return;
    }
    
    try {
      // Create session in database first
      const sessionResult = await SessionService.createSession({
        user_id: userId,
        status: 'draft'
      });
      
      if (sessionResult.error) {
        Logger.error('Failed to create session in database', sessionResult.error, { userId });
        showNotification('error', 'Failed to start session');
        return;
      }
      
      const newSession: RestockSession = {
        id: sessionResult.data.id,
        products: [],
        createdAt: new Date(sessionResult.data.created_at),
        status: sessionResult.data.status as 'draft' | 'sent'
      };
      
      setCurrentSession(newSession);
      setIsSessionActive(true);
      showNotification('info', 'New restock session started');
      
      Logger.success('New session created in database', { 
        sessionId: newSession.id,
        databaseId: sessionResult.data.id 
      });
    } catch (error) {
      Logger.error('Unexpected error starting session', error, { userId });
      showNotification('error', 'Failed to start session');
    }
  };

  const handleProductNameChange = (text: string) => {
    setProductName(text);
    if (text.length > 0) {
      const filtered = storedProducts.filter(product =>
        product.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredProducts(filtered);
      Logger.debug('Product suggestions filtered', { input: text, suggestionsCount: filtered.length });
    } else {
      setFilteredProducts([]);
    }
  };

  const handleSupplierNameChange = (text: string) => {
    setSupplierName(text);
    if (text.length > 0) {
      const filtered = storedSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredSuppliers(filtered);
      Logger.debug('Supplier suggestions filtered', { input: text, suggestionsCount: filtered.length });
    } else {
      setFilteredSuppliers([]);
    }
  };

  const selectProductSuggestion = (product: StoredProduct) => {
    Logger.info('Product suggestion selected', { productId: product.id, productName: product.name });
    
    setProductName(product.name);
    if (product.supplier) {
      setSupplierName(product.supplier.name);
      setSupplierEmail(product.supplier.email);
      Logger.debug('Auto-filled supplier info from product', { 
        supplierName: product.supplier.name, 
        supplierEmail: product.supplier.email 
      });
    }
    setFilteredProducts([]);
  };

  const selectSupplierSuggestion = (supplier: StoredSupplier) => {
    Logger.info('Supplier suggestion selected', { supplierId: supplier.id, supplierName: supplier.name });
    
    setSupplierName(supplier.name);
    setSupplierEmail(supplier.email);
    setFilteredSuppliers([]);
  };

  const validateForm = () => {
    Logger.debug('Validating form', { productName, quantity, supplierName, supplierEmail });
    
    if (!productName.trim()) {
      const error = ErrorHandler.handleValidationError('productName', productName, 'required');
      setErrorMessage(error);
      return false;
    }
    if (!quantity.trim() || parseInt(quantity) <= 0) {
      const error = ErrorHandler.handleValidationError('quantity', quantity, 'must be greater than 0');
      setErrorMessage(error);
      return false;
    }
    if (!supplierName.trim()) {
      const error = ErrorHandler.handleValidationError('supplierName', supplierName, 'required');
      setErrorMessage(error);
      return false;
    }
    if (!supplierEmail.trim() || !supplierEmail.includes("@")) {
      const error = ErrorHandler.handleValidationError('supplierEmail', supplierEmail, 'must be a valid email');
      setErrorMessage(error);
      return false;
    }
    
    Logger.debug('Form validation passed');
    return true;
  };

  const addProduct = async () => {
    Logger.info('Adding product to session', { productName, quantity, supplierName, supplierEmail });
    
    setErrorMessage("");
    
    if (!validateForm()) {
      Logger.warning('Form validation failed', { errorMessage });
      return;
    }

    if (!currentSession) {
      Logger.error('Cannot add product: no active session');
      showNotification('error', 'No active session found');
      return;
    }

    if (!userId) {
      Logger.error('Cannot add product: no userId');
      showNotification('error', 'User not authenticated');
      return;
    }

    try {
      // Step 1: Ensure supplier exists (create if needed)
      let supplierId: string;
      const existingSupplier = storedSuppliers.find(s => 
        s.name.toLowerCase() === supplierName.toLowerCase()
      );
      
      if (existingSupplier) {
        Logger.info('Using existing supplier', { supplierId: existingSupplier.id, supplierName });
        supplierId = existingSupplier.id;
      } else {
        Logger.info('Creating new supplier', { supplierName, supplierEmail });
        
        const supplierResult = await SupplierService.createSupplier({
          user_id: userId,
          name: supplierName.trim(),
          email: supplierEmail.trim(),
        });
        
        if (supplierResult.error) {
          Logger.error('Failed to create supplier', supplierResult.error, { supplierName, supplierEmail });
          showNotification('error', 'Failed to create supplier');
          return;
        }
        
        supplierId = supplierResult.data.id;
        Logger.success('Supplier created successfully', { supplierId, supplierName });
        
        // Add to local state for autocomplete
        setStoredSuppliers(prev => [...prev, supplierResult.data]);
      }

      // Step 2: Ensure product exists (create if needed)
      let productId: string;
      const existingProduct = storedProducts.find(p => 
        p.name.toLowerCase() === productName.toLowerCase()
      );
      
      if (existingProduct) {
        Logger.info('Using existing product', { productId: existingProduct.id, productName });
        productId = existingProduct.id;
      } else {
        Logger.info('Creating new product', { productName, supplierId });
        
        const productResult = await ProductService.createProduct({
          user_id: userId,
          name: productName.trim(),
          default_quantity: parseInt(quantity),
          default_supplier_id: supplierId,
        });
        
        if (productResult.error) {
          Logger.error('Failed to create product', productResult.error, { productName, supplierId });
          showNotification('error', 'Failed to create product');
          return;
        }
        
        productId = productResult.data.id;
        Logger.success('Product created successfully', { productId, productName });
        
        // Add to local state for autocomplete
        setStoredProducts(prev => [...prev, productResult.data]);
      }

      // Step 3: Add item to restock session
      Logger.info('Adding item to restock session', { sessionId: currentSession.id, productId, supplierId, quantity });
      
      const sessionItemResult = await SessionService.addSessionItem({
        session_id: currentSession.id,
        product_id: productId,
        supplier_id: supplierId,
        quantity: parseInt(quantity),
      });
      
      if (sessionItemResult.error) {
        Logger.error('Failed to add item to session', sessionItemResult.error, { 
          sessionId: currentSession.id, 
          productId, 
          supplierId 
        });
        showNotification('error', 'Failed to add product to session');
        return;
      }
      
      Logger.success('Item added to session successfully', { 
        itemId: sessionItemResult.data.id,
        sessionId: currentSession.id 
      });

      // Step 4: Update local session state
      const newProduct: Product = {
        id: sessionItemResult.data.id, // Use the database item ID
        name: productName.trim(),
        quantity: parseInt(quantity),
        supplierName: supplierName.trim(),
        supplierEmail: supplierEmail.trim(),
      };

      const updatedSession = {
        ...currentSession,
        products: [...currentSession.products, newProduct],
      };

      setCurrentSession(updatedSession);
      
      // Show success notification
      showNotification('success', `${newProduct.name} added to restock session`);
      
      // Reset form
      setProductName("");
      setQuantity("1");
      setSupplierName("");
      setSupplierEmail("");
      setShowAddProductForm(false);
      setFilteredProducts([]);
      setFilteredSuppliers([]);
      
      Logger.success('Product added to session successfully', { 
        productId: newProduct.id, 
        sessionProductCount: updatedSession.products.length 
      });
      
    } catch (error) {
      Logger.error('Unexpected error adding product', error, { 
        productName, 
        supplierName, 
        supplierEmail,
        sessionId: currentSession.id 
      });
      showNotification('error', 'Failed to add product to session');
    }
  };

  const editProduct = (product: Product) => {
    Logger.info('Editing product', { productId: product.id, productName: product.name });
    
    setEditingProduct(product);
    setProductName(product.name);
    setQuantity(product.quantity.toString());
    setSupplierName(product.supplierName);
    setSupplierEmail(product.supplierEmail);
    setShowEditProductForm(true);
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const saveEditedProduct = async () => {
    Logger.info('Saving edited product', { 
      productId: editingProduct?.id, 
      productName: editingProduct?.name 
    });
    
    setErrorMessage("");
    
    if (!validateForm() || !editingProduct || !currentSession) {
      Logger.warning('Cannot save edited product: validation failed or missing data', {
        validationPassed: validateForm(),
        hasEditingProduct: !!editingProduct,
        hasCurrentSession: !!currentSession
      });
      return;
    }

    const updatedProduct: Product = {
      id: editingProduct.id,
      name: productName.trim(),
      quantity: parseInt(quantity),
      supplierName: supplierName.trim(),
      supplierEmail: supplierEmail.trim(),
    };

    // Check what changed
    const changes = [];
    if (editingProduct.name !== updatedProduct.name) changes.push(`Name: "${editingProduct.name}" → "${updatedProduct.name}"`);
    if (editingProduct.quantity !== updatedProduct.quantity) changes.push(`Quantity: ${editingProduct.quantity} → ${updatedProduct.quantity}`);
    if (editingProduct.supplierName !== updatedProduct.supplierName) changes.push(`Supplier: "${editingProduct.supplierName}" → "${updatedProduct.supplierName}"`);
    if (editingProduct.supplierEmail !== updatedProduct.supplierEmail) changes.push(`Email: "${editingProduct.supplierEmail}" → "${updatedProduct.supplierEmail}"`);

    Logger.info('Product changes detected', { changes });

    const updatedProducts = currentSession.products.map(p => 
      p.id === editingProduct.id ? updatedProduct : p
    );

    const updatedSession = {
      ...currentSession,
      products: updatedProducts,
    };

    setCurrentSession(updatedSession);
    
    // Update the session item in the database
    const updateResult = await SessionService.updateSessionItem(editingProduct.id, {
      quantity: updatedProduct.quantity,
    });
    
    if (updateResult.error) {
      Logger.error('Failed to update session item', updateResult.error, { itemId: editingProduct.id });
      showNotification('error', 'Failed to update product');
      return;
    }
    
    Logger.success('Session item updated successfully', { itemId: editingProduct.id });
    
    // Show changes notification
    if (changes.length > 0) {
      showNotification('info', `Updated ${updatedProduct.name}`, changes.join('\n'));
    } else {
      showNotification('warning', 'No changes made to product');
    }
    
    // Reset form
    setEditingProduct(null);
    setProductName("");
    setQuantity("1");
    setSupplierName("");
    setSupplierEmail("");
    setShowEditProductForm(false);
    setFilteredProducts([]);
    setFilteredSuppliers([]);
    
    Logger.success('Product edited successfully', { 
      productId: updatedProduct.id, 
      changesCount: changes.length 
    });
  };

  const cancelEdit = () => {
    Logger.info('Canceling product edit');
    
    setEditingProduct(null);
    setProductName("");
    setQuantity("1");
    setSupplierName("");
    setSupplierEmail("");
    setShowEditProductForm(false);
    setErrorMessage("");
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const removeProduct = (productId: string) => {
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
              
              // Verify the item was actually deleted from database
              const verifyResult = await SessionService.sessionItemExists(productId);
              Logger.info('Verification after deletion', { 
                productId, 
                stillExists: verifyResult.exists,
                verificationError: verifyResult.error 
              });
              
              if (verifyResult.exists) {
                Logger.warning('Item still exists in database after deletion attempt', { productId });
                showNotification('error', 'Failed to remove product from database');
                return;
              }
              
              // Update local state
              const updatedProducts = currentSession.products.filter(p => p.id !== productId);
              setCurrentSession({
                ...currentSession,
                products: updatedProducts,
              });

              // Also remove from stored products/suppliers if they were deleted
              // (The backend will handle this automatically, but we can refresh the lists)
              loadStoredData();
              
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
      setTransitionToastData({
        type: 'info',
        title: 'Ready to generate emails?',
        message: `You have ${currentSession.products.length} products ready to send to ${new Set(currentSession.products.map(p => p.supplierName)).size} suppliers.`,
      });
      setShowTransitionToast(true);
      
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
        products: currentSession.products, // Keep for backward compatibility
      };
      
      // Store the session data in AsyncStorage for the emails screen to access
      await AsyncStorage.setItem('currentEmailSession', JSON.stringify(sessionData));
      
      Logger.success('Session data stored for email generation', { sessionId: currentSession.id });
      
      // Reset session
      setCurrentSession(null);
      setIsSessionActive(false);
      setShowAddProductForm(false);
      setShowEditProductForm(false);
      setEditingProduct(null);
      
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

  const incrementQuantity = () => {
    const currentQty = parseInt(quantity) || 0;
    const newQty = currentQty + 1;
    setQuantity(newQty.toString());
    Logger.debug('Quantity incremented', { from: currentQty, to: newQty });
  };

  const decrementQuantity = () => {
    const currentQty = parseInt(quantity) || 1;
    if (currentQty > 1) {
      const newQty = currentQty - 1;
      setQuantity(newQty.toString());
      Logger.debug('Quantity decremented', { from: currentQty, to: newQty });
    }
  };

  const cancelAddProduct = () => {
    Logger.info('Canceling add product form');
    
    setShowAddProductForm(false);
    setProductName("");
    setQuantity("1");
    setSupplierName("");
    setSupplierEmail("");
    setErrorMessage("");
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const renderNotification = (notification: Notification) => {
    const styles = getNotificationStyles(notification.type);
    
    return (
      <Animated.View
        key={notification.id}
        style={[
          restockSessionsStyles.notificationContainer,
          styles.container,
          {
            transform: [{
              translateY: notificationAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              })
            }]
          }
        ]}
      >
        <View style={restockSessionsStyles.notificationContent}>
          <View style={[restockSessionsStyles.notificationIcon, styles.icon]}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
              {styles.iconText}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={restockSessionsStyles.notificationText}>
              {notification.message}
            </Text>
            {notification.title && (
              <Text style={[restockSessionsStyles.notificationText, { fontSize: 11, color: '#FFFFFF', marginTop: 1, opacity: 0.9 }]}>
                {notification.title}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={restockSessionsStyles.notificationClose}
            onPress={() => removeNotification(notification.id)}
          >
            <Text style={restockSessionsStyles.notificationCloseText}>×</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Error display component
  const renderErrorState = () => {
    if (!errorState.hasError) return null;
    
    return (
      <View style={restockSessionsStyles.errorContainer}>
        <Text style={restockSessionsStyles.errorTitle}>⚠️ Error Loading Data</Text>
        <Text style={restockSessionsStyles.errorStateMessage}>{errorState.errorMessage}</Text>
        <TouchableOpacity 
          style={restockSessionsStyles.retryButton}
          onPress={() => {
            Logger.info('User retrying data load');
            loadStoredData();
          }}
        >
          <Text style={restockSessionsStyles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Loading indicator
  const renderLoadingState = () => {
    if (!isLoadingData) return null;
    
    return (
      <View style={restockSessionsStyles.loadingContainer}>
        <Text style={restockSessionsStyles.loadingText}>Loading your data...</Text>
      </View>
    );
  };

  const renderStartSection = () => (
    <View style={restockSessionsStyles.startSection}>
      <Text style={restockSessionsStyles.startPrompt}>What do you want to restock?</Text>
      <Text style={restockSessionsStyles.instructions}>
        Walk around your store with this digital notepad and add products that need restocking. 
        Each product will be organized by supplier for easy email generation.
      </Text>
      <TouchableOpacity style={restockSessionsStyles.startButton} onPress={startNewSession}>
        <Text style={restockSessionsStyles.startButtonText}>Start New Restock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddProductForm = () => (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={restockSessionsStyles.formContainer}>
        <Text style={restockSessionsStyles.formTitle}>Add Product</Text>
        
        {errorMessage ? (
          <View style={restockSessionsStyles.errorMessage}>
            <Text style={restockSessionsStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Product Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={productName}
            onChangeText={handleProductNameChange}
            placeholder="Enter product name"
            autoFocus
          />
          {filteredProducts.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredProducts.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => selectProductSuggestion(product)}
                >
                  <Text style={restockSessionsStyles.suggestionText}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Quantity to Order</Text>
          <View style={restockSessionsStyles.quantityContainer}>
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={decrementQuantity}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={restockSessionsStyles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={incrementQuantity}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={supplierName}
            onChangeText={handleSupplierNameChange}
            placeholder="Enter supplier name"
          />
          {filteredSuppliers.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredSuppliers.map((supplier, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => selectSupplierSuggestion(supplier)}
                >
                  <Text style={restockSessionsStyles.suggestionText}>{supplier.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Email</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={supplierEmail}
            onChangeText={setSupplierEmail}
            placeholder="Enter supplier email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={restockSessionsStyles.formButtons}>
          <TouchableOpacity style={restockSessionsStyles.cancelButton} onPress={cancelAddProduct}>
            <Text style={restockSessionsStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={restockSessionsStyles.saveButton} onPress={addProduct}>
            <Text style={restockSessionsStyles.saveButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderEditProductForm = () => (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={restockSessionsStyles.formContainer}>
        <Text style={restockSessionsStyles.formTitle}>Edit Product</Text>
        
        {errorMessage ? (
          <View style={restockSessionsStyles.errorMessage}>
            <Text style={restockSessionsStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Product Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={editingProduct?.name || ''}
            onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, name: text } : null)}
            placeholder="Enter product name"
            autoFocus
          />
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Quantity to Order</Text>
          <View style={restockSessionsStyles.quantityContainer}>
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={() => {
                if (editingProduct && editingProduct.quantity > 1) {
                  setEditingProduct({ ...editingProduct, quantity: editingProduct.quantity - 1 });
                }
              }}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={restockSessionsStyles.quantityInput}
              value={editingProduct?.quantity?.toString() || '1'}
              onChangeText={(text) => {
                const num = parseInt(text) || 1;
                setEditingProduct(prev => prev ? { ...prev, quantity: num } : null);
              }}
              placeholder="1"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={() => {
                if (editingProduct) {
                  setEditingProduct({ ...editingProduct, quantity: editingProduct.quantity + 1 });
                }
              }}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={editingProduct?.supplierName || ''}
            onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, supplierName: text } : null)}
            placeholder="Enter supplier name"
          />
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Email</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={editingProduct?.supplierEmail || ''}
            onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, supplierEmail: text } : null)}
            placeholder="Enter supplier email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={restockSessionsStyles.formButtons}>
          <TouchableOpacity style={restockSessionsStyles.cancelButton} onPress={cancelEdit}>
            <Text style={restockSessionsStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={restockSessionsStyles.saveButton} onPress={saveEditedProduct}>
            <Text style={restockSessionsStyles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderProductList = () => (
    <ScrollView 
      style={restockSessionsStyles.productList}
      contentContainerStyle={restockSessionsStyles.productListContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {currentSession && currentSession.products.length > 0 ? (
        currentSession.products.map((product, index) => (
          <View key={product.id} style={restockSessionsStyles.productItem}>
            <View style={restockSessionsStyles.productHeader}>
              <Text style={restockSessionsStyles.productName}>{product.name}</Text>
              <Text style={restockSessionsStyles.productQuantity}>Qty: {product.quantity}</Text>
              <TouchableOpacity
                style={restockSessionsStyles.editIconButton}
                onPress={() => editProduct(product)}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={restockSessionsStyles.deleteIconButton}
                onPress={() => removeProduct(product.id)}
              >
                <Ionicons name="trash" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Notepad divider line */}
            <View style={restockSessionsStyles.notepadDivider} />
            
            <View style={restockSessionsStyles.productInfoRow}>
              <Text style={restockSessionsStyles.productInfoLabel}>Supplier: </Text>
              <Text style={restockSessionsStyles.productInfoValue}>{product.supplierName}</Text>
            </View>
            
            {/* Notepad divider line */}
            <View style={restockSessionsStyles.notepadDivider} />
            
            {product.supplierEmail && (
              <View style={restockSessionsStyles.productInfoRow}>
                <Text style={restockSessionsStyles.productInfoLabel}>Email: </Text>
                <Text style={restockSessionsStyles.productInfoValue}>{product.supplierEmail}</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={restockSessionsStyles.emptyState}>
          <Text style={restockSessionsStyles.emptyStateText}>
            No products added yet. Tap the + button to add your first product.
          </Text>
        </View>
      )}
      
      {/* Integrated Add Product button */}
      <TouchableOpacity 
        style={restockSessionsStyles.integratedAddButton}
        onPress={() => setShowAddProductForm(true)}
      >
        <Text style={restockSessionsStyles.integratedAddButtonIcon}>+</Text>
        <Text style={restockSessionsStyles.integratedAddButtonText}>Add Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSessionFlow = () => (
    <View style={restockSessionsStyles.sessionContainer}>
      {/* Session summary */}
      {currentSession && currentSession.products.length > 0 && (
        <View style={restockSessionsStyles.sessionSummary}>
          <Text style={restockSessionsStyles.summaryText}>
            {currentSession.products.length} product{currentSession.products.length !== 1 ? 's' : ''} added • 
            Ready to generate supplier emails
          </Text>
        </View>
      )}

      {/* Start section with instructions */}
      <View style={restockSessionsStyles.addProductSection}>
        <Text style={restockSessionsStyles.addProductInstructions}>
          Walk around your store and add products that need restocking
        </Text>
      </View>
      
      {/* Main content area */}
      {showAddProductForm ? renderAddProductForm() : 
       showEditProductForm ? renderEditProductForm() : 
       renderProductList()}

      {/* Bottom finish section */}
      {currentSession && currentSession.products.length > 0 && !showAddProductForm && !showEditProductForm && (
        <View style={restockSessionsStyles.bottomFinishSection}>
          <TouchableOpacity style={restockSessionsStyles.bottomFinishButton} onPress={finishSession}>
            <Text style={restockSessionsStyles.bottomFinishButtonText}>Finish & Generate Emails</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Notifications */}
      {notifications.map(renderNotification)}
      
      <KeyboardAvoidingView
        style={restockSessionsStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Error State */}
        {renderErrorState()}
        
        {/* Loading State */}
        {renderLoadingState()}
        
        {/* Main Content */}
        {!isLoadingData && !errorState.hasError && (
          isSessionActive ? renderSessionFlow() : renderStartSection()
        )}
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

      {/* Demo Success Toast - Remove this in production */}
      <CustomToast
        visible={false} // Set to true to see the new design
        type="success"
        title="Task created"
        message="Your restock session has been successfully created and is ready for use."
        autoDismiss={true}
        duration={4000}
        onDismiss={() => {}}
      />
    </View>
  );
} 