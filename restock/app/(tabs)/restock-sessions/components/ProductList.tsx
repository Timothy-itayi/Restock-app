import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface ProductListProps {
  session: any | null; // domain session or legacy UI type
  onEditProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  session,
  onEditProduct,
  onDeleteProduct
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const items = session && typeof session.toValue === 'function'
    ? session.toValue().items
    : (session?.products || []);
  return (
    <ScrollView 
      style={restockSessionsStyles.productList}
      contentContainerStyle={restockSessionsStyles.productListContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {items && items.length > 0 ? (
        items.map((product: any, index: number) => (
          <View key={product.id} style={restockSessionsStyles.productItem}>
            <View style={restockSessionsStyles.productHeader}>
              <Text style={restockSessionsStyles.productName}>{product.name || product.productName}</Text>
              <Text style={restockSessionsStyles.productQuantity}>Qty: {product.quantity}</Text>
              <TouchableOpacity
                style={restockSessionsStyles.editIconButton}
                onPress={() => onEditProduct(product.id)}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={restockSessionsStyles.deleteIconButton}
                onPress={() => onDeleteProduct(product.id)}
              >
                <Ionicons name="trash" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Notepad divider line */}
            <View style={restockSessionsStyles.notepadDivider} />
            
            <View style={restockSessionsStyles.productInfoRow}>
              <Text style={restockSessionsStyles.productInfoLabel}>Name: </Text>
              <Text style={restockSessionsStyles.productInfoValue}>{product.name || product.productName}</Text>
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
    </ScrollView>
  );
};