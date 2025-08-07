import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView, RefreshControl, Image } from "react-native";
import { dashboardStyles } from "../../styles/components/dashboard";
import { useAuth } from "@clerk/clerk-expo";
import { SessionService } from "../../backend/services/sessions";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import SkeletonBox from "../components/skeleton/SkeletonBox";
import { useUnifiedAuth } from "../_contexts/UnifiedAuthProvider";
import useProfileStore from "../stores/useProfileStore";

// Debug flag - set to false in production
const DEBUG_MODE = __DEV__;

interface SessionItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
  }[];
  suppliers: {
    id: string;
    name: string;
  }[];
}

interface UnfinishedSession {
  id: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  items: SessionItem[];
}

interface SupplierInfo {
  id: string;
  name: string;
  itemCount: number;
  totalQuantity: number;
  percentage: number;
}

export default function DashboardScreen() {
  const { userId, isSignedIn } = useAuth();
  const { isReady: authReady, isAuthenticated, authType } = useUnifiedAuth();

  // Use profile store for user data
  const { userName, storeName, isLoading: profileLoading } = useProfileStore();
  
  const [unfinishedSessions, setUnfinishedSessions] = useState<UnfinishedSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [displayStartTime] = useState(Date.now());

  // Component display logging
  useEffect(() => {
    console.log('📺 Dashboard: Component mounted', {
      timestamp: displayStartTime,
      userId: !!userId,
      isSignedIn,
      authReady,
      isAuthenticated,
      authType
    });

    return () => {
      const displayDuration = Date.now() - displayStartTime;
      console.log('📺 Dashboard: Component unmounted', {
        displayDuration,
        timestamp: Date.now()
      });
    };
  }, [displayStartTime, userId, isSignedIn, authReady, isAuthenticated, authType]);


  useEffect(() => {
    console.log('📺 Dashboard: Data fetch effect triggered', {
      userId: !!userId,
      isSignedIn,
      authReady,
      isAuthenticated,
      authType,
      needsProfileSetup: authType?.needsProfileSetup,
      timestamp: Date.now()
    });

    // Only fetch data when auth is fully settled and user doesn't need profile setup
    if (!authReady) {
      console.log('📺 Dashboard: Auth not ready yet, waiting...');
      return;
    }

    if (!isAuthenticated || !userId) {
      console.log('📺 Dashboard: User not authenticated or no userId, setting sessions loading to false');
      setSessionsLoading(false);
      return;
    }

    if (authType?.needsProfileSetup) {
      console.log('📺 Dashboard: User needs profile setup, not fetching data yet');
      return;
    }

    console.log('📺 Dashboard: All conditions met, starting sessions fetch');

    const fetchUnfinishedSessions = async () => {
      console.log('📺 Dashboard: Fetching unfinished sessions...');
      try {
        const result = await SessionService.getUnfinishedSessions(userId);
        if (result.data) {
          setUnfinishedSessions(result.data);
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching unfinished sessions:', error);
      } finally {
        console.log('📺 Dashboard: Sessions fetch complete');
        setSessionsLoading(false);
      }
    };

    fetchUnfinishedSessions();
  }, [userId, isSignedIn, authReady, isAuthenticated, authType]);

  // Fallback timeout to prevent infinite loading for sessions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionsLoading) {
        console.log('Dashboard: Fallback timeout - setting sessionsLoading to false');
        setSessionsLoading(false);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timer);
  }, [sessionsLoading]);

  // Refresh data when user returns to dashboard
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        const refreshData = async () => {
          try {
            const sessionsResult = await SessionService.getUnfinishedSessions(userId);
            
            if (sessionsResult.data) {
              setUnfinishedSessions(sessionsResult.data);
            }
          } catch (error) {
            console.error('Error refreshing dashboard sessions data:', error);
          }
        };
        
        refreshData();
      }
    }, [userId])
  );

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
    
    if (DEBUG_MODE) {
      console.log(`[Dashboard] Processing supplier breakdown for session ${session.id} with ${session.items.length} items`);
    }
    
    session.items.forEach(item => {
      // Access supplier name from the correct data structure (handle both array and object formats)
      const suppliers = Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers;
      const supplierName = suppliers?.name || 'Unknown Supplier';
      
      if (DEBUG_MODE) {
        console.log(`[Dashboard] Item ${item.id}: supplier = ${supplierName}`, {
          suppliers: item.suppliers,
          suppliersType: typeof item.suppliers,
          isArray: Array.isArray(item.suppliers)
        });
      }
      
      supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1;
    });

    const breakdown = Object.entries(supplierCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / session.totalItems) * 100)
    }));

    if (DEBUG_MODE) {
      console.log(`[Dashboard] Supplier breakdown:`, breakdown);
    }
    return breakdown;
  };

  const getDetailedSupplierBreakdown = (session: UnfinishedSession): SupplierInfo[] => {
    const supplierData: { [key: string]: SupplierInfo } = {};
    
    session.items.forEach(item => {
      const suppliers = Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers;
      const supplierName = suppliers?.name || 'Unknown Supplier';
      const supplierId = suppliers?.id || 'unknown';
      
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

    // Calculate percentages with safety check for division by zero
    Object.values(supplierData).forEach(supplier => {
      supplier.percentage = session.totalItems > 0 
        ? Math.round((supplier.itemCount / session.totalItems) * 100)
        : 0;
    });

    return Object.values(supplierData).sort((a, b) => b.itemCount - a.itemCount);
  };


  const getSupplierColor = (index: number) => {
    // Vibrant colors similar to financial app categories - teal, olive green, orange, purple, golden-brown
    const colors = [
      '#14B8A6', // Teal
      '#84CC16', // Olive green  
      '#F97316', // Orange
      '#8B5CF6', // Purple
      '#EAB308', // Golden-brown/mustard
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#6366F1', // Indigo
      '#EF4444', // Red
      '#8B5A2B', // Brown
    ];
    return colors[index % colors.length];
  };

  const onRefresh = async () => {
    if (!userId) {
      console.error('Cannot refresh: userId is null or undefined');
      return;
    }
    
    setRefreshing(true);
    try {
      const sessionsResult = await SessionService.getUnfinishedSessions(userId);
      if (sessionsResult.data) {
        setUnfinishedSessions(sessionsResult.data);
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };


  return (
    <ScrollView 
      style={dashboardStyles.container} 
      contentContainerStyle={dashboardStyles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C757D']} />
      }
    >
      {/* Welcome Message */}
      <View style={dashboardStyles.welcomeSection}>
        {profileLoading ? (
          <>
            <SkeletonBox width="60%" height={36} />
            <SkeletonBox width="80%" height={22} style={{ marginTop: 8 }} />
          </>
        ) : (
          <>
            <Text style={dashboardStyles.welcomeTitle}>
              Hello, <Text style={dashboardStyles.userName}>{userName}</Text>!
            </Text>
            <Text style={dashboardStyles.welcomeSubtitle}>
              Welcome to your restocking dashboard{storeName ? ` for ${storeName}` : ''}
            </Text>
          </>
        )}
      </View>

      {/* Quick Actions - Now First */}
      <View style={dashboardStyles.section}>
        <Text style={dashboardStyles.sectionTitle}>Quick Actions</Text>
        <View style={dashboardStyles.actionGrid}>
          <TouchableOpacity 
            style={dashboardStyles.actionCard}
            onPress={() => {
              console.log('[Dashboard] New Restock Session button pressed');
              // Navigate to restock-sessions with a flag to create new session
              router.push('/(tabs)/restock-sessions?action=create');
            }}
          >
            <View style={dashboardStyles.actionIconContainer}>
              <Image 
                source={require('../../assets/images/new_restock_session.png')}
                style={dashboardStyles.actionIcon}
                resizeMode="contain"
                onError={(error) => console.log('Image loading error:', error)}
              />
            </View>
            <Text style={dashboardStyles.actionText}>New Restock Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={dashboardStyles.actionCard}
            onPress={() => router.push('/(tabs)/emails')}
          >
            <View style={dashboardStyles.actionIconContainer}>
              <Image 
                source={require('../../assets/images/email_sent.png')}
                style={dashboardStyles.actionIcon}
                resizeMode="contain"
                onError={(error) => console.log('Image loading error:', error)}
              />
            </View>
            <Text style={dashboardStyles.actionText}>View Emails</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Unfinished Sessions */}
      {sessionsLoading ? (
        <View style={dashboardStyles.section}>
          <SkeletonBox width="50%" height={18} style={{ marginBottom: 16 }} />
          <View style={dashboardStyles.sessionCard}>
            <View style={dashboardStyles.sessionHeader}>
              <View style={dashboardStyles.sessionInfo}>
                <SkeletonBox width="70%" height={16} />
                <SkeletonBox width="90%" height={14} style={{ marginTop: 4 }} />
              </View>
              <SkeletonBox width={80} height={32} borderRadius={6} />
            </View>
          </View>
        </View>
      ) : unfinishedSessions.length > 0 && (
        <View style={dashboardStyles.section}>
          <View style={dashboardStyles.sectionHeader}>
            <Text style={dashboardStyles.sectionTitle}>Unfinished Sessions</Text>
          </View>
          
          {unfinishedSessions.map((session, index) => {
            const supplierBreakdown = getSupplierBreakdown(session);
            const detailedSupplierBreakdown = getDetailedSupplierBreakdown(session);
            const totalQuantity = session.totalQuantity;
            
            return (
              <View key={session.id} style={dashboardStyles.sessionCard}>
                <View style={dashboardStyles.sessionHeader}>
                  <View style={dashboardStyles.sessionInfo}>
                    <Text style={dashboardStyles.sessionTitle}>
                      Session #{index + 1} • {formatDate(session.createdAt)}
                    </Text>
                    <Text style={dashboardStyles.sessionSubtitle}>
                      {session.totalItems} items • {totalQuantity} total quantity • {session.uniqueSuppliers} suppliers
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={dashboardStyles.continueButton}
                    onPress={() => router.push('/(tabs)/restock-sessions')}
                  >
                    <Text style={dashboardStyles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>

                {/* Visual Breakdown */}
                <View style={dashboardStyles.breakdownContainer}>
                  <View style={dashboardStyles.breakdownHeader}>
                    <Text style={dashboardStyles.breakdownTitle}>SUPPLIER BREAKDOWN</Text>
                    <Text style={dashboardStyles.breakdownTotal}>{session.uniqueSuppliers} suppliers</Text>
                  </View>
                  
                  {/* Visual Chart */}
                  <View style={dashboardStyles.chartContainer}>
                    <View style={dashboardStyles.chart}>
                      {supplierBreakdown.map((supplier, idx) => (
                        <View 
                          key={supplier.name}
                          style={[
                            dashboardStyles.chartSegment,
                            { 
                              backgroundColor: getSupplierColor(idx),
                              flex: supplier.count
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={dashboardStyles.chartLabel}>View by Supplier</Text>
                  </View>

                  {/* Detailed Breakdown List */}
                  <View style={dashboardStyles.breakdownList}>
                    {detailedSupplierBreakdown.map((supplier, idx) => (
                      <View key={supplier.id} style={dashboardStyles.breakdownItem}>
                        <View style={dashboardStyles.breakdownItemHeader}>
                          <View 
                            style={[
                              dashboardStyles.breakdownItemIcon, 
                              { backgroundColor: getSupplierColor(idx) }
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
            );
          })}
        </View>
      )}

      {/* Stats */}
      <View style={dashboardStyles.section}>
        <Text style={dashboardStyles.sectionTitle}>Overview</Text>
        {sessionsLoading ? (
          <View style={dashboardStyles.statsGrid}>
            <View style={dashboardStyles.statCard}>
              <SkeletonBox width={30} height={32} />
              <Text style={dashboardStyles.statLabel}>Active Sessions</Text>
            </View>
            <View style={dashboardStyles.statCard}>
              <SkeletonBox width={30} height={32} />
              <Text style={dashboardStyles.statLabel}>Products</Text>
            </View>
            <View style={dashboardStyles.statCard}>
              <SkeletonBox width={30} height={32} />
              <Text style={dashboardStyles.statLabel}>Suppliers</Text>
            </View>
          </View>
        ) : (
          <View style={dashboardStyles.statsGrid}>
            <View style={dashboardStyles.statCard}>
              <Text style={dashboardStyles.statNumber}>{unfinishedSessions.length}</Text>
              <Text style={dashboardStyles.statLabel}>Active Sessions</Text>
            </View>
            <View style={dashboardStyles.statCard}>
              <Text style={dashboardStyles.statNumber}>
                {unfinishedSessions.reduce((sum, session) => sum + session.uniqueProducts, 0)}
              </Text>
              <Text style={dashboardStyles.statLabel}>Products</Text>
            </View>
            <View style={dashboardStyles.statCard}>
              <Text style={dashboardStyles.statNumber}>
                {unfinishedSessions.reduce((sum, session) => sum + session.uniqueSuppliers, 0)}
              </Text>
              <Text style={dashboardStyles.statLabel}>Suppliers</Text>
            </View>
          </View>
        )}
      </View>

      {/* Empty State */}
      {!sessionsLoading && unfinishedSessions.length === 0 && (
        <View style={dashboardStyles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color="#6C757D" />
          <Text style={dashboardStyles.emptyStateTitle}>All caught up!</Text>
          <Text style={dashboardStyles.emptyStateText}>
            No unfinished restock sessions. Ready to start a new one?
          </Text>
          <TouchableOpacity 
            style={dashboardStyles.startNewButton}
            onPress={() => router.push('/(tabs)/restock-sessions')}
          >
            <Text style={dashboardStyles.startNewButtonText}>Start New Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

 