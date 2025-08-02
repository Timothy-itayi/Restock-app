import React from 'react';
import { View, StyleSheet } from 'react-native';
import { restockSessionsStyles } from '../../../styles/components/restock-sessions';
import SkeletonBox from './SkeletonBox';

export default function RestockSessionsSkeleton() {
  return (
    <View style={[restockSessionsStyles.container, styles.container]}>
      {/* Start Section Skeleton */}
      <View style={restockSessionsStyles.startSection}>
        <SkeletonBox width="70%" height={24} />
        <SkeletonBox width="100%" height={16} style={{ marginTop: 16 }} />
        <SkeletonBox width="90%" height={16} style={{ marginTop: 8 }} />
        <SkeletonBox width="60%" height={48} borderRadius={12} style={{ marginTop: 32 }} />
      </View>

      {/* Session Flow Skeleton */}
      <View style={restockSessionsStyles.sessionContainer}>
        {/* Session Summary */}
        <View style={restockSessionsStyles.sessionSummary}>
          <SkeletonBox width="80%" height={14} />
        </View>

        {/* Add Product Section */}
        <View style={restockSessionsStyles.addProductSection}>
          <SkeletonBox width="90%" height={14} />
        </View>

        {/* Product List Skeleton */}
        <View style={restockSessionsStyles.productList}>
          {/* Product Item 1 */}
          <View style={restockSessionsStyles.productItem}>
            <View style={styles.productInfo}>
              <SkeletonBox width="60%" height={18} />
              <SkeletonBox width="40%" height={14} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.productActions}>
              <SkeletonBox width={24} height={24} borderRadius={12} />
              <SkeletonBox width={24} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
            </View>
          </View>

          {/* Product Item 2 */}
          <View style={restockSessionsStyles.productItem}>
            <View style={styles.productInfo}>
              <SkeletonBox width="70%" height={18} />
              <SkeletonBox width="50%" height={14} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.productActions}>
              <SkeletonBox width={24} height={24} borderRadius={12} />
              <SkeletonBox width={24} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
            </View>
          </View>

          {/* Product Item 3 */}
          <View style={restockSessionsStyles.productItem}>
            <View style={styles.productInfo}>
              <SkeletonBox width="55%" height={18} />
              <SkeletonBox width="35%" height={14} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.productActions}>
              <SkeletonBox width={24} height={24} borderRadius={12} />
              <SkeletonBox width={24} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={restockSessionsStyles.bottomFinishSection}>
          <SkeletonBox width="45%" height={48} borderRadius={12} />
          <SkeletonBox width="45%" height={48} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
  },
  productInfo: {
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 