import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { dashboardStyles } from "../../styles/components/dashboard";
import { useAuth } from "@clerk/clerk-expo";
import { UserProfileService } from "../../backend/services/user-profile";
import { SessionService } from "../../backend/services/sessions";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

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

export default function DashboardScreen() {
  const [userName, setUserName] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [unfinishedSessions, setUnfinishedSessions] = useState<UnfinishedSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = useAuth();

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
        setLoading(false);
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
        setSessionsLoading(false);
      }
    };

    fetchUserProfile();
    fetchUnfinishedSessions();
  }, [userId]);

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
    
    session.items.forEach(item => {
      const supplierName = item.suppliers?.[0]?.name || 'Unknown Supplier';
      supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1;
    });

    return Object.entries(supplierCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / session.totalItems) * 100)
    }));
  };

  const getSupplierColor = (index: number) => {
    const colors = ['#8B4513', '#FF8C00', '#20B2AA', '#9370DB', '#228B22'];
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

  if (loading) {
    return (
      <View style={dashboardStyles.container}>
        <ActivityIndicator size="large" color="#6B7F6B" />
      </View>
    );
  }

  const greeting = storeName 
    ? `Hello ${userName}! Welcome to your restocking dashboard for ${storeName}`
    : `Hello ${userName}! Welcome to your restocking dashboard`;

  return (
    <ScrollView 
      style={dashboardStyles.container} 
      contentContainerStyle={dashboardStyles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7F6B']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={dashboardStyles.title}>Dashboard</Text>
        <Text style={dashboardStyles.subtitle}>{greeting}</Text>
      </View>

      {/* Unfinished Sessions */}
      {unfinishedSessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Unfinished Sessions</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(tabs)/restock-sessions')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {unfinishedSessions.map((session, index) => {
            const supplierBreakdown = getSupplierBreakdown(session);
            const totalQuantity = session.totalQuantity;
            
            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>
                      Session #{index + 1} • {formatDate(session.createdAt)}
                    </Text>
                    <Text style={styles.sessionSubtitle}>
                      {session.totalItems} items • {totalQuantity} total quantity
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={() => router.push('/(tabs)/restock-sessions')}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>

                {/* Visual Breakdown */}
                <View style={styles.breakdownContainer}>
                  <View style={styles.breakdownHeader}>
                    <Text style={styles.breakdownTitle}>SUPPLIER BREAKDOWN</Text>
                    <Text style={styles.breakdownTotal}>{session.uniqueSuppliers} suppliers</Text>
                  </View>
                  
                  {/* Visual Chart */}
                  <View style={styles.chartContainer}>
                    <View style={styles.chart}>
                      {supplierBreakdown.map((supplier, idx) => (
                        <View 
                          key={supplier.name}
                          style={[
                            styles.chartSegment,
                            { 
                              backgroundColor: getSupplierColor(idx),
                              flex: supplier.count
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.chartLabel}>View by Supplier</Text>
                  </View>

                  {/* Breakdown List */}
                  <View style={styles.breakdownList}>
                    {supplierBreakdown.map((supplier, idx) => (
                      <View key={supplier.name} style={styles.breakdownItem}>
                        <View style={styles.breakdownItemHeader}>
                          <View 
                            style={[
                              styles.breakdownItemIcon, 
                              { backgroundColor: getSupplierColor(idx) }
                            ]}
                          >
                            <Ionicons name="business" size={12} color="white" />
                          </View>
                          <Text style={styles.breakdownItemName}>{supplier.name}</Text>
                        </View>
                        <View style={styles.breakdownItemStats}>
                          <Text style={styles.breakdownItemPercentage}>
                            {supplier.percentage}% of items
                          </Text>
                          <Text style={styles.breakdownItemCount}>
                            {supplier.count} items
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

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/restock-sessions')}
          >
            <Ionicons name="add-circle" size={32} color="#6B7F6B" />
            <Text style={styles.actionText}>New Restock Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/emails')}
          >
            <Ionicons name="mail" size={32} color="#6B7F6B" />
            <Text style={styles.actionText}>View Emails</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unfinishedSessions.length}</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {unfinishedSessions.reduce((sum, session) => sum + session.uniqueProducts, 0)}
            </Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {unfinishedSessions.reduce((sum, session) => sum + session.uniqueSuppliers, 0)}
            </Text>
            <Text style={styles.statLabel}>Suppliers</Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      {!sessionsLoading && unfinishedSessions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color="#6B7F6B" />
          <Text style={styles.emptyStateTitle}>All caught up!</Text>
          <Text style={styles.emptyStateText}>
            No unfinished restock sessions. Ready to start a new one?
          </Text>
          <TouchableOpacity 
            style={styles.startNewButton}
            onPress={() => router.push('/(tabs)/restock-sessions')}
          >
            <Text style={styles.startNewButtonText}>Start New Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  viewAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: '#6B7F6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownContainer: {
    marginTop: 15,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  breakdownTotal: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  chartContainer: {
    marginBottom: 15,
  },
  chart: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  chartSegment: {
    borderRadius: 5,
  },
  chartLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  breakdownList: {
    marginTop: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  breakdownItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  breakdownItemStats: {
    alignItems: 'flex-end',
  },
  breakdownItemPercentage: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  breakdownItemCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7F6B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  startNewButton: {
    backgroundColor: '#6B7F6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  startNewButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7F6B',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
}); 