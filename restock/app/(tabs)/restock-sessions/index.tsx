/**
 * RESTOCK SESSIONS SCREEN - CLEAN & SAFE VERSION
 *
 * Handles dynamic route/query params safely and guards hooks
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUnifiedAuth } from '../../auth/UnifiedAuthProvider';

// Hooks
import { useSessionList } from './hooks/useSessionList';
import { useSessionContext } from './context/SessionContext';
import { useServiceHealth } from './hooks/useService';

// UI Components
import { SessionHeader } from './components/SessionHeader';
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
  const router = useRouter();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const sessionList = useSessionList();
  const sessionContext = useSessionContext();
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

  // 🔍 DEBUG: Log session context usage
  useEffect(() => {
    console.log('🔍 RestockSessions: Session context update:', {
      hasCurrentSession: !!sessionContext.currentSession,
      sessionId: sessionContext.sessionId,
      sessionName: sessionContext.sessionName,
      workflowState: {
        isStartingNewSession: sessionContext.isStartingNewSession,
        isAddingProducts: sessionContext.isAddingProducts,
        isFinishingSession: sessionContext.isFinishingSession
      },
      isSessionActive: sessionContext.isSessionActive,
      isSessionLoading: sessionContext.isSessionLoading
    });
  }, [sessionContext.currentSession, sessionContext.sessionId, sessionContext.sessionName, sessionContext.isStartingNewSession, sessionContext.isAddingProducts, sessionContext.isFinishingSession, sessionContext.isSessionActive, sessionContext.isSessionLoading]);
  
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
  const currentSessionStateRef = useMemo(() => sessionContext.currentSession, [sessionContext.currentSession]);
  
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
    console.log('🚀 RestockSessions: handleStartNewSession called');
    
    if (!authUserId) {
      console.log('❌ RestockSessions: Cannot start session - no auth user');
      setToastMessage('Please log in to create a session');
      return;
    }

    const defaultName = `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    console.log('📝 RestockSessions: Setting default session name:', defaultName);
    setSessionNameInput(defaultName);
    setShowNameModal(true);
  }, [authUserId]); // Empty dependency array using ref

  // Stable references for session operations
  const sessionContextRef = useRef(sessionContext);
  
  useEffect(() => {
    sessionContextRef.current = sessionContext;
  }, [sessionContext]);

  // --- SESSION SELECTION ---
  // Handle opening session list
  const handleOpenSessionList = useCallback(() => {
    router.push('/(tabs)/restock-sessions/session-list' as any);
  }, [router]);

  // Stable reference for session name input
  const sessionNameInputRef = useRef(sessionNameInput);
  useEffect(() => {
    sessionNameInputRef.current = sessionNameInput;
  }, [sessionNameInput]);

  // --- NAME SESSION ---
  const handleNameSession = useCallback(async () => {
    console.log('🚀 RestockSessions: handleNameSession called with name:', sessionNameInputRef.current.trim());
    
    if (!sessionNameInputRef.current.trim()) {
      console.log('❌ RestockSessions: No session name provided');
      setToastMessage('Please enter a session name');
      return;
    }

    try {
      if (sessionContextRef.current.currentSession) {
        console.log('🔄 RestockSessions: Updating existing session name');
        // TODO: Implement session name update through session context
        setToastMessage('Session name update coming soon');
        setShowNameModal(false);
        setSessionNameInput('');
      } else {
        console.log('🆕 RestockSessions: Creating new session and navigating to add-product');
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

  // --- AUTO LOAD SESSIONS ---
  useEffect(() => {
    if (authUserId) {
      const timer = setTimeout(() => sessionList.loadSessions(), 100);
      return () => clearTimeout(timer);
    }
  }, [authUserId, sessionList.loadSessions]);

  // --- LOAD SESSION FROM DASHBOARD ---
  useEffect(() => {
    if (sessionId && action === 'continue' && !sessionContext.currentSession) {
      const loadSessionAndOpenForm = async () => {
        try {
          await sessionContext.loadExistingSession(sessionId);
          setToastMessage('Session loaded successfully! Continue adding products...');
        } catch (error) {
          setToastMessage('Failed to load session');
          console.error('[RestockSessions] loadSessionAndOpenForm error:', error);
        }
      };
      setTimeout(loadSessionAndOpenForm, 200);
    }
  }, [sessionId, action, sessionContext.currentSession, sessionContext.loadExistingSession]);

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
  const hasActiveSession = sessionContext.currentSession !== null;
  const isLoading = sessionList.isLoading || sessionContext.isSessionLoading;
  const isServiceInitializing = !serviceHealth.isHealthy || !isServiceReady;
  const isCreatingSession = sessionContext.isStartingNewSession;
  const creatingSessionName = sessionContext.sessionName || '';

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

  // Show loading state when creating session
  if (isCreatingSession) {
    return (
      <View style={restockSessionsStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6B7F6B" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
            Creating session: {creatingSessionName}
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: '#999', textAlign: 'center' }}>
            Please wait...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={restockSessionsStyles.container}>
      {/* Session Header */}
      <SessionHeader
        currentSession={sessionContext.currentSession}
        onNameSession={() => {
          setSessionNameInput(sessionContext.currentSession?.toValue().name || '');
          setShowNameModal(true);
        }}
        onShowSessionSelection={handleOpenSessionList}
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
            <TouchableOpacity style={restockSessionsStyles.existingSessionsButton} onPress={handleOpenSessionList}>
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
                console.log('🚀 Add Product button: Navigating to add-product with session:', sessionContext.currentSession?.toValue().id);
                
                try {
                  await router.push({
                    pathname: '/(tabs)/restock-sessions/add-product' as any,
                    params: { 
                      sessionId: sessionContext.currentSession?.toValue().id,
                      sessionName: sessionContext.currentSession?.toValue().name,
                      isExistingSession: 'true'
                    }
                  });
                } catch (error) {
                  console.error('❌ Add Product navigation error:', error);
                  // Fallback to relative navigation with params
                  router.push({
                    pathname: 'add-product' as any,
                    params: { 
                      sessionId: sessionContext.currentSession?.toValue().id,
                      sessionName: sessionContext.currentSession?.toValue().name,
                      isExistingSession: 'true'
                    }
                  });
                }
              }}>
                <Text style={restockSessionsStyles.addProductButtonText}>+ Add Product</Text>
              </TouchableOpacity>
            </View>

            <ProductList
              session={sessionContext.currentSession}
              onEditProduct={async (productId) => setToastMessage('Product editing coming soon')}
              onDeleteProduct={async (productId) => {
                if (!sessionContext.currentSession) return setToastMessage('No active session');
                // TODO: Implement product deletion through session context
                setToastMessage('Product deletion coming soon');
              }}
            />

            <FinishSection
              session={sessionContext.currentSession}
              onFinishSession={async () => {
                if (!sessionContext.currentSession) return setToastMessage('No active session');
                const { router } = await import('expo-router');
                router.push({
                  pathname: '/(tabs)/emails' as any,
                  params: { sessionId: sessionContext.currentSession.toValue().id }
                });
                setToastMessage('Redirecting to email generation...');
              }}
            />
          </>
        )}
      </ScrollView>

      {/* Name Modal */}
      {showNameModal && (
        <NameSessionModal
          visible={showNameModal}
          title={sessionContext.currentSession ? "Rename Session" : "Name Your Session"}
          message={sessionContext.currentSession
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
