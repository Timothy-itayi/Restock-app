import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeTheme } from '../../lib/stores/useThemeStore';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ error, errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const { theme } = useSafeTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.neutral.lightest,
      padding: 20,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      fontSize: 64,
      color: theme.status.error,
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.status.error,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.neutral.dark,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 22,
    },
    errorContainer: {
      backgroundColor: theme.neutral.light,
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      width: '100%',
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.neutral.dark,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: theme.neutral.medium,
      fontFamily: 'monospace',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 15,
    },
    button: {
      backgroundColor: theme.brand.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 120,
    },
    buttonText: {
      color: theme.neutral.lightest,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    secondaryButton: {
      backgroundColor: theme.neutral.light,
      borderWidth: 1,
      borderColor: theme.neutral.medium,
    },
    secondaryButtonText: {
      color: theme.neutral.dark,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Ionicons name="warning" style={styles.icon} />
      
      <Text style={styles.title}>Something went wrong</Text>
      
      <Text style={styles.subtitle}>
        We're sorry, but something unexpected happened. This helps us improve the app.
      </Text>

      {__DEV__ && error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Details (Development):</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          {errorInfo && (
            <Text style={styles.errorText}>
              {errorInfo.componentStack}
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => {
            // In a real app, this could navigate to a help page or contact support
            console.log('Help requested');
          }}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Get Help</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('🚨 useErrorHandler caught an error:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
