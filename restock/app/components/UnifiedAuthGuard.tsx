import React from 'react';
import { View, Text } from 'react-native';
import { useAuthGuardState } from '../hooks';
import FullScreenLoader from './FullScreenLoader';

interface UnifiedAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  requireProfileSetup?: boolean;
  redirectTo?: string;
}

export default function UnifiedAuthGuard({ 
  children, 
  requireAuth = false, 
  requireNoAuth = false,
  requireProfileSetup = false,
  redirectTo 
}: UnifiedAuthGuardProps) {
  const { 
    shouldShowLoader, 
    isRedirecting, 
    hasError, 
    errorMessage,
    authType 
  } = useAuthGuardState({
    requireAuth,
    requireNoAuth,
    requireProfileSetup,
    redirectTo
  });

  // 🔒 CRITICAL SECURITY CHECK: Block unauthorized users
  if (authType?.isBlocked) {
    console.error('🚨 UnifiedAuthGuard: User is blocked/unauthorized, showing blocked state');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#DC3545', marginBottom: 10 }}>Access Denied</Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>
          Your account is not authorized to access this application.
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'left', marginBottom: 20 }}>
          This could happen if:{'\n'}
          • Your account was not properly set up{'\n'}
          • There was an issue with your profile creation{'\n'}
          
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          Please contact support or try signing in again.
        </Text>
      </View>
    );
  }

  // Error boundary for auth context
  if (hasError) {
    console.error('❌ UnifiedAuthGuard: AuthType is null/undefined, showing error state');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#DC3545', marginBottom: 10 }}>Authentication Error</Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>
          There was an issue with the authentication system. This could happen due to:
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'left', marginBottom: 20 }}>
          • Network connectivity issues{'\n'}
          • Temporary server problems{'\n'}
          • App data corruption
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {errorMessage || 'Please restart the app and try again. If the problem persists, contact support.'}
        </Text>
      </View>
    );
  }

  // Smart loading screen - only show during specific transitions
  if (shouldShowLoader) {
    return <FullScreenLoader message="Loading..." />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
} 