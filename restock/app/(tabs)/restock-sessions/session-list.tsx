import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Auth
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';

// Hooks

import { useSessionContext } from '../../../lib/contexts/restock-sessions/SessionContext';

// Components
import CustomToast from '../../../lib/components/CustomToast';
import NameSessionModal from '../../../lib/components/NameSessionModal';

// Styles
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';
import { getSessionListStyles } from '../../../styles/components/session-list';
import { useThemedStyles } from '../../../styles/useThemedStyles';

const SessionListScreen: React.FC = () => {
  const router = useRouter();
  const { userId } = useUnifiedAuth();
  const sessionContext = useSessionContext();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const sessionListStyles = useThemedStyles(getSessionListStyles);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 🔍 NEW: Memoize handlers to prevent unnecessary re-renders
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      // Use the new session switching method instead of loadExistingSession
      await sessionContext.switchToSession(sessionId);
      setToastMessage('Session switched successfully!');
      
      // Navigate back to restock-sessions
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      setToastMessage('Failed to switch session');
      console.error('[SessionList] Error switching session:', error);
    }
  }, [sessionContext.switchToSession, router]);

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
              const result = await sessionContext.deleteSession(sessionId);
              if (result.success) {
                setToastMessage('Session deleted successfully');
                // Note: SessionContext.deleteSession() already handles clearing current session if needed
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
  }, [sessionContext.deleteSession]);

  const handleCreateNewSession = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const confirmCreateSession = useCallback(async () => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      const name = newSessionName.trim() || `Restock Session ${new Date().toLocaleDateString()}`;
      const result = await sessionContext.startNewSession(name);
      if (result.success) {
        // Ensure the new session appears in the list for future visits
        await sessionContext.loadAvailableSessions();
        setShowCreateModal(false);
        setNewSessionName('');
        // Stay on session list; user can choose the new session without redirect
        setToastMessage('Session created');
      } else {
        setToastMessage(result.error || 'Failed to create session');
      }
    } catch (err) {
      setToastMessage('An error occurred while creating the session');
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, newSessionName, sessionContext.startNewSession, sessionContext.loadAvailableSessions, router]);

  // 🔍 NEW: Memoize formatDate helper to prevent unnecessary re-renders
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // 🔍 NEW: Memoize helper functions to prevent unnecessary re-renders
  const getSupplierCount = useCallback((session: any): number => {
    const products = session.products || session.toValue?.().items || [];
    const supplierNames = products.map((p: any) => p.supplierName).filter(Boolean);
    return new Set(supplierNames).size;
  }, []);

  const getTotalQuantity = useCallback((session: any): number => {
    const products = session.products || session.toValue?.().items || [];
    return products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
  }, []);

  // 🔍 NEW: Optimized useEffect to prevent unnecessary re-renders
  useEffect(() => {
    if (userId && sessionContext.isSupabaseReady) {
      // Load sessions immediately without waiting for loading states
      sessionContext.loadAvailableSessions();
    }
  }, [userId, sessionContext.isSupabaseReady]); // Removed loadAvailableSessions dependency

  return (
    <SafeAreaView style={sessionListStyles.container}>
      {/* Header */}
      <View style={sessionListStyles.sessionHeader}>
        <TouchableOpacity 
         
          onPress={() => router.back()}
        >
          <Text style={{ fontFamily: 'Satoshi-Regular', fontSize: 16, color: '#6C757D' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={sessionListStyles.sessionHeaderTitle}>Choose a Session</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 0 }} showsVerticalScrollIndicator={false}>
        {/* Sessions List */}
        {Array.isArray(sessionContext.availableSessions) && sessionContext.availableSessions.length > 0 && (
          <View style={sessionListStyles.sessionSelectionContainer}>
            <View style={sessionListStyles.sessionSelectionHeader}>
              <Text style={sessionListStyles.sessionSelectionTitle}>Your Sessions</Text>
              <Text style={sessionListStyles.sessionSelectionSubtitle}>
                You have {sessionContext.availableSessions.length} unfinished session{sessionContext.availableSessions.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={sessionListStyles.sessionList}>
              {sessionContext.availableSessions.map((session, index) => {
                const id = session.toValue?.().id || session.id;
                const name = session.toValue?.().name || session.name;
                const createdAt = session.toValue?.().createdAt || session.createdAt;
                const products = session.toValue?.().items || [];

                return (
                  <TouchableOpacity
                    key={id}
                    style={sessionListStyles.sessionCard}
                    onPress={() => handleSelectSession(id)}
                  >
                    <View style={sessionListStyles.sessionCardHeader}>
                      <Text style={sessionListStyles.sessionCardTitle}>
                        {name ? `${name} • ` : `Session #${index + 1} • `}{formatDate(createdAt)}
                      </Text>
                      <TouchableOpacity
                        style={sessionListStyles.sessionDeleteButton}
                        onPress={() => handleDeleteSession(id)}
                      >
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={restockSessionsStyles.sessionCardContent}>
                      <Text style={sessionListStyles.sessionCardSubtitle}>
                        {products.length} products • {getTotalQuantity(session)} total quantity
                      </Text>

                      {products.length > 0 && (
                        <View style={sessionListStyles.sessionCardSuppliers}>
                          <Text style={sessionListStyles.sessionCardSuppliersText}>
                            {getSupplierCount(session)} suppliers
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={sessionListStyles.sessionCardFooter}>
                      <Text style={sessionListStyles.sessionCardAction}>Tap to continue</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty State */}
        {(!Array.isArray(sessionContext.availableSessions) || sessionContext.availableSessions.length === 0) && (
          <View style={sessionListStyles.existingSessionsSection}>
            <Text style={sessionListStyles.sectionTitle}>No Sessions Found</Text>
            <Text style={sessionListStyles.sectionSubtitle}>
              You don't have any unfinished sessions yet.
            </Text>
          </View>
        )}

        {/* Create New Session Section */}
        <View style={sessionListStyles.sessionSelectionContainer}>
          <View style={sessionListStyles.sessionSelectionHeader}>
            <Text style={sessionListStyles.sessionSelectionTitle}>Start Fresh</Text>
            <Text style={sessionListStyles.sessionSelectionSubtitle}>
              Create a new restocking session
            </Text>
          </View>

          <TouchableOpacity
            style={sessionListStyles.newSessionButton}
            onPress={handleCreateNewSession}
          >
            <Text style={sessionListStyles.newSessionButtonText}>Create New Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create New Session Modal (shared component) */}
      {showCreateModal && (
        <NameSessionModal
          visible={showCreateModal}
          title="Name Your Session"
          message="Give this restock session a helpful name. You can change it later."
          inputValue={newSessionName}
          onChangeInput={setNewSessionName}
          onConfirm={confirmCreateSession}
          onCancel={() => { if (!isCreating) setShowCreateModal(false); }}
        />
      )}

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
};

// 🔍 NEW: Wrap with React.memo to prevent unnecessary re-renders from parent components
export default React.memo(SessionListScreen);
