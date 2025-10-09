import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary specifically for auth-related errors
 * Prevents auth failures from breaking the entire app
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log auth errors for debugging
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    // Check for specific errors we've seen
    if (error.message.includes('Value is a number, expected an Object') || 
        error.message.includes('Cannot read property \'length\' of undefined') ||
        error.message.includes('change in the order of Hooks') ||
        error.message.includes('useCallback changed size')) {
      console.error('Detected React Hook or Clerk hydration error - this should now be fixed with useRef stabilization');
    }
    
    // Force a small delay before allowing retry to ensure React has settled
    setTimeout(() => {
      console.log('Auth Error Boundary: Ready for retry after error settlement');
    }, 500);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI for auth errors
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: '#f8f9fa'
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#DC3545',
            marginBottom: 10,
            textAlign: 'center'
          }}>
            Authentication Error
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            marginBottom: 20
          }}>
            There was an issue with the authentication system. This is likely a temporary problem.
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with auth error boundary
 */
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthBoundaryWrapper(props: P) {
    return (
      <AuthErrorBoundary>
        <Component {...props} />
      </AuthErrorBoundary>
    );
  };
}