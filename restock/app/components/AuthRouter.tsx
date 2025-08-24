// app/components/AuthRouter.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';

interface AuthRouterProps {
  children: React.ReactNode;
}

/**
 * AuthRouter - Central routing logic based on authentication state
 *
 * Responsibilities:
 * - Authenticated + Valid Profile → Dashboard
 * - Authenticated + Invalid Profile → Profile Setup
 * - Unauthenticated → Welcome (except allow /auth/* routes)
 * - Loading → Loading screen
 */
export const AuthRouter: React.FC<AuthRouterProps> = ({ children }) => {
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
  const [currentRoute, setCurrentRoute] = useState<string | null>(null);

  // Decide which route the user should end up on
  const determineTargetRoute = (): string | null => {
    // Still waiting for auth to be ready
    if (!isReady || isLoading) {
      return null;
    }

    // Authenticated branch
    if (isAuthenticated && userId) {
      if (isProfileLoading) {
        return null;
      }

      if (hasValidProfile && userName && storeName && userName !== 'there') {
        return '/(tabs)/dashboard';
      } else {
        return '/sso-profile-setup';
      }
    }

    // Unauthenticated branch
    if (!isAuthenticated) {
      if (pathname.startsWith('/auth/')) {
        return pathname; // Allow /auth/* pages like sign-in and sign-up
      }
      if (pathname === '/welcome') {
        return pathname; // Already on welcome
      }
      return '/welcome'; // Default fallback
    }

    return null;
  };

  useEffect(() => {
    const targetRoute = determineTargetRoute();

    console.log('🔀 AuthRouter: Determining route', {
      currentPathname: pathname,
      targetRoute,
      authState: {
        isReady,
        isLoading,
        isAuthenticated,
        userId: !!userId,
        hasValidProfile,
        userName,
        storeName,
        isProfileLoading
      }
    });

    if (targetRoute) {
      setCurrentRoute(targetRoute);

      if (pathname !== targetRoute && hasInitialized) {
        console.log('🚀 AuthRouter: Redirecting from', pathname, 'to', targetRoute);
        router.replace(targetRoute as any);
      } else if (!hasInitialized) {
        console.log('🚀 AuthRouter: Initial navigation to', targetRoute);
        setHasInitialized(true);
        if (pathname !== targetRoute) {
          router.replace(targetRoute as any);
        }
      } else {
        console.log('✅ AuthRouter: Already on correct route:', pathname);
      }
    }
  }, [
    pathname,
    isReady,
    isLoading,
    isAuthenticated,
    userId,
    hasValidProfile,
    userName,
    storeName,
    isProfileLoading,
    hasInitialized
  ]);

  // Loading screen
  const targetRoute = determineTargetRoute();
  if (!targetRoute) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}
      >
        <ActivityIndicator size="large" color="#6B7F6B" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: '#666666',
            textAlign: 'center'
          }}
        >
          Loading your account...
        </Text>
      </View>
    );
  }

  // Render actual screen
  return <>{children}</>;
};
