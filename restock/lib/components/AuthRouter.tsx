// AuthRouter.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useUnifiedAuth } from '../../lib/auth/UnifiedAuthProvider';
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

// Helper to check if we're inside a tab area (including nested routes)
function isInsideTabArea(path: string | null | undefined): boolean {
  if (!path) return false;
  // Check if we're in any tab area, including nested routes like /add-product
  return path.startsWith('/(tabs)/') || 
         path.includes('/restock-sessions/') ||
         path.includes('/dashboard/') ||
         path.includes('/emails/') ||
         path.includes('/profile/');
}

export const AuthRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[AuthRouter] 🚀 Component rendering started');
  
  // Defensive pathname handling
  let rawPathname: string | null = '/';
  try {
    // Check if router is ready before calling usePathname
    rawPathname = usePathname();
    console.log('[AuthRouter] 📍 Got pathname:', rawPathname);
  } catch (error) {
    console.error('[AuthRouter] ❌ Error getting pathname (router not ready):', error);
    // Router not ready, default to root
    rawPathname = '/';
  }
  
  const pathname = normalizePath(rawPathname); // ✅ always work with normalized paths
  console.log('[AuthRouter] 📍 Normalized pathname:', pathname);

  let authState;
  try {
    authState = useUnifiedAuth();
    console.log('[AuthRouter] 🔑 Got auth state from UnifiedAuth:', authState);
  } catch (error) {
    console.error('[AuthRouter] ❌ Error getting auth state:', error);
    // Return loading screen if auth hook fails
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6B7F6B" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
          Auth system error. Please restart the app.
        </Text>
      </View>
    );
  }
  
  const {
    isReady,
    isAuthenticated,
    userId,
    userName,
    storeName,
    hasValidProfile,
    isProfileLoading,
  } = authState;

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

  // Hydration = auth system ready + profile fetch completed (regardless of whether profile exists)
  // For authenticated users: we need userId and profile check to be done (!isProfileLoading)
  // For unauthenticated users: just need auth system to be ready
  const isHydrated =
    isReady && (!isAuthenticated || (userId && !isProfileLoading));

  console.log('[AuthRouter] Hydration check:', {
    isHydrated,
    isReady,
    isAuthenticated,
    userId: !!userId,
    hasValidProfile,
    isProfileLoading,
    rawPathname,
    pathname,
    explanation: isHydrated 
      ? '✅ Hydrated - ready to route'
      : '⏳ Not hydrated - waiting for auth/profile data'
  });

  // Determine target route
  const determineTargetRoute = useCallback((): string | null => {
    console.log('[AuthRouter] determineTargetRoute called:', {
      isHydrated,
      isAuthenticated,
      userId: !!userId,
      hasValidProfile,
      userName: !!userName,
      storeName: !!storeName,
      pathname
    });
    
    if (!isHydrated) {
      console.log('[AuthRouter] Not hydrated yet, returning null');
      return null;
    }

    if (isAuthenticated && userId) {
      if (hasValidProfile && userName && storeName) {
        // ✅ Free roam if already inside tab areas (including nested routes)
        if (isInsideTabArea(pathname)) return null;
        console.log('[AuthRouter] User authenticated with valid profile, redirecting to main tab area');

        // ✅ Fallback to last tab or dashboard
        return lastVisitedTab && ALLOWED_TABS.includes(lastVisitedTab)
          ? lastVisitedTab
          : '/(tabs)/dashboard';
      }
      
      // User needs profile setup - if already there, stay put
      if (pathname === '/sso-profile-setup') {
        console.log('[AuthRouter] User already on profile setup page, staying put');
        return null;
      }
      
      console.log('[AuthRouter] User authenticated but no profile, redirecting to profile setup');
      return '/sso-profile-setup';
    }

    if (pathname?.startsWith('/welcome') || pathname?.includes('/auth')) {
      console.log('[AuthRouter] Already on welcome/auth route, staying put:', pathname);
      return pathname;
    }
    
    console.log('[AuthRouter] Not authenticated and not on welcome/auth, redirecting to /welcome');
    return '/welcome';
  }, [isHydrated, isAuthenticated, userId, hasValidProfile, userName, storeName, lastVisitedTab, pathname]);

  const targetRoute = determineTargetRoute();

  console.log('[AuthRouter] Target route determined:', {
    targetRoute,
    currentPathname: pathname,
    willRedirect: targetRoute && pathname !== targetRoute
  });

  // Redirect when route is wrong
  useEffect(() => {
    if (!targetRoute) {
      console.log('[AuthRouter] No target route, skipping redirect');
      return;
    }
    if (pathname === targetRoute) {
      console.log('[AuthRouter] Already at target route, no redirect needed');
      return;
    }

    // Ensure router is ready before navigation
    try {
      console.log('[AuthRouter] Redirecting from', pathname, 'to', targetRoute);
      router.replace(targetRoute as any);
    } catch (error) {
      console.error('[AuthRouter] ❌ Navigation error (router not ready):', error);
      // Router not ready, wait and retry
      setTimeout(() => {
        try {
          router.replace(targetRoute as any);
        } catch (retryError) {
          console.error('[AuthRouter] ❌ Navigation retry failed:', retryError);
        }
      }, 100);
    }
  }, [targetRoute, pathname]);

  // Always render children once hydrated
  if (!isHydrated) {
    console.log('[AuthRouter] Not hydrated, showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6B7F6B" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
          Loading your account...
        </Text>
      </View>
    );
  }

  console.log('[AuthRouter] Hydrated, rendering children');
  return <>{children}</>;
};
