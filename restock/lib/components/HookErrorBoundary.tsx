import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../lib/stores/useThemeStore';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  hookName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class HookErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 HookErrorBoundary caught an error in ${this.props.hookName || 'unknown hook'}:`, error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <HookErrorFallback error={this.state.error} hookName={this.props.hookName} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface HookErrorFallbackProps {
  error: Error | null;
  hookName?: string;
  onReset: () => void;
}

function HookErrorFallback({ error, hookName, onReset }: HookErrorFallbackProps) {
  const { theme } = useThemeStore();

  const styles = StyleSheet.create({
    container: {
      padding: 15,
      backgroundColor: theme.error.light,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.error.primary,
      margin: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    icon: {
      fontSize: 20,
      color: theme.error.primary,
      marginRight: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.error.primary,
    },
    message: {
      fontSize: 14,
      color: theme.neutral.dark,
      marginBottom: 15,
      lineHeight: 20,
    },
    hookName: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: theme.neutral.medium,
      marginBottom: 10,
      padding: 8,
      backgroundColor: theme.neutral.light,
      borderRadius: 4,
    },
    button: {
      backgroundColor: theme.error.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    buttonText: {
      color: theme.neutral.lightest,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" style={styles.icon} />
        <Text style={styles.title}>Hook Error</Text>
      </View>
      
      <Text style={styles.message}>
        There was an error in one of the data hooks. This might be a temporary issue.
      </Text>

      {hookName && (
        <Text style={styles.hookName}>
          Hook: {hookName}
        </Text>
      )}

      {__DEV__ && error && (
        <Text style={styles.hookName}>
          Error: {error.message}
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

// Hook for handling async operation errors
export function useAsyncError() {
  const [, setError] = React.useState();
  return React.useCallback(
    (e: Error) => {
      setError(() => {
        throw e;
      });
    },
    []
  );
}

// Hook for handling promise rejections
export function usePromiseRejectionHandler() {
  const throwError = useAsyncError();

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      throwError(new Error(`Unhandled promise rejection: ${event.reason}`));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [throwError]);

  return throwError;
}

// Hook for safe async operations with error handling
export function useSafeAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const throwError = useAsyncError();

  const execute = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throwError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, throwError]);

  React.useEffect(() => {
    execute();
  }, dependencies);

  const retry = React.useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, retry, execute };
}
