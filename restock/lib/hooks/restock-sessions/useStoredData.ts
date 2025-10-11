import { useState, useCallback, useEffect } from 'react';
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';

import { StoredProduct, StoredSupplier, ErrorState, LoadingState } from '../../utils/restock-sessions/types';
import { Logger } from '../../utils/restock-sessions/logger';
import { ProductService } from '../../../backend/_services/products';
import { SupplierService } from '../../../backend/_services/suppliers';

export const useStoredData = () => {
  const { userId } = useUnifiedAuth();
  
  // Data state
  const [storedProducts, setStoredProducts] = useState<StoredProduct[]>([]);
  const [storedSuppliers, setStoredSuppliers] = useState<StoredSupplier[]>([]);
  
  // Loading state
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoadingData: true,
    minLoadingTime: true,
    hasLoaded: false
  });
  
  // Error state
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    errorMessage: '',
    timestamp: new Date()
  });

  // Computed state
  const isDataReady = !loadingState.isLoadingData && !loadingState.minLoadingTime && loadingState.hasLoaded;

  // Minimum loading time to prevent flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingState(prev => ({ ...prev, minLoadingTime: false }));
    }, 1500); // Increased to 1500ms to wait for session data to load
    
    return () => clearTimeout(timer);
  }, []);

  // Component initialization
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setLoadingState(prev => ({ ...prev, hasLoaded: true }));
    }, 100); // Small delay to ensure proper initialization
    
    return () => clearTimeout(initTimer);
  }, []);

  const loadStoredData = useCallback(async () => {
    if (!userId) {
      Logger.warning('Cannot load stored data: no userId');
      return;
    }
    
    setLoadingState(prev => ({ ...prev, isLoadingData: true }));
    setErrorState({ hasError: false, errorMessage: '', timestamp: new Date() });
    
    try {
      Logger.info('Loading stored data via SecureDataService', { userId });
      
      // Load data via individual services
      const [productsResult, suppliersResult] = await Promise.all([
        ProductService.getUserProducts(),
        SupplierService.getUserSuppliers(),
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
        setStoredProducts([]); // Set empty array instead of null
      } else {
        const products = (productsResult.data as unknown as any[]) || [];
        Logger.success('Products loaded successfully', { 
          count: products.length,
          products: products.map((p: any) => ({ id: p.id, name: p.name }))
        });
        setStoredProducts(products);
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
        setStoredSuppliers([]); // Set empty array instead of null
      } else {
        const suppliers = (suppliersResult.data as unknown as any[]) || [];
        Logger.success('Suppliers loaded successfully', { 
          count: suppliers.length,
          suppliers: suppliers.map((s: any) => ({ 
            id: s.id, 
            name: s.name,
            email: s.email // Add email to logging
          }))
        });
        
        // Validate that suppliers have emails
        const suppliersWithoutEmails = suppliers.filter((s: any) => !s.email || s.email.trim() === '');
        if (suppliersWithoutEmails.length > 0) {
          Logger.warning('Found suppliers without emails', { 
            count: suppliersWithoutEmails.length,
            suppliers: suppliersWithoutEmails.map((s: any) => ({ id: s.id, name: s.name }))
          });
        }
        
        setStoredSuppliers(suppliers);
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
      setLoadingState(prev => ({ 
        ...prev, 
        isLoadingData: false, 
        hasLoaded: true 
      }));
    }
  }, [userId]);

  // Load data when userId changes
  useEffect(() => {
    if (userId) {
      Logger.info('Component mounted, loading stored data', { userId });
      loadStoredData();
    } else {
      Logger.warning('Component mounted but no userId available');
      // If no userId, still need to stop loading to prevent infinite skeleton
      setLoadingState(prev => ({ 
        ...prev, 
        isLoadingData: false, 
        hasLoaded: true 
      }));
    }
  }, [userId, loadStoredData]);

  const retryLoadData = useCallback(() => {
    Logger.info('User retrying data load');
    loadStoredData();
  }, [loadStoredData]);

  const updateStoredProducts = useCallback((products: StoredProduct[]) => {
    setStoredProducts(products);
  }, []);

  const updateStoredSuppliers = useCallback((suppliers: StoredSupplier[]) => {
    setStoredSuppliers(suppliers);
  }, []);

  return {
    // Data
    storedProducts,
    storedSuppliers,
    
    // State
    isDataReady,
    loadingState,
    errorState,
    
    // Actions
    loadStoredData,
    retryLoadData,
    updateStoredProducts,
    updateStoredSuppliers,
    
    // Setters
    setStoredProducts,
    setStoredSuppliers
  };
};