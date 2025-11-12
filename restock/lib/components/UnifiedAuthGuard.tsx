import React from 'react';
import { traceRender } from '../utils/renderTrace';
import { View, ActivityIndicator, Text } from 'react-native';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';

export const UnifiedAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  traceRender('UnifiedAuthGuard', {});
  const { isAuthenticated, userId, hasValidProfile, isLoading, isProfileLoading } = useUnifiedAuth();

  // Show loader until profile is ready
  if (!isAuthenticated || !userId || hasValidProfile === undefined || isLoading || isProfileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 8, color: '#4B5563' }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};
UnifiedAuthGuard.displayName = 'UnifiedAuthGuard';
