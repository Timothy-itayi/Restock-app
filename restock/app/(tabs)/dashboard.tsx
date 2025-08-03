import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Image } from "react-native";
import { dashboardStyles } from "../../styles/components/dashboard";
import { useAuth } from "@clerk/clerk-expo";
import { UserProfileService } from "../../backend/services/user-profile";
import { SessionService } from "../../backend/services/sessions";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { DashboardSkeleton } from "../components/skeleton";

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
  const [userName, setUserName] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [unfinishedSessions, setUnfinishedSessions] = useState<UnfinishedSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const { userId, isSignedIn } = useAuth();

  // Show skeleton until both profile and sessions are loaded, plus minimum loading time
  const isDataReady = !loading && !sessionsLoading && !minLoadingTime;

  // Minimum loading time to prevent flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 300); // 300ms minimum loading time
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const result = await UserProfileService.getUserProfile(userId);
          if (result.data) {
            setUserName(result.data.name || "there");
            setStoreName(result.data.store_name || "");
          } else {
            setUserName("there");
            setStoreName("");
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName("there");
          setStoreName("");
        } finally {
          setLoading(false);
        }
      } else {
        // Don't set loading to false immediately if userId is not available yet
        // This prevents flicker when the component first mounts
        if (isSignedIn === false) {
          setLoading(false);
        }
      }
    };

    const fetchUnfinishedSessions = async () => {
      if (userId) {
        try {
          const result = await SessionService.getUnfinishedSessions(userId);
          if (result.data) {
            setUnfinishedSessions(result.data);
          }
        } catch (error) {
          console.error('Error fetching unfinished sessions:', error);
        } finally {
          setSessionsLoading(false);
        }
      } else {
        // Don't set sessionsLoading to false immediately if userId is not available yet
        if (isSignedIn === false) {
          setSessionsLoading(false);
        }
      }
    };

    fetchUserProfile();
    fetchUnfinishedSessions();
  }, [userId, isSignedIn]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Dashboard: Fallback timeout - setting loading to false');
        setLoading(false);
      }
      if (sessionsLoading) {
        console.log('Dashboard: Fallback timeout - setting sessionsLoading to false');
        setSessionsLoading(false);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timer);
  }, [loading, sessionsLoading]);

  // Refresh data when user returns to dashboard
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        const refreshData = async () => {
          try {
            const [profileResult, sessionsResult] = await Promise.all([
              UserProfileService.getUserProfile(userId),
              SessionService.getUnfinishedSessions(userId)
            ]);
            
            if (profileResult.data) {
              setUserName(profileResult.data.name || "there");
              setStoreName(profileResult.data.store_name || "");
            }
            
            if (sessionsResult.data) {
              setUnfinishedSessions(sessionsResult.data);
            }
          } catch (error) {
            console.error('Error refreshing dashboard data:', error);
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

  const getSessionSuppliersList = (session: UnfinishedSession): string[] => {
    const suppliers = new Set<string>();
    
    session.items.forEach(item => {
      const suppliersData = Array.isArray(item.suppliers) ? item.suppliers[0] : item.suppliers;
      const supplierName = suppliersData?.name || 'Unknown Supplier';
      suppliers.add(supplierName);
    });

    return Array.from(suppliers).sort();
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
      await Promise.all([
        UserProfileService.getUserProfile(userId),
        SessionService.getUnfinishedSessions(userId)
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
      };

  if (!isDataReady) {
    return <DashboardSkeleton />;
  }

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
        <Text style={dashboardStyles.welcomeTitle}>
          Hello, <Text style={dashboardStyles.userName}>{userName}</Text>!
        </Text>
        <Text style={dashboardStyles.welcomeSubtitle}>
          Welcome to your restocking dashboard{storeName ? ` for ${storeName}` : ''}
        </Text>
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
      {unfinishedSessions.length > 0 && (
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

 