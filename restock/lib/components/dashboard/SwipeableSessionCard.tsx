import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, useWindowDimensions, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { getDashboardStyles } from '../../../styles/components/dashboard';
import { useSafeTheme } from '../../stores/useThemeStore';
import colors, { type AppColors } from '../../theme/colors';
import { getSessionColorTheme } from '../../utils/restock-sessions/colorUtils';
import { useRepositories } from '../../infrastructure/_supabase/SupabaseHooksProvider';

interface UnfinishedSession {
  id: string;
  name?: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  items: any[];
}

interface SupplierInfo {
  id: string;
  name: string;
  itemCount: number;
  totalQuantity: number;
  percentage: number;
}

interface SwipeableSessionCardProps {
  session: UnfinishedSession;
  index: number;
  onSessionDeleted: (sessionId: string) => void;
  onSessionTap?: (sessionId: string, sessionName?: string, sessionIndex?: number) => void;
}

const SWIPE_THRESHOLD = -80;
const DELETE_BUTTON_WIDTH = 80;

export const SwipeableSessionCard: React.FC<SwipeableSessionCardProps> = ({
  session,
  index,
  onSessionDeleted,
  onSessionTap,
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const t = useSafeTheme();
  const dashboardStyles = getDashboardStyles(t.theme as AppColors);
 
  const { sessionRepository } = useRepositories();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const translateX = useSharedValue(0);
  const deleteButtonOpacity = useSharedValue(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSupplierBreakdown = (session: UnfinishedSession) => {
    const supplierCounts: { [key: string]: number } = {};
    
    session.items.forEach(item => {
      const suppliers = item && item.suppliers
        ? (Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers)
        : null;
      const supplierName = suppliers && suppliers.name ? suppliers.name : 'Unknown Supplier';
      supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1;
    });

    return Object.entries(supplierCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / session.totalItems) * 100)
    }));
  };

  const getDetailedSupplierBreakdown = (session: UnfinishedSession): SupplierInfo[] => {
    const supplierData: { [key: string]: SupplierInfo } = {};
    
    session.items.forEach(item => {
      const suppliers = item && item.suppliers
        ? (Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers)
        : null;
      const supplierName = suppliers && suppliers.name ? suppliers.name : 'Unknown Supplier';
      const supplierId = suppliers && suppliers.id ? suppliers.id : 'unknown';
      
      if (!supplierData[supplierId]) {
        supplierData[supplierId] = {
          id: supplierId,
          name: supplierName,
          itemCount: 0,
          totalQuantity: 0,
          percentage: 0
        };
      }
      
      supplierData[supplierId].itemCount += 1;
      supplierData[supplierId].totalQuantity += item.quantity || 0;
    });

    Object.values(supplierData).forEach(supplier => {
      supplier.percentage = session.totalItems > 0 
        ? Math.round((supplier.itemCount / session.totalItems) * 100)
        : 0;
    });

    return Object.values(supplierData).sort((a, b) => b.itemCount - a.itemCount);
  };

  const getSupplierColor = (index: number) => {
    const colors = [
      '#14B8A6', '#84CC16', '#F97316', '#8B5CF6', '#EAB308', 
      '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#6366F1', 
      '#EF4444', '#8B5A2B'
    ];
    return colors[index % colors.length];
  };

  const handleDeleteSession = async () => {
    if (isDeleting) return;

    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.name || 'this session'}"? This will remove all ${session.totalItems} products and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!sessionRepository) {
              Alert.alert('Error', 'Session repository not available');
              return;
            }

            setIsDeleting(true);
            try {
              await sessionRepository.delete(session.id);
              console.log('📢 Dashboard: Emitting session deleted event for:', session.id);
              DeviceEventEmitter.emit('restock:sessionDeleted', { sessionId: session.id });
              onSessionDeleted(session.id);
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred while deleting the session');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleSessionTap = () => {
    if (onSessionTap) {
      onSessionTap(session.id, session.name, index);
    }
    
    router.push({
      pathname: '/(tabs)/restock-sessions' as any,
      params: {
        sessionId: session.id,
        action: 'continue'
      }
    });
  };

  // New Gesture API (replaces PanGestureHandler + useAnimatedGestureHandler)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      deleteButtonOpacity.value = 0;
    })
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        if (event.translationX < -20) {
          deleteButtonOpacity.value = withSpring(1);
        }
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH);
        deleteButtonOpacity.value = withSpring(1);
      } else {
        translateX.value = withSpring(0);
        deleteButtonOpacity.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedDeleteButtonStyle = useAnimatedStyle(() => ({
    opacity: deleteButtonOpacity.value,
  }));

  const sessionColor = getSessionColorTheme(session.id, index);
  const supplierBreakdown = getSupplierBreakdown(session);
  const detailedSupplierBreakdown = getDetailedSupplierBreakdown(session);
  const totalQuantity = session.totalQuantity;

  return (
    <View style={styles.container}>
      {/* Delete Button (Background) */}
      <Animated.View style={[styles.deleteButton, animatedDeleteButtonStyle]}>
        <TouchableOpacity
          style={styles.deleteButtonContent}
          onPress={handleDeleteSession}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.deleteButtonText}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Session Card (Foreground) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
          <View
            style={[
              dashboardStyles.sessionCard,
              {
                borderLeftWidth: 4,
                borderLeftColor: sessionColor.primary,
                backgroundColor: sessionColor.light,
              },
            ]}
          >
            <View style={dashboardStyles.sessionHeader}>
              <View style={dashboardStyles.sessionInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: sessionColor.primary,
                      marginRight: 8,
                    }}
                  />
                  <Text style={dashboardStyles.sessionTitle}>
                    {session.name
                      ? `${session.name} • `
                      : `Session #${typeof session.id === 'string' ? session.id.slice(-4) : index + 1} • `}
                    {formatDate(session.createdAt)}
                  </Text>
                </View>
                <Text style={dashboardStyles.sessionSubtitle}>
                  {session.totalItems} items • {totalQuantity} total quantity • {session.uniqueSuppliers} suppliers
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  dashboardStyles.continueButton,
                  { backgroundColor: sessionColor.primary },
                ]}
                onPress={handleSessionTap}
              >
                <Text style={[dashboardStyles.continueButtonText, { color: '#FFFFFF' }]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>

            <View style={dashboardStyles.breakdownContainer}>
              <View style={dashboardStyles.breakdownHeader}>
                <Text style={dashboardStyles.breakdownTitle}>SUPPLIER BREAKDOWN</Text>
                <Text style={dashboardStyles.breakdownTotal}>
                  {session.uniqueSuppliers} suppliers
                </Text>
              </View>

              <View style={dashboardStyles.chartContainer}>
                <View style={dashboardStyles.chart}>
                  {supplierBreakdown.map((supplier, idx) => (
                    <View
                      key={supplier.name}
                      style={[
                        dashboardStyles.chartSegment,
                        {
                          backgroundColor: getSupplierColor(idx),
                          flex: supplier.count,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={dashboardStyles.chartLabel}>View by Supplier</Text>
              </View>

              <View style={dashboardStyles.breakdownList}>
                {detailedSupplierBreakdown.map((supplier, idx) => (
                  <View key={supplier.id} style={dashboardStyles.breakdownItem}>
                    <View style={dashboardStyles.breakdownItemHeader}>
                      <View
                        style={[
                          dashboardStyles.breakdownItemIcon,
                          { backgroundColor: getSupplierColor(idx) },
                        ]}
                      >
                        <Ionicons name="business" size={12} color="white" />
                      </View>
                      <Text style={dashboardStyles.breakdownItemName}>{supplier.name}</Text>
                    </View>
                    <View style={dashboardStyles.breakdownItemStats}>
                      <Text style={dashboardStyles.breakdownItemPercentage}>
                        {supplier.percentage}% of items
                      </Text>
                      <Text style={dashboardStyles.breakdownItemCount}>
                        {supplier.itemCount} items ({supplier.totalQuantity} total)
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  deleteButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
