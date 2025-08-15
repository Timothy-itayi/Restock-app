import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSessionStateManager } from '../hooks/useSessionStateManager';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { CustomToast } from '../../../components/CustomToast';
import { Logger } from '../utils/logger';

enum WorkflowStep {
  NO_SESSION = 'no_session',
  ADDING_PRODUCTS = 'adding_products',
  REVIEWING = 'reviewing',
  GENERATING_EMAILS = 'generating_emails',
  COMPLETED = 'completed',
}

interface SessionWorkflowProps {
  onNavigateToEmails?: () => void;
}

export function SessionWorkflow({ onNavigateToEmails }: SessionWorkflowProps) {
  const sessionManager = useSessionStateManager();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.NO_SESSION);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Determine current step based on session state
  React.useEffect(() => {
    if (!sessionManager.state.currentSession) {
      setCurrentStep(WorkflowStep.NO_SESSION);
    } else if (sessionManager.state.currentSession.status === 'sent') {
      setCurrentStep(WorkflowStep.COMPLETED);
    } else if (sessionManager.state.currentSession.status === 'email_generated') {
      setCurrentStep(WorkflowStep.GENERATING_EMAILS);
    } else if (sessionManager.state.currentSession.items.length === 0) {
      setCurrentStep(WorkflowStep.ADDING_PRODUCTS);
    } else {
      setCurrentStep(WorkflowStep.REVIEWING);
    }
  }, [sessionManager.state.currentSession]);

  // Show toast message
  const showToastMessage = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // Start new session
  const handleStartSession = useCallback(async () => {
    const result = await sessionManager.startNewSession();
    
    if (result.success) {
      showToastMessage('New session started!');
      setCurrentStep(WorkflowStep.ADDING_PRODUCTS);
    } else {
      showToastMessage(result.error || 'Failed to start session', 'error');
    }
  }, [sessionManager, showToastMessage]);

  // Mark session ready for emails
  const handleReadyForEmails = useCallback(async () => {
    if (!sessionManager.state.currentSession) return;

    const result = await sessionManager.markSessionReadyForEmails();
    
    if (result.success) {
      showToastMessage('Session ready for email generation!');
      setCurrentStep(WorkflowStep.GENERATING_EMAILS);
    } else {
      showToastMessage(result.error || 'Failed to mark session ready', 'error');
    }
  }, [sessionManager, showToastMessage]);

  // Mark session completed
  const handleCompleteSession = useCallback(async () => {
    if (!sessionManager.state.currentSession) return;

    Alert.alert(
      'Complete Session',
      'Are you sure you want to mark this session as completed? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'destructive',
          onPress: async () => {
            const result = await sessionManager.markSessionCompleted();
            
            if (result.success) {
              showToastMessage('Session completed successfully!');
              setCurrentStep(WorkflowStep.COMPLETED);
            } else {
              showToastMessage(result.error || 'Failed to complete session', 'error');
            }
          },
        },
      ]
    );
  }, [sessionManager, showToastMessage]);

  // Navigate to emails
  const handleGoToEmails = useCallback(() => {
    if (onNavigateToEmails) {
      onNavigateToEmails();
    }
  }, [onNavigateToEmails]);

  // Render step-specific content
  const renderStepContent = () => {
    const { currentSession } = sessionManager.state;

    switch (currentStep) {
      case WorkflowStep.NO_SESSION:
        return (
          <Card style={styles.stepCard}>
            <Text style={styles.stepTitle}>No Active Session</Text>
            <Text style={styles.stepDescription}>
              Start a new restocking session to begin adding products and suppliers.
            </Text>
            <Button 
              title="Start New Session" 
              onPress={handleStartSession}
              style={styles.primaryButton}
            />
          </Card>
        );

      case WorkflowStep.ADDING_PRODUCTS:
        return (
          <Card style={styles.stepCard}>
            <Text style={styles.stepTitle}>Adding Products</Text>
            <Text style={styles.stepDescription}>
              Add products to your session. You can add multiple products before proceeding.
            </Text>
            <View style={styles.stepStats}>
              <Text style={styles.statText}>
                Products: {currentSession?.items.length || 0}
              </Text>
              <Text style={styles.statText}>
                Total Items: {currentSession?.getTotalItems() || 0}
              </Text>
            </View>
            {currentSession && currentSession.items.length > 0 && (
              <Button 
                title="Review & Continue" 
                onPress={() => setCurrentStep(WorkflowStep.REVIEWING)}
                style={styles.secondaryButton}
              />
            )}
          </Card>
        );

      case WorkflowStep.REVIEWING:
        return (
          <Card style={styles.stepCard}>
            <Text style={styles.stepTitle}>Review Session</Text>
            <Text style={styles.stepDescription}>
              Review your products and quantities before generating emails.
            </Text>
            <View style={styles.stepStats}>
              <Text style={styles.statText}>
                Products: {currentSession?.items.length || 0}
              </Text>
              <Text style={styles.statText}>
                Suppliers: {currentSession?.getUniqueSupplierCount() || 0}
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <Button 
                title="Add More Products" 
                onPress={() => setCurrentStep(WorkflowStep.ADDING_PRODUCTS)}
                style={styles.secondaryButton}
              />
              <Button 
                title="Ready for Emails" 
                onPress={handleReadyForEmails}
                style={styles.primaryButton}
              />
            </View>
          </Card>
        );

      case WorkflowStep.GENERATING_EMAILS:
        return (
          <Card style={styles.stepCard}>
            <Text style={styles.stepTitle}>Generate Emails</Text>
            <Text style={styles.stepDescription}>
              Your session is ready for email generation. You can now create professional emails for your suppliers.
            </Text>
            <View style={styles.stepStats}>
              <Text style={styles.statText}>
                Products: {currentSession?.items.length || 0}
              </Text>
              <Text style={styles.statText}>
                Suppliers: {currentSession?.getUniqueSupplierCount() || 0}
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <Button 
                title="Generate Emails" 
                onPress={handleGoToEmails}
                style={styles.primaryButton}
              />
              <Button 
                title="Edit Session" 
                onPress={() => setCurrentStep(WorkflowStep.REVIEWING)}
                style={styles.secondaryButton}
              />
            </View>
          </Card>
        );

      case WorkflowStep.COMPLETED:
        return (
          <Card style={styles.stepCard}>
            <Text style={styles.stepTitle}>Session Completed</Text>
            <Text style={styles.stepDescription}>
              This session has been completed. You can start a new session or view your history.
            </Text>
            <View style={styles.buttonRow}>
              <Button 
                title="Start New Session" 
                onPress={handleStartSession}
                style={styles.primaryButton}
              />
              <Button 
                title="View History" 
                onPress={() => {/* Navigate to history */}}
                style={styles.secondaryButton}
              />
            </View>
          </Card>
        );

      default:
        return null;
    }
  };

  // Render workflow status
  const renderWorkflowStatus = () => {
    const steps = [
      { key: WorkflowStep.ADDING_PRODUCTS, label: 'Add Products', completed: currentStep !== WorkflowStep.NO_SESSION },
      { key: WorkflowStep.REVIEWING, label: 'Review', completed: currentStep === WorkflowStep.REVIEWING || currentStep === WorkflowStep.GENERATING_EMAILS || currentStep === WorkflowStep.COMPLETED },
      { key: WorkflowStep.GENERATING_EMAILS, label: 'Generate Emails', completed: currentStep === WorkflowStep.GENERATING_EMAILS || currentStep === WorkflowStep.COMPLETED },
      { key: WorkflowStep.COMPLETED, label: 'Complete', completed: currentStep === WorkflowStep.COMPLETED },
    ];

    return (
      <View style={styles.workflowStatus}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepIndicator}>
            <View style={[
              styles.stepCircle,
              step.completed ? styles.stepCompleted : styles.stepPending
            ]}>
              {step.completed && <Text style={styles.stepCheck}>✓</Text>}
            </View>
            <Text style={[
              styles.stepLabel,
              step.completed ? styles.stepLabelCompleted : styles.stepLabelPending
            ]}>
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                step.completed ? styles.connectorCompleted : styles.connectorPending
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderWorkflowStatus()}
      {renderStepContent()}
      
      {sessionManager.state.error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{sessionManager.state.error}</Text>
        </Card>
      )}

      <CustomToast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  workflowStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepPending: {
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  stepCompleted: {
    backgroundColor: '#6B7F6B',
  },
  stepCheck: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelPending: {
    color: '#6B7280',
  },
  stepLabelCompleted: {
    color: '#6B7F6B',
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    width: '100%',
    height: 2,
    zIndex: -1,
  },
  connectorPending: {
    backgroundColor: '#E5E7EB',
  },
  connectorCompleted: {
    backgroundColor: '#6B7F6B',
  },
  stepCard: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  stepStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6B7F6B',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B7F6B',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});
