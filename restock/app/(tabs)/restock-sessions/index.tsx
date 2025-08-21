/**
 * RESTOCK SESSIONS SCREEN - CLEAN VERSION
 * 
 * Refactored to use clean hooks and dependency injection
 * No more massive context - focused, single-responsibility hooks
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Clean hooks using dependency injection
import { useSessionList } from './hooks/useSessionList';
import { useRestockSession } from './hooks/useRestockSession';
import { useServiceHealth } from './hooks/useService';

// UI Components (keeping existing components)
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

/**
 * Main restock sessions screen content
 * 
 * Uses clean hooks with dependency injection instead of massive context
 */
const RestockSessionsContent: React.FC = () => {
  const params = useLocalSearchParams();
  const { userId } = useAuth();
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);

  // Clean hooks - each focused on single responsibility
  const sessionList = useSessionList();
  const currentSession = useRestockSession();
  const serviceHealth = useServiceHealth();

  // Local UI state
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [pendingSessionName, setPendingSessionName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check service health on mount
  useEffect(() => {
    if (!serviceHealth.isHealthy) {
      console.warn('[RestockSessions] Service health issues detected:', serviceHealth.issues);
      
      // Check if it's a database setup issue
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

  // Check if services are ready
  const isServiceReady = useCallback(() => {
    return serviceHealth.isHealthy && 
           sessionList.sessions !== undefined && 
           currentSession.session !== undefined;
  }, [serviceHealth.isHealthy, sessionList.sessions, currentSession.session]);

  // Show service not ready message
  useEffect(() => {
    if (userId && !isServiceReady()) {
      const timer = setTimeout(() => {
        if (!isServiceReady()) {
          setToastMessage('Initializing services... Please wait a moment.');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userId, isServiceReady]);

  /**
   * Handle starting a new session
   */
  const handleStartNewSession = useCallback(async () => {
    if (!userId) {
      setToastMessage('Please log in to create a session');
      return;
    }

    // Generate a default session name with timestamp
    const defaultName = `Restock Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    // Set the default name and show the naming modal
    setSessionNameInput(defaultName);
    setShowNameModal(true);
  }, [userId]);

  /**
   * Handle selecting an existing session
   */
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

  /**
   * Handle deleting a session
   */
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      const result = await sessionList.deleteSession(sessionId);
      
      if (result.success) {
        setToastMessage('Session deleted successfully');
        
        // If we deleted the current session, clear it
        if (currentSession.session?.toValue().id === sessionId) {
          currentSession.clearSession();
        }
      } else {
        setToastMessage(result.error || 'Failed to delete session');
      }
    } catch (error) {
      setToastMessage('An error occurred while deleting the session');
      console.error('[RestockSessions] Error deleting session:', error);
    }
  }, [sessionList, currentSession]);



  /**
   * Handle naming a session
   */
  const handleNameSession = useCallback(async () => {
    if (!sessionNameInput.trim()) {
      setToastMessage('Please enter a session name');
      return;
    }

    try {
      if (currentSession.session) {
        // Update existing session name
        console.log('[RestockSessions] Updating existing session name');
        const result = await currentSession.updateSessionName(
          currentSession.session.toValue().id,
          sessionNameInput.trim()
        );
        
        if (result.success) {
          setToastMessage('Session name updated successfully!');
          setShowNameModal(false);
          setSessionNameInput('');
        } else {
          setToastMessage(result.error || 'Failed to update session name');
        }
      } else {
        // Starting new session - navigate to add-product screen
        console.log('[RestockSessions] Session named, navigating to add-product');
        setShowNameModal(false);
        setSessionNameInput('');
        
        // Navigate to add-product screen with the session name
        const { router } = await import('expo-router');
        router.push(`/restock-sessions/add-product?pendingName=${encodeURIComponent(sessionNameInput.trim())}`);
      }
    } catch (error) {
      setToastMessage('An error occurred while processing the session');
      console.error('[RestockSessions] Error in handleNameSession:', error);
    }
  }, [currentSession, sessionNameInput]);

  /**
   * Show confirmation dialog for session actions
   */
  const showConfirmation = useCallback((message: string, onConfirm: () => void) => {
    Alert.alert(
      'Confirm Action',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: onConfirm }
      ]
    );
  }, []);

  // Auto-load sessions on mount
  useEffect(() => {
    if (userId) {
      // Add a small delay to ensure services are initialized
      const timer = setTimeout(() => {
        sessionList.loadSessions();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [userId, sessionList.loadSessions]);

  // Handle continue action from dashboard
  useEffect(() => {
    const sessionId = params.sessionId as string;
    const action = params.action as string;
    
 ;
    
    if (sessionId && action === 'continue' && !currentSession.session) {
      console.log('[RestockSessions] Auto-loading session from dashboard:', sessionId);
      
      // Load the session and then open the product form
      const loadSessionAndOpenForm = async () => {
        try {
          console.log('[RestockSessions] Starting session load...');
          await currentSession.loadSession(sessionId);
          console.log('[RestockSessions] Session loaded successfully, current session:', {
            id: currentSession.session?.toValue().id,
            status: currentSession.session?.toValue().status,
            itemCount: currentSession.session?.toValue().items.length
          });
          
          setToastMessage('Session loaded successfully! Continue adding products...');
          
          // Small delay to ensure session is fully loaded before opening form

        } catch (error) {
          console.error('[RestockSessions] Error in loadSessionAndOpenForm:', error);
          setToastMessage('Failed to load session');
        }
      };
      
      // Add delay to ensure services are ready
      setTimeout(loadSessionAndOpenForm, 200);
    }
  }, [params.sessionId, params.action, currentSession.session, currentSession.loadSession]);

  // Clear URL parameters after session is loaded to prevent re-triggering
  useEffect(() => {
    if (currentSession.session && params.sessionId) {
      // Clear the URL parameters to prevent re-triggering the continue action
      // This is a simple way to handle it without complex navigation state management
      console.log('[RestockSessions] Session loaded, clearing URL parameters');
    }
  }, [currentSession.session, params.sessionId]);

  // Determine current UI state
  const hasActiveSessions = sessionList.sessions.length > 0;
  const hasActiveSession = currentSession.session !== null;
  const isLoading = sessionList.isLoading || currentSession.isLoading;
  const isServiceInitializing = !serviceHealth.isHealthy || !isServiceReady();

  // Show loading if still loading and no sessions, or if services are initializing
  if ((isLoading && !hasActiveSessions) || isServiceInitializing) {
    return (
      <View style={restockSessionsStyles.container}>
        <Text style={restockSessionsStyles.loadingText}>
          {isServiceInitializing ? 'Initializing services...' : 'Loading sessions...'}
        </Text>
        {serviceHealth.issues.length > 0 && (
          <Text style={restockSessionsStyles.errorText}>
            Issues: {serviceHealth.issues.join(', ')}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={restockSessionsStyles.container}>
      {/* Header */}
        <SessionHeader
          currentSession={currentSession.session}
          onNameSession={() => {
            // Pre-populate with current session name if updating
            if (currentSession.session) {
              setSessionNameInput(currentSession.session.toValue().name || '');
            } else {
              setSessionNameInput('');
            }
            setShowNameModal(true);
          }}
          onShowSessionSelection={() => sessionList.openSelectionModal()}
          allSessionsCount={sessionList.sessions.length}
        />



      <ScrollView>
        {/* Show existing sessions first if no active session */}
        {!hasActiveSession && hasActiveSessions && (
          <View style={restockSessionsStyles.existingSessionsSection}>
            <Text style={restockSessionsStyles.sectionTitle}>Your Sessions</Text>
            <Text style={restockSessionsStyles.sectionSubtitle}>
              You have {sessionList.sessions.length} active session{sessionList.sessions.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity 
              style={restockSessionsStyles.existingSessionsButton}
              onPress={() => sessionList.openSelectionModal()}
            >
              <Text style={restockSessionsStyles.existingSessionsButtonText}>
                Continue Existing Session
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No Active Session and No Existing Sessions - Show Start Section */}
        {!hasActiveSession && !hasActiveSessions && (
          <StartSection
            hasExistingSessions={hasActiveSessions}
            onStartNewSession={handleStartNewSession}
            onShowSessionSelection={() => sessionList.openSelectionModal()}
            isLoading={isLoading}
          />
        )}



        {/* Active Session - Show Product Management */}
        {hasActiveSession && (
          <>
            {/* Add Product Button */}
            <View style={restockSessionsStyles.addProductSection}>
              <TouchableOpacity 
                style={restockSessionsStyles.addProductButton}
                onPress={async () => {
                  // Navigate to add-product screen
                  const { router } = await import('expo-router');
                  router.push('/restock-sessions/add-product');
                }}
              >
                <Text style={restockSessionsStyles.addProductButtonText}>
                  + Add Product
                </Text>
              </TouchableOpacity>
            </View>

            {/* Product List */}
            <ProductList
              session={currentSession.session}
              onEditProduct={async (productId) => {
                try {
                  // For now, show a simple edit form
                  // In the future, this could open a modal or navigate to edit screen
                  setToastMessage('Product editing coming soon - will open edit form');
                } catch (error) {
                  setToastMessage('Failed to edit product');
                  console.error('[RestockSessions] Error editing product:', error);
                }
              }}
              onDeleteProduct={async (productId) => {
                try {
                  if (!currentSession.session) {
                    setToastMessage('No active session');
                    return;
                  }

                  const result = await currentSession.removeProduct(productId);
                  
                  if (result.success) {
                    setToastMessage('Product deleted successfully!');
                  } else {
                    setToastMessage(result.error || 'Failed to delete product');
                  }
                } catch (error) {
                  setToastMessage('Failed to delete product');
                  console.error('[RestockSessions] Error deleting product:', error);
                }
              }}
            />

            {/* Finish Section */}
            <FinishSection
              session={currentSession.session}
              onFinishSession={async () => {
                try {
                  if (!currentSession.session) {
                    setToastMessage('No active session');
                    return;
                  }

                  // Navigate to emails screen to generate emails
                  const { router } = await import('expo-router');
                  router.push(`/(tabs)/emails?sessionId=${currentSession.session.toValue().id}`);
                  
                  setToastMessage('Redirecting to email generation...');
                } catch (error) {
                  setToastMessage('Failed to navigate to email generation');
                  console.error('[RestockSessions] Error navigating to emails:', error);
                }
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
          onDeleteSession={(sessionId) => handleDeleteSession(sessionId)}
          onClose={sessionList.hideSelectionModal}
          isLoading={sessionList.isLoading}
        />
      )}

      {/* Name Session Modal */}
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
          onCancel={() => {
            setShowNameModal(false);
            setSessionNameInput('');
          }}
        />
      )}

      {/* Toast Message */}
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

/**
 * Main export wrapped with error boundary
 */
const RestockSessionsScreen: React.FC = () => {
  return (
    <React.Suspense fallback={<Text>Loading...</Text>}>
      <RestockSessionsContent />
    </React.Suspense>
  );
};

export default RestockSessionsScreen;
