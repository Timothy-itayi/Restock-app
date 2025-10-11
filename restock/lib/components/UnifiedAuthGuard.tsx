import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';

export const UnifiedAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userId, hasValidProfile, isLoading, isProfileLoading } = useUnifiedAuth();

  // Show loader until profile is ready
  if (!isAuthenticated || !userId || hasValidProfile === undefined || isLoading || isProfileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-2 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};
UnifiedAuthGuard.displayName = 'UnifiedAuthGuard';
