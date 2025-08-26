import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Auth
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';

// Hooks
import { useSessionList } from './hooks/useSessionList';
import { useSessionContext } from './context/SessionContext';

// Components
import CustomToast from '../../components/CustomToast';

// Styles
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';

export default function SessionListScreen() {
  const router = useRouter();
  const { userId } = useUnifiedAuth();
  const sessionList = useSessionList();
  const sessionContext = useSessionContext();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load sessions when component mounts
  useEffect(() => {
    if (userId) {
      sessionList.loadSessions();
    }
  }, [userId]);

  // Handle session selection
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      await sessionContext.loadExistingSession(sessionId);
      setToastMessage('Session loaded successfully!');
      
      // Navigate back to restock-sessions
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      setToastMessage('Failed to load session');
      console.error('[SessionList] Error loading session:', error);
    }
  }, [sessionContext, router]);

  // Handle session deletion
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await sessionList.deleteSession(sessionId);
              if (result.success) {
                setToastMessage('Session deleted successfully');
                // Clear current session if it was the deleted one
                if (sessionContext.currentSession?.toValue().id === sessionId) {
                  sessionContext.clearCurrentSession();
                }
              } else {
                setToastMessage(result.error || 'Failed to delete session');
              }
            } catch (error) {
              setToastMessage('An error occurred while deleting the session');
              console.error('[SessionList] Error deleting session:', error);
            }
          }
        }
      ]
    );
  }, [sessionList, sessionContext]);

  // Handle creating new session
  const handleCreateNewSession = useCallback(() => {
    router.push({
      pathname: '/(tabs)/restock-sessions/add-product' as any,
      params: { 
        pendingName: `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }
    });
  }, [router]);

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get supplier count helper
  const getSupplierCount = (session: any): number => {
    const products = session.products || session.toValue?.().items || [];
    const supplierNames = products.map((p: any) => p.supplierName).filter(Boolean);
    return new Set(supplierNames).size;
  };

  // Get total quantity helper
  const getTotalQuantity = (session: any): number => {
    const products = session.products || session.toValue?.().items || [];
    return products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
  };

  return (
    <SafeAreaView style={restockSessionsStyles.container}>
      {/* Header */}
      <View style={restockSessionsStyles.sessionHeader}>
        <TouchableOpacity 
          style={{ paddingVertical: 8, paddingHorizontal: 12 }} 
          onPress={() => router.back()}
        >
          <Text style={{ fontFamily: 'Satoshi-Regular', fontSize: 16, color: '#6C757D' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={restockSessionsStyles.sessionHeaderTitle}>Choose a Session</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Loading State */}
        {sessionList.isLoading && (
          <View style={restockSessionsStyles.existingSessionsSection}>
            <Text style={restockSessionsStyles.sectionTitle}>Loading Sessions</Text>
            <Text style={restockSessionsStyles.sectionSubtitle}>Please wait...</Text>
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#6B7F6B" />
            </View>
          </View>
        )}

        {/* Sessions List */}
        {!sessionList.isLoading && Array.isArray(sessionList.sessions) && sessionList.sessions.length > 0 && (
          <View style={restockSessionsStyles.sessionSelectionContainer}>
            <View style={restockSessionsStyles.sessionSelectionHeader}>
              <Text style={restockSessionsStyles.sessionSelectionTitle}>Your Sessions</Text>
              <Text style={restockSessionsStyles.sessionSelectionSubtitle}>
                You have {sessionList.sessions.length} unfinished session{sessionList.sessions.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <ScrollView style={restockSessionsStyles.sessionList}>
              {sessionList.sessions.map((session, index) => {
                const id = session.toValue?.().id || session.id;
                const name = session.toValue?.().name || session.name;
                const createdAt = session.toValue?.().createdAt || session.createdAt;
                const products = session.products || session.toValue?.().items || [];
                
                return (
                  <TouchableOpacity
                    key={id}
                    style={restockSessionsStyles.sessionCard}
                    onPress={() => handleSelectSession(id)}
                  >
                    <View style={restockSessionsStyles.sessionCardHeader}>
                      <Text style={restockSessionsStyles.sessionCardTitle}>
                        {name ? `${name} • ` : `Session #${index + 1} • `}{formatDate(createdAt)}
                      </Text>
                      <TouchableOpacity
                        style={restockSessionsStyles.sessionDeleteButton}
                        onPress={() => handleDeleteSession(id)}
                      >
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={restockSessionsStyles.sessionCardContent}>
                      <Text style={restockSessionsStyles.sessionCardSubtitle}>
                        {products.length} products • {getTotalQuantity(session)} total quantity
                      </Text>
                      
                      {products.length > 0 && (
                        <View style={restockSessionsStyles.sessionCardSuppliers}>
                          <Text style={restockSessionsStyles.sessionCardSuppliersText}>
                            {getSupplierCount(session)} suppliers
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={restockSessionsStyles.sessionCardFooter}>
                      <Text style={restockSessionsStyles.sessionCardAction}>Tap to continue</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Empty State */}
        {!sessionList.isLoading && (!Array.isArray(sessionList.sessions) || sessionList.sessions.length === 0) && (
          <View style={restockSessionsStyles.existingSessionsSection}>
            <Text style={restockSessionsStyles.sectionTitle}>No Sessions Found</Text>
            <Text style={restockSessionsStyles.sectionSubtitle}>
              You don't have any unfinished sessions yet.
            </Text>
          </View>
        )}

        {/* Create New Session Button */}
        <View style={restockSessionsStyles.sessionSelectionFooter}>
          <TouchableOpacity 
            style={restockSessionsStyles.newSessionButton}
            onPress={handleCreateNewSession}
          >
            <Text style={restockSessionsStyles.newSessionButtonText}>Create New Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast */}
      {toastMessage && (
        <CustomToast
          visible={true}
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
          type="info"
        />
      )}
    </SafeAreaView>
  );
}
