/**
 * RESTOCK SESSIONS SCREEN - CLEAN & SAFE VERSION
 *
 * Handles dynamic route/query params safely and guards hooks
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';

// Hooks
import { useSessionContext } from '../../../lib/contexts/restock-sessions/SessionContext';
import { useServiceHealth } from '../../../lib/hooks/restock-sessions/useService';
import { useSessionList } from '../../../lib/hooks/restock-sessions/useSessionList';

// UI Components
import CustomToast from '../../../lib/components/CustomToast';
import NameSessionModal from '../../../lib/components/NameSessionModal';
import { FinishSection } from '../../../lib/components/restock-sessions/FinishSection';
import { ProductList } from '../../../lib/components/restock-sessions/ProductList';
import { SessionHeader } from '../../../lib/components/restock-sessions/SessionHeader';
import { StartSection } from '../../../lib/components/restock-sessions/StartSection';

// Styles
import { getRestockSessionsStyles } from '../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../styles/useThemedStyles';
// import { ClerkDebugger } from '../../lib/components/ClerkDebugger';

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
        createNewSession: rawParams.createNewSession === 'true',
      };
    }
    return {
      sessionId: undefined,
      action: undefined,
      createNewSession: false
    };
  }, [rawParams]);
  
  // ✅ CORRECT: Memoize sessionId and action
  const sessionId = useMemo(() => safeParams.sessionId, [safeParams.sessionId]);
  const action = useMemo(() => safeParams.action, [safeParams.action]);
  const createNewSession = useMemo(() => safeParams.createNewSession, [safeParams.createNewSession]);
  
  // Local state - always initialized
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showStartChoiceModal, setShowStartChoiceModal] = useState(false);

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

    const defaultName = `Restock ${new Date().toLocaleDateString()}`;
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

  // Track recently deleted session to avoid immediate auto-load races
  const lastDeletedRef = useRef<{ id: string; ts: number } | null>(null);

  // --- NAME SESSION ---
  const handleNameSession = useCallback(async () => {
    const trimmedName = sessionNameInputRef.current.trim();

    if (!trimmedName) {
      setToastMessage('Please enter a session name');
      return;
    }

    try {
      if (sessionContextRef.current.currentSession) {
        // TODO: Implement session name update through session context
        setToastMessage('Session name update coming soon');
        setShowNameModal(false);
        setSessionNameInput('');
      } else {
        // Create the session immediately
        const createResult = await sessionContextRef.current.startNewSession(trimmedName);
        if (!createResult.success) {
          setToastMessage('Failed to create session');
          return;
        }

        setShowNameModal(false);
        setSessionNameInput('');
        // Show choice modal to continue with Add Product or Upload Catalog
        setShowStartChoiceModal(true);
      }
    } catch (error) {
      setToastMessage('An error occurred while processing the session');
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
    // Only run if we have a sessionId and action, and we're not already loading
    // and the current session is different from the one we want to load
    if (sessionId &&
        action === 'continue' &&
        !sessionContext.isLoadingSpecificSession &&
        sessionContext.currentSession?.toValue().id !== sessionId) {
      const loadSessionAndOpenForm = async () => {
        try {
          await sessionContext.loadExistingSession(sessionId);
          setToastMessage('Session loaded successfully! Continue adding products...');
        } catch (error) {
          setToastMessage('Failed to load session');
        }
      };

      // Load immediately for better UX when coming from dashboard
      loadSessionAndOpenForm();
    }
  }, [sessionId, action, sessionContext.loadExistingSession, sessionContext.isLoadingSpecificSession, sessionContext.currentSession]);

  // --- HANDLE CREATE NEW SESSION FROM SESSION LIST ---
  useEffect(() => {
    if (createNewSession && !sessionContext.currentSession && !sessionContext.isSessionLoading) {
      handleStartNewSession();
    }
  }, [createNewSession, sessionContext.currentSession, sessionContext.isSessionLoading, handleStartNewSession]);



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

  // 🔧 FIXED: Get the first active session if no current session is set
  const activeSession = useMemo(() => {
    if (sessionContext.currentSession) {
      return sessionContext.currentSession;
    }
    
    // If no current session but we have active sessions, use the first one
    if (hasActiveSessions && Array.isArray(sessionList.sessions) && sessionList.sessions.length > 0) {
      const firstSession = sessionList.sessions[0];
      // Only return sessions that are not finished (status !== 'sent')
      if (firstSession && firstSession.status !== 'sent') {
        return firstSession;
      }
    }
    
    return null;
  }, [sessionContext.currentSession, hasActiveSessions, sessionList.sessions]);

  // 🔧 FIXED: Update hasActiveSession to use the computed activeSession
  const shouldShowActiveSession = activeSession !== null;

  // Add debug logging to see what's happening
  console.log('🔍 RestockSessions Render Debug:', {
    isAuthenticated,
    userId,
    isLoading,
    hasActiveSessions,
    hasActiveSession,
    shouldShowActiveSession,
    isServiceInitializing,
    serviceHealth: serviceHealth.isHealthy,
    sessionListSessions: sessionList.sessions?.length || 0,
    activeSessionId: activeSession && typeof activeSession.toValue === 'function' ? activeSession.toValue().id : null,
    activeSessionStatus: activeSession && typeof activeSession.toValue === 'function' ? activeSession.toValue().status : null,
    currentSessionId: sessionContext.currentSession && typeof sessionContext.currentSession.toValue === 'function' ? sessionContext.currentSession.toValue().id : null
  });

  // 🔧 NEW: Auto-activate first active session when products are added
  useEffect(() => {
    // If we have active sessions but no current session, automatically activate the first one
    if (hasActiveSessions && !sessionContext.currentSession && !isLoading) {
      const firstActiveSession = sessionList.sessions.find(session => session.status !== 'sent');
      
      // Skip auto-load if it matches the one we just deleted in the last 1.5s
      if (lastDeletedRef.current && firstActiveSession && lastDeletedRef.current.id === firstActiveSession.id && (Date.now() - lastDeletedRef.current.ts) < 1500) {
        console.log('⏭️ Skipping auto-activate for recently deleted session');
        return;
      }

      if (firstActiveSession && firstActiveSession.status !== 'sent') {
        console.log('🔄 Auto-activating first active session:', firstActiveSession.id);
        sessionContext.loadExistingSession(firstActiveSession.id);
      }
    }
  }, [hasActiveSessions, sessionContext.currentSession, isLoading, sessionList.sessions, sessionContext.loadExistingSession]);

 
// Listen for product additions and refresh active session
useEffect(() => {
  const handleProductAdded = async ({ sessionId }: { sessionId: string }) => {
    if (sessionContext.currentSession?.toValue()?.id === sessionId) {
      // Reload the active session so ProductList shows new product
      await sessionContext.loadExistingSession(sessionId);
    } else {
      // Optional: refresh session list to include new sessions
      sessionList.loadSessions();
    }

    // 🔧 CRITICAL: Always refresh available sessions for switch button visibility
    // This ensures the switch button appears when a new session is created
    await sessionContext.loadAvailableSessions();
  };

  const handleSessionDeleted = ({ sessionId }: { sessionId: string }) => {
    // If the deleted session was the current session, clear it immediately
    if (sessionContext.currentSession?.toValue()?.id === sessionId) {
      console.log('🔄 Main screen: Current session deleted, clearing state');
      sessionContext.clearCurrentSession();
    }
    // Record deletion to avoid eager auto-loads for a short window
    lastDeletedRef.current = { id: sessionId, ts: Date.now() };
    // Always refresh available sessions to update switch button
    sessionContext.loadAvailableSessions();
    // Also refresh the session list to reflect the deletion
    sessionList.loadSessions();
  };

  const productSubscription = DeviceEventEmitter.addListener('restock:productAdded', handleProductAdded);
  const deleteSubscription = DeviceEventEmitter.addListener('restock:sessionDeleted', handleSessionDeleted);

  return () => {
    productSubscription.remove();
    deleteSubscription.remove();
  };
}, [sessionContext, sessionList]);

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
      {(() => {
        // Use the same session count logic as the main screen
        const sessionCount = Array.isArray(sessionList.sessions) ? sessionList.sessions.length : 0;
        return (
          <SessionHeader
            key={`session-header-${sessionCount}`}
            currentSession={sessionContext.currentSession}
           
            onShowSessionSelection={handleOpenSessionList}
            allSessionsCount={sessionCount}
          />
        );
      })()}

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
        {shouldShowActiveSession && activeSession && (
          <>
            <View style={restockSessionsStyles.addProductSection}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity style={[restockSessionsStyles.addProductButton, { flex: 1 }]} onPress={async () => {
                const { router } = await import('expo-router');
                const sessionData = activeSession.toValue();
                console.log('🚀 Add Product button: Navigating to add-product with session:', sessionData.id);

                try {
                  await router.push({
                    pathname: '/(tabs)/restock-sessions/add-product' as any,
                    params: {
                      sessionId: sessionData.id,
                      sessionName: sessionData.name,
                      isExistingSession: 'true'
                    }
                  });
                } catch (error) {
                  console.error('❌ Add Product navigation error:', error);
                  // Fallback to relative navigation with params
                  router.push({
                    pathname: 'add-product' as any,
                    params: {
                      sessionId: sessionData.id,
                      sessionName: sessionData.name,
                      isExistingSession: 'true'
                    }
                  });
                }
              }}>
                <Text style={restockSessionsStyles.addProductButtonText}>+ Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[restockSessionsStyles.addProductButton, { flex: 1}]} onPress={async () => {
                const { router } = await import('expo-router');
                const sessionData = activeSession.toValue();
                console.log('📄 Add Document button: Navigating to upload-catalog with session:', sessionData.id);

                try {
                  await router.push({
                    pathname: '/(tabs)/restock-sessions/upload-catalog' as any,
                    params: {
                      sessionId: sessionData.id,
                      sessionName: sessionData.name,
                      isExistingSession: 'true'
                    }
                  });
                } catch (error) {
                  console.error('❌ Upload Catalog navigation error:', error);
                  router.push({
                    pathname: 'upload-catalog' as any,
                    params: {
                      sessionId: sessionData.id,
                      sessionName: sessionData.name,
                      isExistingSession: 'true'
                    }
                  });
                }
              }}>
                <Text style={restockSessionsStyles.addProductButtonText}>+ Upload Document</Text>
              </TouchableOpacity>
              </View>
            </View>

            <ProductList
              session={activeSession}
              onEditProduct={async (product) => {
                if (!activeSession) return setToastMessage('No active session');
                
                if (!product) {
                  setToastMessage('Product not found');
                  return;
                }
                
                // Navigate to edit-product screen
                const { router } = await import('expo-router');
                const sessionData = activeSession.toValue();
                try {
                  await router.push({
                    pathname: '/(tabs)/restock-sessions/edit-product' as any,
                    params: {
                      sessionId: sessionData.id,
                      editProductId: product.productId || product.id,
                      editProductName: product.productName,
                      editQuantity: product.quantity?.toString(),
                      editSupplierName: product.supplierName,
                      editSupplierEmail: product.supplierEmail,
                      editNotes: product.notes
                    }
                  });
                } catch (error) {
                  console.error('Navigation error:', error);
                  // Fallback to relative navigation
                  router.push({
                    pathname: 'edit-product' as any,
                    params: {
                      sessionId: sessionData.id,
                      editProductId: product.productId || product.id,
                      editProductName: product.productName,
                      editQuantity: product.quantity?.toString(),
                      editSupplierName: product.supplierName,
                      editSupplierEmail: product.supplierEmail,
                      editNotes: product.notes
                    }
                  });
                }
              }}
              onDeleteProduct={async (productId) => {
                if (!activeSession) return setToastMessage('No active session');
                
                try {
                  const result = await sessionContext.deleteProduct(productId);
                  if (result.success) {
                    setToastMessage('Product deleted successfully');
                  } else {
                    setToastMessage(`Failed to delete product: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Error deleting product:', error);
                  setToastMessage('An error occurred while deleting the product');
                }
              }}
            />

            <FinishSection
              session={activeSession}
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

      {/* Post-Create Choice Modal */}
      <Modal
        visible={showStartChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStartChoiceModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', maxWidth: 420, borderRadius: 16, backgroundColor: '#fff', padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
              How would you like to start?
            </Text>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 16, textAlign: 'center' }}>
              Your session is created. Choose to add a product manually or upload a catalog.
            </Text>
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#111' }}
                onPress={async () => {
                  setShowStartChoiceModal(false);
                  const { router } = await import('expo-router');
                  try {
                    await router.push('/(tabs)/restock-sessions/add-product' as any);
                  } catch (error) {
                    router.push('add-product' as any);
                  }
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#6B7F6B' }}
                onPress={async () => {
                  setShowStartChoiceModal(false);
                  const { router } = await import('expo-router');
                  try {
                    await router.push('/(tabs)/restock-sessions/upload-catalog' as any);
                  } catch (error) {
                    router.push('upload' as any);
                  }
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Upload Catalog</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingVertical: 10, borderRadius: 10, backgroundColor: '#f0f0f0' }}
                onPress={() => setShowStartChoiceModal(false)}
              >
                <Text style={{ color: '#333', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const RestockSessionsScreen: React.FC = () => (
  <React.Suspense fallback={<Text>Loading...</Text>}>
    <RestockSessionsContent />
  </React.Suspense>
);

export default RestockSessionsScreen;
