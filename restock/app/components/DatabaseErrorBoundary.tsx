import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DatabaseHealthService } from '../../backend/services/database-health-service';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  databaseHealth: any;
  isCheckingHealth: boolean;
}

/**
 * DatabaseErrorBoundary - Catches database-related errors and provides user-friendly solutions
 * 
 * This component automatically detects database setup issues and guides users to solutions
 * without requiring them to understand technical database concepts.
 */
export class DatabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      databaseHealth: null,
      isCheckingHealth: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a database-related error
    const isDatabaseError = this.isDatabaseError(error);
    
    if (isDatabaseError) {
      return {
        hasError: true,
        error,
      };
    }
    
    // Re-throw non-database errors to be handled by other error boundaries
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[DatabaseErrorBoundary] Caught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Check database health to provide better error context
    this.checkDatabaseHealth();
  }

  /**
   * Check if an error is database-related
   */
  private static isDatabaseError(error: Error): boolean {
    const databaseErrorPatterns = [
      'Database security setup incomplete',
      'Database is not ready',
      'Failed to set user context',
      'RPC function failed',
      'Function does not exist',
      'permission denied',
      'Insufficient database permissions',
      'Row Level Security',
      'RLS',
      'current_user_context',
      'set_current_user_id',
    ];

    return databaseErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Check database health to provide better error context
   */
  private async checkDatabaseHealth() {
    this.setState({ isCheckingHealth: true });
    
    try {
      const health = await DatabaseHealthService.checkHealth();
      this.setState({ databaseHealth: health });
    } catch (healthError) {
      console.error('[DatabaseErrorBoundary] Health check failed:', healthError);
    } finally {
      this.setState({ isCheckingHealth: false });
    }
  }

  /**
   * Get user-friendly error message
   */
  private async getUserFriendlyError() {
    try {
      return await DatabaseHealthService.getUserFriendlyError();
    } catch (error) {
      return {
        title: 'Database Error',
        message: 'An unexpected database error occurred. Please try again later.',
        actionRequired: false,
      };
    }
  }

  /**
   * Handle retry action
   */
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      databaseHealth: null,
    });
  };

  /**
   * Handle contact support action
   */
  private handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Please contact our support team with the following information:\n\n' +
      `Error: ${this.state.error?.message}\n` +
      `Time: ${new Date().toLocaleString()}`,
      [
        { text: 'Copy Error', onPress: () => this.copyErrorToClipboard() },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  /**
   * Copy error information to clipboard
   */
  private copyErrorToClipboard = () => {
    const errorInfo = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
      databaseHealth: this.state.databaseHealth,
    };
    
    // In a real app, you'd use Clipboard API
    console.log('Error info for support:', JSON.stringify(errorInfo, null, 2));
    Alert.alert('Copied', 'Error information copied to console for support team');
  };

  /**
   * Show database setup instructions
   */
  private showSetupInstructions = () => {
    Alert.alert(
      'Database Setup Required',
      'Your database needs to be configured. This is a one-time setup that requires developer action.\n\n' +
      'Please contact your development team or support to resolve this issue.',
      [
        { text: 'Contact Support', onPress: this.handleContactSupport },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show database-specific error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>🚨</Text>
            <Text style={styles.errorTitle}>
              {this.state.databaseHealth?.status === 'unhealthy' 
                ? 'Database Setup Issue' 
                : 'Something went wrong'
              }
            </Text>
            
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>

            {this.state.databaseHealth && (
              <View style={styles.healthInfo}>
                <Text style={styles.healthTitle}>Database Status:</Text>
                <Text style={[
                  styles.healthStatus,
                  { color: this.getHealthStatusColor(this.state.databaseHealth.status) }
                ]}>
                  {this.state.databaseHealth.status.toUpperCase()}
                </Text>
                
                {this.state.databaseHealth.issues.length > 0 && (
                  <View style={styles.issuesList}>
                    <Text style={styles.issuesTitle}>Issues found:</Text>
                    {this.state.databaseHealth.issues.map((issue: string, index: number) => (
                      <Text key={index} style={styles.issueItem}>• {issue}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.retryButton]} 
                onPress={this.handleRetry}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>

              {this.state.databaseHealth?.requiresManualAction && (
                <TouchableOpacity 
                  style={[styles.button, styles.supportButton]} 
                  onPress={this.showSetupInstructions}
                >
                  <Text style={styles.buttonText}>Get Help</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.button, styles.supportButton]} 
                onPress={this.handleContactSupport}
              >
                <Text style={styles.buttonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>

            {this.state.isCheckingHealth && (
              <Text style={styles.checkingText}>Checking database health...</Text>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }

  /**
   * Get color for health status
   */
  private getHealthStatusColor(status: string): string {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'degraded': return '#FF9800';
      case 'unhealthy': return '#F44336';
      default: return '#9E9E9E';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  healthInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  issuesList: {
    marginTop: 8,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  issueItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#6B7F6B',
  },
  supportButton: {
    backgroundColor: '#A7B9A7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkingText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default DatabaseErrorBoundary;
