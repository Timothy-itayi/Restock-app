import React from 'react';
import { View, StyleSheet } from 'react-native';
import { restockSessionsStyles } from '../../../styles/components/restock-sessions';
import SkeletonBox from './SkeletonBox';

export default function RestockSessionsSkeleton() {
  return (
    <View style={[restockSessionsStyles.container, styles.container]}>
      {/* Session Header Skeleton */}
      <View style={restockSessionsStyles.sessionHeader}>
        <View style={restockSessionsStyles.sessionHeaderLeft}>
          <SkeletonBox width="60%" height={20} />
          <SkeletonBox width="40%" height={16} style={{ marginTop: 8 }} />
        </View>
      </View>

      {/* Session Summary Skeleton */}
      <View style={restockSessionsStyles.sessionSummary}>
        <SkeletonBox width="90%" height={16} />
      </View>

      {/* Instructions Section Skeleton */}
      <View style={restockSessionsStyles.addProductSection}>
        <SkeletonBox width="85%" height={16} />
      </View>

      {/* Product List Skeleton */}
      <View style={restockSessionsStyles.productList}>
        {/* Product Item Skeleton */}
        <View style={restockSessionsStyles.productItem}>
          {/* Product Header */}
          <View style={restockSessionsStyles.productHeader}>
            <SkeletonBox width="50%" height={18} />
            <SkeletonBox width="20%" height={16} />
            <View style={styles.productActions}>
              <SkeletonBox width={32} height={32} borderRadius={16} />
              <SkeletonBox width={32} height={32} borderRadius={16} style={{ marginLeft: 8 }} />
            </View>
          </View>
          
          {/* Notepad divider line */}
          <View style={restockSessionsStyles.notepadDivider} />
          
          {/* Product Details */}
          <View style={restockSessionsStyles.productInfoRow}>
            <SkeletonBox width="25%" height={14} />
            <SkeletonBox width="60%" height={14} />
          </View>
          
          <View style={restockSessionsStyles.notepadDivider} />
          
          <View style={restockSessionsStyles.productInfoRow}>
            <SkeletonBox width="35%" height={14} />
            <SkeletonBox width="50%" height={14} />
          </View>
          
          <View style={restockSessionsStyles.notepadDivider} />
          
          <View style={restockSessionsStyles.productInfoRow}>
            <SkeletonBox width="35%" height={14} />
            <SkeletonBox width="55%" height={14} />
          </View>
        </View>

        {/* Add Product Button Skeleton */}
        <View style={restockSessionsStyles.integratedAddButton}>
          <SkeletonBox width={18} height={18} borderRadius={9} />
          <SkeletonBox width="30%" height={16} style={{ marginLeft: 12 }} />
        </View>
      </View>

      {/* Bottom Finish Button Skeleton */}
      <View style={restockSessionsStyles.bottomFinishSection}>
        <SkeletonBox width="100%" height={48} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEFDF9',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 