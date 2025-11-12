// AuthRouter.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, usePathname } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, DeviceEventEmitter, Text, View } from 'react-native';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';
import { traceRender } from '../utils/renderTrace';

const PERSIST_KEY = 'lastAuthRoute';
const LAST_KNOWN_PROFILE_KEY = 'auth:lastKnownProfile';

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
  traceRender('AuthRouter', {});
  console.warn('[RESTOCK_ROUTE] AuthRouter render started');
  
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
  console.warn('[RESTOCK_ROUTE] Current pathname:', pathname);

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
  const { authType } = (authState as any);

  const [lastVisitedTab, setLastVisitedTab] = useState<string | null>(null);
  const [hydrationTimeoutReached, setHydrationTimeoutReached] = useState(false);
  // Lock routing to prevent rapid redirects (e.g., tabs ↔ setup) during initial hydration
  const routeLockUntilRef = useRef<number>(0);
  const lastReplacedRouteRef = useRef<string | null>(null);
  // const [fastPathProfile, setFastPathProfile] = useState<{ userId: string; userName?: string; storeName?: string } | null>(null);
  const appReadyEmittedRef = useRef(false);

  // Load last visited tab once
  useEffect(() => {
    AsyncStorage.getItem(PERSIST_KEY).then(route => {
      if (route) setLastVisitedTab(normalizePath(route));
    });
    // Try to read a last-known-good profile snapshot for fast-path routing on reloads
    AsyncStorage.getItem(LAST_KNOWN_PROFILE_KEY)
      .then(json => {
        if (!json) return;
        try {
          const parsed = JSON.parse(json);
        // if (parsed?.userId) {
        //   setFastPathProfile({ userId: parsed.userId, userName: parsed.userName, storeName: parsed.storeName });
        // }
        } catch {}
      })
      .catch(() => {});
  }, []);

  // When the app returns to foreground, refresh snapshot and add a brief stability lock
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        routeLockUntilRef.current = Date.now() + 2000;
        AsyncStorage.getItem(LAST_KNOWN_PROFILE_KEY)
          .then(json => {
            if (!json) return;
            try {
              const parsed = JSON.parse(json);
              // if (parsed?.userId) {
              //   setFastPathProfile({ userId: parsed.userId, userName: parsed.userName, storeName: parsed.storeName });
              // }
            } catch {}
          })
          .catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  // Signal root once on first mount that UI is rendering (prevents black gap)
  useEffect(() => {
    if (!appReadyEmittedRef.current) {
      DeviceEventEmitter.emit('app:ready');
      appReadyEmittedRef.current = true;
    }
  }, []);

  // Persist tab changes
  useEffect(() => {
    if (pathname?.startsWith('/(tabs)/')) {
      AsyncStorage.setItem(PERSIST_KEY, pathname);
    }
  }, [pathname]);

  // Fail-safe: after a short timeout, allow UI to render even if profile is still loading
  useEffect(() => {
    // Only start timeout once auth system is ready
    if (!isReady) return;
    let timer: any;
    if (!hydrationTimeoutReached) {
      timer = setTimeout(() => {
        setHydrationTimeoutReached(true);
        console.log('[AuthRouter] ⏱️ Hydration timeout reached – allowing UI render');
        // Lock routing to tabs for a short window to avoid flicker into setup while profile settles
        routeLockUntilRef.current = Date.now() + 2500; // 2.5s stability window
      }, 1500);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [isReady, hydrationTimeoutReached]);

  // Hydration = auth system ready + profile fetch completed (regardless of whether profile exists)
  // For authenticated users: we need userId and profile check to be done (!isProfileLoading)
  // For unauthenticated users: just need auth system to be ready
  const isHydrated =
    isReady && (!isAuthenticated || (userId && !isProfileLoading));
  const isHydratedOrTimedOut =
    isReady && (!isAuthenticated || !!userId) && (hydrationTimeoutReached || !isProfileLoading);

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

  // Compute stabilization overlay state EARLY to keep hook order stable across renders
  const overlayRouteLockActive = Date.now() < routeLockUntilRef.current;
  const isExistingUserForOverlay = !!isAuthenticated && !!userId;
  const overlayName = (userName && userName.trim().length > 0 ? userName : undefined) || undefined;
  const shouldShowStabilizationOverlay =
    isExistingUserForOverlay && overlayRouteLockActive && (isProfileLoading || !hasValidProfile);

  // Force-tabs logic: during stability window or when we have a snapshot for an existing user,
  // don't render children (which could include welcome/setup). Instead, immediately navigate to tabs
  // and render a lightweight loader to avoid any flash.
  const desiredTabsRoute =
    lastVisitedTab && ALLOWED_TABS.includes(lastVisitedTab)
      ? lastVisitedTab
      : '/(tabs)/dashboard';
  const shouldForceTabs = isExistingUserForOverlay && overlayRouteLockActive;

  // Debug: log overlay lifecycle transitions (must always mount to preserve hook order)
  const lastOverlayStateRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (lastOverlayStateRef.current !== shouldShowStabilizationOverlay) {
      console.log('[AuthRouter][Overlay]', {
        showing: shouldShowStabilizationOverlay,
        isExistingUser: isExistingUserForOverlay,
        overlayRouteLockActive,
        hasSnapshot: false,
        isProfileLoading,
        hasValidProfile,
        name: overlayName,
        pathname,
      });
      lastOverlayStateRef.current = shouldShowStabilizationOverlay;
    }
  }, [
    shouldShowStabilizationOverlay,
    isExistingUserForOverlay,
    overlayRouteLockActive,
    isProfileLoading,
    hasValidProfile,
    overlayName,
    pathname,
  ]);

  // Always log overlay state each render to trace when it would display
  console.log('[AuthRouter][OverlayState]', {
    lock: Date.now() < routeLockUntilRef.current,
    hasSnapshot: false,
    isProfileLoading,
    hasValidProfile,
    isExistingUser: (!!isAuthenticated && !!userId),
    shouldShow: shouldShowStabilizationOverlay,
    pathname,
  });

  // Determine target route
  const determineTargetRoute = useCallback((): string | null => {
    console.warn('[RESTOCK_ROUTE] determineTargetRoute', {
      pathname,
      isHydrated,
      isHydratedOrTimedOut,
      isAuthenticated,
      userId: !!userId,
      hasValidProfile,
      isProfileLoading,
    fastPathProfileUser: null,
      lastVisitedTab
    });
    const routeLockActive = Date.now() < routeLockUntilRef.current;
    
    if (!isHydrated && !isHydratedOrTimedOut) {
      return null;
    }

    const hasAuthenticatedUser = isAuthenticated && !!userId;

    if (hasAuthenticatedUser) {
      if (hasValidProfile && userName && storeName) {
        // ✅ Free roam if already inside tab areas (including nested routes)
        if (isInsideTabArea(pathname)) return null;

        // ✅ Fallback to last tab or dashboard
        return lastVisitedTab && ALLOWED_TABS.includes(lastVisitedTab)
          ? lastVisitedTab
          : '/(tabs)/dashboard';
      }

      // Profile not confirmed valid yet
      // Only force redirect to setup if profile loading is finished and invalid,
      // and we're not in the stability window after hydration timeout
      // Do NOT redirect to setup if we have a snapshot (existing user) – wait for profile fetch result
    if (!routeLockActive && !isProfileLoading && !hasValidProfile) {
        const setupRoute = authType === 'google' ? '/sso-profile-setup' : '/auth/traditional/profile-setup';
        if (pathname === setupRoute) {
          return null;
        }
        return setupRoute;
      }

      // Stronger fast-path: if we have a snapshot or are within the stability window, prefer tabs over setup
    if (isHydratedOrTimedOut || routeLockActive) {
        if (isInsideTabArea(pathname)) return null;
        return lastVisitedTab && ALLOWED_TABS.includes(lastVisitedTab)
          ? lastVisitedTab
          : '/(tabs)/dashboard';
      }

      // Otherwise, keep waiting
      return null;
    }

    // Unauthenticated branch
    // Fast-path disabled while unauthenticated

  // Handle native OAuth callback and unknown roots
  if (pathname === '/' || pathname === '/oauth-native-callback') {
    return '/welcome';
    }

    if (pathname?.startsWith('/welcome') || pathname?.includes('/auth')) {
      return null;
    }
    
    
    return '/welcome';
  }, [isHydrated, isAuthenticated, userId, hasValidProfile, userName, storeName, lastVisitedTab, pathname, authType, isProfileLoading, isHydratedOrTimedOut]);

  const targetRoute = determineTargetRoute();

  console.warn('[RESTOCK_ROUTE] Decision', {
    targetRoute,
    currentPathname: pathname,
    willRedirect: targetRoute && pathname !== targetRoute,
    isAuthenticated,
    userId: !!userId
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
    if (lastReplacedRouteRef.current === targetRoute) {
      console.log('[AuthRouter] Skipping duplicate replace to', targetRoute);
      return;
    }

    // Ensure router is ready before navigation
    try {
      console.log('[AuthRouter] Redirecting from', pathname, 'to', targetRoute);
      lastReplacedRouteRef.current = targetRoute;
      router.replace(targetRoute as any);
    } catch (error) {
      console.error('[AuthRouter] ❌ Navigation error (router not ready):', error);
      // Router not ready, wait and retry
      setTimeout(() => {
        try {
          lastReplacedRouteRef.current = targetRoute;
          router.replace(targetRoute as any);
        } catch (retryError) {
          console.error('[AuthRouter] ❌ Navigation retry failed:', retryError);
        }
      }, 100);
    }
  }, [targetRoute, pathname]);

  // Avoid showing any loading fallback in production; keep current route rendering
  if (!isHydrated) {
    return <>{children}</>;
  }

  console.log('[AuthRouter] Hydrated, rendering children');

  return (
    <>
      {children}
    </>
  );
};
