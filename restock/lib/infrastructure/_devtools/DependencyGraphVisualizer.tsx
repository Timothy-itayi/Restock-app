/**
 * DEPENDENCY GRAPH VISUALIZER
 * 
 * React component for visualizing service dependencies and performance metrics
 * Provides interactive debugging and monitoring capabilities for developers
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { DIContainer } from '../_di/Container';
import { ServiceHealthMonitor } from '../_monitoring/ServiceHealthMonitor';

interface ServiceNode {
  id: string;
  name: string;
  type: 'infrastructure' | 'domain' | 'application' | 'ui';
  dependencies: string[];
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  performance: {
    avgResponseTime: number;
    accessCount: number;
    memoryUsage: number;
  };
  position: { x: number; y: number };
}

interface DependencyEdge {
  from: string;
  to: string;
  type: 'direct' | 'indirect';
}

interface DependencyGraphVisualizerProps {
  onServiceSelect?: (serviceName: string) => void;
  showPerformance?: boolean;
  showMemory?: boolean;
  refreshInterval?: number;
}

export const DependencyGraphVisualizer: React.FC<DependencyGraphVisualizerProps> = ({
  onServiceSelect,
  showPerformance = true,
  showMemory = true,
  refreshInterval = 5000
}) => {
  const [services, setServices] = useState<ServiceNode[]>([]);
  const [edges, setEdges] = useState<DependencyEdge[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Service type categorization
  const serviceTypes = useMemo(() => ({
    infrastructure: ['UserContextService', 'IdGeneratorService', 'SupabaseSessionRepository', 'SupabaseProductRepository', 'SupabaseSupplierRepository'],
    domain: ['RestockSession', 'Product', 'Supplier'],
    application: ['RestockApplicationService'],
    ui: ['useRestockSession', 'useProductForm', 'useDashboardData']
  }), []);

  // Generate dependency graph
  useEffect(() => {
    generateDependencyGraph();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const generateDependencyGraph = () => {
    const container = DIContainer.getInstance();
    const registeredServices = container.getRegisteredServices();
    
    // Create service nodes
    const nodes: ServiceNode[] = registeredServices.map((serviceName, index) => {
      const type = getServiceType(serviceName);
      const status = getServiceStatus(serviceName);
      const performance = getServicePerformance(serviceName);
      
      // Calculate position in a grid layout
      const gridSize = Math.ceil(Math.sqrt(registeredServices.length));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      return {
        id: serviceName,
        name: serviceName,
        type,
        dependencies: getServiceDependencies(serviceName),
        status,
        performance,
        position: {
          x: col * 120 + 60,
          y: row * 100 + 50
        }
      };
    });

    // Create dependency edges
    const edges: DependencyEdge[] = [];
    nodes.forEach(node => {
      node.dependencies.forEach(dep => {
        if (registeredServices.includes(dep)) {
          edges.push({
            from: dep,
            to: node.id,
            type: 'direct'
          });
        }
      });
    });

    setServices(nodes);
    setEdges(edges);
  };

  const getServiceType = (serviceName: string): ServiceNode['type'] => {
    if (serviceTypes.infrastructure.includes(serviceName)) return 'infrastructure';
    if (serviceTypes.domain.includes(serviceName)) return 'domain';
    if (serviceTypes.application.includes(serviceName)) return 'application';
    if (serviceTypes.ui.includes(serviceName)) return 'ui';
    return 'infrastructure';
  };

  const getServiceStatus = (serviceName: string): ServiceNode['status'] => {
    if (!healthData?.services) return 'unknown';
    const service = healthData.services.find((s: any) => s.serviceName === serviceName);
    return service?.status || 'unknown';
  };

  const getServicePerformance = (serviceName: string): ServiceNode['performance'] => {
    if (!performanceData) {
      return { avgResponseTime: 0, accessCount: 0, memoryUsage: 0 };
    }
    
    const metrics = performanceData[`service_get_${serviceName}`] || {};
    const memoryStats = DIContainer.getInstance().getMemoryStats();
    
    return {
      avgResponseTime: metrics.avg || 0,
      accessCount: metrics.count || 0,
      memoryUsage: Math.round(memoryStats.estimatedMemoryUsage / memoryStats.serviceCount)
    };
  };

  const getServiceDependencies = (serviceName: string): string[] => {
    // Simplified dependency mapping - in production this could be more sophisticated
    const dependencyMap: { [key: string]: string[] } = {
      'RestockApplicationService': ['SupabaseSessionRepository', 'SupabaseProductRepository', 'SupabaseSupplierRepository'],
      'SupabaseSessionRepository': ['UserContextService'],
      'SupabaseProductRepository': ['UserContextService'],
      'SupabaseSupplierRepository': ['UserContextService'],
      'UserContextService': [],
      'IdGeneratorService': []
    };
    
    return dependencyMap[serviceName] || [];
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const monitor = ServiceHealthMonitor.getInstance();
      const health = await monitor.performHealthCheck({ includePerformance: true, includeMemory: true });
      const performance = monitor.getPerformanceMetrics();
      
      setHealthData(health);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(selectedService === serviceName ? null : serviceName);
    onServiceSelect?.(serviceName);
  };

  const getStatusColor = (status: ServiceNode['status']) => {
    switch (status) {
      case 'healthy': return '#10B981';
      case 'degraded': return '#F59E0B';
      case 'unhealthy': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeColor = (type: ServiceNode['type']) => {
    switch (type) {
      case 'infrastructure': return '#3B82F6';
      case 'domain': return '#8B5CF6';
      case 'application': return '#10B981';
      case 'ui': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Dependency Graph</Text>
        <TouchableOpacity 
          style={[styles.refreshButton, isRefreshing && styles.refreshing]} 
          onPress={refreshData}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* System Health Overview */}
      {healthData && (
        <View style={styles.healthOverview}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Overall Status</Text>
              <Text style={[styles.healthValue, { color: getStatusColor(healthData.overallStatus) }]}>
                {healthData.overallStatus.toUpperCase()}
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Services</Text>
              <Text style={styles.healthValue}>{healthData.performance.serviceCount}</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Avg Response</Text>
              <Text style={styles.healthValue}>{healthData.performance.avgResponseTime}ms</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Memory</Text>
              <Text style={styles.healthValue}>{Math.round(healthData.performance.totalMemoryUsage / 1024)}KB</Text>
            </View>
          </View>
        </View>
      )}

      {/* Service Nodes */}
      <View style={styles.graphContainer}>
        <Text style={styles.sectionTitle}>Services</Text>
        {services.map(service => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceNode,
              { 
                left: service.position.x, 
                top: service.position.y,
                borderColor: getStatusColor(service.status),
                backgroundColor: selectedService === service.id ? '#F3F4F6' : '#FFFFFF'
              }
            ]}
            onPress={() => handleServiceSelect(service.id)}
          >
            <View style={[styles.serviceType, { backgroundColor: getTypeColor(service.type) }]}>
              <Text style={styles.serviceTypeText}>{service.type.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.serviceName} numberOfLines={2}>
              {service.name}
            </Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(service.status) }]} />
            
            {showPerformance && (
              <View style={styles.performanceInfo}>
                <Text style={styles.performanceText}>{service.performance.avgResponseTime}ms</Text>
                <Text style={styles.performanceText}>{service.performance.accessCount}x</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Service Details */}
      {selectedService && (
        <View style={styles.serviceDetails}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          {(() => {
            const service = services.find(s => s.id === selectedService);
            if (!service) return null;
            
            return (
              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>{service.name}</Text>
                <Text style={styles.detailType}>Type: {service.type}</Text>
                <Text style={styles.detailStatus}>Status: {service.status}</Text>
                
                {showPerformance && (
                  <View style={styles.detailMetrics}>
                    <Text style={styles.detailMetric}>Response Time: {service.performance.avgResponseTime}ms</Text>
                    <Text style={styles.detailMetric}>Access Count: {service.performance.accessCount}</Text>
                    {showMemory && (
                      <Text style={styles.detailMetric}>Memory: {service.performance.memoryUsage} bytes</Text>
                    )}
                  </View>
                )}
                
                {service.dependencies.length > 0 && (
                  <View style={styles.dependencies}>
                    <Text style={styles.dependenciesTitle}>Dependencies:</Text>
                    {service.dependencies.map(dep => (
                      <Text key={dep} style={styles.dependencyItem}>• {dep}</Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })()}
        </View>
      )}

      {/* Alerts */}
      {healthData?.alerts && healthData.alerts.length > 0 && (
        <View style={styles.alerts}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          {healthData.alerts.map((alert: string, index: number) => (
            <View key={index} style={styles.alertItem}>
              <Text style={styles.alertText}>⚠️ {alert}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshing: {
    backgroundColor: '#9CA3AF',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  healthOverview: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  healthLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  graphContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 400,
    position: 'relative',
  },
  serviceNode: {
    position: 'absolute',
    width: 100,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceType: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  serviceTypeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  performanceInfo: {
    flexDirection: 'row',
    gap: 4,
  },
  performanceText: {
    fontSize: 8,
    color: '#6B7280',
  },
  serviceDetails: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 6,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  detailMetrics: {
    marginBottom: 8,
  },
  detailMetric: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  dependencies: {
    marginTop: 8,
  },
  dependenciesTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  dependencyItem: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  alerts: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alertItem: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#92400E',
  },
});
