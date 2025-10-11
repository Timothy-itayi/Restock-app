// app/hooks/useAuthGuardState.ts
import { useEffect, useState, useMemo } from 'react';
import { useSegments } from 'expo-router';
import { useAuthState, useAuthType } from '../auth/store';

import { SessionManager } from '../../backend/_services/session-manager';

interface UseAuthGuardStateOptions {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  requireProfileSetup?: boolean;
  redirectTo?: string;
}

export interface AuthGuardState {
  shouldShowLoader: boolean;
  isRedirecting: boolean;
  hasError: boolean;
  errorMessage?: string;
  loaderMessage?: string;
  authType?: any;
}

export function useAuthGuardState({
  requireAuth = false,
  requireNoAuth = false,
  requireProfileSetup = false,
  redirectTo
}: UseAuthGuardStateOptions = {}): AuthGuardState {
  const authState = useAuthState();
  const authType = useAuthType();
  const segments = useSegments();

  // Async returning user flag
  const [isReturningUser, setIsReturningUser] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    SessionManager.isReturningUser()
      .then(r => mounted && setIsReturningUser(r))
      .catch(() => mounted && setIsReturningUser(false));
    return () => { mounted = false; };
  }, []);

  // Internal flags
  const [initializing, setInitializing] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Watch store readiness
  useEffect(() => {
    if (authState.isReady && initializing) {
      setInitializing(false);
    }
  }, [authState.isReady, initializing]);

  // Redirect cleanup timer
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => setIsRedirecting(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isRedirecting]);

  const currentRoute = segments[0] || '';
  const shouldBlockDashboard =
    authState.isAuthenticated &&
    !authState.isProfileSetupComplete &&
    currentRoute === '(tabs)';

  // Memoized stable guard state (depends only on primitives)
  return useMemo<AuthGuardState>(() => {
    if (isReturningUser === null || initializing) {
      return {
        shouldShowLoader: true,
        isRedirecting: false,
        hasError: false,
        loaderMessage: isReturningUser === null ? 'Loading...' : 'Starting up Restock...',
        authType
      };
    }

    if (shouldBlockDashboard) {
      return {
        shouldShowLoader: true,
        isRedirecting: false,
        hasError: false,
        loaderMessage: 'Setting up your account...',
        authType
      };
    }

    const shouldShowLoader = initializing || authState.isLoading || isRedirecting;

    return {
      shouldShowLoader,
      isRedirecting,
      hasError: !authType,
      loaderMessage: shouldShowLoader ? 'Loading...' : undefined,
      authType
    };
  }, [
    isReturningUser,
    initializing,
    isRedirecting,
    authState.isLoading,
    authState.isAuthenticated,
    authState.isProfileSetupComplete,
    authType,
    shouldBlockDashboard
  ]);
}
