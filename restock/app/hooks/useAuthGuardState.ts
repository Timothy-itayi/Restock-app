import { useEffect, useState, useMemo, useRef } from 'react';
import { router, useSegments } from 'expo-router';
import { useUnifiedAuth } from '../_contexts/UnifiedAuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager } from '../../backend/services/session-manager';

interface UseAuthGuardStateOptions {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  requireProfileSetup?: boolean;
  redirectTo?: string;
}

interface AuthGuardState {
  shouldShowLoader: boolean;
  isRedirecting: boolean;
  hasError: boolean;
  errorMessage?: string;
  loaderMessage: string;
}

export function useAuthGuardState({
  requireAuth = false,
  requireNoAuth = false,
  requireProfileSetup = false,
  redirectTo
}: UseAuthGuardStateOptions = {}): AuthGuardState {
  const { isReady, isAuthenticated, isLoading, authType } = useUnifiedAuth();
  const segments = useSegments();
  
  // Track initial app load vs. later auth transitions
  const [hasMounted, setHasMounted] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isRedirectingToSetup, setIsRedirectingToSetup] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [setupRedirectType, setSetupRedirectType] = useState<'google' | 'email' | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<
    'initializing' | 'auth-checking' | 'setup-redirect' | 'creating-dashboard' | 'ready'
  >('initializing');

  // UX context flags
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  
  // Throttling to prevent excessive effect calls
  const lastEffectCall = useRef<number>(0);
  const EFFECT_THROTTLE_MS = 100; // 100ms throttle
  
  // Memoize stable auth state to reduce effect triggers
  const authState = useMemo(() => ({
    isReady,
    isAuthenticated,
    isLoading,
    needsProfileSetup: authType?.needsProfileSetup || false,
    authTypeKey: `${authType?.type || 'none'}-${authType?.isNewSignUp || false}` // Stable identifier instead of full object
  }), [isReady, isAuthenticated, isLoading, authType?.needsProfileSetup, authType?.type, authType?.isNewSignUp]);
  
  // Memoize current route to avoid array changes
  const currentRoute = useMemo(() => segments[0] || '', [segments]);
  
  // Memoize requirements to avoid recreating object
  const requirements = useMemo(() => ({
    requireAuth,
    requireNoAuth,
    requireProfileSetup,
    redirectTo
  }), [requireAuth, requireNoAuth, requireProfileSetup, redirectTo]);

  // Initialize app state
  useEffect(() => {
    setHasMounted(true);

    const timer = setTimeout(() => {
      console.log('🔄 useAuthGuardState: Initializing phase complete, moving to auth-checking');
      setInitializing(false);
      // Only move to auth-checking if we're still in initializing phase
      if (loadingPhase === 'initializing') {
        setLoadingPhase('auth-checking');
      }
    }, 500); // Limit "initial load" time to 500ms for smooth entry

    return () => clearTimeout(timer);
  }, [loadingPhase]);

  // Determine first launch vs returning user
  useEffect(() => {
    const setupUxFlags = async () => {
      try {
        const returning = await SessionManager.isReturningUser();
        setIsFirstLaunch(!returning);
      } catch (e) {
        console.warn('useAuthGuardState: Failed to init UX flags', e);
        setIsFirstLaunch(false);
      }
    };
    setupUxFlags();
  }, []);

  // Clear redirecting to setup flag when segments change
  useEffect(() => {
    if (isRedirectingToSetup) {
      const timer = setTimeout(() => {
        setIsRedirectingToSetup(false);
        setSetupRedirectType(null);
        setLoadingPhase('ready');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [segments, isRedirectingToSetup]);

  // Reset redirecting state when segments change (navigation completes)
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [segments, isRedirecting]);

  // Main auth guard logic
  useEffect(() => {
    const now = Date.now();
    
    // Throttle effect calls to prevent excessive triggering
    if (now - lastEffectCall.current < EFFECT_THROTTLE_MS) {
      return;
    }
    lastEffectCall.current = now;
    
    console.log('🚨 useAuthGuardState: Effect triggered', {
      ...authState,
      ...requirements,
      currentRoute,
      guardId: Math.random().toString(36).substr(2, 9)
    });

    if (!authState.isReady) {
      console.log('⏳ useAuthGuardState: Auth not ready yet, waiting...');
      // Set phase to auth-checking when auth context is loading
      if (loadingPhase === 'initializing') {
        setLoadingPhase('auth-checking');
      }
      return;
    }

    // CRITICAL: Immediate profile setup check - if user needs profile setup, redirect immediately
    // This prevents any race conditions where users might access protected routes
    if (authState.isAuthenticated && authState.needsProfileSetup) {
      console.log('🚨 useAuthGuardState: CRITICAL - User needs profile setup, immediate redirect required', {
        isNewSignUp: authType?.isNewSignUp,
        userType: authType?.type,
        currentRoute,
        segments: segments.join('/')
      });
      
      // Don't redirect if already on profile setup page
      const alreadyOnSetupPage = currentRoute === 'sso-profile-setup' || 
        (segments[0] === 'auth' && segments[1] === 'traditional' && segments[2] === 'profile-setup');

      if (!alreadyOnSetupPage) {
        console.log('🚨 useAuthGuardState: EMERGENCY REDIRECT to profile setup');
        setIsRedirectingToSetup(true);
        setSetupRedirectType(authType.type === 'google' ? 'google' : 'email');
        setLoadingPhase('setup-redirect');
        
        const route = authType.type === 'google'
          ? '/sso-profile-setup'
          : '/auth/traditional/profile-setup';

        console.log(`🚨 useAuthGuardState: EMERGENCY REDIRECT to: ${route}`);
        
        try {
          router.replace(route);
          console.log('✅ useAuthGuardState: Emergency redirect initiated');
        } catch (err) {
          console.error('❌ useAuthGuardState: Emergency redirect failed:', err);
          router.replace('/welcome');
        }
        return;
      }
    }

    console.log('🔍 useAuthGuardState: Auth is ready, analyzing conditions:', {
      ...authState,
      ...requirements,
      currentRoute
    });

    // If no auth is required but user is authenticated, redirect to dashboard
    if (requirements.requireNoAuth && authState.isAuthenticated) {
      console.log('🚫 useAuthGuardState: No auth required but user is authenticated, redirecting to dashboard');
      try {
        router.replace('/(tabs)/dashboard');
      } catch (err) {
        console.error('❌ useAuthGuardState: Redirect to dashboard failed:', err);
      }
      return;
    }

    // If auth is required but user is not authenticated
    if (requirements.requireAuth && !authState.isAuthenticated) {
      console.log('🚫 useAuthGuardState: Auth required but user not authenticated, redirecting to welcome');
      try {
        router.replace('/welcome');
      } catch (err) {
        console.error('❌ useAuthGuardState: Redirect to welcome failed:', err);
      }
      return;
    }

    // If user is authenticated and needs profile setup
    if (authState.isAuthenticated && authState.needsProfileSetup) {
      console.log('🚫 useAuthGuardState: Profile setup required but not completed', {
        isNewSignUp: authType?.isNewSignUp,
        userType: authType?.type,
        currentRoute,
        segments: segments.join('/'),
        authState: {
          isReady: authState.isReady,
          isLoading: authState.isLoading,
          needsProfileSetup: authState.needsProfileSetup
        }
      });
      
      // Don't redirect if already on profile setup page
      const alreadyOnSetupPage = currentRoute === 'sso-profile-setup' || 
        (segments[0] === 'auth' && segments[1] === 'traditional' && segments[2] === 'profile-setup');

      console.log('🔍 useAuthGuardState: Setup page check:', {
        alreadyOnSetupPage,
        currentRoute,
        segments: segments.join('/'),
        isSSOSetupPage: currentRoute === 'sso-profile-setup',
        isTraditionalSetupPage: segments[0] === 'auth' && segments[1] === 'traditional' && segments[2] === 'profile-setup'
      });

      if (!alreadyOnSetupPage) {
        console.log('🚀 useAuthGuardState: Starting profile setup redirect...');
        setIsRedirectingToSetup(true);
        setSetupRedirectType(authType.type === 'google' ? 'google' : 'email');
        setLoadingPhase('setup-redirect');
        
        const route = authType.type === 'google'
          ? '/sso-profile-setup'
          : '/auth/traditional/profile-setup';

        console.log(`🚀 useAuthGuardState: Redirecting to setup: ${route}`, {
          authType: authType.type,
          isNewSignUp: authType?.isNewSignUp
        });
        
        try {
          router.replace(route);
          console.log('✅ useAuthGuardState: Redirect to setup initiated successfully');
        } catch (err) {
          console.error('❌ useAuthGuardState: Redirect failed:', err);
          router.replace('/welcome');
        }
        return;
      } else {
        console.log('✅ useAuthGuardState: User already on setup page, no redirect needed');
      }
    }

    // If user is authenticated and has completed setup, redirect to dashboard if on auth screens
    if (authState.isAuthenticated && !authState.needsProfileSetup) {
      const currentRoute = segments[0];
      const isOnAuthScreen = currentRoute === 'auth' || currentRoute === 'welcome' || currentRoute === 'sso-profile-setup';
      
      if (isOnAuthScreen && !redirectTo) {
        console.log('🚀 useAuthGuardState: User authenticated and setup complete, redirecting to dashboard');
        try {
          // Show a transitional loader while we build the main app
          setIsRedirecting(true);
          setLoadingPhase('creating-dashboard');
          router.replace('/(tabs)/dashboard');
        } catch (err) {
          console.error('❌ useAuthGuardState: Redirect to dashboard failed:', err);
        }
        return;
      }
    }

    // If redirectTo is specified and user is authenticated
    if (requirements.redirectTo && authState.isAuthenticated && !authState.needsProfileSetup) {
      console.log(`🚀 useAuthGuardState: Redirecting to specified route: ${requirements.redirectTo}`);
      try {
        router.replace(requirements.redirectTo as any);
      } catch (err) {
        console.error('❌ useAuthGuardState: Redirect to specified route failed:', err);
      }
      return;
    }

    console.log('✅ useAuthGuardState: All conditions met');
    
    // Mark as ready when all conditions are met
    if (loadingPhase !== 'ready' && !isRedirectingToSetup) {
      setLoadingPhase('ready');
    }
  }, [authState, requirements, currentRoute, loadingPhase, isRedirectingToSetup]);

  // Smart loading screen decision
  const shouldShowLoader = (
    initializing ||                  // Initial app mount
    (!authState.isReady || authState.isLoading) ||       // Auth context not ready
    isRedirectingToSetup ||          // We're mid-SSO profile redirect
    isRedirecting                    // Navigating to a destination (e.g., dashboard)
  );

  // Context-aware loading messages
  const getLoaderMessage = (): string => {
    console.log('🎯 useAuthGuardState: Loading phase:', loadingPhase, {
      initializing,
      isReady,
      isLoading,
      isRedirectingToSetup,
      setupRedirectType
    });
    
    // Prioritize explicit transition states
    if (loadingPhase === 'setup-redirect' || isRedirectingToSetup) {
      if (setupRedirectType === 'google') {
        return 'Setting up your Google account...';
      } else if (setupRedirectType === 'email') {
        return 'Setting up your email account...';
      }
      return 'Setting up your account...';
    }
    
    if (loadingPhase === 'creating-dashboard' || (isRedirecting && authState.isAuthenticated && !authState.needsProfileSetup)) {
      return 'Creating your dashboard...';
    }

    if (loadingPhase === 'initializing') {
      if (isFirstLaunch === true) {
        return 'Welcome to Restock';
      }
      return 'Starting up Restock...';
    }

    // Only show during explicit auth-checking; do not tie to isLoading
    if (loadingPhase === 'auth-checking') {
      return 'Checking your account...';
    }

    return 'Loading...';
  };

  // Error handling
  const hasError = !authType;
  const errorMessage = hasError 
    ? 'There was an issue with the authentication system. Please restart the app and try again.'
    : undefined;

  return {
    shouldShowLoader,
    isRedirecting,
    hasError,
    errorMessage,
    loaderMessage: getLoaderMessage()
  };
} 