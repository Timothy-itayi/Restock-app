import { useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuthState, useAuthType } from '../../../lib/auth/store';
import { guardLogger } from '../../../lib/logging/_logger';

export const useAuthGuard = () => {
  const router = useRouter();
  
  // 🔒 CRITICAL: Use selective subscriptions to prevent unnecessary re-renders
  const {
    isReady,
    isAuthenticated,
    isProfileSetupComplete,
    isLoading,
    userId
  } = useAuthState();
  
  const authType = useAuthType();
  
  // 🔒 CRITICAL: Memoize computed values to prevent unnecessary recalculations
  const computedValues = useMemo(() => ({
    canAccessDashboard: isAuthenticated && isProfileSetupComplete && !authType.isBlocked && isReady,
    needsProfileSetup: isAuthenticated && !isProfileSetupComplete && !authType.isBlocked,
    isBlocked: authType.isBlocked
  }), [
    isAuthenticated,
    isProfileSetupComplete,
    isReady,
    authType.isBlocked
  ]);
  
  const redirectToProfileSetup = useCallback((authType: 'google' | 'email') => {
    const route = authType === 'google' ? '/sso-profile-setup' : '/auth/traditional/profile-setup';
    guardLogger.log('Redirecting to profile setup:', route);
    
    try {
      router.replace(route as any);
    } catch (error) {
      guardLogger.error('Failed to redirect to profile setup:', error);
    }
  }, [router]);
  
  const redirectToAuth = useCallback(() => {
    guardLogger.log('Redirecting to auth screen');
    
    try {
      router.replace('/auth' as any);
    } catch (error) {
      guardLogger.error('Failed to redirect to auth:', error);
    }
  }, [router]);
  
  const redirectToDashboard = useCallback(() => {
    guardLogger.log('Redirecting to dashboard');
    
    try {
      router.replace('/(tabs)/dashboard' as any);
    } catch (error) {
      guardLogger.error('Failed to redirect to dashboard:', error);
    }
  }, [router]);
  
  // Main guard effect
  useEffect(() => {
    if (!isReady) {
      if (process.env.NODE_ENV === 'development') {
        guardLogger.log('Auth not ready yet, waiting...');
      }
      return;
    }
    
    if (isLoading) {
      if (process.env.NODE_ENV === 'development') {
        guardLogger.log('Still loading, waiting...');
      }
      return;
    }
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      guardLogger.log('Auth guard evaluation:', {
        isAuthenticated,
        isProfileSetupComplete,
        canAccessDashboard: computedValues.canAccessDashboard,
        needsProfileSetup: computedValues.needsProfileSetup,
        isBlocked: computedValues.isBlocked
      });
    }
    
    // User is blocked/unauthorized
    if (computedValues.isBlocked) {
      guardLogger.warn('User is blocked, redirecting to auth');
      redirectToAuth();
      return;
    }
    
    // User is not authenticated
    if (!isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        guardLogger.log('User not authenticated, redirecting to auth');
      }
      redirectToAuth();
      return;
    }
    
    // User needs profile setup
    if (computedValues.needsProfileSetup) {
      if (process.env.NODE_ENV === 'development') {
        guardLogger.log('User needs profile setup, redirecting');
      }
      redirectToProfileSetup(authType.type || 'email');
      return;
    }
    
    // User can access dashboard
    if (computedValues.canAccessDashboard) {
      if (process.env.NODE_ENV === 'development') {
        guardLogger.log('User can access dashboard, redirecting');
      }
      redirectToDashboard();
      return;
    }
    
    // Fallback: something went wrong
    guardLogger.warn('Unexpected auth state, redirecting to auth');
    redirectToAuth();
    
  }, [
    isReady,
    isLoading,
    isAuthenticated,
    isProfileSetupComplete,
    authType.type,
    computedValues,
    redirectToProfileSetup,
    redirectToAuth,
    redirectToDashboard
  ]);
  
  // 🔒 CRITICAL: Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    isReady,
    isLoading,
    isAuthenticated,
    isProfileSetupComplete,
    canAccessDashboard: computedValues.canAccessDashboard,
    needsProfileSetup: computedValues.needsProfileSetup,
    isBlocked: computedValues.isBlocked,
    authType
  }), [
    isReady,
    isLoading,
    isAuthenticated,
    isProfileSetupComplete,
    computedValues,
    authType
  ]);
};
