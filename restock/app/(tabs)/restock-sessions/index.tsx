/**
 * RESTOCK SESSIONS SCREEN - CLEAN & SAFE VERSION
 *
 * Handles dynamic route/query params safely and guards hooks
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';

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
// import { ClerkDebugger } from '../../components/ClerkDebugger';

const RestockSessionsContent: React.FC = () => {
  // ✅ CORRECT: ALL hooks must be called first, unconditionally
  // 🔒 CRITICAL: Add defensive wrapper around useUnifiedAuthContext to prevent runtime errors
  let authContext;
  try {
    authContext = useUnifiedAuth();
    
    // 🔒 CRITICAL: Validate context structure immediately
    if (typeof authContext !== 'object' || authContext === null) {
      console.error('❌ RestockSessions: useUnifiedAuthContext returned invalid type:', typeof authContext, authContext);
      throw new Error('Auth context is invalid');
    }
    
    if (typeof authContext.userId !== 'string' && authContext.userId !== null) {
      console.error('❌ RestockSessions: Context userId is invalid type:', typeof authContext.userId, authContext.userId);
      throw new Error('Auth context userId is invalid');
    }
    
    if (typeof authContext.isAuthenticated !== 'boolean') {
      console.error('❌ RestockSessions: Context isAuthenticated is invalid type:', typeof authContext.isAuthenticated, authContext.isAuthenticated);
      throw new Error('Auth context isAuthenticated is invalid');
    }
  } catch (error) {
    console.error('❌ RestockSessions: Failed to get auth context:', error);
    // 🔒 CRITICAL: Provide safe fallback values
    authContext = {
      userId: null,
      isAuthenticated: false,
      isReady: false,
      isLoading: true
    };
  }
  
  const { userId, isAuthenticated } = authContext;
  const rawParams = useLocalSearchParams();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const sessionList = useSessionList();
  const currentSession = useRestockSession();
  const serviceHealth = useServiceHealth();
  
  // ✅ CORRECT: Handle auth errors in useEffect, not during hook calls
  const [authError, setAuthError] = useState(false);
  
  // ✅ CORRECT: Add logging ONLY for debugging auth data
  useEffect(() => {
    console.log('🔍 RestockSessions: Auth context update:', {
      userId,
      isAuthenticated,
      authContextKeys: Object.keys(authContext || {}),
      authContextType: typeof authContext
    });
  }, [userId, isAuthenticated, authContext]);
  
  // ✅ CORRECT: Memoize safeParams to prevent unnecessary re-renders
  const safeParams = useMemo(() => {
    if (rawParams && typeof rawParams === 'object' && !Array.isArray(rawParams)) {
      return {
        sessionId: typeof rawParams.sessionId === 'string' ? rawParams.sessionId : undefined,
        action: typeof rawParams.action === 'string' ? rawParams.action : undefined,
      };
    }
    return {};
  }, [rawParams]);
  
  // ✅ CORRECT: Memoize sessionId and action
  const sessionId = useMemo(() => safeParams.sessionId, [safeParams.sessionId]);
  const action = useMemo(() => safeParams.action, [safeParams.action]);
  
  // Local state - always initialized
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ✅ CORRECT: Remove the old useEffect for safeParams since we're using useMemo now
  
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

  // ✅ CORRECT: Simplified refs with useMemo for stability
  const serviceHealthRef = useMemo(() => ({
    isHealthy: serviceHealth.isHealthy,
    issues: serviceHealth.issues
  }), [serviceHealth.isHealthy, serviceHealth.issues]);
  
  const sessionsRef = useMemo(() => sessionList.sessions, [sessionList.sessions]);
  const currentSessionStateRef = useMemo(() => currentSession.session, [currentSession.session]);
  
  // ✅ CORRECT: Simplified service readiness check
  const isServiceReady = useMemo(() => {
    const ready = serviceHealthRef.isHealthy &&
           Array.isArray(sessionsRef) &&
           currentSessionStateRef !== undefined;
    
    console.log('🔍 RestockSessions: Service readiness check:', {
      serviceHealthHealthy: serviceHealthRef.isHealthy,
      sessionsRefIsArray: Array.isArray(sessionsRef),
      currentSessionStateRef: currentSessionStateRef,
      isServiceReady: ready
    });
    
    return ready;
  }, [serviceHealthRef.isHealthy, sessionsRef, currentSessionStateRef]);
  
  // ✅ CORRECT: Simplified auth userId reference
  const authUserId = useMemo(() => userId || null, [userId]);
  
  // --- SERVICE INITIALIZING TOAST ---
  useEffect(() => {
    if (authUserId && !isServiceReady) {
      const timer = setTimeout(() => {
        if (!isServiceReady) {
          setToastMessage('Initializing services... Please wait a moment.');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isServiceReady, authUserId]);

  // --- START NEW SESSION ---
  const handleStartNewSession = useCallback(async () => {
    if (!authUserId) {
      setToastMessage('Please log in to create a session');
      return;
    }

    const defaultName = `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setSessionNameInput(defaultName);
    setShowNameModal(true);
  }, [authUserId]); // Empty dependency array using ref

  // Stable references for session operations
  const currentSessionRef = useRef(currentSession);
  const sessionListRef = useRef(sessionList);
  
  useEffect(() => {
    currentSessionRef.current = currentSession;
    sessionListRef.current = sessionList;
  }, [currentSession, sessionList]);

  // --- SESSION SELECTION ---
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      await currentSessionRef.current.loadSession(sessionId);
      sessionListRef.current.hideSelectionModal();
      setToastMessage('Session loaded successfully!');
    } catch (error) {
      setToastMessage('Failed to load session');
      console.error('[RestockSessions] Error loading session:', error);
    }
  }, []); // Empty dependency array using refs

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      const result = await sessionListRef.current.deleteSession(sessionId);
      if (result.success) {
        setToastMessage('Session deleted successfully');
        if (currentSessionRef.current.session?.toValue().id === sessionId) currentSessionRef.current.clearSession();
      } else {
        setToastMessage(result.error || 'Failed to delete session');
      }
    } catch (error) {
      setToastMessage('An error occurred while deleting the session');
      console.error('[RestockSessions] Error deleting session:', error);
    }
  }, []); // Empty dependency array using refs

  // Stable reference for session name input
  const sessionNameInputRef = useRef(sessionNameInput);
  useEffect(() => {
    sessionNameInputRef.current = sessionNameInput;
  }, [sessionNameInput]);

  // --- NAME SESSION ---
  const handleNameSession = useCallback(async () => {
    if (!sessionNameInputRef.current.trim()) {
      setToastMessage('Please enter a session name');
      return;
    }

    try {
      if (currentSessionRef.current.session) {
        const result = await currentSessionRef.current.updateSessionName(currentSessionRef.current.session.toValue().id, sessionNameInputRef.current.trim());
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
        
        // Navigate to add-product with the pending name
        console.log('🚀 Navigating to add-product with name:', sessionNameInputRef.current.trim());
        
        try {
          await router.push({
            pathname: '/(tabs)/restock-sessions/add-product' as any,
            params: { pendingName: sessionNameInputRef.current.trim() }
          });
        } catch (error) {
          console.error('❌ Navigation error:', error);
          // Fallback to relative navigation
          router.push('add-product' as any);
        }
      }
    } catch (error) {
      setToastMessage('An error occurred while processing the session');
      console.error('[RestockSessions] Error in handleNameSession:', error);
    }
  }, []); // Empty dependency array using refs

  // Stable reference to loadSessions
  const loadSessionsRef = useRef(sessionList.loadSessions);
  useEffect(() => {
    loadSessionsRef.current = sessionList.loadSessions;
  }, [sessionList.loadSessions]);
  
  // --- AUTO LOAD SESSIONS ---
  useEffect(() => {
    if (authUserId && loadSessionsRef.current) {
      const timer = setTimeout(() => loadSessionsRef.current?.(), 100);
      return () => clearTimeout(timer);
    }
  }, [authUserId, loadSessionsRef.current]); // Empty dependency array using refs

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

  // --- AUTH ERROR HANDLING (after all hooks are called) ---
  if (authError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: '#dc3545' }}>
          Authentication Error
        </Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: '#666', marginTop: 8 }}>
          Please refresh the app or try again
        </Text>
      </View>
    );
  }

  // --- RENDER LOGIC ---
  const hasActiveSessions = Array.isArray(sessionList.sessions) && sessionList.sessions.length > 0;
  const hasActiveSession = currentSession.session !== null;
  const isLoading = sessionList.isLoading || currentSession.isLoading;
  const isServiceInitializing = !serviceHealth.isHealthy || !isServiceReady;

  // Add debug logging to see what's happening
  console.log('🔍 RestockSessions Render Debug:', {
    isAuthenticated,
    userId,
    isLoading,
    hasActiveSessions,
    isServiceInitializing,
    serviceHealth: serviceHealth.isHealthy,
    sessionListSessions: sessionList.sessions?.length || 0
  });

    // Show loading only while auth is initializing
  if (!isAuthenticated) {
    console.log('🚫 RestockSessions: User not authenticated');
    return (
      <View style={restockSessionsStyles.container}>
        <Text style={restockSessionsStyles.loadingText}>
          Loading authentication...
        </Text>
      </View>
    );
  }

  // Show service issues as warnings, but don't block rendering
  if (isServiceInitializing) {
    console.log('⚠️ RestockSessions: Services initializing, but allowing render');
  }

  // Don't block rendering for loading states - let services load in background
  // This makes it behave like the dashboard
  console.log('✅ RestockSessions: Rendering main content');

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

        {/* Loading indicator when sessions are loading */}
        {!hasActiveSession && !hasActiveSessions && isLoading && (
          <View style={restockSessionsStyles.existingSessionsSection}>
            <Text style={restockSessionsStyles.sectionTitle}>Loading Sessions</Text>
            <Text style={restockSessionsStyles.sectionSubtitle}>
              Checking for existing sessions...
            </Text>
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
                console.log('🚀 Add Product button: Navigating to add-product');
                
                try {
                  await router.push('/(tabs)/restock-sessions/add-product' as any);
                } catch (error) {
                  console.error('❌ Add Product navigation error:', error);
                  // Fallback to relative navigation
                  router.push('add-product' as any);
                }
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
                router.push({
                  pathname: '/(tabs)/emails' as any,
                  params: { sessionId: currentSession.session.toValue().id }
                });
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
  <React.Suspense fallback={<Text>Loading...</Text>}>
    <RestockSessionsContent />
  </React.Suspense>
);

export default RestockSessionsScreen;
