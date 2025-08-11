import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, RestockSession } from '../utils/types';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface ProductListProps {
  currentSession: RestockSession | null;
  onEditProduct: (product: Product) => void;
  onRemoveProduct: (productId: string) => void;
  onAddProduct: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  currentSession,
  onEditProduct,
  onRemoveProduct,
  onAddProduct
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  return (
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
                onPress={() => onEditProduct(product)}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={restockSessionsStyles.deleteIconButton}
                onPress={() => onRemoveProduct(product.id)}
              >
                <Ionicons name="trash" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Notepad divider line */}
            <View style={restockSessionsStyles.notepadDivider} />
            
            <View style={restockSessionsStyles.productInfoRow}>
              <Text style={restockSessionsStyles.productInfoLabel}>Name: </Text>
              <Text style={restockSessionsStyles.productInfoValue}>{product.name}</Text>
            </View>
            
            {/* Notepad divider line */}
            <View style={restockSessionsStyles.notepadDivider} />
            
            <View style={restockSessionsStyles.productInfoRow}>
              <Text style={restockSessionsStyles.productInfoLabel}>Supplier Name: </Text>
              <Text style={restockSessionsStyles.productInfoValue}>{product.supplierName}</Text>
            </View>
            
            {/* Notepad divider line */}
            <View style={restockSessionsStyles.notepadDivider} />
            
            <View style={restockSessionsStyles.productInfoRow}>
              <Text style={restockSessionsStyles.productInfoLabel}>Supplier Email: </Text>
              <Text style={restockSessionsStyles.productInfoValue}>{product.supplierEmail || 'Not specified'}</Text>
            </View>
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
        onPress={onAddProduct}
      >
        <Text style={restockSessionsStyles.integratedAddButtonIcon}>+</Text>
        <Text style={restockSessionsStyles.integratedAddButtonText}>Add Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};