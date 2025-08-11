import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { dashboardStyles } from '../../../../styles/components/dashboard';
import SkeletonBox from '../../../components/skeleton/SkeletonBox';
import { getSessionColorTheme } from '../../restock-sessions/utils/colorUtils';

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

interface UnfinishedSessionsProps {
  sessionsLoading: boolean;
  unfinishedSessions: UnfinishedSession[];
}

export const UnfinishedSessions: React.FC<UnfinishedSessionsProps> = ({
  sessionsLoading,
  unfinishedSessions
}) => {
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

    const breakdown = Object.entries(supplierCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / session.totalItems) * 100)
    }));

    return breakdown;
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

  if (sessionsLoading) {
    return (
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
    );
  }

  if (unfinishedSessions.length === 0) {
    return null;
  }

  return (
    <View style={dashboardStyles.section}>
      <View style={dashboardStyles.sectionHeader}>
        <Text style={dashboardStyles.sectionTitle}>Unfinished Sessions</Text>
      </View>
      
      {unfinishedSessions.map((session, index) => {
        const supplierBreakdown = getSupplierBreakdown(session);
        const detailedSupplierBreakdown = getDetailedSupplierBreakdown(session);
        const totalQuantity = session.totalQuantity;
        
        const sessionColor = getSessionColorTheme(session.id, index);
        
        return (
          <View key={session.id} style={[
            dashboardStyles.sessionCard,
            {
              borderLeftWidth: 4,
              borderLeftColor: sessionColor.primary,
              backgroundColor: sessionColor.light
            }
          ]}>
            <View style={dashboardStyles.sessionHeader}>
              <View style={dashboardStyles.sessionInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={[
                    { 
                      width: 8, 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: sessionColor.primary,
                      marginRight: 8
                    }
                  ]} />
                  <Text style={dashboardStyles.sessionTitle}>
                    {session.name
                      ? `${session.name} • `
                      : `Session #${(session.id && typeof session.id === 'string') ? session.id.slice(-4) : (index + 1)} • `}
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
                  { backgroundColor: sessionColor.primary }
                ]}
                onPress={() => router.push('/(tabs)/restock-sessions')}
              >
                <Text style={[dashboardStyles.continueButtonText, { color: '#FFFFFF' }]}>Continue</Text>
              </TouchableOpacity>
            </View>

            <View style={dashboardStyles.breakdownContainer}>
              <View style={dashboardStyles.breakdownHeader}>
                <Text style={dashboardStyles.breakdownTitle}>SUPPLIER BREAKDOWN</Text>
                <Text style={dashboardStyles.breakdownTotal}>{session.uniqueSuppliers} suppliers</Text>
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
                          flex: supplier.count
                        }
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
  );
};