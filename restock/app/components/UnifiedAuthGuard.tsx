import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useUnifiedAuth } from '../_contexts/UnifiedAuthProvider';
import { BaseLoadingScreen } from './loading';

interface UnifiedAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfileSetup?: boolean;
  redirectTo?: string;
}

export default function UnifiedAuthGuard({ 
  children, 
  requireAuth = false, 
  requireProfileSetup = false,
  redirectTo 
}: UnifiedAuthGuardProps) {
  const { isReady, isAuthenticated, isLoading, authType } = useUnifiedAuth();

  useEffect(() => {
    if (!isReady) {
      console.log('⏳ UnifiedAuthGuard: Auth not ready yet');
      return;
    }

    console.log('🔍 UnifiedAuthGuard: Auth is ready, checking conditions:', {
      isAuthenticated,
      authType,
      requireAuth,
      requireProfileSetup
    });

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('🚫 UnifiedAuthGuard: Auth required but user not authenticated, redirecting to welcome');
      router.replace('/welcome');
      return;
    }

    // If user is authenticated but profile setup is required
    if (isAuthenticated && requireProfileSetup && authType.needsProfileSetup) {
      console.log('🚫 UnifiedAuthGuard: Profile setup required but not completed');
      
      // Handle new SSO sign-up
      if (authType.isNewSignUp && authType.type === 'google') {
        console.log('🚀 UnifiedAuthGuard: New Google SSO sign-up, redirecting to SSO profile setup');
        router.replace('/sso-profile-setup');
        return;
      }
      
      // Handle returning users or email users
      if (authType.type === 'google') {
        console.log('🚀 UnifiedAuthGuard: Google user needs profile setup, redirecting to SSO profile setup');
        router.replace('/sso-profile-setup');
      } else {
        console.log('🚀 UnifiedAuthGuard: Email user needs profile setup, redirecting to traditional profile setup');
        router.replace('/auth/traditional/profile-setup');
      }
      return;
    }

    // If user is authenticated and has completed setup, redirect to dashboard if on auth screens
    if (isAuthenticated && !authType.needsProfileSetup) {
      const currentRoute = router.getCurrentOptions()?.path;
      const isOnAuthScreen = currentRoute?.includes('auth') || currentRoute?.includes('welcome') || currentRoute?.includes('sso-profile-setup');
      
      if (isOnAuthScreen && !redirectTo) {
        console.log('🚀 UnifiedAuthGuard: User authenticated and setup complete, redirecting to dashboard');
        router.replace('/(tabs)/dashboard');
        return;
      }
    }

    // If redirectTo is specified and user is authenticated
    if (redirectTo && isAuthenticated && !authType.needsProfileSetup) {
      console.log(`🚀 UnifiedAuthGuard: Redirecting to specified route: ${redirectTo}`);
      router.replace(redirectTo);
      return;
    }

    console.log('✅ UnifiedAuthGuard: All conditions met, rendering children');
  }, [isReady, isAuthenticated, authType, requireAuth, requireProfileSetup, redirectTo]);

  // Show loading screen while auth is not ready
  if (!isReady || isLoading) {
    console.log('⏳ UnifiedAuthGuard: Showing loading screen');
    return <BaseLoadingScreen />;
  }

  // Show loading screen for authenticated users who need profile setup
  if (isAuthenticated && authType.needsProfileSetup) {
    console.log('⏳ UnifiedAuthGuard: User needs profile setup, showing loading while redirecting');
    return <BaseLoadingScreen />;
  }

  // Show loading screen for unauthenticated users when auth is required
  if (requireAuth && !isAuthenticated) {
    console.log('⏳ UnifiedAuthGuard: Auth required but not authenticated, showing loading while redirecting');
    return <BaseLoadingScreen />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
} 