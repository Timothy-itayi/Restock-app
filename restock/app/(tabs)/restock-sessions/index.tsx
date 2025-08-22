/**
 * RESTOCK SESSIONS SCREEN - CLEAN & SAFE VERSION
 *
 * Handles dynamic route/query params safely and guards hooks
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStableAuth } from '../../hooks/useStableAuth';
import { AuthErrorBoundary } from '../../components/AuthErrorBoundary';

// Hooks
import { useSessionList } from './hooks/useSessionList';
import { useRestockSession } from './hooks/useRestockSession';
import { useServiceHealth } from './hooks/useService';

// UI Components
import { SessionHeader } from './components/SessionHeader';
import { SessionSelection } from './components/SessionSelection';
import { StartSection } from './components/StartSection';
import { ProductList } from './components/ProductList';
import { FinishSection } from './components/FinishSection';
import NameSessionModal from '../../components/NameSessionModal';
import CustomToast from '../../components/CustomToast';

// Styles
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';

const RestockSessionsContent: React.FC = () => {
  // Always call hooks in the same order - never conditionally
  const auth = useStableAuth();
  const rawParams = useLocalSearchParams();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const sessionList = useSessionList();
  const currentSession = useRestockSession();
  const serviceHealth = useServiceHealth();
  
  // Local state - always initialized
  const [safeParams, setSafeParams] = useState<{ sessionId?: string; action?: string }>({});
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Process params when auth is ready
  useEffect(() => {
    if (!auth.isReady) return;
    
    if (rawParams && typeof rawParams === 'object' && !Array.isArray(rawParams)) {
      setSafeParams({
        sessionId: typeof rawParams.sessionId === 'string' ? rawParams.sessionId : undefined,
        action: typeof rawParams.action === 'string' ? rawParams.action : undefined,
      });
    } else {
      setSafeParams({});
    }
  }, [rawParams, auth.isReady]);

  const sessionId = safeParams.sessionId;
  const action = safeParams.action;

  // --- SERVICE HEALTH ---
  useEffect(() => {
    if (!serviceHealth.isHealthy && Array.isArray(serviceHealth.issues)) {
      const hasDatabaseSetupIssue = serviceHealth.issues.some(issue =>
        issue.includes('Database security setup incomplete') ||
        issue.includes('RPC function') ||
        issue.includes('permission denied')
      );
      if (hasDatabaseSetupIssue) {
        setToastMessage('Database setup incomplete. Please run the database setup script or contact support.');
      } else {
        setToastMessage(`Service issues detected: ${serviceHealth.issues.join(', ')}`);
      }
    }
  }, [serviceHealth.isHealthy, serviceHealth.issues]);

  const isServiceReady = useCallback(() => {
    return serviceHealth.isHealthy &&
           Array.isArray(sessionList.sessions) &&
           currentSession.session !== undefined;
  }, [serviceHealth.isHealthy, sessionList.sessions, currentSession.session]);

  // --- SERVICE INITIALIZING TOAST ---
  useEffect(() => {
    if (auth.userId && !isServiceReady()) {
      const timer = setTimeout(() => {
        if (!isServiceReady()) {
          setToastMessage('Initializing services... Please wait a moment.');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [auth.userId, isServiceReady]);

  // --- START NEW SESSION ---
  const handleStartNewSession = useCallback(async () => {
    if (!auth.userId) {
      setToastMessage('Please log in to create a session');
      return;
    }

    const defaultName = `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setSessionNameInput(defaultName);
    setShowNameModal(true);
  }, [auth.userId]);

  // --- SESSION SELECTION ---
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      await currentSession.loadSession(sessionId);
      sessionList.hideSelectionModal();
      setToastMessage('Session loaded successfully!');
    } catch (error) {
      setToastMessage('Failed to load session');
      console.error('[RestockSessions] Error loading session:', error);
    }
  }, [currentSession, sessionList]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      const result = await sessionList.deleteSession(sessionId);
      if (result.success) {
        setToastMessage('Session deleted successfully');
        if (currentSession.session?.toValue().id === sessionId) currentSession.clearSession();
      } else {
        setToastMessage(result.error || 'Failed to delete session');
      }
    } catch (error) {
      setToastMessage('An error occurred while deleting the session');
      console.error('[RestockSessions] Error deleting session:', error);
    }
  }, [sessionList, currentSession]);

  // --- NAME SESSION ---
  const handleNameSession = useCallback(async () => {
    if (!sessionNameInput.trim()) {
      setToastMessage('Please enter a session name');
      return;
    }

    try {
      if (currentSession.session) {
        const result = await currentSession.updateSessionName(currentSession.session.toValue().id, sessionNameInput.trim());
        if (result.success) {
          setToastMessage('Session name updated successfully!');
          setShowNameModal(false);
          setSessionNameInput('');
        } else {
          setToastMessage(result.error || 'Failed to update session name');
        }
      } else {
        setShowNameModal(false);
        setSessionNameInput('');
        const { router } = await import('expo-router');
        router.push(`/restock-sessions/add-product?pendingName=${encodeURIComponent(sessionNameInput.trim())}`);
      }
    } catch (error) {
      setToastMessage('An error occurred while processing the session');
      console.error('[RestockSessions] Error in handleNameSession:', error);
    }
  }, [currentSession, sessionNameInput]);

  // --- AUTO LOAD SESSIONS ---
  useEffect(() => {
    if (auth.userId) {
      const timer = setTimeout(() => sessionList.loadSessions(), 100);
      return () => clearTimeout(timer);
    }
  }, [auth.userId, sessionList.loadSessions]);

  // --- LOAD SESSION FROM DASHBOARD ---
  useEffect(() => {
    if (sessionId && action === 'continue' && !currentSession.session) {
      const loadSessionAndOpenForm = async () => {
        try {
          await currentSession.loadSession(sessionId);
          setToastMessage('Session loaded successfully! Continue adding products...');
        } catch (error) {
          setToastMessage('Failed to load session');
          console.error('[RestockSessions] loadSessionAndOpenForm error:', error);
        }
      };
      setTimeout(loadSessionAndOpenForm, 200);
    }
  }, [sessionId, action, currentSession]);

  // --- RENDER LOGIC ---
  const hasActiveSessions = Array.isArray(sessionList.sessions) && sessionList.sessions.length > 0;
  const hasActiveSession = currentSession.session !== null;
  const isLoading = sessionList.isLoading || currentSession.isLoading;
  const isServiceInitializing = !serviceHealth.isHealthy || !isServiceReady();

  // Show loading while auth is initializing or has errors
  if (!auth.isReady || auth.error || (isLoading && !hasActiveSessions) || isServiceInitializing) {
    return (
      <View style={restockSessionsStyles.container}>
        <Text style={restockSessionsStyles.loadingText}>
          {auth.error ? 'Authentication error - retrying...' : 
           !auth.isReady ? 'Loading authentication...' :
           isServiceInitializing ? 'Initializing services...' : 'Loading sessions...'}
        </Text>
        {auth.error && (
          <Text style={restockSessionsStyles.errorText}>
            Auth Error: {auth.error}
          </Text>
        )}
        {auth.isReady && Array.isArray(serviceHealth.issues) && serviceHealth.issues.length > 0 && (
          <Text style={restockSessionsStyles.errorText}>
            Issues: {serviceHealth.issues.join(', ')}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={restockSessionsStyles.container}>
      {/* Session Header */}
      <SessionHeader
        currentSession={currentSession.session}
        onNameSession={() => {
          setSessionNameInput(currentSession.session?.toValue().name || '');
          setShowNameModal(true);
        }}
        onShowSessionSelection={() => sessionList.openSelectionModal()}
        allSessionsCount={Array.isArray(sessionList.sessions) ? sessionList.sessions.length : 0}
      />

      <ScrollView>
        {/* Existing Sessions */}
        {!hasActiveSession && hasActiveSessions && (
          <View style={restockSessionsStyles.existingSessionsSection}>
            <Text style={restockSessionsStyles.sectionTitle}>Your Sessions</Text>
            <Text style={restockSessionsStyles.sectionSubtitle}>
              You have {Array.isArray(sessionList.sessions) ? sessionList.sessions.length : 0} active session{Array.isArray(sessionList.sessions) && sessionList.sessions.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity style={restockSessionsStyles.existingSessionsButton} onPress={sessionList.openSelectionModal}>
              <Text style={restockSessionsStyles.existingSessionsButtonText}>Continue Existing Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Start Section */}
        {!hasActiveSession && !hasActiveSessions && (
          <StartSection
            hasExistingSessions={hasActiveSessions}
            onStartNewSession={handleStartNewSession}
            onShowSessionSelection={sessionList.openSelectionModal}
            isLoading={isLoading}
          />
        )}

        {/* Active Session */}
        {hasActiveSession && (
          <>
            <View style={restockSessionsStyles.addProductSection}>
              <TouchableOpacity style={restockSessionsStyles.addProductButton} onPress={async () => {
                const { router } = await import('expo-router');
                router.push('/restock-sessions/add-product');
              }}>
                <Text style={restockSessionsStyles.addProductButtonText}>+ Add Product</Text>
              </TouchableOpacity>
            </View>

            <ProductList
              session={currentSession.session}
              onEditProduct={async (productId) => setToastMessage('Product editing coming soon')}
              onDeleteProduct={async (productId) => {
                if (!currentSession.session) return setToastMessage('No active session');
                const result = await currentSession.removeProduct(productId);
                setToastMessage(result.success ? 'Product deleted successfully!' : result.error || 'Failed to delete product');
              }}
            />

            <FinishSection
              session={currentSession.session}
              onFinishSession={async () => {
                if (!currentSession.session) return setToastMessage('No active session');
                const { router } = await import('expo-router');
                router.push(`/(tabs)/emails?sessionId=${currentSession.session.toValue().id}`);
                setToastMessage('Redirecting to email generation...');
              }}
            />
          </>
        )}
      </ScrollView>

      {/* Session Selection Modal */}
      {sessionList.showSelectionModal && (
        <SessionSelection
          sessions={sessionList.sessions}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onClose={sessionList.hideSelectionModal}
          isLoading={sessionList.isLoading}
        />
      )}

      {/* Name Modal */}
      {showNameModal && (
        <NameSessionModal
          visible={showNameModal}
          title={currentSession.session ? "Rename Session" : "Name Your Session"}
          message={currentSession.session
            ? "Give this session a new name to help you identify it later."
            : "Give this restock session a helpful name. You can change it later."
          }
          inputValue={sessionNameInput}
          onChangeInput={setSessionNameInput}
          onConfirm={handleNameSession}
          onCancel={() => { setShowNameModal(false); setSessionNameInput(''); }}
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
    </View>
  );
};

const RestockSessionsScreen: React.FC = () => (
  <AuthErrorBoundary>
    <React.Suspense fallback={<Text>Loading...</Text>}>
      <RestockSessionsContent />
    </React.Suspense>
  </AuthErrorBoundary>
);

export default RestockSessionsScreen;
