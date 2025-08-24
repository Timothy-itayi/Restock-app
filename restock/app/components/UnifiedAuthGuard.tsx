// app/components/UnifiedAuthGuard.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';

interface UnifiedAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  requireProfileSetup?: boolean;
  redirectTo?: string;
}

export const UnifiedAuthGuard: React.FC<UnifiedAuthGuardProps> = ({
  children,
  requireAuth,
  requireNoAuth,
  requireProfileSetup,
  redirectTo,
}) => {
  const auth = useUnifiedAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // 🔒 CRITICAL: Never interfere with auth-related routes
  const isAuthRoute = pathname?.includes('/auth') || pathname?.includes('/welcome') || pathname?.includes('/sso-profile-setup');
  if (isAuthRoute && !requireAuth) {
    console.log('🛡️ UnifiedAuthGuard: Skipping guard for auth route:', pathname);
    return <>{children}</>;
  }

  // Show loader if auth is not ready, loading, or OAuth is in progress
  if (!auth.isReady || auth.isLoading || auth.isOAuthInProgress) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-2 text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Determine redirect conditions
  const shouldRedirect = (requireAuth && !auth.isAuthenticated) ||
                         (requireNoAuth && auth.isAuthenticated) ||
                         (requireProfileSetup && auth.isAuthenticated && !auth.isProfileSetupComplete);

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (shouldRedirect && !isRedirecting) {
      console.log('🛡️ UnifiedAuthGuard: Redirect required', {
        requireAuth,
        requireNoAuth, 
        requireProfileSetup,
        isAuthenticated: auth.isAuthenticated,
        isProfileSetupComplete: auth.isProfileSetupComplete,
        userId: auth.userId,
        customRedirectTo: redirectTo
      });

      // Determine redirect destination
      let destination = redirectTo;
      if (!destination) {
        if (requireAuth && !auth.isAuthenticated) {
          destination = '/welcome';  // Unauthenticated users go to welcome
          console.log('🛡️ UnifiedAuthGuard: Redirecting unauthenticated user to welcome');
        } else if (requireProfileSetup && !auth.isProfileSetupComplete) {
          destination = '/sso-profile-setup';  // Users without profiles go to setup
          console.log('🛡️ UnifiedAuthGuard: Redirecting user without profile to setup');
        }
      }

      if (destination) {
        setIsRedirecting(true);
        console.log('🛡️ UnifiedAuthGuard: Executing redirect to:', destination);
        router.replace(destination as any);
      }
    }
  }, [shouldRedirect, isRedirecting, auth.isAuthenticated, auth.isProfileSetupComplete, auth.userId, requireAuth, requireNoAuth, requireProfileSetup, redirectTo, router]);

  // Show redirecting screen if redirect is in progress
  if (shouldRedirect || isRedirecting) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="small" color="#666" />
        <Text>Redirecting...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

UnifiedAuthGuard.displayName = 'UnifiedAuthGuard';
