import { useState, useCallback } from 'react';
import { useAuth } from "@clerk/clerk-expo";
import { ProductService } from "../../../../backend/services/products";
import { SupplierService } from "../../../../backend/services/suppliers";
import { SessionService } from "../../../../backend/services/sessions";
import { 
  FormState, 
  Product, 
  RestockSession, 
  StoredProduct, 
  StoredSupplier 
} from '../utils/types';
import { ValidationUtils } from '../utils/validation';
import { Logger } from '../utils/logger';

export const useProductForm = () => {
  const { userId } = useAuth();
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    productName: '',
    quantity: '1',
    supplierName: '',
    supplierEmail: '',
    errorMessage: ''
  });

  // Autocomplete state
  const [filteredProducts, setFilteredProducts] = useState<StoredProduct[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<StoredSupplier[]>([]);

  // Form controls
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const updateFormField = useCallback((field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  const setErrorMessage = useCallback((message: string) => {
    setFormState(prev => ({ ...prev, errorMessage: message }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      productName: '',
      quantity: '1',
      supplierName: '',
      supplierEmail: '',
      errorMessage: ''
    });
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  }, []);

  const handleProductNameChange = useCallback((text: string, storedProducts: StoredProduct[]) => {
    updateFormField('productName', text);
    if (text.length > 0) {
      const filtered = storedProducts
        .filter(product => product.name.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [updateFormField]);

  const handleSupplierNameChange = useCallback((text: string, storedSuppliers: StoredSupplier[]) => {
    updateFormField('supplierName', text);
    if (text.length > 0) {
      const filtered = storedSuppliers
        .filter(supplier => supplier.name.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5);
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers([]);
    }
  }, [updateFormField]);

  const selectProductSuggestion = useCallback((product: StoredProduct) => {
    // Quiet noisy selection logs
    updateFormField('productName', product.name);
    if (product.supplier) {
      updateFormField('supplierName', product.supplier.name);
      updateFormField('supplierEmail', product.supplier.email);
      // Avoid verbose autofill logging
    }
    setFilteredProducts([]);
  }, [updateFormField]);

  const selectSupplierSuggestion = useCallback((supplier: StoredSupplier) => {
    // Quiet noisy selection logs
    // Ensure email is properly set
    if (!supplier.email) {
      Logger.warning('Supplier has no email', { supplierId: supplier.id, supplierName: supplier.name });
    }
    
    updateFormField('supplierName', supplier.name);
    updateFormField('supplierEmail', supplier.email || '');
    setFilteredSuppliers([]);
  }, [updateFormField]);

  const incrementQuantity = useCallback(() => {
    const currentQty = parseInt(formState.quantity) || 0;
    const newQty = currentQty + 1;
    updateFormField('quantity', newQty.toString());
  }, [formState.quantity, updateFormField]);

  const decrementQuantity = useCallback(() => {
    const currentQty = parseInt(formState.quantity) || 1;
    if (currentQty > 1) {
      const newQty = currentQty - 1;
      updateFormField('quantity', newQty.toString());
    }
  }, [formState.quantity, updateFormField]);

  const validateForm = useCallback(() => {
    const { productName, quantity, supplierName, supplierEmail } = formState;
    const validation = ValidationUtils.validateProductForm(
      productName, 
      quantity, 
      supplierName, 
      supplierEmail
    );
    
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage);
    }
    
    return validation.isValid;
  }, [formState, setErrorMessage]);

  const addProduct = useCallback(async (
    currentSession: RestockSession,
    storedProducts: StoredProduct[],
    storedSuppliers: StoredSupplier[],
    onUpdateStoredProducts: (products: StoredProduct[]) => void,
    onUpdateStoredSuppliers: (suppliers: StoredSupplier[]) => void
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    const { productName, quantity, supplierName, supplierEmail } = formState;
    
    Logger.info('Adding product to session', { productName, quantity, supplierName, supplierEmail });
    
    setErrorMessage("");
    
    if (!validateForm()) {
      Logger.warning('Form validation failed', { errorMessage: formState.errorMessage });
      return { success: false, error: formState.errorMessage };
    }

    if (!currentSession) {
      Logger.error('Cannot add product: no active session');
      return { success: false, error: 'No active session found' };
    }

    if (!userId) {
      Logger.error('Cannot add product: no userId');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Step 1: Ensure supplier exists (create if needed)
      let supplierId: string;
      const existingSupplier = storedSuppliers.find(s => 
        s.name.toLowerCase() === supplierName.toLowerCase()
      );
      
      if (existingSupplier) {
        Logger.info('Using existing supplier', { 
          supplierId: existingSupplier.id, 
          supplierName: existingSupplier.name,
          supplierEmail: existingSupplier.email // Add email to logging
        });
        supplierId = existingSupplier.id;
        
        // Ensure the existing supplier has an email
        if (!existingSupplier.email) {
          Logger.warning('Existing supplier has no email, updating with provided email', { 
            supplierId: existingSupplier.id, 
            supplierName: existingSupplier.name,
            providedEmail: supplierEmail 
          });
          
          // Update the supplier with the provided email
          const updateResult = await SupplierService.updateSupplier(existingSupplier.id, {
            email: supplierEmail.trim()
          });
          
          if (updateResult.error) {
            Logger.error('Failed to update supplier email', updateResult.error, { supplierId: existingSupplier.id });
          } else {
            Logger.success('Supplier email updated successfully', { 
              supplierId: existingSupplier.id, 
              email: supplierEmail.trim() 
            });
            
            // Update local state with the updated supplier
            const updatedSupplier = { ...existingSupplier, email: supplierEmail.trim() };
            const updatedSuppliers = storedSuppliers.map(s => 
              s.id === existingSupplier.id ? updatedSupplier : s
            );
            onUpdateStoredSuppliers(updatedSuppliers);
          }
        }
      } else {
        Logger.info('Creating new supplier', { supplierName, supplierEmail });
        
        // Validate email before creating supplier
        if (!supplierEmail || supplierEmail.trim() === '') {
          Logger.error('Cannot create supplier: email is required', { supplierName, supplierEmail });
          return { success: false, error: 'Supplier email is required' };
        }
        
        const supplierResult = await SupplierService.createSupplier({
          user_id: userId,
          name: supplierName.trim(),
          email: supplierEmail.trim(),
        });
        
        if (supplierResult.error) {
          Logger.error('Failed to create supplier', supplierResult.error, { supplierName, supplierEmail });
          return { success: false, error: 'Failed to create supplier' };
        }
        
        supplierId = supplierResult.data.id;
        Logger.success('Supplier created successfully', { 
          supplierId, 
          supplierName,
          supplierEmail: supplierResult.data.email // Log the saved email
        });
        
        // Add to local state for autocomplete
        onUpdateStoredSuppliers([...storedSuppliers, supplierResult.data]);
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
          return { success: false, error: 'Failed to create product' };
        }
        
        productId = productResult.data.id;
        Logger.success('Product created successfully', { productId, productName });
        
        // Add to local state for autocomplete
        onUpdateStoredProducts([...storedProducts, productResult.data]);
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
        return { success: false, error: 'Failed to add product to session' };
      }
      
      Logger.success('Item added to session successfully', { 
        itemId: sessionItemResult.data.id,
        sessionId: currentSession.id 
      });

      // Step 4: Create the new product object
      const newProduct: Product = {
        id: sessionItemResult.data.id, // Use the database item ID
        name: productName.trim(),
        quantity: parseInt(quantity),
        supplierName: supplierName.trim(),
        supplierEmail: supplierEmail.trim(),
      };

      // Reset form
      resetForm();
      setShowAddProductForm(false);
      
      Logger.success('Product added to session successfully', { 
        productId: newProduct.id
      });

      return { success: true, product: newProduct };
      
    } catch (error) {
      Logger.error('Unexpected error adding product', error, { 
        productName, 
        supplierName, 
        supplierEmail,
        sessionId: currentSession.id 
      });
      return { success: false, error: 'Failed to add product to session' };
    }
  }, [formState, validateForm, setErrorMessage, resetForm, userId]);

  const editProduct = useCallback((product: Product) => {
    Logger.info('Editing product', { productId: product.id, productName: product.name });
    
    setEditingProduct(product);
    setFormState({
      productName: product.name,
      quantity: product.quantity.toString(),
      supplierName: product.supplierName,
      supplierEmail: product.supplierEmail,
      errorMessage: ''
    });
    setShowEditProductForm(true);
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  }, []);

  const saveEditedProduct = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const { quantity } = formState;
    
    Logger.info('Saving edited product', { 
      productId: editingProduct?.id, 
      productName: editingProduct?.name 
    });
    
    setErrorMessage("");
    
    if (!validateForm() || !editingProduct) {
      Logger.warning('Cannot save edited product: validation failed or missing data', {
        validationPassed: validateForm(),
        hasEditingProduct: !!editingProduct
      });
      return { success: false, error: formState.errorMessage || 'Missing product data' };
    }

    try {
      // Update the session item in the database
      const updateResult = await SessionService.updateSessionItem(editingProduct.id, {
        quantity: parseInt(quantity),
      });
      
      if (updateResult.error) {
        Logger.error('Failed to update session item', updateResult.error, { itemId: editingProduct.id });
        return { success: false, error: 'Failed to update product' };
      }
      
      Logger.success('Session item updated successfully', { itemId: editingProduct.id });

      // Reset form
      setEditingProduct(null);
      resetForm();
      setShowEditProductForm(false);
      
      Logger.success('Product edited successfully', { 
        productId: editingProduct.id
      });

      return { success: true };
    } catch (error) {
      Logger.error('Unexpected error updating product', error, { productId: editingProduct.id });
      return { success: false, error: 'Failed to update product' };
    }
  }, [formState, validateForm, setErrorMessage, editingProduct, resetForm]);

  const cancelEdit = useCallback(() => {
    Logger.info('Canceling product edit');
    
    setEditingProduct(null);
    resetForm();
    setShowEditProductForm(false);
  }, [resetForm]);

  const cancelAddProduct = useCallback(() => {
    Logger.info('Canceling add product form');
    
    setShowAddProductForm(false);
    resetForm();
  }, [resetForm]);

  return {
    // Form state
    formState,
    filteredProducts,
    filteredSuppliers,
    editingProduct,
    showAddProductForm,
    showEditProductForm,

    // Form actions
    updateFormField,
    handleProductNameChange,
    handleSupplierNameChange,
    selectProductSuggestion,
    selectSupplierSuggestion,
    incrementQuantity,
    decrementQuantity,
    validateForm,
    resetForm,
    setErrorMessage,

    // Product operations
    addProduct,
    editProduct,
    saveEditedProduct,
    cancelEdit,
    cancelAddProduct,

    // Form controls
    setShowAddProductForm,
    setShowEditProductForm,
    setEditingProduct
  };
};