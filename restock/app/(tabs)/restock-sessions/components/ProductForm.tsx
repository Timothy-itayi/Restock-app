import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FormState, StoredProduct, StoredSupplier, Product } from '../utils/types';
import { restockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface ProductFormProps {
  mode: 'add' | 'edit';
  formState: FormState;
  filteredProducts: StoredProduct[];
  filteredSuppliers: StoredSupplier[];
  editingProduct?: Product | null;
  
  // Form handlers
  onProductNameChange: (text: string) => void;
  onQuantityChange: (text: string) => void;
  onSupplierNameChange: (text: string) => void;
  onSupplierEmailChange: (text: string) => void;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
  
  // Suggestion handlers
  onSelectProductSuggestion: (product: StoredProduct) => void;
  onSelectSupplierSuggestion: (supplier: StoredSupplier) => void;
  
  // Action handlers
  onSubmit: () => void;
  onCancel: () => void;
  
  // Edit-specific handlers
  onEditProductChange?: (field: keyof Product, value: string | number) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  formState,
  filteredProducts,
  filteredSuppliers,
  editingProduct,
  onProductNameChange,
  onQuantityChange,
  onSupplierNameChange,
  onSupplierEmailChange,
  onIncrementQuantity,
  onDecrementQuantity,
  onSelectProductSuggestion,
  onSelectSupplierSuggestion,
  onSubmit,
  onCancel,
  onEditProductChange
}) => {
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Edit Product' : 'Add Product';
  const submitText = isEditMode ? 'Save Changes' : 'Add Product';

  // For edit mode, we use editingProduct values, for add mode we use formState
  const productName = isEditMode ? editingProduct?.name || '' : formState.productName;
  const quantity = isEditMode ? editingProduct?.quantity?.toString() || '1' : formState.quantity;
  const supplierName = isEditMode ? editingProduct?.supplierName || '' : formState.supplierName;
  const supplierEmail = isEditMode ? editingProduct?.supplierEmail || '' : formState.supplierEmail;

  const handleProductNameChange = (text: string) => {
    if (isEditMode && onEditProductChange) {
      onEditProductChange('name', text);
    } else {
      onProductNameChange(text);
    }
  };

  const handleQuantityChange = (text: string) => {
    if (isEditMode && onEditProductChange) {
      const num = parseInt(text) || 1;
      onEditProductChange('quantity', num);
    } else {
      onQuantityChange(text);
    }
  };

  const handleSupplierNameChange = (text: string) => {
    if (isEditMode && onEditProductChange) {
      onEditProductChange('supplierName', text);
    } else {
      onSupplierNameChange(text);
    }
  };

  const handleSupplierEmailChange = (text: string) => {
    if (isEditMode && onEditProductChange) {
      onEditProductChange('supplierEmail', text);
    } else {
      onSupplierEmailChange(text);
    }
  };

  const handleIncrementQuantity = () => {
    if (isEditMode && onEditProductChange && editingProduct) {
      onEditProductChange('quantity', editingProduct.quantity + 1);
    } else {
      onIncrementQuantity();
    }
  };

  const handleDecrementQuantity = () => {
    if (isEditMode && onEditProductChange && editingProduct && editingProduct.quantity > 1) {
      onEditProductChange('quantity', editingProduct.quantity - 1);
    } else {
      onDecrementQuantity();
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={restockSessionsStyles.formContainer}>
        <Text style={restockSessionsStyles.formTitle}>{title}</Text>
        
        {formState.errorMessage ? (
          <View style={restockSessionsStyles.errorMessage}>
            <Text style={restockSessionsStyles.errorText}>{formState.errorMessage}</Text>
          </View>
        ) : null}

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Product Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={productName}
            onChangeText={handleProductNameChange}
            placeholder="Enter product name"
            autoFocus={!isEditMode}
          />
          {!isEditMode && filteredProducts.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredProducts.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => onSelectProductSuggestion(product)}
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
              onPress={handleDecrementQuantity}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={restockSessionsStyles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              placeholder="1"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={handleIncrementQuantity}
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
          {!isEditMode && filteredSuppliers.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredSuppliers.map((supplier, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => onSelectSupplierSuggestion(supplier)}
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
            onChangeText={handleSupplierEmailChange}
            placeholder="Enter supplier email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={restockSessionsStyles.formButtons}>
          <TouchableOpacity 
            style={restockSessionsStyles.cancelButton} 
            onPress={onCancel}
          >
            <Text style={restockSessionsStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={restockSessionsStyles.saveButton} 
            onPress={onSubmit}
          >
            <Text style={restockSessionsStyles.saveButtonText}>{submitText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};