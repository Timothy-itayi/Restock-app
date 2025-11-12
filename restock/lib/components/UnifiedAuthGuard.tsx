import React from 'react';
import { traceRender } from '../utils/renderTrace';
import { View, ActivityIndicator, Text } from 'react-native';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';
import { usePathname } from 'expo-router';

interface UnifiedAuthGuardProps {
  children: React.ReactNode;
  /**
   * If true, only allows authenticated users (default for tabs)
   * If false, allows anyone (for public routes)
   */
  requireAuth?: boolean;
  /**
   * If true, only allows unauthenticated users (for auth/welcome routes)
   */
  requireNoAuth?: boolean;
}

export const UnifiedAuthGuard: React.FC<UnifiedAuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  requireNoAuth = false 
}) => {
  traceRender('UnifiedAuthGuard', {});
  const { isAuthenticated, userId, hasValidProfile, isLoading, isProfileLoading, isReady } = useUnifiedAuth();
  const pathname = usePathname();

  console.log('[UnifiedAuthGuard] Evaluating guard:', {
    pathname,
    requireAuth,
    requireNoAuth,
    isAuthenticated,
    hasValidProfile,
    isLoading,
    isProfileLoading,
    isReady
  });

  // Don't block anything until auth system is ready
  if (!isReady || isLoading) {
    console.log('[UnifiedAuthGuard] Auth not ready yet, rendering children');
    return <>{children}</>;
  }

  // Route-specific logic: NEVER block auth, welcome, or profile-setup routes
  const isAuthRoute = pathname?.includes('/auth') || pathname?.includes('/welcome') || pathname?.includes('profile-setup');
  if (isAuthRoute) {
    console.log('[UnifiedAuthGuard] On auth/welcome/setup route, always allowing');
    return <>{children}</>;
  }

  // If requireNoAuth is true (e.g., welcome screen), block authenticated users
  if (requireNoAuth) {
    if (isAuthenticated && userId) {
      console.log('[UnifiedAuthGuard] requireNoAuth but user is authenticated, showing loader');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#6B7F6B" />
          <Text style={{ marginTop: 8, color: '#4B5563' }}>Redirecting...</Text>
        </View>
      );
    }
    // Unauthenticated, allow through
    return <>{children}</>;
  }

  // If requireAuth is true (default for tabs), require authenticated user with valid profile
  if (requireAuth) {
    // Still loading profile data
    if (isProfileLoading) {
      console.log('[UnifiedAuthGuard] Profile loading, showing loader');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#6B7F6B" />
          <Text style={{ marginTop: 8, color: '#4B5563' }}>Loading your profile...</Text>
        </View>
      );
    }

    // Not authenticated or no userId
    if (!isAuthenticated || !userId) {
      console.log('[UnifiedAuthGuard] Not authenticated, showing loader (AuthRouter will redirect)');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#6B7F6B" />
          <Text style={{ marginTop: 8, color: '#4B5563' }}>Checking authentication...</Text>
        </View>
      );
    }

    // Authenticated but no valid profile yet (AuthRouter will redirect to setup)
    if (!hasValidProfile) {
      console.log('[UnifiedAuthGuard] No valid profile, showing loader (AuthRouter will redirect to setup)');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#6B7F6B" />
          <Text style={{ marginTop: 8, color: '#4B5563' }}>Setting up your account...</Text>
        </View>
      );
    }
  }

  // All checks passed, render children
  console.log('[UnifiedAuthGuard] All checks passed, rendering children');
  return <>{children}</>;
};

UnifiedAuthGuard.displayName = 'UnifiedAuthGuard';
