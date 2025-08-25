// AuthRouter.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSIST_KEY = 'lastAuthRoute';

// Canonical tab paths
const ALLOWED_TABS = [
  '/(tabs)/dashboard',
  '/(tabs)/emails',
  '/(tabs)/restock-sessions',
  '/(tabs)/profile',
];

// Flat → tab mapping
const flatToTabMap: Record<string, string> = {
  '/dashboard': '/(tabs)/dashboard',
  '/emails': '/(tabs)/emails',
  '/restock-sessions': '/(tabs)/restock-sessions',
  '/profile': '/(tabs)/profile',
};

// Helper to normalize paths
function normalizePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('/(tabs)/')) return path; // already canonical
  return flatToTabMap[path] ?? path; // map flat → tab if known
}

export const AuthRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rawPathname = usePathname();
  const pathname = normalizePath(rawPathname); // ✅ always work with normalized paths

  const {
    isReady,
    isAuthenticated,
    userId,
    userName,
    storeName,
    hasValidProfile,
    isProfileLoading,
  } = useUnifiedAuth();

  const [lastVisitedTab, setLastVisitedTab] = useState<string | null>(null);

  // Load last visited tab once
  useEffect(() => {
    AsyncStorage.getItem(PERSIST_KEY).then(route => {
      if (route) setLastVisitedTab(normalizePath(route));
    });
  }, []);

  // Persist tab changes
  useEffect(() => {
    if (pathname?.startsWith('/(tabs)/')) {
      AsyncStorage.setItem(PERSIST_KEY, pathname);
    }
  }, [pathname]);

  // Hydration = auth + profile ready
  const isHydrated =
    isReady && (!isAuthenticated || (userId && hasValidProfile && !isProfileLoading));

  // Determine target route
  const determineTargetRoute = useCallback((): string | null => {
    if (!isHydrated) return null;

    if (isAuthenticated && userId) {
      if (hasValidProfile && userName && storeName) {
        // ✅ Free roam if already inside tabs
        if (pathname?.startsWith('/(tabs)/')) return null;

        // ✅ Fallback to last tab or dashboard
        return lastVisitedTab && ALLOWED_TABS.includes(lastVisitedTab)
          ? lastVisitedTab
          : '/(tabs)/dashboard';
      }
      return '/sso-profile-setup';
    }

    if (pathname?.startsWith('/welcome') || pathname?.includes('/auth')) return pathname;
    return '/welcome';
  }, [isHydrated, isAuthenticated, userId, hasValidProfile, userName, storeName, lastVisitedTab, pathname]);

  const targetRoute = determineTargetRoute();

  // Redirect when route is wrong
  useEffect(() => {
    if (!targetRoute) return;
    if (pathname === targetRoute) return;

    console.log('[AuthRouter] Redirecting from', pathname, 'to', targetRoute);
    router.replace(targetRoute as any);
  }, [targetRoute, pathname]);

  // Always render children once hydrated
  if (!isHydrated) {
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
