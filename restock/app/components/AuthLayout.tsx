import React from 'react';
import { View, Text } from 'react-native';
import { useAuthGuardState } from '../hooks';
import FullScreenLoader from './FullScreenLoader';

interface AuthLayoutProps {
  children: React.ReactNode;
  showLoader?: boolean;
  loaderMessage?: string;
  fallback?: React.ReactNode;
}

export default function AuthLayout({ 
  children, 
  showLoader = true,
  loaderMessage: customLoaderMessage = "Setting up your account...",
  fallback
}: AuthLayoutProps) {
  const { shouldShowLoader, hasError, errorMessage, loaderMessage: hookLoaderMessage } = useAuthGuardState();

  // Error boundary for auth context
  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    console.error('❌ AuthLayout: AuthType is null/undefined, showing error state');
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

  // Show loader only if explicitly requested and needed
  if (showLoader && shouldShowLoader) {
    return <FullScreenLoader message={hookLoaderMessage || customLoaderMessage} />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
} 