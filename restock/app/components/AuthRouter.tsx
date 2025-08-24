import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSIST_KEY = 'lastAuthRoute';
const OAUTH_FLAG = 'oauthProcessing';

export const AuthRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const {
    isReady,
    isLoading,
    isAuthenticated,
    userId,
    userName,
    storeName,
    hasValidProfile,
    isProfileLoading
  } = useUnifiedAuth();

  const [hasInitialized, setHasInitialized] = useState(false);

  // Persist SSO/landing route
  useEffect(() => {
    AsyncStorage.getItem(PERSIST_KEY).then((route) => {
      if (route) AsyncStorage.setItem(PERSIST_KEY, route);
    });
  }, []);

  const determineTargetRoute = (): string | null => {
    if (!isReady || isLoading) return null;

    if (isAuthenticated && userId) {
      if (isProfileLoading) return null;

      if (hasValidProfile && userName && storeName) {
        const allowedTabs = [
          '/(tabs)/dashboard',
          '/(tabs)/emails',
          '/(tabs)/restock-session',
          '/(tabs)/profile'
        ];
        return allowedTabs.includes(pathname) ? pathname : '/(tabs)/dashboard';
      }

      return '/sso-profile-setup';
    }

    // Not authenticated
    if (pathname.startsWith('/welcome') || pathname.includes('/auth')) return pathname;
    return '/welcome';
  };

  useEffect(() => {
    const targetRoute = determineTargetRoute();
    if (!targetRoute) return;

    if (!hasInitialized) {
      setHasInitialized(true);
      if (pathname !== targetRoute) router.replace(targetRoute as any);
    } else if (pathname !== targetRoute) {
      router.replace(targetRoute as any);
    }
  }, [pathname, isReady, isLoading, isAuthenticated, hasValidProfile, userName, storeName, isProfileLoading]);

  const targetRoute = determineTargetRoute();
  if (!targetRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6B7F6B" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
          Loading your account...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};
