import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useRestockApplicationService } from '../../restock-sessions/hooks/useService';

interface HistoryItem {
  id: string;
  type: 'session' | 'email';
  title: string;
  date: Date;
  status: string;
  details?: string;
  metadata?: any;
}

interface HistorySectionProps {
  userId?: string;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ userId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'emails'>('sessions');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const app = useRestockApplicationService();

  const loadHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const items: HistoryItem[] = [];
      const result = await app.getSessions({ userId, includeCompleted: true });
      if (result.success && result.sessions) {
        const all = result.sessions.all;
        all.forEach((session) => {
          const created = session.createdAt;
          const readableDate = created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const sessionName = session.name || `Session • ${readableDate}`;
          items.push({
            id: session.id,
            type: 'session',
            title: sessionName,
            date: created,
            status: session.status,
            details: `${session.items.length} items, ${session.getUniqueSupplierCount()} suppliers`,
            metadata: session
          });
        });
      }

      // Sort by date (newest first)
      items.sort((a, b) => b.date.getTime() - a.date.getTime());
      setHistoryItems(items);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadHistory();
    }
  }, [isExpanded, userId]);

  // Also refresh when the screen regains focus and the section is expanded
  useFocusEffect(
    React.useCallback(() => {
      if (isExpanded && userId) {
        loadHistory();
      }
    }, [isExpanded, userId])
  );

  const filteredItems = historyItems.filter(item => (activeTab === 'sessions' ? item.type === 'session' : item.type === 'email'));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'sent':
        return '#10B981';
      case 'email_generated':
        return '#8B5CF6';
      case 'draft':
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'email_generated':
        return 'Emails Generated';
      case 'sent':
        return 'Completed';
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getTypeColor = (type: 'session' | 'email') => {
    return type === 'session' ? '#14B8A6' : '#8B5CF6';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {/* Tab Selection */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'sessions' && styles.activeTab
              ]}
              onPress={() => setActiveTab('sessions')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'sessions' && styles.activeTabText
              ]}>
                Sessions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'emails' && styles.activeTab
              ]}
              onPress={() => setActiveTab('emails')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'emails' && styles.activeTabText
              ]}>
                Emails
              </Text>
            </TouchableOpacity>
          </View>

          {/* History List */}
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text style={styles.loadingText}>Loading history...</Text>
            ) : filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons 
                  name={activeTab === 'sessions' ? "folder-outline" : "mail-outline"} 
                  size={32} 
                  color="#9CA3AF" 
                />
                <Text style={styles.emptyStateText}>
                  No {activeTab} found
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.itemHeader}>
                    <View style={[
                      styles.typeIndicator,
                      { backgroundColor: getTypeColor(item.type) }
                    ]} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
                      {item.details && (
                        <Text style={styles.itemDetails}>{item.details}</Text>
                      )}
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) }
                      ]}>
                        {getDisplayStatus(item.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  content: {
    padding: 16,
    maxHeight: 400,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#374151',
  },
  historyList: {
    maxHeight: 250,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  historyItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});