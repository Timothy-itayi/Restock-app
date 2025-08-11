import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { FormState, StoredProduct, StoredSupplier, Product } from '../utils/types';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

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
}

const ProductFormComponent: React.FC<ProductFormProps> = ({
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
  onCancel
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Edit Product' : 'Add Product';
  const submitText = isEditMode ? 'Save Changes' : 'Add Product';

  // Use formState for both edit and add modes since editProduct() populates formState
  const productName = formState.productName;
  const quantity = formState.quantity;
  const supplierName = formState.supplierName;
  const supplierEmail = formState.supplierEmail;

  // Use the same handlers for both add and edit modes since formState is used for both
  const handleProductNameChange = React.useCallback((text: string) => {
    onProductNameChange(text);
  }, [onProductNameChange]);

  const handleQuantityChange = React.useCallback((text: string) => {
    onQuantityChange(text);
  }, [onQuantityChange]);

  const handleSupplierNameChange = React.useCallback((text: string) => {
    onSupplierNameChange(text);
  }, [onSupplierNameChange]);

  const handleSupplierEmailChange = React.useCallback((text: string) => {
    onSupplierEmailChange(text);
  }, [onSupplierEmailChange]);

  const handleIncrementQuantity = React.useCallback(() => {
    onIncrementQuantity();
  }, [onIncrementQuantity]);

  const handleDecrementQuantity = React.useCallback(() => {
    onDecrementQuantity();
  }, [onDecrementQuantity]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
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
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
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
                returnKeyType="next"
                blurOnSubmit={false}
                enablesReturnKeyAutomatically={true}
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
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
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
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit={true}
              enablesReturnKeyAutomatically={true}
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
    </KeyboardAvoidingView>
  );
};

// Export the memoized component
const ProductForm = React.memo(ProductFormComponent);
export { ProductForm };