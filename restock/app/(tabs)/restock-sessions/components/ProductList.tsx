import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
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
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  const items = session && typeof session.toValue === 'function'
    ? session.toValue().items
    : (session?.products || []);

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteProduct(productId)
        }
      ]
    );
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  if (!items || items.length === 0) {
    return (
      <View style={restockSessionsStyles.emptyState}>
        <View style={restockSessionsStyles.emptyStateIcon}>
          <Ionicons name="basket-outline" size={48} color="#6B7F6B" />
        </View>
        <Text style={restockSessionsStyles.emptyStateText}>
          No products added yet
        </Text>
        <Text style={restockSessionsStyles.emptyStateSubtext}>
          Tap the + button above to add your first product
        </Text>
      </View>
    );
  }

  return (
    <View style={restockSessionsStyles.productListContainer}>
      <View style={restockSessionsStyles.productListHeader}>
        <Text style={restockSessionsStyles.productListTitle}>
          Products ({items.length})
        </Text>
        <Text style={restockSessionsStyles.productListSubtitle}>
          Tap a product to expand details
        </Text>
      </View>
      
      <ScrollView 
        style={restockSessionsStyles.productList}
        contentContainerStyle={restockSessionsStyles.productListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((product: any, index: number) => {
          const isExpanded = expandedProduct === product.id;
          const productName = product.name || product.productName;
          
          return (
            <View key={product.id} style={restockSessionsStyles.productItem}>
              <TouchableOpacity
                style={restockSessionsStyles.productHeader}
                onPress={() => toggleProductExpansion(product.id)}
                activeOpacity={0.7}
              >
                <View style={restockSessionsStyles.productInfo}>
                  <Text style={restockSessionsStyles.productName} numberOfLines={1}>
                    {productName}
                  </Text>
                  <Text style={restockSessionsStyles.productQuantity}>
                    Qty: {product.quantity}
                  </Text>
                </View>
                
                <View style={restockSessionsStyles.productActions}>
                  <TouchableOpacity
                    style={restockSessionsStyles.editIconButton}
                    onPress={() => onEditProduct(product.id)}
                  >
                    <Ionicons name="pencil" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={restockSessionsStyles.deleteIconButton}
                    onPress={() => handleDeleteProduct(product.id, productName)}
                  >
                    <Ionicons name="trash" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={restockSessionsStyles.expandIconButton}
                    onPress={() => toggleProductExpansion(product.id)}
                  >
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#6B7F6B" 
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              
              {/* Expanded product details */}
              {isExpanded && (
                <View style={restockSessionsStyles.productDetails}>
                  <View style={restockSessionsStyles.productInfoRow}>
                    <Text style={restockSessionsStyles.productInfoLabel}>Product: </Text>
                    <Text style={restockSessionsStyles.productInfoValue}>{productName}</Text>
                  </View>
                  
                  <View style={restockSessionsStyles.productInfoRow}>
                    <Text style={restockSessionsStyles.productInfoLabel}>Quantity: </Text>
                    <Text style={restockSessionsStyles.productInfoValue}>{product.quantity}</Text>
                  </View>
                  
                  <View style={restockSessionsStyles.productInfoRow}>
                    <Text style={restockSessionsStyles.productInfoLabel}>Supplier: </Text>
                    <Text style={restockSessionsStyles.productInfoValue}>
                      {product.supplierName || 'Not specified'}
                    </Text>
                  </View>
                  
                  {product.supplierEmail && (
                    <View style={restockSessionsStyles.productInfoRow}>
                      <Text style={restockSessionsStyles.productInfoLabel}>Email: </Text>
                      <Text style={restockSessionsStyles.productInfoValue}>
                        {product.supplierEmail}
                      </Text>
                    </View>
                  )}
                  
                  {product.notes && (
                    <View style={restockSessionsStyles.productInfoRow}>
                      <Text style={restockSessionsStyles.productInfoLabel}>Notes: </Text>
                      <Text style={restockSessionsStyles.productInfoValue}>{product.notes}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};